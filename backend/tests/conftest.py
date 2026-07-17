from __future__ import annotations

from pathlib import Path

import pytest

from betvision_ai.config import Settings


@pytest.fixture
def settings(tmp_path: Path) -> Settings:
    value = Settings(
        api_base_url="https://example.test",
        api_key="test-api-key-long-enough",
        data_dir=tmp_path / "data",
        default_budget=20,
        daily_limit=100,
        reserve_requests=10,
        monte_carlo_samples=5000,
        random_seed=42,
        auto_web_research=False,
    )
    value.ensure_directories()
    return value
