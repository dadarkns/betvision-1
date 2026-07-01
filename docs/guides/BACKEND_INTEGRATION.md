# 📊 Integração com Backend

## Supabase Setup

### Criar Projeto Supabase
1. Ir em [supabase.com](https://supabase.com)
2. Criar novo projeto
3. Copiar credenciais em `.env`:
   ```
   EXPO_PUBLIC_SUPABASE_URL=seu-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave
   ```

### Tabelas Necessárias

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR,
  avatar_url VARCHAR,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `matches`
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  home_team_id VARCHAR,
  away_team_id VARCHAR,
  date TIMESTAMP,
  league VARCHAR,
  status VARCHAR,
  odds JSONB,
  statistics JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `slips`
```sql
CREATE TABLE slips (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR,
  bets JSONB,
  total_odd DECIMAL,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints (Backend)

### Authentication
- `POST /auth/login` - Login
- `POST /auth/signup` - Cadastro
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh token

### Matches
- `GET /matches` - Listar partidas
- `GET /matches/:id` - Detalhe da partida
- `GET /matches/:id/analysis` - Análise de partida

### Analysis
- `POST /analysis/generate` - Gerar análise
- `GET /analysis/history` - Histórico de análises

---

## Fluxo de Autenticação

```
Login/Signup
    ↓
Supabase Auth
    ↓
Salvar Token (AsyncStorage)
    ↓
Usar em Request Headers
    ↓
Authorization: Bearer <token>
```

---

## Exemplo de Service

```typescript
// src/services/authService.ts
import { supabase } from './supabase';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
};
```

---

## Variáveis de Ambiente

```env
# .env
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🔐 Segurança

✅ Nunca commitar credenciais  
✅ Usar `.env` e `.env.example`  
✅ Row Level Security (RLS) no Supabase  
✅ Validar dados no backend  
✅ HTTPS em produção  

