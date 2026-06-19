# Contexto de Trabalho

Última atualização: 2026-04-08

## Propósito

Repositório público do plugin ECC para agents, skills, comandos, hooks, regras, superfícies de instalação e construção da plataforma ECC 2.0.

## Verdade Atual

- Branch padrão: `main`
- A superfície de release público está alinhada em `v1.10.0`
- A verdade do catálogo público é `47` agents, `79` comandos e `181` skills
- O slug público do plugin agora é `ecc`; os caminhos de instalação legados `everything-claude-code` continuam suportados por compatibilidade
- Discussão de release: `#1272`
- O ECC 2.0 existe na árvore do código e compila, mas ainda está em alpha em vez de GA
- Principal trabalho operacional ativo:
  - manter o branch padrão verde
  - continuar as correções orientadas por issues a partir de `main` agora que o backlog público de PRs está zerado
  - continuar a construção do control-plane e da superfície de operador do ECC 2.0

## Restrições Atuais

- Sem merge apenas por título ou resumo de Commit.
- Sem instalações arbitrárias de runtime externo nas superfícies ECC entregues.
- Skills, hooks ou agents sobrepostos devem ser consolidados quando a sobreposição for material e a separação de runtime não for necessária.

## Filas Ativas

- Backlog de PRs: reduzido, mas ativo; continuar fazendo direct-port apenas de mudanças ECC-native seguras e encerrar sobreposições, geradores obsoletos e lanes de runtime externo não auditados
- O backlog de branches upstream ainda precisa de mineração e limpeza seletivas:
  - `origin/feat/hermes-generated-ops-skills` ainda tem três commits únicos, mas apenas skills ECC-native reutilizáveis devem ser aproveitadas dele
  - múltiplos branches de automação `origin/ecc-tools/*` estão obsoletos e devem ser podados após confirmar que não carregam valor único
- Produto:
  - limpeza seletiva de instalação
  - primitivas do control plane
  - superfície de operador
  - skills auto-aprimoráveis
  - manter a paridade de exportação de `agent.yaml` com os diretórios `commands/` e `skills/` entregues, para que as superfícies de instalação modernas não percam silenciosamente o registro de comandos
- Qualidade de skills:
  - reescrever skills voltadas a conteúdo para usar modelagem de voz baseada em fontes
  - remover retórica genérica de LLM, padrões enlatados de CTA e estereótipos forçados de plataforma
  - continuar a auditoria um a um de conteúdo de skill sobreposto ou de baixo sinal
  - mover a orientação do repositório e o fluxo de contribuição para skills-first, deixando os comandos apenas como shims explícitos de compatibilidade
  - adicionar skills de operador que envolvam superfícies conectadas em vez de expor apenas APIs cruas ou primitivas desconectadas
  - entregar o sistema de voz canônico, a lane de otimização de rede e a lane reutilizável de explicador Manim
- Segurança:
  - manter a postura de dependências limpa
  - preservar o comportamento autocontido de hooks e MCP

## Classificação de PRs Abertos

- Fechados em 2026-04-01 sob higiene de backlog / política de merge:
  - `#1069` `feat: add everything-claude-code ECC bundle`
  - `#1068` `feat: add everything-claude-code-conventions ECC bundle`
  - `#1080` `feat: add everything-claude-code ECC bundle`
  - `#1079` `feat: add everything-claude-code-conventions ECC bundle`
  - `#1064` `chore(deps-dev): bump @eslint/js from 9.39.2 to 10.0.1`
  - `#1063` `chore(deps-dev): bump eslint from 9.39.2 to 10.1.0`
- Fechados em 2026-04-01 porque o conteúdo é proveniente de ecossistemas externos e só deve entrar via re-port ECC-native manual:
  - `#852` openclaw-user-profiler
  - `#851` openclaw-soul-forge
  - `#640` harper skills
- Candidatos a suporte nativo a serem auditados por diff completo em seguida:
  - `#1055` suporte a Dart / Flutter
  - `#1043` reviewer de C# e skills de .NET
- Candidatos a direct-port que entraram após auditoria:
  - `#1078` deduplicação de hook-id para reinstalações gerenciadas de hooks do Claude
  - `#844` skill ui-demo
  - `#1110` resolução de raiz de hook do Claude em tempo de instalação
  - `#1106` extração portável de chave do Codex Context7
  - `#1107` merge de baseline do Codex e sincronização de role de agent de exemplo
  - `#1119` limpeza obsoleta de CI/lint que ainda continha correções seguras de baixo risco
- Portar ou reconstruir dentro do ECC após auditoria completa:
  - `#894` integração com Jira
  - `#814` + `#808` reconstruir como uma única lane consolidada de notificações para Opencode e superfícies cross-harness

## Interfaces

- Verdade pública: issues e PRs do GitHub
- Verdade de execução interna: itens de trabalho vinculados no Linear sob o programa ECC
- Itens do Linear vinculados atualmente:
  - `ECC-206` baseline de CI do ecossistema
  - `ECC-207` auditoria do backlog de PRs e aplicação da política de merge
  - `ECC-208` higiene de contexto
  - `ECC-210` migração de fluxo skills-first e aposentadoria da compatibilidade de comandos

## Regra de Atualização

Mantenha este arquivo detalhado apenas para o sprint atual, bloqueios e próximas ações. Resuma o trabalho concluído em arquivo morto ou na documentação do repositório assim que ele deixar de moldar ativamente a execução.

## Notas de Execução Mais Recentes

- 2026-04-05: Continuei a limpeza de sobreposição de `#1213` estreitando `coding-standards` para a camada de convenções cross-project de baseline, em vez de deletá-la. A skill agora aponta explicitamente a orientação detalhada de React/UI para `frontend-patterns`, a estrutura de backend/API para `backend-patterns` / `api-design`, e mantém apenas as expectativas reutilizáveis de nomenclatura, legibilidade, imutabilidade e qualidade de código.
- 2026-04-05: Adicionei uma proteção contra regressão de empacotamento para o caminho de release do OpenCode após `#1287` mostrar que o artefato publicado `v1.10.0` ainda estava obsoleto. `tests/scripts/build-opencode.test.js` agora assegura que o tarball de `npm pack --dry-run` inclui `.opencode/dist/index.js` mais os entrypoints compilados de plugin/tool, de modo que releases futuros não possam omitir silenciosamente o payload compilado do OpenCode.
- 2026-04-05: Entreguei `skills/agent-introspection-debugging` para `#829` como um framework ECC-native de auto-depuração. Ele é intencionalmente guidance-first em vez de falsa automação de runtime: capturar o estado de falha, classificar o padrão, aplicar a menor ação de recuperação contida, depois emitir um relatório estruturado de introspecção e fazer o handoff para `verification-loop` / `continuous-learning-v2` quando apropriado.
- 2026-04-05: Corrigi a quebra do CI de npm em `main` após os direct ports mais recentes. `package-lock.json` havia ficado defasado em relação a `package.json` na devDependency `globals` (`^17.1.0` vs `^17.4.0`), o que causava falha de todos os jobs do GitHub Actions baseados em npm no `npm ci`. Atualizei apenas o lockfile, verifiquei `npm ci --ignore-scripts` e mantive o workspace de lock misto intocado no restante.
- 2026-04-05: Fiz direct-port da parte útil de descoberta de `#1221` sem duplicar um segundo sistema de conformidade de saúde. Adicionei `skills/hipaa-compliance/SKILL.md` como um entrypoint fino específico de HIPAA que aponta para a lane canônica `healthcare-phi-compliance` / `healthcare-reviewer`, e conectei ambas as skills de privacidade em saúde no módulo de instalação `security` para instalações seletivas.
- 2026-04-05: Fiz direct-port da lane auditada de segurança blockchain/web3 de `#1222` para `main` como quatro skills autocontidas: `defi-amm-security`, `evm-token-decimals`, `llm-trading-agent-security` e `nodejs-keccak256`. Elas agora fazem parte do módulo de instalação `security` em vez de existir como um PR de fork não mesclado.
- 2026-04-05: Finalizei a passagem de aproveitamento útil de `#1203` diretamente em `main`. `skills/security-bounty-hunter`, `skills/api-connector-builder` e `skills/dashboard-builder` agora estão na árvore do código como reescritas ECC-native, em vez dos rascunhos originais mais finos da comunidade. O PR original deve ser tratado como substituído, e não mesclado.
- 2026-04-02: `ECC-Tools/main` entregou `9566637` (`fix: prefer commit lookup over git ref resolution`). O incêndio de análise de PR agora está corrigido no repositório do app, preferindo a resolução explícita de Commit antes de `git.getRef`, com cobertura de regressão para refs de pull e refs de branch simples. A issue de rastreamento pública espelhada `#1184` neste repositório foi fechada como resolvida no upstream.
- 2026-04-02: Fiz direct-port do núcleo limpo de suporte nativo de `#1043` para `main`: `agents/csharp-reviewer.md`, `skills/dotnet-patterns/SKILL.md` e `skills/csharp-testing/SKILL.md`. Isso preenche a lacuna entre as menções existentes de regra/docs de C# e a orientação efetivamente entregue de revisão/teste de C#.
- 2026-04-02: Fiz direct-port do núcleo limpo de suporte nativo de `#1055` para `main`: `agents/dart-build-resolver.md`, `commands/flutter-build.md`, `commands/flutter-review.md`, `commands/flutter-test.md`, `rules/dart/*` e `skills/dart-flutter-patterns/SKILL.md`. Os caminhos da skill foram conectados ao módulo atual `framework-language` em vez de repetir o layout separado de módulo `flutter-dart` do PR mais antigo.
- 2026-04-02: Fechei `#1081` após auditoria de diff. O PR apenas adicionava docs de vendor-marketing para um backend externo de X/Twitter (`Xquik` / `x-twitter-scraper`) à skill canônica `x-api`, em vez de contribuir com uma capacidade ECC-native.
- 2026-04-02: Fiz direct-port da lane útil de Jira de `#894`, mas sanitizei-a para se adequar à política atual de cadeia de suprimentos. `commands/jira.md`, `skills/jira-integration/SKILL.md` e o template MCP `jira` fixado em `mcp-configs/mcp-servers.json` estão na árvore do código, enquanto a skill não diz mais aos usuários para instalar `uv` via `curl | bash`. `jira-integration` está classificada sob `operator-workflows` para instalações seletivas.
- 2026-04-02: Fechei `#1125` após auditoria completa de diff. A lane de bundle/skill-router codificava rigidamente muitas superfícies inexistentes ou não canônicas e criava uma segunda abstração de roteamento em vez de uma pequena camada de índice ECC-native.
- 2026-04-02: Fechei `#1124` após auditoria completa de diff. O roster de agents adicionado era bem escrito, mas duplicava a superfície de agent existente do ECC com um segundo catálogo concorrente (`dispatch`, `explore`, `verifier`, `executor`, etc.) em vez de fortalecer os agents canônicos já na árvore do código.
- 2026-04-02: Fechei todo o cluster Argus `#1098`, `#1099`, `#1100`, `#1101` e `#1102` após auditoria completa de diff. O modo de falha comum era o mesmo nos cinco PRs: o dispatch externo multi-CLI era tratado como uma dependência de runtime de primeira classe das superfícies ECC entregues. Quaisquer ideias úteis de protocolo devem ser re-portadas mais tarde para lanes ECC-native de orquestração, revisão ou reflexão, sem suposições de fan-out de CLI externo.
- 2026-04-02: A fila anteriormente aberta de suporte nativo / integração (`#1081`, `#1055`, `#1043`, `#894`) foi agora totalmente resolvida por política de direct-port ou fechamento. A fila pública de PRs ativos está atualmente em zero; o próximo foco permanece em correções de mainline orientadas por issues e saúde de CI, não na entrada de PRs de backlog.
- 2026-04-01: O CI de `main` foi restaurado localmente com `1723/1723` testes passando após correções de lockfile e de validação de hooks.
- 2026-04-01: Os PRs de bundle ECC autogerados `#1068` e `#1069` foram fechados em vez de mesclados; ideias úteis devem ser portadas manualmente após auditoria explícita de diff.
- 2026-04-01: Os PRs de bump de versão maior do ESLint `#1063` e `#1064` foram fechados; revisitar apenas dentro de uma lane planejada de migração para ESLint 10.
- 2026-04-01: Os PRs de notificação `#808` e `#814` foram identificados como sobrepostos e devem ser reconstruídos como um único recurso unificado, em vez de entrar como branches paralelos.
- 2026-04-01: Os PRs de skill de fonte externa `#640`, `#851` e `#852` foram fechados sob a nova política de ingestão; copiar ideias de fonte auditada mais tarde, em vez de mesclar diretamente PRs de import com marca/fonte.
- 2026-04-01: O advisory baixo restante do GitHub em `ecc2/Cargo.lock` foi tratado movendo `ratatui` para `0.30` com `crossterm_0_28`, o que atualizou o `lru` transitivo de `0.12.5` para `0.16.3`. `cargo build --manifest-path ecc2/Cargo.toml` ainda passa.
- 2026-04-01: O núcleo seguro de `#834` foi portado diretamente para `main` em vez de mesclar o PR por inteiro. Isso incluiu validação mais estrita do plano de instalação, filtragem de target antigravity que pula árvores de módulo não suportadas, sincronização rastreada de catálogo para docs em inglês e zh-CN, e um modo de escrita dedicado `catalog:sync`.
- 2026-04-01: A verdade do catálogo do repositório agora está sincronizada em `36` agents, `68` comandos e `142` skills nos docs rastreados em inglês e zh-CN.
- 2026-04-01: O uso de emoji legado e de símbolos não essenciais em docs, scripts e testes foi normalizado para manter a lane de unicode-safety verde sem enfraquecer a própria verificação.
- 2026-04-01: A peça autocontida restante de `#834`, `docs/zh-CN/skills/browser-qa/SKILL.md`, foi portada diretamente para o repositório. Após o Commit, `#834` deve ser fechado como substituído-por-direct-port.
- 2026-04-01: A limpeza de skills de conteúdo começou com `content-engine`, `crosspost`, `article-writing` e `investor-outreach`. A nova direção é captura de voz source-first, banimentos explícitos de tropes e nenhuma mudança forçada de persona de plataforma.
- 2026-04-01: `node scripts/ci/check-unicode-safety.js --write` sanitizou os arquivos Markdown restantes com emoji, incluindo vários docs de regra de `remotion-video-creation` e uma nota de plano local antiga.
- 2026-04-01: As superfícies principais do repositório em inglês foram deslocadas para uma postura skills-first. README, AGENTS, metadados de plugin e instruções de contribuidor agora tratam `skills/` como canônico e `commands/` como entrada legada de barra de compatibilidade durante a migração.
- 2026-04-01: A limpeza de acompanhamento de bundle fechou `#1080` e `#1079`, que eram PRs de bundle `.claude/` gerados, duplicando scaffolding command-first em vez de entregar mudanças canônicas de fonte ECC.
- 2026-04-01: Portei o núcleo útil de `#1078` diretamente para `main`, mas apertei a implementação para que instalações legadas de hook sem id deduplicassem de forma limpa já na primeira reinstalação em vez da segunda. Adicionei ids estáveis de hook a `hooks/hooks.json`, aliases de fallback semântico em `mergeHookEntries()`, e um teste de regressão cobrindo o upgrade a partir de settings pré-id.
- 2026-04-01: Colapsei as duplicatas óbvias de comando/skill em shims legados finos, de modo que `skills/` agora detém os corpos mantidos para NanoClaw, context-budget, DevFleet, busca de docs, E2E, evals, orquestração, otimização de prompt, destilação de regras, TDD e verificação.
- 2026-04-01: Portei o núcleo autocontido de `#844` diretamente para `main` como `skills/ui-demo/SKILL.md` e o registrei sob o módulo de instalação `media-generation` em vez de mesclar o PR por inteiro.
- 2026-04-01: Adicionei a primeira lane de operador de fluxo conectado como skills ECC-native em vez de deixar a superfície como plugins ou APIs cruas: `workspace-surface-audit`, `customer-billing-ops`, `project-flow-ops` e `google-workspace-ops`. Elas são rastreadas sob o novo módulo de instalação `operator-workflows`.
- 2026-04-01: Fiz direct-port da correção real da lane de PR não resolvida de hook-path para o instalador ativo. As instalações do Claude agora substituem `${CLAUDE_PLUGIN_ROOT}` pela raiz concreta de instalação tanto em `settings.json` quanto no `hooks/hooks.json` copiado, o que mantém os hooks PreToolUse/PostToolUse funcionando fora da injeção de env gerenciada por plugin.
- 2026-04-01: Substituí o parser `grep -P` exclusivo do GNU em `scripts/sync-ecc-to-codex.sh` por um parser Node portável para a extração de chave do Context7. Adicionei cobertura de regressão em nível de fonte para que sincronizações em BSD/macOS não voltem a derivar para parsing não portável.
- 2026-04-01: A suíte de regressão direcionada após os direct ports está verde: `tests/scripts/install-apply.test.js`, `tests/scripts/sync-ecc-to-codex.test.js` e `tests/scripts/codex-hooks.test.js`.
- 2026-04-01: Portei o núcleo útil de `#1107` diretamente para `main` como um merge de baseline do Codex apenas-adição. `scripts/sync-ecc-to-codex.sh` agora preenche os defaults não-MCP ausentes a partir de `.codex/config.toml`, sincroniza arquivos de role de agent de exemplo em `~/.codex/agents` e preserva a configuração do usuário em vez de substituí-la. Adicionei cobertura de regressão para configs esparsas e tabelas-pai implícitas.
- 2026-04-01: Portei a limpeza segura de baixo risco de `#1119` diretamente para `main` em vez de manter um PR de CI obsoleto aberto. Isso incluiu tratamento de eslint para `.mjs`, verificações de null mais estritas, cobertura de home-dir do Windows nos testes de bash-log e timeouts mais longos de shell-test do Trae.
- 2026-04-01: Adicionei `brand-voice` como o sistema canônico de estilo de escrita derivado de fonte e conectei a lane de conteúdo para tratá-lo como a fonte de verdade de voz compartilhada, em vez de duplicar heurísticas parciais de estilo entre skills.
- 2026-04-01: Adicionei `connections-optimizer` como o fluxo review-first de reorganização de grafo social para X e LinkedIn, com modos explícitos de poda, expectativas de fallback de navegador e orientação de redação no Apple Mail.
- 2026-04-01: Adicionei `manim-video` como a lane reutilizável de explicador técnico e a semeei com uma cena inicial de grafo de rede, para que animações de lançamento e de sistemas não dependam de scripts avulsos de rascunho.
- 2026-04-02: Reextraí `social-graph-ranker` como uma primitiva autônoma, porque o modelo ponderado de bridge-decay é reutilizável fora do fluxo completo de leads. `lead-intelligence` agora aponta para ele para ranking canônico de grafo em vez de carregar a explicação completa do algoritmo inline, enquanto `connections-optimizer` permanece a camada mais ampla de operador para poda, adições e packs de revisão outbound.
- 2026-04-02: Apliquei a mesma regra de consolidação à lane de escrita. `brand-voice` permanece o sistema de voz canônico, enquanto `content-engine`, `crosspost`, `article-writing` e `investor-outreach` agora mantêm apenas orientação específica de fluxo, em vez de duplicar um segundo modelo de voz Affaan/ECC ou repetir a lista completa de banimentos em múltiplos lugares.
- 2026-04-02: Fechei os PRs de bundle autogerados recentes `#1182` e `#1183` sob a política existente. Ideias úteis da saída de gerador devem ser portadas manualmente para superfícies canônicas do repositório em vez de mesclar PRs `.claude`/bundle por inteiro.
- 2026-04-02: Portei a correção segura de um único arquivo do observador de macOS de `#1164` diretamente para `main` como um fallback POSIX de `mkdir` para o lock de lazy-start de `continuous-learning-v2`, depois fechei o PR como substituído por direct port.
- 2026-04-02: Portei o núcleo seguro de `#1153` diretamente para `main`: limpeza de markdownlint para superfícies de orquestração/docs mais as correções de `USERPROFILE` e de normalização de caminho do Windows nos testes de `install-apply` / `repair`. Validação local após instalar as deps do repositório: `node tests/scripts/install-apply.test.js`, `node tests/scripts/repair.test.js` e o `yarn markdownlint` direcionado, todos passaram.
- 2026-04-02: Fiz direct-port da lane segura de regras web/frontend de `#1122` para `rules/web/`, mas adaptei `rules/web/hooks.md` para preferir tooling local do projeto e evitar exemplos de execução remota avulsa de pacotes.
- 2026-04-02: Adaptei o lembrete de qualidade de design de `#1127` à arquitetura atual de hooks do ECC com um `scripts/hooks/design-quality-check.js` local, conexão em `hooks/hooks.json` do Claude, conexão em `after-file-edit.js` do Cursor, e cobertura de hook dedicada em `tests/hooks/design-quality-check.test.js`.
- 2026-04-02: Corrigi `#1141` em `main` no `16e9b17`. O ciclo de vida do observador agora é consciente de sessão em vez de puramente desacoplado: `SessionStart` escreve um lease com escopo de projeto, `SessionEnd` remove esse lease e para o observador quando o lease final desaparece, `observe.sh` registra a atividade do projeto, e `observer-loop.sh` agora encerra em ociosidade quando nenhum lease permanece. A validação direcionada passou com `bash -n`, `node tests/hooks/observer-memory.test.js`, `node tests/integration/hooks.test.js`, `node scripts/ci/validate-hooks.js hooks/hooks.json` e `node scripts/ci/check-unicode-safety.js`.
- 2026-04-02: Corrigi a regressão de hook exclusiva do Windows por trás de `#1070` fazendo `scripts/lib/utils.js#getHomeDir()` honrar overrides explícitos de `HOME` / `USERPROFILE` antes de cair em `os.homedir()`. Isso restaura os caminhos de estado do observador isolados por teste para execuções de integração de hook no Windows. Adicionei cobertura de regressão em `tests/lib/utils.test.js`. A validação direcionada passou com `node tests/lib/utils.test.js`, `node tests/integration/hooks.test.js`, `node tests/hooks/observer-memory.test.js` e `node scripts/ci/check-unicode-safety.js`.
- 2026-04-02: Fiz direct-port do suporte a NestJS de `#1022` para `main` como `skills/nestjs-patterns/SKILL.md` e o conectei ao módulo de instalação `framework-language`. Sincronizei o catálogo do repositório em seguida (`38` agents, `72` comandos, `156` skills) e atualizei os docs para que NestJS não esteja mais listado como uma lacuna de framework não preenchida.
- 2026-04-05: Entreguei `846ffb7` (`chore: ship v1.10.0 release surface refresh`). Isso atualizou metadados de README/plugin/versões de pacote, sincronizou o inventário explícito de agent do plugin, ajustou contagens obsoletas de star/fork/contribuidor, criou `docs/releases/1.10.0/*`, tagueou e lançou `v1.10.0`, e postou a discussão de anúncio em `#1272`.
- 2026-04-05: Aproveitei as skills reutilizáveis de operador do branch Hermes em `6eba30f` sem repetir o branch completo. Adicionei `skills/github-ops`, `skills/knowledge-ops` e `skills/hookify-rules`, conectei-os aos módulos de instalação, e re-sincronizei o repositório para `159` skills. `knowledge-ops` foi explicitamente adaptado ao modelo atual de workspace: código vivo em repositórios clonados, verdade ativa em GitHub/Linear, contexto mais amplo não relacionado a código nas camadas de KB/arquivo morto.
- 2026-04-05: Corrigi a lacuna restante de npm-publish do OpenCode em `db6d52e`. O pacote raiz agora compila `.opencode/dist` durante o `prepack`, inclui os assets compilados do plugin OpenCode no tarball publicado, e carrega um teste de regressão dedicado (`tests/scripts/build-opencode.test.js`) para que o pacote não entregue mais apenas o código-fonte TypeScript cru daquela superfície.
- 2026-04-05: Adicionei `skills/council`, fiz direct-port da lane segura `code-tour` de `#1193`, e re-sincronizei o repositório para `162` skills. `code-tour` permanece autocontido e só produz artefatos `.tours/*.tour` com âncoras reais de arquivo/linha; nenhum runtime externo ou instalação de extensão é assumido dentro da skill.
- 2026-04-05: Fechei a onda mais recente de PRs de bundle ECC autogerados (`#1275`-`#1281`) após implantar a correção `f615905` do `ECC-Tools/main`, que agora bloqueia que solicitações de issue-comment `/analyze` em nível de repositório abram PRs de bundle repetidos, ainda permitindo que a análise de retry em thread de PR rode contra SHAs de head imutáveis.
- 2026-04-05: Preenchi a lacuna de SEO fazendo direct-port de `agents/seo-specialist.md` e `skills/seo/SKILL.md` para `main`, depois conectando `skills/seo` a `business-content`. Isso resolve a referência obsoleta de `team-builder` a um especialista em SEO e leva o catálogo público a `39` agents e `163` skills sem mesclar o PR obsoleto por inteiro.
- 2026-04-05: Aproveitei os deltas úteis de regra comum de `#1214` diretamente em `rules/common/coding-style.md` e `rules/common/testing.md` (lembretes de KISS/DRY/YAGNI, convenções de nomenclatura, orientação de code-smell e orientação de teste estilo AAA), depois fechei o PR original de deleção mista. As remoções amplas de skill naquele PR intencionalmente não foram repetidas.
- 2026-04-05: Corrigi o bug de linha obsoleta em `.github/workflows/monthly-metrics.yml` com `bf5961e`. O fluxo de trabalho agora atualiza a linha do mês atual na issue `#1087` em vez de retornar cedo quando o mês já existe, e a execução disparada atualizou o snapshot de abril para as contagens atuais de star/fork/release.
- 2026-04-05: Recuperei o fluxo útil de controle de custos do branch Hermes divergente como uma pequena skill de operador ECC-native em vez de repetir o branch. `skills/ecc-tools-cost-audit/SKILL.md` agora está conectado a `operator-workflows` e focado em rastreamento webhook -> fila -> worker, contenção de burn, bypass de quota, vazamento de modelo premium e fanout de retry no repositório irmão `ECC-Tools`.
- 2026-04-05: Adicionei `skills/council/SKILL.md` em `753da37` como um fluxo de decisão ECC-native de quatro vozes. O protocolo útil do PR `#1254` foi mantido, mas o caminho de escrita shadow `~/.claude/notes` foi explicitamente removido em favor de `knowledge-ops`, `/save-session`, ou atualizações diretas de GitHub/Linear quando um delta de decisão importa.
- 2026-04-05: Fiz direct-port do bump seguro de `globals` do PR `#1243` para `main` como parte da lane do council e fechei o PR como substituído.
- 2026-04-05: Fechei o PR `#1232` após auditoria completa. O fluxo proposto `skill-scout` se sobrepõe aos atuais `search-first`, `/skill-create` e `skill-stocktake`; se uma camada dedicada de descoberta em marketplace retornar mais tarde, deve ser reconstruída sobre o modelo atual de instalação/catálogo, em vez de entrar como um caminho paralelo de descoberta.
- 2026-04-05: Portei as correções seguras do alternador de README localizado do PR `#1209` diretamente para `main` em vez de mesclar o PR de docs por inteiro. A navegação agora inclui consistentemente `Português (Brasil)` e `Türkçe` nos alternadores de README localizados, enquanto o corpo localizado mais recente permanece intacto.
- 2026-04-05: Removi a superfície obsoleta entregue do InsAIts de `main`. O ECC não entrega mais a entrada MCP externa de Python, a conexão opt-in de hook, os scripts de wrapper/monitor, nem as menções atuais de docs para `insa-its`; o histórico de changelog permanece, mas a superfície de produto viva agora é totalmente ECC-native novamente.
- 2026-04-05: Aproveitei a lane reutilizável de fluxo de operador gerada pelo Hermes sem repetir o branch inteiro. Adicionei seis skills ECC-native de nível superior em vez da antiga árvore aninhada `skills/hermes-generated/*`: `automation-audit-ops`, `email-ops`, `finance-billing-ops`, `messages-ops`, `research-ops` e `terminal-ops`. `research-ops` agora envolve o stack de pesquisa existente, enquanto as outras cinco estendem `operator-workflows` sem introduzir qualquer suposição de runtime externo.
- 2026-04-05: Adicionei `skills/product-capability` mais `docs/examples/product-capability-template.md` como a lane canônica de PRD-para-SRS para a issue `#1185`. Este é o passo ECC-native de contrato de capacidade entre a intenção vaga de produto e a implementação, e vive em `business-content` em vez de gerar um subsistema paralelo de planejamento.
- 2026-04-05: Apertei `product-lens` para que ele não se sobreponha mais à nova lane de contrato de capacidade. `product-lens` agora explicitamente é dono de diagnóstico de produto / validação de brief, enquanto `product-capability` é dono de planos de capacidade prontos para implementação e restrições estilo SRS.
- 2026-04-05: Continuei a limpeza de `#1213` removendo referências obsoletas à skill deletada `project-guidelines-example` do inventário/docs exportados e marcando `continuous-learning` v1 como um caminho legado suportado com um handoff explícito para `continuous-learning-v2`.
- 2026-04-05: Removi os últimos docs órfãos localizados de `project-guidelines-example` de `docs/ko-KR` e `docs/zh-CN`. O template agora vive apenas em `docs/examples/project-guidelines-template.md`, que corresponde à superfície atual do repositório e evita entregar docs traduzidos para uma skill deletada.
- 2026-04-05: Adicionei `docs/HERMES-OPENCLAW-MIGRATION.md` como o guia público atual de migração para a issue `#1051`. Ele reenquadra Hermes/OpenClaw como sistemas-fonte dos quais destilar, não como o runtime final, e mapeia as camadas de scheduler, dispatch, memória, skill e serviço sobre as superfícies ECC-native e o backlog do ECC 2.0 que já existem.
- 2026-04-05: Entreguei `skills/agent-sort` e o shim legado `/agent-sort` da issue `#916` como um fluxo ECC-native de instalação seletiva. Ele classifica agents, skills, comandos, regras, hooks e extras em baldes DAILY vs LIBRARY usando evidência concreta do repositório, depois faz o handoff das mudanças de instalação para `configure-ecc` em vez de inventar um instalador paralelo. A verdade do catálogo agora é `39` agents, `73` comandos e `179` skills.
- 2026-04-05: Fiz direct-port da fatia segura apenas-README de `#1285` para `main` em vez de mesclar o branch: adicionei uma pequena seção `Community Projects` para que times downstream possam linkar trabalho público construído sobre o ECC sem mudar superfícies de instalação, segurança ou runtime. Rejeitei `#1286` na revisão porque ele adiciona uma GitHub Action externa de terceiros (`hashgraph-online/codex-plugin-scanner`) que não atende à política atual de cadeia de suprimentos.
- 2026-04-05: Re-auditei `origin/feat/hermes-generated-ops-skills` por diff completo. O branch ainda não é mesclável: ele deleta superfícies ECC-native atuais, regride metadados de empacotamento/instalação e remove conteúdo mais novo de `main`. Continuei a política de aproveitamento seletivo em vez de merge de branch.
- 2026-04-05: Aproveitei seletivamente `skills/frontend-design` do branch Hermes como uma skill ECC-native autocontida, a espelhei em `.agents`, a conectei a `framework-language`, e re-sincronizei o catálogo para `180` skills após validação. O branch em si permanece apenas-referência até que cada arquivo único restante seja portado intencionalmente ou rejeitado.
- 2026-04-05: Aproveitei seletivamente o bundle de comando `hookify` mais o agent de suporte `conversation-analyzer` do branch Hermes. `hookify-rules` já existia como a skill canônica; esta passagem restaura as superfícies de comando voltadas ao usuário (`/hookify`, `/hookify-help`, `/hookify-list`, `/hookify-configure`) sem puxar qualquer runtime externo ou regressões em todo o branch. A verdade do catálogo agora é `40` agents, `77` comandos e `180` skills.
- 2026-04-05: Aproveitei seletivamente o bundle autocontido de revisão/desenvolvimento do branch Hermes: `review-pr`, `feature-dev`, e os agents de suporte de analisador/arquitetura (`code-architect`, `code-explorer`, `code-simplifier`, `comment-analyzer`, `pr-test-analyzer`, `silent-failure-hunter`, `type-design-analyzer`). Isso adiciona superfícies de comando ECC-native em torno de revisão de PR e planejamento de recursos sem mesclar as regressões mais amplas do branch. A verdade do catálogo agora é `47` agents, `79` comandos e `180` skills.
- 2026-04-05: Portei `docs/HERMES-SETUP.md` do branch Hermes como um documento sanitizado de topologia de operador para a lane de migração. Este é suporte apenas-docs para `#1051`, não uma mudança de runtime e não um sinal de que o próprio branch Hermes seja mesclável.
- 2026-04-05: Finalizei a passagem de aproveitamento útil sobre `origin/feat/hermes-generated-ops-skills`. Os arquivos únicos restantes foram explicitamente rejeitados:
  - comandos auxiliares de git duplicados (`commit`, `commit-push-pr`, `clean-gone`) se sobrepõem aos fluxos atuais de checkpoint / publish
  - `scripts/hooks/security-reminder*` adiciona um novo caminho de hook baseado em Python não justificado pela política atual de runtime
  - `skills/oura-health` e `skills/pmx-guidelines` são específicos de usuário ou de projeto, não superfícies ECC canônicas
  - `docs/releases/2.0.0-preview/*` é material prematuro e deve ser reconstruído a partir da verdade atual de produto mais tarde
  - o aninhado `skills/hermes-generated/*` está substituído pelas skills ECC-native de operador de nível superior já portadas para `main`
- 2026-04-08: Corrigi a regressão de exportação de comandos reportada em `#1327` restaurando uma seção canônica `commands:` em `agent.yaml` e adicionando `tests/ci/agent-yaml-surface.test.js` para impor paridade exata entre a superfície de exportação YAML e o diretório `commands/` real. Verificado com a varredura completa de testes do repositório: `1764/1764` passando.
