from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone
from math import exp, factorial
from typing import Any

import numpy as np

from betvision_ai.modeling import ModelBundle, PLAYER_FEATURE_COLUMNS
from betvision_ai.schemas import ExpectedValues, MatchInput, PredictionOutput


COUNT_LINES = {
    "corners": [8.5, 9.5, 10.5],
    "cards": [3.5, 4.5, 5.5],
    "fouls": [20.5, 24.5, 28.5],
    "shots": [19.5, 23.5, 27.5],
    "shots_on_target": [6.5, 8.5, 10.5],
}


def poisson_at_least_one(rate: float) -> float:
    return 1 - exp(-max(0.0, rate))


def poisson_over(rate: float, line: float) -> float:
    threshold = int(np.floor(line))
    cumulative = sum(exp(-rate) * rate**value / factorial(value) for value in range(threshold + 1))
    return max(0.0, min(1.0, 1 - cumulative))


def _pct(value: np.ndarray) -> float:
    return round(float(np.mean(value) * 100), 2)


def _markets(values: np.ndarray, lines: list[float]) -> dict[str, dict[str, float]]:
    output: dict[str, dict[str, float]] = {}
    for line in lines:
        over = _pct(values > line)
        output[str(line)] = {"over": over, "under": round(100 - over, 2)}
    return output


def _risk_level(probability: float, confidence: str) -> str:
    if confidence == "baixa":
        return "moderado" if probability >= 75 else "alto"
    if probability >= 78:
        return "baixo"
    if probability >= 62:
        return "moderado"
    return "alto"


def _market_candidate(
    market: str,
    selection: str,
    probability: float,
    *,
    priority: float = 0.0,
) -> dict[str, Any]:
    probability = round(float(probability), 2)
    return {
        "market": market,
        "selection": selection,
        "probability": probability,
        "score": round(probability + priority, 2),
    }


def build_user_analysis(
    match: MatchInput,
    result: dict[str, float],
    goals: dict[str, dict[str, float]],
    btts_yes: float,
    handicaps: dict[str, dict[str, float]],
    confidence: str,
    coverage: dict[str, Any],
) -> dict[str, Any]:
    teams = {"home": match.home.name, "away": match.away.name}
    favorite_side = max(("home", "draw", "away"), key=lambda key: result[key])
    favorite_label = (
        teams["home"]
        if favorite_side == "home"
        else teams["away"]
        if favorite_side == "away"
        else "Empate"
    )
    favorite_probability = round(result[favorite_side], 2)

    candidates = [
        _market_candidate("Resultado", f"Vitória {teams['home']}", result["home"], priority=2),
        _market_candidate("Resultado", "Empate", result["draw"]),
        _market_candidate("Resultado", f"Vitória {teams['away']}", result["away"], priority=2),
        _market_candidate(
            "Dupla chance",
            f"{teams['home']} ou empate",
            result["home"] + result["draw"],
            priority=5,
        ),
        _market_candidate(
            "Dupla chance",
            f"{teams['away']} ou empate",
            result["away"] + result["draw"],
            priority=5,
        ),
        _market_candidate(
            "Gols",
            "Mais de 1.5 gols",
            goals["1.5"]["over"],
            priority=4,
        ),
        _market_candidate(
            "Gols",
            "Menos de 3.5 gols",
            goals["3.5"]["under"],
            priority=3,
        ),
        _market_candidate(
            "Ambas marcam",
            "Sim",
            btts_yes,
            priority=1,
        ),
        _market_candidate(
            "Ambas marcam",
            "Não",
            100 - btts_yes,
            priority=1,
        ),
    ]
    for line in ("+1.5", "+2.5"):
        if line in handicaps:
            candidates.append(
                _market_candidate(
                    "Handicap",
                    f"{teams['home']} handicap {line}",
                    handicaps[line]["win"],
                    priority=2,
                )
            )

    qualified = [
        candidate
        for candidate in candidates
        if candidate["probability"] >= 55
    ]
    strongest = max(qualified or candidates, key=lambda item: item["score"])
    risk = _risk_level(strongest["probability"], confidence)
    alerts: list[str] = []
    if confidence == "baixa":
        alerts.append("A amostra histórica ainda é pequena; use como apoio, não como certeza.")
    if not coverage.get("raw_prediction_features"):
        alerts.append("Análise feita sem estatísticas recentes detalhadas da API.")
    margin = abs(result["home"] - result["away"])
    if margin <= 8:
        alerts.append("Jogo equilibrado no mercado de resultado.")

    summary = (
        f"{favorite_label} aparece como opção mais provável no resultado "
        f"({favorite_probability:.0f}%). O mercado com melhor sinal é "
        f"{strongest['selection']} ({strongest['probability']:.0f}%)."
    )
    return {
        "summary": summary,
        "favorite": {
            "selection": favorite_label,
            "side": favorite_side,
            "probability": favorite_probability,
        },
        "strongest_market": {
            "market": strongest["market"],
            "selection": strongest["selection"],
            "probability": strongest["probability"],
            "risk": risk,
        },
        "risk": risk,
        "alerts": alerts,
        "disclaimer": "Probabilidades estimadas por modelo. Não há garantia de resultado.",
    }


def _player_features(player: Any) -> np.ndarray:
    position_code = {"G": 0, "D": 1, "M": 2, "F": 3}.get(player.position.upper()[:1], 2)
    values = {
        "position_code": position_code,
        "expected_minutes": player.expected_minutes,
        "prior_appearances": 1,
        **{
            f"prior_{metric}_per90": player.stats_per90.get(metric, 0.0)
            for metric in ("goals", "assists", "cards", "shots", "shots_on_target", "fouls")
        },
    }
    return np.asarray([[values[column] for column in PLAYER_FEATURE_COLUMNS]], dtype=float)


def player_props(match: MatchInput, bundle: ModelBundle) -> list[dict[str, Any]]:
    output: list[dict[str, Any]] = []
    for team in (match.home, match.away):
        for player in team.players:
            if not player.stats_per90:
                continue
            exposure = player.expected_minutes / 90 * player.starter_probability
            expectations: dict[str, float] = {}
            matrix = _player_features(player)
            for metric in ("goals", "assists", "cards", "shots", "shots_on_target", "fouls"):
                if metric in bundle.player_models:
                    expected = float(bundle.player_models[metric].predict(matrix)[0])
                else:
                    expected = player.stats_per90.get(metric, 0.0) * exposure
                expectations[metric] = max(0.0, expected)
            output.append(
                {
                    "player_id": player.id,
                    "player": player.name,
                    "team": team.name,
                    "expected": {key: round(value, 3) for key, value in expectations.items()},
                    "probabilities": {
                        "goal": round(poisson_at_least_one(expectations["goals"]) * 100, 2),
                        "assist": round(poisson_at_least_one(expectations["assists"]) * 100, 2),
                        "card": round(poisson_at_least_one(expectations["cards"]) * 100, 2),
                        "shots_over_0.5": round(poisson_over(expectations["shots"], 0.5) * 100, 2),
                        "shots_over_1.5": round(poisson_over(expectations["shots"], 1.5) * 100, 2),
                        "shots_on_target_over_0.5": round(
                            poisson_over(expectations["shots_on_target"], 0.5) * 100, 2
                        ),
                        "fouls_over_0.5": round(poisson_over(expectations["fouls"], 0.5) * 100, 2),
                    },
                    "source": "player_xgboost" if bundle.player_models else "manual_per90_poisson",
                }
            )
    return output


def simulate_match(
    match: MatchInput,
    bundle: ModelBundle,
    features: dict[str, float],
    *,
    samples: int,
    seed: int,
) -> PredictionOutput:
    predicted = bundle.expected(features)
    predicted["home_shots_on_target"] = min(
        predicted["home_shots_on_target"], predicted["home_shots"]
    )
    predicted["away_shots_on_target"] = min(
        predicted["away_shots_on_target"], predicted["away_shots"]
    )
    expected = ExpectedValues(**{key: round(value, 4) for key, value in predicted.items()})
    rng = np.random.default_rng(seed + (match.fixture_id or 0))

    home_goals = rng.poisson(expected.home_goals, samples)
    away_goals = rng.poisson(expected.away_goals, samples)
    home_shots = rng.poisson(expected.home_shots, samples)
    away_shots = rng.poisson(expected.away_shots, samples)
    home_sot_rate = min(0.95, expected.home_shots_on_target / max(expected.home_shots, 0.1))
    away_sot_rate = min(0.95, expected.away_shots_on_target / max(expected.away_shots, 0.1))
    home_sot = rng.binomial(home_shots, home_sot_rate)
    away_sot = rng.binomial(away_shots, away_sot_rate)
    arrays = {
        "corners": rng.poisson(expected.home_corners, samples)
        + rng.poisson(expected.away_corners, samples),
        "cards": rng.poisson(expected.home_cards, samples)
        + rng.poisson(expected.away_cards, samples),
        "fouls": rng.poisson(expected.home_fouls, samples)
        + rng.poisson(expected.away_fouls, samples),
        "shots": home_shots + away_shots,
        "shots_on_target": home_sot + away_sot,
    }
    total_goals = home_goals + away_goals
    score_counter = Counter(zip(home_goals.tolist(), away_goals.tolist()))
    scorelines = [
        {"score": f"{home}x{away}", "probability": round(count / samples * 100, 2)}
        for (home, away), count in score_counter.most_common(5)
    ]

    handicaps: dict[str, dict[str, float]] = {}
    for line in np.arange(-2.5, 2.51, 0.5):
        adjusted = home_goals - away_goals + line
        win = _pct(adjusted > 0)
        push = _pct(adjusted == 0)
        handicaps[f"{line:+.1f}"] = {
            "win": win,
            "push": push,
            "loss": round(100 - win - push, 2),
        }

    home_probability = _pct(home_goals > away_goals)
    draw_probability = _pct(home_goals == away_goals)
    result = {
        "home": home_probability,
        "draw": draw_probability,
        "away": round(100 - home_probability - draw_probability, 2),
    }
    goals = _markets(total_goals, [1.5, 2.5, 3.5])
    btts_yes = _pct((home_goals > 0) & (away_goals > 0))
    detailed_coverage = sum(
        model.poisson is not None
        for name, model in bundle.models.items()
        if name != "goals"
    )
    detailed_matches = int(bundle.training_summary.get("detailed_matches", 0))
    has_match_features = bool(match.metadata.get("prediction_raw_features", False))
    confidence = "moderada" if has_match_features and detailed_matches >= 80 else "baixa"
    coverage = {
        "training_matches": bundle.training_summary.get("matches", 0),
        "detailed_training_matches": detailed_matches,
        "detailed_source": bundle.training_summary.get("detailed_source", "indisponível"),
        "detailed_models": detailed_coverage,
        "player_models": len(bundle.player_models),
        "raw_prediction_features": has_match_features,
        "provider_probabilities_used": False,
        "analysis_mode": "individualized" if has_match_features else "prior_only",
        "individualized_metrics": [
            "goals",
            "shots",
            "shots_on_target",
            "corners",
            "fouls",
            "cards",
        ],
        "feature_quality": "team_form_and_strength" if has_match_features else "generic_prior",
    }
    return PredictionOutput(
        fixture_id=match.fixture_id,
        generated_at=datetime.now(timezone.utc),
        match=f"{match.home.name} x {match.away.name}",
        model_version=bundle.version,
        confidence=confidence,
        coverage=coverage,
        fixture_meta=match.metadata.get("fixture_meta", {}),
        expected=expected,
        result=result,
        scorelines=scorelines,
        goals=goals,
        both_teams_score={"yes": btts_yes, "no": round(100 - btts_yes, 2)},
        handicaps=handicaps,
        counts={name: _markets(array, COUNT_LINES[name]) for name, array in arrays.items()},
        player_props=player_props(match, bundle),
        user_analysis=build_user_analysis(
            match,
            result,
            goals,
            btts_yes,
            handicaps,
            confidence,
            coverage,
        ),
    )
