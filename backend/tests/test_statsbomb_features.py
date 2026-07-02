from betvision_ai.collection import _statsbomb_event_totals


def test_statsbomb_events_are_converted_to_team_counts():
    events = [
        {"team": {"id": 1}, "type": {"name": "Shot"}, "shot": {"outcome": {"name": "Goal"}}},
        {"team": {"id": 1}, "type": {"name": "Shot"}, "shot": {"outcome": {"name": "Off T"}}},
        {"team": {"id": 1}, "type": {"name": "Pass"}, "pass": {"type": {"name": "Corner"}}},
        {
            "team": {"id": 2},
            "type": {"name": "Foul Committed"},
            "foul_committed": {"card": {"name": "Yellow Card"}},
        },
        {
            "team": {"id": 2},
            "type": {"name": "Bad Behaviour"},
            "bad_behaviour": {"card": {"name": "Red Card"}},
        },
    ]
    totals = _statsbomb_event_totals(events, (1, 2))
    assert totals[1]["shots"] == 2
    assert totals[1]["shots_on_target"] == 1
    assert totals[1]["corners"] == 1
    assert totals[2]["fouls"] == 1
    assert totals[2]["cards"] == 3
