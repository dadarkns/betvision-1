from __future__ import annotations

from dataclasses import replace
from datetime import date, datetime, timezone

import httpx
import pytest

from betvision_ai.modeling import DEFAULT_PRIORS, SIDE_FEATURE_COLUMNS, ModelBundle
from betvision_ai.odds import (
    OddsApiClient,
    OddsQuotaExceeded,
    analyze_event_odds,
    devig_probabilities,
    enrich_predictions_with_odds,
    find_event,
)
from betvision_ai.schemas import ExpectedValues, PredictionOutput


def _prediction() -> PredictionOutput:
    return PredictionOutput(
        fixture_id=1,
        generated_at=datetime.now(timezone.utc),
        match="Brazil x Germany",
        model_version="test",
        confidence="baixa",
        coverage={},
        expected=ExpectedValues(
            home_goals=1.8,
            away_goals=1.0,
            home_shots=14,
            away_shots=10,
            home_shots_on_target=5,
            away_shots_on_target=3,
            home_corners=6,
            away_corners=4,
            home_fouls=12,
            away_fouls=13,
            home_cards=2,
            away_cards=2,
        ),
        result={"home": 60, "draw": 22, "away": 18},
        scorelines=[{"score": "2x1", "probability": 12}],
        goals={
            "1.5": {"over": 78, "under": 22},
            "2.5": {"over": 62, "under": 38},
            "3.5": {"over": 34, "under": 66},
        },
        both_teams_score={"yes": 55, "no": 45},
        handicaps={
            "-1.0": {"win": 38, "push": 24, "loss": 38},
            "+1.0": {"win": 78, "push": 14, "loss": 8},
        },
        counts={},
        player_props=[],
    )


def _event():
    return {
        "id": "event-1",
        "commence_time": "2026-06-25T20:00:00Z",
        "home_team": "Brazil",
        "away_team": "Germany",
        "bookmakers": [
            {
                "key": "book_a",
                "title": "Book A",
                "markets": [
                    {
                        "key": "h2h",
                        "outcomes": [
                            {"name": "Brazil", "price": 2.1},
                            {"name": "Draw", "price": 3.3},
                            {"name": "Germany", "price": 3.6},
                        ],
                    },
                    {
                        "key": "totals",
                        "outcomes": [
                            {"name": "Over", "point": 2.5, "price": 2.05},
                            {"name": "Under", "point": 2.5, "price": 1.82},
                        ],
                    },
                    {
                        "key": "spreads",
                        "outcomes": [
                            {"name": "Brazil", "point": -1.0, "price": 2.8},
                            {"name": "Germany", "point": 1.0, "price": 1.45},
                        ],
                    },
                ],
            }
        ],
    }


def test_devig_probabilities_sum_to_one():
    values = devig_probabilities(
        [
            {"name": "A", "price": 2.0},
            {"name": "B", "price": 2.0},
        ]
    )
    assert sum(values.values()) == pytest.approx(1)


def test_event_matching_and_recommendations():
    event = _event()
    assert find_event([event], "Brazil", "Germany") == event
    analysis = analyze_event_odds(_prediction(), event)
    assert analysis["strongest_market"] is not None
    assert analysis["strongest_market"]["ev"] > 0
    assert analysis["conservative_ticket"] is not None
    assert analysis["aggressive_ticket"] is not None


def test_enrichment_marks_missing_event():
    predictions, failures = enrich_predictions_with_odds([_prediction()], [])
    assert predictions[0].odds_analysis["status"] == "event_not_found"
    assert len(failures) == 1


def test_odds_client_caches_response(settings):
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(
            200,
            json=[_event()],
            headers={
                "x-requests-remaining": "497",
                "x-requests-used": "3",
                "x-requests-last": "3",
            },
        )

    odds_settings = replace(settings, odds_api_key="a" * 32)
    client = OddsApiClient(
        odds_settings,
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    first = client.fetch_date(date(2026, 6, 25))
    second = client.fetch_date(date(2026, 6, 25))
    assert len(first.events) == 1
    assert second.cached is True
    assert calls == 1


def test_odds_quota_error(settings):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(
            401,
            json={"error_code": "OUT_OF_USAGE_CREDITS"},
            headers={"x-requests-remaining": "0", "x-requests-used": "500"},
        )

    odds_settings = replace(settings, odds_api_key="a" * 32)
    client = OddsApiClient(
        odds_settings,
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    with pytest.raises(OddsQuotaExceeded):
        client.fetch_date(date(2026, 6, 25), force=True)
