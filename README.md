# BetVision

BetVision e um app web/mobile de estatisticas, probabilidades e analises de futebol, criado com Expo, React Native, TypeScript e Expo Router.

O projeto roda primeiro como site, mas ja esta estruturado para evoluir para Android e iOS usando a mesma base de telas, componentes e logica.

## Visao Geral

O MVP entrega uma experiencia de radar esportivo com:

- Dashboard de partidas monitoradas.
- Radar de filtros por mercado e probabilidade minima.
- Pagina completa de analise por jogo.
- Favoritos salvos localmente.
- Bilhetes conservadores e agressivos salvos localmente.
- Login/cadastro preparado para Supabase.
- Tema escuro inspirado na identidade visual da marca.
- Dados mockados e gerador local deterministico de analises.

O app nao consome odds reais, APIs esportivas reais nem servicos pagos de IA nesta fase.

## Stack

- Expo 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Supabase JS
- AsyncStorage
- Lucide React Native
- Playwright para verificacao visual e de rotas

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Rode no navegador:

```bash
npm run web
```

Rode no Android:

```bash
npm run android
```

Rode no iOS:

```bash
npm run ios
```

Verifique TypeScript:

```bash
npm run typecheck
```

## Variaveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Sem essas variaveis, as telas de autenticacao continuam visiveis, mas o login real exibe aviso pedindo configuracao do Supabase.

## Estrutura do Projeto

```text
app/
  _layout.tsx              Layout raiz do Expo Router
  index.tsx                Dashboard de jogos
  radar.tsx                Filtros de mercados
  favorites.tsx            Favoritos salvos
  slips.tsx                Bilhetes salvos
  profile.tsx              Perfil, avisos e status da conta
  auth.tsx                 Login/cadastro via Supabase
  match/[id].tsx           Analise completa da partida

assets/images/
  betvision-logo.png       Logomarca usada no app

src/
  components/              Componentes visuais reutilizaveis
  data/mockMatches.ts      Base mockada de partidas e mercados
  services/                Supabase, auth, repositorio e analise
  stores/useLocalSet.ts    Persistencia local de favoritos/bilhetes
  types/domain.ts          Tipos centrais do dominio
  theme.ts                 Paleta, espacamento, raios e sombras
```

## Rotas

| Rota | Funcao |
| --- | --- |
| `/` | Dashboard com resumo e partidas monitoradas |
| `/radar` | Busca e filtros por mercado/probabilidade |
| `/favorites` | Lista de jogos favoritos |
| `/slips` | Bilhetes salvos |
| `/profile` | Perfil, status de Supabase e jogo responsavel |
| `/auth` | Entrar ou criar conta |
| `/match/[id]` | Analise aprofundada de uma partida |

## Modelo de Dados

Os tipos principais ficam em `src/types/domain.ts`:

- `Team`
- `Player`
- `Match`
- `MarketProbability`
- `PlayerProp`
- `BetSlipSuggestion`
- `MatchAnalysis`

As partidas mockadas ficam em `src/data/mockMatches.ts`.

Cada partida contem:

- competicao, rodada, data e estadio;
- times, jogadores e forma recente;
- mercados de resultado, dupla chance, gols, chutes, chutes no gol, escanteios, faltas, cartoes e handicap;
- props de jogadores;
- placar projetado;
- projecoes por time.

## Gerador de Analise

O arquivo `src/services/analysisGenerator.ts` transforma uma `Match` em uma `MatchAnalysis`.

Ele monta:

- titulo da analise;
- resumo narrativo;
- secoes de probabilidades;
- placares provaveis;
- projecoes de chutes, escanteios, faltas e cartoes;
- jogadores com maior chance de finalizacoes;
- mercados mais fortes;
- bilhete conservador;
- bilhete agressivo;
- palpite final e confianca.

O gerador e deterministico: a mesma partida sempre gera a mesma analise, sem chamada externa.

## Autenticacao

A autenticacao esta preparada para Supabase:

- `src/services/supabase.ts` cria o client.
- `src/services/authService.ts` expoe login, cadastro e logout.
- `app/auth.tsx` exibe o fluxo visual.

Enquanto `.env` nao estiver configurado, o app bloqueia a chamada real e mostra uma mensagem amigavel.

## Persistencia Local

Favoritos e bilhetes usam AsyncStorage via `src/stores/useLocalSet.ts`.

Chaves usadas:

- `betvision:favorites`
- `betvision:slips`

Isso permite testar fluxos reais de salvar/remover sem backend.

## Tema e Marca

O tema fica em `src/theme.ts`.

A identidade atual usa:

- fundo preto/grafite;
- verde neon;
- prata/cinza claro;
- cards escuros com bordas discretas;
- elementos ativos em verde;
- logo em `assets/images/betvision-logo.png`.

O app esta configurado como tema escuro em `app.json`.

## Verificacao

Checklist recomendado antes de entregar mudancas:

```bash
npm run typecheck
npm run web
```

Rotas que devem abrir sem erro:

- `/`
- `/radar`
- `/favorites`
- `/slips`
- `/profile`
- `/auth`
- `/match/mexico-south-korea`

Para verificacao visual com Playwright:

```bash
npx playwright install chromium
```

Depois capture ou teste as rotas conforme necessario.

## Limitacoes Atuais

- Dados sao mockados.
- Nao ha odds reais.
- Nao ha integracao com API esportiva.
- Nao ha cobranca/assinatura.
- Supabase precisa de variaveis reais para autenticacao funcionar de ponta a ponta.
- O gerador de analise simula IA localmente, sem modelo externo.

## Proximos Passos Sugeridos

1. Configurar projeto Supabase real.
2. Criar tabela de perfis e preferencias do usuario.
3. Migrar favoritos e bilhetes para banco quando o usuario estiver logado.
4. Adicionar painel admin para cadastrar jogos e probabilidades.
5. Integrar uma API esportiva para calendario, escalacoes e estatisticas.
6. Criar camada de odds/probabilidades reais por fornecedor.
7. Preparar build mobile com EAS.
8. Adicionar testes automatizados para servicos e rotas criticas.

## Aviso

BetVision apresenta probabilidades estimadas para analise esportiva. Nao ha garantia de resultado. O conteudo e destinado a maiores de 18 anos e deve ser usado com responsabilidade.
