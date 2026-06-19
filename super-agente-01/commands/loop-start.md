---
description: Inicia um padrão de loop autônomo gerenciado com padrões de segurança e condições de parada explícitas.
---

# Comando Loop Start

Inicia um padrão de loop autônomo gerenciado com padrões de segurança.

## Uso

`/loop-start [pattern] [--mode safe|fast]`

- `pattern`: `sequential`, `continuous-pr`, `rfc-dag`, `infinite`
- `--mode`:
  - `safe` (padrão): quality gates e checkpoints rigorosos
  - `fast`: gates reduzidos para ganhar velocidade

## Fluxo

1. Confirmar o estado do repositório e a estratégia de branch.
2. Selecionar o padrão de loop e a estratégia de tier de modelo.
3. Habilitar os hooks/perfil necessários para o modo escolhido.
4. Criar o plano do loop e escrever o runbook em `.claude/plans/`.
5. Imprimir os comandos para iniciar e monitorar o loop.

## Verificações de Segurança Obrigatórias

- Verificar se os testes passam antes da primeira iteração do loop.
- Garantir que `ECC_HOOK_PROFILE` não esteja desabilitado globalmente.
- Garantir que o loop tenha uma condição de parada explícita.

## Argumentos

$ARGUMENTS:
- `<pattern>` opcional (`sequential|continuous-pr|rfc-dag|infinite`)
- `--mode safe|fast` opcional
