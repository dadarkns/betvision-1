## 🚀 Checklist Rápido

```bash
# Setup
npm install
cp .env.example .env
# Preencher .env com credenciais Supabase

# Desenvolvimento
npm run web         # Rodar web
npm run typecheck   # Verificar tipos

# Organização
docs/              # Documentação
src/               # Código-fonte
config/            # Configuração
.logs/             # Logs (ignorado)
```

## 📁 Resumo de Pastas

| Pasta | Para | Exemplo |
|-------|------|---------|
| `src/components/` | Componentes React | Button, Card, Header |
| `src/pages/` | Telas principais | Dashboard, Match |
| `src/services/` | API & Backend | supabaseService |
| `src/hooks/` | Lógica reutilizável | useAuth, useMatches |
| `src/types/` | TypeScript Types | Match, User, Bet |
| `src/utils/` | Funções auxiliares | formatDate, validators |
| `src/constants/` | Constantes | API endpoints |
| `docs/design/` | Screenshots & mockups | Design system |
| `docs/guides/` | Documentação | Setup, guias |
| `config/` | Configuração | Env config |

**Próximas ações? Criar componentes, services ou começar a implementar as telas!**
