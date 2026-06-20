---
paths:
  - "**/app/**/*.py"
  - "**/fastapi/**/*.py"
  - "**/*_api.py"
---
# Regras do FastAPI

Use estas regras para projetos FastAPI juntamente com as regras gerais de Python.

## Estrutura

- Coloque a construção da aplicação em `create_app()`.
- Mantenha os routers enxutos; mova a persistência e o comportamento de negócio para serviços ou helpers de CRUD.
- Mantenha separados os schemas de requisição, os schemas de atualização e os schemas de resposta.
- Mantenha as sessões de banco de dados e a autenticação em dependências.

## Async

- Use `async def` para endpoints que realizam I/O.
- Use clientes de banco de dados e HTTP assíncronos a partir de endpoints async.
- Não chame `requests`, sessões síncronas do SQLAlchemy ou operações bloqueantes de arquivo/rede a partir de rotas async.

## Injeção de Dependências

```python
@router.get("/users/{user_id}")
async def get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    ...
```

Não crie `SessionLocal()` ou clientes de longa duração dentro dos handlers de rota.

## Schemas

- Nunca inclua senhas, hashes de senha, access tokens, refresh tokens ou estado interno de autenticação nos modelos de resposta.
- Use `response_model` em endpoints que retornam dados da aplicação.
- Use restrições de campo (field constraints) em vez de validação escrita à mão quando o Pydantic puder expressar a regra.

## Segurança

- Mantenha as origens de CORS específicas por ambiente.
- Não combine origens curinga (wildcard) com CORS com credenciais.
- Valide expiração, issuer, audience e algoritmo do JWT.
- Aplique rate limit em endpoints de autenticação e de escrita intensa.
- Remova (redact) credenciais, cookies, cabeçalhos de autorização e tokens dos logs.

## Testes

- Sobrescreva a dependência exata usada por `Depends`.
- Limpe `app.dependency_overrides` após os testes.
- Prefira clientes de teste assíncronos para aplicações assíncronas.

Veja a skill: `fastapi-patterns`.
