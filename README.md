# 🎯 BetVision

**App web/mobile de estatísticas, probabilidades e análises de futebol** para apostadores analisarem dados antes de fazer suas apostas.

Criado com **Expo**, **React Native**, **TypeScript** e **Expo Router** para máxima compatibilidade web, Android e iOS.

---

## 📋 Visão Geral

O MVP oferece uma experiência completa de análise esportiva:

✅ Dashboard com partidas monitoradas  
✅ Radar inteligente com filtros por mercado e probabilidade  
✅ Análise profunda de cada jogo  
✅ Favoritos salvos localmente  
✅ Bilhetes conservadores e agressivos  
✅ Autenticação via Supabase  
✅ Tema escuro premium  
✅ Dados mockados com análises locais  

---

## 🛠️ Stack Tecnológico

| Tecnologia | Versão | Propósito |
|-----------|--------|----------|
| **Expo** | 54 | Framework React Native |
| **React Native** | 0.81 | Mobile/Web |
| **React** | 19 | UI Library |
| **TypeScript** | 5.9 | Type Safety |
| **Expo Router** | 6 | Navegação/Rotas |
| **Supabase** | 2.86 | Backend & Auth |
| **AsyncStorage** | 2.2 | Persistência Local |
| **Lucide Icons** | 0.561 | Ícones |

---

## 🚀 Quick Start

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
cp .env.example .env
# Preencher com credenciais Supabase
```

### 3. Rodar
```bash
npm run web          # Navegador
npm run android      # Android
npm run ios         # iOS
npm run typecheck   # Verificar tipos
```

---

## 📁 Estrutura do Projeto

```
src/                          ← 💻 Código-fonte
├─ components/               ← Componentes React
│  ├─ common/               ← Base (Button, Card, etc)
│  ├─ dashboard/            ← Dashboard
│  ├─ match/                ← Análise de partidas
│  ├─ radar/                ← Filtros
│  └─ auth/                 ← Autenticação
├─ pages/                    ← Telas principais
├─ services/                 ← API & Supabase
├─ hooks/                    ← Custom Hooks
├─ types/                    ← TypeScript Types
├─ utils/                    ← Funções auxiliares
├─ constants/                ← Constantes
├─ styles/                   ← Temas
└─ assets/                   ← Imagens & Ícones

app/                          ← 🔀 Expo Router (Navegação)

docs/                         ← 📚 Documentação
├─ design/                   ← Screenshots & Design System
└─ guides/                   ← Guias de Setup, Backend, etc

config/                       ← ⚙️ Configuração
.logs/                        ← 📝 Logs (gitignore)
```

📖 **[Ver estrutura completa →](./docs/PROJECT_STRUCTURE.md)**

---

## 🔧 Configuração

### Variáveis de Ambiente
```env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

### Path Aliases (Imports)
```typescript
import type { Match } from '@/types';
import { Button } from '@/components/common';
import { formatDate } from '@/utils';
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [**Setup & Instalação**](./docs/guides/SETUP.md) | Como começar |
| [**Estrutura do Projeto**](./docs/PROJECT_STRUCTURE.md) | Overview de arquivos e pastas |
| [**Design System**](./docs/design/DESIGN_SYSTEM.md) | Cores, tipografia, componentes |
| [**Backend & API**](./docs/guides/BACKEND_INTEGRATION.md) | Integração Supabase |
| [**Referência de Arquivos**](./docs/guides/FILE_REFERENCE.md) | O que cada arquivo faz |
| [**Arquitetura**](./ARCHITECTURE.md) | Padrões e convenções |

---

## 📦 Scripts Disponíveis

```bash
npm start              # Iniciar Expo
npm run web           # Rodar no navegador
npm run android       # Rodar no Android
npm run ios          # Rodar no iOS
npm run typecheck    # Verificar TypeScript
```

---

## 🎨 Design

📸 **Screenshots:** Ver em [`docs/design/screenshots/`](./docs/design/screenshots/)

🎯 **Protótipo:** [Google Stitch Design](https://stitch.withgoogle.com/projects/15019367461677503836)

---

## 🚀 Roadmap

- [ ] Componentes base
- [ ] Services de integração
- [ ] Custom hooks
- [ ] Temas e estilos
- [ ] Páginas principais
- [ ] Autenticação Supabase
- [ ] Sincronização de dados
- [ ] Testes e validações

---

## 📝 Estrutura de Telas

```
Dashboard (Home)
├─ Radar (Filtros)
├─ Match/:id (Análise)
├─ Favorites (Favoritos)
├─ Slips (Bilhetes)
├─ Profile (Perfil)
└─ Auth (Login/Signup)
```

---

## 💡 Convenções

✅ Components em **PascalCase** (ex: `MatchCard.tsx`)  
✅ Services/Hooks em **camelCase** (ex: `useAuth.ts`)  
✅ Imports com **@/** alias  
✅ Types em **`types/`** folder  
✅ Utils sem dependências (puras)  

---

## 📞 Contato & Suporte

Para dúvidas sobre o projeto, consulte os [**docs**](./docs/) ou revise o [**ARCHITECTURE.md**](./ARCHITECTURE.md)

---

## 📄 Estrutura de Telas (Expo Router)

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
