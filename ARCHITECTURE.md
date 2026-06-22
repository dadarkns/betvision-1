# 📐 BetVision - Guia de Arquitetura

## Estrutura Criada ✅

```
betvision-1/
├── src/
│   ├── components/
│   │   ├── common/          → Componentes genéricos (Button, Card, etc)
│   │   ├── dashboard/       → Dashboard de partidas
│   │   ├── match/           → Análise de partida
│   │   ├── radar/           → Filtros de mercados
│   │   └── auth/            → Login/Cadastro
│   │
│   ├── pages/               → Telas principais do app
│   ├── services/            → Integração com APIs/Supabase
│   ├── hooks/               → Custom Hooks React
│   ├── types/               → TypeScript Interfaces e Types
│   ├── utils/               → Funções utilitárias
│   ├── constants/           → Constantes da app
│   ├── styles/              → Temas e estilos globais
│   └── assets/              → Imagens e ícones
│
└── app/                     → Expo Router (manter como está)
```

## 📦 O que já foi criado:

### Types (Tipos TypeScript)
- ✅ `types/match.ts` - Interface de Partidas
- ✅ `types/user.ts` - Interface de Usuário
- ✅ `types/bet.ts` - Interface de Apostas

### Constants (Constantes)
- ✅ `constants/api.ts` - URLs e endpoints
- ✅ `constants/markets.ts` - Mercados de apostas

### Utils (Funções Auxiliares)
- ✅ `utils/formatters.ts` - Formatar datas, moeda, %
- ✅ `utils/validators.ts` - Validar email, senha, odds
- ✅ `utils/helpers.ts` - Funções gerais

### Estrutura de Pastas
- ✅ Componentes organizados por domínio
- ✅ Services preparado para APIs
- ✅ Hooks prontos para lógica reutilizável
- ✅ Assets para imagens e ícones

---

## 🚀 Próximos Passos

### 1️⃣ **Mover e atualizar `app/` para usar `src/`**
   - Mover lógica de `app/index.tsx` para componentes em `src/components/`
   - Manter `app/` como roteador (Expo Router)
   - Adicionar imports corretos

### 2️⃣ **Criar Components Base**
   - `src/components/common/Button.tsx`
   - `src/components/common/Card.tsx`
   - `src/components/common/Header.tsx`
   - `src/components/common/LoadingSpinner.tsx`

### 3️⃣ **Implementar Services**
   - `src/services/supabase.ts` - Cliente Supabase
   - `src/services/authService.ts` - Autenticação
   - `src/services/matchService.ts` - Dados de partidas
   - `src/services/analysisService.ts` - Análises

### 4️⃣ **Criar Custom Hooks**
   - `src/hooks/useAuth.ts` - Gerenciar autenticação
   - `src/hooks/useMatches.ts` - Gerenciar partidas
   - `src/hooks/useFilter.ts` - Gerenciar filtros

### 5️⃣ **Definir Tema e Estilos**
   - `src/styles/theme.ts` - Tema escuro
   - `src/styles/colors.ts` - Paleta de cores

---

## 💡 Convenções de Código

### Imports
```typescript
// Tipos
import type { Match, User } from '@/types';

// Constantes
import { BET_MARKETS, ENDPOINTS } from '@/constants';

// Utils
import { formatDate, isValidEmail } from '@/utils';

// Componentes
import { Button, Card } from '@/components/common';

// Services
import { matchService, authService } from '@/services';

// Hooks
import { useAuth, useMatches } from '@/hooks';
```

### Nomes de Arquivos
- Componentes: `PascalCase` (ex: `MatchCard.tsx`)
- Utils/Services/Hooks: `camelCase` (ex: `formatters.ts`)
- Types: `camelCase` (ex: `match.ts`)

### Estrutura de Componente
```typescript
interface Props {
  // ...
}

export const ComponentName: React.FC<Props> = ({ ...props }) => {
  return (
    // JSX
  );
};
```

---

## 🎯 Objetivo Final

Uma arquitetura **escalável, mantível e profissional** onde:
- Componentes são reutilizáveis e testáveis
- Lógica separada da UI
- Fácil adicionar novas features
- Código organizado e autodocumentado

---

## ✨ Resumo do que foi feito

| Item | Status |
|------|--------|
| Pastas de componentes | ✅ Criado |
| Pastas de funcionalidades | ✅ Criado |
| Types TypeScript | ✅ Criado |
| Constantes | ✅ Criado |
| Utils | ✅ Criado |
| Documentação | ✅ Criado |

**Próximo: Começar a mover lógica para `src/` e criar os primeiros componentes!**
