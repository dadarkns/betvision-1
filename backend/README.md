# BetVision AI Backend

Backend Python executado exclusivamente pelo terminal. Ele não abre navegador, porta HTTP ou servidor local.

## Instalação

No diretório raiz do projeto:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python -m pip install -e "backend[test]"
```

Os comandos abaixo podem ser executados da raiz usando o Python do ambiente:

```powershell
backend\.venv\Scripts\python -m betvision_ai status
backend\.venv\Scripts\python -m betvision_ai collect --season 2022
backend\.venv\Scripts\python -m betvision_ai import-statsbomb
backend\.venv\Scripts\python -m betvision_ai prepare --season 2022
backend\.venv\Scripts\python -m betvision_ai train --season 2022
backend\.venv\Scripts\python -m betvision_ai backtest --fixture-id 979139
backend\.venv\Scripts\python -m betvision_ai daily
backend\.venv\Scripts\python -m betvision_ai daily --date 2026-06-25 --odds
backend\.venv\Scripts\python -m betvision_ai settle --date 2026-06-24
backend\.venv\Scripts\python -m betvision_ai predict --input backend\inputs\jogo.example.json
```

Depois de instalar o pacote no Python principal, também funciona diretamente como:

```powershell
python -m betvision_ai daily
```

## Economia de API

- `daily`: uma chamada para todos os fixtures da data e uma chamada de features por jogo ainda não previsto.
- Respostas são armazenadas em `backend/data/cache`.
- Repetir o comando dentro da validade do cache não consome chamadas.
- Cada execução aceita `--budget`; o padrão é 20.
- A reserva padrão protege as últimas 10 chamadas da cota diária.
- Chamadas reais são espaçadas por 6,2 segundos para respeitar o rate-limit do plano Free.
- `collect` retoma do último fixture histórico salvo.
- Testes automatizados não acessam a rede.

## Odds e bilhetes

Configure `ODDS_API_KEY` no `.env`. O backend consulta The Odds API uma vez por data, usando apenas a região europeia e os mercados `h2h`, `totals` e `spreads`.

O relatório compara a probabilidade do modelo com a probabilidade implícita sem margem da casa e calcula:

- melhor odd e bookmaker;
- edge do modelo;
- valor esperado;
- mercado mais forte;
- bilhete conservador e agressivo.

Bilhetes combinados são estimativas teóricas. A casa pode não aceitar determinada combinação na mesma partida.

O importador StatsBomb usa arquivos públicos do GitHub e não consome a cota da API-Football. Por padrão, baixa apenas as Copas de 2018 e 2022. Consulte `docs/STATSBOMB_OPEN_DATA.md` para atribuição e estrutura.

Os campos `percent`, `winner`, `advice`, `under_over` e placar sugerido da resposta de `predictions` não entram no modelo. Apenas forma e estatísticas brutas dos times são convertidas em features.

`backtest` não acessa a API nem altera o modelo diário. Ele treina um ensemble temporário usando somente partidas anteriores à escolhida. Em jogos com prorrogação, os mercados são avaliados pelo placar de 90 minutos (`score.fulltime`).

## Limitações

A Copa de 2022 possui somente 64 partidas. O relatório marca a confiança como baixa e o XGBoost recebe peso somente quando supera o Poisson no bloco cronológico de validação. Mercados estatísticos usam médias históricas até que a coleta gradual forneça amostras suficientes. Props individuais só aparecem quando o JSON contém estatísticas por 90 minutos ou quando houver modelo individual treinado.
