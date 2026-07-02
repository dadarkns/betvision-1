from __future__ import annotations

import pytest
from pydantic import ValidationError

from betvision_ai.schemas import PlayerInput


def test_unknown_player_metric_is_rejected():
    with pytest.raises(ValidationError):
        PlayerInput(
            id="1",
            name="Player",
            stats_per90={"telepathy": 9.0},
        )
