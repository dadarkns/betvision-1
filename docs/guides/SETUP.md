# 🚀 Setup & Configuração

## Pré-requisitos

```bash
Node.js v18+
npm v9+
Expo CLI (instalado via npm)
```

## Instalação

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Copiar template
cp .env.example .env

# Preencher com suas credenciais Supabase
EXPO_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica
```

### 3. Verificar TypeScript
```bash
npm run typecheck
```

---

## 🎯 Scripts Disponíveis

```bash
# Rodar no navegador (Web)
npm run web

# Rodar no Android
npm run android

# Rodar no iOS
npm run ios

# Iniciar o servidor Expo
npm start

# Type checking
npm run typecheck
```

---

## 📁 Path Aliases (Imports)

Todos os imports devem usar `@/`:

```typescript
// ✅ Correto
import type { Match } from '@/types';
import { Button } from '@/components/common';
import { formatDate } from '@/utils';

// ❌ Errado
import type { Match } from '../../../types';
import { Button } from '../components/common';
```

---

## 🔧 Configuração Recomendada (VS Code)

### Extensions
- ES7+ React/Redux/React-Native snippets
- TypeScript Vue Plugin
- Prettier
- ESLint

### Settings (.vscode/settings.json)
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 📚 Referências

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Expo Router Guide](https://expo.github.io/router/introduction/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ❓ Troubleshooting

### "Module not found" errors
- Verificar se o path alias está correto em `tsconfig.json`
- Limpar cache: `npm run start -- -c`

### Problemas com Supabase
- Verificar variáveis de ambiente em `.env`
- Confirmar credenciais em `supabase.com`

### Problemas com compilação
- Limpar node_modules: `rm -rf node_modules && npm install`
- Limpar cache Expo: `expo start -c`

