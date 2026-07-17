from __future__ import annotations

import json
import threading
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from betvision_ai.api import ApiClient, ApiError, BudgetExceeded, RequestBudget
from betvision_ai.config import Settings
from betvision_ai.modeling import load_bundle
from betvision_ai.service import daily_predictions, settle_date


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


@dataclass
class AutomationState:
    running: bool = False
    last_started_at: str | None = None
    last_finished_at: str | None = None
    last_error: str | None = None
    dates_processed: list[str] = field(default_factory=list)
    predictions_generated: int = 0
    failures: list[str] = field(default_factory=list)
    requests_spent: int = 0

    def as_dict(self) -> dict[str, Any]:
        return {
            "running": self.running,
            "last_started_at": self.last_started_at,
            "last_finished_at": self.last_finished_at,
            "last_error": self.last_error,
            "dates_processed": self.dates_processed,
            "predictions_generated": self.predictions_generated,
            "failures": self.failures,
            "requests_spent": self.requests_spent,
        }


class AutomationRunner:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.state = AutomationState()
        self.state_path = settings.data_dir / "state" / "automation_status.json"
        self._lock = threading.Lock()

    def status(self) -> dict[str, Any]:
        return self.state.as_dict()

    def run_once(self, *, target_date: date | None = None, force_odds: bool = False) -> dict[str, Any]:
        if not self._lock.acquire(blocking=False):
            return self.state.as_dict() | {"skipped": "automation_already_running"}
        try:
            self.state = AutomationState(
                running=True,
                last_started_at=datetime.now(timezone.utc).isoformat(),
            )
            self._persist()
            bundle = load_bundle(self.settings)
            budget = RequestBudget(self.settings, self.settings.auto_budget)
            client = ApiClient(self.settings, budget)
            failures: list[str] = []
            total_predictions = 0
            processed: list[str] = []

            for item_date in self._date_plan(target_date):
                try:
                    predictions, day_failures = daily_predictions(
                        self.settings,
                        client,
                        bundle,
                        item_date,
                        include_odds=self.settings.auto_include_odds and item_date >= self.settings.today,
                        force_odds=force_odds,
                        include_web_research=self.settings.auto_web_research,
                    )
                    total_predictions += len(predictions)
                    failures.extend(f"{item_date.isoformat()}: {failure}" for failure in day_failures)
                    processed.append(item_date.isoformat())
                    self.state.dates_processed = list(processed)
                    self.state.predictions_generated = total_predictions
                    self.state.failures = list(failures)
                    self.state.requests_spent = client.budget.spent
                    self._persist()
                except BudgetExceeded as exc:
                    failures.append(f"{item_date.isoformat()}: orcamento encerrado ({exc})")
                    break
                except ApiError as exc:
                    failures.append(f"{item_date.isoformat()}: API indisponivel ({exc})")
                    continue
                except Exception as exc:  # pragma: no cover - background resilience
                    failures.append(f"{item_date.isoformat()}: falha inesperada ({exc})")
                    continue

                if self.settings.auto_settle_finished and item_date <= self.settings.today:
                    try:
                        settle_date(
                            self.settings,
                            client,
                            item_date,
                            force=False,
                            details=True,
                        )
                    except FileNotFoundError:
                        continue
                    except BudgetExceeded as exc:
                        failures.append(f"{item_date.isoformat()}: settlement adiado ({exc})")
                        break
                    except ApiError as exc:
                        failures.append(f"{item_date.isoformat()}: settlement indisponivel ({exc})")

            self.state = AutomationState(
                running=False,
                last_started_at=self.state.last_started_at,
                last_finished_at=datetime.now(timezone.utc).isoformat(),
                dates_processed=processed,
                predictions_generated=total_predictions,
                failures=failures,
                requests_spent=client.budget.spent,
            )
            self._persist()
            return self.state.as_dict()
        except Exception as exc:
            self.state.running = False
            self.state.last_error = str(exc)
            self.state.last_finished_at = datetime.now(timezone.utc).isoformat()
            self._persist()
            return self.state.as_dict()
        finally:
            self._lock.release()

    def _date_plan(self, target_date: date | None) -> list[date]:
        if target_date:
            return [target_date]
        today = self.settings.today
        days = [today]
        for offset in range(1, max(0, self.settings.auto_lookahead_days) + 1):
            days.append(today + timedelta(days=offset))
        for offset in range(1, max(0, self.settings.auto_backfill_days) + 1):
            days.append(today - timedelta(days=offset))
        return days

    def _persist(self) -> None:
        _write_json(self.state_path, self.state.as_dict())


class BackgroundAutomation:
    def __init__(self, runner: AutomationRunner) -> None:
        self.runner = runner
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._thread = threading.Thread(target=self._loop, name="betvision-auto", daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=5)

    def _loop(self) -> None:
        if self.runner.settings.auto_run_on_startup:
            self.runner.run_once()
        interval = max(5, self.runner.settings.auto_interval_minutes) * 60
        while not self._stop.wait(interval):
            self.runner.run_once()
