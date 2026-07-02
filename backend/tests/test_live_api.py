from __future__ import annotations

import os

import pytest

from betvision_ai.api import ApiClient, RequestBudget
from betvision_ai.config import get_settings


@pytest.mark.live_api
def test_one_live_fixture_request_only():
    if os.environ.get("RUN_LIVE_API") != "1":
        pytest.skip("Defina RUN_LIVE_API=1 para consumir uma chamada real.")
    settings = get_settings()
    client = ApiClient(settings, RequestBudget(settings, 1))
    payload = client.get(
        "fixtures",
        {"date": settings.today.isoformat(), "timezone": settings.timezone},
        namespace="pytest-live",
        force=True,
    )
    assert "response" in payload
    assert client.budget.spent == 1
