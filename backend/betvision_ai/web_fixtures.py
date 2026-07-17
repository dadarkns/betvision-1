from __future__ import annotations

import hashlib
import json
from datetime import date
from pathlib import Path
from typing import Any

import httpx

from betvision_ai.config import Settings


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _read_json(path: Path) -> Any | None:
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return None


class WebFixtureClient:
    def __init__(self, settings: Settings, http_client: httpx.Client | None = None) -> None:
        self.settings = settings
        self.http = http_client or httpx.Client(timeout=settings.sportsdb_timeout_seconds)

    def fetch_date(self, target_date: date, *, force: bool = False) -> list[dict[str, Any]]:
        cache_path = self._cache_path(target_date)
        if cache_path.exists() and not force:
            cached = _read_json(cache_path)
            if isinstance(cached, list):
                return cached

        events = []
        for league_id in self.settings.sportsdb_priority_league_ids:
            events.extend(self._fetch_events(target_date, {"l": league_id}))
        events.extend(self._fetch_events(target_date, {"s": "Soccer"}))
        fixtures_by_id = {}
        for event in events:
            if not event.get("strHomeTeam") or not event.get("strAwayTeam"):
                continue
            fixture = _event_to_fixture(event)
            fixtures_by_id[int(fixture["fixture"]["id"])] = fixture
        fixtures = list(fixtures_by_id.values())
        _write_json(cache_path, fixtures)
        return fixtures

    def _fetch_events(self, target_date: date, params: dict[str, str]) -> list[dict[str, Any]]:
        url = f"{self.settings.sportsdb_base_url}/{self.settings.sportsdb_api_key}/eventsday.php"
        response = self.http.get(
            url,
            params={"d": target_date.isoformat(), **params},
        )
        response.raise_for_status()
        payload = response.json()
        return payload.get("events") or []

    def _cache_path(self, target_date: date) -> Path:
        cache_key = {
            "date": target_date.isoformat(),
            "priority": self.settings.sportsdb_priority_league_ids,
        }
        digest = hashlib.sha256(json.dumps(cache_key, sort_keys=True).encode("utf-8")).hexdigest()[:16]
        return self.settings.data_dir / "cache" / "web_fixtures" / f"{target_date.isoformat()}_{digest}.json"


def _event_to_fixture(event: dict[str, Any]) -> dict[str, Any]:
    fixture_id = _int(event.get("idAPIfootball")) or _int(event.get("idEvent")) or 0
    league_id = _int(event.get("idLeague")) or 0
    home_id = _int(event.get("idHomeTeam")) or _stable_id(event.get("strHomeTeam"))
    away_id = _int(event.get("idAwayTeam")) or _stable_id(event.get("strAwayTeam"))
    starts_at = _event_datetime(event)
    return {
        "fixture": {
            "id": fixture_id,
            "date": starts_at,
            "status": {"short": event.get("strStatus") or "NS"},
            "venue": {"name": event.get("strVenue") or "A confirmar"},
        },
        "league": {
            "id": league_id,
            "name": event.get("strLeague") or "Web Soccer",
            "logo": event.get("strLeagueBadge") or "",
            "season": _int(event.get("strSeason")),
            "round": f"Rodada {event.get('intRound')}" if event.get("intRound") else "Agenda web",
        },
        "teams": {
            "home": {
                "id": home_id,
                "name": event.get("strHomeTeam") or "Mandante",
                "logo": event.get("strHomeTeamBadge") or "",
            },
            "away": {
                "id": away_id,
                "name": event.get("strAwayTeam") or "Visitante",
                "logo": event.get("strAwayTeamBadge") or "",
            },
        },
        "goals": {
            "home": _int(event.get("intHomeScore")),
            "away": _int(event.get("intAwayScore")),
        },
        "_source": "thesportsdb",
    }


def _event_datetime(event: dict[str, Any]) -> str:
    if event.get("strTimestamp"):
        raw = str(event["strTimestamp"])
        return raw if raw.endswith(("Z", "+00:00")) else f"{raw}+00:00"
    day = event.get("dateEventLocal") or event.get("dateEvent") or "1970-01-01"
    time = event.get("strTimeLocal") or event.get("strTime") or "12:00:00"
    return f"{day}T{time}"


def _int(value: Any) -> int | None:
    try:
        if value is None or value == "":
            return None
        return int(value)
    except (TypeError, ValueError):
        return None


def _stable_id(value: Any) -> int:
    digest = hashlib.sha256(str(value).encode("utf-8")).hexdigest()
    return int(digest[:10], 16)
