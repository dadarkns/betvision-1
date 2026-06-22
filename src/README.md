# 📂 Estrutura do Projeto BetVision

```
src/
├── components/              # Componentes reutilizáveis e específicos
│   ├── common/             # Componentes genéricos (Button, Card, Header, etc)
│   ├── dashboard/          # Componentes da página de dashboard
│   ├── match/              # Componentes da página de análise de partidas
│   ├── radar/              # Componentes do radar de filtros
│   └── auth/               # Componentes de login/cadastro
│
├── pages/                  # Páginas/Telas principais (integração com Expo Router)
│
├── services/               # Lógica de API e integração externa
│   ├── supabase.ts         # Configuração Supabase
│   ├── matchService.ts     # Chamadas de partidas
│   ├── authService.ts      # Autenticação
│   └── ...
│
├── hooks/                  # Custom Hooks React
│   ├── useMatches.ts       # Hook para partidas
│   ├── useAuth.ts          # Hook para autenticação
│   ├── useFilter.ts        # Hook para filtros
│   └── ...
│
├── types/                  # Tipos e Interfaces TypeScript
│   ├── match.ts            # Tipos de partidas
│   ├── user.ts             # Tipos de usuário
│   ├── bet.ts              # Tipos de apostas
│   └── ...
│
├── utils/                  # Funções utilitárias
│   ├── validators.ts       # Validações
│   ├── formatters.ts       # Formatadores (datas, números, etc)
│   ├── helpers.ts          # Funções auxiliares
│   └── ...
│
├── constants/              # Constantes da aplicação
│   ├── api.ts              # URLs e endpoints da API
│   ├── colors.ts           # Cores do tema
│   └── ...
│
├── styles/                 # Estilos e temas globais
│   ├── theme.ts            # Tema escuro da aplicação
│   ├── colors.ts           # Paleta de cores
│   └── ...
│
└── assets/                 # Recursos estáticos
    ├── images/             # Imagens (logos, banners, etc)
    └── icons/              # Ícones customizados
```

## 📋 Convenções

### Components
```
component-name/
├── ComponentName.tsx       # Componente principal
├── ComponentName.styles.ts # Estilos específicos (se necessário)
└── index.ts               # Export
```

### Services
- Cada arquivo = um domínio (matches, auth, bets, etc)
- Funções puras que não dependem de estado React

### Hooks
- Nomes começam com `use`
- Encapsulam lógica reutilizável
- Podem usar services e estados locais

### Utils
- Funções puras e sem dependências
- Testáveis e reutilizáveis em qualquer lugar

## 🔄 Fluxo de Dados

```
Pages/Screens
    ↓
Components (apresentação)
    ↓
Hooks (lógica local)
    ↓
Services (API/Backend)
    ↓
Backend/Supabase
```

## ✅ Próximos Passos

1. ✅ Estrutura de pastas criada
2. ⏳ Mover arquivos existentes para as novas pastas
3. ⏳ Criar tipos TypeScript
4. ⏳ Criar services de integração
5. ⏳ Componentizar a UI
