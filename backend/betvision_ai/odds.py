from __future__ import annotations

import hashlib
import json
import math
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo

import httpx

from betvision_ai.config import Settings
from betvision_ai.schemas import PredictionOutput


class OddsApiError(RuntimeError):
    pass


class OddsQuotaExceeded(OddsApiError):
    pass


TEAM_ALIASES = {
    "usa": "united states",
    "united states of america": "united states",
    "ivory coast": "cote divoire",
    "cote d ivoire": "cote divoire",
    "curacao": "curacao",
    "turkiye": "turkey",
    "korea republic": "south korea",
    "republic of korea": "south korea",
    "netherlands": "netherlands",
}


def normalize_team(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = normalized.lower().replace("&", " and ")
    normalized = re.sub(r"[^a-z0-9]+", " ", normalized).strip()
    return TEAM_ALIASES.get(normalized, normalized)


def team_matches(left: str, right: str) -> bool:
    left_normalized = normalize_team(left)
    right_normalized = normalize_team(right)
    if left_normalized == right_normalized:
        return True
    left_tokens = set(left_normalized.split())
    right_tokens = set(right_normalized.split())
    return bool(left_tokens and right_tokens and left_tokens == right_tokens)


def devig_probabilities(outcomes: list[dict[str, Any]]) -> dict[str, float]:
    raw = {
        _outcome_key(outcome): 1 / float(outcome["price"])
        for outcome in outcomes
        if float(outcome.get("price", 0)) > 1
    }
    total = sum(raw.values())
    if total <= 0:
        return {}
    return {key: value / total for key, value in raw.items()}


def _outcome_key(outcome: dict[str, Any]) -> str:
    point = outcome.get("point")
    suffix = f"|{float(point):+.1f}" if point is not None else ""
    return f"{normalize_team(str(outcome.get('name', '')))}{suffix}"


@dataclass
class OddsFetchResult:
    events: list[dict[str, Any]]
    remaining: int | None
    used: int | None
    last_cost: int | None
    cached: bool


class OddsApiClient:
    def __init__(
        self,
        settings: Settings,
        http_client: httpx.Client | None = None,
    ):
        if not settings.odds_configured:
            raise OddsApiError("Configure ODDS_API_KEY no arquivo .env.")
        self.settings = settings
        self.http = http_client or httpx.Client(timeout=30.0)

    def _cache_path(self, params: dict[str, Any]) -> Path:
        normalized = json.dumps(params, sort_keys=True)
        digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
        return self.settings.data_dir / "cache" / f"odds-{digest}.json"

    def fetch_date(
        self,
        target_date: date,
        *,
        force: bool = False,
        max_age_seconds: int = 30 * 60,
    ) -> OddsFetchResult:
        quota_path = self.settings.data_dir / "state" / "odds_quota.json"
        if quota_path.exists() and not force:
            try:
                quota_state = json.loads(quota_path.read_text(encoding="utf-8"))
                checked_at = datetime.fromisoformat(quota_state["checked_at"])
                if (
                    quota_state.get("remaining") == 0
                    and (datetime.now(timezone.utc) - checked_at).total_seconds()
                    < 6 * 60 * 60
                ):
                    raise OddsQuotaExceeded(
                        f"Cota da API de odds esgotada "
                        f"({quota_state.get('used', '?')} créditos usados)."
                    )
            except (json.JSONDecodeError, KeyError, ValueError):
                pass
        local_zone = ZoneInfo(self.settings.timezone)
        start = datetime.combine(target_date, time.min, local_zone).astimezone(timezone.utc)
        end = datetime.combine(target_date, time.max, local_zone).astimezone(timezone.utc)
        params = {
            "regions": self.settings.odds_api_region,
            "markets": "h2h,totals,spreads",
            "oddsFormat": "decimal",
            "dateFormat": "iso",
            "commenceTimeFrom": start.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "commenceTimeTo": end.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        cache_path = self._cache_path(params)
        if cache_path.exists() and not force:
            envelope = json.loads(cache_path.read_text(encoding="utf-8"))
            fetched_at = datetime.fromisoformat(envelope["fetched_at"])
            if (datetime.now(timezone.utc) - fetched_at).total_seconds() <= max_age_seconds:
                return OddsFetchResult(
                    events=envelope["events"],
                    remaining=envelope.get("remaining"),
                    used=envelope.get("used"),
                    last_cost=envelope.get("last_cost"),
                    cached=True,
                )

        response = self.http.get(
            (
                f"{self.settings.odds_api_base_url}/sports/"
                f"{self.settings.odds_api_sport}/odds"
            ),
            params={**params, "apiKey": self.settings.odds_api_key},
        )
        remaining = _int_header(response, "x-requests-remaining")
        used = _int_header(response, "x-requests-used")
        last_cost = _int_header(response, "x-requests-last")
        error_payload: dict[str, Any] = {}
        if response.status_code >= 400:
            try:
                error_payload = response.json()
            except ValueError:
                error_payload = {}
        error_code = str(error_payload.get("error_code", "")).upper()
        if response.status_code == 429 or error_code == "OUT_OF_USAGE_CREDITS":
            state = {
                "checked_at": datetime.now(timezone.utc).isoformat(),
                "remaining": remaining,
                "used": used,
                "last_cost": last_cost,
            }
            quota_path.write_text(json.dumps(state, indent=2), encoding="utf-8")
            raise OddsQuotaExceeded(
                f"Cota da API de odds esgotada ({used or '?'} créditos usados)."
            )
        if response.status_code in {401, 403}:
            raise OddsApiError("Chave da API de odds inválida ou sem permissão.")
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            detail = error_payload.get("message")
            suffix = f": {detail}" if detail else "."
            raise OddsApiError(
                f"API de odds respondeu HTTP {response.status_code}{suffix}"
            ) from exc
        events = response.json()
        envelope = {
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "events": events,
            "remaining": remaining,
            "used": used,
            "last_cost": last_cost,
        }
        cache_path.write_text(
            json.dumps(envelope, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return OddsFetchResult(events, remaining, used, last_cost, False)


def _int_header(response: httpx.Response, name: str) -> int | None:
    value = response.headers.get(name)
    try:
        return int(value) if value is not None else None
    except ValueError:
        return None


def find_event(
    events: list[dict[str, Any]],
    home_team: str,
    away_team: str,
) -> dict[str, Any] | None:
    for event in events:
        direct = team_matches(home_team, event.get("home_team", "")) and team_matches(
            away_team,
            event.get("away_team", ""),
        )
        reverse = team_matches(home_team, event.get("away_team", "")) and team_matches(
            away_team,
            event.get("home_team", ""),
        )
        if direct or reverse:
            return event
    return None


def analyze_event_odds(
    prediction: PredictionOutput,
    event: dict[str, Any],
) -> dict[str, Any]:
    home_name, away_name = [part.strip() for part in prediction.match.split(" x ", 1)]
    candidates: list[dict[str, Any]] = []
    grouped: dict[tuple[str, str], list[dict[str, Any]]] = defaultdict(list)

    for bookmaker in event.get("bookmakers") or []:
        for market in bookmaker.get("markets") or []:
            market_key = market.get("key")
            if market_key == "h2h":
                _collect_h2h_candidates(
                    grouped,
                    prediction,
                    bookmaker,
                    market,
                    home_name,
                    away_name,
                )
            elif market_key == "totals":
                _collect_total_candidates(grouped, prediction, bookmaker, market)
            elif market_key == "spreads":
                _collect_spread_candidates(
                    grouped,
                    prediction,
                    bookmaker,
                    market,
                    home_name,
                    away_name,
                )

    for (_, _), observations in grouped.items():
        candidate = _aggregate_observations(observations)
        if candidate:
            candidates.append(candidate)
    candidates.sort(key=lambda item: item["ranking_score"], reverse=True)
    positive = [item for item in candidates if item["edge"] >= 0.02 and item["ev"] > 0]
    strongest = positive[0] if positive else None
    conservative = _build_ticket(
        positive,
        tone="conservative",
        min_probability=0.58,
        min_edge=0.02,
        max_selections=2,
    )
    aggressive = _build_ticket(
        positive,
        tone="aggressive",
        min_probability=0.34,
        min_edge=0.035,
        max_selections=3,
        min_odd=1.55,
    )
    return {
        "status": "ok",
        "event_id": event.get("id"),
        "commence_time": event.get("commence_time"),
        "bookmakers": len(event.get("bookmakers") or []),
        "candidates": candidates[:12],
        "strongest_market": strongest,
        "conservative_ticket": conservative,
        "aggressive_ticket": aggressive,
        "disclaimer": (
            "Bilhetes são estimativas teóricas. Confirme odds e aceitação da combinação "
            "na casa antes de apostar."
        ),
    }


def _collect_h2h_candidates(
    grouped: dict[tuple[str, str], list[dict[str, Any]]],
    prediction: PredictionOutput,
    bookmaker: dict[str, Any],
    market: dict[str, Any],
    home_name: str,
    away_name: str,
) -> None:
    fair = devig_probabilities(market.get("outcomes") or [])
    for outcome in market.get("outcomes") or []:
        name = str(outcome.get("name", ""))
        if team_matches(name, home_name):
            model_probability = prediction.result["home"] / 100
            selection = f"Vitória {home_name}"
            selection_key = "h2h_home"
        elif team_matches(name, away_name):
            model_probability = prediction.result["away"] / 100
            selection = f"Vitória {away_name}"
            selection_key = "h2h_away"
        elif normalize_team(name) == "draw":
            model_probability = prediction.result["draw"] / 100
            selection = "Empate"
            selection_key = "h2h_draw"
        else:
            continue
        _add_observation(
            grouped,
            "1X2",
            selection_key,
            selection,
            model_probability,
            fair.get(_outcome_key(outcome)),
            outcome,
            bookmaker,
            push_probability=0,
            direction=(
                "home"
                if selection_key == "h2h_home"
                else "away"
                if selection_key == "h2h_away"
                else "draw"
            ),
        )


def _collect_total_candidates(
    grouped: dict[tuple[str, str], list[dict[str, Any]]],
    prediction: PredictionOutput,
    bookmaker: dict[str, Any],
    market: dict[str, Any],
) -> None:
    by_point: dict[float, list[dict[str, Any]]] = defaultdict(list)
    for outcome in market.get("outcomes") or []:
        if outcome.get("point") is not None:
            by_point[float(outcome["point"])].append(outcome)
    for point, outcomes in by_point.items():
        line = f"{point:.1f}"
        if line not in prediction.goals:
            continue
        fair = devig_probabilities(outcomes)
        for outcome in outcomes:
            direction = normalize_team(str(outcome.get("name", "")))
            if direction == "over":
                probability = prediction.goals[line]["over"] / 100
                selection = f"Over {line} gols"
                selection_key = f"total_over_{line}"
            elif direction == "under":
                probability = prediction.goals[line]["under"] / 100
                selection = f"Under {line} gols"
                selection_key = f"total_under_{line}"
            else:
                continue
            _add_observation(
                grouped,
                "Gols",
                selection_key,
                selection,
                probability,
                fair.get(_outcome_key(outcome)),
                outcome,
                bookmaker,
                push_probability=0,
                direction=direction,
            )


def _collect_spread_candidates(
    grouped: dict[tuple[str, str], list[dict[str, Any]]],
    prediction: PredictionOutput,
    bookmaker: dict[str, Any],
    market: dict[str, Any],
    home_name: str,
    away_name: str,
) -> None:
    outcomes = market.get("outcomes") or []
    fair = devig_probabilities(outcomes)
    for outcome in outcomes:
        name = str(outcome.get("name", ""))
        point = float(outcome.get("point", 0))
        if team_matches(name, home_name):
            home_line = point
            state = "win"
            selection = f"{home_name} {point:+.1f}"
            direction = "home"
        elif team_matches(name, away_name):
            home_line = -point
            state = "loss"
            selection = f"{away_name} {point:+.1f}"
            direction = "away"
        else:
            continue
        key = f"{home_line:+.1f}"
        handicap = prediction.handicaps.get(key)
        if not handicap:
            continue
        probability = handicap[state] / 100
        push_probability = handicap["push"] / 100
        selection_key = f"spread_{normalize_team(name)}_{point:+.1f}"
        _add_observation(
            grouped,
            "Handicap",
            selection_key,
            selection,
            probability,
            fair.get(_outcome_key(outcome)),
            outcome,
            bookmaker,
            push_probability=push_probability,
            direction=direction,
        )


def _add_observation(
    grouped: dict[tuple[str, str], list[dict[str, Any]]],
    category: str,
    selection_key: str,
    selection: str,
    model_probability: float,
    market_probability: float | None,
    outcome: dict[str, Any],
    bookmaker: dict[str, Any],
    *,
    push_probability: float,
    direction: str,
) -> None:
    price = float(outcome.get("price", 0))
    if price <= 1 or market_probability is None:
        return
    grouped[(category, selection_key)].append(
        {
            "category": category,
            "selection_key": selection_key,
            "selection": selection,
            "model_probability": model_probability,
            "market_probability": market_probability,
            "odd": price,
            "bookmaker": bookmaker.get("title") or bookmaker.get("key"),
            "push_probability": push_probability,
            "direction": direction,
        }
    )


def _aggregate_observations(observations: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not observations:
        return None
    best = max(observations, key=lambda item: item["odd"])
    model_probability = float(best["model_probability"])
    market_probability = sum(item["market_probability"] for item in observations) / len(
        observations
    )
    push_probability = float(best.get("push_probability", 0))
    odd = float(best["odd"])
    ev = model_probability * odd + push_probability - 1
    edge = model_probability - market_probability
    ranking_score = edge * 0.65 + max(ev, 0) * 0.25 + model_probability * 0.10
    return {
        "category": best["category"],
        "selection_key": best["selection_key"],
        "selection": best["selection"],
        "direction": best["direction"],
        "model_probability": round(model_probability, 4),
        "market_probability": round(market_probability, 4),
        "edge": round(edge, 4),
        "best_odd": round(odd, 3),
        "bookmaker": best["bookmaker"],
        "ev": round(ev, 4),
        "push_probability": round(push_probability, 4),
        "books_compared": len(observations),
        "ranking_score": round(ranking_score, 6),
    }


def _build_ticket(
    candidates: list[dict[str, Any]],
    *,
    tone: str,
    min_probability: float,
    min_edge: float,
    max_selections: int,
    min_odd: float = 1.01,
) -> dict[str, Any] | None:
    selected: list[dict[str, Any]] = []
    categories: set[str] = set()
    directions: set[str] = set()
    for candidate in candidates:
        if candidate["model_probability"] < min_probability:
            continue
        if candidate["edge"] < min_edge or candidate["best_odd"] < min_odd:
            continue
        if candidate["category"] in categories:
            continue
        direction = candidate.get("direction")
        if direction == "home" and "away" in directions:
            continue
        if direction == "away" and "home" in directions:
            continue
        if direction == "over" and "under" in directions:
            continue
        if direction == "under" and "over" in directions:
            continue
        selected.append(candidate)
        categories.add(candidate["category"])
        if direction:
            directions.add(direction)
        if len(selected) >= max_selections:
            break
    if not selected:
        return None
    combined_odd = math.prod(item["best_odd"] for item in selected)
    correlation_discount = 0.92 if len(selected) == 2 else 0.84 if len(selected) >= 3 else 1
    combined_probability = (
        math.prod(item["model_probability"] for item in selected) * correlation_discount
    )
    return {
        "tone": tone,
        "selections": selected,
        "combined_odd_theoretical": round(combined_odd, 3),
        "combined_probability_estimated": round(combined_probability, 4),
        "estimated_ev": round(combined_probability * combined_odd - 1, 4),
        "same_game_combination_not_guaranteed": len(selected) > 1,
    }


def enrich_predictions_with_odds(
    predictions: list[PredictionOutput],
    events: list[dict[str, Any]],
) -> tuple[list[PredictionOutput], list[str]]:
    failures: list[str] = []
    for prediction in predictions:
        home_name, away_name = [part.strip() for part in prediction.match.split(" x ", 1)]
        event = find_event(events, home_name, away_name)
        if not event:
            prediction.odds_analysis = {
                "status": "event_not_found",
                "strongest_market": None,
                "conservative_ticket": None,
                "aggressive_ticket": None,
            }
            failures.append(f"Odds não encontradas para {prediction.match}.")
            continue
        prediction.odds_analysis = analyze_event_odds(prediction, event)
    return predictions, failures
