from __future__ import annotations

import hashlib
import json
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from betvision_ai.config import Settings, UsageLedger


class ApiError(RuntimeError):
    pass


class BudgetExceeded(ApiError):
    pass


class RateLimitError(ApiError):
    pass


@dataclass
class RequestBudget:
    settings: Settings
    max_requests: int
    spent: int = 0
    provider_remaining: int | None = None

    def before_request(self, ledger: UsageLedger) -> None:
        if self.spent >= self.max_requests:
            raise BudgetExceeded(f"Orçamento desta execução esgotado ({self.max_requests} chamadas).")
        known_used = ledger.used_today()
        if known_used >= self.settings.daily_limit - self.settings.reserve_requests:
            raise BudgetExceeded(
                f"Reserva protegida: {known_used}/{self.settings.daily_limit} chamadas registradas hoje."
            )
        if self.provider_remaining is not None and self.provider_remaining <= self.settings.reserve_requests:
            raise BudgetExceeded(
                f"API informou apenas {self.provider_remaining} chamadas restantes; reserva mínima é "
                f"{self.settings.reserve_requests}."
            )

    def register(self, ledger: UsageLedger, response: httpx.Response) -> None:
        self.spent += 1
        ledger.increment()
        header = (
            response.headers.get("x-ratelimit-requests-remaining")
            or response.headers.get("x-ratelimit-remaining")
        )
        if header and header.isdigit():
            self.provider_remaining = int(header)


class ApiClient:
    def __init__(
        self,
        settings: Settings,
        budget: RequestBudget | None = None,
        http_client: httpx.Client | None = None,
    ):
        if not settings.configured:
            raise ApiError("Configure APISPORTS_KEY ou EXPO_PUBLIC_APISPORTS_KEY no arquivo .env.")
        self.settings = settings
        self.budget = budget or RequestBudget(settings, settings.default_budget)
        self.ledger = UsageLedger(settings)
        self.http = http_client or httpx.Client(timeout=20.0)
        self._last_request_at: float | None = None

    def _cache_path(self, path: str, params: dict[str, Any], namespace: str) -> Path:
        normalized = json.dumps({"path": path, "params": params, "namespace": namespace}, sort_keys=True)
        digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
        return self.settings.data_dir / "cache" / f"{digest}.json"

    @staticmethod
    def _cache_fresh(cache: dict, max_age_seconds: int | None) -> bool:
        if max_age_seconds is None:
            return True
        fetched_at = datetime.fromisoformat(cache["fetched_at"])
        age = datetime.now(timezone.utc) - fetched_at
        return age.total_seconds() <= max_age_seconds

    def get(
        self,
        path: str,
        params: dict[str, Any] | None = None,
        *,
        max_age_seconds: int | None = None,
        namespace: str = "default",
        force: bool = False,
    ) -> dict:
        params = {key: value for key, value in (params or {}).items() if value is not None}
        cache_path = self._cache_path(path, params, namespace)
        if cache_path.exists() and not force:
            try:
                cached = json.loads(cache_path.read_text(encoding="utf-8"))
                if self._cache_fresh(cached, max_age_seconds):
                    return cached["payload"]
            except (json.JSONDecodeError, KeyError, ValueError, OSError):
                pass

        self.budget.before_request(self.ledger)
        if self._last_request_at is not None and self.settings.request_interval_seconds > 0:
            elapsed = time.monotonic() - self._last_request_at
            remaining_wait = self.settings.request_interval_seconds - elapsed
            if remaining_wait > 0:
                time.sleep(remaining_wait)
        response = self.http.get(
            f"{self.settings.api_base_url}/{path.lstrip('/')}",
            params=params,
            headers={"x-apisports-key": self.settings.api_key},
        )
        self._last_request_at = time.monotonic()
        self.budget.register(self.ledger, response)
        if response.status_code == 429:
            retry_after = response.headers.get("retry-after")
            suffix = f" Tente novamente em {retry_after}s." if retry_after else ""
            raise RateLimitError(f"Limite de frequência da API atingido.{suffix}")
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise ApiError(f"API respondeu HTTP {response.status_code}.") from exc

        payload = response.json()
        errors = payload.get("errors")
        if errors:
            raise ApiError(f"API retornou erro em {path}: {json.dumps(errors, ensure_ascii=False)}")

        envelope = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "path": path,
            "params": params,
            "payload": payload,
        }
        cache_path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2), encoding="utf-8")
        return payload

    def cached_response(
        self, path: str, params: dict[str, Any], namespace: str = "default"
    ) -> dict | None:
        path_obj = self._cache_path(path, params, namespace)
        if not path_obj.exists():
            return None
        try:
            return json.loads(path_obj.read_text(encoding="utf-8"))["payload"]
        except (json.JSONDecodeError, KeyError, OSError):
            return None
