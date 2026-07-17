from __future__ import annotations

import json
from datetime import date, datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import parse_qs, urlparse

from betvision_ai.automation import AutomationRunner, BackgroundAutomation
from betvision_ai.config import Settings


def _read_json(path) -> Any:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def _response(handler: BaseHTTPRequestHandler, status: int, payload: dict[str, Any]) -> None:
    raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type")
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(raw)))
    handler.end_headers()
    handler.wfile.write(raw)


def _prediction_files(settings: Settings):
    root = settings.data_dir / "outputs" / "predictions"
    if not root.exists():
        return []
    return sorted(root.glob("*.json"), reverse=True)


def _load_prediction_by_fixture(settings: Settings, fixture_id: int) -> dict[str, Any] | None:
    for path in _prediction_files(settings):
        payload = _read_json(path) or {}
        for prediction in payload.get("predictions", []):
            if int(prediction.get("fixture_id") or 0) == fixture_id:
                return {**prediction, "_source_date": payload.get("date")}
    return None


def make_handler(settings: Settings, runner: AutomationRunner | None = None):
    class BetVisionAiHandler(BaseHTTPRequestHandler):
        server_version = "BetVisionAI/0.1"

        def log_message(self, format: str, *args: Any) -> None:
            return

        def do_OPTIONS(self) -> None:
            _response(self, 204, {})

        def do_GET(self) -> None:
            parsed = urlparse(self.path)
            query = parse_qs(parsed.query)

            try:
                if parsed.path == "/health":
                    return _response(
                        self,
                        200,
                        {
                            "status": "ok",
                            "generated_at": datetime.now(timezone.utc).isoformat(),
                            "data_dir": str(settings.data_dir),
                            "automation": runner.status() if runner else {"enabled": False},
                        },
                    )

                if parsed.path == "/automation/status":
                    return _response(
                        self,
                        200,
                        runner.status() if runner else {"enabled": False},
                    )

                if parsed.path == "/predictions":
                    target = query.get("date", [settings.today.isoformat()])[0]
                    try:
                        target_date = date.fromisoformat(target)
                    except ValueError:
                        return _response(self, 400, {"error": "date deve estar no formato YYYY-MM-DD"})

                    prediction_path = settings.data_dir / "outputs" / "predictions" / f"{target}.json"
                    payload = _read_json(prediction_path)
                    if payload is None and runner and settings.auto_enabled:
                        if runner.status().get("running"):
                            return _response(
                                self,
                                202,
                                {
                                    "status": "processing",
                                    "date": target,
                                    "generated_at": datetime.now(timezone.utc).isoformat(),
                                    "predictions": [],
                                    "failures": [],
                                    "message": "A IA da BetVision esta gerando as previsoes desta data.",
                                    "automation": runner.status(),
                                },
                            )
                        run_result = runner.run_once(target_date=target_date)
                        payload = _read_json(prediction_path)
                        if payload is None and run_result.get("skipped") == "automation_already_running":
                            return _response(
                                self,
                                202,
                                {
                                    "status": "processing",
                                    "date": target,
                                    "generated_at": datetime.now(timezone.utc).isoformat(),
                                    "predictions": [],
                                    "failures": [],
                                    "message": "A IA da BetVision esta gerando as previsoes desta data.",
                                    "automation": run_result,
                                },
                            )
                    if payload is None:
                        return _response(
                            self,
                            404,
                            {
                                "error": "previsoes_nao_encontradas",
                                "date": target,
                                "hint": "Execute python -m betvision_ai daily ou upcoming para gerar previsoes.",
                            },
                        )
                    return _response(self, 200, payload)

                if parsed.path.startswith("/prediction/"):
                    raw_id = parsed.path.rsplit("/", 1)[-1]
                    if not raw_id.isdigit():
                        return _response(self, 400, {"error": "fixture_id invalido"})
                    prediction = _load_prediction_by_fixture(settings, int(raw_id))
                    if prediction is None and runner and settings.auto_enabled:
                        runner.run_once()
                        prediction = _load_prediction_by_fixture(settings, int(raw_id))
                    if prediction is None:
                        return _response(self, 404, {"error": "previsao_nao_encontrada"})
                    return _response(self, 200, {"prediction": prediction})

                return _response(self, 404, {"error": "rota_nao_encontrada"})
            except Exception as exc:
                return _response(self, 500, {"error": str(exc)})

    return BetVisionAiHandler


def serve_predictions(settings: Settings, host: str, port: int) -> None:
    runner = AutomationRunner(settings) if settings.auto_enabled else None
    background = BackgroundAutomation(runner) if runner else None
    if background:
        background.start()
    server = ThreadingHTTPServer((host, port), make_handler(settings, runner))
    try:
        server.serve_forever()
    finally:
        if background:
            background.stop()
        server.server_close()
