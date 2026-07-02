from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import httpx

from betvision_ai.config import Settings


RAW_ROOT = "https://raw.githubusercontent.com/statsbomb/open-data/master"
WORLD_CUP_COMPETITION_ID = 43
WORLD_CUP_SEASONS = {2018: 3, 2022: 106}


@dataclass
class StatsBombImportResult:
    seasons: list[int]
    matches: int
    events_downloaded: int
    lineups_downloaded: int
    skipped: int
    failed: int
    bytes_downloaded: int


def statsbomb_root(settings: Settings) -> Path:
    return settings.data_dir / "sources" / "statsbomb-open-data"


async def _download(
    client: httpx.AsyncClient,
    semaphore: asyncio.Semaphore,
    relative_path: str,
    destination: Path,
    *,
    force: bool,
) -> tuple[str, int]:
    if destination.exists() and destination.stat().st_size > 0 and not force:
        return "skipped", 0
    async with semaphore:
        response = await client.get(f"{RAW_ROOT}/{relative_path}")
        if response.status_code == 404:
            return "missing", 0
        response.raise_for_status()
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(response.content)
        return "downloaded", len(response.content)


async def _import_async(
    settings: Settings,
    seasons: list[int],
    *,
    force: bool,
    concurrency: int,
) -> StatsBombImportResult:
    root = statsbomb_root(settings)
    root.mkdir(parents=True, exist_ok=True)
    limits = httpx.Limits(max_connections=concurrency, max_keepalive_connections=concurrency)
    timeout = httpx.Timeout(90.0)
    headers = {"User-Agent": "BetVision-AI/0.1 (StatsBomb open-data importer)"}
    semaphore = asyncio.Semaphore(concurrency)
    event_count = 0
    lineup_count = 0
    skipped = 0
    failed = 0
    bytes_downloaded = 0
    matches_total = 0

    async with httpx.AsyncClient(limits=limits, timeout=timeout, headers=headers) as client:
        competition_target = root / "data" / "competitions.json"
        status, size = await _download(
            client,
            semaphore,
            "data/competitions.json",
            competition_target,
            force=force,
        )
        bytes_downloaded += size
        skipped += int(status == "skipped")

        for season in seasons:
            if season not in WORLD_CUP_SEASONS:
                raise ValueError(
                    f"Copa {season} não configurada. Disponíveis: {sorted(WORLD_CUP_SEASONS)}"
                )
            season_id = WORLD_CUP_SEASONS[season]
            matches_target = (
                root
                / "data"
                / "matches"
                / str(WORLD_CUP_COMPETITION_ID)
                / f"{season_id}.json"
            )
            status, size = await _download(
                client,
                semaphore,
                f"data/matches/{WORLD_CUP_COMPETITION_ID}/{season_id}.json",
                matches_target,
                force=force,
            )
            bytes_downloaded += size
            skipped += int(status == "skipped")
            matches = json.loads(matches_target.read_text(encoding="utf-8"))
            matches_total += len(matches)

            tasks: list[tuple[str, asyncio.Task[tuple[str, int]]]] = []
            for match in matches:
                match_id = int(match["match_id"])
                for kind in ("events", "lineups"):
                    destination = root / "data" / kind / f"{match_id}.json"
                    task = asyncio.create_task(
                        _download(
                            client,
                            semaphore,
                            f"data/{kind}/{match_id}.json",
                            destination,
                            force=force,
                        )
                    )
                    tasks.append((kind, task))

            for kind, task in tasks:
                try:
                    status, size = await task
                    bytes_downloaded += size
                    if status == "downloaded":
                        if kind == "events":
                            event_count += 1
                        else:
                            lineup_count += 1
                    elif status == "skipped":
                        skipped += 1
                    else:
                        failed += 1
                except (httpx.HTTPError, OSError):
                    failed += 1

    metadata = {
        "source": "StatsBomb Open Data",
        "repository": "https://github.com/statsbomb/open-data",
        "attribution_required": True,
        "competition_id": WORLD_CUP_COMPETITION_ID,
        "seasons": seasons,
        "matches": matches_total,
    }
    (root / "SOURCE.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return StatsBombImportResult(
        seasons=seasons,
        matches=matches_total,
        events_downloaded=event_count,
        lineups_downloaded=lineup_count,
        skipped=skipped,
        failed=failed,
        bytes_downloaded=bytes_downloaded,
    )


def import_statsbomb_world_cups(
    settings: Settings,
    seasons: list[int] | None = None,
    *,
    force: bool = False,
    concurrency: int = 8,
) -> StatsBombImportResult:
    selected = seasons or [2018, 2022]
    return asyncio.run(
        _import_async(
            settings,
            selected,
            force=force,
            concurrency=max(1, min(concurrency, 16)),
        )
    )


def statsbomb_status(settings: Settings) -> dict[str, Any]:
    root = statsbomb_root(settings)
    events = list((root / "data" / "events").glob("*.json")) if root.exists() else []
    lineups = list((root / "data" / "lineups").glob("*.json")) if root.exists() else []
    match_files = (
        list((root / "data" / "matches" / str(WORLD_CUP_COMPETITION_ID)).glob("*.json"))
        if root.exists()
        else []
    )
    return {
        "root": str(root),
        "competition_catalog": (root / "data" / "competitions.json").exists(),
        "match_manifests": len(match_files),
        "event_files": len(events),
        "lineup_files": len(lineups),
        "size_mb": round(
            sum(path.stat().st_size for path in root.rglob("*") if path.is_file())
            / 1024
            / 1024,
            2,
        )
        if root.exists()
        else 0,
    }
