---
name: projects
description: Lista os projetos conhecidos e suas estatísticas de instinto
command: true
---

# Comando Projects

Lista as entradas do registro de projetos e as contagens de instintos/observações por projeto para o continuous-learning-v2.

## Implementação

Rode o CLI de instintos usando o caminho da raiz do plugin:

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/continuous-learning-v2/scripts/instinct-cli.py" projects
```

Ou, se `CLAUDE_PLUGIN_ROOT` não estiver definido (instalação manual):

```bash
python3 ~/.claude/skills/continuous-learning-v2/scripts/instinct-cli.py projects
```

## Uso

```bash
/projects
```

## O Que Fazer

1. Leia `~/.claude/homunculus/projects.json`
2. Para cada projeto, exiba:
   - Nome, id, raiz e remote do projeto
   - Contagens de instintos pessoais e herdados
   - Contagem de eventos de observação
   - Timestamp da última visualização
3. Exiba também os totais globais de instintos
