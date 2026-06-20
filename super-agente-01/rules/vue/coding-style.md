---
paths:
  - "**/*.vue"
---

# Estilo de Código Vue

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Vue.

## Estrutura do SFC

- Sempre `<script setup lang="ts">` com a Composition API. Sem Options API em código novo.
- Ordem dos blocos dentro de um arquivo `.vue`: `<script setup>`, depois `<template>`, depois `<style scoped>`. Um componente por arquivo.
- Nomenclatura: arquivos de componente em PascalCase (`AuctionCard.vue`), composables em camelCase com prefixo `useXxx` (`useAuctionTimer`).
- Formate com Prettier mais a flat config do ESLint usando `eslint-plugin-vue` (`vue/vue3-recommended`). Faça type-check com `vue-tsc`.

## Disciplina de Reatividade

- `ref` é a API de estado primária. Mute via `.value` no script, com unwrap automático apenas no nível superior do template.
- `ref` aninhado dentro de arrays, `Map` ou `Set` ainda precisa de `.value` para leitura.
- Recorra a `reactive` apenas para estado de objeto agrupado. Nunca reatribua um objeto `reactive` inteiro.
- Nunca desestruture um objeto `reactive` ou uma store do Pinia sem `toRefs` / `storeToRefs`. A desestruturação simples descarta a reatividade silenciosamente.

## Computed e Watchers

- Os getters de `computed` devem ser puros: sem efeitos colaterais, sem assíncrono, sem acesso ao DOM.
- A partir do 3.4, `computed` só dispara quando o valor retornado muda. Retorne o objeto anterior inalterado quando for igual, para pular atualizações subsequentes.
- `watch` é lazy. Passe um getter para uma propriedade reativa (`watch(() => x.value, ...)`), não o objeto reativo cru.
- `watchEffect` é eager e para de rastrear dependências após seu primeiro `await`.

## Ciclo de Vida e DOM

- Registre os hooks de ciclo de vida de forma síncrona dentro de `setup` (`onMounted`, `onUnmounted`).
- Limpe timers, listeners e assinaturas em `onUnmounted`.
- Leia ou meça o DOM apenas após `await nextTick()`.

## Macros e Templates

- Macros: `defineProps` / `defineEmits` (forma de tupla `change: [id: number]`), `defineModel` (3.4+) para `v-model`, `withDefaults` ou a desestruturação reativa de props do 3.5+ para defaults, `defineExpose` para a API pública de ref.
- Coloque um `:key` em todo `v-for`, um primitivo único e estável. Nunca o índice do array, nunca um objeto.
- Nunca coloque `v-if` e `v-for` no mesmo elemento. Envolva com `<template v-for>` mais um `v-if` interno, ou pré-compute uma lista filtrada.

```vue
<script setup lang="ts">
const props = defineProps<{ id: number }>()
const emit = defineEmits<{ change: [id: number] }>()
const open = defineModel<boolean>('open', { default: false })
</script>
```

## Referência

- Skills ECC: `frontend-patterns`, `vite-patterns`.
- Docs: <https://vuejs.org/api/sfc-script-setup.html> · <https://vuejs.org/guide/essentials/reactivity-fundamentals.html> · <https://eslint.vuejs.org/>
