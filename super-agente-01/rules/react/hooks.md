---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/hooks/**/*.ts"
  - "**/hooks/**/*.js"
  - "**/use-*.ts"
  - "**/use-*.tsx"
---
# React Hooks

> Este arquivo cobre os **React hooks** (`useState`, `useEffect`, `useMemo`, `useCallback`, custom hooks) — NÃO o sistema de runtime `hooks/` do Claude Code. A nomenclatura segue a convenção por linguagem `rules/<lang>/hooks.md` usada em todo este repositório.
>
> Estende [typescript/patterns.md](../typescript/patterns.md) e [common/patterns.md](../common/patterns.md).

## Regras dos Hooks

Imponha o `eslint-plugin-react-hooks` com `react-hooks/rules-of-hooks` definido como error.

1. Hooks apenas no nível superior de um componente de função ou de outro hook
2. Nunca em loops, condicionais, funções aninhadas ou após retornos antecipados
3. Sempre chamados na mesma ordem a cada renderização
4. Apenas dentro de componentes de função React ou custom hooks (funções que começam com `use`)

```tsx
// ERRADO: hook condicional
function Foo({ enabled }: { enabled: boolean }) {
  if (enabled) {
    const [x, setX] = useState(0); // violação da regra
  }
}

// CORRETO: hook incondicional, condição interna
function Foo({ enabled }: { enabled: boolean }) {
  const [x, setX] = useState(0);
  if (!enabled) return null;
  return <span>{x}</span>;
}
```

## `useEffect` — Quando NÃO Usar

`useEffect` é para sincronizar com sistemas externos (assinaturas, APIs do navegador, bibliotecas de terceiros). Ele **não** é a ferramenta certa para:

- Estado derivado — compute-o durante a renderização
- Transformar dados para renderização — compute durante a renderização
- Resetar estado quando uma prop muda — use uma `key` no pai ou derive das props
- Notificar pais sobre mudanças de estado — chame o callback no manipulador de evento
- Inicializar singletons de nível de aplicação — chame a função no nível do módulo ou em `main.tsx`

```tsx
// ERRADO: efeito para estado derivado
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// CORRETO: derive durante a renderização
const fullName = `${first} ${last}`;
```

## Arrays de Dependências

- Sempre inclua todo valor reativo referenciado dentro do efeito/callback
- Habilite a regra de lint `react-hooks/exhaustive-deps` — nunca a silencie sem um comentário explicando o motivo
- Se o array de deps cresce demais, o efeito está fazendo coisas demais — divida-o
- Identidade estável para funções passadas em deps: encapsule em `useCallback` apenas quando a função é ela mesma uma dependência de outro hook ou passada a um filho memoizado

## Limpeza (Cleanup)

Toda assinatura, intervalo, listener ou requisição em andamento deve fazer cleanup.

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal }).then(handleResponse);
  return () => controller.abort();
}, [url]);
```

```tsx
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
```

Falta de cleanup = condições de corrida quando as deps mudam, vazamentos de memória ao desmontar.

## `useMemo` e `useCallback` — Quando Vale a Pena

Posição padrão: **não memoize**. Adicione `useMemo` / `useCallback` apenas quando:

1. O valor é passado a um filho encapsulado por `React.memo` como prop, e a identidade importa
2. O valor é uma dependência de outro `useEffect` / `useMemo` / `useCallback`
3. A computação é comprovadamente cara (faça profiling antes de presumir)

Memoização prematura adiciona ruído, esconde bugs e pode ser mais lenta do que o recálculo que ela substitui.

## Custom Hooks

Extraia um custom hook quando:

- A mesma sequência de hooks (estado + efeito + computado) aparece em 2 ou mais componentes
- A lógica tem um propósito claro e nomeável (`useDebounce`, `useOnClickOutside`, `useLocalStorage`)
- Você quer testar a lógica independentemente de qualquer componente

NÃO extraia quando:

- Teria um único chamador — faça inline
- O "hook" é apenas um `useState` com outro nome — adiciona indireção, sem valor

```tsx
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

## Padrões de `useState`

- Estado inicial a partir de uma prop apenas na montagem: passe uma função `useState(() => computeInitial(prop))` quando a computação é cara
- Atualizador funcional quando o novo estado depende do antigo: `setCount(c => c + 1)` — nunca `setCount(count + 1)` dentro de contextos assíncronos ou em lote (batched)
- Agrupe estado relacionado em um único objeto apenas quando eles sempre mudam juntos; caso contrário, divida em várias chamadas de `useState`
- Use `useReducer` quando as transições de estado são condicionais ao estado anterior ou há 3 ou mais valores relacionados

## Padrões de `useRef`

- Refs de DOM para APIs imperativas (focus, scroll, bibliotecas de terceiros)
- Container mutável que não dispara re-renderização (ids de timer, valores anteriores, flags de "is mounted")
- Nunca leia ou escreva `ref.current` durante a renderização — apenas dentro de efeitos ou manipuladores de evento
- `useImperativeHandle` apenas ao expor uma API de filho a uma ref do pai — válvula de escape de último recurso

## `useSyncExternalStore`

Use este hook para assinar qualquer store externa (API do navegador, lib de estado de terceiros, emissor de eventos customizado). É a forma suportada de tornar o estado externo seguro com renderização concorrente.

```tsx
const isOnline = useSyncExternalStore(
  (cb) => {
    window.addEventListener("online", cb);
    window.addEventListener("offline", cb);
    return () => {
      window.removeEventListener("online", cb);
      window.removeEventListener("offline", cb);
    };
  },
  () => navigator.onLine,
  () => true,
);
```

## Adições do React 19

- `use()` — desempacota promises e contextos inline; utilizável condicionalmente (único hook com essa propriedade)
- `useFormStatus()` / `useFormState()` (ou `useActionState`) — estado de submissão de formulário sem prop drilling
- `useOptimistic()` — atualizações otimistas de UI enquanto uma server action está pendente
- `useTransition()` — marca atualizações de estado não urgentes para que as urgentes permaneçam responsivas

Quando o projeto tem como alvo o React 19 ou superior, prefira estes em vez de equivalentes feitos à mão.

## Armadilha do Stale Closure

Manipuladores assíncronos e intervalos capturam os valores da renderização em que foram criados. Corrija ao:

1. Usar a forma de atualizador funcional do `setState`
2. Colocar o valor que muda no array de deps do `useEffect` e reconstruir o manipulador
3. Ler de uma ref mantida em sincronia

## Configuração de Lint

Regras obrigatórias:

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

Trate avisos de `exhaustive-deps` como erros no CI para código novo.
