from __future__ import annotations

from typing import Any

from rich.console import Console
from rich.table import Table

from betvision_ai.schemas import PredictionOutput


console = Console()


def prediction_report(prediction: PredictionOutput) -> None:
    console.rule(f"[bold green]{prediction.match}[/bold green]")
    table = Table("Mercado", "Seleção", "Probabilidade", title="Probabilidades")
    table.add_row("1X2", "Mandante", f"{prediction.result['home']:.2f}%")
    table.add_row("1X2", "Empate", f"{prediction.result['draw']:.2f}%")
    table.add_row("1X2", "Visitante", f"{prediction.result['away']:.2f}%")
    table.add_row("Ambas marcam", "Sim", f"{prediction.both_teams_score['yes']:.2f}%")
    for line, values in prediction.goals.items():
        table.add_row("Gols", f"Over {line}", f"{values['over']:.2f}%")
    console.print(table)

    expected = Table("Indicador", "Mandante", "Visitante", title="Valores esperados")
    expected.add_row("Gols", f"{prediction.expected.home_goals:.2f}", f"{prediction.expected.away_goals:.2f}")
    expected.add_row("Chutes", f"{prediction.expected.home_shots:.2f}", f"{prediction.expected.away_shots:.2f}")
    expected.add_row(
        "Chutes no alvo",
        f"{prediction.expected.home_shots_on_target:.2f}",
        f"{prediction.expected.away_shots_on_target:.2f}",
    )
    expected.add_row("Escanteios", f"{prediction.expected.home_corners:.2f}", f"{prediction.expected.away_corners:.2f}")
    expected.add_row("Faltas", f"{prediction.expected.home_fouls:.2f}", f"{prediction.expected.away_fouls:.2f}")
    expected.add_row("Cartões", f"{prediction.expected.home_cards:.2f}", f"{prediction.expected.away_cards:.2f}")
    console.print(expected)
    console.print(
        "Placares: "
        + ", ".join(f"{item['score']} ({item['probability']:.2f}%)" for item in prediction.scorelines)
    )

    counts = Table("Mercado", "Linha", "Over", "Under", title="Mercados estatísticos")
    labels = {
        "corners": "Escanteios",
        "cards": "Cartões",
        "fouls": "Faltas",
        "shots": "Chutes",
        "shots_on_target": "Chutes no alvo",
    }
    for market, lines in prediction.counts.items():
        for line, probabilities in lines.items():
            counts.add_row(
                labels.get(market, market),
                line,
                f"{probabilities['over']:.2f}%",
                f"{probabilities['under']:.2f}%",
            )
    console.print(counts)

    handicaps = Table("Handicap mandante", "Vitória", "Push", "Derrota", title="Handicap")
    for line in ("-2.5", "-1.5", "-1.0", "-0.5", "+0.0", "+0.5", "+1.0", "+1.5", "+2.5"):
        market = prediction.handicaps[line]
        handicaps.add_row(
            line,
            f"{market['win']:.2f}%",
            f"{market['push']:.2f}%",
            f"{market['loss']:.2f}%",
        )
    console.print(handicaps)

    if prediction.player_props:
        players = Table("Jogador", "Gol", "Assistência", "Cartão", "1+ chute no alvo", title="Props")
        for prop in prediction.player_props:
            probabilities = prop["probabilities"]
            players.add_row(
                prop["player"],
                f"{probabilities['goal']:.2f}%",
                f"{probabilities['assist']:.2f}%",
                f"{probabilities['card']:.2f}%",
                f"{probabilities['shots_on_target_over_0.5']:.2f}%",
            )
        console.print(players)

    if prediction.odds_analysis:
        odds_report(prediction.odds_analysis)
    console.print(
        f"Modelo: {prediction.model_version} | confiança: {prediction.confidence} | "
        f"amostra: {prediction.coverage.get('training_matches', 0)} jogos"
    )


def period_report(predictions: list[PredictionOutput], summary: dict[str, Any]) -> None:
    console.rule("[bold cyan]Previsões do período[/bold cyan]")
    console.print(
        f"{summary['start_date']} até {summary['end_date']} | "
        f"jogos: {summary['fixtures']} | chamadas usadas: {summary['requests']} | "
        f"calendário: {summary.get('calendar_mode', 'range')} | odds: desligadas"
    )
    sources = summary.get("sources", {})
    console.print(
        "Fontes: "
        f"{sources.get('saved', 0)} salvas, "
        f"{sources.get('api_predictions', 0)} com features da API, "
        f"{sources.get('api_empty', 0)} API sem forma útil, "
        f"{sources.get('fixture_only', 0)} só calendário"
    )
    if not predictions:
        console.print("[yellow]Nenhum jogo da Copa do Mundo encontrado no período.[/yellow]")
        return

    table = Table(
        "#",
        "Jogo",
        "Mandante",
        "Empate",
        "Visitante",
        "BTTS",
        "Over 2.5",
        "Placar provável",
        title="Resumo por partida",
    )
    for index, prediction in enumerate(predictions, start=1):
        top_score = prediction.scorelines[0] if prediction.scorelines else {}
        table.add_row(
            str(index),
            prediction.match,
            f"{prediction.result['home']:.2f}%",
            f"{prediction.result['draw']:.2f}%",
            f"{prediction.result['away']:.2f}%",
            f"{prediction.both_teams_score['yes']:.2f}%",
            f"{prediction.goals['2.5']['over']:.2f}%",
            f"{top_score.get('score', 'N/D')} ({float(top_score.get('probability', 0)):.2f}%)",
        )
    console.print(table)


def _percent(value: float) -> str:
    return f"{value * 100:.2f}%"


def odds_report(analysis: dict[str, Any]) -> None:
    if analysis.get("status") != "ok":
        console.print("[yellow]Odds reais indisponíveis para esta partida.[/yellow]")
        return
    strongest = analysis.get("strongest_market")
    if strongest:
        console.rule("[bold magenta]Mercado mais forte com odds[/bold magenta]")
        console.print(
            f"{strongest['selection']} @ {strongest['best_odd']:.2f} "
            f"({strongest['bookmaker']}) | modelo {_percent(strongest['model_probability'])} | "
            f"mercado justo {_percent(strongest['market_probability'])} | "
            f"edge {_percent(strongest['edge'])} | EV {_percent(strongest['ev'])}"
        )
    else:
        console.print(
            "[yellow]Nenhum mercado apresentou edge mínimo e valor esperado positivo.[/yellow]"
        )
    for key, title in (
        ("conservative_ticket", "Bilhete conservador"),
        ("aggressive_ticket", "Bilhete agressivo"),
    ):
        ticket = analysis.get(key)
        if not ticket:
            console.print(f"[yellow]{title}: nenhuma seleção qualificada.[/yellow]")
            continue
        table = Table("Seleção", "Odd", "Casa", "Modelo", "Edge", title=title)
        for selection in ticket["selections"]:
            table.add_row(
                selection["selection"],
                f"{selection['best_odd']:.2f}",
                str(selection["bookmaker"]),
                _percent(selection["model_probability"]),
                _percent(selection["edge"]),
            )
        console.print(table)
        console.print(
            f"Odd combinada teórica: {ticket['combined_odd_theoretical']:.2f} | "
            f"probabilidade estimada: {_percent(ticket['combined_probability_estimated'])} | "
            f"EV estimado: {_percent(ticket['estimated_ev'])}"
        )


def metrics_report(summary: dict[str, Any]) -> None:
    table = Table("Métrica", "Valor", title="Avaliação acumulada da data")
    for key, value in summary.items():
        table.add_row(key, str(value))
    console.print(table)


def backtest_report(report: dict[str, Any]) -> None:
    prediction = PredictionOutput.model_validate(report["prediction"])
    prediction_report(prediction)
    console.rule("[bold cyan]Verificação contra o resultado real[/bold cyan]")
    console.print(
        f"Treino: {report['training_matches']} jogos anteriores | "
        f"partida-alvo excluída: {'sim' if report['target_excluded'] else 'não'}"
    )
    console.print(
        f"Resultado real em 90 minutos: {report['actual']['regulation_score']} | "
        f"após prorrogação: {report['actual']['after_extra_time']}"
    )
    table = Table("Mercado", "Previsão", "Real", "Acertou")
    checks = report["checks"]
    result = checks["result"]
    table.add_row(
        "1X2",
        str(result["predicted"]),
        str(result["actual"]),
        "SIM" if result["correct"] else "NÃO",
    )
    btts = checks["both_teams_score"]
    table.add_row(
        "Ambas marcam",
        f"{'Sim' if btts['predicted'] else 'Não'} ({btts['probability']:.2f}%)",
        "Sim" if btts["actual"] else "Não",
        "SIM" if btts["correct"] else "NÃO",
    )
    for line in ("1.5", "2.5", "3.5"):
        check = checks[f"over_{line}"]
        table.add_row(
            f"Over {line}",
            f"{'Sim' if check['predicted'] else 'Não'} ({check['probability']:.2f}%)",
            "Sim" if check["actual"] else "Não",
            "SIM" if check["correct"] else "NÃO",
        )
    score = checks["top_score"]
    table.add_row(
        "Placar mais provável",
        str(score["predicted"]),
        str(score["actual"]),
        "SIM" if score["correct"] else "NÃO",
    )
    console.print(table)
    summary = report["summary"]
    console.print(
        f"Mercados binários/1X2: {summary['markets_correct']}/"
        f"{summary['markets_checked']} corretos ({summary['market_accuracy']:.2f}%)."
    )
