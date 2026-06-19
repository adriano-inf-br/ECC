# Revisão de PR e Triagem da Fila — 13 de março de 2026

## Situação

Este documento registra um snapshot ao vivo de triagem do GitHub para a fila de
pull requests de `everything-claude-code` em `2026-03-13T08:33:31Z`.

Fontes utilizadas:

- `gh pr view`
- `gh pr checks`
- `gh pr diff --name-only`
- verificação local direcionada contra o head mesclado de `#399`

Limite de obsolescência usado nesta passagem:

- `última atualização antes de 2026-02-11` (`>30` dias antes de 13 de março de 2026)

## Revisão Retrospectiva do PR `#399`

PR:

- `#399` — `fix(observe): 5-layer automated session guard to prevent self-loop observations`
- estado: `MERGED`
- mesclado em: `2026-03-13T06:40:03Z`
- commit de merge: `c52a28ace9e7e84c00309fc7b629955dfc46ecf9`

Arquivos alterados:

- `skills/continuous-learning-v2/hooks/observe.sh`
- `skills/continuous-learning-v2/agents/observer-loop.sh`

Validação realizada contra o head mesclado `546628182200c16cc222b97673ddd79e942eacce`:

- `bash -n` nos dois scripts shell alterados
- `node tests/hooks/hooks.test.js` (`204` aprovados, `0` reprovados)
- invocações de hook direcionadas para:
  - sessão CLI interativa
  - `CLAUDE_CODE_ENTRYPOINT=mcp`
  - `ECC_HOOK_PROFILE=minimal`
  - `ECC_SKIP_OBSERVE=1`
  - payload `agent_id`
  - `ECC_OBSERVE_SKIP_PATHS` cortado

Resultado comportamental:

- a correção do self-loop principal funciona
- os branches do guarda de sessão automatizada suprimem gravações de observação conforme pretendido
- a lógica final de entrypoint `non-cli => exit` tem a forma correta de fail-closed

Achados remanescentes:

1. Médio: sessões automatizadas ignoradas ainda criam estado do projeto homunculus
   antes de os novos guardas saírem.
   `observe.sh` resolve `cwd` e obtém detecção de projeto antes de chegar ao bloco
   do guarda de sessão automatizada, portanto `detect-project.sh` ainda cria
   diretórios `projects/<id>/...` e atualiza `projects.json` para sessões que
   posteriormente saem antecipadamente.
2. Baixo: a nova matriz de guardas foi entregue sem cobertura de regressão direta.
   O conjunto de testes de hook ainda valida comportamento adjacente, mas não
   afirma diretamente os novos branches `CLAUDE_CODE_ENTRYPOINT`, `ECC_HOOK_PROFILE`,
   `ECC_SKIP_OBSERVE`, `agent_id` ou skip-path cortado.

Veredicto:

- `#399` é tecnicamente correto para seu objetivo principal e era seguro para merge como
  a correção urgente de parada de loop.
- Ainda justifica uma issue de acompanhamento ou patch para mover os guardas de sessão
  automatizada antes dos efeitos colaterais de registro de projeto e para adicionar
  testes explícitos de caminho de guarda.

## Inventário de PRs Abertos

Há atualmente `4` PRs abertos.

### Tabela da Fila

| PR | Título | Rascunho | Mergeável | Estado de Merge | Atualizado | Obsoleto | Veredicto Atual |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `#292` | `chore(config): governance and config foundation (PR #272 split 1/6)` | `false` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:55Z` | `Não` | `Melhor candidato atual para merge` |
| `#298` | `feat(agents,skills,rules): add Rust, Java, mobile, DevOps, and performance content` | `false` | `CONFLICTING` | `DIRTY` | `2026-03-11T04:29:07Z` | `Não` | `Necessita alterações antes de terminar revisão` |
| `#336` | `Customisation for Codex CLI - Features from Claude Code and OpenCode` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-13T07:26:12Z` | `Não` | `Necessita revisão manual e saída de rascunho` |
| `#420` | `feat: add laravel skills` | `true` | `MERGEABLE` | `UNSTABLE` | `2026-03-12T22:57:36Z` | `Não` | `Rascunho de baixo risco, revisar após saída de rascunho` |

Nenhum PR atualmente aberto está obsoleto pela regra de `>30 dias desde a última atualização`.

## Avaliação por PR

### `#292` — Governança / Base de Configuração

Estado ao vivo:

- aberto
- não é rascunho
- `MERGEABLE`
- estado de merge `UNSTABLE`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado

Escopo:

- `.env.example`
- `.github/ISSUE_TEMPLATE/copilot-task.md`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.gitignore`
- `.markdownlint.json`
- `.tool-versions`
- `VERSION`

Avaliação:

- Este é o candidato a merge mais limpo na fila atual.
- O branch já foi atualizado para o `main` atual.
- O feedback de bot atualmente visível é menor/nível de detalhe, em vez de obviamente
  bloqueador de merge.
- A principal cautela é que apenas verificações de bots externos estão visíveis agora; nenhuma
  execução de matriz do GitHub Actions aparece na saída de verificações do PR atual.

Recomendação atual:

- `Mergeável após uma passagem final do proprietário.`
- Se quiser um caminho conservador, faça uma revisão humana rápida dos nitpicks remanescentes
  em `.env.example`, modelo de PR e `.tool-versions` antes do merge.

### `#298` — Expansão de Conteúdo Multi-Domínio de Grande Porte

Estado ao vivo:

- aberto
- não é rascunho
- `CONFLICTING`
- estado de merge `DIRTY`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado
  - `cubic · AI code reviewer` aprovado

Escopo:

- `35` arquivos
- grande expansão de documentação e skill/regra em Java, Rust, mobile,
  DevOps, desempenho, dados e MLOps

Avaliação:

- Este PR não está pronto para merge.
- Ele conflita com o `main` atual, portanto nem sequer é mergeável no nível de branch ainda.
- O cubic identificou `34` problemas em `35` arquivos na revisão atual.
  Esses achados são substanciais e técnicos, não apenas limpeza de estilo, e
  cobrem exemplos quebrados ou enganosos em várias skills novas.
- Mesmo sem o conflito, o escopo é grande o suficiente para exigir uma passagem deliberada de
  correção de conteúdo em vez de uma decisão rápida de merge.

Recomendação atual:

- `Necessita alterações.`
- Faça rebase ou restack primeiro, depois resolva os problemas de qualidade de exemplo substanciais.
- Se o momentum for importante, divida por domínio em vez de carregar um PR muito grande.

### `#336` — Personalização do Codex CLI

Estado ao vivo:

- aberto
- rascunho
- `MERGEABLE`
- estado de merge `UNSTABLE`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado

Escopo:

- `scripts/codex-git-hooks/pre-commit`
- `scripts/codex-git-hooks/pre-push`
- `scripts/codex/check-codex-global-state.sh`
- `scripts/codex/install-global-git-hooks.sh`
- `scripts/sync-ecc-to-codex.sh`

Avaliação:

- Este PR não está mais em conflito, mas ainda é apenas rascunho e não teve uma passagem
  de revisão significativa de primeira parte.
- Ele modifica o comportamento de configuração global do Codex e instalação de git-hook, portanto o
  raio de impacto operacional é maior do que um PR apenas de documentação.
- As verificações visíveis são apenas bots externos; não há execução completa do GitHub Actions
  mostrada no conjunto de verificações atual.
- Como o branch vem de um fork de colaborador `main`, ele também merece uma passagem extra de
  sanidade sobre o que exatamente está sendo proposto antes de mudar o status.

Recomendação atual:

- `Necessita alterações antes de estar pronto para merge`, onde as alterações necessárias são
  orientadas a processo e revisão, em vez de um defeito de código já comprovado:
  - terminar revisão manual
  - executar ou confirmar validação nos scripts de estado global
  - retirar do rascunho somente após a revisão estar completa

### `#420` — Skills do Laravel

Estado ao vivo:

- aberto
- rascunho
- `MERGEABLE`
- estado de merge `UNSTABLE`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado

Escopo:

- `README.md`
- `examples/laravel-api-CLAUDE.md`
- `rules/php/patterns.md`
- `rules/php/security.md`
- `rules/php/testing.md`
- `skills/configure-ecc/SKILL.md`
- `skills/laravel-patterns/SKILL.md`
- `skills/laravel-security/SKILL.md`
- `skills/laravel-tdd/SKILL.md`
- `skills/laravel-verification/SKILL.md`

Avaliação:

- Este é rico em conteúdo e operacionalmente de menor risco do que `#336`.
- Ainda é rascunho e não teve uma passagem de revisão humana substancial ainda.
- As verificações visíveis são apenas bots externos.
- Nada no estado ao vivo do PR sugere um bloqueador de merge ainda, mas não está pronto
  para ser mesclado simplesmente porque ainda é rascunho e sub-revisado.

Recomendação atual:

- `Revisar a seguir após o trabalho não-rascunho de maior prioridade.`
- Provavelmente um bom candidato para revisão assim que o autor estiver pronto para sair do rascunho.

## Grupos de Mergeabilidade

### Mergeável Agora Ou Após Uma Passagem Final do Proprietário

- `#292`

### Necessita Alterações Antes do Merge

- `#298`
- `#336`

### Rascunho / Necessita Revisão Antes de Qualquer Decisão de Merge

- `#420`

### Obsoletos `>30 Dias`

- nenhum

## Ordem Recomendada

1. `#292`
   Este é o candidato de merge ao vivo mais limpo.
2. `#420`
   Baixo risco de tempo de execução, mas aguarde a saída do rascunho e uma passagem de revisão real.
3. `#336`
   Revise cuidadosamente porque altera o comportamento global de sincronização do Codex e instalação de hook.
4. `#298`
   Faça rebase e corrija os problemas substanciais de conteúdo antes de gastar mais tempo de revisão
   nele.

## Conclusão

- `#399`: merge de correção de bug seguro com uma limpeza de acompanhamento ainda pendente
- `#292`: candidato a merge de maior prioridade na fila aberta atual
- `#298`: não mergeável; conflitos mais defeitos substanciais de conteúdo
- `#336`: não está mais em conflito, mas não está pronto enquanto ainda é rascunho e levemente
  validado
- `#420`: rascunho, trilha de conteúdo de baixo risco, revisar após a fila de não-rascunho

## Atualização ao Vivo

Atualizado em `2026-03-13T22:11:40Z`.

### Branch Principal

- `origin/main` está verde agora, incluindo a matriz de testes do Windows.
- A reparação do CI da linha principal não é o gargalo atual.

### Leitura Atualizada da Fila

#### `#292` — Governança / Base de Configuração

- aberto
- não é rascunho
- `MERGEABLE`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado
- o trabalho restante de maior sinal não é reparação de CI; é a pequena passagem de correção
  em `.env.example` e alinhamento do modelo de PR antes do merge

Recomendação atual:

- `Próximo PR acionável.`
- Ou corrija os problemas remanescentes de correção de doc/config, ou faça uma passagem final
  do proprietário e faça o merge se você aceitar os tradeoffs atuais.

#### `#420` — Skills do Laravel

- aberto
- rascunho
- `MERGEABLE`
- verificações visíveis:
  - `CodeRabbit` ignorado porque o PR é rascunho
  - `GitGuardian Security Checks` aprovado
- nenhuma revisão humana substancial está visível ainda

Recomendação atual:

- `Revisar após a fila de não-rascunho.`
- Baixo risco de implementação, mas não está pronto para merge enquanto ainda é rascunho e
  sub-revisado.

#### `#336` — Personalização do Codex CLI

- aberto
- rascunho
- `MERGEABLE`
- verificações visíveis:
  - `CodeRabbit` aprovado
  - `GitGuardian Security Checks` aprovado
- ainda necessita de uma revisão manual deliberada porque toca na sincronização global do Codex
  e no comportamento de instalação de git-hook

Recomendação atual:

- `Trilha de revisão manual, não trilha de merge imediato.`

#### `#298` — Expansão de Conteúdo de Grande Porte

- aberto
- não é rascunho
- `CONFLICTING`
- ainda o PR remanescente mais difícil na fila

Recomendação atual:

- `Última prioridade entre os PRs abertos atuais.`
- Faça rebase primeiro, depois trate das correções substanciais de conteúdo/exemplo.

### Ordem Atual

1. `#292`
2. `#420`
3. `#336`
4. `#298`
