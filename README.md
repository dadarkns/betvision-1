# BetVision

Projeto organizado em duas partes principais:

- `frontend/`: app Expo/React Native com interface web/mobile.
- `backend/`: IA local em Python para gerar probabilidades, previsões e análises.

## Estrutura

```text
frontend/
  app/                 Rotas Expo Router
  src/                 Componentes, serviços, tema e tipos
  assets/              Imagens do app
  package.json         Scripts do frontend

backend/
  betvision_ai/        Pacote Python da IA
  tests/               Testes do backend
  data/                Cache, modelos, previsões e saídas locais

docs/
  BACKEND_CONFIG.md    Guia de variáveis e integração
```

## Rodar o frontend

```powershell
cd frontend
npm run web
```

TypeScript:

```powershell
cd frontend
npm run typecheck
```

## Rodar o backend de IA

Da raiz do projeto:

```powershell
backend\.venv\Scripts\python -m betvision_ai status
backend\.venv\Scripts\python -m betvision_ai daily --date 2026-06-26 --no-odds
backend\.venv\Scripts\python -m betvision_ai serve
```

Testes:

```powershell
backend\.venv\Scripts\python -m pytest backend\tests -m "not live_api"
```

## Integração local frontend + IA

1. Gere previsões no backend.
2. Suba o servidor local da IA:

```powershell
backend\.venv\Scripts\python -m betvision_ai serve
```

3. Em outro terminal, rode o frontend:

```powershell
cd frontend
$env:EXPO_PUBLIC_BETVISION_AI_BASE_URL="http://127.0.0.1:8765"
npm run web
```

## Ambiente

O frontend usa `frontend/.env`.

O backend lê variáveis de:

1. variáveis do sistema;
2. `backend/.env`;
3. `frontend/.env`;
4. `.env` na raiz, se existir.

Arquivos `.env`, caches, modelos, `node_modules` e saídas geradas ficam ignorados pelo Git.
