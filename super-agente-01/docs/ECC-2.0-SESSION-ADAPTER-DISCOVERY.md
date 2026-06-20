# Descoberta de Adaptadores de Sessão ECC 2.0

## Propósito

Este documento transforma a direção do plano de controle ECC 2.0 de 11 de março em um design concreto de adaptador e snapshot fundamentado no código de orquestração que já existe neste repositório.

## Substrato Implementado Atual

O repositório já possui um substrato de orquestração real de primeira passagem:

- `scripts/lib/tmux-worktree-orchestrator.js`
  provisiona painéis tmux mais worktrees git isoladas
- `scripts/orchestrate-worktrees.js`
  é o iniciador de sessão atual
- `scripts/lib/orchestration-session.js`
  coleta snapshots de sessão legíveis por máquina
- `scripts/orchestration-status.js`
  exporta esses snapshots de um nome de sessão ou arquivo de plano
- `commands/sessions.md`
  já expõe conceitos adjacentes de histórico de sessão do armazenamento local do Claude
- `scripts/lib/session-adapters/canonical-session.js`
  define a camada de normalização canônica `ecc.session.v1`
- `scripts/lib/session-adapters/dmux-tmux.js`
  envolve o coletor atual de snapshot de orquestração como adaptador `dmux-tmux`
- `scripts/lib/session-adapters/claude-history.js`
  normaliza o histórico de sessão local do Claude como um segundo adaptador
- `scripts/lib/session-adapters/registry.js`
  seleciona adaptadores a partir de targets e tipos de target explícitos
- `scripts/session-inspect.js`
  emite snapshots de sessão canônicos somente leitura pelo registro de adaptadores

Na prática, o ECC já pode responder:

- quais workers existem em uma sessão orquestrada por tmux
- a qual painel cada worker está anexado
- quais arquivos de tarefa, status e handoff existem para cada worker
- se a sessão está ativa e quantos painéis/workers existem
- como foi a sessão local do Claude mais recente no mesmo formato de snapshot canônico que as sessões de orquestração

Isso é suficiente para provar o substrato. Ainda não é suficiente para se qualificar como um plano de controle geral do ECC 2.0.

## O que o Snapshot Atual Realmente Modela

O modelo de snapshot atual proveniente de `scripts/lib/orchestration-session.js` tem estes campos efetivos:

```json
{
  "sessionName": "workflow-visual-proof",
  "coordinationDir": ".../.claude/orchestration/workflow-visual-proof",
  "repoRoot": "...",
  "targetType": "plan",
  "sessionActive": true,
  "paneCount": 2,
  "workerCount": 2,
  "workerStates": {
    "running": 1,
    "completed": 1
  },
  "panes": [
    {
      "paneId": "%95",
      "windowIndex": 1,
      "paneIndex": 0,
      "title": "seed-check",
      "currentCommand": "codex",
      "currentPath": "/tmp/worktree",
      "active": false,
      "dead": false,
      "pid": 1234
    }
  ],
  "workers": [
    {
      "workerSlug": "seed-check",
      "workerDir": ".../seed-check",
      "status": {
        "state": "running",
        "updated": "...",
        "branch": "...",
        "worktree": "...",
        "taskFile": "...",
        "handoffFile": "..."
      },
      "task": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "handoff": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "files": {
        "status": ".../status.md",
        "task": ".../task.md",
        "handoff": ".../handoff.md"
      },
      "pane": {
        "paneId": "%95",
        "title": "seed-check"
      }
    }
  ]
}
```

Este já é um payload de operador útil. A principal limitação é que está implicitamente vinculado a um estilo de execução:

- identidade de painel tmux
- slug do worker igual ao título do painel
- arquivos de coordenação em markdown
- regras de busca por arquivo de plano ou nome de sessão

## Lacuna Entre ECC 1.x e ECC 2.0

O ECC 1.x atualmente tem duas "sessões" diferentes:

1. Histórico de sessão local do Claude
2. Snapshots de runtime/sessão de orquestração

Essas superfícies são adjacentes mas não unificadas.

A camada ausente do ECC 2.0 é um limite de adaptador de sessão neutro em relação a harness que pode normalizar:

- workers orquestrados por tmux
- sessões simples do Claude
- sessões de worktree Codex
- sessões OpenCode
- futuras sessões GitHub/App ou de controle remoto

Sem essa camada de adaptador, qualquer UI de operador futuro seria forçado a ler detalhes específicos do tmux e markdown de coordenação diretamente.

## Limite do Adaptador

O ECC 2.0 deve introduzir um contrato de adaptador de sessão canônico.

Interface mínima sugerida:

```ts
type SessionAdapter = {
  id: string;
  canOpen(target: SessionTarget): boolean;
  open(target: SessionTarget): Promise<AdapterHandle>;
};

type AdapterHandle = {
  getSnapshot(): Promise<CanonicalSessionSnapshot>;
  streamEvents?(onEvent: (event: SessionEvent) => void): Promise<() => void>;
  runAction?(action: SessionAction): Promise<ActionResult>;
};
```

### Formato de Snapshot Canônico

Payload canônico sugerido de primeira passagem:

```json
{
  "schemaVersion": "ecc.session.v1",
  "adapterId": "dmux-tmux",
  "session": {
    "id": "workflow-visual-proof",
    "kind": "orchestrated",
    "state": "active",
    "repoRoot": "...",
    "sourceTarget": {
      "type": "plan",
      "value": ".claude/plan/workflow-visual-proof.json"
    }
  },
  "workers": [
    {
      "id": "seed-check",
      "label": "seed-check",
      "state": "running",
      "branch": "...",
      "worktree": "...",
      "runtime": {
        "kind": "tmux-pane",
        "command": "codex",
        "pid": 1234,
        "active": false,
        "dead": false
      },
      "intent": {
        "objective": "...",
        "seedPaths": ["scripts/orchestrate-worktrees.js"]
      },
      "outputs": {
        "summary": [],
        "validation": [],
        "remainingRisks": []
      },
      "artifacts": {
        "statusFile": "...",
        "taskFile": "...",
        "handoffFile": "..."
      }
    }
  ],
  "aggregates": {
    "workerCount": 2,
    "states": {
      "running": 1,
      "completed": 1
    }
  }
}
```

Isso preserva o sinal útil já presente enquanto remove detalhes específicos do tmux do contrato do plano de controle.

## Primeiros Adaptadores a Suportar

### 1. `dmux-tmux`

Envolver a lógica já existente em
`scripts/lib/orchestration-session.js`.

Este é o primeiro adaptador mais fácil porque o substrato já é real.

### 2. `claude-history`

Normalizar os dados que
`commands/sessions.md`
e os utilitários existentes de gerenciamento de sessão já expõem:

- id de sessão / alias
- branch
- worktree
- caminho do projeto
- recência / tamanho do arquivo / contagens de itens

Isso fornece uma linha de base não orquestrada para o ECC 2.0.

### 3. `codex-worktree`

Usar o mesmo formato canônico, mas suportá-lo com metadados de execução nativos do Codex em vez de suposições do tmux quando disponível.

### 4. `opencode`

Usar o mesmo limite de adaptador assim que os metadados de sessão do OpenCode estiverem estáveis o suficiente para normalizar.

## O que Deve Ficar Fora da Camada do Adaptador

A camada do adaptador não deve possuir:

- lógica de negócios para sequenciamento de mesclagem
- layout de UI do operador
- decisões de preços ou monetização
- seleção de perfil de instalação
- orquestração do ciclo de vida do tmux em si

Seu trabalho é mais estreito:

- detectar targets de sessão
- carregar snapshots normalizados
- opcionalmente transmitir eventos de runtime
- opcionalmente expor ações seguras

## Layout Atual de Arquivos

A camada do adaptador agora reside em:

```text
scripts/lib/session-adapters/
  canonical-session.js
  dmux-tmux.js
  claude-history.js
  registry.js
scripts/session-inspect.js
tests/lib/session-adapters.test.js
tests/scripts/session-inspect.test.js
```

O analisador de snapshot de orquestração atual está sendo consumido como uma implementação de adaptador em vez de permanecer o único contrato do produto.

## Próximas Etapas Imediatas

1. Adicionar um terceiro adaptador, provavelmente `codex-worktree`, para que a abstração vá além do tmux mais histórico do Claude.
2. Decidir se os snapshots canônicos precisam de campos separados `state` e `health` antes que o trabalho de UI comece.
3. Decidir se o streaming de eventos pertence ao v1 ou fica de fora até que a camada de snapshot se prove.
4. Construir painéis voltados ao operador somente em cima do registro de adaptadores, não lendo diretamente os internos de orquestração.

## Questões Abertas

1. A identidade do worker deve ser indexada pelo slug do worker, branch ou UUID estável?
2. Precisamos de campos separados `state` e `health` na camada canônica?
3. O streaming de eventos deve fazer parte do v1, ou o ECC 2.0 deve ser lançado somente com snapshot primeiro?
4. Quanto de informação de caminho deve ser redigido antes que os snapshots saiam da máquina local?
5. O registro de adaptadores deve residir neste repositório a longo prazo, ou se mover para o eventual aplicativo de plano de controle do ECC 2.0 assim que a interface se estabilizar?

## Recomendação

Tratar a implementação atual de tmux/worktree como adaptador `0`, não como a superfície final do produto.

O caminho mais curto para o ECC 2.0 é:

1. preservar o substrato de orquestração atual
2. envolvê-lo em um contrato de adaptador de sessão canônico
3. adicionar um adaptador não-tmux
4. somente então começar a construir painéis de operador sobre isso
