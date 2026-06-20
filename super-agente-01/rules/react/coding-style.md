---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**/*.ts"
  - "**/components/**/*.js"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
---
# Estilo de Código React

> Este arquivo estende [typescript/coding-style.md](../typescript/coding-style.md) e [common/coding-style.md](../common/coding-style.md) com conteúdo específico de React.

## Extensões de Arquivo

- `.tsx` para qualquer arquivo que contenha JSX, mesmo trechos de uma linha
- `.ts` para lógica pura, custom hooks sem JSX, definições de tipo, utilitários
- `.test.tsx` / `.test.ts` espelhando o arquivo de origem
- Use `.jsx` apenas quando o projeto evita TypeScript intencionalmente — sinalize na revisão todo novo arquivo React sem tipagem

## Nomenclatura

- Componentes: `PascalCase` tanto para o símbolo quanto para o arquivo (`UserCard.tsx`, export padrão `UserCard`)
- Custom hooks: `useCamelCase` para o símbolo, kebab-case para o arquivo quando a convenção do projeto é kebab-case (`use-debounce.ts` exporta `useDebounce`)
- Context: símbolo `<Domain>Context`, componente provider `<Domain>Provider`, hook consumidor `use<Domain>`
- Manipuladores de evento: `handleClick`, `handleSubmit` dentro do componente; a prop que o recebe é `onClick`, `onSubmit`
- Props booleanas: `isLoading`, `hasError`, `canSubmit` — nunca apenas `loading` ou `error` para booleanos

## Forma do Componente

```tsx
type Props = {
  user: User;
  onSelect: (id: string) => void;
};

export function UserCard({ user, onSelect }: Props) {
  return (
    <button type="button" onClick={() => onSelect(user.id)}>
      {user.name}
    </button>
  );
}
```

- Prefira `type Props = {}` para formatos fechados de props de componente
- Use `interface` apenas quando o tipo da prop é estendido via declaration merging ou exportado como ponto de extensão de uma API pública
- Sempre desestruture as props na lista de parâmetros — sem acesso a `props.user` dentro do corpo
- Tipe o retorno implicitamente através do JSX (`function Foo(): JSX.Element` apenas quando a função retorna condicionalmente e a união confunde a inferência)

## JSX

- Auto-feche tags sem filhos: `<img />`, `<UserCard user={u} />`
- Use fragments `<>...</>` em vez de um `<div>` wrapper quando nenhum elemento do DOM é necessário
- Renderização condicional: `{condition && <Foo />}` para booleanos, ternário para um-ou-outro, retorno antecipado para cláusulas de guarda
- Nunca coloque lógica inline no JSX quando ela se lê em várias linhas — extraia para uma const acima do return ou para uma função

```tsx
// Prefira
const greeting = user.isAdmin ? "Welcome, admin" : `Hello ${user.name}`;
return <h1>{greeting}</h1>;

// Em vez de
return <h1>{user.isAdmin ? "Welcome, admin" : `Hello ${user.name}`}</h1>;
```

## Fronteira Server / Client (Next.js App Router, RSC)

- Por padrão, um novo arquivo é um Server Component — adicione `"use client"` apenas quando o arquivo usa estado, efeitos, refs, APIs do navegador ou manipuladores de evento
- Coloque a diretiva `"use client"` na linha 1, antes de qualquer import
- Nunca importe um arquivo de Client Component de dentro de um arquivo de action `"use server"`
- Nunca reexporte código exclusivo de servidor através de um módulo de cliente — o bundler o incluirá silenciosamente

## Imports

- Imports de React primeiro: `import { useState } from "react"`
- Depois bibliotecas de terceiros, depois imports absolutos do projeto, depois relativos
- Imports apenas de tipo: `import type { ReactNode } from "react"` — nunca misture imports de runtime e de tipo em uma única instrução quando a regra `consistent-type-imports` do ESLint estiver configurada

## Disciplina de Hooks

Veja [hooks.md](./hooks.md) para o conjunto completo de regras. Destaques de estilo:

- Custom hooks devem começar com `use` — imposto pelo `eslint-plugin-react-hooks`
- Agrupe todas as chamadas de hook no topo do componente, antes de qualquer lógica condicional
- Evite criar hooks ad-hoc para wrappers de uma linha — faça a chamada inline em vez disso

## Estado

- Local primeiro (`useState`), eleve apenas quando compartilhado
- Context para estado transversal lido por muitos componentes (tema, autenticação, i18n) — não para atualizações de alta frequência
- Store externa (Zustand, Jotai, Redux Toolkit) quando o estado precisa persistir entre mudanças de rota, sincronizar entre abas ou ser depurado via devtools
- Nunca duplique estado que pode ser derivado — compute durante a renderização

## Componentes de Classe

Proibidos em código novo. Converta componentes de classe legados em componentes de função ao tocá-los para mudanças não triviais.

## Layout de Arquivos por Componente

```
components/UserCard/
  UserCard.tsx
  UserCard.module.css   # ou styled-components, ou classes Tailwind inline
  UserCard.test.tsx
  index.ts              # apenas reexport
```

Componentes inline de arquivo único são aceitáveis para peças de apresentação triviais.
