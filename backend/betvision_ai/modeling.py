from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.linear_model import PoissonRegressor
from sklearn.metrics import mean_absolute_error
from xgboost import XGBRegressor

from betvision_ai.config import Settings
PLAYER_FEATURE_COLUMNS = [
    "position_code",
    "expected_minutes",
    "prior_appearances",
    "prior_goals_per90",
    "prior_assists_per90",
    "prior_cards_per90",
    "prior_shots_per90",
    "prior_shots_on_target_per90",
    "prior_fouls_per90",
]

SIDE_FEATURE_COLUMNS = [
    "attack",
    "opponent_defense",
    "points_rate",
    "opponent_points_rate",
    "games",
    "opponent_games",
    "knockout",
    "neutral",
]


@dataclass
class CountEnsemble:
    fallback_mean: float
    poisson: PoissonRegressor | None = None
    xgb: XGBRegressor | None = None
    xgb_weight: float = 0.0
    validation: dict[str, float] = field(default_factory=dict)

    def predict(self, matrix: np.ndarray) -> np.ndarray:
        if self.poisson is None:
            return np.full(matrix.shape[0], max(0.01, self.fallback_mean))
        poisson_pred = np.clip(self.poisson.predict(matrix), 0.01, None)
        if self.xgb is None or self.xgb_weight <= 0:
            return poisson_pred
        xgb_pred = np.clip(self.xgb.predict(matrix), 0.01, None)
        return poisson_pred * (1 - self.xgb_weight) + xgb_pred * self.xgb_weight


@dataclass
class ModelBundle:
    version: str
    trained_at: str
    feature_columns: list[str]
    models: dict[str, CountEnsemble]
    priors: dict[str, float]
    player_models: dict[str, CountEnsemble] = field(default_factory=dict)
    training_summary: dict[str, Any] = field(default_factory=dict)

    def expected(self, features: dict[str, float]) -> dict[str, float]:
        home_matrix = np.asarray([[_side_values(features, "home")[column] for column in self.feature_columns]], dtype=float)
        away_matrix = np.asarray([[_side_values(features, "away")[column] for column in self.feature_columns]], dtype=float)
        result: dict[str, float] = {}
        for metric in ("goals", "shots", "shots_on_target", "corners", "fouls", "cards"):
            model = self.models.get(metric)
            for side, matrix in (("home", home_matrix), ("away", away_matrix)):
                target = f"{side}_{metric}"
                prior = self.priors[target]
                learned = float(model.predict(matrix)[0]) if model else float(prior)
                if metric == "goals":
                    statistical = _analytical_goal_rate(features, side, float(prior))
                    result[target] = 0.45 * learned + 0.55 * statistical
                else:
                    supplied_average = features.get(f"{side}_{metric}_avg", 0.0)
                    base_value = (
                        0.3 * learned + 0.7 * supplied_average
                        if supplied_average > 0
                        else learned
                    )
                    result[target] = base_value * _context_multiplier(features, side, metric)
        return result


def _side_values(features: dict[str, float], side: str) -> dict[str, float]:
    opponent = "away" if side == "home" else "home"
    return {
        "attack": features[f"{side}_attack"],
        "opponent_defense": features[f"{opponent}_defense"],
        "points_rate": features[f"{side}_points_rate"],
        "opponent_points_rate": features[f"{opponent}_points_rate"],
        "games": features[f"{side}_games"],
        "opponent_games": features[f"{opponent}_games"],
        "knockout": features["knockout"],
        "neutral": features["neutral"],
    }


def _analytical_goal_rate(features: dict[str, float], side: str, prior: float) -> float:
    opponent = "away" if side == "home" else "home"
    attack = max(0.05, features[f"{side}_attack"])
    opponent_defense = max(0.05, features[f"{opponent}_defense"])
    raw_rate = (attack + opponent_defense) / 2
    points_delta = features[f"{side}_points_rate"] - features[f"{opponent}_points_rate"]
    raw_rate *= float(np.clip(1 + 0.35 * points_delta, 0.75, 1.25))
    reliability = float(
        np.clip(
            (features[f"{side}_games"] + features[f"{opponent}_games"]) * 1.25,
            0.35,
            0.75,
        )
    )
    return max(0.15, prior * (1 - reliability) + raw_rate * reliability)


def _context_multiplier(features: dict[str, float], side: str, metric: str) -> float:
    """Individualiza contagens usando força, adversário, forma e fase do confronto."""
    opponent = "away" if side == "home" else "home"
    attack_delta = features[f"{side}_attack"] - 1.2
    defense_exposure = features[f"{opponent}_defense"] - 1.2
    points_delta = features[f"{side}_points_rate"] - features[f"{opponent}_points_rate"]
    knockout = features["knockout"]
    if metric == "shots":
        factor = 1 + 0.18 * attack_delta + 0.12 * defense_exposure + 0.22 * points_delta
    elif metric == "shots_on_target":
        factor = 1 + 0.28 * attack_delta + 0.16 * defense_exposure + 0.25 * points_delta
    elif metric == "corners":
        factor = 1 + 0.12 * attack_delta + 0.08 * defense_exposure + 0.16 * points_delta
    elif metric == "fouls":
        factor = 1 - 0.05 * attack_delta - 0.12 * points_delta + 0.04 * knockout
    elif metric == "cards":
        factor = 1 - 0.06 * attack_delta - 0.18 * points_delta + 0.08 * knockout
    else:
        factor = 1.0
    return float(np.clip(factor, 0.72, 1.35))


def _stack_sides(rows: list[dict[str, Any]], metric: str) -> tuple[np.ndarray, np.ndarray]:
    matrix: list[list[float]] = []
    target: list[float] = []
    for row in rows:
        for side in ("home", "away"):
            values = _side_values(row, side)
            matrix.append([values[column] for column in SIDE_FEATURE_COLUMNS])
            target.append(float(row[f"{side}_{metric}"]))
    return np.asarray(matrix, dtype=float), np.asarray(target, dtype=float)


def _fit_count_model(matrix: np.ndarray, target: np.ndarray, *, allow_xgb: bool = True) -> CountEnsemble:
    fallback = float(np.mean(target)) if len(target) else 1.0
    if len(target) < 20 or np.all(target == target[0]):
        return CountEnsemble(fallback_mean=fallback)
    split = max(6, int(len(target) * 0.75))
    if split >= len(target):
        split = len(target) - 1
    train_x, valid_x = matrix[:split], matrix[split:]
    train_y, valid_y = target[:split], target[split:]

    poisson_eval = PoissonRegressor(alpha=1.0, max_iter=1000)
    poisson_eval.fit(train_x, train_y)
    poisson_mae = float(mean_absolute_error(valid_y, poisson_eval.predict(valid_x)))
    xgb_weight = 0.0
    xgb_model: XGBRegressor | None = None
    xgb_mae = poisson_mae

    if allow_xgb and len(target) >= 24:
        xgb_eval = XGBRegressor(
            objective="count:poisson",
            n_estimators=160,
            max_depth=2,
            learning_rate=0.035,
            subsample=0.85,
            colsample_bytree=0.9,
            reg_lambda=6.0,
            min_child_weight=3,
            random_state=2026,
            n_jobs=1,
        )
        xgb_eval.fit(train_x, train_y)
        xgb_mae = float(mean_absolute_error(valid_y, xgb_eval.predict(valid_x)))
        if xgb_mae < poisson_mae:
            relative_gain = (poisson_mae - xgb_mae) / max(poisson_mae, 1e-6)
            xgb_weight = float(np.clip(0.2 + relative_gain, 0.2, 0.65))

    poisson = PoissonRegressor(alpha=1.0, max_iter=1000)
    poisson.fit(matrix, target)
    if xgb_weight > 0:
        xgb_model = XGBRegressor(
            objective="count:poisson",
            n_estimators=160,
            max_depth=2,
            learning_rate=0.035,
            subsample=0.85,
            colsample_bytree=0.9,
            reg_lambda=6.0,
            min_child_weight=3,
            random_state=2026,
            n_jobs=1,
        )
        xgb_model.fit(matrix, target)

    return CountEnsemble(
        fallback_mean=fallback,
        poisson=poisson,
        xgb=xgb_model,
        xgb_weight=xgb_weight,
        validation={"poisson_mae": poisson_mae, "xgb_mae": xgb_mae},
    )


DEFAULT_PRIORS = {
    "home_goals": 1.35,
    "away_goals": 1.15,
    "home_shots": 12.5,
    "away_shots": 11.2,
    "home_shots_on_target": 4.4,
    "away_shots_on_target": 3.9,
    "home_corners": 5.0,
    "away_corners": 4.5,
    "home_fouls": 13.0,
    "away_fouls": 13.0,
    "home_cards": 2.0,
    "away_cards": 2.0,
}


def train_bundle(settings: Settings, season: int = 2022) -> ModelBundle:
    processed = settings.data_dir / "processed"
    match_path = processed / f"matches_{season}.json"
    if not match_path.exists():
        raise FileNotFoundError("Dataset não preparado. Execute `python -m betvision_ai prepare`.")
    rows = json.loads(match_path.read_text(encoding="utf-8"))
    detailed_path = processed / f"detailed_matches_{season}.json"
    detailed_rows = json.loads(detailed_path.read_text(encoding="utf-8")) if detailed_path.exists() else []
    player_path = processed / f"players_{season}.json"
    player_rows = json.loads(player_path.read_text(encoding="utf-8")) if player_path.exists() else []

    models: dict[str, CountEnsemble] = {}
    priors = dict(DEFAULT_PRIORS)
    goal_matrix, goal_values = _stack_sides(rows, "goals")
    goal_prior = float(np.mean(goal_values))
    priors["home_goals"] = goal_prior
    priors["away_goals"] = goal_prior
    models["goals"] = _fit_count_model(goal_matrix, goal_values)

    if detailed_rows:
        for metric in ("shots", "shots_on_target", "corners", "fouls", "cards"):
            detailed_matrix, values = _stack_sides(detailed_rows, metric)
            metric_prior = float(np.mean(values))
            priors[f"home_{metric}"] = metric_prior
            priors[f"away_{metric}"] = metric_prior
            models[metric] = _fit_count_model(detailed_matrix, values)

    player_models: dict[str, CountEnsemble] = {}
    player_fixture_count = len({row["fixture_id"] for row in player_rows})
    if len(player_rows) >= 100 and player_fixture_count >= 10:
        player_matrix = np.asarray(
            [[row[column] for column in PLAYER_FEATURE_COLUMNS] for row in player_rows], dtype=float
        )
        for metric in ("goals", "assists", "cards", "shots", "shots_on_target", "fouls"):
            values = np.asarray([row[metric] for row in player_rows], dtype=float)
            player_models[metric] = _fit_count_model(player_matrix, values)

    version = f"wc{season}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    bundle = ModelBundle(
        version=version,
        trained_at=datetime.now(timezone.utc).isoformat(),
        feature_columns=SIDE_FEATURE_COLUMNS,
        models=models,
        priors=priors,
        player_models=player_models,
        training_summary={
            "season": season,
            "matches": len(rows),
            "detailed_matches": len(detailed_rows),
            "detailed_source": "StatsBomb Open Data" if any(str(row.get("fixture_id", "")).startswith("statsbomb-") for row in detailed_rows) else "API-Football",
            "player_rows": len(player_rows),
            "player_fixtures": player_fixture_count,
            "player_models_active": list(player_models),
            "small_sample_warning": len(rows) < 200,
            "xgb_active_targets": [
                target for target, model in models.items() if model.xgb_weight > 0
            ],
        },
    )
    model_dir = settings.data_dir / "models"
    joblib.dump(bundle, model_dir / "latest.joblib")
    (model_dir / "metadata.json").write_text(
        json.dumps(
            {
                "version": bundle.version,
                "trained_at": bundle.trained_at,
                "training_summary": bundle.training_summary,
                "validation": {
                    name: {**model.validation, "xgb_weight": model.xgb_weight}
                    for name, model in models.items()
                },
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
    return bundle


def load_bundle(settings: Settings) -> ModelBundle:
    path = settings.data_dir / "models" / "latest.joblib"
    if not path.exists():
        raise FileNotFoundError("Modelo não treinado. Execute collect, prepare e train.")
    return joblib.load(path)
