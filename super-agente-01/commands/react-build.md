---
description: Corrige falhas de build do React (Vite, webpack, Next.js, CRA, Parcel, esbuild, Bun) de forma incremental — erros de compilação JSX/TSX, divergências de hidratação, falhas de fronteira de componentes server/client, tipos faltando. Invoca o agent react-build-resolver para correções mínimas e cirúrgicas.
---

# Build e Correção do React

Este comando invoca o agent **react-build-resolver** para corrigir incrementalmente erros de build do React com alterações mínimas.

## O Que Este Comando Faz

1. **Detectar o Sistema de Build**: Identifica Vite, webpack, Next.js, CRA, Parcel, esbuild ou Bun
2. **Executar o Build**: Roda o script de build do projeto
3. **Analisar os Erros**: Agrupa por camada (TypeScript / configuração do bundler / runtime / hidratação)
4. **Corrigir Incrementalmente**: Um erro por vez, reexecutando o build após cada alteração
5. **Reportar o Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/react-build` quando:

- `npm run build` (ou equivalente pnpm/yarn/bun) falhar
- Erros de compilação JSX/TSX após uma atualização de TypeScript ou React
- Erros de divergência de hidratação do Next.js em runtime
- Erros de fronteira de Server/Client Component no App Router
- Após instalar ou atualizar `react`, `react-dom`, `@types/react` ou um bundler
- Tipos faltando ou erros de "module not found" envolvendo o React

## Escopo

Este comando é responsável por falhas de **build/bundler/hidratação em runtime do React**. Para erros puros de tipo do TypeScript sem envolvimento do React, use `/build-fix` (genérico).

## Comandos de Diagnóstico Executados

```bash
# Project build script (preferred)
npm run build --if-present
pnpm build 2>/dev/null
yarn build 2>/dev/null
bun run build 2>/dev/null

# Standalone typecheck
npm run typecheck --if-present
tsc --noEmit -p tsconfig.json

# Bundler-specific fallback
next build                          # Next.js
vite build                          # Vite
react-scripts build                 # CRA
webpack --mode=production           # webpack
parcel build src/index.html         # Parcel
bun build ./src/index.tsx --outdir=dist
```

## Exemplo de Sessão

````text
User: /react-build

Agent:
# React Build Resolution

## Build System Detected
Vite (vite.config.ts present, @vitejs/plugin-react in deps)

## Initial Diagnostics

```bash
$ npm run build
> tsc -b && vite build

src/components/UserCard.tsx:1:8 - error TS6133: 'React' is declared but its value is never read.
src/components/Modal.tsx:12:15 - error TS7016: Could not find a declaration file for module 'react-portal'.
src/pages/Home.tsx:42:5 - error: 'useState' is not defined
```

Errors found: 3

## Fix 1: Old JSX transform leftover

File: src/components/UserCard.tsx:1
Cause: `tsconfig.json` already uses `"jsx": "react-jsx"`; the explicit `import React` is unused.

```tsx
// Removed
- import React from 'react';
```

```bash
$ npm run build
# 2 errors remaining
```

## Fix 2: Missing types

File: src/components/Modal.tsx
Cause: `@types/react-portal` not installed.

```bash
$ npm i -D @types/react-portal
added 1 package
```

```bash
$ npm run build
# 1 error remaining
```

## Fix 3: Missing hook import

File: src/pages/Home.tsx
Cause: `useState` referenced but not imported.

```tsx
- import { useEffect } from "react";
+ import { useEffect, useState } from "react";
```

```bash
$ npm run build
# Build successful!
```

## Final Verification

```bash
$ npm run build
✓ built in 2.34s

$ npm test
✓ 47 tests passed
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Files modified | 2 |
| Dependencies added | 1 (@types/react-portal) |
| Remaining issues | 0 |

Build Status: PASS: SUCCESS
````

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|---|---|
| `'React' is not defined` | Defina `"jsx": "react-jsx"` no tsconfig (React 17+) |
| `@types/react` faltando | `npm i -D @types/react @types/react-dom` |
| `Unexpected token '<'` | Adicione `@vitejs/plugin-react` / `babel-loader` |
| `You're importing a component that needs useState` (Next.js) | Adicione `"use client"` ou mova o hook para um filho Client Component |
| `Module not found: Can't resolve 'fs'` (Next.js) | Remova o import de `fs` ou mova a lógica para um Server Component / rota de API |
| `Hydration failed because the initial UI does not match` | Mova `Date.now()`/`Math.random()`/`window.*` para `useEffect` |
| `Invalid hook call` | Múltiplas cópias do React — desduplique via `resolutions`/`overrides` |
| `Element type is invalid` | Divergência entre import default e nomeado |

## Estratégia de Correção

1. **Erros de compilação primeiro** — o código precisa fazer build
2. **Erros de hidratação em segundo** — afetam a correção em produção
3. **Configuração do bundler em terceiro** — restaure a correção de plugin/loader
4. **Uma correção por vez** — verifique cada alteração
5. **Alterações mínimas** — nunca `// @ts-ignore` sem explicação
6. **Reexecute após cada correção** — exponha novos erros imediatamente

## Condições de Parada

O agent vai parar e reportar se:

- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros do que resolve
- Exigir alteração arquitetural além da resolução do build (ex.: redesenhar a fronteira RSC)
- A versão do bundler não suportar mais a major instalada do React

## Comandos Relacionados

- `/react-test` — execute os testes após o build ficar verde
- `/react-review` — revise a qualidade do código após o build ter sucesso
- `/build-fix` — corretor de build genérico (não React)
- skill `verification-loop` — laço completo de verificação

## Relacionados

- Agent: `agents/react-build-resolver.md`
- Skills: `skills/react-patterns/`, `skills/frontend-patterns/`
- Rules: `rules/react/coding-style.md`, `rules/react/patterns.md`
