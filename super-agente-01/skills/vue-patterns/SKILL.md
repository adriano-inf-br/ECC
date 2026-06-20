---
name: vue-patterns
description: Padrões da Composition API do Vue.js 3, arquitetura de componentes, melhores práticas de reatividade, gerenciamento de estado com Pinia, navegação com Vue Router e padrões SSR do Nuxt. Ativa para projetos Vue, Nuxt, Vite ou Pinia.
origin: ECC
---

# Padrões e Melhores Práticas do Vue.js

Guia abrangente para desenvolvimento Vue.js 3 usando a Composition API (`<script setup>`), cobrindo design de componentes, reatividade, gerenciamento de estado, roteamento, testes e padrões SSR. Orientações específicas para Nuxt são incluídas onde diferem do Vue puro.

## Quando Ativar

Ative esta skill quando:
- O projeto usa Vue.js (qualquer versão), Nuxt, Vite + Vue ou Pinia.
- O usuário pergunta sobre arquitetura de componentes Vue, composables, reatividade ou gerenciamento de estado.
- Revisando Single-File Components do Vue (arquivos `.vue`).
- Configurando Vue Router, stores Pinia ou configuração Vite/Vitest.
- Discutindo padrões de performance, segurança ou SSR específicos do Vue.

---

## 1. Estrutura do Projeto

### Layout Recomendado (Feature-First)

```
src/
├── api/              # Cliente de API e definições de endpoints
├── assets/           # Assets estáticos (imagens, fontes, ícones)
├── components/       # Componentes compartilhados/reutilizáveis
│   ├── base/         # Primitivos base de UI (Button, Input, Modal)
│   └── features/     # Componentes compartilhados específicos de feature
├── composables/      # Lógica reutilizável da Composition API
├── layouts/          # Layouts de página (opcional)
├── pages/            # Componentes de página no nível de rota
├── router/           # Configuração do Vue Router
├── stores/           # Stores Pinia
├── types/            # Definições de tipos TypeScript
├── utils/            # Funções utilitárias puras
└── App.vue           # Componente raiz
```

### Nomenclatura de Arquivos

| Convenção | Quando Usar |
|-----------|-------------|
| `PascalCase.vue` | Todos os componentes (aplicado por `vue/multi-word-component-names`) |
| `useCamelCase.ts` | Composables |
| `camelCase.ts` | Utilitários, clientes de API, tipos |
| Diretórios `kebab-case` | Segmentos de rota, pastas de feature |

---

## 2. Arquitetura de Componentes

### Ordem do Single-File Component

```vue
<script setup lang="ts">
// 1. Importações (vue → ecossistema → absoluto → relativo)
// 2. Props, Emits e Slots
// 3. Composables
// 4. Estado local (ref/reactive)
// 5. Propriedades computadas
// 6. Métodos
// 7. Watchers
// 8. Lifecycle hooks
</script>

<template>
  <!-- Conteúdo do template -->
</template>

<style scoped>
  /* Estilos com escopo */
</style>
```

### Apresentacional vs Container

- **Componentes Container**: Possuem busca de dados, estado e efeitos colaterais. Renderizam componentes apresentacionais.
- **Componentes Apresentacionais**: Recebem props, emitem eventos. Sem chamadas de API, sem acesso à store. Renderização pura.

### Melhores Práticas de Props

```ts
// Props tipadas com valores padrão
interface Props {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  items: Item[];
}

const props = withDefaults(defineProps<Props>(), {
  variant: "primary",
  disabled: false,
});
```

- Sempre forneça `type`, e `required`/`default` onde apropriado.
- Props booleanas: `isXxx`, `hasXxx`, `canXxx`.
- Nunca mute props — emita eventos em vez disso.
- Para vinculação v-model, use `defineModel()` (Vue 3.4+) ou `modelValue` + `update:modelValue`.

### Eventos

```ts
const emit = defineEmits<{
  submit: [];
  "update:modelValue": [value: string];
  select: [id: string, index: number];
}>();
```

- Use kebab-case em templates (`@update:model-value`).
- Use camelCase no script (`emit("update:modelValue", val)`).

---

## 3. Composables (Lógica Reutilizável)

### Estrutura

```ts
// composables/useDebounce.ts
export function useDebounce<T>(value: MaybeRef<T>, delay: number): Ref<T> {
  const debounced = ref(toValue(value)) as Ref<T>;

  let timer: ReturnType<typeof setTimeout>;
  watch(
    () => toValue(value),
    (newVal) => {
      clearTimeout(timer);
      timer = setTimeout(() => { debounced.value = newVal; }, delay);
    }
  );

  onUnmounted(() => clearTimeout(timer));
  return readonly(debounced);
}
```

### Regras

- Deve começar com o prefixo `use`.
- Retorne valores reativos (`ref`, `computed`, `reactive`), nunca primitivos simples.
- Aceite entradas reativas via `MaybeRef` / `toRef()` / `toValue()`.
- Limpe efeitos colaterais em `onUnmounted` ou no `onCleanup` do watcher.
- Sem efeitos colaterais no escopo do módulo.

### vs Mixins

Composables substituem completamente os mixins do Vue 2:
- **Mixins**: Fluxo de dados opaco, colisões de fonte de verdade, conflitos de nomes.
- **Composables**: Importações explícitas, valores de retorno claros, combináveis e tree-shakable.

---

## 4. Gerenciamento de Estado

### Quando Usar o Quê

| Padrão | Caso de Uso |
|---------|----------|
| `ref()` / `reactive()` | Estado local do componente |
| Props + Emits | Comunicação pai-filho |
| Provide / Inject | Tema, configuração, API de plugin |
| Store Pinia | Estado global, compartilhado, complexo |
| Composable de estado do servidor | Dados de API com cache (envolva `fetch`/TanStack Query) |

### Setup Store Pinia (Preferido)

```ts
// stores/useCartStore.ts
export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);

  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  );
  const itemCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  );

  async function addItem(productId: string) {
    isLoading.value = true;
    try {
      const item = await fetchProduct(productId);
      const existing = items.value.find(i => i.id === item.id);
      if (existing) existing.quantity++;
      else items.value.push({ ...item, quantity: 1 });
    } finally {
      isLoading.value = false;
    }
  }

  return { items, isLoading, totalPrice, itemCount, addItem };
});
```

- Use a sintaxe Setup Store (não Options Store).
- Prefira actions para mutações de nível de negócio e `$patch()` para atualizações agrupadas.
- Toda action assíncrona: trate carregamento + sucesso + erro.

---

## 5. Vue Router

### Definições de Rotas

```ts
const routes = [
  {
    path: "/users/:id",
    name: "user-detail",
    component: () => import("@/pages/UserDetail.vue"), // lazy
    props: true, // passa params como props
    meta: { requiresAuth: true },
  },
];
```

### Guards de Navegação

```ts
router.beforeEach((to, from) => {
  const { isLoggedIn } = useAuthStore();
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
});
```

### Params de Rota Reativos

Quando um componente permanece montado mas os params da rota mudam:

```ts
const route = useRoute();
const id = computed(() => route.params.id as string);
watch(id, (newId) => fetchItem(newId));
```

---

## 6. Padrões de Template

### Sintaxe de Template

```vue
<!-- v-if/v-else-if/v-else -->
<div v-if="isLoading">Carregando...</div>
<div v-else-if="error">Erro: {{ error }}</div>
<div v-else>{{ content }}</div>

<!-- v-show para alternâncias frequentes -->
<div v-show="isOpen">Conteúdo alternado</div>

<!-- v-for com chaves estáveis -->
<div v-for="item in items" :key="item.id">{{ item.name }}</div>

<!-- Lista filtrada por computed (não v-if + v-for no mesmo elemento) -->
<div v-for="item in activeItems" :key="item.id">{{ item.name }}</div>

<!-- Tratamento de eventos -->
<form @submit.prevent="handleSubmit">
  <button type="submit">Salvar</button>
</form>

<!-- v-model -->
<input v-model="name" />
<CustomInput v-model="value" v-model:title="title" />
```

---

## 7. Performance

| Técnica | Quando Usar |
|-----------|-------------|
| `v-memo` | Itens de lista que raramente mudam |
| `v-once` | Conteúdo renderizado uma vez e estático para sempre |
| `shallowRef()` | Grandes estruturas de dados substituídas por completo |
| `shallowReactive()` | Apenas propriedades de nível superior são reativas |
| `v-show` em vez de `v-if` | Alternâncias frequentes de visibilidade |
| `<KeepAlive :max="10">` | Cache de views alternadas |
| Rotas lazy | `() => import(...)` para rotas não críticas |
| `Suspense` | Carregamento de componentes assíncronos com fallback |

---

## 8. Testes

### Stack

- **Vitest** para testes unitários e de componentes
- **Vue Test Utils** para montagem e interação
- **@pinia/testing** para Mock de stores
- **Playwright** para E2E

### Padrão de Teste de Componente

```ts
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import UserCard from "./UserCard.vue";

beforeEach(() => { setActivePinia(createPinia()); });

it("renderiza e emite", async () => {
  const wrapper = mount(UserCard, {
    props: { user: { id: "1", name: "Alice" } },
  });
  expect(wrapper.text()).toContain("Alice");
  await wrapper.find("button").trigger("click");
  expect(wrapper.emitted("select")![0]).toEqual(["1"]);
});
```

---

## 9. Padrões Específicos do Nuxt

### Auto-Importações

O Nuxt auto-importa `ref`, `computed`, `watch`, `useFetch`, `useAsyncData`, etc. Use-os diretamente sem importar. Para projetos não-Nuxt, sempre importe explicitamente.

### useAsyncData / useFetch

```ts
const { data: user, pending, error, refresh } = await useAsyncData(
  "user", // chave única para cache
  () => $fetch(`/api/users/${id}`),
);

const { data: posts } = await useFetch("/api/posts", {
  query: { page: 1 },
  key: "posts-page-1", // desduplicação de requisições
});
```

### Rotas do Servidor

```ts
// server/api/users/[id].ts
export default defineEventHandler(async (event) => {
  const { id } = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid(),
  }).parse);
  // ... buscar e retornar
});
```

### Configuração de Runtime

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // somente servidor
    apiSecret: "",
    // público (exposto ao cliente)
    public: {
      apiBase: "https://api.example.com",
    },
  },
});
```

---

## 10. Novas APIs do Vue 3.5+

### Desestruturação Reativa de Props

O Vue 3.5 estabilizou a desestruturação reativa de props — variáveis desestruturadas de `defineProps()` são automaticamente reativas:

```ts
// Vue 3.5+: props desestruturadas são reativas (sem necessidade de toRefs)
const { count = 0, msg = "hello" } = defineProps<{
  count?: number;
  msg?: string;
}>();

// Limitação: não é possível fazer watch de props desestruturadas diretamente
watch(() => count, (newVal) => { ... }); // PASS getter necessário
```

### `useTemplateRef()`

Substitua refs simples com correspondência de nome por `useTemplateRef()` para referências de template:

```ts
import { useTemplateRef } from "vue";
const inputEl = useTemplateRef<HTMLInputElement>("input");
// "input" corresponde ao atributo ref="input" no template, não ao nome da variável
```

Suporta IDs de ref dinâmicos: `useTemplateRef(dynamicRefId)`.

### `onWatcherCleanup()`

API de limpeza de watcher importável globalmente (Vue 3.5+). Deve ser chamada de forma síncrona dentro do callback do watcher:

```ts
import { watch, onWatcherCleanup } from "vue";

watch(userId, async (newId) => {
  const controller = new AbortController();
  onWatcherCleanup(() => controller.abort());
  // ... fetch com signal
});
```

### `useId()`

Geração de ID único estável para SSR para elementos de formulário e acessibilidade:

```ts
import { useId } from "vue";
const id = useId();
```

### `defer` Teleport

`<Teleport defer>` permite teleportar para alvos renderizados no mesmo ciclo:

```vue
<Teleport defer to="#container">Conteúdo</Teleport>
<div id="container"></div>
```

### Hidratação Lazy (SSR)

`defineAsyncComponent()` agora suporta estratégia `hydrate`:

```ts
import { defineAsyncComponent, hydrateOnVisible } from "vue";
const AsyncComp = defineAsyncComponent({
  loader: () => import("./Comp.vue"),
  hydrate: hydrateOnVisible(),
});
```

---

## Anti-Padrões

| Anti-Padrão | Por Que É Errado | A Correção |
|-------------|---------------|---------|
| Desestruturar `defineProps()` (Vue < 3.5) | Captura um snapshot, perde a reatividade | Acesse via `props.xxx` ou use `toRefs()` |
| `watch()` em prop desestruturada (Vue 3.5+) | Erro em tempo de compilação — props desestruturadas não podem ser observadas diretamente | Use wrapper de getter: `watch(() => count, ...)` |
| `v-if` + `v-for` no mesmo elemento | Ordem de execução ambígua | Use array filtrado por computed |
| Chave `v-for` = índice | Estado quebrado ao reordenar | Use IDs estáveis do banco de dados |
| Mutar props | Viola o fluxo de dados unidirecional | Emita eventos ou use `v-model` |
| `v-html` com conteúdo do usuário | Vulnerabilidade XSS | Sanitize com DOMPurify |
| Mixins no Vue 3 | Opacos, sujeitos a colisões | Substitua por composables |
| Efeitos colaterais no escopo do módulo no composable | Compartilhados entre instâncias | Escopado em `onMounted` + `onUnmounted` |
| `reactive()` para estado substituível | Substituição quebra a reatividade | Use `ref()` em vez disso |
| Watcher sem limpeza | Vazamentos de memória, condições de corrida | Use `onCleanup` ou `onWatcherCleanup()` (Vue 3.5+) |
| Options API em novo código Vue 3 | Ecossistema migrou para Composition API | Use `<script setup>` |
| Ref simples para referências de template | Sem suporte a ref dinâmica, correspondência por nome é frágil | Use `useTemplateRef()` (Vue 3.5+) |

## Skills Relacionadas

- `accessibility` — ARIA, HTML semântico, gerenciamento de foco
- `frontend-patterns` — Arquitetura de Frontend entre frameworks
- `typescript` — Melhores práticas de TypeScript aplicadas a projetos Vue
- `coding-standards` — Padrões gerais de qualidade de código
