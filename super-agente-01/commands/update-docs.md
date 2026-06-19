---
description: Sincroniza a documentação a partir de arquivos fonte da verdade, como scripts, schemas, rotas e exports.
---

# Update Documentation

Sincronize a documentação com o código, gerando a partir de arquivos fonte da verdade.

## Passo 1: Identifique as fontes da verdade

| Fonte | Gera |
|--------|-----------|
| scripts do `package.json` | Referência de comandos disponíveis |
| `.env.example` | Documentação de variáveis de ambiente |
| `openapi.yaml` / arquivos de rota | Referência de endpoints de API |
| exports do código-fonte | Documentação da API pública |
| `Dockerfile` / `docker-compose.yml` | Docs de configuração de infraestrutura |

## Passo 2: Gere a referência de scripts

1. Leia o `package.json` (ou `Makefile`, `Cargo.toml`, `pyproject.toml`)
2. Extraia todos os scripts/comandos com suas descrições
3. Gere uma tabela de referência:

```markdown
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Production build with type checking |
| `npm test` | Run test suite with coverage |
```

## Passo 3: Gere a documentação de ambiente

1. Leia o `.env.example` (ou `.env.template`, `.env.sample`)
2. Extraia todas as variáveis com suas finalidades
3. Categorize como obrigatórias vs opcionais
4. Documente o formato esperado e os valores válidos

```markdown
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgres://user:pass@host:5432/db` |
| `LOG_LEVEL` | No | Logging verbosity (default: info) | `debug`, `info`, `warn`, `error` |
```

## Passo 4: Atualize o guia de contribuição

Gere ou atualize o `docs/CONTRIBUTING.md` com:
- Configuração do ambiente de desenvolvimento (pré-requisitos, passos de instalação)
- Scripts disponíveis e suas finalidades
- Procedimentos de teste (como executar, como escrever novos testes)
- Aplicação de estilo de código (linter, formatter, hooks de pre-commit)
- Checklist de submissão de PR

## Passo 5: Atualize o runbook

Gere ou atualize o `docs/RUNBOOK.md` com:
- Procedimentos de deploy (passo a passo)
- Endpoints de health check e monitoramento
- Problemas comuns e suas correções
- Procedimentos de rollback
- Caminhos de alerta e escalonamento

## Passo 6: Verificação de obsolescência

1. Encontre arquivos de documentação não modificados há 90+ dias
2. Faça referência cruzada com mudanças recentes do código-fonte
3. Sinalize docs potencialmente desatualizadas para revisão manual

## Passo 7: Mostre o resumo

```
Documentation Update
──────────────────────────────
Updated:  docs/CONTRIBUTING.md (scripts table)
Updated:  docs/ENV.md (3 new variables)
Flagged:  docs/DEPLOY.md (142 days stale)
Skipped:  docs/API.md (no changes detected)
──────────────────────────────
```

## Regras

- **Fonte única da verdade**: sempre gere a partir do código, nunca edite manualmente as seções geradas
- **Preserve as seções manuais**: atualize apenas as seções geradas; deixe a prosa escrita à mão intacta
- **Marque o conteúdo gerado**: use marcadores `<!-- AUTO-GENERATED -->` ao redor das seções geradas
- **Não crie docs sem solicitação**: crie novos arquivos de doc apenas se o comando solicitar explicitamente
