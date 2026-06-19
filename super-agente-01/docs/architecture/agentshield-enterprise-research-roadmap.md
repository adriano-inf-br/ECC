# Roteiro de Pesquisa Empresarial do AgentShield

Gerado em: 2026-05-12; atualizado com evidências de ticket de frota do AgentShield de 18 de maio e
IOC do Mini Shai-Hulud.

Este é um artefato de planejamento para a próxima iteração empresarial do AgentShield. Ele
não modifica o código do AgentShield. O objetivo é transformar o scanner, o gate de políticas,
o corpus e a superfície de relatórios atuais em um plano de controle de segurança para
equipes que executam agentes de codificação de IA em múltiplos harnesses.

## Evidências Revisadas

Estado atual do repositório AgentShield:

- Checkout do AgentShield na branch `main` limpa.
- Layout dos módulos `README.md`, `API.md`, `package.json`, `.github/workflows/*` e
  `src/`/`tests/`.
- Superfícies de usuário suportadas atualmente: `agentshield scan`, `agentshield init`,
  `agentshield miniclaw start`, JSON do scanner, MiniClaw API, GitHub Action,
  relatórios HTML, SARIF, markdown, terminal e JSON.
- Superfícies de nível empresarial atuais: pacotes de políticas, aplicação de políticas via
  GitHub Action, violações de políticas SARIF, proveniência de cadeia de suprimentos, benchmark
  de corpus, relatórios executivos em HTML e ciclo de vida de auditoria de exceções.

Referências externas verificadas em repos oficiais do GitHub ou fontes do README:

- [stablyai/orca](https://github.com/stablyai/orca): IDE multi-agente,
  isolamento de worktree, status de agente ao vivo, integração com GitHub, revisão de diff e
  notificações.
- [superset-sh/superset](https://github.com/superset-sh/superset): editor de agente de IA
  com orquestração de worktree, revisão de diff integrada, presets de workspace
  e compatibilidade universal com CLI-agent.
- [standardagents/dmux](https://github.com/standardagents/dmux): multiplexador tmux/worktree
  com hooks de ciclo de vida, lançamentos multi-agente, visibilidade de painéis e
  fluxos de trabalho de merge/PR.
- [jarrodwatts/claude-hud](https://github.com/jarrodwatts/claude-hud): statusline do Claude
  Code, saúde do contexto, atividade de ferramentas, rastreamento de agentes, progresso de tarefas,
  análise de transcrições e telemetria de uso.
- [stanford-iris-lab/meta-harness](https://github.com/stanford-iris-lab/meta-harness):
  otimização de harness por meio de tarefas repetíveis, interações de propositor registradas
  e mudanças de scaffold avaliadas.
- [greyhaven-ai/autocontext](https://github.com/greyhaven-ai/autocontext):
  loop de melhoria recursiva com rastreamentos, gerações pontuadas, playbooks,
  conhecimento persistido, avaliação de cenários e rastreamentos de produção opcionais.
- [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent):
  skills de auto-aperfeiçoamento, memória, busca de sessões, gateway multiplataforma,
  automação agendada, backends de terminal e geração de trajetórias.
- [anthropics/claude-code](https://github.com/anthropics/claude-code):
  superfícies de terminal, IDE, GitHub, plugin, permissão, MCP e retenção de dados.
- [anomalyco/opencode](https://github.com/anomalyco/opencode): agente de codificação
  open-source agnóstico de provedor com agentes de build/plano, beta para desktop,
  arquitetura cliente/servidor e suporte a LSP.
- [opencode-ai/opencode](https://github.com/opencode-ai/opencode): agente de terminal
  baseado em Go arquivado anteriormente, com sessões, provedores, LSP, rastreamento de
  alterações de arquivos, comandos personalizados e compactação automática.
- [zed-industries/zed](https://github.com/zed-industries/zed): editor multiplayer de alto
  desempenho com expectativas rigorosas de CI para licença/conformidade.
- [aidenybai/ghast](https://github.com/aidenybai/ghast): multiplexador de terminal nativo
  construído em torno do Ghostty, agrupamento de workspace, painéis divididos, arrastar/soltar,
  notificações e busca no terminal.

Inspeção local do código-fonte do Claude Code:

- Revisado apenas o formato de arquivos/módulos locais não secretos de um snapshot privado do
  código-fonte do Claude Code.
- Superfícies relevantes observadas: `tools/`, `utils/permissions/`, `utils/mcp/`,
  `utils/hooks/`, `utils/plugins/`, `types/permissions.ts`,
  `types/plugin.ts`, `remote/`, `tasks/`, `assistant/sessionHistory.ts`,
  e utilitários de sessão/histórico.
- Nenhum código foi copiado. A conclusão é que o AgentShield deve rastrear permissões,
  plugins, MCP, hooks, sessões remotas, atividade de tarefas/subagentes e histórico como
  domínios de auditoria de primeira classe, em vez de tratar uma árvore `.claude/` como a única
  fonte de verdade.

## Posição Atual do AgentShield

O AgentShield já é mais do que uma ferramenta de lint estático:

- A cobertura de regras abrange segredos, permissões, hooks, servidores MCP, configurações
  de agentes, injeção de Prompt, cadeia de suprimentos, análise de contaminação, execução em
  sandbox, avaliação de políticas, reparo/status em tempo de execução, validação de corpus,
  MiniClaw e análise Opus.
- Os relatórios são utilizáveis por humanos e máquinas: terminal, JSON, markdown, HTML,
  SARIF, logs de scan e saídas do GitHub Action.
- Hooks empresariais existem: pacotes de políticas, metadados de exceções, relatórios de
  exceções expiradas/a vencer, verificação de código SARIF e saída de resumo de job.
- O trabalho de precisão está ativo: `runtimeConfidence`, ponderação de template/exemplo,
  downgrades de exemplos em docs, confiança no cache de plugins instalados do Claude,
  resolução de manifesto de hooks, orientação de auditoria de falsos positivos e prontidão
  do corpus.
- O consumo de pacotes de evidências agora é suficientemente de primeira classe para ferramentas
  downstream: `agentshield evidence-pack inspect` verifica um bundle e emite resumos compactos
  em JSON/texto para pontuação do relatório, contagens de descobertas, confiança em tempo de
  execução, política, baseline, cadeia de suprimentos, contexto de CI, remediação e erros de
  artefatos malformados.
- O consumo de pacotes de evidências em nível de frota agora tem uma primitiva de roteamento
  local: `agentshield evidence-pack fleet <dirs...> [--json]` agrega múltiplos bundles
  inspecionados em rotas prontas, bloqueadores de segurança, revisão de políticas,
  regressão de baseline, revisão de cadeia de suprimentos e inválidas.
- O ECC-Tools agora consome essa primitiva de frota na revisão de segurança hospedada:
  `agentshield-evidence/fleet-summary.json` direciona pacotes inválidos, bloqueadores de
  segurança, revisões de políticas, regressões de baseline e revisões de cadeia de suprimentos
  para descobertas hospedadas.

Atualização de 16 de maio: PR #87 do AgentShield mesclado como
`26bb44650663816d07180e0d20c1895e431a326c`. Ele classifica o conteúdo do cache de plugins
instalados do Claude como `runtimeConfidence: plugin-cache`, mantém o impacto de pontuação
de cache de plugins não secretos em `0.5x`, evita rebaixar caminhos `plugins/cache` locais
do repositório que não sejam do Claude, e faz a classificação de cache de plugins ganhar
antes que implementações de hooks em cache apareçam como `hook-code` ativo.
PR #88 do AgentShield mesclado como
`65ed6e2a87545dc99d962b58413f49096a4d70ec`. Ele adiciona
`agentshield evidence-pack inspect <dir> [--json]`, valida o bundle antes da leitura,
resume cada artefato de evidência voltado ao consumidor e evita que artefatos JSON malformados
mas válidos travem a inspeção.
PR #89 do AgentShield mesclado como
`521ada9091bb6d818511ab8589ae675b920c106a`. Ele adiciona
`agentshield evidence-pack fleet <dirs...> [--json]`, verifica cada pacote pelo caminho de
inspeção, agrega totais de descobertas, políticas, baselines, cadeia de suprimentos e remediação,
e atribui cada pacote a uma rota de frota determinística.
O commit `840952a7a07f820f24081c43df656d7f7295f23b` do AgentShield adiciona
payloads de tickets de revisão de frota prontos para Linear/operador, com prioridade, rótulos,
títulos e corpos em Markdown. O mesmo commit expande a cobertura de IOC atual do Mini
Shai-Hulud/TanStack para o endpoint Vault no cluster e o rastro de lockfile temporário,
com typecheck local, lint, testes completos, `git diff --check` e evidências de CI/Self-Scan/Action-test
do GitHub.

A próxima iteração após o roteamento de frota não deve ser "adicionar mais regras de regex"
por padrão. O roteamento de acompanhamento do ECC-Tools agora consome resumos de frota e
expõe caminhos de evidências fonte em descobertas hospedadas, e o primeiro slice de política
cross-harness agora vincula caminhos alvo da rota de frota do AgentShield à revisão do
proprietário do harness. A saída de frota do AgentShield agora também emite `reviewItems`
com caminhos de evidências fonte e recomendações prontas para proprietários, além de payloads
de tickets prontos para uso em pacotes roteados. O movimento de maior alavancagem é a
aprovação/leitura durável de operadores e a automação de fluxo de trabalho para descobertas
de frota roteadas.

## Lacunas Empresariais

### 1. Baselines de Organização e Deriva

Compradores empresariais precisam saber se um repositório, equipe ou frota de agentes está
ficando mais seguro ou mais arriscado ao longo do tempo. O AgentShield tem módulos de logs
de scan e comparação de baseline, e o PR #63 agora expõe essa deriva por meio de entradas,
saídas, anotações e evidências de resumo de job do GitHub Action. O PR #64 adiciona a criação
de snapshot de baseline de primeira classe por meio de `agentshield baseline write`. A
superfície de produto restante deve tornar explícitos os resumos de deriva da CLI, os pacotes
de evidências e os deltas prontos para proprietários.

Capacidade alvo:

- `agentshield baseline write --path .claude --output agentshield-baseline.json`
- `agentshield scan --baseline agentshield-baseline.json`
- Seções do relatório para descobertas novas, corrigidas, inalteradas, suprimidas e
  com exceção de política.
- Saída do GitHub Action que publica "postura de segurança alterada" em vez de apenas uma
  nota pontual.

### 2. Adaptadores de Segurança Multi-Harness

O mercado está migrando para muitos harnesses de agentes paralelos, não para uma única
ferramenta. Orca, Superset, dmux, OpenCode, Claude Code, Codex, Gemini, Zed e
multiplexadores de terminal criam superfícies de segurança diferentes.

Capacidade alvo:

- Um pequeno registro de adaptadores para `claude-code`, `opencode`, `codex`, `gemini`,
  `zed`, `dmux`, `orca`, `superset` e `generic-terminal`.
- Cada adaptador declara caminhos de configuração, conceitos de permissão, superfícies de
  plugins, convenções MCP/ferramentas, superfícies de histórico/sessão e evidências de CI.
- A saída do relatório agrupa descobertas por harness e confiança, para que descobertas de
  template/documentação não pareçam exposição ativa em tempo de execução.

### 3. Consciência de Sessão e Worktree

Os orquestradores nativos de worktree mudam o modelo de risco. Uma equipe pode executar
muitos agentes em paralelo, cada um com sua própria branch, shell, configuração de MCP e
estado local.

Capacidade alvo:

- Metadados de scan opcionais para branch, caminho do worktree, nome do agente, ID de sessão,
  provedor e orquestrador.
- Uma tabela de histórico de scans que responde: qual worktree introduziu uma nova permissão,
  qual execução de agente adicionou um MCP arriscado, qual branch relaxou a política e se
  a branch mesclada final a corrigiu.
- Um resumo compacto de "HUD de segurança" utilizável por statuslines, checks do GitHub e
  dashboards locais.

### 4. Pacotes de Evidências para Compradores e Auditores

Os relatórios HTML são o artefato correto voltado ao comprador hoje; PDF nativo está adiado.
A necessidade mais profunda é um bundle de evidências portátil que pode ser anexado a
auditorias, revisões de segurança e questionários de clientes.

Capacidade alvo:

- `agentshield scan --evidence-pack out/agentshield-evidence`
- O bundle inclui relatório JSON, relatório HTML, SARIF, avaliação de políticas,
  auditoria de exceções, diff de baseline, resumo de dependências/proveniência e um
  README curto explicando como interpretar os artefatos.
- Modo de redação opcional para segredos, caminhos locais, nomes de usuário e nomes de projetos.

### 5. Corpus de Regressão e Conjuntos de Referência

Meta-Harness e Autocontext apontam para a mesma lição: melhorias precisam de cenários
pontuados, rastreamentos e playbooks. O AgentShield já tem um benchmark de corpus,
mas a confiança empresarial precisa de um conjunto de referência curado para falsos positivos,
falsos negativos e regressões de políticas.

Capacidade alvo:

- Fixtures de cenários versionados para regras críticas, supressões de falsos positivos,
  exceções de políticas, exemplos de template/documentação, manifestos de plugins e
  resolução de código de hook.
- Relatórios de precisão/cobertura por categoria, não apenas prontidão agregada.
- Um gate de "sem regressão de precisão" que deve passar antes dos releases.
- Notas de playbook sobre por que uma supressão existe e quando ela deve expirar.

### 6. Fluxo de Trabalho de Remediação

Ferramentas de segurança tornam-se de nível empresarial quando transformam descobertas em
trabalho responsável sem sobrecarregar os mantenedores.

Capacidade alvo:

- Branch de remediação gerada com um clique ou via CLI para transformações seguras.
- Comentários de política que agrupam descobertas por proprietário e risco, em vez de por
  ordem de arquivo.
- Suporte a GitHub App para anotações de check-run, limites de issues, sincronização com
  Linear e exportação de backlog adiada.
- Impressões digitais de descobertas que evitam issues duplicadas entre scans repetidos.

### 7. Inteligência de Ameaças e Reputação de Pacotes

A segurança de agentes depende de pacotes MCP, repositórios de plugins, bundles de actions
e ecossistemas de CLI em rápida mudança. As verificações estáticas precisam de uma camada
de reputação externa mantida.

Capacidade alvo:

- Um cache de threat-intel local para riscos conhecidos de MCP/pacotes, CVEs, nomes de
  pacotes maliciosos, scripts de instalação suspeitos, dependências git mutáveis e
  pacotes conhecidos como seguros.
- O modo determinístico offline permanece disponível.
- O enriquecimento online é opt-in e produz proveniência clara para cada afirmação externa.

### 8. Controles Comerciais e de Equipe

O AgentShield já está conceitualmente conectado ao GitHub App do ECC Tools.
Os pagamentos nativos do GitHub tornam o caminho do produto mais concreto: scans locais gratuitos,
gates de política organizacional pagos, bundles de evidências pagos e deriva/histórico pagos.

Capacidade alvo:

- Verificações do GitHub App com consciência de tier: scan estático gratuito, aplicação de
  política organizacional paga, pacotes de evidências pagos, deriva histórica paga e análise
  profunda paga.
- Mapeamento de assentos/equipes para proprietários de políticas e aprovadores de exceções.
- Verificações de prontidão de cobrança compartilhadas com o ECC-Tools para que o estado
  de pagamento nunca altere o comportamento de aplicação silenciosamente.

## Ordem de Build Recomendada

### Slice 1: MVP de Deriva de Baseline

Implementar a menor primitiva de plano de controle empresarial: comparar este scan com
o último baseline aceito.

Artefatos:

- Esquema JSON de baseline.
- Escritor e comparador de baseline.
- Seções de relatório de terminal e JSON para descobertas novas/corrigidas/inalteradas.
- Testes cobrindo impressões digitais estáveis, descobertas corrigidas, novas descobertas e
  carry-forward de exceção de política.

Por que primeiro:

- Reutiliza a saída de scan existente.
- Melhora o valor da CLI, do GitHub Action e do GitHub App de uma só vez.
- Não requer um serviço hospedado.

### Slice 2: Bundle de Pacote de Evidências

Agrupar os relatórios de máquina e humanos existentes em um artefato de auditoria portátil.

Artefatos:

- Flag `--evidence-pack <dir>` da CLI.
- README do bundle com redação.
- Arquivos HTML, JSON, SARIF, política, exceção e diff de baseline.
- Testes para layout de arquivos, redação e nomes de saída determinísticos.

Por que segundo:

- Converte o trabalho de relatório existente em prova pronta para compradores.
- Mantém o PDF nativo adiado enquanto ainda atende às necessidades de entrega de auditoria.

### Slice 3: Registro de Adaptadores de Harness

Tornar o suporte a harness explícito em vez de implícito.

Artefatos:

- Metadados de adaptadores para Claude Code, OpenCode, Codex, Gemini, dmux, terminal
  genérico e templates locais do projeto.
- Saída de descoberta que relata quais adaptadores foram correspondidos e por quê.
- Agrupamento de relatório por adaptador.
- Testes usando diretórios de fixtures para cada adaptador.

Por que terceiro:

- Alinha o AgentShield com o posicionamento agnóstico de harness do ECC.
- Cria uma superfície estável para futura integração com Zed, Orca, Superset e Hermes
  sem fingir que todos os harnesses compartilham o modelo de configuração do Claude.

### Slice 4: Gate de Precisão do Corpus

Promover o corpus de benchmark para gate de release.

Artefatos:

- Relatório de corpus por categoria.
- Limites obrigatórios por categoria.
- Snapshots de regressão para supressões conhecidas de falsos positivos.
- Entrada de checklist de release exigindo prontidão do corpus antes da publicação.

Por que quarto:

- Evita que a credibilidade empresarial se degrade à medida que as regras se expandem.
- Cria uma rota durável para loops de melhoria no estilo Meta-Harness/Autocontext
  posteriormente.

### Slice 5: Cabeamento do GitHub App e Sincronização com Linear

Conectar as descobertas do AgentShield ao roteamento de acompanhamento do ECC-Tools.

Artefatos:

- Impressões digitais de descobertas compatíveis com limites de issues do ECC-Tools.
- Exportação de backlog pronta para Linear para deriva de baseline e violações de políticas.
- Anotações de check-run agrupadas por proprietário/risco.
- Testes que garantem que scans repetidos não criem spam de issues duplicadas.

Por que quinto:

- Precisa do trabalho de baseline/impressão digital do Slice 1.
- É a ponte entre a CLI local e o fluxo de trabalho de equipe pago.

## Não-Objetivos para Esta Iteração

- Geração nativa de PDF, a menos que os fluxos de trabalho do comprador/conformidade exijam
  explicitamente PDF gerado em vez de HTML com impressão para PDF.
- Dashboards hospedados antes que os contratos locais de baseline/evidência/impressão digital
  estejam estáveis.
- Ajuste fino ou treinamento de modelo antes que os gates de corpus determinísticos e os
  rastreamentos de referência existam.
- Amplas reescritas automáticas de código para descobertas arriscadas sem transformações e
  testes explícitos e revisáveis.

## Gates de Aceitação

A iteração empresarial do AgentShield não está completa até que o seguinte seja verdadeiro:

- Os testes locais `npm run typecheck`, `npm run lint`, `npm test` e `npm run build`
  passam a partir da raiz do repositório AgentShield.
- Os testes de smoke de CLI compilados cobrem os novos flags ou modos de relatório.
- O autoteste do GitHub Action cobre a nova saída visível para CI.
- A documentação nomeia o caminho gratuito/local e o caminho pago/equipe separadamente.
- As mudanças de confiança em tempo de execução incluem evidências de scan ao vivo provando
  que as superfícies de plugin/pacote de menor confiança permanecem visíveis em vez de serem
  suprimidas.
- As evidências produzidas pelo recurso são determinísticas o suficiente para diff de CI.
- O ECC-Tools pode consumir as impressões digitais de descobertas ou a exportação de backlog
  sem exceder os limites de objetos do GitHub/Linear.
- O roteiro de GA e o status do projeto Linear vinculam-se aos PRs mesclados do AgentShield.
