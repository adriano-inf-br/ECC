---
description: Revisão abrangente de PR usando agents especializados
---

Execute uma revisão abrangente e multiperspectiva de um pull request.

## Uso

`/review-pr [PR-number-or-URL] [--focus=comments|tests|errors|types|code|simplify]`

Se nenhum PR for especificado, revise o PR da branch atual. Se nenhum foco for especificado, execute a pilha completa de revisão.

## Etapas

1. Identifique o PR:
   - use `gh pr view` para obter detalhes do PR, arquivos alterados e o diff
2. Encontre as orientações do projeto:
   - procure por `CLAUDE.md`, configuração do lint, configuração do TypeScript, convenções do repositório
3. Execute os agents de revisão especializados:
   - `code-reviewer`
   - `comment-analyzer`
   - `pr-test-analyzer`
   - `silent-failure-hunter`
   - `type-design-analyzer`
   - `code-simplifier`
4. Agregue os resultados:
   - elimine descobertas sobrepostas duplicadas
   - ordene por severidade
5. Reporte as descobertas agrupadas por severidade

## Regra de Confiança

Reporte apenas problemas com confiança >= 80:

- Crítico: bugs, segurança, perda de dados
- Importante: testes faltando, problemas de qualidade, violações de estilo
- Consultivo: sugestões apenas quando explicitamente solicitadas
