---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Hooks do Python

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Python.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **black/ruff**: formata automaticamente arquivos `.py` após a edição
- **mypy/pyright**: executa a verificação de tipos após editar arquivos `.py`

## Avisos

- Avise sobre instruções `print()` em arquivos editados (use o módulo `logging` em vez disso)
