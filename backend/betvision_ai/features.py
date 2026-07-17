from __future__ import annotations

from collections import defaultdict
import hashlib
from typing import Any

from betvision_ai.schemas import MatchInput, TeamInput, TeamStatsInput


FEATURE_COLUMNS = [
    "home_attack",
    "home_defense",
    "away_attack",
    "away_defense",
    "home_points_rate",
    "away_points_rate",
    "home_games",
    "away_games",
    "knockout",
    "neutral",
]


def _number(value: Any, default: float) -> float:
    try:
        parsed = float(value)
        return parsed if parsed == parsed else default
    except (TypeError, ValueError):
        return default


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _stable_unit(*parts: Any) -> float:
    raw = "|".join(str(part) for part in parts)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return int(digest[:12], 16) / float(0xFFFFFFFFFFFF)


def _percent(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, str):
        value = value.strip().replace("%", "").replace(",", ".")
    parsed = _number(value, float("nan"))
    if parsed != parsed:
        return None
    return _clamp(parsed, 0.0, 100.0)


def _nested(data: dict | None, *keys: str, default: Any = None) -> Any:
    current: Any = data or {}
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key)
    return default if current is None else current


def _played_games(team: dict | None) -> int:
    team = team or {}
    league = team.get("league") or {}
    last_five = team.get("last_5") or {}
    return int(_nested(league, "fixtures", "played", "total", default=0) or last_five.get("played") or 0)


def _team_has_usable_stats(team: dict | None) -> bool:
    """Retorna True apenas quando a resposta da API traz forma real, não blocos zerados."""
    team = team or {}
    league = team.get("league") or {}
    last_five = team.get("last_5") or {}
    played = _played_games(team)
    wins = int(_nested(league, "fixtures", "wins", "total", default=0) or 0)
    draws = int(_nested(league, "fixtures", "draws", "total", default=0) or 0)
    losses = int(_nested(league, "fixtures", "loses", "total", default=0) or 0)
    goals_for = _number(_nested(league, "goals", "for", "total", "total", default=None), 0.0)
    goals_against = _number(_nested(league, "goals", "against", "total", "total", default=None), 0.0)
    last_goals_for = _number(_nested(last_five, "goals", "for", "average", default=None), 0.0)
    last_goals_against = _number(_nested(last_five, "goals", "against", "average", default=None), 0.0)
    last_form = _percent(last_five.get("form"))
    return played > 0 and any(
        value > 0
        for value in (
            played,
            wins,
            draws,
            losses,
            goals_for,
            goals_against,
            last_goals_for,
            last_goals_against,
            last_form or 0.0,
        )
    )


def _prediction_percents(prediction: dict | None) -> dict[str, float | None]:
    percent = _nested(prediction, "predictions", "percent", default={})
    if not isinstance(percent, dict):
        return {"home": None, "draw": None, "away": None}
    return {
        "home": _percent(percent.get("home")),
        "draw": _percent(percent.get("draw")),
        "away": _percent(percent.get("away")),
    }


def _has_percent_signal(percents: dict[str, float | None]) -> bool:
    values = [percents.get(key) for key in ("home", "draw", "away")]
    if any(value is None for value in values):
        return False
    home, draw, away = (float(value) for value in values if value is not None)
    return max(home, draw, away) - min(home, draw, away) >= 6


def _synthetic_team_stats(
    fixture: dict,
    side: str,
    percents: dict[str, float | None],
) -> TeamStatsInput:
    """Cria um perfil estável por equipe quando a API responde sem estatísticas úteis.

    Esse perfil evita repetir a média crua em todos os jogos, mas é marcado na
    cobertura como baixa confiança/estimado. Ele usa somente identidade do time,
    competição, mando e eventual sinal percentual do provedor.
    """
    opponent = "away" if side == "home" else "home"
    team = fixture["teams"][side]
    opponent_team = fixture["teams"][opponent]
    league = fixture["league"]
    fixture_id = fixture["fixture"]["id"]
    team_key = team.get("id") or team.get("name")
    opponent_key = opponent_team.get("id") or opponent_team.get("name")
    base = _stable_unit(team_key, team.get("name"), league.get("id"), league.get("season"))
    temperament = _stable_unit(team_key, "tempo")
    discipline = _stable_unit(team_key, "discipline")
    matchup = _stable_unit(fixture_id, team_key, opponent_key)
    home_bonus = 0.04 if side == "home" else -0.02

    own_percent = percents.get(side)
    opponent_percent = percents.get(opponent)
    percent_delta = 0.0
    if own_percent is not None and opponent_percent is not None and _has_percent_signal(percents):
        percent_delta = (own_percent - opponent_percent) / 100

    strength = _clamp(0.48 + (base - 0.5) * 0.34 + percent_delta * 0.55 + home_bonus, 0.25, 0.76)
    attack = _clamp(1.05 + (strength - 0.5) * 1.35 + (temperament - 0.5) * 0.32, 0.72, 1.72)
    defense = _clamp(1.18 - (strength - 0.5) * 0.85 + (matchup - 0.5) * 0.24, 0.72, 1.78)
    draw_rate = _clamp(0.21 + (1 - abs(strength - 0.5) * 2) * 0.09 + (matchup - 0.5) * 0.04, 0.18, 0.32)
    win_rate = _clamp(strength - draw_rate * 0.25, 0.18, 0.68)
    shots = _clamp(8.6 + attack * 2.5 + strength * 3.2 + (temperament - 0.5) * 2.2, 7.0, 16.5)
    shots_on_target = _clamp(shots * (0.28 + strength * 0.12 + (temperament - 0.5) * 0.04), 2.1, 6.4)
    corners = _clamp(3.0 + attack * 0.8 + strength * 0.9 + (matchup - 0.5) * 0.6, 2.4, 6.2)
    fouls = _clamp(12.8 + (1 - strength) * 4.6 + discipline * 2.0, 10.5, 19.5)
    cards = _clamp(1.55 + (1 - strength) * 1.15 + discipline * 0.75, 1.2, 3.4)

    return TeamStatsInput(
        games=3,
        goals_for_avg=attack,
        goals_against_avg=defense,
        win_rate=win_rate,
        draw_rate=draw_rate,
        shots_for_avg=shots,
        shots_on_target_for_avg=shots_on_target,
        corners_for_avg=corners,
        fouls_for_avg=fouls,
        cards_for_avg=cards,
    )


def stage_is_knockout(stage: str) -> float:
    lowered = stage.lower()
    return float(not ("group" in lowered or "grupo" in lowered))


def match_to_features(match: MatchInput) -> dict[str, float]:
    home = match.home.stats
    away = match.away.stats
    values = {
        "home_attack": home.goals_for_avg,
        "home_defense": home.goals_against_avg,
        "away_attack": away.goals_for_avg,
        "away_defense": away.goals_against_avg,
        "home_points_rate": min(1.0, home.win_rate + home.draw_rate / 3),
        "away_points_rate": min(1.0, away.win_rate + away.draw_rate / 3),
        "home_games": min(home.games, 10) / 10,
        "away_games": min(away.games, 10) / 10,
        "knockout": stage_is_knockout(match.stage),
        "neutral": float(match.neutral),
    }
    for side, stats in (("home", home), ("away", away)):
        values[f"{side}_shots_avg"] = stats.shots_for_avg or 0.0
        values[f"{side}_shots_on_target_avg"] = stats.shots_on_target_for_avg or 0.0
        values[f"{side}_corners_avg"] = stats.corners_for_avg or 0.0
        values[f"{side}_fouls_avg"] = stats.fouls_for_avg or 0.0
        values[f"{side}_cards_avg"] = stats.cards_for_avg or 0.0
    return values


def _team_stats_from_prediction(team: dict | None) -> TeamStatsInput:
    team = team or {}
    league = team.get("league") or {}
    last_five = team.get("last_5") or {}
    played = int(_nested(league, "fixtures", "played", "total", default=0) or last_five.get("played") or 0)
    wins = int(_nested(league, "fixtures", "wins", "total", default=0) or 0)
    draws = int(_nested(league, "fixtures", "draws", "total", default=0) or 0)
    goals_for = _number(
        _nested(league, "goals", "for", "average", "total", default=None),
        _number(_nested(last_five, "goals", "for", "average", default=None), 1.2),
    )
    goals_against = _number(
        _nested(league, "goals", "against", "average", "total", default=None),
        _number(_nested(last_five, "goals", "against", "average", default=None), 1.2),
    )
    return TeamStatsInput(
        games=played,
        goals_for_avg=goals_for,
        goals_against_avg=goals_against,
        win_rate=wins / played if played else 0.33,
        draw_rate=draws / played if played else 0.27,
    )


def match_from_api_fixture(fixture: dict, prediction: dict | None = None) -> MatchInput:
    prediction = prediction or {}
    prediction_teams = prediction.get("teams") or {}
    league_id = int(fixture["league"].get("id") or (1 if "world cup" in fixture["league"]["name"].lower() else 0))
    home_team_row = prediction_teams.get("home")
    away_team_row = prediction_teams.get("away")
    home_has_usable_stats = _team_has_usable_stats(home_team_row)
    away_has_usable_stats = _team_has_usable_stats(away_team_row)
    usable_team_feature_count = int(home_has_usable_stats) + int(away_has_usable_stats)
    provider_percents = _prediction_percents(prediction)
    provider_has_signal = _has_percent_signal(provider_percents)
    if usable_team_feature_count == 2:
        feature_source = "api_team_stats"
    elif usable_team_feature_count == 1:
        feature_source = "partial_api_team_stats"
    elif provider_has_signal:
        feature_source = "provider_percent_fallback"
    elif prediction:
        feature_source = "fixture_identity_fallback"
    else:
        feature_source = "calendar_identity_fallback"
    home_stats = (
        _team_stats_from_prediction(home_team_row)
        if home_has_usable_stats
        else _synthetic_team_stats(fixture, "home", provider_percents)
    )
    away_stats = (
        _team_stats_from_prediction(away_team_row)
        if away_has_usable_stats
        else _synthetic_team_stats(fixture, "away", provider_percents)
    )
    metadata = {
        "prediction_raw_features": usable_team_feature_count > 0,
        "usable_team_feature_count": usable_team_feature_count,
        "feature_source": feature_source,
        "provider_probabilities_ignored": not provider_has_signal or usable_team_feature_count > 0,
        "fixture_meta": {
            "league_id": league_id,
            "league_name": fixture["league"]["name"],
            "league_logo": fixture["league"].get("logo") or "",
            "season": fixture["league"].get("season"),
            "round": fixture["league"].get("round") or "",
            "starts_at": fixture["fixture"]["date"],
            "status": (fixture["fixture"].get("status") or {}).get("short") or "NS",
            "venue": (fixture["fixture"].get("venue") or {}).get("name") or "A confirmar",
            "home_id": fixture["teams"]["home"]["id"],
            "home_logo": fixture["teams"]["home"].get("logo") or "",
            "away_id": fixture["teams"]["away"]["id"],
            "away_logo": fixture["teams"]["away"].get("logo") or "",
        },
    }
    if feature_source == "provider_percent_fallback":
        metadata["provider_prediction_percent"] = provider_percents
    return MatchInput(
        fixture_id=fixture["fixture"]["id"],
        date=fixture["fixture"]["date"],
        competition=fixture["league"]["name"],
        stage=fixture["league"].get("round") or "World Cup",
        neutral=league_id == 1,
        home=TeamInput(
            id=str(fixture["teams"]["home"]["id"]),
            name=fixture["teams"]["home"]["name"],
            stats=home_stats,
        ),
        away=TeamInput(
            id=str(fixture["teams"]["away"]["id"]),
            name=fixture["teams"]["away"]["name"],
            stats=away_stats,
        ),
        metadata=metadata,
    )


def historical_training_rows(fixtures: list[dict]) -> list[dict[str, Any]]:
    states: dict[int, dict[str, float]] = defaultdict(
        lambda: {"games": 0, "goals_for": 0, "goals_against": 0, "points": 0}
    )
    rows: list[dict[str, Any]] = []
    ordered = sorted(fixtures, key=lambda item: item["fixture"]["date"])

    def snapshot(team_id: int) -> tuple[float, float, float, int]:
        state = states[team_id]
        games = int(state["games"])
        if games == 0:
            return 1.2, 1.2, 0.44, 0
        return (
            state["goals_for"] / games,
            state["goals_against"] / games,
            state["points"] / (games * 3),
            games,
        )

    for item in ordered:
        regulation_score = item.get("score", {}).get("fulltime") or {}
        home_goals = regulation_score.get("home")
        away_goals = regulation_score.get("away")
        if home_goals is None or away_goals is None:
            home_goals = item.get("goals", {}).get("home")
            away_goals = item.get("goals", {}).get("away")
        if home_goals is None or away_goals is None:
            continue
        home_id = int(item["teams"]["home"]["id"])
        away_id = int(item["teams"]["away"]["id"])
        home_attack, home_defense, home_points, home_games = snapshot(home_id)
        away_attack, away_defense, away_points, away_games = snapshot(away_id)
        row = {
            "fixture_id": item["fixture"]["id"],
            "date": item["fixture"]["date"],
            "home_team_id": home_id,
            "away_team_id": away_id,
            "home_attack": home_attack,
            "home_defense": home_defense,
            "away_attack": away_attack,
            "away_defense": away_defense,
            "home_points_rate": home_points,
            "away_points_rate": away_points,
            "home_games": min(home_games, 10) / 10,
            "away_games": min(away_games, 10) / 10,
            "knockout": stage_is_knockout(item["league"].get("round") or ""),
            "neutral": 1.0,
            "home_goals": float(home_goals),
            "away_goals": float(away_goals),
        }
        rows.append(row)

        if home_goals > away_goals:
            home_points_value, away_points_value = 3, 0
        elif away_goals > home_goals:
            home_points_value, away_points_value = 0, 3
        else:
            home_points_value = away_points_value = 1
        for team_id, scored, conceded, points in (
            (home_id, home_goals, away_goals, home_points_value),
            (away_id, away_goals, home_goals, away_points_value),
        ):
            states[team_id]["games"] += 1
            states[team_id]["goals_for"] += scored
            states[team_id]["goals_against"] += conceded
            states[team_id]["points"] += points
    return rows
