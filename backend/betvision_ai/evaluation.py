from __future__ import annotations

import json
from math import log
from pathlib import Path
from typing import Any

import numpy as np


def settle_prediction(prediction: dict, fixture: dict) -> dict[str, Any]:
    regulation_score = fixture.get("score", {}).get("fulltime") or {}
    home_goals = int(
        regulation_score.get("home")
        if regulation_score.get("home") is not None
        else fixture["goals"]["home"]
    )
    away_goals = int(
        regulation_score.get("away")
        if regulation_score.get("away") is not None
        else fixture["goals"]["away"]
    )
    actual_index = 0 if home_goals > away_goals else 1 if home_goals == away_goals else 2
    probabilities = np.asarray(
        [
            prediction["result"]["home"],
            prediction["result"]["draw"],
            prediction["result"]["away"],
        ],
        dtype=float,
    ) / 100
    actual = np.zeros(3)
    actual[actual_index] = 1
    total = home_goals + away_goals
    btts = home_goals > 0 and away_goals > 0
    over25 = total > 2.5
    over25_probability = prediction["goals"]["2.5"]["over"] / 100
    btts_probability = prediction["both_teams_score"]["yes"] / 100
    picked = int(np.argmax(probabilities))
    handicap_correct = []
    goal_difference = home_goals - away_goals
    for line, market in prediction.get("handicaps", {}).items():
        adjusted = goal_difference + float(line)
        actual_state = "win" if adjusted > 0 else "push" if adjusted == 0 else "loss"
        predicted_state = max(("win", "push", "loss"), key=lambda state: market[state])
        handicap_correct.append(predicted_state == actual_state)
    return {
        "fixture_id": prediction["fixture_id"],
        "match": prediction["match"],
        "actual_score": f"{home_goals}x{away_goals}",
        "result_correct": picked == actual_index,
        "predicted_confidence": float(np.max(probabilities)),
        "brier_1x2": float(np.mean((probabilities - actual) ** 2)),
        "log_loss_1x2": float(-log(max(probabilities[actual_index], 1e-9))),
        "goals_mae": abs(
            prediction["expected"]["home_goals"]
            + prediction["expected"]["away_goals"]
            - total
        ),
        "over25_brier": float((over25_probability - float(over25)) ** 2),
        "btts_brier": float((btts_probability - float(btts)) ** 2),
        "over25_correct": (over25_probability >= 0.5) == over25,
        "btts_correct": (btts_probability >= 0.5) == btts,
        "handicap_accuracy": (
            sum(handicap_correct) / len(handicap_correct) * 100 if handicap_correct else 0.0
        ),
    }


def aggregate_metrics(rows: list[dict[str, Any]]) -> dict[str, Any]:
    if not rows:
        return {"settled": 0}
    numeric = ("brier_1x2", "log_loss_1x2", "goals_mae", "over25_brier", "btts_brier")
    return {
        "settled": len(rows),
        **{name: round(sum(row[name] for row in rows) / len(rows), 5) for name in numeric},
        "result_accuracy": round(sum(row["result_correct"] for row in rows) / len(rows) * 100, 2),
        "over25_accuracy": round(sum(row["over25_correct"] for row in rows) / len(rows) * 100, 2),
        "btts_accuracy": round(sum(row["btts_correct"] for row in rows) / len(rows) * 100, 2),
        "handicap_accuracy": round(
            sum(row["handicap_accuracy"] for row in rows) / len(rows), 2
        ),
        "calibration_gap": round(
            abs(
                sum(row["predicted_confidence"] for row in rows) / len(rows)
                - sum(row["result_correct"] for row in rows) / len(rows)
            ),
            5,
        ),
    }


def detailed_market_metrics(prediction: dict, totals: dict[str, float]) -> dict[str, Any]:
    metrics: dict[str, Any] = {}
    for market_name, lines in prediction.get("counts", {}).items():
        if market_name not in totals:
            continue
        actual_total = totals[market_name]
        line_metrics = {}
        for line, probabilities in lines.items():
            actual_over = actual_total > float(line)
            probability = probabilities["over"] / 100
            line_metrics[line] = {
                "actual": actual_total,
                "over": actual_over,
                "brier": round((probability - float(actual_over)) ** 2, 6),
                "correct": (probability >= 0.5) == actual_over,
            }
        metrics[market_name] = line_metrics
    return metrics


def append_history(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    existing_ids: set[int] = set()
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            try:
                existing_ids.add(int(json.loads(line)["fixture_id"]))
            except (ValueError, KeyError, json.JSONDecodeError):
                continue
    with path.open("a", encoding="utf-8") as handle:
        for row in rows:
            if int(row["fixture_id"]) not in existing_ids:
                handle.write(json.dumps(row, ensure_ascii=False) + "\n")
