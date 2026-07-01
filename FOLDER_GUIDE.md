# 📂 GUIA DE PASTAS DO BETVISION

## 🎯 Estrutura Organizada (Pronta para Desenvolvimento)

```
betvision-1/
│
├─── 🔴 CONFIGURAÇÃO (Não editar frequentemente)
│    ├─ package.json              Dependências & scripts
│    ├─ tsconfig.json             TypeScript + path alias @/*
│    ├─ babel.config.js           Babel config
│    ├─ metro.config.js           Metro bundler
│    ├─ app.json                  Expo config
│    ├─ .env.example              Template env (VERSIONAR)
│    ├─ .env                       Secrets (IGNORAR)
│    └─ .gitignore                Git ignore (ATUALIZADO)
│
├─── 💻 CÓDIGO-FONTE (EDITAR SEMPRE)
│    │
│    ├─ src/
│    │  ├─ 🎨 components/         Componentes React reutilizáveis
│    │  │  ├─ common/             Button, Card, Header, Input
│    │  │  ├─ dashboard/          Dashboard de partidas
│    │  │  ├─ match/              Análise de partida
│    │  │  ├─ radar/              Filtros e radar
│    │  │  └─ auth/               Login/Signup
│    │  │
│    │  ├─ 📄 pages/              Telas principais (integração com app/)
│    │  │
│    │  ├─ 🔌 services/           Integração com APIs
│    │  │  ├─ supabase.ts         Cliente Supabase
│    │  │  ├─ authService.ts      Autenticação
│    │  │  ├─ matchService.ts     Partidas
│    │  │  └─ analysisService.ts  Análises
│    │  │
│    │  ├─ 🪝 hooks/              Custom Hooks React
│    │  │  ├─ useAuth.ts          Autenticação
│    │  │  ├─ useMatches.ts       Partidas
│    │  │  ├─ useFilter.ts        Filtros
│    │  │  └─ useFavorites.ts     Favoritos
│    │  │
│    │  ├─ 📝 types/              TypeScript Types
│    │  │  ├─ match.ts            Match, Team, Odds
│    │  │  ├─ user.ts             User, Preferences
│    │  │  └─ bet.ts              Bet, Slip
│    │  │
│    │  ├─ 🔧 utils/              Funções auxiliares puras
│    │  │  ├─ formatters.ts       formatDate, formatCurrency
│    │  │  ├─ validators.ts       isValidEmail, etc
│    │  │  └─ helpers.ts          calculateOdd, etc
│    │  │
│    │  ├─ 📌 constants/          Valores fixos
│    │  │  ├─ api.ts              URLs e endpoints
│    │  │  └─ markets.ts          Mercados de apostas
│    │  │
│    │  ├─ 🎨 styles/             Temas e estilos globais
│    │  │  ├─ theme.ts            Tema escuro
│    │  │  └─ colors.ts           Paleta de cores
│    │  │
│    │  └─ 🖼️ assets/             Arquivos estáticos
│    │     ├─ images/             Imagens do app
│    │     └─ icons/              Ícones customizados
│    │
│    └─ app/                      Expo Router (Navegação)
│       ├─ _layout.tsx            Layout raiz
│       ├─ index.tsx              Home/Dashboard
│       ├─ radar.tsx              Radar de filtros
│       ├─ favorites.tsx          Favoritos
│       ├─ slips.tsx              Bilhetes
│       ├─ profile.tsx            Perfil
│       ├─ auth.tsx               Login/Signup
│       └─ match/[id].tsx         Análise de partida
│
├─── 📚 DOCUMENTAÇÃO (Consultar & Atualizar)
│    └─ docs/
│       ├─ 📋 INDEX.md            Índice rápido
│       ├─ 📄 PROJECT_STRUCTURE.md Estrutura completa
│       │
│       ├─ design/
│       │  ├─ 🖼️ screenshots/      Imagens do app
│       │  │  ├─ betvision-desktop.png
│       │  │  ├─ betvision-dark-desktop.png
│       │  │  ├─ betvision-mobile-match.png
│       │  │  └─ betvision-dark-mobile-match.png
│       │  │
│       │  └─ 🎨 DESIGN_SYSTEM.md  Cores, tipografia, componentes
│       │
│       └─ guides/
│          ├─ 🚀 SETUP.md          Como configurar o projeto
│          ├─ 🗺️ PROJECT_MAP.md    Mapa visual (COMEÇAR AQUI!)
│          ├─ 🔗 BACKEND_INTEGRATION.md Supabase e APIs
│          └─ 📖 FILE_REFERENCE.md O que cada arquivo faz
│
├─── ⚙️ CONFIGURAÇÃO AVANÇADA
│    └─ config/
│       ├─ frontend-backend-config.json Frontend-Backend integration
│       └─ env.config.ts          Validação de variáveis de ambiente
│
├─── 📝 LOGS (NÃO VERSIONAR)
│    └─ .logs/
│       ├─ expo-web.out.log       Log de saída Expo
│       └─ expo-web.err.log       Log de erro Expo
│
├─── 🚫 IGNORADOS (NÃO EDITAR)
│    ├─ node_modules/             Dependências npm
│    ├─ .expo/                    Cache Expo
│    └─ .git/                     Histórico Git
│
└─── 📄 DOCS PRINCIPAIS
     ├─ README.md                 Overview (LEIA ISTO!)
     └─ ARCHITECTURE.md           Arquitetura do projeto
```

---

## 🎯 Como Navegar

### Quero criar um **novo componente**?
```
👉 Vá para: src/components/[dominio]/NomeComponente.tsx
📖 Guia: docs/guides/PROJECT_MAP.md (seção "Ciclo de Criação")
```

### Quero chamar uma **API/Backend**?
```
👉 Vá para: src/services/nomeService.ts
📖 Guia: docs/guides/BACKEND_INTEGRATION.md
```

### Preciso de uma **função auxiliar**?
```
👉 Vá para: src/utils/
📖 Guia: docs/guides/FILE_REFERENCE.md
```

### Tenho dúvida sobre o **projeto**?
```
👉 Leia: docs/guides/PROJECT_MAP.md
👉 Depois: docs/PROJECT_STRUCTURE.md
👉 Finalmente: ARCHITECTURE.md
```

### Quero **configurar o ambiente**?
```
👉 Siga: docs/guides/SETUP.md
```

### Quero ver o **design/prototipagem**?
```
👉 Vá para: docs/design/DESIGN_SYSTEM.md
👉 Screenshots: docs/design/screenshots/
```

---

## ✅ Checklist Rápido

```
□ npm install                           # Instalar dependências
□ cp .env.example .env                  # Copiar template env
□ Editar .env com credenciais Supabase # Configurar
□ npm run typecheck                     # Verificar tipos
□ npm run web                           # Testar no navegador
```

---

## 📊 Resumo de Arquivos

| Arquivo | O que é | Editar? |
|---------|---------|--------|
| `package.json` | Dependências | ⚠️ Quando instalar |
| `tsconfig.json` | TypeScript config | ❌ Não |
| `app.json` | Expo config | ⚠️ Nome, ícone |
| `.env` | Secrets (IGNORADO) | ✅ Sim |
| `.env.example` | Template (VERSIONADO) | ✅ Sim |
| `README.md` | Overview | ✅ Documentação |
| `ARCHITECTURE.md` | Padrões | ✅ Documentação |

---

## 🚀 Próximos Passos

1. ✅ **Estrutura criada**
2. ⏳ Organizar imagens em `docs/design/screenshots/`
3. ⏳ Criar componentes base em `src/components/common/`
4. ⏳ Implementar services em `src/services/`
5. ⏳ Criar hooks em `src/hooks/`
6. ⏳ Montar páginas em `app/`

---

## 💡 Lembre-se

✅ Todos os imports usam `@/` (ex: `@/types`, `@/utils`)  
✅ Componentes em `PascalCase` (MatchCard.tsx)  
✅ Services/Hooks em `camelCase` (matchService.ts)  
✅ Tipos em `types/` pasta  
✅ Funções puras em `utils/`  
✅ Constantes em `constants/`  

---

## 📞 Referências Rápidas

- 📚 [Documentação Completa](./docs/)
- 🗺️ [Mapa Visual](./docs/guides/PROJECT_MAP.md)
- 🏗️ [Arquitetura](./ARCHITECTURE.md)
- 🚀 [Setup](./docs/guides/SETUP.md)
- 🎨 [Design System](./docs/design/DESIGN_SYSTEM.md)

