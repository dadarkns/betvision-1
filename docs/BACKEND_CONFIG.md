# Configuracao de Backend

Este documento padroniza como a equipe deve configurar Supabase, API esportiva e controles operacionais do BetVision.

## Arquivos

| Arquivo | Versionar? | Uso |
| --- | --- | --- |
| `frontend/.env.example` | Sim | Modelo compartilhável com nomes das variáveis e valores fictícios. |
| `frontend/.env` | Não | Configuração local real do app Expo. |
| `backend/.env` | Não | Configuração local opcional exclusiva do backend Python. |
| `frontend/src/config/backend.ts` | Sim | Leitura tipada e centralizada das variáveis públicas do frontend. |

## Como Configurar

Copie o exemplo:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Preencha os valores reais no `frontend/.env`.

Depois reinicie o servidor Expo:

```powershell
cd frontend
npm run web
```

## Variaveis

| Variavel | Obrigatoria | Dono | Descricao |
| --- | --- | --- | --- |
| `EXPO_PUBLIC_APP_ENV` | Sim | Dev | Ambiente: `development`, `staging` ou `production`. |
| `EXPO_PUBLIC_SUPABASE_URL` | Para login | Backend | URL publica do projeto Supabase. |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Para login | Backend | Chave anon publica do Supabase. Nunca usar `service_role`. |
| `EXPO_PUBLIC_APISPORTS_BASE_URL` | Sim | Backend | Base da API esportiva. Padrao: `https://v3.football.api-sports.io`. |
| `EXPO_PUBLIC_APISPORTS_KEY` | Para dados reais | Backend | Chave da API esportiva no ambiente de desenvolvimento. |
| `EXPO_PUBLIC_SPORTS_FIXTURE_LIMIT` | Nao | Dev | Quantidade maxima de jogos carregados por busca. |
| `EXPO_PUBLIC_SPORTS_REQUEST_TIMEOUT_MS` | Nao | Dev | Timeout das requisicoes esportivas em milissegundos. |
| `EXPO_PUBLIC_REAL_STATS_CACHE_VERSION` | Nao | Dev | Versao do cache local. Incremente quando mudar o mapeamento de dados. |
| `EXPO_PUBLIC_BETVISION_AI_BASE_URL` | Para teste IA local | Backend | URL do servidor local Python, ex.: `http://127.0.0.1:8765`. |
| `EXPO_PUBLIC_BETVISION_AI_TIMEOUT_MS` | Nao | Dev | Timeout das chamadas ao backend local de IA em milissegundos. |
| `BETVISION_AI_INCLUDE_ALL_LEAGUES` | Nao | Backend | `1` por padrao para prever todos os campeonatos retornados pela API. Use `0` para filtrar. |
| `BETVISION_AI_LEAGUE_IDS` | Nao | Backend | Lista de ligas separadas por virgula quando `BETVISION_AI_INCLUDE_ALL_LEAGUES=0`. |
| `BETVISION_AI_AUTO_ENABLED` | Nao | Backend | Liga/desliga o worker autonomo do backend local. Padrao: `1`. |
| `BETVISION_AI_AUTO_INTERVAL_MINUTES` | Nao | Backend | Intervalo entre atualizacoes automaticas. Padrao: `30`. |
| `BETVISION_AI_AUTO_LOOKAHEAD_DAYS` | Nao | Backend | Dias futuros buscados automaticamente. Padrao: `7`. |
| `BETVISION_AI_AUTO_BACKFILL_DAYS` | Nao | Backend | Dias passados reprocessados para settlement. Padrao: `2`. |
| `BETVISION_AI_AUTO_BUDGET` | Nao | Backend | Orcamento de chamadas por rodada automatica. Padrao: `60`. |
| `BETVISION_AI_AUTO_WEB_RESEARCH` | Nao | Backend | Ativa pesquisa web complementar com cache para enriquecer a analise. Padrao: `1`. |

## Regras da Equipe

- Nunca compartilhar `.env` em commit, print, chat publico ou issue.
- Nunca colocar `SUPABASE_SERVICE_ROLE_KEY` no app Expo.
- Variaveis `EXPO_PUBLIC_*` ficam acessiveis no cliente web/mobile.
- Para producao, a chave da API esportiva deve ir para um proxy/backend.
- Mudancas de nomes de variaveis devem atualizar estes arquivos juntos:
  - `frontend/.env.example`
  - `frontend/src/config/backend.ts`
  - `docs/BACKEND_CONFIG.md`
  - `README.md`

## Status em Runtime

O app usa `frontend/src/config/backend.ts` para validar se Supabase e API esportiva estão configurados.

Servicos que consomem essa configuracao:

- `frontend/src/services/supabase.ts`
- `frontend/src/services/sportsApi.ts`
- `frontend/src/services/realStatsRepository.ts`
- `frontend/src/services/betvisionAiRepository.ts`

## Teste com Backend Python Local

Para testar uma rodada autonoma:

```powershell
backend\.venv\Scripts\python -m betvision_ai auto
```

Ou gere previsoes de um periodo especifico:

```powershell
backend\.venv\Scripts\python -m betvision_ai upcoming --start-date 2026-06-26 --days 2 --budget 20
```

Suba o servidor local. Ele tambem inicia a atualizacao automatica quando `BETVISION_AI_AUTO_ENABLED=1`:

```powershell
backend\.venv\Scripts\python -m betvision_ai serve
```

Configure o Expo com:

```env
EXPO_PUBLIC_BETVISION_AI_BASE_URL=http://127.0.0.1:8765
```

Depois rode o frontend:

```powershell
cd frontend
npm run web
```
