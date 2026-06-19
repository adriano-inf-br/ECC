---
name: nanoclaw-repl
description: Opere e estenda o NanoClaw v2, o REPL com reconhecimento de sessão e sem dependências do ECC, construído sobre claude -p.
metadata:
  origin: ECC
---

# NanoClaw REPL

Use esta skill ao executar ou estender `scripts/claw.js`.

## Capacidades

- sessões persistentes lastreadas em markdown
- troca de modelo com `/model`
- carregamento dinâmico de skill com `/load`
- ramificação de sessão com `/branch`
- busca entre sessões com `/search`
- compactação de histórico com `/compact`
- exportação para md/json/txt com `/export`
- métricas de sessão com `/metrics`

## Orientação de Operação

1. Mantenha as sessões focadas na tarefa.
2. Crie um Branch antes de mudanças de alto risco.
3. Compacte após marcos importantes.
4. Exporte antes de compartilhar ou arquivar.

## Regras de Extensão

- mantenha zero dependências externas de runtime
- preserve a compatibilidade do markdown-como-banco-de-dados
- mantenha os handlers de comando determinísticos e locais
