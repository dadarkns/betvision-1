# 📄 Referência de Arquivos

## O que cada arquivo faz?

### Raiz `/`

| Arquivo | Propósito | Editar? |
|---------|-----------|--------|
| `package.json` | Dependências e scripts | Sim, quando add pacotes |
| `tsconfig.json` | Config TypeScript | Raramente |
| `babel.config.js` | Presets Babel | Raramente |
| `metro.config.js` | Bundler React Native | Raramente |
| `app.json` | Config Expo | Quando mudar nome/icon |
| `.env.example` | Template env (NÃO SECRET) | Sim, adicionar vars |
| `.env` | Credenciais (GIT IGNORE) | Sim, valores secretos |
| `.gitignore` | Arquivos ignorados | Raramente |
| `README.md` | Overview do projeto | Sim, documentação |

---

### Pastas Importantes

| Pasta | Conteúdo | Editar? |
|-------|----------|--------|
| `src/` | **TODO o código** | ✅ Sim, sempre |
| `app/` | Rotas Expo Router | Sim, adicionar telas |
| `docs/` | Documentação | Sim, adicionar guias |
| `config/` | Configurações | Sim, adicionar config |
| `.logs/` | Logs de erros | Não, auto-gerado |
| `node_modules/` | Dependências | ❌ Não, nunca editar |
| `.expo/` | Cache Expo | ❌ Não, auto-gerado |
| `.git/` | Histórico git | ❌ Não, sistema git |

---

### Arquivos de Sistema (Ignorar)

```
.expo/              ← Cache do Expo
.git/               ← Repositório Git
node_modules/       ← Pacotes npm
.DS_Store           ← macOS (ignorado)
*.log               ← Logs (ignorado)
.env                ← Secrets (ignorado)
```

---

### Versionar (Commitar no Git)

```
✅ src/
✅ app/
✅ docs/
✅ config/
✅ package.json
✅ tsconfig.json
✅ .gitignore
✅ .env.example
✅ README.md
```

### NÃO Versionar (No .gitignore)

```
❌ node_modules/
❌ .env
❌ .expo/
❌ .logs/
❌ *.log
❌ .DS_Store
```

---

## 🎯 Estrutura de Novo Componente

Quando criar um novo componente:

```typescript
// src/components/dashboard/MatchCard.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Match } from '@/types';

interface Props {
  match: Match;
  onPress?: () => void;
}

export const MatchCard: React.FC<Props> = ({ match, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{match.homeTeam.name}</Text>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
});
```

---

## ✅ Checklist para Novo Arquivo

- [ ] Está na pasta correta?
- [ ] Segue a nomenclatura (PascalCase para components)?
- [ ] Tem tipos TypeScript?
- [ ] Tem comentários JSDoc para funções públicas?
- [ ] Está exportado?
- [ ] Pode ser reutilizado?

