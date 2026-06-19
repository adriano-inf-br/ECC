---
description: Revisa uma aplicação FastAPI quanto a arquitetura, correção assíncrona, injeção de dependências, schemas Pydantic, segurança, performance e testabilidade.
---

# FastAPI Review

Invoca o agent `fastapi-reviewer` para uma revisão FastAPI focada.

## Uso

```text
/fastapi-review [file-or-directory]
```

## Áreas de Revisão

- App factory, fronteiras de router, middleware e exception handlers.
- Separação de schemas Pydantic de request e response.
- Injeção de dependências para sessões de banco de dados, auth, paginação e settings.
- Padrões de banco de dados assíncrono e HTTP externo.
- CORS, auth, rate limits, logging e tratamento de segredos.
- Metadados OpenAPI e modelos de response documentados.
- Configuração de test client e overrides de dependências.

## Saída Esperada

```text
[SEVERITY] Short issue title
File: path/to/file.py:42
Issue: What is wrong and why it matters.
Fix: Concrete change to make.
```

## Relacionados

- Agent: `fastapi-reviewer`
- Skill: `fastapi-patterns`
- Comando: `/python-review`
- Skill: `security-scan`
