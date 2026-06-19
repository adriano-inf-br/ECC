---
description: Inspeciona o estado do loop ativo, progresso, sinais de falha e a intervenção recomendada.
---

# Comando Loop Status

Inspeciona o estado do loop ativo, o progresso e os sinais de falha.

Este comando de barra só pode ser executado após a sessão atual o desenfileirar. Se você
precisar inspecionar uma sessão travada ou irmã, execute a CLI empacotada a partir de outro
terminal:

```bash
npx --package ecc-universal ecc loop-status --json
```

A CLI varre os arquivos JSONL de transcrição locais do Claude em
`~/.claude/projects/**` e reporta chamadas `ScheduleWakeup` obsoletas ou chamadas
de tool `Bash` que não têm um `tool_result` correspondente.

## Uso

`/loop-status [--watch]`

## O Que Reportar

- padrão de loop ativo
- fase atual e último checkpoint bem-sucedido
- verificações que falham (se houver)
- desvio estimado de tempo/custo
- intervenção recomendada (continuar/pausar/parar)

## CLI Entre Sessões

- `ecc loop-status --json` emite status legível por máquina para transcrições
  locais recentes do Claude.
- `ecc loop-status --home <dir>` varre um diretório home diferente ao
  inspecionar outro perfil local ou workspace montado.
- `ecc loop-status --transcript <session.jsonl>` inspeciona uma transcrição
  diretamente.
- `ecc loop-status --bash-timeout-seconds 1800` ajusta o limiar de obsolescência
  do Bash.
- `ecc loop-status --exit-code` sai com `2` quando sinais de loop ou tool
  obsoletos são encontrados, ou `1` quando as transcrições não podem ser varridas.
- `--exit-code` com `--watch` requer `--watch-count` para que os scripts de
  watchdog não esperem para sempre pela saída de um processo.
- `ecc loop-status --watch` atualiza o status até ser interrompido.
- `ecc loop-status --watch --watch-count 3 --exit-code` atualiza um número
  limitado de vezes e então sai com o status mais alto observado.
- `ecc loop-status --watch --watch-count 3` emite um fluxo de watch limitado para
  scripts e handoffs.
- `ecc loop-status --watch --write-dir ~/.claude/loops` mantém
  `index.json` e snapshots JSON por sessão para terminais irmãos ou
  scripts de watchdog.

## Modo Watch

Quando `--watch` está presente, atualiza o status periodicamente. Com `--json`, cada
atualização é emitida como um objeto JSON por linha, para que outro terminal ou script possa
consumir o fluxo.

## Arquivos de Snapshot

Use `--write-dir <dir>` quando um processo separado precisar inspecionar o estado do loop
sem esperar a sessão atual do Claude desenfileirar `/loop-status`. A
CLI escreve:

- `index.json` com uma linha por sessão inspecionada.
- `<session-id>.json` com o payload completo de status daquela sessão.

Esses arquivos são snapshots da análise local de transcrição. Eles não controlam nem
aplicam timeout às chamadas de tool em tempo de execução do Claude Code.

## Argumentos

$ARGUMENTS:
- `--watch` opcional
