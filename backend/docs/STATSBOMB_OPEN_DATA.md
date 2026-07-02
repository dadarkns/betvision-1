# StatsBomb Open Data

Fonte: <https://github.com/statsbomb/open-data>

O repositório completo tem vários gigabytes. O BetVision importa seletivamente apenas as Copas masculinas de 2018 e 2022:

```powershell
backend\.venv\Scripts\python -m betvision_ai import-statsbomb
```

Os dados ficam em `backend/data/sources/statsbomb-open-data` e não consomem a cota da API-Football.

Estrutura importada:

- `data/competitions.json`
- `data/matches/43/3.json` — Copa de 2018
- `data/matches/43/106.json` — Copa de 2022
- `data/events/<match_id>.json`
- `data/lineups/<match_id>.json`

Ao publicar ou distribuir análises derivadas, atribua a fonte à **StatsBomb** e siga os termos descritos no README e no arquivo `LICENSE.pdf` do repositório original.
