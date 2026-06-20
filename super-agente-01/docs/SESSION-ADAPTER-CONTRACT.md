# Contrato do Adapter de Sessão

Este documento define o contrato canônico de snapshot de sessão do ECC para
`ecc.session.v1`.

O contrato está implementado em
`scripts/lib/session-adapters/canonical-session.js`. Este documento é a
especificação normativa para adapters e consumidores.

## Objetivo

O ECC tem múltiplas fontes de sessão:

- sessões de worktree orquestradas por tmux
- histórico de sessão local do Claude
- futuros harnesses e backends de plano de controle

Os adapters normalizam essas fontes em um formato de snapshot seguro para o plano de controle,
para que inspeção, persistência e futuras camadas de UI não dependam de arquivos
específicos do harness ou detalhes de runtime.

## Snapshot Canônico

Todo adapter DEVE retornar um objeto serializável em JSON com esta forma de nível superior:

```json
{
  "schemaVersion": "ecc.session.v1",
  "adapterId": "dmux-tmux",
  "session": {
    "id": "workflow-visual-proof",
    "kind": "orchestrated",
    "state": "active",
    "repoRoot": "/tmp/repo",
    "sourceTarget": {
      "type": "session",
      "value": "workflow-visual-proof"
    }
  },
  "workers": [
    {
      "id": "seed-check",
      "label": "seed-check",
      "state": "running",
      "health": "healthy",
      "branch": "feature/seed-check",
      "worktree": "/tmp/worktree",
      "runtime": {
        "kind": "tmux-pane",
        "command": "codex",
        "pid": 1234,
        "active": false,
        "dead": false
      },
      "intent": {
        "objective": "Inspect seeded files.",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "outputs": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "artifacts": {
        "statusFile": "/tmp/status.md",
        "taskFile": "/tmp/task.md",
        "handoffFile": "/tmp/handoff.md"
      }
    }
  ],
  "aggregates": {
    "workerCount": 1,
    "states": {
      "running": 1
    },
    "healths": {
      "healthy": 1
    }
  }
}
```

## Campos Obrigatórios

### Nível Superior

| Campo | Tipo | Notas |
| --- | --- | --- |
| `schemaVersion` | string | DEVE ser exatamente `ecc.session.v1` para este contrato |
| `adapterId` | string | Identificador estável do adapter como `dmux-tmux` ou `claude-history` |
| `session` | object | Metadados canônicos de sessão |
| `workers` | array | Registros canônicos de worker; pode estar vazio |
| `aggregates` | object | Contagens derivadas de worker |

### `session`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | Identificador estável no domínio do adapter |
| `kind` | string | Família de sessão de alto nível como `orchestrated` ou `history` |
| `state` | string | Estado canônico de sessão |
| `sourceTarget` | object | Proveniência para o target que abriu a sessão |

### `session.sourceTarget`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `type` | string | Classe de busca como `plan`, `session`, `claude-history`, `claude-alias` ou `session-file` |
| `value` | string | Valor bruto do target ou caminho resolvido |

### `workers[]`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | string | Identificador estável do worker no escopo do adapter |
| `label` | string | Rótulo voltado ao operador |
| `state` | string | Estado canônico do worker (ciclo de vida) |
| `health` | string | Saúde canônica do worker (condição operacional) |
| `runtime` | object | Metadados de execução/runtime |
| `intent` | object | Por que este worker/sessão existe |
| `outputs` | object | Resultados estruturados e verificações |
| `artifacts` | object | Referências de arquivo/caminho de propriedade do adapter |

### `workers[].runtime`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `kind` | string | Família de runtime como `tmux-pane` ou `claude-session` |
| `active` | boolean | Se o runtime está ativo agora |
| `dead` | boolean | Se o runtime é conhecido como morto/finalizado |

### `workers[].intent`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `objective` | string | Objetivo primário ou título |
| `seedPaths` | string[] | Caminhos de seed ou contexto associados ao worker/sessão |

### `workers[].outputs`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `summary` | string[] | Saídas concluídas ou itens de resumo |
| `validation` | string[] | Evidências de validação ou verificações |
| `remainingRisks` | string[] | Riscos abertos, acompanhamentos ou notas |

### `aggregates`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `workerCount` | integer | DEVE ser igual a `workers.length` |
| `states` | object | Mapa de contagem derivado de `workers[].state` |
| `healths` | object | Mapa de contagem derivado de `workers[].health` |

## Campos Opcionais

Campos opcionais PODEM ser omitidos, mas se emitidos DEVEM preservar o tipo documentado:

| Campo | Tipo | Notas |
| --- | --- | --- |
| `session.repoRoot` | `string \| null` | Raiz do repositório/worktree quando conhecida |
| `workers[].branch` | `string \| null` | Nome do branch quando conhecido |
| `workers[].worktree` | `string \| null` | Caminho do worktree quando conhecido |
| `workers[].runtime.command` | `string \| null` | Comando ativo quando conhecido |
| `workers[].runtime.pid` | `number \| null` | ID do processo quando conhecido |
| `workers[].artifacts.*` | definido pelo adapter | Caminhos de arquivo ou referências estruturadas de propriedade do adapter |

Campos opcionais específicos do adapter pertencem dentro de `runtime`, `artifacts` ou outros
objetos aninhados documentados. Os adapters NÃO DEVEM inventar novos campos de nível superior sem
atualizar este contrato.

## Semânticas de Estado

O contrato mantém intencionalmente `session.state` e `workers[].state` flexíveis
o suficiente para múltiplos harnesses, mas os adapters atuais usam esses valores:

- `dmux-tmux`
  - estados de sessão: `active`, `completed`, `failed`, `idle`, `missing`
  - estados de worker: derivados de arquivos de status do worker, por exemplo `running` ou
    `completed`
- `claude-history`
  - estado de sessão: `recorded`
  - estado de worker: `recorded`

Os consumidores DEVEM tratar strings de estado desconhecidas como valores válidos específicos do adapter e
degradar graciosamente.

## Estratégia de Versionamento

`schemaVersion` é o único portão de compatibilidade. Os consumidores DEVEM ramificar nele.

### Permitido em `ecc.session.v1`

- adicionar novos campos aninhados opcionais
- adicionar novos IDs de adapter
- adicionar novos valores de string de estado
- adicionar novos valores de string de saúde
- adicionar novas chaves de artefato dentro de `workers[].artifacts`

### Requer uma nova versão de schema

- remover um campo obrigatório
- renomear um campo
- mudar o tipo de um campo
- mudar o significado de um campo existente de forma não compatível
- mover dados de um campo para outro mantendo a mesma string de versão

Se algum desses acontecer, o produtor DEVE emitir uma nova string de versão como
`ecc.session.v2`.

## Requisitos de Conformidade do Adapter

Todo adapter de sessão ECC DEVE:

1. Emitir `schemaVersion: "ecc.session.v1"` exatamente.
2. Retornar um snapshot que satisfaça todos os campos e tipos obrigatórios.
3. Usar `null` para valores escalares opcionais desconhecidos e arrays vazios para valores
   de lista desconhecidos.
4. Manter detalhes específicos do adapter aninhados em `runtime`, `artifacts` ou outros
   objetos aninhados documentados.
5. Garantir que `aggregates.workerCount === workers.length`.
6. Garantir que `aggregates.states` corresponda aos estados de worker emitidos.
7. Garantir que `aggregates.healths` corresponda aos valores de saúde do worker emitidos.
7. Produzir apenas valores simples serializáveis em JSON.
8. Validar a forma canônica antes da persistência ou uso downstream.
9. Persistir o snapshot canônico normalizado através do shim de gravação de sessão.
   Neste repositório, esse shim tenta primeiro `scripts/lib/state-store` e recorre
   a um arquivo de gravação JSON apenas quando o módulo de armazenamento de estado ainda não está
   disponível.

## Expectativas do Consumidor

Os consumidores DEVEM:

- confiar apenas nos campos documentados para `ecc.session.v1`
- ignorar campos opcionais desconhecidos
- tratar `adapterId`, `session.kind` e `runtime.kind` como dicas de roteamento em vez de
  enums exaustivos
- esperar chaves de artefato específicas do adapter dentro de `workers[].artifacts`

Os consumidores NÃO DEVEM:

- inferir comportamento específico do harness a partir de campos não documentados
- assumir que todos os adapters têm painéis tmux, worktrees git ou arquivos de coordenação markdown
- rejeitar snapshots apenas porque uma string de estado é desconhecida

## Mapeamentos Atuais do Adapter

### `dmux-tmux`

- Origem: `scripts/lib/orchestration-session.js`
- ID de sessão: nome da sessão de orquestração
- Tipo de sessão: `orchestrated`
- Target de origem da sessão: caminho do plano ou nome da sessão
- Tipo de runtime do worker: `tmux-pane`
- Artefatos: `statusFile`, `taskFile`, `handoffFile`

### `claude-history`

- Origem: `scripts/lib/session-manager.js`
- ID de sessão: ID curto do Claude quando presente, caso contrário ID derivado do nome de arquivo da sessão
- Tipo de sessão: `history`
- Target de origem da sessão: target de histórico explícito, alias ou arquivo de sessão `.tmp`
- Tipo de runtime do worker: `claude-session`
- Caminhos de seed de intenção: analisados de `### Context to Load`
- Artefatos: `sessionFile`, `context`

## Referência de Validação

A implementação no repositório valida:

- estrutura de objeto obrigatória
- campos de string obrigatórios
- flags de runtime booleanas
- saídas de array de string e caminhos de seed
- consistência de contagem de aggregate

Os adapters devem tratar falhas de validação como bugs de contrato, não erros de entrada do usuário.

## Comportamento de Fallback de Gravação

O gravador de fallback JSON é um shim de compatibilidade temporário para o período
antes do armazenamento de estado dedicado chegar. Seu comportamento é:

- o snapshot mais recente é sempre substituído no lugar
- registros de histórico apenas corpos de snapshot distintos
- leituras repetidas sem alteração não acrescentam entradas de histórico duplicadas

Isso mantém `session-inspect` e outras leituras de estilo de polling de crescer
histórico ilimitado para o mesmo snapshot de sessão sem alterações.
