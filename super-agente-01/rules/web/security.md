> Este arquivo estende [common/security.md](../common/security.md) com conteúdo de segurança específico de web.

# Regras de Segurança Web

## Content Security Policy

Sempre configure uma CSP de produção.

### CSP Baseada em Nonce

Use um nonce por requisição para scripts em vez de `'unsafe-inline'`.

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.example.com;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
```

Ajuste as origens ao projeto. Não copie este bloco sem alterá-lo (cargo-cult).

## Prevenção de XSS

- Nunca injete HTML não sanitizado
- Evite `innerHTML` / `dangerouslySetInnerHTML` a menos que sanitizado primeiro
- Faça escape de valores dinâmicos de template
- Sanitize HTML do usuário com um sanitizador local confiável quando absolutamente necessário

## Scripts de Terceiros

- Carregue de forma assíncrona
- Use SRI ao servir a partir de uma CDN
- Audite trimestralmente
- Prefira auto-hospedagem para dependências críticas quando viável

## HTTPS e Headers

```text
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Formulários

- Proteção CSRF em formulários que alteram estado
- Rate limiting nos endpoints de submissão
- Valide no lado do cliente e do servidor
- Prefira honeypots ou controles leves anti-abuso em vez de defaults pesados de CAPTCHA
