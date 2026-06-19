---
paths:
  - "**/*.vue"
---

# Segurança Vue

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Vue.

## O Que o Vue Escapa Automaticamente

- A interpolação de texto `{{ }}` e os bindings de atributo dinâmicos (`:title`) têm escape automático. Os vetores abaixo NÃO são protegidos.

## Regra Nº 1: Templates Somente de Fontes Confiáveis

- Nunca use conteúdo não confiável como template de componente. Sem compilação de template em runtime a partir de entrada do usuário.
- Sem `:is` controlado pelo usuário que resolva um componente a partir de uma string arbitrária.

## v-html e Render Functions

- `v-html` ignora o escape e é um vetor direto de XSS. Evite-o em conteúdo do usuário.
- Se for inevitável, sanitize com DOMPurify (config de allowlist) antes do binding, ou renderize em um iframe sandbox. O próprio Vue recomenda sanitizar no backend antes de persistir.
- A saída de render-function e de scoped-slot carrega o mesmo risco. Passar HTML do usuário por `h()` com `innerHTML` é `v-html` com outro nome. Sanitize primeiro.

## Injeção de URL, Style e Event

- `:href` e `:src` não têm escape. URLs `javascript:` executam. Valide o esquema, permita apenas `http` / `https` / `mailto`. A documentação do Vue referencia `@braintree/sanitize-url`, mas sanitize no backend antes de persistir.
- `:style` com entrada do usuário é inseguro (exfiltração via CSS). Use a sintaxe de objeto com propriedades em whitelist, nunca uma string crua do usuário.
- Nunca faça binding de entrada do usuário em `onclick`, `onfocus` ou qualquer atributo de evento.

## Segredos no Bundle do Cliente

- Qualquer coisa em `import.meta.env.VITE_*` é enviada ao navegador. Mantenha chaves de API e tokens no lado do servidor.
- Use cookies httpOnly para tokens de sessão. Nunca empacote credenciais no cliente.

```vue
<!-- unsafe -->
<div v-html="userBio" />
<!-- safe -->
<div v-html="sanitize(userBio)" />
```

## Referência

- Skills ECC: `frontend-patterns`, `vite-patterns`.
- Docs: <https://vuejs.org/guide/best-practices/security.html> · <https://github.com/cure53/DOMPurify> · <https://github.com/braintree/sanitize-url>
