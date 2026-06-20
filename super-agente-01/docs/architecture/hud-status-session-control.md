# Contrato de Status do HUD e Controle de Sessão

Este contrato define o payload de status portátil que o ECC usa para superfícies de operador
locais, handoffs e futuros HUDs. É intencionalmente neutro em relação ao harness: uma
statusline do Claude Code, painel do Codex, sessão dmux, execução do OpenCode ou fluxo de
trabalho somente terminal pode emitir dados parciais sem alterar os nomes dos campos.

O exemplo canônico vive em
[`examples/hud-status-contract.json`](../../examples/hud-status-contract.json).

## Formato do Payload

Cada payload de status usa `schema_version: "ecc.hud-status.v1"` e mantém estas
seções de nível superior estáveis:

| Campo | Propósito | Fonte Primária |
|---|---|---|
| `context` | Modelo, harness, repositório, branch, worktree, ID de sessão e pressão na janela de contexto | stdin da statusline, git, adaptadores de sessão |
| `toolCalls` | Contagens recentes de chamadas de ferramentas, chamadas pendentes, chamadas desatualizadas e último evento de ferramenta | `loop-status`, `tool-usage.jsonl`, bridge de hook |
| `activeAgents` | Workers/subagentes atuais, estado em tempo de execução, branch, worktree, objetivo e caminhos de handoff | Snapshots de orquestração/dmux |
| `todos` | Tarefa em andamento atual e contagens de tarefas | Tarefas do Claude, arquivos de tarefas locais, metadados de plano |
| `checks` | Status de validação local e remota com comando/URLs de verificação quando disponíveis | CI, comandos locais, gates de release |
| `cost` | Gasto da sessão, contagens de tokens, orçamento e tendência | rastreador de custo, bridge de métricas |
| `risk` | Estado de atenção, pressão de conflito, chamadas desatualizadas, worktree sujo e flags de revisão manual | gates de prontidão, git, estado da fila |
| `queueState` | Contagens de PR/issue/discussão do GitHub, fila de conflitos, fila de merge e fila de salvamento de desatualizados | sincronização GitHub, itens de trabalho |
| `sessionControls` | Ações do operador suportadas para o alvo atual | CLI ECC, dmux, git/GitHub |
| `sync` | Estado de publicação do Linear, GitHub e handoff | atualizações de status, itens de trabalho, escritor de handoff |

Os campos podem ser `null`, arrays vazios ou `"unknown"` quando um harness não pode expor
o sinal. Os produtores não devem inventar nomes incompatíveis. Os consumidores devem renderizar
seções ausentes como indisponíveis, não como verde.

## Controles de Sessão

O vocabulário mínimo de controle de sessão é:

| Controle | Significado |
|---|---|
| `create` | Iniciar uma nova execução isolada, worktree ou plano de orquestração |
| `resume` | Reanexar a uma sessão existente ou alvo histórico |
| `status` | Emitir o payload atual sem mutar o estado |
| `stop` | Solicitar uma parada graciosa ou marcar a sessão como concluída |
| `diff` | Mostrar o diff atual da árvore de trabalho ou do worker |
| `pr` | Abrir ou inspecionar o pull request vinculado |
| `mergeQueue` | Mostrar itens prontos para merge, bloqueados e aguardando verificação |
| `conflictQueue` | Mostrar PRs ou worktrees sujos/conflitantes que precisam de integração |

`sessionControls.supported` lista os controles disponíveis para o harness atual.
`sessionControls.blocked` explica os controles indisponíveis, por exemplo um token GitHub
ausente, sem sessão tmux ou um adaptador somente leitura.

## Contrato de Sincronização

A seção de sincronização separa os rastreadores duráveis:

- `Linear` registra o ID de atualização de status do projeto, a saúde e se a criação de
  issues está bloqueada pela capacidade do workspace.
- `GitHub` registra o repositório atual, as contagens da fila de PR/issue/discussão e o
  último PR mesclado ou aberto vinculado à sessão.
- `handoff` registra o caminho de handoff Markdown durável e se ele foi escrito após o
  último lote.

Isso torna o rastreamento de progresso em tempo real explícito sem exigir que cada execução
crie issues no Linear ou comentários no GitHub. Quando a capacidade de issues do Linear está
bloqueada, o payload de status ainda pode provar o progresso por meio de atualizações de
projeto e handoffs do repositório.

## Implementações Atuais

- `ecc status --json` expõe prontidão, sessões ativas, execuções de skill, saúde de
  instalação, governança e itens de trabalho vinculados do armazenamento de estado SQLite.
- `ecc loop-status --json --write-dir <dir>` escreve snapshots de transcrição ao vivo e
  sinais de atenção para loops de longa execução.
- `ecc session-inspect <target> --write <path>` emite snapshots de sessão canônicos a
  partir de adaptadores dmux e de histórico do Claude.
- `scripts/hooks/ecc-statusline.js` renderiza sinais compactos de modelo, tarefa, custo,
  ferramenta, arquivo, duração, diretório e pressão de contexto dentro do Claude Code.

O payload `ecc.hud-status.v1` é o contrato externo comum que essas superfícies podem
projetar antes que o ECC desenvolva um HUD dedicado em tela cheia.
