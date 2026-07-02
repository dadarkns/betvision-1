# Linguagens e Plataformas do BetVision

Este documento explica quais linguagens, tecnologias e runtimes sao usados no BetVision para a versao web e para a futura versao mobile Android/iOS.

## Resumo Rapido

| Camada | Web | Mobile Android/iOS |
| --- | --- | --- |
| Linguagem principal | TypeScript | TypeScript |
| UI | React Native Web | React Native |
| Navegacao | Expo Router | Expo Router |
| Runtime | Navegador | Expo Go ou build nativo |
| Estilizacao | StyleSheet do React Native | StyleSheet do React Native |
| Estado local | React Hooks + AsyncStorage | React Hooks + AsyncStorage |
| Backend/Auth | Supabase JS + IA Python local | Supabase JS + IA Python local |
| Dados do MVP | API-FOOTBALL e BetVision AI | API-FOOTBALL e BetVision AI |
| Teste visual | Playwright | Verificacao manual/emulador ou E2E futuro |

## Linguagem Principal: TypeScript

TypeScript e a linguagem principal do projeto.

Ela e usada em:

- telas dentro de `frontend/app/`;
- componentes em `frontend/src/components/`;
- tipos de domínio em `frontend/src/types/domain.ts`;
- cliente API esportiva em `frontend/src/services/sportsApi.ts`;
- agregador/cache de estatísticas reais em `frontend/src/services/realStatsRepository.ts`;
- serviços em `frontend/src/services/`;
- stores locais em `frontend/src/stores/`;
- tema em `frontend/src/theme.ts`.

TypeScript foi escolhido porque:

- reduz erro em modelos de dados complexos;
- ajuda a manter contratos entre partida, mercado, jogador e analise;
- funciona bem com React, React Native, Expo e Supabase;
- facilita reaproveitar codigo entre web, Android e iOS.

## JavaScript

JavaScript aparece indiretamente porque Expo, React Native e Node usam o ecossistema JavaScript.

No projeto, JavaScript e usado em arquivos de configuracao:

- `frontend/babel.config.js`
- `frontend/metro.config.js`

Esses arquivos configuram a transformacao e o empacotamento do app.

## TSX

TSX e a sintaxe usada para escrever componentes React com TypeScript.

Arquivos `.tsx` aparecem em:

- `frontend/app/*.tsx`
- `frontend/app/match/[id].tsx`
- `frontend/src/components/*.tsx`

TSX mistura estrutura visual, propriedades tipadas e logica de interacao.

Exemplo de uso no projeto:

- telas renderizam componentes;
- componentes recebem props tipadas;
- botoes chamam funcoes;
- textos, cards e listas sao montados de forma declarativa.

## JSON

JSON e usado para configuracao do projeto.

Arquivos principais:

- `frontend/package.json`: scripts, dependências e metadados do frontend;
- `frontend/package-lock.json`: trava versões instaladas;
- `frontend/app.json`: configuração Expo, nome, slug, tema e plugins;
- `frontend/tsconfig.json`: configuração do TypeScript.

## Markdown

Markdown e usado para documentacao.

Arquivos:

- `README.md`
- `docs/LINGUAGENS_E_PLATAFORMAS.md`

## Web

Na versao web, o app roda com:

- TypeScript;
- React;
- React Native Web;
- Expo Router;
- Metro Bundler;
- navegador como runtime.

O comando principal e:

```bash
cd frontend
npm run web
```

Fluxo simplificado:

```text
TypeScript/TSX
  -> Metro/Babel
  -> React Native Web
  -> HTML/CSS/JavaScript no navegador
```

Mesmo que o projeto nao escreva HTML e CSS manualmente, o React Native Web converte os componentes React Native para elementos web.

### Arquivos importantes para web

- `frontend/app/index.tsx`: dashboard web/mobile.
- `frontend/app/radar.tsx`: filtros.
- `frontend/app/match/[id].tsx`: detalhe da partida.
- `frontend/src/components/AppChrome.tsx`: layout, header e navegação.
- `frontend/src/theme.ts`: cores e tokens visuais.
- `frontend/src/services/realStatsRepository.ts`: fixtures reais, cache e normalização.

## Mobile Android e iOS

Na versao mobile, o app usa a mesma base:

- TypeScript;
- React Native;
- Expo;
- Expo Router;
- componentes compartilhados;
- servicos compartilhados;
- dados/tipos compartilhados.

Comandos:

```bash
cd frontend
npm run android
npm run ios
```

Fluxo simplificado:

```text
TypeScript/TSX
  -> Metro/Babel
  -> React Native
  -> Android/iOS via Expo
```

No mobile, os componentes nao viram HTML. Eles sao renderizados como componentes nativos por React Native.

### O que e compartilhado com a web

- Telas em `frontend/app/`.
- Componentes em `frontend/src/components/`.
- Tipos em `frontend/src/types/domain.ts`.
- Dados reais e cache em `frontend/src/services/realStatsRepository.ts`.
- Gerador de análise em `frontend/src/services/analysisGenerator.ts`.
- Auth Supabase em `frontend/src/services/authService.ts`.
- Tema em `frontend/src/theme.ts`.

### O que pode exigir cuidado no mobile

- Tamanho de telas menores.
- Areas seguras do celular.
- Gestos e scroll.
- Performance em listas grandes.
- Login com deep links.
- Build final com EAS.
- Permissoes, notificacoes e publicacao nas lojas.

## Backend e Serviços

O projeto tem duas partes de backend:

- Supabase para autenticação e dados de usuário.
- `backend/` em Python para a IA de probabilidades da Copa.

Linguagem usada no app para consumir o backend:

- TypeScript com `@supabase/supabase-js`.
- TypeScript com `fetch` para consumir o servidor local da BetVision AI.
- Python 3.12 no pacote `backend/betvision_ai`.

Arquivos:

- `frontend/src/services/supabase.ts`
- `frontend/src/services/authService.ts`
- `frontend/src/services/betvisionAiRepository.ts`
- `backend/betvision_ai/`

As estatísticas esportivas reais podem ser consumidas diretamente pelo frontend em desenvolvimento, mas a IA Python centraliza previsões, cache e análise para evitar lógica pesada no cliente.

## Persistencia Local

Favoritos e bilhetes usam AsyncStorage.

Linguagem:

- TypeScript.

Arquivo:

- `frontend/src/stores/useLocalSet.ts`

No web, AsyncStorage usa uma implementacao compativel com navegador. No mobile, usa armazenamento local do dispositivo.

## Estilizacao

A estilizacao e feita com `StyleSheet` do React Native.

Nao ha CSS separado no projeto.

Beneficios:

- mesma abordagem para web e mobile;
- tokens centralizados em `frontend/src/theme.ts`;
- menos divergencia entre plataformas;
- layout responsivo usando `useWindowDimensions`.

## Testes e Verificacao

Ferramentas usadas:

- TypeScript compiler para checagem estatica;
- Playwright para verificacao web;
- Expo web server para validacao visual.

Comandos:

```bash
cd frontend
npm run typecheck
npm run web
```

Playwright esta instalado como dependencia de desenvolvimento para validar rotas e capturas web.

## Decisao de Arquitetura

A decisao central e manter uma base unica em TypeScript + Expo.

Isso evita criar:

- um site separado em HTML/CSS/JavaScript puro;
- um app Android separado em Kotlin;
- um app iOS separado em Swift;
- duas bases de interface diferentes.

Quando o app for para mobile, a maior parte do codigo ja estara pronta para reaproveitamento.

## Quando Outras Linguagens Podem Entrar

No futuro, outras linguagens podem aparecer se o produto crescer:

- SQL: tabelas, policies e queries no Supabase/Postgres.
- JavaScript/TypeScript server-side: funcoes serverless ou backend proprio.
- Kotlin: codigo nativo Android especifico, se necessario.
- Swift: codigo nativo iOS especifico, se necessario.

Para o MVP atual, nenhuma dessas linguagens e obrigatoria.
