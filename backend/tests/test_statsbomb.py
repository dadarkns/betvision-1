from __future__ import annotations

import json

from betvision_ai.statsbomb import statsbomb_status


def test_statsbomb_status_counts_local_files(settings):
    root = settings.data_dir / "sources" / "statsbomb-open-data"
    (root / "data" / "events").mkdir(parents=True)
    (root / "data" / "lineups").mkdir(parents=True)
    (root / "data" / "matches" / "43").mkdir(parents=True)
    (root / "data" / "events" / "1.json").write_text("[]", encoding="utf-8")
    (root / "data" / "lineups" / "1.json").write_text("[]", encoding="utf-8")
    (root / "data" / "matches" / "43" / "106.json").write_text(
        json.dumps([]),
        encoding="utf-8",
    )
    status = statsbomb_status(settings)
    assert status["event_files"] == 1
    assert status["lineup_files"] == 1
    assert status["match_manifests"] == 1
