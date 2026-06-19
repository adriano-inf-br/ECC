---
paths:
  - "**/*.component.ts"
  - "**/*.component.html"
  - "**/*.service.ts"
  - "**/*.interceptor.ts"
---
# Segurança no Angular

> This file extends [common/security.md](../common/security.md) with Angular specific content.

## Prevenção de XSS

O Angular sanitiza automaticamente os valores vinculados. Nunca contorne o sanitizer para entrada controlada pelo usuário.

```typescript
// ERRADO: Contorna a sanitização — risco de XSS
this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(userInput);

// CORRETO: Sanitize explicitamente antes de confiar
this.safeHtml = this.sanitizer.sanitize(SecurityContext.HTML, userInput);
```

- Nunca use métodos `bypassSecurityTrust*` sem um motivo documentado e revisado
- Evite `[innerHTML]` com conteúdo não confiável — use `innerText` ou um pipe de sanitização
- Nunca vincule `[href]` à entrada do usuário — o Angular não bloqueia URLs `javascript:` em todos os contextos
- Nunca construa template strings a partir de dados do usuário

## Segurança em HTTP

Use `HttpClient` exclusivamente — nunca `fetch()` ou `XHR` puros, a menos que não exista alternativa.

```typescript
// ERRADO: Contorna os interceptors (headers de auth, tratamento de erros, logging)
const res = await fetch('/api/users');

// CORRETO
users$ = this.http.get<User[]>('/api/users');
```

- Anexe tokens de autenticação via interceptors — nunca hardcode em chamadas de serviço individuais
- Tipifique e valide as respostas da API — trate dados externos como `unknown` na fronteira
- Nunca registre respostas HTTP que possam conter tokens, PII ou credenciais

## Gerenciamento de Segredos

```typescript
// ERRADO: Segredo hardcoded no código-fonte
const apiKey = 'sk-live-xxxx';

// CORRETO: Injetado via environment
import { environment } from '../environments/environment';
const apiKey = environment.apiKey;
```

- Trate `environment.ts` como um formato de configuração — nunca armazene segredos reais em arquivos de environment versionados
- Injete segredos de produção via CI/CD (variáveis de ambiente, gerenciadores de segredos)

## Route Guards

Toda rota autenticada ou restrita por papel deve ter um guard. Nunca confie apenas em ocultar elementos de UI.

```typescript
{
  path: 'admin',
  canMatch: [authGuard, roleGuard('admin')],
  loadChildren: () => import('./admin/admin.routes'),
}
```

Use `canMatch` para rotas sensíveis — ele impede que o módulo da rota seja carregado por completo para usuários não autorizados.

## Segurança em SSR

Ao usar Angular SSR:

- Nunca exponha variáveis de ambiente do lado do servidor ao cliente via `TransferState`, a menos que sejam intencionalmente públicas
- Sanitize todas as entradas antes da renderização do lado do servidor — XSS baseado em DOM também pode ocorrer no servidor
- Evite `window`, `document`, `localStorage` no servidor — proteja com `isPlatformBrowser` ou injete via token `DOCUMENT`

## Content Security Policy

Configure os headers de CSP do lado do servidor. Evite `unsafe-inline` em `script-src`. Ao usar SSR com scripts inline, use nonces via o suporte a CSP do Angular.

## Suporte de Agent

- Use a skill **security-reviewer** para auditorias de segurança abrangentes
