---
description: Revisão de código Vue.js abrangente para correção da Composition API, reatividade, padrões de composables, segurança de template, acessibilidade e desempenho específico do Vue. Invoca o agent vue-reviewer (e o typescript-reviewer em paralelo em mudanças .vue/.ts).
---

# Vue Code Review

Este comando invoca o agent **vue-reviewer** para revisão de código específica de Vue. Para pull requests que tocam arquivos `.vue` ou arquivos `.ts`/`.js` contendo Vue, tanto `vue-reviewer` quanto `typescript-reviewer` devem executar — cada um cobre uma faixa distinta.

## O que este comando faz

1. **Identificar mudanças Vue**: encontra arquivos `.vue` modificados e arquivos `.ts`/`.js` relacionados a Vue via `git diff`
2. **Executar Lint**: executa o `eslint` com `eslint-plugin-vue`
3. **Typecheck**: executa `vue-tsc --noEmit` ou o comando canônico de typecheck do projeto
4. **Revisar apenas as faixas Vue**: reatividade, composables, segurança de template, acessibilidade, desempenho específico do Vue
5. **Gerar relatório**: categoriza problemas por severidade (CRITICAL / HIGH / MEDIUM)

## Quando usar

Use `/vue-review` quando:

- Um PR ou commit toca arquivos `.vue`
- Após escrever ou modificar componentes Vue, composables ou stores Pinia
- Antes de fazer merge de código Vue
- Auditando a segurança de template (`v-html`, bindings de URL)
- Revisando a correção de um novo composable
- Auditando guards e navegação do Vue Router
- Revisando rotas de servidor do Nuxt ou código específico de SSR

Para mudanças puras de `.ts`/`.js` sem imports de Vue, use `/code-review` (geral) ou invoque `typescript-reviewer` diretamente.

## Escopo vs `/code-review` e revisão TypeScript

| Ferramenta | Escopo |
|---|---|
| `vue-reviewer` (este comando) | Reatividade, composables, segurança de template, a11y, desempenho Vue, Pinia/Router |
| `typescript-reviewer` | TS/JS genérico — abuso de `any`, correção assíncrona, segurança Node |
| `security-reviewer` | Auditoria de segurança de todo o projeto |
| `/code-review` | Revisão genérica de mudanças não commitadas ou de PR |

Em um PR `.vue` / relacionado a Vue, invoque tanto `vue-reviewer` quanto `typescript-reviewer`. Os achados de cada um não se sobrepõem por design.

## Categorias de revisão

### CRITICAL (Deve corrigir)

- `v-html` com entrada não sanitizada
- `:href`/`:src` com URLs de usuário não validadas (`javascript:`, `data:`)
- Segredo no bundle do cliente (`VITE_*`, runtimeConfig `public` do Nuxt)
- Endpoint de servidor sem validação de entrada (Nuxt Nitro)
- `localStorage`/`sessionStorage` para tokens de sessão
- Desestruturação de props reativas no Vue < 3.5 (quebra a reatividade)
- Substituição de objeto `reactive()` (quebra os watchers)
- Origem de watcher rastreando um objeto ref em vez de `.value`

### HIGH (Deveria corrigir)

- Composable com efeitos colaterais de escopo de módulo
- Cleanup faltante no composable (watcher, interval, listener)
- `v-for` sem `:key` ou com `key={index}`
- `v-if` + `v-for` no mesmo elemento
- Mutação de props
- Validação de prop faltante
- Route guard retornando false sem redirecionamento
- `useRoute().params` desestruturado no nível superior (snapshot)
- `v-model` vinculado a um computed sem setter
- Violações de acessibilidade (labels faltantes, elementos interativos não semânticos)
- Mutação direta de propriedade de store fora de actions

### MEDIUM (Considerar)

- Options API em código novo do Vue 3
- Componente com mais de 300 linhas
- `v-show` onde `v-if` é mais apropriado (ou vice-versa)
- `:max` faltante em `<KeepAlive>`
- `shallowRef` faltante para grandes dados substituídos
- Validação customizada em vez de biblioteca de formulário consolidada
- `defineExpose` expondo mais do que o necessário
- `inheritAttrs` não desabilitado ao usar `v-bind="$attrs"`

## Verificações automatizadas executadas

```bash
# Lint (required)
npx eslint . --ext .vue,.ts,.js

# Vue-specific typecheck
vue-tsc --noEmit

# Targeted security rules
npx eslint . --rule 'vue/no-v-html: warn' \
              --rule 'vue/no-template-target-blank: error'

# Supply-chain
npm audit
```

Se `eslint-plugin-vue` ou `vue-tsc` não estiverem configurados, a revisão sinalizará a lacuna como um problema de configuração HIGH e continuará.

## Exemplo de uso

````text
User: /vue-review

Agent:
# Vue Code Review Report

## Files Reviewed
- src/components/UserCard.vue (modified)
- src/composables/useUser.ts (new)
- src/stores/useUserStore.ts (modified)

## Lint Results
PASS: eslint clean
PASS: vue-tsc clean

## Issues Found

[CRITICAL] Unsanitized v-html
File: src/components/UserCard.vue:15
Issue: User-controlled bio rendered as raw HTML via v-html.
Why: XSS via stored script tags in user input.
Fix: Sanitize with DOMPurify or render as text:
```vue
<script setup>
import DOMPurify from "dompurify";
const safeBio = computed(() => DOMPurify.sanitize(user.bio));
</script>
<template>
  <div v-html="safeBio" />
</template>
```

[HIGH] Watcher in composable missing cleanup
File: src/composables/useUser.ts:22
Issue: `watch` callback fires fetch without AbortController; stale responses can overwrite newer data.
Fix: Use onCleanup to abort:
```ts
watch(userId, async (newId, _old, onCleanup) => {
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  const data = await fetch(`/api/users/${newId}`, { signal: controller.signal });
  user.value = await data.json();
});
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: FAIL: Block merge until CRITICAL issue is fixed
````

## Critérios de aprovação

| Status | Condição |
|---|---|
| PASS: Aprovar | Nenhum problema CRITICAL ou HIGH |
| WARNING: Aviso | Apenas problemas MEDIUM (merge com cautela) |
| FAIL: Bloquear | Problemas CRITICAL ou HIGH encontrados |

## Integração com outros comandos

- Execute primeiro o comando de build do seu projeto se o build estiver quebrado
- Execute os testes para garantir que os testes de componente passem
- Execute `/vue-review` antes de fazer merge de código Vue
- Use `/code-review` para questões não específicas de Vue no mesmo PR

## Relacionados

- Agent: `agents/vue-reviewer.md`
- Agent complementar: `agents/typescript-reviewer.md` (execute em paralelo para TS/JS relacionado a Vue)
- Skills: `skills/vue-patterns/`
- Rules: `rules/vue/`
