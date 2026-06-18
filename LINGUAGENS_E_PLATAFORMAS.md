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
| Backend/Auth | Supabase JS | Supabase JS |
| Dados do MVP | TypeScript mockado | TypeScript mockado |
| Teste visual | Playwright | Verificacao manual/emulador ou E2E futuro |

## Linguagem Principal: TypeScript

TypeScript e a linguagem principal do projeto.

Ela e usada em:

- telas dentro de `app/`;
- componentes em `src/components/`;
- tipos de dominio em `src/types/domain.ts`;
- dados mockados em `src/data/mockMatches.ts`;
- servicos em `src/services/`;
- stores locais em `src/stores/`;
- tema em `src/theme.ts`.

TypeScript foi escolhido porque:

- reduz erro em modelos de dados complexos;
- ajuda a manter contratos entre partida, mercado, jogador e analise;
- funciona bem com React, React Native, Expo e Supabase;
- facilita reaproveitar codigo entre web, Android e iOS.

## JavaScript

JavaScript aparece indiretamente porque Expo, React Native e Node usam o ecossistema JavaScript.

No projeto, JavaScript e usado em arquivos de configuracao:

- `babel.config.js`
- `metro.config.js`

Esses arquivos configuram a transformacao e o empacotamento do app.

## TSX

TSX e a sintaxe usada para escrever componentes React com TypeScript.

Arquivos `.tsx` aparecem em:

- `app/*.tsx`
- `app/match/[id].tsx`
- `src/components/*.tsx`

TSX mistura estrutura visual, propriedades tipadas e logica de interacao.

Exemplo de uso no projeto:

- telas renderizam componentes;
- componentes recebem props tipadas;
- botoes chamam funcoes;
- textos, cards e listas sao montados de forma declarativa.

## JSON

JSON e usado para configuracao do projeto.

Arquivos principais:

- `package.json`: scripts, dependencias e metadados do projeto;
- `package-lock.json`: trava versoes instaladas;
- `app.json`: configuracao Expo, nome, slug, tema e plugins;
- `tsconfig.json`: configuracao do TypeScript.

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

- `app/index.tsx`: dashboard web/mobile.
- `app/radar.tsx`: filtros.
- `app/match/[id].tsx`: detalhe da partida.
- `src/components/AppChrome.tsx`: layout, header e navegacao.
- `src/theme.ts`: cores e tokens visuais.

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

- Telas em `app/`.
- Componentes em `src/components/`.
- Tipos em `src/types/domain.ts`.
- Dados mockados em `src/data/mockMatches.ts`.
- Gerador de analise em `src/services/analysisGenerator.ts`.
- Auth Supabase em `src/services/authService.ts`.
- Tema em `src/theme.ts`.

### O que pode exigir cuidado no mobile

- Tamanho de telas menores.
- Areas seguras do celular.
- Gestos e scroll.
- Performance em listas grandes.
- Login com deep links.
- Build final com EAS.
- Permissoes, notificacoes e publicacao nas lojas.

## Backend e Servicos

O backend planejado e Supabase.

Linguagem usada no app para consumir o backend:

- TypeScript com `@supabase/supabase-js`.

Arquivos:

- `src/services/supabase.ts`
- `src/services/authService.ts`

O app ainda nao possui backend proprio em Node, API REST customizada ou serverless functions.

## Persistencia Local

Favoritos e bilhetes usam AsyncStorage.

Linguagem:

- TypeScript.

Arquivo:

- `src/stores/useLocalSet.ts`

No web, AsyncStorage usa uma implementacao compativel com navegador. No mobile, usa armazenamento local do dispositivo.

## Estilizacao

A estilizacao e feita com `StyleSheet` do React Native.

Nao ha CSS separado no projeto.

Beneficios:

- mesma abordagem para web e mobile;
- tokens centralizados em `src/theme.ts`;
- menos divergencia entre plataformas;
- layout responsivo usando `useWindowDimensions`.

## Testes e Verificacao

Ferramentas usadas:

- TypeScript compiler para checagem estatica;
- Playwright para verificacao web;
- Expo web server para validacao visual.

Comandos:

```bash
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
