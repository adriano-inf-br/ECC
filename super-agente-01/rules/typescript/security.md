---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# Segurança em TypeScript/JavaScript

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de TypeScript/JavaScript.

## Gerenciamento de Segredos

```typescript
// NUNCA: Segredos embutidos no código
const apiKey = "sk-proj-xxxxx"

// SEMPRE: Variáveis de ambiente
const apiKey = process.env.API_KEY

if (!apiKey) {
  throw new Error('API_KEY not configured')
}
```

## Suporte de Agent

- Use a skill **security-reviewer** para auditorias de segurança abrangentes
