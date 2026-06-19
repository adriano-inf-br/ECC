---
paths:
  - "**/*.vue"
---

# Padrões Vue

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Vue.

## Composables

- O composable (`useXxx`) é a unidade de lógica reutilizável. No Feature-Sliced Design ele fica no segmento `model` da fatia.
- Aceite entradas `MaybeRefOrGetter<T>` e normalize com `toValue`, para que quem chama possa passar um ref, um getter ou um valor cru.
- Retorne `toRefs(reactive(...))` para que os consumidores possam desestruturar sem perder a reatividade.
- Um composable que usa hooks de ciclo de vida ou `provide` / `inject` deve ser chamado dentro do `setup` de um componente, não de forma lazy ou condicional.

## Props, Emits, v-model

- `defineProps<Props>()` baseado em tipo e `defineEmits<{ change: [id: number] }>()` na forma de tupla.
- `defineModel<T>('name', { default })` para binding bidirecional. Ele compila para uma prop mais um emit `update:*`.

## Provide / Inject

- Use `provide` / `inject` para dados com escopo de árvore sem prop drilling.
- Chaves type-safe e livres de colisão: `const key = Symbol() as InjectionKey<T>`.
- O provedor é dono das mutações. Exponha um ref `readonly` mais uma função atualizadora explícita, nunca um ref mutável cru.

## Pinia (segmento model do FSD)

- Prefira setup stores: `ref` é estado, `computed` são getters, `function` são actions.
- Setup stores não ganham `$reset` de graça. Defina o seu próprio.
- Use `storeToRefs` para estado e getters. Desestruture as actions diretamente da store.
- Nunca persista tokens de autenticação crus no `localStorage`.

## vue-router

- Faça lazy-load dos componentes de rota com `import()` dinâmico.
- Um gate de autenticação `beforeEach` global baseado em `meta.requiresAuth`. Os guards retornam `false` (cancelar), uma localização de rota (redirecionar), ou `undefined` / `true` (continuar).
- Observe `() => route.params.id`, não o objeto `route` inteiro.

## vue-query (cache de servidor)

- `@tanstack/vue-query` é dono do estado de cache de servidor. O Pinia é dono do estado de cliente.
- Coloque as funções de requisição mais as factories de `queryOptions` no segmento `api` do FSD.
- Crítico: coloque o ref ou computed EM SI na query key, nunca `.value`. Passar `.value` congela a key e mata o refetch reativo.

```ts
useQuery({ queryKey: ['auction', id], queryFn: () => fetchAuction(toValue(id)) })
// after a mutation
queryClient.invalidateQueries({ queryKey: ['auction', id] })
```

## Referência

- Skills ECC: `frontend-patterns`, `vite-patterns`.
- Docs: <https://pinia.vuejs.org/> · <https://router.vuejs.org/> · <https://tanstack.com/query/latest/docs/framework/vue/overview> · <https://vuejs.org/guide/reusability/composables.html>
