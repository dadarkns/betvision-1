# 📋 Estrutura Completa do Projeto BetVision

## 📁 Raiz (Root)

### Configuração & Build
- **`tsconfig.json`** - TypeScript configuração com path alias `@/*`
- **`babel.config.js`** - Babel presets para Expo
- **`metro.config.js`** - Metro bundler para React Native
- **`app.json`** - Configuração do Expo (nome, slug, ícones, etc)
- **`package.json`** - Dependências e scripts npm
- **`package-lock.json`** - Lock file do npm

### Ambiente
- **`.env.example`** - Template de variáveis de ambiente (Supabase URLs)
- **`.gitignore`** - Arquivos ignorados pelo git
- **`.git/`** - Repository git

### Documentação Principal
- **`README.md`** - Overview do projeto
- **`ARCHITECTURE.md`** - Arquitetura do projeto (criado)

### Pastas Geradas
- **`node_modules/`** - Dependências instaladas
- **`.expo/`** - Cache do Expo

---

## 📂 Estrutura Organizada

```
betvision-1/
│
├─ src/                          ← 🎯 CÓDIGO FONTE
│  ├─ components/                ← Componentes React
│  ├─ pages/                     ← Telas principais
│  ├─ services/                  ← API & Supabase
│  ├─ hooks/                     ← Custom Hooks
│  ├─ types/                     ← TypeScript Types
│  ├─ utils/                     ← Funções auxiliares
│  ├─ constants/                 ← Constantes
│  ├─ styles/                    ← Temas & Estilos
│  └─ assets/                    ← Imagens & Ícones
│
├─ app/                          ← 🔀 EXPO ROUTER (Navegação)
│  └─ Telas/rotas do app
│
├─ docs/                         ← 📚 DOCUMENTAÇÃO
│  ├─ design/                    ← Screenshots, mockups, prototipação
│  │  ├─ screenshots/            ← Screenshots do app
│  │  ├─ mockups/                ← Mockups Figma/Stitch
│  │  └─ design-system.md        ← Design system
│  └─ guides/                    ← Guias de desenvolvimento
│     ├─ setup.md                ← Como configurar o projeto
│     ├─ contributing.md         ← Como contribuir
│     └─ api-integration.md      ← Integração com APIs
│
├─ config/                       ← ⚙️ CONFIGURAÇÃO
│  ├─ constants.config.ts        ← Constantes de config
│  └─ env.config.ts              ← Validação de env vars
│
├─ .logs/                        ← 📝 LOGS & ERROS
│  └─ Arquivos de log (expo-web.out.log, etc)
│
├─ app.json                      ← Expo config
├─ tsconfig.json                 ← TypeScript config
├─ babel.config.js               ← Babel config
├─ metro.config.js               ← Metro config
├─ .env.example                  ← Template env
├─ .gitignore                    ← Git ignore
├─ package.json                  ← Dependências
└─ README.md                     ← Overview
```

---

## 🖼️ Imagens & Screenshots

As imagens que estavam soltas devem ir em:

### `docs/design/screenshots/`
```
docs/design/screenshots/
├─ betvision-desktop.png              ← Screenshot desktop
├─ betvision-dark-desktop.png         ← Screenshot desktop (tema escuro)
├─ betvision-mobile-match.png         ← Screenshot mobile
├─ betvision-dark-mobile-match.png    ← Screenshot mobile (tema escuro)
└─ betvision-logo-no-bg-check.png     ← Logo PNG
```

### `src/assets/`
```
src/assets/
├─ images/                      ← Imagens usadas no app
│  ├─ logo.png
│  ├─ loading-banner.png
│  └─ ...
└─ icons/                       ← Ícones customizados
   ├─ hamburger.svg
   ├─ match-icon.svg
   └─ ...
```

---

## 📄 Arquivos Especiais

### `frontend-backend-config.json`
Configuração de integração frontend-backend. Deve ir em:
```
config/frontend-backend-config.json
```

### `LINGUAGENS_E_PLATAFORMAS.md`
Documentação sobre linguagens e plataformas. Deve ir em:
```
docs/guides/LINGUAGENS_E_PLATAFORMAS.md
```

### `expo-web.err.log` & `expo-web.out.log`
Logs de erro do Expo. Devem ir em:
```
.logs/expo-web.out.log
.logs/expo-web.err.log
```

### `expo-env.d.ts`
Tipos do Expo (auto-gerado). Deixar na raiz.

---

## ✅ Checklist de Organização

| Item | Status | Ação |
|------|--------|------|
| Imagens para `/docs/design/screenshots/` | ⏳ | Mover 5 PNGs |
| Config para `/config/` | ⏳ | Mover `frontend-backend-config.json` |
| Logs para `.logs/` | ⏳ | Mover `.err.log` e `.out.log` |
| Docs para `/docs/guides/` | ⏳ | Mover markdown files |
| Path alias no tsconfig | ✅ | Já configurado |

---

## 🚀 Próximo: Implementar a Reorganização

Quer que eu automaticamente:
1. Mova as imagens para `docs/design/screenshots/`
2. Reorganize os logs em `.logs/`
3. Crie um index dos arquivos
4. Atualize o `.gitignore`
5. Crie um `index.md` de referência?

