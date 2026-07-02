from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator


class TeamStatsInput(BaseModel):
    games: int = Field(default=0, ge=0)
    goals_for_avg: float = Field(default=1.2, ge=0)
    goals_against_avg: float = Field(default=1.2, ge=0)
    win_rate: float = Field(default=0.33, ge=0, le=1)
    draw_rate: float = Field(default=0.27, ge=0, le=1)
    shots_for_avg: float | None = Field(default=None, ge=0)
    shots_on_target_for_avg: float | None = Field(default=None, ge=0)
    corners_for_avg: float | None = Field(default=None, ge=0)
    fouls_for_avg: float | None = Field(default=None, ge=0)
    cards_for_avg: float | None = Field(default=None, ge=0)


class PlayerInput(BaseModel):
    id: str
    name: str
    position: str = "N/D"
    expected_minutes: float = Field(default=90, ge=0, le=130)
    starter_probability: float = Field(default=1, ge=0, le=1)
    stats_per90: dict[str, float] = Field(default_factory=dict)

    @model_validator(mode="after")
    def validate_stats(self) -> "PlayerInput":
        allowed = {"goals", "assists", "cards", "shots", "shots_on_target", "fouls"}
        unknown = set(self.stats_per90) - allowed
        if unknown:
            raise ValueError(f"Métricas individuais desconhecidas: {sorted(unknown)}")
        if any(value < 0 for value in self.stats_per90.values()):
            raise ValueError("Estatísticas por 90 minutos não podem ser negativas.")
        return self


class TeamInput(BaseModel):
    id: str
    name: str
    stats: TeamStatsInput = Field(default_factory=TeamStatsInput)
    players: list[PlayerInput] = Field(default_factory=list)


class MatchInput(BaseModel):
    fixture_id: int | None = None
    date: datetime
    competition: str = "World Cup"
    stage: str = "Group Stage"
    neutral: bool = True
    home: TeamInput
    away: TeamInput
    metadata: dict[str, Any] = Field(default_factory=dict)


class ExpectedValues(BaseModel):
    home_goals: float
    away_goals: float
    home_shots: float
    away_shots: float
    home_shots_on_target: float
    away_shots_on_target: float
    home_corners: float
    away_corners: float
    home_fouls: float
    away_fouls: float
    home_cards: float
    away_cards: float


class PredictionOutput(BaseModel):
    fixture_id: int | None
    generated_at: datetime
    match: str
    model_version: str
    confidence: str
    coverage: dict[str, Any]
    fixture_meta: dict[str, Any] = Field(default_factory=dict)
    expected: ExpectedValues
    result: dict[str, float]
    scorelines: list[dict[str, float | str]]
    goals: dict[str, dict[str, float]]
    both_teams_score: dict[str, float]
    handicaps: dict[str, dict[str, float]]
    counts: dict[str, dict[str, dict[str, float]]]
    player_props: list[dict[str, Any]]
    user_analysis: dict[str, Any] | None = None
    odds_analysis: dict[str, Any] | None = None
