from __future__ import annotations

from copy import deepcopy

from betvision_ai.features import historical_training_rows, match_from_api_fixture


def _fixture(fixture_id, when, home_id, away_id, home_goals, away_goals):
    return {
        "fixture": {"id": fixture_id, "date": when},
        "league": {"round": "Group Stage"},
        "teams": {
            "home": {"id": home_id, "name": f"T{home_id}"},
            "away": {"id": away_id, "name": f"T{away_id}"},
        },
        "goals": {"home": home_goals, "away": away_goals},
    }


def test_historical_features_do_not_use_current_result():
    fixtures = [
        _fixture(1, "2022-01-01T12:00:00Z", 10, 20, 2, 0),
        _fixture(2, "2022-01-02T12:00:00Z", 10, 30, 1, 1),
    ]
    changed = deepcopy(fixtures)
    changed[1]["goals"] = {"home": 8, "away": 7}
    original_row = historical_training_rows(fixtures)[1]
    changed_row = historical_training_rows(changed)[1]
    for key in (
        "home_attack",
        "home_defense",
        "away_attack",
        "away_defense",
        "home_points_rate",
        "away_points_rate",
    ):
        assert original_row[key] == changed_row[key]


def test_provider_probability_fields_are_ignored():
    fixture = {
        "fixture": {"id": 1, "date": "2026-06-24T19:00:00Z"},
        "league": {"name": "World Cup", "round": "Group Stage"},
        "teams": {
            "home": {"id": 10, "name": "A"},
            "away": {"id": 20, "name": "B"},
        },
    }
    prediction = {
        "predictions": {
            "percent": {"home": "99%", "draw": "1%", "away": "0%"},
            "winner": {"name": "A"},
            "advice": "Winner A",
        },
        "teams": {
            "home": {"last_5": {"played": 2, "goals": {"for": {"average": "1.5"}, "against": {"average": "0.5"}}}},
            "away": {"last_5": {"played": 2, "goals": {"for": {"average": "0.7"}, "against": {"average": "1.2"}}}},
        },
    }
    match = match_from_api_fixture(fixture, prediction)
    assert match.home.stats.goals_for_avg == 1.5
    assert match.metadata["provider_probabilities_ignored"] is True
    assert "percent" not in match.model_dump_json()


def test_historical_target_uses_regulation_score():
    fixture = _fixture(1, "2022-12-18T15:00:00Z", 10, 20, 3, 3)
    fixture["score"] = {
        "fulltime": {"home": 2, "away": 2},
        "extratime": {"home": 1, "away": 1},
    }
    row = historical_training_rows([fixture])[0]
    assert row["home_goals"] == 2
    assert row["away_goals"] == 2
