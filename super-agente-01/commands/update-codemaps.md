---
description: Escaneia a estrutura do projeto e gera codemaps de arquitetura econômicos em tokens.
---

# Update Codemaps

Analise a estrutura do código e gere documentação de arquitetura econômica em tokens.

## Passo 1: Escaneie a estrutura do projeto

1. Identifique o tipo de projeto (monorepo, app único, biblioteca, microsserviço)
2. Encontre todos os diretórios de código-fonte (src/, lib/, app/, packages/)
3. Mapeie os pontos de entrada (main.ts, index.ts, app.py, main.go, etc.)

## Passo 2: Gere os codemaps

Crie ou atualize codemaps em `docs/CODEMAPS/` (ou `.reports/codemaps/`):

| Arquivo | Conteúdo |
|------|----------|
| `architecture.md` | Diagrama de sistema de alto nível, fronteiras de serviço, fluxo de dados |
| `backend.md` | Rotas de API, cadeia de middleware, mapeamento service → repository |
| `frontend.md` | Árvore de páginas, hierarquia de componentes, fluxo de gerenciamento de estado |
| `data.md` | Tabelas de banco de dados, relacionamentos, histórico de migração |
| `dependencies.md` | Serviços externos, integrações de terceiros, bibliotecas compartilhadas |

### Formato do codemap

Cada codemap deve ser econômico em tokens — otimizado para consumo de contexto por IA:

```markdown
# Backend Architecture

## Routes
POST /api/users → UserController.create → UserService.create → UserRepo.insert
GET  /api/users/:id → UserController.get → UserService.findById → UserRepo.findById

## Key Files
src/services/user.ts (business logic, 120 lines)
src/repos/user.ts (database access, 80 lines)

## Dependencies
- PostgreSQL (primary data store)
- Redis (session cache, rate limiting)
- Stripe (payment processing)
```

## Passo 3: Detecção de diff

1. Se codemaps anteriores existirem, calcule o percentual de diferença
2. Se as mudanças > 30%, mostre o diff e solicite a aprovação do usuário antes de sobrescrever
3. Se as mudanças <= 30%, atualize no local

## Passo 4: Adicione metadados

Adicione um cabeçalho de frescor a cada codemap:

```markdown
<!-- Generated: 2026-02-11 | Files scanned: 142 | Token estimate: ~800 -->
```

## Step 5: Save Analysis Report

Write a summary to `.reports/codemap-diff.txt`:
- Files added/removed/modified since last scan
- New dependencies detected
- Architecture changes (new routes, new services, etc.)
- Staleness warnings for docs not updated in 90+ days

## Tips

- Focus on **high-level structure**, not implementation details
- Prefer **file paths and function signatures** over full code blocks
- Keep each codemap under **1000 tokens** for efficient context loading
- Use ASCII diagrams for data flow instead of verbose descriptions
- Run after major feature additions or refactoring sessions
