# Fluxo de trabalho do Git

## Formato da Mensagem de Commit
```
<type>: <description>

<optional body>
```

Tipos: feat, fix, refactor, docs, test, chore, perf, ci

Nota: Atribuição desabilitada globalmente via ~/.claude/settings.json.

## Fluxo de Pull Request

Ao criar PRs:
1. Analise o histórico completo de commits (não apenas o commit mais recente)
2. Use `git diff [base-branch]...HEAD` para ver todas as alterações
3. Elabore um resumo abrangente do PR
4. Inclua um plano de testes com TODOs
5. Faça o push com a flag `-u` se for um branch novo

> Para o processo completo de desenvolvimento (planejamento, TDD, revisão de código) antes das operações de git,
> veja [development-workflow.md](./development-workflow.md).
