from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from betvision_ai.config import Settings
from betvision_ai.schemas import PredictionOutput


@dataclass(frozen=True)
class WebResearchResult:
    status: str
    query: str
    summary: str = ""
    sources: tuple[dict[str, str], ...] = ()
    fetched_at: str = ""
    message: str = ""

    def as_dict(self) -> dict[str, Any]:
        return {
            "status": self.status,
            "query": self.query,
            "summary": self.summary,
            "sources": list(self.sources),
            "fetched_at": self.fetched_at,
            "message": self.message,
        }


class WebResearchClient:
    def __init__(
        self,
        settings: Settings,
        http_client: httpx.Client | None = None,
    ) -> None:
        self.settings = settings
        self.http = http_client or httpx.Client(timeout=settings.web_research_timeout_seconds)

    def _cache_path(self, query: str) -> Path:
        digest = hashlib.sha256(query.lower().encode("utf-8")).hexdigest()
        return self.settings.data_dir / "cache" / "web_research" / f"{digest}.json"

    def search_match(self, prediction: PredictionOutput, *, force: bool = False) -> WebResearchResult:
        meta = prediction.fixture_meta or {}
        league = str(meta.get("league_name") or "")
        query = " ".join(
            part
            for part in (
                prediction.match,
                league,
                "team news injuries form preview statistics",
            )
            if part
        )
        cache_path = self._cache_path(query)
        if cache_path.exists() and not force:
            try:
                cached = json.loads(cache_path.read_text(encoding="utf-8"))
                return WebResearchResult(**cached)
            except (json.JSONDecodeError, TypeError, OSError):
                pass

        try:
            payload = self.http.get(
                self.settings.web_research_base_url,
                params={
                    "q": query,
                    "format": "json",
                    "no_html": "1",
                    "skip_disambig": "1",
                },
            ).json()
        except Exception as exc:  # pragma: no cover - network resilience path
            return WebResearchResult(
                status="error",
                query=query,
                message=f"Pesquisa web indisponivel: {exc}",
            )

        sources = _extract_sources(payload)
        summary = str(payload.get("AbstractText") or "").strip()
        if not summary and sources:
            summary = sources[0].get("text", "")
        result = WebResearchResult(
            status="ok" if summary or sources else "empty",
            query=query,
            summary=summary,
            sources=tuple(sources[:5]),
            fetched_at=datetime.now(timezone.utc).isoformat(),
        )
        cache_path.parent.mkdir(parents=True, exist_ok=True)
        cache_path.write_text(
            json.dumps(result.as_dict(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return result


def _extract_sources(payload: dict[str, Any]) -> list[dict[str, str]]:
    output: list[dict[str, str]] = []
    if payload.get("AbstractURL"):
        output.append(
            {
                "title": str(payload.get("Heading") or "Resumo"),
                "url": str(payload.get("AbstractURL")),
                "text": str(payload.get("AbstractText") or ""),
            }
        )
    for topic in payload.get("RelatedTopics") or []:
        if "Topics" in topic:
            for child in topic.get("Topics") or []:
                _append_topic(output, child)
        else:
            _append_topic(output, topic)
    deduped: dict[str, dict[str, str]] = {}
    for item in output:
        url = item.get("url")
        if url:
            deduped[url] = item
    return list(deduped.values())


def _append_topic(output: list[dict[str, str]], topic: dict[str, Any]) -> None:
    url = str(topic.get("FirstURL") or "")
    if not url:
        return
    output.append(
        {
            "title": str(topic.get("Text") or "").split(" - ", 1)[0][:120],
            "url": url,
            "text": str(topic.get("Text") or ""),
        }
    )


def enrich_prediction_with_web_research(
    prediction: PredictionOutput,
    research: WebResearchResult,
) -> PredictionOutput:
    payload = prediction.model_dump(mode="json")
    coverage = dict(payload.get("coverage") or {})
    coverage["web_research"] = {
        "status": research.status,
        "sources": len(research.sources),
    }
    payload["coverage"] = coverage
    user_analysis = dict(payload.get("user_analysis") or {})
    user_analysis["web_research"] = research.as_dict()
    if research.status == "ok" and research.summary:
        user_analysis["context_note"] = research.summary[:500]
    payload["user_analysis"] = user_analysis
    return PredictionOutput.model_validate(payload)
