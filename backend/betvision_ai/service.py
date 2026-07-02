from __future__ import annotations

import json
import re
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from betvision_ai.api import ApiClient, ApiError, BudgetExceeded, RateLimitError
from betvision_ai.config import Settings
from betvision_ai.evaluation import (
    aggregate_metrics,
    append_history,
    detailed_market_metrics,
    settle_prediction,
)
from betvision_ai.features import match_from_api_fixture, match_to_features
from betvision_ai.modeling import ModelBundle
from betvision_ai.odds import (
    OddsApiClient,
    OddsApiError,
    OddsQuotaExceeded,
    enrich_predictions_with_odds,
)
from betvision_ai.schemas import MatchInput, PredictionOutput
from betvision_ai.simulation import simulate_match


def _load_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def _write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def predict_one(
    settings: Settings,
    bundle: ModelBundle,
    match: MatchInput,
    *,
    samples: int | None = None,
) -> PredictionOutput:
    return simulate_match(
        match,
        bundle,
        match_to_features(match),
        samples=samples or settings.monte_carlo_samples,
        seed=settings.random_seed,
    )


def daily_predictions(
    settings: Settings,
    client: ApiClient,
    bundle: ModelBundle,
    target_date: date,
    *,
    include_odds: bool = True,
    force_odds: bool = False,
) -> tuple[list[PredictionOutput], list[str]]:
    output_path = settings.data_dir / "outputs" / "predictions" / f"{target_date.isoformat()}.json"
    existing_payload = _load_json(output_path, {"predictions": []})
    existing = {
        int(item["fixture_id"]): item
        for item in existing_payload.get("predictions", [])
        if item.get("fixture_id") is not None
    }
    fixture_payload = client.get(
        "fixtures",
        {"date": target_date.isoformat(), "timezone": settings.timezone},
        max_age_seconds=6 * 60 * 60,
        namespace="daily",
    )
    fixtures = [
        item
        for item in fixture_payload.get("response", [])
        if int(item.get("league", {}).get("id", 0)) in settings.prediction_league_ids
    ]
    predictions: list[PredictionOutput] = []
    failures: list[str] = []
    for fixture in fixtures:
        fixture_id = int(fixture["fixture"]["id"])
        if (
            fixture_id in existing
            and existing[fixture_id].get("user_analysis")
            and existing[fixture_id].get("model_version") == bundle.version
            and existing[fixture_id].get("fixture_meta")
        ):
            predictions.append(PredictionOutput.model_validate(existing[fixture_id]))
            continue
        prediction_row: dict | None = None
        try:
            payload = client.get(
                "predictions",
                {"fixture": fixture_id},
                max_age_seconds=12 * 60 * 60,
                namespace="daily",
            )
            prediction_row = (payload.get("response") or [None])[0]
        except RateLimitError as exc:
            failures.append(f"{fixture_id}: {exc}")
            match = match_from_api_fixture(fixture, None)
            predictions.append(predict_one(settings, bundle, match))
            for remaining in fixtures[fixtures.index(fixture) + 1 :]:
                remaining_id = int(remaining["fixture"]["id"])
                if remaining_id in existing:
                    predictions.append(PredictionOutput.model_validate(existing[remaining_id]))
                    continue
                failures.append(f"{remaining_id}: consulta adiada após rate-limit")
                predictions.append(
                    predict_one(settings, bundle, match_from_api_fixture(remaining, None))
                )
            break
        except ApiError as exc:
            failures.append(f"{fixture_id}: {exc}")
        match = match_from_api_fixture(fixture, prediction_row)
        predictions.append(predict_one(settings, bundle, match))

    odds_status: dict[str, Any] = {
        "configured": settings.odds_configured,
        "requested": include_odds,
    }
    if include_odds and settings.odds_configured:
        try:
            odds_result = OddsApiClient(settings).fetch_date(
                target_date,
                force=force_odds,
            )
            predictions, odds_failures = enrich_predictions_with_odds(
                predictions,
                odds_result.events,
            )
            failures.extend(odds_failures)
            odds_status.update(
                {
                    "status": "ok",
                    "events": len(odds_result.events),
                    "remaining": odds_result.remaining,
                    "used": odds_result.used,
                    "last_cost": odds_result.last_cost,
                    "cached": odds_result.cached,
                }
            )
        except OddsQuotaExceeded as exc:
            odds_status.update({"status": "quota_exceeded", "message": str(exc)})
            failures.append(str(exc))
        except OddsApiError as exc:
            odds_status.update({"status": "error", "message": str(exc)})
            failures.append(str(exc))
    elif include_odds:
        odds_status.update(
            {
                "status": "not_configured",
                "message": "Configure ODDS_API_KEY para gerar bilhetes.",
            }
        )

    _write_json(
        output_path,
        {
            "date": target_date.isoformat(),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "predictions": [item.model_dump(mode="json") for item in predictions],
            "failures": failures,
            "odds": odds_status,
        },
    )
    if failures:
        _write_json(
            settings.data_dir / "state" / "daily_failures.json",
            {"date": target_date.isoformat(), "failures": failures},
        )
    return predictions, failures


def _fixture_local_date(fixture: dict[str, Any]) -> date:
    raw_date = str(fixture.get("fixture", {}).get("date") or "")
    if not raw_date:
        return date.min
    return datetime.fromisoformat(raw_date.replace("Z", "+00:00")).date()


def _provider_date_window(message: str) -> tuple[date, date] | None:
    match = re.search(r"try from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})", message)
    if not match:
        return None
    return date.fromisoformat(match.group(1)), date.fromisoformat(match.group(2))


def _load_existing_predictions(settings: Settings, dates: set[date]) -> dict[int, dict[str, Any]]:
    existing: dict[int, dict[str, Any]] = {}
    for item_date in dates:
        path = settings.data_dir / "outputs" / "predictions" / f"{item_date.isoformat()}.json"
        payload = _load_json(path, {"predictions": []})
        for row in payload.get("predictions", []):
            if row.get("fixture_id") is not None:
                existing[int(row["fixture_id"])] = row
    return existing


def _save_predictions_by_date(
    settings: Settings,
    predictions: list[PredictionOutput],
    failures: list[str],
) -> None:
    grouped: dict[str, list[PredictionOutput]] = {}
    for prediction in predictions:
        grouped.setdefault(prediction.generated_at.date().isoformat(), [])

    for prediction in predictions:
        match_date = prediction.generated_at.date().isoformat()
        raw_date = prediction.model_dump(mode="json").get("match_date")
        if raw_date:
            match_date = str(raw_date)[:10]
        grouped.setdefault(match_date, []).append(prediction)

    for day, rows in grouped.items():
        target_path = settings.data_dir / "outputs" / "predictions" / f"{day}.json"
        current = _load_json(target_path, {"predictions": []})
        merged = {
            int(item["fixture_id"]): item
            for item in current.get("predictions", [])
            if item.get("fixture_id") is not None
        }
        for row in rows:
            if row.fixture_id is not None:
                merged[int(row.fixture_id)] = row.model_dump(mode="json")
        _write_json(
            target_path,
            {
                "date": day,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "predictions": list(merged.values()),
                "failures": failures,
                "odds": {"requested": False, "status": "disabled"},
            },
        )


def period_predictions(
    settings: Settings,
    client: ApiClient,
    bundle: ModelBundle,
    *,
    start_date: date,
    end_date: date,
    season: int = 2026,
    save_daily: bool = True,
) -> tuple[list[PredictionOutput], list[str], dict[str, Any]]:
    if end_date < start_date:
        raise ValueError("A data final não pode ser anterior à data inicial.")

    failures: list[str] = []
    calendar_mode = "range"
    fixtures: list[dict[str, Any]] = []
    plan_state_path = settings.data_dir / "state" / "api_plan_window.json"
    plan_state = _load_json(plan_state_path, {})
    checked_at_raw = plan_state.get("checked_at")
    range_recently_blocked = False
    if plan_state.get("range_blocked_for_season") == season and checked_at_raw:
        try:
            checked_at = datetime.fromisoformat(str(checked_at_raw))
            range_recently_blocked = (
                datetime.now(timezone.utc) - checked_at
            ).total_seconds() <= 6 * 60 * 60
        except ValueError:
            range_recently_blocked = False

    fallback_to_daily = range_recently_blocked
    if range_recently_blocked:
        failures.append(
            "Consulta por intervalo pulada: plano Free bloqueou esse modo recentemente; "
            "usando busca diária com cache."
        )

    if not fallback_to_daily:
        try:
            payload = client.get(
                "fixtures",
                {
                    "league": settings.world_cup_league_id,
                    "season": season,
                    "from": start_date.isoformat(),
                    "to": end_date.isoformat(),
                    "timezone": settings.timezone,
                },
                max_age_seconds=6 * 60 * 60,
                namespace="period",
            )
            fixtures = [
                item
                for item in payload.get("response", [])
                if int(item.get("league", {}).get("id", 0)) == settings.world_cup_league_id
                and start_date <= _fixture_local_date(item) <= end_date
            ]
        except ApiError:
            fallback_to_daily = True
            failures.append(
                "Consulta por intervalo indisponível no plano atual; usando busca diária com cache."
            )
            _write_json(
                plan_state_path,
                {
                    "checked_at": datetime.now(timezone.utc).isoformat(),
                    "range_blocked_for_season": season,
                },
            )

    if fallback_to_daily:
        calendar_mode = "date-by-date"
        current = start_date
        while current <= end_date:
            try:
                day_payload = client.get(
                    "fixtures",
                    {"date": current.isoformat(), "timezone": settings.timezone},
                    max_age_seconds=6 * 60 * 60,
                    namespace="period-daily",
                )
            except (RateLimitError, BudgetExceeded) as day_exc:
                failures.append(f"{current.isoformat()}: calendário adiado ({day_exc})")
                break
            except ApiError as day_exc:
                window = _provider_date_window(str(day_exc))
                if window and current > window[1]:
                    failures.append(
                        f"{current.isoformat()}: fora da janela liberada pelo plano Free "
                        f"({window[0].isoformat()} a {window[1].isoformat()}); varredura encerrada."
                    )
                    break
                failures.append(f"{current.isoformat()}: calendário indisponível ({day_exc})")
                current += timedelta(days=1)
                continue
            fixtures.extend(
                item
                for item in day_payload.get("response", [])
                if int(item.get("league", {}).get("id", 0)) == settings.world_cup_league_id
                and start_date <= _fixture_local_date(item) <= end_date
            )
            current += timedelta(days=1)
    fixtures.sort(key=lambda item: str(item.get("fixture", {}).get("date") or ""))

    dates = {_fixture_local_date(item) for item in fixtures}
    existing = _load_existing_predictions(settings, dates)

    predictions: list[PredictionOutput] = []
    details_enabled = True
    source_counts = {"saved": 0, "api_predictions": 0, "fixture_only": 0}
    for fixture in fixtures:
        fixture_id = int(fixture["fixture"]["id"])
        existing_row = existing.get(fixture_id)
        if (
            existing_row
            and existing_row.get("coverage", {}).get("raw_prediction_features")
            and existing_row.get("user_analysis")
            and existing_row.get("model_version") == bundle.version
        ):
            predictions.append(PredictionOutput.model_validate(existing[fixture_id]))
            source_counts["saved"] += 1
            continue

        prediction_row: dict[str, Any] | None = None
        if details_enabled:
            try:
                detail_payload = client.get(
                    "predictions",
                    {"fixture": fixture_id},
                    max_age_seconds=12 * 60 * 60,
                    namespace="period",
                )
                prediction_row = (detail_payload.get("response") or [None])[0]
                source_counts["api_predictions"] += 1
            except (RateLimitError, BudgetExceeded) as exc:
                failures.append(f"{fixture_id}: detalhes adiados ({exc})")
                details_enabled = False
                if existing_row:
                    predictions.append(PredictionOutput.model_validate(existing_row))
                    source_counts["saved"] += 1
                    continue
                source_counts["fixture_only"] += 1
            except ApiError as exc:
                failures.append(f"{fixture_id}: detalhes indisponíveis ({exc})")
                source_counts["fixture_only"] += 1
        else:
            if existing_row:
                predictions.append(PredictionOutput.model_validate(existing_row))
                source_counts["saved"] += 1
                continue
            failures.append(f"{fixture_id}: detalhes adiados por orçamento")
            source_counts["fixture_only"] += 1

        match = match_from_api_fixture(fixture, prediction_row)
        prediction = predict_one(settings, bundle, match)
        predictions.append(prediction)

    output_path = (
        settings.data_dir
        / "outputs"
        / "periods"
        / f"{start_date.isoformat()}_to_{end_date.isoformat()}.json"
    )
    summary = {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "season": season,
        "fixtures": len(fixtures),
        "predictions": len(predictions),
        "requests": client.budget.spent,
        "calendar_mode": calendar_mode,
        "sources": source_counts,
        "odds": {"requested": False, "status": "disabled"},
    }
    _write_json(
        output_path,
        {
            **summary,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "predictions": [item.model_dump(mode="json") for item in predictions],
            "failures": failures,
        },
    )
    if save_daily:
        by_date: dict[str, list[PredictionOutput]] = {}
        for fixture, prediction in zip(fixtures, predictions, strict=False):
            by_date.setdefault(_fixture_local_date(fixture).isoformat(), []).append(prediction)
        for day, rows in by_date.items():
            target_path = settings.data_dir / "outputs" / "predictions" / f"{day}.json"
            current = _load_json(target_path, {"predictions": []})
            merged = {
                int(item["fixture_id"]): item
                for item in current.get("predictions", [])
                if item.get("fixture_id") is not None
            }
            for row in rows:
                if row.fixture_id is not None:
                    merged[int(row.fixture_id)] = row.model_dump(mode="json")
            _write_json(
                target_path,
                {
                    "date": day,
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "predictions": list(merged.values()),
                    "failures": failures,
                    "odds": {"requested": False, "status": "disabled"},
                },
            )
    if failures:
        _write_json(
            settings.data_dir / "state" / "period_failures.json",
            {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "failures": failures,
            },
        )
    return predictions, failures, summary


def settle_date(
    settings: Settings,
    client: ApiClient,
    target_date: date,
    *,
    force: bool = False,
    details: bool = True,
) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    prediction_path = settings.data_dir / "outputs" / "predictions" / f"{target_date.isoformat()}.json"
    if not prediction_path.exists():
        raise FileNotFoundError(f"Não há previsões salvas para {target_date.isoformat()}.")
    settlement_path = settings.data_dir / "outputs" / "settlements" / f"{target_date.isoformat()}.json"
    if settlement_path.exists() and not force:
        payload = _load_json(settlement_path, {})
        return payload.get("matches", []), payload.get("summary", {})

    fixtures_payload = client.get(
        "fixtures",
        {"date": target_date.isoformat(), "timezone": settings.timezone},
        namespace="settle",
        force=force,
        max_age_seconds=15 * 60,
    )
    fixtures = {
        int(item["fixture"]["id"]): item
        for item in fixtures_payload.get("response", [])
        if int(item.get("league", {}).get("id", 0)) == settings.world_cup_league_id
    }
    prediction_payload = _load_json(prediction_path, {"predictions": []})
    settled: list[dict[str, Any]] = []
    detail_queries_enabled = details
    for prediction in prediction_payload.get("predictions", []):
        fixture_id = int(prediction["fixture_id"])
        fixture = fixtures.get(fixture_id)
        if not fixture or fixture.get("fixture", {}).get("status", {}).get("short") not in {
            "FT",
            "AET",
            "PEN",
        }:
            continue
        if fixture.get("goals", {}).get("home") is None:
            continue
        row = settle_prediction(prediction, fixture)
        if detail_queries_enabled:
            try:
                stats_payload = client.get(
                    "fixtures/statistics",
                    {"fixture": fixture_id},
                    namespace="settle-details",
                    max_age_seconds=None,
                )
                totals = _fixture_stat_totals(stats_payload.get("response", []))
                row["detailed_markets"] = detailed_market_metrics(prediction, totals)
            except (RateLimitError, BudgetExceeded) as exc:
                row["details_pending"] = str(exc)
                detail_queries_enabled = False
            except ApiError as exc:
                row["details_pending"] = str(exc)
        settled.append(row)
    summary = aggregate_metrics(settled)
    _write_json(
        settlement_path,
        {
            "date": target_date.isoformat(),
            "settled_at": datetime.now(timezone.utc).isoformat(),
            "matches": settled,
            "summary": summary,
        },
    )
    append_history(settings.data_dir / "metrics" / "history.jsonl", settled)
    return settled, summary


def _fixture_stat_totals(rows: list[dict[str, Any]]) -> dict[str, float]:
    names = {
        "Total Shots": "shots",
        "Shots on Goal": "shots_on_target",
        "Corner Kicks": "corners",
        "Fouls": "fouls",
        "Yellow Cards": "cards",
    }
    totals = {value: 0.0 for value in names.values()}
    for team in rows:
        for stat in team.get("statistics") or []:
            mapped = names.get(stat.get("type"))
            if not mapped or stat.get("value") is None:
                continue
            try:
                totals[mapped] += float(str(stat["value"]).replace("%", ""))
            except ValueError:
                continue
    return totals
