---
description: Revisão abrangente de código React/JSX para correção de hooks, desempenho de renderização, fronteiras de componentes server/client, acessibilidade e segurança específica do React. Invoca o agent react-reviewer (e o typescript-reviewer em conjunto em alterações TSX/JSX).
---

# Revisão de Código React

Este comando invoca o agent **react-reviewer** para revisão de código específica de React. Para pull requests que tocam arquivos `.tsx`/`.jsx`, tanto `react-reviewer` quanto `typescript-reviewer` devem rodar — cada um cobre uma faixa distinta.

## O Que Este Comando Faz

1. **Identificar Alterações React**: Encontra arquivos `.tsx`/`.jsx` modificados (e arquivos `.ts`/`.js` que contêm React) via `git diff`
2. **Executar o Lint**: Roda `eslint` com `eslint-plugin-react-hooks` e `eslint-plugin-jsx-a11y`
3. **Verificar Tipos**: Roda `tsc --noEmit` ou o comando canônico de verificação de tipos do projeto
4. **Revisar Apenas as Faixas do React**: Regras de hooks, fronteiras RSC, acessibilidade, desempenho de renderização, segurança específica do React
5. **Gerar Relatório**: Categoriza os problemas por severidade (CRITICAL / HIGH / MEDIUM)

## Quando Usar

Use `/react-review` quando:

- Um PR ou commit tocar arquivos `.tsx`/`.jsx`
- Após escrever ou modificar componentes React, hooks customizados ou páginas
- Antes de mesclar código React
- Ao auditar a acessibilidade de componentes de UI
- Ao revisar um novo hook quanto às rules-of-hooks e à correção de dependências
- Ao auditar uma fronteira de componente server/client do App Router do Next.js

Para alterações puras `.ts`/`.js` sem imports de React, use `/code-review` (geral) ou invoque o `typescript-reviewer` diretamente.

## Escopo vs `/code-review` e Revisão de TypeScript

| Ferramenta | Escopo |
|---|---|
| `react-reviewer` (este comando) | Regras de hooks, JSX, RSC, a11y, segurança específica do React, desempenho de renderização |
| `typescript-reviewer` | TS/JS genérico — abuso de `any`, correção assíncrona, segurança no Node |
| `security-reviewer` | Auditoria de segurança do projeto inteiro |
| `/code-review` | Revisão genérica de alterações não commitadas ou de PR |

Em um PR TSX/JSX, invoque tanto `react-reviewer` quanto `typescript-reviewer`. As descobertas de cada um são não sobrepostas por design.

## Categorias de Revisão

### CRITICAL (Deve Corrigir)

- `dangerouslySetInnerHTML` com entrada não sanitizada
- `href`/`src` com URLs de usuário não validadas (`javascript:`, `data:`)
- Server Action sem validação de entrada
- Segredo no bundle do cliente (`NEXT_PUBLIC_*`, `VITE_*`, `REACT_APP_*`)
- `localStorage`/`sessionStorage` para tokens de sessão
- Chamadas de hook condicionais (viola as Rules of Hooks)
- Mutação direta de estado
- Hook chamado fora de um componente ou hook customizado

### HIGH (Deveria Corrigir)

- Dependências faltando em `useEffect`/`useMemo`/`useCallback` (`exhaustive-deps` desabilitado sem justificativa)
- Effect para estado derivado
- Effect sem cleanup
- Closures obsoletas em handlers/intervalos
- Imports server-only em Client Components
- Dados sensíveis vazados via props para Client Components
- Server Actions sem verificações de autenticação
- Violações de acessibilidade (labels faltando, elementos interativos não semânticos, uso indevido de ARIA)
- `key={index}` em listas dinâmicas
- Estado duplicado, cadeias de useEffect

### MEDIUM (Considerar)

- Memoização excessiva sem ganho medido
- Novo objeto/função inline como prop para um filho memoizado
- Suspense apenas na raiz da rota (sem revelação progressiva)
- Listas longas sem virtualização
- Valor de alta frequência via `useContext`
- Validação feita à mão em formulários não triviais
- Prop drilling além de 3 níveis
- Componente com mais de 200 linhas
- Class components em código novo

## Verificações Automatizadas Executadas

```bash
# Lint (required for any meaningful review)
npx eslint . --ext .tsx,.jsx,.ts,.js

# Typecheck (skip cleanly for JS-only projects)
npm run typecheck --if-present
[ -f tsconfig.json ] && tsc --noEmit -p tsconfig.json

# Targeted a11y rules
npx eslint . --rule 'jsx-a11y/alt-text: error' \
              --rule 'jsx-a11y/anchor-is-valid: error' \
              --rule 'jsx-a11y/click-events-have-key-events: error'

# Supply-chain
npm audit
```

Se `eslint-plugin-react-hooks` ou `eslint-plugin-jsx-a11y` não estiver configurado, a revisão sinalizará a lacuna como um problema de configuração HIGH e continuará.

## Exemplo de Uso

````text
User: /react-review

Agent:
# React Code Review Report

## Files Reviewed
- src/components/UserCard.tsx (modified)
- src/hooks/useUser.ts (new)

## Lint Results
PASS: eslint clean
PASS: typecheck clean

## Issues Found

[CRITICAL] Unsanitized dangerouslySetInnerHTML
File: src/components/UserCard.tsx:42
Issue: User-controlled bio rendered as raw HTML.
Why: XSS via stored script tags in user input.
Fix: Sanitize with DOMPurify or render as text:
```tsx
import DOMPurify from "isomorphic-dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(user.bio) }} />
```

[HIGH] Effect cleanup missing
File: src/hooks/useUser.ts:18
Issue: `fetch` call without AbortController; setState on unmounted component possible.
Fix: Add AbortController and cleanup:
```ts
useEffect(() => {
  const ac = new AbortController();
  fetch(`/api/users/${id}`, { signal: ac.signal })
    .then(r => r.json())
    .then(setUser);
  return () => ac.abort();
}, [id]);
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
````

## Critérios de Aprovação

| Status | Condição |
|---|---|
| PASS: Approve | Nenhum problema CRITICAL ou HIGH |
| WARNING: Warning | Apenas problemas MEDIUM (mesclar com cautela) |
| FAIL: Block | Problemas CRITICAL ou HIGH encontrados |

## Integração com Outros Comandos

- Execute `/react-build` primeiro se o build estiver quebrado
- Execute `/react-test` para garantir que os testes de componente passem
- Execute `/react-review` antes de mesclar
- Use `/code-review` para questões não específicas de React no mesmo PR

## Relacionados

- Agent: `agents/react-reviewer.md`
- Agent complementar: `agents/typescript-reviewer.md` (rode em conjunto para PRs TSX/JSX)
- Skills: `skills/react-patterns/`, `skills/react-testing/`, `skills/accessibility/`
- Rules: `rules/react/`
