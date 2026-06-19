---
description: Executa uma auditoria determinística do harness do repositório e retorna um scorecard priorizado.
---

# Comando de Auditoria de Harness

Executa uma auditoria determinística do harness do repositório e retorna um scorecard priorizado.

## Uso

`/harness-audit [scope] [--format text|json] [--root path]`

- `scope` (opcional): `repo` (padrão), `hooks`, `skills`, `commands`, `agents`
- `--format`: estilo de saída (`text` padrão, `json` para automação)
- `--root`: audita um caminho específico em vez do diretório de trabalho atual

## Engine Determinístico

Sempre execute:

```bash
node scripts/harness-audit.js <scope> --format <text|json> [--root <path>]
```

Este script é a fonte da verdade para pontuação e verificações. Não invente dimensões adicionais nem pontos ad-hoc.

Versão da rubrica: `2026-05-19`.

O script calcula até 12 categorias fixas (`0-10` normalizado cada). As primeiras sete são sempre aplicáveis; GitHub Integration é sempre aplicável; categorias de deploy-target são aplicáveis apenas quando um marcador correspondente é detectado.

1. Tool Coverage
2. Context Efficiency
3. Quality Gates
4. Memory Persistence
5. Eval Coverage
6. Security Guardrails
7. Cost Efficiency
8. GitHub Integration
9. Vercel Integration *(quando `vercel.json` ou `.vercel/` está presente)*
10. Netlify Integration *(quando `netlify.toml` ou `.netlify/` está presente)*
11. Cloudflare Integration *(quando `wrangler.toml` ou `wrangler.jsonc` está presente)*
12. Fly Integration *(quando `fly.toml` está presente)*

As pontuações derivam de verificações explícitas de arquivo/regra e são reproduzíveis para o mesmo commit.
O script audita o diretório de trabalho atual por padrão e detecta automaticamente se o alvo é o próprio repositório ECC ou um projeto consumidor que usa o ECC.

## Contrato de Saída

Retorne:

1. `overall_score` de um total de `max_score`. `max_score` depende de quais categorias são aplicáveis ao alvo; nunca assuma um total fixo.
2. `applicable_categories[]` e `category_count` descrevendo quais categorias contribuíram.
3. Pontuações de categoria e descobertas concretas.
4. Verificações falhas com caminhos de arquivo exatos.
5. As 3 principais ações da saída determinística (`top_actions`).
6. Skills do ECC sugeridas para aplicar em seguida.

## Checklist

- Use a saída do script diretamente; não repontue manualmente.
- Se `--format json` for solicitado, retorne o JSON do script inalterado.
- Se text for solicitado, resuma as verificações falhas e as principais ações.
- Inclua os caminhos de arquivo exatos de `checks[]` e `top_actions[]`.

## Exemplo de Resultado

```text
Harness Audit (repo, repo): 71/80
- Tool Coverage: 10/10 (10/10 pts)
- Context Efficiency: 9/10 (9/10 pts)
- Quality Gates: 10/10 (10/10 pts)
- GitHub Integration: 2/10 (2/10 pts)

Top 3 Actions:
1) [GitHub Integration] Add at least one workflow under .github/workflows/. (.github/workflows/)
2) [Security Guardrails] Add prompt/tool preflight security guards in hooks/hooks.json. (hooks/hooks.json)
3) [Eval Coverage] Increase automated test coverage across scripts/hooks/lib. (tests/)
```

## Argumentos

$ARGUMENTS:
- `repo|hooks|skills|commands|agents` (escopo opcional)
- `--format text|json` (formato de saída opcional)
