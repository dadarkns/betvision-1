# 📊 Mapa Visual do Projeto

## 🎯 Fluxo de Desenvolvimento

```
┌─────────────────────────────────────────────────────────┐
│  USUARIO / DESIGNER / PM                                 │
│  ↓ Requisitos & Mockups                                  │
├─────────────────────────────────────────────────────────┤
│  docs/design/ ← Screenshots, Design System              │
│  ↓                                                       │
├─────────────────────────────────────────────────────────┤
│  src/components/ ← Criar componentes base               │
│  src/types/ ← Definir types TypeScript                  │
│  ↓                                                       │
├─────────────────────────────────────────────────────────┤
│  src/services/ ← Integrar com Backend/Supabase          │
│  src/hooks/ ← Lógica reutilizável                       │
│  ↓                                                       │
├─────────────────────────────────────────────────────────┤
│  app/ (Expo Router) ← Montar páginas                    │
│  ↓                                                       │
├─────────────────────────────────────────────────────────┤
│  npm run web ← Testar                                   │
│  ↓                                                       │
├─────────────────────────────────────────────────────────┤
│  GIT COMMIT & PUSH                                       │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 O que cada pasta faz?

### `src/components/` - Componentes Reutilizáveis

```
components/
├─ common/          → Button, Card, Header, Input
├─ dashboard/       → MatchList, FilterBar, StatsCard
├─ match/           → MatchHeader, AnalysisPanel, Chart
├─ radar/           → FilterPanel, MarketSelector
└─ auth/            → LoginForm, SignupForm, ForgotPassword
```

**Quando criar:** Toda vez que você tiver um elemento UI que se repete

---

### `src/services/` - Integração com APIs

```
services/
├─ supabase.ts      → Cliente Supabase
├─ authService.ts   → Login, Logout, Signup
├─ matchService.ts  → Buscar partidas, análises
└─ analysisService.ts → Gerar análises
```

**Quando criar:** Quando precisa chamar uma API ou Backend

---

### `src/hooks/` - Lógica Reutilizável

```
hooks/
├─ useAuth.ts       → Gerenciar autenticação
├─ useMatches.ts    → Buscar e filtrar partidas
├─ useFilter.ts     → Gerenciar filtros do radar
└─ useFavorites.ts  → Salvar/remover favoritos
```

**Quando criar:** Quando tem lógica que múltiplos componentes usam

---

### `src/types/` - TypeScript Definitions

```
types/
├─ match.ts         → Match, Team, Odds, Statistics
├─ user.ts          → User, AuthCredentials, Preferences
└─ bet.ts           → Bet, Slip, BetMarket
```

**Quando criar:** Nova entidade do domínio (Match, User, etc)

---

### `src/utils/` - Funções Puras

```
utils/
├─ formatters.ts    → formatDate, formatCurrency
├─ validators.ts    → isValidEmail, isValidPassword
└─ helpers.ts       → calculateOdd, groupBy, etc
```

**Quando criar:** Função que pode ser usada em qualquer lugar

---

### `src/constants/` - Valores Fixos

```
constants/
├─ api.ts           → URLs, endpoints
└─ markets.ts       → BET_MARKETS, MIN_PROBABILITY
```

**Quando criar:** Valores que não mudam durante a execução

---

### `docs/` - Documentação & Design

```
docs/
├─ design/
│  ├─ screenshots/   ← Imagens do app
│  └─ DESIGN_SYSTEM.md ← Cores, tipografia
└─ guides/
   ├─ SETUP.md       ← Como instalar
   ├─ BACKEND_INTEGRATION.md ← APIs
   └─ FILE_REFERENCE.md ← O que cada arquivo faz
```

---

## 🔄 Ciclo de Criação de Feature

### 1️⃣ Criar Type (Type-First Development)
```typescript
// src/types/match.ts
export interface Match {
  id: string;
  homeTeam: Team;
  // ...
}
```

### 2️⃣ Criar Component
```typescript
// src/components/dashboard/MatchCard.tsx
export const MatchCard: React.FC<{ match: Match }> = ({ match }) => {
  // ...
};
```

### 3️⃣ Criar Service (se precisar dados)
```typescript
// src/services/matchService.ts
export const matchService = {
  async getMatches() { /* ... */ }
};
```

### 4️⃣ Criar Hook (se precisar lógica)
```typescript
// src/hooks/useMatches.ts
export const useMatches = () => {
  // Usar service, gerenciar estado
};
```

### 5️⃣ Usar em Page (Expo Router)
```typescript
// app/index.tsx
export default function Dashboard() {
  const { matches } = useMatches();
  return matches.map(m => <MatchCard key={m.id} match={m} />);
}
```

---

## ✅ Checklist para Novo Arquivo

```
□ Está na pasta certa?
□ Segue a convenção de nome?
□ Tem tipos TypeScript?
□ Está exportado?
□ Tem comentários/docs?
□ Pode ser reutilizado?
□ Segue o padrão do projeto?
```

---

## 🎯 Estrutura Raiz (Explicada)

```
betvision-1/
│
├─ 📦 Arquivos de Configuração
│  ├─ package.json        ← Dependências e scripts
│  ├─ tsconfig.json       ← TypeScript config
│  ├─ babel.config.js     ← Babel plugins
│  ├─ metro.config.js     ← Metro bundler
│  └─ app.json            ← Expo config
│
├─ 🔐 Ambiente
│  ├─ .env.example        ← Template (VERSIONAR)
│  ├─ .env                ← Secrets (IGNORAR)
│  └─ .gitignore          ← Git ignore rules
│
├─ 💻 Código (VERSIONAR)
│  ├─ src/                ← TODO o código
│  ├─ app/                ← Rotas Expo Router
│  ├─ docs/               ← Documentação
│  └─ config/             ← Configuração
│
├─ 🚫 Não Versionar
│  ├─ node_modules/       ← Dependências (npm install)
│  ├─ .expo/              ← Cache Expo
│  ├─ .logs/              ← Logs de erros
│  └─ .git/               ← Histórico Git
│
└─ 📄 Documentação Principal
   ├─ README.md           ← Overview
   └─ ARCHITECTURE.md     ← Padrões e arquitetura
```

---

## 🚀 Comandos Rápidos

```bash
# Configurar
npm install
cp .env.example .env

# Desenvolver
npm run web         # ✅ Rodar no navegador
npm run android     # ✅ Rodar no Android
npm run ios        # ✅ Rodar no iOS

# Qualidade
npm run typecheck   # ✅ Verificar tipos

# Git
git add .
git commit -m "feat: descrição"
git push
```

---

## 💡 Boas Práticas

✅ Sempre usar `@/` nos imports  
✅ Separar concerns (UI, lógica, dados)  
✅ Type-first development (criar types primeiro)  
✅ Componentes pequenos e reutilizáveis  
✅ Funções puras em utils  
✅ Nomes descritivos  
✅ Comentários para lógica complexa  
✅ Organizar por domínio, não por tipo  

---

## 📊 Resumo da Organização

| Local | Conteúdo | Editar? | Exemplo |
|-------|----------|--------|---------|
| `src/components/` | UI Components | ✅ Sempre | Button.tsx |
| `src/services/` | API & Logic | ✅ Sempre | authService.ts |
| `src/hooks/` | Custom Hooks | ✅ Sempre | useAuth.ts |
| `src/types/` | TypeScript | ✅ Sempre | match.ts |
| `src/utils/` | Helpers | ✅ Sempre | formatters.ts |
| `src/constants/` | Valores fixos | ⚠️ Config | api.ts |
| `app/` | Rotas | ✅ Sempre | index.tsx |
| `docs/` | Docs | ✅ Sim | SETUP.md |
| `config/` | Config | ⚠️ Raro | env.config.ts |
| `node_modules/` | Dependências | ❌ Nunca | - |
| `.logs/` | Logs | ❌ Nunca | - |

