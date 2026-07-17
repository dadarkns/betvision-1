from __future__ import annotations

import json
import os
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from zoneinfo import ZoneInfo


BACKEND_ROOT = Path(__file__).resolve().parents[1]
WORKSPACE_ROOT = BACKEND_ROOT.parent


def _read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip().strip("\"'")
    return values


def _env(name: str, default: str = "") -> str:
    if name in os.environ:
        return os.environ[name].strip()
    workspace = _read_env_file(WORKSPACE_ROOT / ".env")
    frontend = _read_env_file(WORKSPACE_ROOT / "frontend" / ".env")
    backend = _read_env_file(BACKEND_ROOT / ".env")
    return backend.get(name, frontend.get(name, workspace.get(name, default))).strip()


def _env_bool(name: str, default: bool) -> bool:
    raw = _env(name, "1" if default else "0").lower()
    return raw in {"1", "true", "yes", "y", "on", "sim"}


def _env_int_tuple(name: str, default: tuple[int, ...] = ()) -> tuple[int, ...]:
    raw = _env(name)
    if not raw:
        return default
    values: list[int] = []
    for item in raw.replace(";", ",").split(","):
        item = item.strip()
        if not item:
            continue
        values.append(int(item))
    return tuple(dict.fromkeys(values))


def _env_str_tuple(name: str, default: tuple[str, ...] = ()) -> tuple[str, ...]:
    raw = _env(name)
    if not raw:
        return default
    values = [item.strip() for item in raw.replace(";", ",").split(",") if item.strip()]
    return tuple(dict.fromkeys(values))


@dataclass(frozen=True)
class Settings:
    api_base_url: str
    api_key: str
    data_dir: Path
    timezone: str = "America/Fortaleza"
    world_cup_league_id: int = 1
    serie_b_league_id: int = 72
    default_budget: int = 20
    daily_limit: int = 100
    reserve_requests: int = 10
    monte_carlo_samples: int = 100_000
    random_seed: int = 20260624
    request_interval_seconds: float = 0.0
    odds_api_key: str = ""
    odds_api_base_url: str = "https://api.the-odds-api.com/v4"
    odds_api_region: str = "eu"
    odds_api_sport: str = "soccer_fifa_world_cup"
    include_all_leagues: bool = True
    league_ids: tuple[int, ...] = ()
    auto_enabled: bool = True
    auto_run_on_startup: bool = True
    auto_interval_minutes: int = 30
    auto_lookahead_days: int = 7
    auto_backfill_days: int = 2
    auto_budget: int = 60
    auto_settle_finished: bool = True
    auto_include_odds: bool = True
    auto_web_research: bool = True
    auto_web_research_limit: int = 4
    web_research_timeout_seconds: float = 3.0
    web_research_base_url: str = "https://api.duckduckgo.com"
    web_fixtures_enabled: bool = True
    sportsdb_api_key: str = "123"
    sportsdb_base_url: str = "https://www.thesportsdb.com/api/v1/json"
    sportsdb_timeout_seconds: float = 8.0
    sportsdb_priority_league_ids: tuple[str, ...] = ("4429",)

    @property
    def configured(self) -> bool:
        return len(self.api_key) > 8 and self.api_base_url.startswith("http")

    @property
    def odds_configured(self) -> bool:
        return len(self.odds_api_key) > 16 and self.odds_api_base_url.startswith("http")

    @property
    def prediction_league_ids(self) -> tuple[int, ...]:
        if self.include_all_leagues:
            return ()
        if self.league_ids:
            return self.league_ids
        return (
            1,    # Copa do Mundo
            2,    # Champions League
            3,    # Europa League
            11,   # Sul-Americana
            13,   # Libertadores
            39,   # Premier League
            61,   # Ligue 1
            71,   # Brasileirão Série A
            72,   # Brasileirão Série B
            73,   # Copa do Brasil
            78,   # Bundesliga
            135,  # Serie A italiana
            140,  # LaLiga
        )

    @property
    def today(self) -> date:
        from datetime import datetime

        return datetime.now(ZoneInfo(self.timezone)).date()

    def ensure_directories(self) -> None:
        for name in ("cache", "raw", "processed", "models", "outputs", "metrics", "state"):
            (self.data_dir / name).mkdir(parents=True, exist_ok=True)


def get_settings() -> Settings:
    data_dir = Path(_env("BETVISION_AI_DATA_DIR", str(BACKEND_ROOT / "data"))).expanduser().resolve()
    settings = Settings(
        api_base_url=_env("APISPORTS_BASE_URL", _env("EXPO_PUBLIC_APISPORTS_BASE_URL", "https://v3.football.api-sports.io")).rstrip("/"),
        api_key=_env("APISPORTS_KEY", _env("EXPO_PUBLIC_APISPORTS_KEY")),
        data_dir=data_dir,
        timezone=_env("BETVISION_AI_TIMEZONE", "America/Fortaleza"),
        default_budget=int(_env("BETVISION_AI_REQUEST_BUDGET", "20")),
        daily_limit=int(_env("BETVISION_AI_DAILY_LIMIT", "100")),
        reserve_requests=int(_env("BETVISION_AI_REQUEST_RESERVE", "10")),
        monte_carlo_samples=int(_env("BETVISION_AI_MONTE_CARLO_SAMPLES", "100000")),
        random_seed=int(_env("BETVISION_AI_RANDOM_SEED", "20260624")),
        request_interval_seconds=float(_env("BETVISION_AI_REQUEST_INTERVAL_SECONDS", "6.2")),
        odds_api_key=_env("ODDS_API_KEY"),
        odds_api_base_url=_env(
            "ODDS_API_BASE_URL",
            "https://api.the-odds-api.com/v4",
        ).rstrip("/"),
        odds_api_region=_env("ODDS_API_REGION", "eu"),
        odds_api_sport=_env("ODDS_API_SPORT", "soccer_fifa_world_cup"),
        include_all_leagues=_env_bool("BETVISION_AI_INCLUDE_ALL_LEAGUES", True),
        league_ids=_env_int_tuple("BETVISION_AI_LEAGUE_IDS"),
        auto_enabled=_env_bool("BETVISION_AI_AUTO_ENABLED", True),
        auto_run_on_startup=_env_bool("BETVISION_AI_AUTO_RUN_ON_STARTUP", True),
        auto_interval_minutes=int(_env("BETVISION_AI_AUTO_INTERVAL_MINUTES", "30")),
        auto_lookahead_days=int(_env("BETVISION_AI_AUTO_LOOKAHEAD_DAYS", "7")),
        auto_backfill_days=int(_env("BETVISION_AI_AUTO_BACKFILL_DAYS", "2")),
        auto_budget=int(_env("BETVISION_AI_AUTO_BUDGET", "60")),
        auto_settle_finished=_env_bool("BETVISION_AI_AUTO_SETTLE_FINISHED", True),
        auto_include_odds=_env_bool("BETVISION_AI_AUTO_INCLUDE_ODDS", True),
        auto_web_research=_env_bool("BETVISION_AI_AUTO_WEB_RESEARCH", True),
        auto_web_research_limit=int(_env("BETVISION_AI_AUTO_WEB_RESEARCH_LIMIT", "4")),
        web_research_timeout_seconds=float(_env("BETVISION_AI_WEB_RESEARCH_TIMEOUT_SECONDS", "3.0")),
        web_research_base_url=_env(
            "BETVISION_AI_WEB_RESEARCH_BASE_URL",
            "https://api.duckduckgo.com",
        ).rstrip("/"),
        web_fixtures_enabled=_env_bool("BETVISION_AI_WEB_FIXTURES_ENABLED", True),
        sportsdb_api_key=_env("BETVISION_AI_SPORTSDB_API_KEY", "123"),
        sportsdb_base_url=_env(
            "BETVISION_AI_SPORTSDB_BASE_URL",
            "https://www.thesportsdb.com/api/v1/json",
        ).rstrip("/"),
        sportsdb_timeout_seconds=float(_env("BETVISION_AI_SPORTSDB_TIMEOUT_SECONDS", "8.0")),
        sportsdb_priority_league_ids=_env_str_tuple(
            "BETVISION_AI_SPORTSDB_PRIORITY_LEAGUE_IDS",
            ("4429",),
        ),
    )
    settings.ensure_directories()
    return settings


class UsageLedger:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.path = settings.data_dir / "state" / "api_usage.json"

    def _load(self) -> dict:
        if not self.path.exists():
            return {}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return {}

    def used_today(self) -> int:
        payload = self._load()
        key = self.settings.today.isoformat()
        return int(payload.get(key, 0))

    def increment(self) -> int:
        payload = self._load()
        key = self.settings.today.isoformat()
        payload = {key: int(payload.get(key, 0)) + 1}
        self.path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        return payload[key]
