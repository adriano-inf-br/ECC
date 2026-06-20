---
description: Cria, verifica ou lista checkpoints de fluxo de trabalho após executar checagens de verificação.
---

# Comando Checkpoint

Cria ou verifica um checkpoint no seu fluxo de trabalho.

## Uso

`/checkpoint [create|verify|list] [name]`

## Criar Checkpoint

Ao criar um checkpoint:

1. Execute `/verify quick` para garantir que o estado atual está limpo
2. Crie um git stash ou commit com o nome do checkpoint
3. Registre o checkpoint em `.claude/checkpoints.log`:

```bash
echo "$(date +%Y-%m-%d-%H:%M) | $CHECKPOINT_NAME | $(git rev-parse --short HEAD)" >> .claude/checkpoints.log
```

4. Reporte o checkpoint criado

## Verificar Checkpoint

Ao verificar em relação a um checkpoint:

1. Leia o checkpoint do log
2. Compare o estado atual com o checkpoint:
   - Arquivos adicionados desde o checkpoint
   - Arquivos modificados desde o checkpoint
   - Taxa de aprovação dos testes agora vs. antes
   - Cobertura agora vs. antes

3. Reporte:
```
CHECKPOINT COMPARISON: $NAME
============================
Files changed: X
Tests: +Y passed / -Z failed
Coverage: +X% / -Y%
Build: [PASS/FAIL]
```

## Listar Checkpoints

Mostre todos os checkpoints com:
- Nome
- Timestamp
- SHA do git
- Status (atual, atrás, à frente)

## Fluxo de trabalho

Fluxo típico de checkpoint:

```
[Start] --> /checkpoint create "feature-start"
   |
[Implement] --> /checkpoint create "core-done"
   |
[Test] --> /checkpoint verify "core-done"
   |
[Refactor] --> /checkpoint create "refactor-done"
   |
[PR] --> /checkpoint verify "feature-start"
```

## Argumentos

$ARGUMENTS:
- `create <name>` - Cria checkpoint nomeado
- `verify <name>` - Verifica em relação a checkpoint nomeado
- `list` - Mostra todos os checkpoints
- `clear` - Remove checkpoints antigos (mantém os últimos 5)
