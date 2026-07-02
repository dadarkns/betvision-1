from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import numpy as np

from betvision_ai.config import Settings
from betvision_ai.evaluation import settle_prediction
from betvision_ai.features import historical_training_rows
from betvision_ai.modeling import (
    DEFAULT_PRIORS,
    PLAYER_FEATURE_COLUMNS,
    SIDE_FEATURE_COLUMNS,
    ModelBundle,
    _fit_count_model,
    _stack_sides,
)
from betvision_ai.schemas import MatchInput, TeamInput
from betvision_ai.simulation import simulate_match


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _as_utc(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _temporary_bundle(
    training_rows: list[dict[str, Any]],
    detailed_rows: list[dict[str, Any]],
    player_rows: list[dict[str, Any]],
    *,
    season: int,
    fixture_id: int,
) -> ModelBundle:
    models = {}
    priors = dict(DEFAULT_PRIORS)
    goal_matrix, goal_values = _stack_sides(training_rows, "goals")
    goal_prior = float(np.mean(goal_values))
    priors["home_goals"] = goal_prior
    priors["away_goals"] = goal_prior
    models["goals"] = _fit_count_model(goal_matrix, goal_values)

    if detailed_rows:
        for metric in ("shots", "shots_on_target", "corners", "fouls", "cards"):
            matrix, values = _stack_sides(detailed_rows, metric)
            metric_prior = float(np.mean(values))
            priors[f"home_{metric}"] = metric_prior
            priors[f"away_{metric}"] = metric_prior
            models[metric] = _fit_count_model(matrix, values)

    player_models = {}
    player_fixture_count = len({row["fixture_id"] for row in player_rows})
    if len(player_rows) >= 100 and player_fixture_count >= 10:
        matrix = np.asarray(
            [[row[column] for column in PLAYER_FEATURE_COLUMNS] for row in player_rows],
            dtype=float,
        )
        for metric in ("goals", "assists", "cards", "shots", "shots_on_target", "fouls"):
            values = np.asarray([row[metric] for row in player_rows], dtype=float)
            player_models[metric] = _fit_count_model(matrix, values)

    return ModelBundle(
        version=f"backtest-wc{season}-before-{fixture_id}",
        trained_at=datetime.now(timezone.utc).isoformat(),
        feature_columns=SIDE_FEATURE_COLUMNS,
        models=models,
        priors=priors,
        player_models=player_models,
        training_summary={
            "season": season,
            "matches": len(training_rows),
            "detailed_matches": len(detailed_rows),
            "player_rows": len(player_rows),
            "player_fixtures": player_fixture_count,
            "small_sample_warning": len(training_rows) < 200,
            "xgb_active_targets": [
                name for name, model in models.items() if model.xgb_weight > 0
            ],
        },
    )


def _market_check(probability: float, actual: bool) -> dict[str, Any]:
    predicted = probability >= 50
    return {
        "probability": round(probability, 2),
        "predicted": predicted,
        "actual": actual,
        "correct": predicted == actual,
    }


def run_historical_backtest(
    settings: Settings,
    *,
    season: int = 2022,
    fixture_id: int = 979139,
    samples: int | None = None,
) -> dict[str, Any]:
    raw_dir = settings.data_dir / "raw" / f"world_cup_{season}"
    fixtures_path = raw_dir / "fixtures.json"
    if not fixtures_path.exists():
        raise FileNotFoundError("Fixtures históricos ausentes. Execute `collect` primeiro.")
    fixtures = _load_json(fixtures_path, [])
    target = next(
        (fixture for fixture in fixtures if int(fixture["fixture"]["id"]) == fixture_id),
        None,
    )
    if target is None:
        raise ValueError(f"Fixture {fixture_id} não encontrado na Copa de {season}.")

    all_rows = historical_training_rows(fixtures)
    target_row = next(row for row in all_rows if int(row["fixture_id"]) == fixture_id)
    target_time = _as_utc(target["fixture"]["date"])
    training_rows = [
        row for row in all_rows if _as_utc(row["date"]) < target_time
    ]
    processed = settings.data_dir / "processed"
    detailed_rows = [
        row
        for row in _load_json(processed / f"detailed_matches_{season}.json", [])
        if _as_utc(row["date"]) < target_time
        and str(row["fixture_id"]) != str(fixture_id)
    ]
    player_rows = [
        row
        for row in _load_json(processed / f"players_{season}.json", [])
        if _as_utc(row["date"]) < target_time
        and str(row["fixture_id"]) != str(fixture_id)
    ]
    bundle = _temporary_bundle(
        training_rows,
        detailed_rows,
        player_rows,
        season=season,
        fixture_id=fixture_id,
    )
    match = MatchInput(
        fixture_id=fixture_id,
        date=target["fixture"]["date"],
        competition=target["league"]["name"],
        stage=target["league"].get("round") or "World Cup",
        neutral=True,
        home=TeamInput(
            id=str(target["teams"]["home"]["id"]),
            name=target["teams"]["home"]["name"],
        ),
        away=TeamInput(
            id=str(target["teams"]["away"]["id"]),
            name=target["teams"]["away"]["name"],
        ),
        metadata={"backtest": True, "training_cutoff": target["fixture"]["date"]},
    )
    prediction = simulate_match(
        match,
        bundle,
        target_row,
        samples=samples or settings.monte_carlo_samples,
        seed=settings.random_seed,
    )
    prediction_dict = prediction.model_dump(mode="json")
    settlement = settle_prediction(prediction_dict, target)
    regulation = target.get("score", {}).get("fulltime") or target["goals"]
    actual_home = int(regulation["home"])
    actual_away = int(regulation["away"])
    actual_total = actual_home + actual_away
    actual_result = (
        "home" if actual_home > actual_away else "draw" if actual_home == actual_away else "away"
    )
    predicted_result = max(prediction.result, key=prediction.result.get)
    checks: dict[str, Any] = {
        "result": {
            "probabilities": prediction.result,
            "predicted": predicted_result,
            "actual": actual_result,
            "correct": predicted_result == actual_result,
        },
        "both_teams_score": _market_check(
            prediction.both_teams_score["yes"],
            actual_home > 0 and actual_away > 0,
        ),
    }
    for line in ("1.5", "2.5", "3.5"):
        checks[f"over_{line}"] = _market_check(
            prediction.goals[line]["over"],
            actual_total > float(line),
        )
    top_score = str(prediction.scorelines[0]["score"])
    checks["top_score"] = {
        "predicted": top_score,
        "actual": f"{actual_home}x{actual_away}",
        "correct": top_score == f"{actual_home}x{actual_away}",
    }
    market_checks = [
        value["correct"]
        for key, value in checks.items()
        if key != "top_score" and isinstance(value.get("correct"), bool)
    ]
    report = {
        "fixture_id": fixture_id,
        "match": prediction.match,
        "date": target["fixture"]["date"],
        "training_cutoff": target["fixture"]["date"],
        "training_matches": len(training_rows),
        "target_excluded": all(int(row["fixture_id"]) != fixture_id for row in training_rows),
        "model_version": bundle.version,
        "actual": {
            "regulation_score": f"{actual_home}x{actual_away}",
            "after_extra_time": f"{target['goals']['home']}x{target['goals']['away']}",
            "penalties": target.get("score", {}).get("penalty"),
        },
        "prediction": prediction_dict,
        "checks": checks,
        "summary": {
            "markets_checked": len(market_checks),
            "markets_correct": sum(market_checks),
            "market_accuracy": round(sum(market_checks) / len(market_checks) * 100, 2),
            "settlement": settlement,
        },
    }
    output = settings.data_dir / "outputs" / "backtests" / f"{fixture_id}.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    return report
