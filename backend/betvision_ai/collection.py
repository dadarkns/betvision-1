from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from betvision_ai.api import ApiClient, ApiError, BudgetExceeded, RateLimitError
from betvision_ai.config import Settings
from betvision_ai.features import historical_training_rows


STAT_MAP = {
    "Total Shots": "shots",
    "Shots on Goal": "shots_on_target",
    "Corner Kicks": "corners",
    "Fouls": "fouls",
    "Yellow Cards": "yellow_cards",
    "Red Cards": "red_cards",
}


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def collect_world_cup(
    settings: Settings,
    client: ApiClient,
    season: int = 2022,
) -> dict[str, int]:
    raw_dir = settings.data_dir / "raw" / f"world_cup_{season}"
    fixtures_path = raw_dir / "fixtures.json"
    if fixtures_path.exists():
        fixtures = json.loads(fixtures_path.read_text(encoding="utf-8"))
    else:
        payload = client.get(
            "fixtures",
            {"league": settings.world_cup_league_id, "season": season},
            max_age_seconds=None,
        )
        fixtures = payload.get("response", [])
        _write_json(fixtures_path, fixtures)

    completed = [
        item
        for item in fixtures
        if item.get("goals", {}).get("home") is not None and item.get("goals", {}).get("away") is not None
    ]
    collected_stats = 0
    collected_players = 0
    failures: list[dict[str, Any]] = []

    for item in sorted(completed, key=lambda row: row["fixture"]["date"]):
        fixture_id = int(item["fixture"]["id"])
        for endpoint, suffix in (
            ("fixtures/statistics", "statistics"),
            ("fixtures/players", "players"),
        ):
            target = raw_dir / f"{fixture_id}_{suffix}.json"
            if target.exists():
                continue
            try:
                payload = client.get(endpoint, {"fixture": fixture_id}, max_age_seconds=None)
                _write_json(target, payload.get("response", []))
                if suffix == "statistics":
                    collected_stats += 1
                else:
                    collected_players += 1
            except (BudgetExceeded, RateLimitError) as exc:
                failures.append({"fixture_id": fixture_id, "endpoint": endpoint, "error": str(exc)})
                _write_json(raw_dir / "failures.json", failures)
                return {
                    "fixtures": len(completed),
                    "statistics_added": collected_stats,
                    "players_added": collected_players,
                    "requests": client.budget.spent,
                }
            except ApiError as exc:
                failures.append({"fixture_id": fixture_id, "endpoint": endpoint, "error": str(exc)})

    _write_json(raw_dir / "failures.json", failures)
    return {
        "fixtures": len(completed),
        "statistics_added": collected_stats,
        "players_added": collected_players,
        "requests": client.budget.spent,
    }


def _stats_by_team(payload: list[dict]) -> dict[int, dict[str, float]]:
    result: dict[int, dict[str, float]] = {}
    for team_row in payload:
        team_id = int(team_row.get("team", {}).get("id", 0))
        values: dict[str, float] = {}
        for stat in team_row.get("statistics") or []:
            mapped = STAT_MAP.get(stat.get("type"))
            value = stat.get("value")
            if mapped and value is not None:
                try:
                    values[mapped] = float(str(value).replace("%", ""))
                except ValueError:
                    continue
        if values:
            values["cards"] = values.get("yellow_cards", 0) + 2 * values.get("red_cards", 0)
            result[team_id] = values
    return result


def _player_targets(stat: dict) -> dict[str, float]:
    return {
        "goals": float((stat.get("goals") or {}).get("total") or 0),
        "assists": float((stat.get("goals") or {}).get("assists") or 0),
        "cards": float((stat.get("cards") or {}).get("yellow") or 0)
        + 2 * float((stat.get("cards") or {}).get("red") or 0),
        "shots": float((stat.get("shots") or {}).get("total") or 0),
        "shots_on_target": float((stat.get("shots") or {}).get("on") or 0),
        "fouls": float((stat.get("fouls") or {}).get("committed") or 0),
    }


def prepare_datasets(settings: Settings, season: int = 2022) -> dict[str, int]:
    raw_dir = settings.data_dir / "raw" / f"world_cup_{season}"
    fixtures_path = raw_dir / "fixtures.json"
    if not fixtures_path.exists():
        raise FileNotFoundError("Execute `python -m betvision_ai collect --season 2022` primeiro.")
    fixtures = json.loads(fixtures_path.read_text(encoding="utf-8"))
    rows = historical_training_rows(fixtures)
    rows_by_fixture = {int(row["fixture_id"]): row for row in rows}

    detailed_rows: list[dict[str, Any]] = []
    player_rows: list[dict[str, Any]] = []
    player_history: dict[int, dict[str, float]] = {}

    for fixture in sorted(fixtures, key=lambda item: item["fixture"]["date"]):
        fixture_id = int(fixture["fixture"]["id"])
        if fixture_id not in rows_by_fixture:
            continue
        stats_path = raw_dir / f"{fixture_id}_statistics.json"
        if stats_path.exists():
            team_stats = _stats_by_team(json.loads(stats_path.read_text(encoding="utf-8")))
            home_id = int(fixture["teams"]["home"]["id"])
            away_id = int(fixture["teams"]["away"]["id"])
            if home_id in team_stats and away_id in team_stats:
                detailed = dict(rows_by_fixture[fixture_id])
                for side, team_id in (("home", home_id), ("away", away_id)):
                    for metric in ("shots", "shots_on_target", "corners", "fouls", "cards"):
                        detailed[f"{side}_{metric}"] = team_stats[team_id].get(metric, 0)
                detailed_rows.append(detailed)

        players_path = raw_dir / f"{fixture_id}_players.json"
        if not players_path.exists():
            continue
        teams = json.loads(players_path.read_text(encoding="utf-8"))
        for team in teams:
            for item in team.get("players") or []:
                player = item.get("player") or {}
                player_id = int(player.get("id") or 0)
                if not player_id:
                    continue
                stat = (item.get("statistics") or [{}])[0]
                games = stat.get("games") or {}
                minutes = float(games.get("minutes") or 0)
                history = player_history.setdefault(
                    player_id,
                    {
                        "minutes": 0,
                        "appearances": 0,
                        "goals": 0,
                        "assists": 0,
                        "cards": 0,
                        "shots": 0,
                        "shots_on_target": 0,
                        "fouls": 0,
                    },
                )
                target = _player_targets(stat)
                prior_minutes = history["minutes"]
                row = {
                    "fixture_id": fixture_id,
                    "date": fixture["fixture"]["date"],
                    "player_id": player_id,
                    "position_code": _position_code(games.get("position")),
                    "expected_minutes": min(120.0, max(0.0, minutes)),
                    "prior_appearances": history["appearances"],
                }
                for metric in ("goals", "assists", "cards", "shots", "shots_on_target", "fouls"):
                    row[f"prior_{metric}_per90"] = (
                        history[metric] * 90 / prior_minutes if prior_minutes else 0.0
                    )
                    row[metric] = target[metric]
                player_rows.append(row)
                history["minutes"] += minutes
                history["appearances"] += 1
                for metric, value in target.items():
                    history[metric] += value

    statsbomb_rows = _statsbomb_detailed_rows(settings, [2018, 2022])
    if len(statsbomb_rows) >= len(detailed_rows):
        detailed_rows = statsbomb_rows

    processed = settings.data_dir / "processed"
    _write_json(processed / f"matches_{season}.json", rows)
    _write_json(processed / f"detailed_matches_{season}.json", detailed_rows)
    _write_json(processed / f"players_{season}.json", player_rows)
    return {
        "matches": len(rows),
        "detailed_matches": len(detailed_rows),
        "player_rows": len(player_rows),
    }


def _statsbomb_event_totals(events: list[dict[str, Any]], team_ids: tuple[int, int]) -> dict[int, dict[str, float]]:
    totals = {
        team_id: {"shots": 0.0, "shots_on_target": 0.0, "corners": 0.0, "fouls": 0.0, "cards": 0.0}
        for team_id in team_ids
    }
    on_target = {"Goal", "Saved", "Saved To Post"}
    for event in events:
        team_id = int((event.get("team") or {}).get("id") or 0)
        if team_id not in totals:
            continue
        event_type = (event.get("type") or {}).get("name")
        if event_type == "Shot":
            totals[team_id]["shots"] += 1
            outcome = ((event.get("shot") or {}).get("outcome") or {}).get("name")
            if outcome in on_target:
                totals[team_id]["shots_on_target"] += 1
        elif event_type == "Pass":
            pass_type = ((event.get("pass") or {}).get("type") or {}).get("name")
            if pass_type == "Corner":
                totals[team_id]["corners"] += 1
        elif event_type == "Foul Committed":
            totals[team_id]["fouls"] += 1
            card = ((event.get("foul_committed") or {}).get("card") or {}).get("name")
            if card:
                totals[team_id]["cards"] += 2 if card in {"Red Card", "Second Yellow"} else 1
        elif event_type == "Bad Behaviour":
            card = ((event.get("bad_behaviour") or {}).get("card") or {}).get("name")
            if card:
                totals[team_id]["cards"] += 2 if card in {"Red Card", "Second Yellow"} else 1
    return totals


def _statsbomb_detailed_rows(settings: Settings, seasons: list[int]) -> list[dict[str, Any]]:
    root = settings.data_dir / "sources" / "statsbomb-open-data" / "data"
    season_ids = {2018: 3, 2022: 106}
    all_rows: list[dict[str, Any]] = []
    for season in seasons:
        manifest = root / "matches" / "43" / f"{season_ids[season]}.json"
        if not manifest.exists():
            continue
        matches = sorted(json.loads(manifest.read_text(encoding="utf-8")), key=lambda row: (row["match_date"], row["kick_off"]))
        states: dict[int, dict[str, float]] = {}

        def state(team_id: int) -> dict[str, float]:
            return states.setdefault(team_id, {"games": 0, "goals_for": 0, "goals_against": 0, "points": 0})

        def snapshot(team_id: int) -> tuple[float, float, float, int]:
            current = state(team_id)
            games = int(current["games"])
            if games == 0:
                return 1.2, 1.2, 0.44, 0
            return (
                current["goals_for"] / games,
                current["goals_against"] / games,
                current["points"] / (games * 3),
                games,
            )

        for match in matches:
            match_id = int(match["match_id"])
            events_path = root / "events" / f"{match_id}.json"
            if not events_path.exists():
                continue
            home_id = int(match["home_team"]["home_team_id"])
            away_id = int(match["away_team"]["away_team_id"])
            home_goals = float(match["home_score"])
            away_goals = float(match["away_score"])
            home_attack, home_defense, home_points, home_games = snapshot(home_id)
            away_attack, away_defense, away_points, away_games = snapshot(away_id)
            totals = _statsbomb_event_totals(
                json.loads(events_path.read_text(encoding="utf-8")),
                (home_id, away_id),
            )
            row = {
                "fixture_id": f"statsbomb-{match_id}",
                "date": f"{match['match_date']}T{match['kick_off']}",
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
                "knockout": float((match.get("competition_stage") or {}).get("name") != "Group Stage"),
                "neutral": 1.0,
                "home_goals": home_goals,
                "away_goals": away_goals,
            }
            for side, team_id in (("home", home_id), ("away", away_id)):
                for metric in ("shots", "shots_on_target", "corners", "fouls", "cards"):
                    row[f"{side}_{metric}"] = totals[team_id][metric]
            all_rows.append(row)

            if home_goals > away_goals:
                home_result, away_result = 3, 0
            elif away_goals > home_goals:
                home_result, away_result = 0, 3
            else:
                home_result = away_result = 1
            for team_id, scored, conceded, points in (
                (home_id, home_goals, away_goals, home_result),
                (away_id, away_goals, home_goals, away_result),
            ):
                current = state(team_id)
                current["games"] += 1
                current["goals_for"] += scored
                current["goals_against"] += conceded
                current["points"] += points
    return all_rows


def _position_code(value: str | None) -> int:
    return {"G": 0, "D": 1, "M": 2, "F": 3}.get((value or "").upper(), 2)
