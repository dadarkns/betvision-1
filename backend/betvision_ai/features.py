from __future__ import annotations

from collections import defaultdict
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


def _nested(data: dict | None, *keys: str, default: Any = None) -> Any:
    current: Any = data or {}
    for key in keys:
        if not isinstance(current, dict):
            return default
        current = current.get(key)
    return default if current is None else current


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
    return MatchInput(
        fixture_id=fixture["fixture"]["id"],
        date=fixture["fixture"]["date"],
        competition=fixture["league"]["name"],
        stage=fixture["league"].get("round") or "World Cup",
        neutral=league_id == 1,
        home=TeamInput(
            id=str(fixture["teams"]["home"]["id"]),
            name=fixture["teams"]["home"]["name"],
            stats=_team_stats_from_prediction(prediction_teams.get("home")),
        ),
        away=TeamInput(
            id=str(fixture["teams"]["away"]["id"]),
            name=fixture["teams"]["away"]["name"],
            stats=_team_stats_from_prediction(prediction_teams.get("away")),
        ),
        metadata={
            "prediction_raw_features": bool(prediction),
            "provider_probabilities_ignored": True,
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
        },
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
