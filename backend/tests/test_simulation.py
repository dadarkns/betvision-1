from __future__ import annotations

from datetime import datetime, timezone

from betvision_ai.features import match_to_features
from betvision_ai.modeling import DEFAULT_PRIORS, SIDE_FEATURE_COLUMNS, ModelBundle
from betvision_ai.schemas import MatchInput, PlayerInput, TeamInput, TeamStatsInput
from betvision_ai.simulation import simulate_match


def _bundle():
    return ModelBundle(
        version="test",
        trained_at=datetime.now(timezone.utc).isoformat(),
        feature_columns=SIDE_FEATURE_COLUMNS,
        models={},
        priors=dict(DEFAULT_PRIORS),
        training_summary={"matches": 64, "small_sample_warning": True},
    )


def _match(with_player=False):
    players = []
    if with_player:
        players = [
            PlayerInput(
                id="p1",
                name="Jogador",
                position="F",
                expected_minutes=90,
                stats_per90={
                    "goals": 0.5,
                    "assists": 0.2,
                    "cards": 0.1,
                    "shots": 2.5,
                    "shots_on_target": 1.0,
                    "fouls": 0.8,
                },
            )
        ]
    return MatchInput(
        fixture_id=100,
        date="2026-06-24T19:00:00Z",
        home=TeamInput(id="a", name="A", players=players),
        away=TeamInput(id="b", name="B"),
    )


def test_monte_carlo_is_deterministic_and_probabilities_close():
    match = _match()
    bundle = _bundle()
    first = simulate_match(match, bundle, match_to_features(match), samples=20_000, seed=7)
    second = simulate_match(match, bundle, match_to_features(match), samples=20_000, seed=7)
    assert first.result == second.result
    assert sum(first.result.values()) == 100
    assert first.expected.home_shots_on_target <= first.expected.home_shots
    for values in first.handicaps.values():
        assert round(sum(values.values()), 2) == 100


def test_player_props_only_when_stats_exist():
    empty = _match(False)
    populated = _match(True)
    bundle = _bundle()
    assert not simulate_match(empty, bundle, match_to_features(empty), samples=1000, seed=1).player_props
    props = simulate_match(populated, bundle, match_to_features(populated), samples=1000, seed=1).player_props
    assert props[0]["probabilities"]["goal"] > 0
    assert props[0]["source"] == "manual_per90_poisson"


def test_analytical_poisson_respects_clear_strength_difference():
    match = MatchInput(
        fixture_id=200,
        date="2026-06-24T19:00:00Z",
        home=TeamInput(
            id="weak",
            name="Weak",
            stats=TeamStatsInput(
                games=2,
                goals_for_avg=0.4,
                goals_against_avg=1.8,
                win_rate=0,
                draw_rate=0,
            ),
        ),
        away=TeamInput(
            id="strong",
            name="Strong",
            stats=TeamStatsInput(
                games=2,
                goals_for_avg=2.2,
                goals_against_avg=0.4,
                win_rate=1,
                draw_rate=0,
            ),
        ),
    )
    prediction = simulate_match(
        match,
        _bundle(),
        match_to_features(match),
        samples=20_000,
        seed=2,
    )
    assert prediction.expected.away_goals > prediction.expected.home_goals
    assert prediction.expected.away_shots > prediction.expected.home_shots
    assert prediction.expected.away_shots_on_target > prediction.expected.home_shots_on_target
    assert prediction.expected.home_cards > prediction.expected.away_cards
    assert prediction.result["away"] > prediction.result["home"]
