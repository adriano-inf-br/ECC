---
paths:
  - "**/*.vue"
---

# Testes Vue

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Vue.

## Stack

- Vitest (runner nativo do Vite) mais `@vue/test-utils`. O `create-vue` faz o scaffold do `@vitejs/plugin-vue`.
- Ambiente DOM via `happy-dom` ou `jsdom`, definido em `vite.config.ts` sob `test.environment`.

## Renderização e Assíncrono

- `mount` para uma renderização completa. `shallowMount` para fazer stub de todos os componentes filhos.
- `trigger` e `setValue` retornam promises, faça `await` neles.
- `flushPromises` esvazia os handlers de promise resolvidos. `nextTick` assenta o DOM após uma mudança de estado.

## O Que Testar

- Teste apenas a interface pública: props, eventos emitidos, slots, saída renderizada.
- Não faça asserções sobre estado privado ou métodos internos, e não dependa apenas de snapshots.

## Composables

- Composables que usam apenas APIs de reatividade fazem unit-test diretamente: chame a função, faça asserções sobre os refs retornados.
- Composables que usam hooks de ciclo de vida ou `inject` devem ser testados através de um componente hospedeiro.

## Pinia

- Em componentes: `createTestingPinia()` de `@pinia/testing`, passado via `global.plugins`. As actions têm stub por padrão; defina `stubActions: false` para executá-las. `createSpy: vi.fn` é obrigatório sob o Vitest (sem globais do Jest).
- Em isolamento: `beforeEach(() => setActivePinia(createPinia()))` dá uma store nova por teste e evita vazamento de estado.

## Configuração de Mount

- `global.plugins`, `global.stubs` (faz stub de `Transition` / `TransitionGroup` por padrão), `global.mocks` (ex.: `$router`), `global.provide` (para `inject`, com suporte a chaves Symbol).
- `RouterLinkStub` faz stub de `router-link` sem montar um router completo.

```ts
const wrapper = mount(AuctionCard, {
  props: { id: 1 },
  global: { plugins: [createTestingPinia({ createSpy: vi.fn })] },
})
await wrapper.find('button').trigger('click')
expect(wrapper.emitted('bid')).toBeTruthy()
```

## Referência

- Skills ECC: `frontend-patterns`, `vite-patterns`.
- Docs: <https://test-utils.vuejs.org/api/> · <https://pinia.vuejs.org/cookbook/testing.html> · <https://vitest.dev/>
