from __future__ import annotations

from betvision_ai.evaluation import aggregate_metrics, detailed_market_metrics, settle_prediction


def test_settlement_scores_result_and_handicap():
    prediction = {
        "fixture_id": 1,
        "match": "A x B",
        "result": {"home": 60, "draw": 25, "away": 15},
        "expected": {"home_goals": 1.7, "away_goals": 0.8},
        "goals": {"2.5": {"over": 48, "under": 52}},
        "both_teams_score": {"yes": 45, "no": 55},
        "handicaps": {
            "+0.0": {"win": 60, "push": 25, "loss": 15},
            "-1.0": {"win": 30, "push": 30, "loss": 40},
        },
    }
    fixture = {"goals": {"home": 2, "away": 1}}
    row = settle_prediction(prediction, fixture)
    assert row["result_correct"] is True
    assert row["actual_score"] == "2x1"
    summary = aggregate_metrics([row])
    assert summary["settled"] == 1
    assert "calibration_gap" in summary


def test_detailed_market_brier():
    prediction = {
        "counts": {
            "corners": {
                "8.5": {"over": 70, "under": 30},
            }
        }
    }
    metrics = detailed_market_metrics(prediction, {"corners": 10})
    assert metrics["corners"]["8.5"]["correct"] is True
    assert metrics["corners"]["8.5"]["brier"] == 0.09


def test_settlement_uses_regulation_score_before_extra_time():
    prediction = {
        "fixture_id": 1,
        "match": "A x B",
        "result": {"home": 20, "draw": 60, "away": 20},
        "expected": {"home_goals": 1.4, "away_goals": 1.4},
        "goals": {"2.5": {"over": 55, "under": 45}},
        "both_teams_score": {"yes": 60, "no": 40},
        "handicaps": {},
    }
    fixture = {
        "goals": {"home": 3, "away": 2},
        "score": {"fulltime": {"home": 1, "away": 1}},
    }
    row = settle_prediction(prediction, fixture)
    assert row["actual_score"] == "1x1"
    assert row["result_correct"] is True
