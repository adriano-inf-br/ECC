---
name: dmux-workflows
description: Orquestração multi-agente usando dmux (gerenciador de painéis tmux para agents de IA). Padrões para fluxos de trabalho de agents em paralelo no Claude Code, Codex, OpenCode e outros harnesses. Use ao executar várias sessões de agent em paralelo ou ao coordenar fluxos de trabalho de desenvolvimento multi-agente.
metadata:
  origin: ECC
---

# Fluxos de trabalho do dmux

Orquestre sessões de agents de IA em paralelo usando o dmux, um gerenciador de painéis tmux para harnesses de agents.

## Quando Ativar

- Executando várias sessões de agent em paralelo
- Coordenando trabalho no Claude Code, Codex e outros harnesses
- Tarefas complexas que se beneficiam de paralelismo dividir-para-conquistar
- O usuário diz "executar em paralelo", "dividir este trabalho", "usar dmux" ou "multi-agente"

## O que é o dmux

O dmux é uma ferramenta de orquestração baseada em tmux que gerencia painéis de agents de IA:
- Pressione `n` para criar um novo painel com um prompt
- Pressione `m` para mesclar a saída do painel de volta à sessão principal
- Suporta: Claude Code, Codex, OpenCode, Cline, Gemini, Qwen

**Instalação:** Instale o dmux a partir de seu repositório após revisar o pacote. Veja [github.com/standardagents/dmux](https://github.com/standardagents/dmux)

## Início Rápido

```bash
# Inicia a sessão do dmux
dmux

# Cria painéis de agent (pressione 'n' no dmux, depois digite o prompt)
# Painel 1: "Implemente o middleware de auth em src/auth/"
# Painel 2: "Escreva testes para o serviço de usuário"
# Painel 3: "Atualize a documentação da API"

# Cada painel executa sua própria sessão de agent
# Pressione 'm' para mesclar os resultados de volta
```

## Padrões de Fluxo de Trabalho

### Padrão 1: Pesquisar + Implementar

Divida pesquisa e implementação em trilhas paralelas:

```
Painel 1 (Pesquisa): "Pesquise melhores práticas para rate limiting em Node.js.
  Verifique as bibliotecas atuais, compare abordagens e escreva os achados em
  /tmp/rate-limit-research.md"

Painel 2 (Implementação): "Implemente um middleware de rate limiting para nossa API Express.
  Comece com um token bucket básico, refinaremos após a pesquisa terminar."

# Depois que o Painel 1 terminar, mescle os achados no contexto do Painel 2
```

### Padrão 2: Funcionalidade Multi-Arquivo

Paralelize o trabalho em arquivos independentes:

```
Painel 1: "Crie o esquema de banco de dados e as migrations para a funcionalidade de billing"
Painel 2: "Construa os endpoints da API de billing em src/api/billing/"
Painel 3: "Crie os componentes de UI do dashboard de billing"

# Mescle tudo, depois faça a integração no painel principal
```

### Padrão 3: Loop de Teste + Correção

Execute testes em um painel, corrija em outro:

```
Painel 1 (Observador): "Execute a suíte de testes em modo watch. Quando os testes falharem,
  resuma as falhas."

Painel 2 (Corretor): "Corrija os testes que falharam com base na saída de erro do painel 1"
```

### Padrão 4: Cross-Harness

Use diferentes ferramentas de IA para diferentes tarefas:

```
Painel 1 (Claude Code): "Revise a segurança do módulo de auth"
Painel 2 (Codex): "Refatore as funções utilitárias para desempenho"
Painel 3 (Claude Code): "Escreva testes E2E para o fluxo de checkout"
```

### Padrão 5: Pipeline de Revisão de Código

Perspectivas de revisão em paralelo:

```
Painel 1: "Revise src/api/ em busca de vulnerabilidades de segurança"
Painel 2: "Revise src/api/ em busca de problemas de desempenho"
Painel 3: "Revise src/api/ em busca de lacunas de cobertura de testes"

# Mescle todas as revisões em um único relatório
```

## Melhores Práticas

1. **Apenas tarefas independentes.** Não paralelize tarefas que dependem da saída umas das outras.
2. **Limites claros.** Cada painel deve trabalhar em arquivos ou preocupações distintas.
3. **Mescle estrategicamente.** Revise a saída do painel antes de mesclar para evitar conflitos.
4. **Use git worktrees.** Para trabalho propenso a conflitos de arquivo, use worktrees separados por painel.
5. **Consciência de recursos.** Cada painel usa tokens de API — mantenha o total de painéis abaixo de 5-6.

## Integração com Git Worktree

Para tarefas que tocam em arquivos sobrepostos:

```bash
# Cria worktrees para isolamento
git worktree add -b feat/auth ../feature-auth HEAD
git worktree add -b feat/billing ../feature-billing HEAD

# Executa agents em worktrees separados
# Painel 1: cd ../feature-auth && claude
# Painel 2: cd ../feature-billing && claude

# Mescla os branches quando terminar
git merge feat/auth
git merge feat/billing
```

## Ferramentas Complementares

| Ferramenta | O que Faz | Quando Usar |
|------|-------------|-------------|
| **dmux** | Gerenciamento de painéis tmux para agents | Sessões de agent em paralelo |
| **Superset** | IDE de terminal para mais de 10 agents em paralelo | Orquestração em larga escala |
| **Ferramenta Task do Claude Code** | Criação de subagents em processo | Paralelismo programático dentro de uma sessão |
| **Codex multi-agente** | Papéis de agent embutidos | Trabalho paralelo específico do Codex |

## Helper do ECC

O ECC agora inclui um helper para orquestração externa de painéis tmux com git worktrees separados:

```bash
node scripts/orchestrate-worktrees.js plan.json --execute
```

Exemplo de `plan.json`:

```json
{
  "sessionName": "skill-audit",
  "baseRef": "HEAD",
  "launcherCommand": "codex exec --cwd {worktree_path} --task-file {task_file}",
  "workers": [
    { "name": "docs-a", "task": "Fix skills 1-4 and write handoff notes." },
    { "name": "docs-b", "task": "Fix skills 5-8 and write handoff notes." }
  ]
}
```

O helper:
- Cria um git worktree respaldado por branch por worker
- Opcionalmente sobrepõe os `seedPaths` selecionados do checkout principal em cada worktree de worker
- Escreve arquivos `task.md`, `handoff.md` e `status.md` por worker em `.orchestration/<session>/`
- Inicia uma sessão tmux com um painel por worker
- Lança o comando de cada worker em seu próprio painel
- Deixa o painel principal livre para o orquestrador

Use `seedPaths` quando os workers precisarem de acesso a arquivos locais sujos ou não rastreados que ainda não fazem parte do `HEAD`, como scripts de orquestração locais, planos em rascunho ou docs:

```json
{
  "sessionName": "workflow-e2e",
  "seedPaths": [
    "scripts/orchestrate-worktrees.js",
    "scripts/lib/tmux-worktree-orchestrator.js",
    ".claude/plan/workflow-e2e-test.json"
  ],
  "launcherCommand": "bash {repo_root}/scripts/orchestrate-codex-worker.sh {task_file} {handoff_file} {status_file}",
  "workers": [
    { "name": "seed-check", "task": "Verify seeded files are present before starting work." }
  ]
}
```

## Solução de Problemas

- **Painel não responde:** Mude diretamente para o painel ou inspecione-o com `tmux capture-pane -pt <session>:0.<pane-index>`.
- **Conflitos de merge:** Use git worktrees para isolar as alterações de arquivo por painel.
- **Alto uso de tokens:** Reduza o número de painéis em paralelo. Cada painel é uma sessão completa de agent.
- **tmux não encontrado:** Instale com `brew install tmux` (macOS) ou `apt install tmux` (Linux).
