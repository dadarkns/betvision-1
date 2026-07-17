# Paleta de Cores do Frontend - BetVision

Documento exclusivo com as cores atualmente usadas no frontend do BetVision.

## Fonte Principal

Arquivo de referencia: `frontend/src/theme.ts`

O frontend possui dois temas:

- `lightColors`: tema claro.
- `darkColors`: tema escuro, definido como tema inicial do app.

## Tema Claro

| Token | Cor | Uso previsto |
| --- | --- | --- |
| `background` | `#f1f4f8` | Fundo geral das telas |
| `surface` | `#ffffff` | Cards, paineis e superficies principais |
| `surfaceAlt` | `#f5f7fb` | Superficies secundarias |
| `surfaceRaised` | `#ffffff` | Elementos elevados |
| `ink` | `#101828` | Texto principal |
| `muted` | `#667085` | Texto secundario |
| `line` | `#e2e7ef` | Bordas e divisorias |
| `primary` | `#1769e8` | Cor primaria de acao |
| `primaryDark` | `#0b4fbd` | Variacao forte da primaria |
| `onPrimary` | `#ffffff` | Texto sobre cor primaria |
| `secondary` | `#12b76a` | Destaques positivos/secundarios |
| `danger` | `#e03131` | Erros, alertas e risco |
| `info` | `#0ea5e9` | Informacao e estados neutros ativos |
| `navy` | `#092f73` | Azul institucional escuro |
| `silver` | `#98a2b3` | Texto auxiliar e elementos frios |
| `glow` | `rgba(23, 105, 232, 0.16)` | Brilho/sombra azul suave |
| `live` | `#e03131` | Status ao vivo |
| `overlay` | `rgba(16, 24, 40, 0.06)` | Sobreposicao clara |

## Tema Escuro

| Token | Cor | Uso previsto |
| --- | --- | --- |
| `background` | `#0b0d10` | Fundo geral das telas |
| `surface` | `#12151b` | Cards, paineis e superficies principais |
| `surfaceAlt` | `#1a1e25` | Superficies secundarias |
| `surfaceRaised` | `#171b21` | Elementos elevados |
| `ink` | `#f3f5f7` | Texto principal |
| `muted` | `#a5ad9f` | Texto secundario |
| `line` | `#2b3038` | Bordas e divisorias |
| `primary` | `#65ff4b` | Cor primaria de acao |
| `primaryDark` | `#b9f7ad` | Variacao clara da primaria |
| `onPrimary` | `#071006` | Texto sobre cor primaria |
| `secondary` | `#65ff4b` | Destaques positivos/secundarios |
| `danger` | `#ff7b7b` | Erros, alertas e risco |
| `info` | `#78e7ff` | Informacao e estados neutros ativos |
| `navy` | `#0e1116` | Azul/preto institucional |
| `silver` | `#727b70` | Texto auxiliar e elementos frios |
| `glow` | `rgba(101, 255, 75, 0.2)` | Brilho/sombra verde suave |
| `live` | `#ff6b6b` | Status ao vivo |
| `overlay` | `rgba(0, 0, 0, 0.22)` | Sobreposicao escura |

## Paleta do Performance Shell

Arquivo de referencia: `frontend/src/components/PerformanceShell.tsx`

Esta paleta e usada no layout principal, cabecalho, navegacao e dock mobile.

| Token | Cor | Uso previsto |
| --- | --- | --- |
| `bg` | `#0c0f12` | Fundo principal do shell |
| `header` | `#111a14` | Cabecalho |
| `panel` | `#171b21` | Paineis |
| `panel2` | `#1c2027` | Paineis ativos ou destacados |
| `line` | `#292e36` | Bordas e divisorias |
| `green` | `#5cff4a` | Marca, item ativo e destaque |
| `pale` | `#b9c8b3` | Texto claro secundario |
| `text` | `#eef0f3` | Texto principal |
| `muted` | `#7d8779` | Texto apagado |
| `cyan` | `#62dbe8` | Destaque informativo |
| `red` | `#dd8c91` | Destaque negativo/risco |

## Cores Locais Ainda Usadas

As cores abaixo aparecem diretamente em telas ou servicos do frontend, fora do arquivo principal de tema.

| Cor | Onde aparece | Observacao |
| --- | --- | --- |
| `#20242a` | `frontend/app/favorites.tsx` | Cabecalho de tabela |
| `#aeb4be` | `frontend/app/favorites.tsx` | Texto auxiliar |
| `#a5a5a5` | `frontend/app/favorites.tsx` | Texto cinza |
| `#d7dae1` | `frontend/app/index.tsx` | Placar/time visitante |
| `#071006` | `frontend/app/index.tsx`, `frontend/src/theme.ts` | Texto sobre verde primario |
| `#17331d` | `frontend/app/index.tsx` | Chip ativo de liga |
| `#122018` | `frontend/app/index.tsx`, `frontend/app/match/[id].tsx` | Banner/disclaimer escuro |
| `#285234` | `frontend/app/index.tsx` | Borda de banner |
| `#183021` | `frontend/app/index.tsx` | Fundo de icone |
| `#202329` | `frontend/app/index.tsx` | Barra de competicao |
| `#285d38` | `frontend/app/profile.tsx` | Borda de imagem |
| `#275028` | `frontend/app/profile.tsx` | Texto de tag |
| `#d5d7de` | `frontend/app/profile.tsx` | Valor de metrica |
| `#1d3824` | `frontend/app/match/[id].tsx` | Badge de qualidade |
| `#32663d` | `frontend/app/match/[id].tsx` | Borda de badge |
| `#254a31` | `frontend/app/match/[id].tsx` | Borda de disclaimer |
| `#3b82f6` | `frontend/src/services/*Repository.ts` | Cor de destaque para mandante |
| `#cbd5e1` | `frontend/src/services/*Repository.ts` | Cor de destaque para visitante |
| `#030703` | `frontend/app.json` | Fundo do adaptive icon Android |

## Observacoes de Implementacao

- O app inicia em tema escuro por padrao.
- A preferencia de tema e salva em `AsyncStorage` com a chave `betvision:theme`.
- Para manter consistencia visual, novas telas devem priorizar os tokens de `frontend/src/theme.ts`.
- As cores locais podem ser migradas futuramente para tokens nomeados, reduzindo divergencias entre telas.
