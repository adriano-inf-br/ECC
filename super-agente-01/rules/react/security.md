---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**/*.ts"
  - "**/app/**/*.ts"
  - "**/pages/**/*.ts"
---
# Segurança React

> Este arquivo estende [typescript/security.md](../typescript/security.md) e [common/security.md](../common/security.md) com conteúdo específico de React.

## XSS via `dangerouslySetInnerHTML`

CRÍTICO. O nome da prop é deliberadamente assustador — trate todo uso como uma parada obrigatória na revisão de código.

```tsx
// CRÍTICO: entrada do usuário não sanitizada
<div dangerouslySetInnerHTML={{ __html: userBio }} />

// Opções CORRETAS:
// 1. Renderize como texto
<div>{userBio}</div>

// 2. Renderize markdown parseado por uma biblioteca que sanitiza
<ReactMarkdown>{userBio}</ReactMarkdown>

// 3. Se HTML bruto for necessário, sanitize primeiro com DOMPurify
import DOMPurify from "isomorphic-dompurify";
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userBio) }} />
```

Checklist de auditoria para toda chamada de `dangerouslySetInnerHTML`:

- A entrada está sempre sob nosso controle? Documente a origem.
- Se derivada do usuário: ela é sanitizada no **mesmo local da chamada**? (Sanitização na fronteira da API só é aceitável se todo consumidor for verificado.)
- O sanitizador está configurado com allowlist de tags, e não com denylist?

## Esquemas de URL Inseguros

URLs `javascript:` e `data:` em `href`, `src` e `xlink:href` executam código arbitrário.

```tsx
// CRÍTICO: injeção de URL javascript:
<a href={user.website}>Visit</a>   // se user.website = "javascript:alert(1)"

// CORRETO: valide o esquema
function safeUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    if (["http:", "https:", "mailto:"].includes(parsed.protocol)) return url;
  } catch {
    return undefined;
  }
  return undefined;
}
<a href={safeUrl(user.website)}>Visit</a>
```

O React avisa sobre URLs `javascript:` em `href` no modo de desenvolvimento, mas não as bloqueia em tempo de execução. URLs `data:` e outros esquemas também passam despercebidos. Valide sempre.

## `target="_blank"` Sem `rel`

`<a target="_blank">` sem `rel="noopener noreferrer"` permite que a página de destino acesse `window.opener` e execute sequestros de navegação.

```tsx
// ERRADO
<a href={externalUrl} target="_blank">External</a>

// CORRETO
<a href={externalUrl} target="_blank" rel="noopener noreferrer">External</a>
```

Navegadores modernos usam `noopener` por padrão quando há `target="_blank"`, mas não dependa dos padrões do navegador — seja explícito.

## Validação de Entrada de Server Action

Server Actions (`"use server"`) rodam com o mesmo nível de confiança de um endpoint público de API. Valide toda entrada.

```tsx
"use server";
import { z } from "zod";

const Input = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(120),
});

export async function updateUser(_state: unknown, formData: FormData) {
  const parsed = Input.safeParse({
    email: formData.get("email"),
    age: Number(formData.get("age")),
  });
  if (!parsed.success) return { error: parsed.error.flatten() };
  // ...
}
```

- Autentique dentro da action — não confie no portão de rota do lado do cliente
- Autorize: confirme que o usuário atual tem permissão para o registro específico que está mutando
- Aplique rate limit em actions sensíveis

## Exposição de Segredos via Variáveis de Ambiente

Variáveis de ambiente com prefixo são incluídas no bundle do cliente. Trate-as como públicas.

| Framework | Prefixo público | Privado |
|---|---|---|
| Next.js | `NEXT_PUBLIC_*` | Todos os demais |
| Vite | `VITE_*` | `.env` apenas no lado do servidor |
| Create React App | `REACT_APP_*`, além de `NODE_ENV` e `PUBLIC_URL` | Todos os demais (qualquer coisa sem o prefixo `REACT_APP_` é apenas do lado do servidor) |
| Remix | acesso a `process.env` apenas em `loader`/`action` | Igual |

```ts
// CRÍTICO: segredo vazado para o bundle do cliente
const apiKey = process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;
```

Audite em todo PR que toca variáveis de ambiente: essa string no bundle público seria um problema?

## Autenticação / Autorização

- Nunca armazene sessões no `localStorage` — acessível a qualquer XSS. Use cookies httpOnly secure.
- Nunca confie em estado definido pelo cliente para controlar acesso a UI sensível. O controle de renderização no JSX impede a exibição, não o acesso — a API deve impor.
- CSRF: autenticação baseada em cookie requer tokens CSRF ou cookies `SameSite=Strict`/`Lax`
- Use cookies de dupla submissão ou verificação de origem para form actions quando não usar os padrões do framework

## Content Security Policy (CSP)

Configure no lado do servidor. A CSP mínima aceitável para uma aplicação React:

```
default-src 'self';
script-src 'self' 'nonce-{REQUEST_NONCE}';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://api.example.com;
frame-ancestors 'none';
```

- Evite `unsafe-inline` e `unsafe-eval` em `script-src`
- Para SSR com scripts inline (streaming do Next.js, dados de hidratação), use nonces por requisição — tanto o Next.js quanto o Remix suportam injeção de nonce
- `style-src 'unsafe-inline'` é frequentemente inevitável para bibliotecas de CSS-in-JS — documente o tradeoff

## Prototype Pollution via Object Spread

```tsx
// ERRADO: JSON não confiável espalhado diretamente no estado
const update = await req.json();
setState({ ...state, ...update });    // o atacante controla __proto__

// CORRETO: parse com um schema, ou proteja as chaves
const Allowed = z.object({ name: z.string(), email: z.string().email() });
const parsed = Allowed.parse(await req.json());
setState({ ...state, ...parsed });
```

## Injeção de Template em SSR

Ao usar `renderToString` ou `renderToPipeableStream`:

- Todos os valores renderizados dentro do JSX são escapados pelo React — seguros
- Valores passados para `dangerouslySetInnerHTML` NÃO são escapados — mesmas regras do cliente
- Wrappers de HTML construídos manualmente em torno da saída do React devem ser escapados ou sanitizados — nunca concatene entrada do usuário no template HTML circundante

## Componentes de Terceiros

- Audite com `npm audit` antes de adicionar qualquer biblioteca de UI
- Verifique se a biblioteca não usa internamente `dangerouslySetInnerHTML` na sua entrada (ex.: editores de rich text)
- Fixe versões, revise changelogs antes de atualizações major
- Desconfie de componentes que aceitam strings HTML como props

## Exposição de Source Map em Produção

Builds de produção devem ser entregues sem source maps, ou com sourcemaps enviados a um rastreador de erros (Sentry) e removidos do bundle público. Source maps públicos vazam lógica interna e estrutura de arquivos.

## Suporte de Agents

- Use o agent `security-reviewer` para auditorias de segurança abrangentes em toda a base de código
- Use o agent `react-reviewer` para padrões específicos de React e as regras acima em revisão de código ativa
