from __future__ import annotations

import httpx
import pytest

from betvision_ai.api import ApiClient, BudgetExceeded, RateLimitError, RequestBudget


def test_cache_avoids_repeated_request(settings):
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        return httpx.Response(
            200,
            json={"errors": {}, "results": 1, "response": [{"ok": True}]},
            headers={"x-ratelimit-requests-remaining": "99"},
        )

    client = ApiClient(
        settings,
        RequestBudget(settings, 2),
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    first = client.get("fixtures", {"date": "2026-06-24"}, max_age_seconds=3600)
    second = client.get("fixtures", {"date": "2026-06-24"}, max_age_seconds=3600)
    assert first == second
    assert calls == 1
    assert client.budget.spent == 1


def test_budget_blocks_extra_request(settings):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"errors": {}, "response": []})

    client = ApiClient(
        settings,
        RequestBudget(settings, 1),
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    client.get("fixtures", {"date": "2026-06-24"})
    with pytest.raises(BudgetExceeded):
        client.get("fixtures", {"date": "2026-06-25"})


def test_rate_limit_has_specific_error(settings):
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, headers={"retry-after": "60"})

    client = ApiClient(
        settings,
        RequestBudget(settings, 1),
        httpx.Client(transport=httpx.MockTransport(handler)),
    )
    with pytest.raises(RateLimitError, match="60s"):
        client.get("fixtures", {"date": "2026-06-24"})
