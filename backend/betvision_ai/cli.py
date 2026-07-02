from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path
from typing import Annotated

import typer
from rich.console import Console

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from betvision_ai.api import ApiClient, RequestBudget
from betvision_ai.backtesting import run_historical_backtest
from betvision_ai.collection import collect_world_cup, prepare_datasets
from betvision_ai.config import UsageLedger, get_settings
from betvision_ai.modeling import load_bundle, train_bundle
from betvision_ai.reporting import backtest_report, metrics_report, period_report, prediction_report
from betvision_ai.schemas import MatchInput
from betvision_ai.server import serve_predictions
from betvision_ai.service import daily_predictions, period_predictions, predict_one, settle_date
from betvision_ai.statsbomb import import_statsbomb_world_cups, statsbomb_status


app = typer.Typer(
    help="Backend local de probabilidades da Copa do Mundo. Não inicia servidor.",
    no_args_is_help=True,
)
console = Console()


def _client(budget: int | None) -> ApiClient:
    settings = get_settings()
    return ApiClient(settings, RequestBudget(settings, budget or settings.default_budget))


def _date(value: str | None) -> date:
    return date.fromisoformat(value) if value else get_settings().today


@app.command()
def collect(
    season: Annotated[int, typer.Option(help="Temporada histórica da Copa.")] = 2022,
    budget: Annotated[int | None, typer.Option(help="Máximo de chamadas nesta execução.")] = None,
) -> None:
    """Coleta fixtures e avança gradualmente nas estatísticas históricas."""
    settings = get_settings()
    result = collect_world_cup(settings, _client(budget), season)
    console.print_json(data=result)


@app.command("import-statsbomb")
def import_statsbomb(
    seasons: Annotated[
        str,
        typer.Option(help="Copas separadas por vírgula. Disponíveis: 2018,2022."),
    ] = "2018,2022",
    concurrency: Annotated[
        int,
        typer.Option(help="Downloads simultâneos, entre 1 e 16."),
    ] = 8,
    force: Annotated[
        bool,
        typer.Option(help="Baixa novamente arquivos já existentes."),
    ] = False,
) -> None:
    """Importa somente Copas úteis do StatsBomb Open Data."""
    selected = [int(value.strip()) for value in seasons.split(",") if value.strip()]
    result = import_statsbomb_world_cups(
        get_settings(),
        selected,
        force=force,
        concurrency=concurrency,
    )
    console.print_json(data=result.__dict__)
    console.print_json(data=statsbomb_status(get_settings()))


@app.command()
def prepare(
    season: Annotated[int, typer.Option(help="Temporada histórica da Copa.")] = 2022,
) -> None:
    """Prepara datasets sem fazer chamadas de rede."""
    console.print_json(data=prepare_datasets(get_settings(), season))


@app.command()
def train(
    season: Annotated[int, typer.Option(help="Temporada histórica da Copa.")] = 2022,
) -> None:
    """Treina Poisson/XGBoost e salva o ensemble versionado."""
    bundle = train_bundle(get_settings(), season)
    console.print_json(
        data={
            "version": bundle.version,
            "trained_at": bundle.trained_at,
            **bundle.training_summary,
        }
    )


@app.command()
def backtest(
    fixture_id: Annotated[
        int,
        typer.Option(help="ID da partida histórica que ficará fora do treinamento."),
    ] = 979139,
    season: Annotated[int, typer.Option(help="Temporada histórica da Copa.")] = 2022,
    samples: Annotated[
        int | None,
        typer.Option(help="Quantidade opcional de simulações Monte Carlo."),
    ] = None,
) -> None:
    """Treina até a véspera de um jogo passado e confere a previsão."""
    report = run_historical_backtest(
        get_settings(),
        season=season,
        fixture_id=fixture_id,
        samples=samples,
    )
    backtest_report(report)


@app.command()
def daily(
    date_value: Annotated[str | None, typer.Option("--date", help="Data YYYY-MM-DD.")] = None,
    budget: Annotated[int | None, typer.Option(help="Máximo de chamadas nesta execução.")] = None,
    odds: Annotated[
        bool,
        typer.Option("--odds/--no-odds", help="Consulta odds e monta bilhetes."),
    ] = True,
    force_odds: Annotated[
        bool,
        typer.Option(help="Ignora o cache de odds."),
    ] = False,
) -> None:
    """Busca os jogos da data, prevê cada partida e encerra."""
    settings = get_settings()
    predictions, failures = daily_predictions(
        settings,
        _client(budget),
        load_bundle(settings),
        _date(date_value),
        include_odds=odds,
        force_odds=force_odds,
    )
    if not predictions:
        console.print("[yellow]Nenhum jogo da Copa do Mundo disponível nessa data.[/yellow]")
    for prediction in predictions:
        prediction_report(prediction)
    if failures:
        console.print(f"[yellow]{len(failures)} consulta(s) ficaram pendentes:[/yellow]")
        for failure in failures:
            console.print(f"[yellow]- {failure}[/yellow]")


@app.command()
def upcoming(
    start_date_value: Annotated[
        str | None,
        typer.Option("--start-date", help="Início YYYY-MM-DD. Padrão: hoje."),
    ] = None,
    end_date_value: Annotated[
        str | None,
        typer.Option("--end-date", help="Fim YYYY-MM-DD. Se omitido, usa --days."),
    ] = None,
    days: Annotated[
        int,
        typer.Option(help="Quantidade de dias a partir do início quando --end-date for omitido."),
    ] = 21,
    season: Annotated[int, typer.Option(help="Temporada da Copa.")] = 2026,
    budget: Annotated[int | None, typer.Option(help="Máximo de chamadas nesta execução.")] = None,
) -> None:
    """Busca jogos das próximas semanas, prevê sem odds e salva por data."""
    settings = get_settings()
    start_date = _date(start_date_value)
    end_date = date.fromisoformat(end_date_value) if end_date_value else start_date + timedelta(days=days - 1)
    predictions, failures, summary = period_predictions(
        settings,
        _client(budget),
        load_bundle(settings),
        start_date=start_date,
        end_date=end_date,
        season=season,
    )
    period_report(predictions, summary)
    if failures:
        console.print(f"[yellow]{len(failures)} detalhe(s) ficaram pendentes:[/yellow]")
        for failure in failures[:20]:
            console.print(f"[yellow]- {failure}[/yellow]")
        if len(failures) > 20:
            console.print(f"[yellow]- ... mais {len(failures) - 20} pendência(s)[/yellow]")


@app.command()
def settle(
    date_value: Annotated[str, typer.Option("--date", help="Data YYYY-MM-DD.")] ,
    budget: Annotated[int | None, typer.Option(help="Máximo de chamadas nesta execução.")] = None,
    force: Annotated[bool, typer.Option(help="Ignora avaliação já salva.")] = False,
    details: Annotated[
        bool,
        typer.Option("--details/--no-details", help="Consulta estatísticas finais por partida."),
    ] = True,
) -> None:
    """Confere resultados finais e calcula métricas."""
    settings = get_settings()
    _, summary = settle_date(
        settings,
        _client(budget),
        _date(date_value),
        force=force,
        details=details,
    )
    metrics_report(summary)


@app.command()
def predict(
    input_path: Annotated[Path, typer.Option("--input", exists=True, readable=True)],
    json_out: Annotated[Path | None, typer.Option(help="Arquivo opcional para a saída JSON.")] = None,
) -> None:
    """Prevê um jogo descrito em JSON, sem consumir a API."""
    settings = get_settings()
    match = MatchInput.model_validate_json(input_path.read_text(encoding="utf-8"))
    prediction = predict_one(settings, load_bundle(settings), match)
    prediction_report(prediction)
    if json_out:
        json_out.parent.mkdir(parents=True, exist_ok=True)
        json_out.write_text(
            prediction.model_dump_json(indent=2),
            encoding="utf-8",
        )


@app.command()
def status(
    live: Annotated[bool, typer.Option(help="Consulta também o status real da API (1 chamada).")] = False,
) -> None:
    """Exibe configuração, artefatos e consumo local."""
    settings = get_settings()
    ledger = UsageLedger(settings)
    payload = {
        "api_configured": settings.configured,
        "local_requests_today": ledger.used_today(),
        "local_daily_limit": settings.daily_limit,
        "protected_reserve": settings.reserve_requests,
        "model_exists": (settings.data_dir / "models" / "latest.joblib").exists(),
        "odds_api_configured": settings.odds_configured,
        "data_dir": str(settings.data_dir),
        "statsbomb": statsbomb_status(settings),
    }
    odds_quota_path = settings.data_dir / "state" / "odds_quota.json"
    if odds_quota_path.exists():
        try:
            payload["odds_quota"] = json.loads(
                odds_quota_path.read_text(encoding="utf-8")
            )
        except json.JSONDecodeError:
            payload["odds_quota"] = {"status": "invalid_local_state"}
    if live:
        client = _client(1)
        provider = client.get("status", namespace="status", force=True)
        payload["provider"] = provider.get("response")
    console.print(json.dumps(payload, ensure_ascii=False, indent=2))


@app.command()
def serve(
    host: Annotated[str, typer.Option(help="Host local do servidor HTTP de teste.")] = "127.0.0.1",
    port: Annotated[int, typer.Option(help="Porta local do servidor HTTP de teste.")] = 8765,
) -> None:
    """Expõe previsões salvas para o frontend em modo local de teste."""
    console.print(f"[green]BetVision AI servindo em http://{host}:{port}[/green]")
    console.print("[yellow]Use somente em desenvolvimento local. Pressione Ctrl+C para encerrar.[/yellow]")
    serve_predictions(get_settings(), host, port)
