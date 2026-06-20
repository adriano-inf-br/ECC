# Resposta a Incidentes da Cadeia de Suprimentos

Este playbook é o runbook do operador ECC para incidentes de npm, GitHub Actions e
registros de pacotes de ecossistemas cruzados. É intencionalmente conservador:
assinaturas de registro, proveniência e publicação confiável são sinais úteis, mas
não provam que o fluxo de trabalho executou o caminho de código pretendido.

## Gatilho Externo Atual

A partir de 2026-05-15, a classe de incidente ativo é o comprometimento da cadeia de
suprimentos de npm do TanStack em maio de 2026 e a campanha mais ampla Mini Shai-Hulud.
O ECC mantém a mesma varredura de IOC para as ondas de npm/PyPI relacionadas porque esses
incidentes visam caminhos de instalação/publicação de pacotes, configurações de ferramentas
de desenvolvedor de AI e credenciais de desenvolvedor:

- O TanStack reportou 84 versões maliciosas em 42 pacotes `@tanstack/*`,
  publicados em 2026-05-11 entre 19:20 e 19:26 UTC.
- O advisory do GitHub `GHSA-g7cv-rxg3-hmpx` / `CVE-2026-45321` descreve
  malware em tempo de instalação que coleta credenciais de nuvem, tokens do GitHub, credenciais
  de npm, tokens do Vault, tokens do Kubernetes e chaves privadas SSH.
- Reportagens subsequentes da StepSecurity, Socket, Aikido e Wiz descrevem a
  mesma campanha se expandindo para pacotes associados a Mistral AI, UiPath,
  OpenSearch, Guardrails AI, Squawk e outros pacotes npm/PyPI.
- O relatório `node-ipc` da Socket de 2026-05-14 descreve um comprometimento de npm ativo
  separado afetando versões `9.1.6`, `9.2.3` e `12.0.1` do `node-ipc`,
  com versões históricas maliciosas de `node-ipc` também bloqueadas pelo ECC porque
  tinham comportamento destrutivo ou de escrita de arquivo não autorizado.
- O conjunto de IOC ao vivo inclui persistência através do Claude Code
  `.claude/settings.json`, VS Code `.vscode/tasks.json`, Zed
  `.zed/tasks.json` e serviços `gh-token-monitor` LaunchAgent/systemd a nível de SO.
  Algumas variantes adicionam `~/.config/gh-token-monitor/token` mais uma descrição de token
  dead-man-switch `IfYouRevokeThisTokenItWillWipeTheComputerOfTheOwner`, arquivos de
  fluxo de trabalho maliciosos como `.github/workflows/codeql_analysis.yml` e
  payloads de runtime Python como `transformers.pyz` / `pgmonitor.py`. Remova esses
  hooks de persistência antes de rotacionar um token do GitHub roubado.
- O scanner também observa marcadores de relato tardio: prefixo/sufixo SHA-256 de `router_init.js`
  `ab4fcada...8601266c`, prefixo/sufixo SHA-256 de `tanstack_runner.js`
  `2ec78d55...6be27fc96`,
  `opensearch_init.js`, `vite_setup.mjs`, sal de campanha `svksjrhjkcejg`,
  strings de protocolo Session, commits dead-drop `claude@users.noreply.github.com`,
  nomes de branch `dependabout/` e `OhNoWhatsGoingOnWithGitHub`.
- A varredura de `node-ipc` observa hash de payload `node-ipc.cjs`
  `96097e06...d9034144`, hashes de tarball para os artefatos maliciosos `9.1.6`, `9.2.3`
  e `12.0.1`, `sh.azurestaticprovider.net`, `bt.node.js`,
  `37.16.75.69`, labels de exfil DNS `xh` / `xd` / `xf` quando presentes em
  artefatos, `__ntw`, `__ntRun`, arquivos temporários `/nt-` e entradas de arquivo como
  `uname.txt`, `envs.txt` e `fixtures/_paths.txt`.
- A cadeia de ataque combinou `pull_request_target`, envenenamento de cache do GitHub Actions
  através de um limite de confiança fork/base e extração de token OIDC de um
  runner do GitHub Actions.
- Publicação confiável/proveniência do npm pode confirmar que um pacote veio de uma identidade
  de CI vinculada. Não pode por si só provar que o cache de CI, os scripts de lifecycle ou o
  caminho de publicação foram seguros.

Referências primárias:

- <https://tanstack.com/blog/npm-supply-chain-compromise-postmortem>
- <https://github.com/advisories/GHSA-g7cv-rxg3-hmpx>
- <https://tanstack.com/blog/incident-followup>
- <https://www.wiz.io/blog/mini-shai-hulud-strikes-again-tanstack-more-npm-packages-compromised>
- <https://socket.dev/blog/node-ipc-package-compromised>
- <https://docs.npmjs.com/trusted-publishers/>
- <https://www.cisa.gov/news-events/alerts/2025/09/23/widespread-supply-chain-compromise-impacting-npm-ecosystem>

## Verificação de Exposição do ECC

Execute isso antes de um release candidate, após um bump amplo de dependências e após
qualquer incidente de registro de pacotes.

```bash
npm run security:ioc-scan
node scripts/ci/scan-supply-chain-iocs.js --home
npm ci --ignore-scripts
npm audit signatures
npm audit --audit-level=high
node scripts/ci/supply-chain-advisory-sources.js --json
node scripts/ci/validate-workflow-security.js
node tests/scripts/npm-publish-surface.test.js
node tests/run-all.js
```

Se um hit de busca aparecer apenas em exemplos de documentação, anote-o na evidência de
lançamento, mas não rotacione credenciais para uma referência somente de documentação.

## Fluxo de Trabalho de Observação Durável

O ECC também executa `.github/workflows/supply-chain-watch.yml` a cada seis horas e na
execução manual. O fluxo de trabalho é somente leitura, desativa a persistência de credenciais
de checkout, instala com `npm ci --ignore-scripts`, verifica assinaturas do registro npm,
executa os fixtures do scanner de IOC, executa
`scripts/ci/supply-chain-advisory-sources.js --refresh --json`, emite
`supply-chain-ioc-report.json` e `supply-chain-advisory-sources.json` e
revalida as regras de hardening do GitHub Actions.

Trate uma observação agendada com falha como um bloqueador de lançamento até que um operador confirme
se a falha é um advisory recém-reportado, um fixture de scanner desatualizado, um
problema de assinatura de registro ou uma regressão de hardening de fluxo de trabalho. Se o scanner
precisar de novos indicadores, atualize `scripts/ci/scan-supply-chain-iocs.js`, adicione cobertura
de fixture em `tests/ci/scan-supply-chain-iocs.test.js`, atualize este runbook e
anexe o artefato JSON mais recente à evidência de lançamento.

O artefato de fonte de advisory é o payload de status ITO-57. Ele registra o
registro de fonte confiável, avisos de atualização de URL ao vivo e um resumo pronto para o Linear.
Atualize a cobertura de fonte através de `npm run security:advisory-sources -- --json`
antes de alterar a cobertura de IOC, e anexe o artefato à próxima atualização de status
do projeto Linear após cada lote de merge significativo.

## Resposta Imediata

Se o ECC ou uma máquina de mantenedor instalou uma versão de pacote reconhecidamente ruim:

1. Pare o host de publicar ou fazer deploy.
2. Preserve evidências antes da limpeza:
   - histórico de comandos do gerenciador de pacotes;
   - `package-lock.json`, `pnpm-lock.yaml` ou `yarn.lock`;
   - URLs de execução de CI e logs do runner;
   - versões de pacotes npm e hashes de integridade de tarball;
   - logs de rede de saída quando disponíveis.
3. Trate o host de instalação como comprometido se scripts de lifecycle podem ter rodado.
4. Remova hooks de persistência antes da revogação de token:
   - hooks `SessionStart` de `~/.claude/settings.json` e arquivos de payload
     `router_runtime.js` / `setup.mjs` adjacentes;
   - tarefas de abertura de pasta `.vscode/tasks.json` e arquivos de payload adjacentes;
   - `~/Library/LaunchAgents/com.user.gh-token-monitor.plist`;
   - `~/.config/systemd/user/gh-token-monitor.service`;
   - `~/.config/systemd/user/pgsql-monitor.service`;
   - `~/.config/gh-token-monitor/token`;
   - `~/.local/bin/gh-token-monitor.sh`;
   - `~/.local/bin/pgmonitor.py`;
   - `/tmp/transformers.pyz`, `/tmp/pgmonitor.py` e seus equivalentes
     `/private/tmp/` no macOS.
5. Rotacione cada credencial alcançável pelo processo:
   - tokens de automação e tokens de mantenedor do npm;
   - PATs do GitHub, tokens de granularidade fina, chaves de deploy e secrets do Actions;
   - credenciais de nuvem, tokens do Vault, tokens de conta de serviço do Kubernetes, chaves SSH
     e tokens `.npmrc` locais;
   - quaisquer credenciais de MCP, plugin ou harness disponíveis em variáveis de ambiente
     ou configuração de escopo de usuário.
6. Purge os caches de dependência do GitHub Actions para os repositórios afetados.
7. Reinstale a partir de um ambiente limpo com scripts de lifecycle desabilitados primeiro:
   `npm ci --ignore-scripts`, `pnpm install --ignore-scripts`,
   `yarn install --mode=skip-build` ou `bun install --ignore-scripts`.
8. Reative scripts de lifecycle somente após a árvore de dependências e as versões de
   pacote estarem fixadas em releases conhecidamente limpos.

## Regras do GitHub Actions

O ECC aplica estas regras através de `scripts/ci/validate-workflow-security.js`:

- fluxos de trabalho privilegiados não devem fazer checkout de refs de PR não confiáveis;
- todas as instalações de dependências de fluxo de trabalho devem desabilitar scripts de lifecycle;
- os fluxos de trabalho não devem restaurar ou salvar caches de dependência compartilhados do GitHub Actions
  durante o hardening ativo da cadeia de suprimentos;
- fluxos de trabalho com `id-token: write` não devem restaurar ou salvar caches de dependência compartilhados;
- fluxos de trabalho que rodam `npm audit` também devem rodar `npm audit signatures`;
- fluxos de trabalho `pull_request_target` não devem restaurar ou salvar caches de dependência compartilhados.

Trate qualquer violação como um bloqueador de lançamento.

## Regras de Publicação

Antes de criar uma tag ou publicar o ECC:

1. Verifique se não há dependência inesperada em pacotes no advisory ativo.
2. Use um checkout limpo ou worktree descartável para comandos de lançamento.
3. Não misture caches de PR/teste com jobs de publicação.
4. Mantenha `id-token: write` limitado a fluxos de trabalho de lançamento que não usam caches de
   dependência compartilhados.
5. Prefira publicação confiável/proveniência onde suportado, ao mesmo tempo exigindo
   testes locais de superfície de pacote e verificação de assinatura de registro.
6. Confirme o estado de dist-tag do npm, GitHub release, plugin Claude, plugin Codex e
   pacote OpenCode no documento de evidência de prontidão para publicação.

## Quando Escalar

Escale para uma revisão de segurança do mantenedor antes de qualquer lançamento ou merge se:

- um lockfile de dependência referencia um pacote nomeado em um advisory ativo;
- `node scripts/ci/scan-supply-chain-iocs.js --home` encontra Claude Code,
  VS Code, Zed ou indicadores de persistência a nível de SO;
- um fluxo de trabalho combina `pull_request_target` com instalação de dependências,
  restauração/salvamento de cache, checkout do head de PR ou permissões de escrita;
- um fluxo de trabalho de lançamento combina `id-token: write` com uso de cache compartilhado;
- um fluxo de trabalho de publicação usa um token de npm de longa duração sem razão documentada;
- AgentShield, GitGuardian, Dependabot, npm audit ou verificações de assinatura de registro
  discordam.
