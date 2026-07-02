from __future__ import annotations

from datetime import date, datetime, timezone

import httpx

from betvision_ai.api import ApiClient, RequestBudget
from betvision_ai.modeling import DEFAULT_PRIORS, SIDE_FEATURE_COLUMNS, ModelBundle
from betvision_ai.service import daily_predictions, period_predictions


def test_daily_repeated_run_uses_cache_and_saved_prediction(settings):
    calls = []
    fixture = {
        "fixture": {
            "id": 123,
            "date": "2026-06-24T19:00:00-03:00",
            "status": {"short": "NS"},
        },
        "league": {"id": 1, "name": "World Cup", "round": "Group Stage"},
        "teams": {
            "home": {"id": 10, "name": "A"},
            "away": {"id": 20, "name": "B"},
        },
        "goals": {"home": None, "away": None},
    }

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(str(request.url))
        if request.url.path.endswith("/fixtures"):
            return httpx.Response(200, json={"errors": {}, "response": [fixture]})
        return httpx.Response(
            200,
            json={
                "errors": {},
                "response": [
                    {
                        "predictions": {"percent": {"home": "90%"}},
                        "teams": {
                            "home": {"last_5": {"played": 2}},
                            "away": {"last_5": {"played": 2}},
                        },
                    }
                ],
            },
        )

    client = ApiClient(
        settings,
        RequestBudget(settings, 10),
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    bundle = ModelBundle(
        version="test",
        trained_at=datetime.now(timezone.utc).isoformat(),
        feature_columns=SIDE_FEATURE_COLUMNS,
        models={},
        priors=dict(DEFAULT_PRIORS),
        training_summary={"matches": 64, "small_sample_warning": True},
    )
    target = date(2026, 6, 24)
    first, _ = daily_predictions(settings, client, bundle, target)
    calls_after_first = len(calls)
    second, _ = daily_predictions(settings, client, bundle, target)
    assert len(first) == len(second) == 1
    assert len(calls) == calls_after_first == 2


def test_period_predictions_fetches_range_and_reuses_cache(settings):
    calls = []
    fixtures = [
        {
            "fixture": {
                "id": 201,
                "date": "2026-06-26T16:00:00-03:00",
                "status": {"short": "NS"},
            },
            "league": {"id": 1, "name": "World Cup", "round": "Group Stage"},
            "teams": {
                "home": {"id": 10, "name": "A"},
                "away": {"id": 20, "name": "B"},
            },
            "goals": {"home": None, "away": None},
        },
        {
            "fixture": {
                "id": 202,
                "date": "2026-06-28T19:00:00-03:00",
                "status": {"short": "NS"},
            },
            "league": {"id": 1, "name": "World Cup", "round": "Group Stage"},
            "teams": {
                "home": {"id": 30, "name": "C"},
                "away": {"id": 40, "name": "D"},
            },
            "goals": {"home": None, "away": None},
        },
    ]

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(str(request.url))
        if request.url.path.endswith("/fixtures"):
            return httpx.Response(200, json={"errors": {}, "response": fixtures})
        return httpx.Response(
            200,
            json={
                "errors": {},
                "response": [
                    {
                        "teams": {
                            "home": {"last_5": {"played": 2}},
                            "away": {"last_5": {"played": 2}},
                        },
                    }
                ],
            },
        )

    client = ApiClient(
        settings,
        RequestBudget(settings, 10),
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    bundle = ModelBundle(
        version="test",
        trained_at=datetime.now(timezone.utc).isoformat(),
        feature_columns=SIDE_FEATURE_COLUMNS,
        models={},
        priors=dict(DEFAULT_PRIORS),
        training_summary={"matches": 64, "small_sample_warning": True},
    )
    first, failures, summary = period_predictions(
        settings,
        client,
        bundle,
        start_date=date(2026, 6, 26),
        end_date=date(2026, 7, 2),
        season=2026,
    )
    calls_after_first = len(calls)
    second, _, second_summary = period_predictions(
        settings,
        client,
        bundle,
        start_date=date(2026, 6, 26),
        end_date=date(2026, 7, 2),
        season=2026,
    )

    assert failures == []
    assert len(first) == len(second) == 2
    assert summary["fixtures"] == second_summary["fixtures"] == 2
    assert summary["sources"]["api_predictions"] == 2
    assert second_summary["sources"]["saved"] == 2
    assert calls_after_first == 3
    assert len(calls) == calls_after_first
    assert (settings.data_dir / "outputs" / "predictions" / "2026-06-26.json").exists()
    assert (settings.data_dir / "outputs" / "predictions" / "2026-06-28.json").exists()
