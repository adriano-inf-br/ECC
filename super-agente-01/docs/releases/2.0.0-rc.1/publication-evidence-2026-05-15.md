# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-15

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Base upstream main | `1949d75e18e59a37de269d88b188fc701f5cf122` |
| Branch de evidência | `codex/rc1-agentshield-86-evidence` |
| Escopo da evidência | `main` atual após PR #1932, #1933, #1934, #1935 e #1936; AgentShield #86; e ECC-Tools #75 |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Ressalva sobre status local | A árvore de trabalho tinha o diretório não rastreado sem relação `docs/drafts/` antes desta atualização de docs |

O operador real do lançamento deve repetir todas as verificações voltadas para publicação a partir do
commit de lançamento final com um checkout limpo antes de publicar.

## Estado da Fila e Discussão

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs/issues do trunk | `gh pr list` e `gh issue list` para `affaan-m/everything-claude-code` | 0 PRs abertos, 0 issues abertos |
| PRs/issues do AgentShield | `gh pr list` e `gh issue list` para `affaan-m/agentshield` | 0 PRs abertos, 0 issues abertos |
| PRs/issues do JARVIS | `gh pr list` e `gh issue list` para `affaan-m/JARVIS` | 0 PRs abertos, 0 issues abertos |
| PRs/issues das ECC Tools | `env -u GITHUB_TOKEN gh pr list` e `env -u GITHUB_TOKEN gh issue list` para `ECC-Tools/ECC-Tools` | 0 PRs abertos, 0 issues abertos |
| PRs/issues do site ECC | `env -u GITHUB_TOKEN gh pr list` e `env -u GITHUB_TOKEN gh issue list` para `ECC-Tools/ECC-website` | 0 PRs abertos, 0 issues abertos |
| Discussões do trunk | Contagem de discussões GraphQL e varredura de toque do mantenedor | 58 discussões no total; 0 sem toque do mantenedor após comentários do mantenedor em 15 de maio |
| Discussões de outros repos | Contagem de discussões GraphQL para AgentShield, JARVIS, ECC Tools e site ECC | Discussões desativadas ou total 0 |
| Auditoria de plataforma | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Pronto; PRs abertos 0/20, issues abertos 0/20, discussões precisando de toque do mantenedor 0, PRs abertos conflitantes 0, arquivos bloqueadores sujos 0 |

A organização ECC Tools é acessível com a credencial de host GitHub configurada. Neste shell, o
`GITHUB_TOKEN` exportado substitui essa credencial e causa falsos erros 404/403 para `ECC-Tools/*`.
Use `env -u GITHUB_TOKEN` para comandos de verificação das ECC Tools até que essa substituição de
ambiente seja limpa.

## Estado do Roadmap Linear

O roadmap de execução detalhado agora vive no projeto Linear:

<https://linear.app/itomarkets/project/ecc-platform-roadmap-52b328ee03e1>

O projeto contém 16 faixas em nível de issue e 5 marcos:

| Marco | Issues |
| --- | --- |
| Linha de Base de Segurança e Acesso | `ITO-44`, `ITO-57`, `ITO-58` |
| Preview e Publicação do ECC 2.0 | `ITO-45`, `ITO-46`, `ITO-47`, `ITO-56` |
| Iteração Enterprise do AgentShield | `ITO-48`, `ITO-49` |
| Plataforma de Próximo Nível das ECC Tools | `ITO-50`, `ITO-51`, `ITO-52`, `ITO-53`, `ITO-54`, `ITO-59` |
| Auditoria e Recuperação de Legado | `ITO-55` |

Documentos de projeto adicionados no Linear:

- Índice de Roadmap e Linha de Base de Execução Atual
- Atualização de Status 2026-05-15
- Snapshot da Fila do GitHub 2026-05-15
- Snapshot de Auditoria de Conclusão 2026-05-15
- Evidência da Fila de Discussão 2026-05-15
- Evidência de Acesso às ECC-Tools 2026-05-15

## Evidência da Cadeia de Suprimentos

| Superfície | Evidência |
| --- | --- |
| PR #1921 | Merge de expansão de IOC da cadeia de suprimentos para o acompanhamento Mini Shai-Hulud/TanStack |
| Acompanhamento Node IPC / PR #1924 | Adicionada cobertura de versão maliciosa, hash, DNS e IOC de runtime do `node-ipc` de 14 de maio |
| PR #1926 | Adicionadas superfícies de comando `platform:audit` e `security-ioc-scan` mais gates de IOC de workflow de lançamento |
| PR #1932 | Adicionados modos JSON/Markdown/saída de arquivo ao `scripts/platform-audit.js` para que evidências de fila, discussão, roadmap e lançamento possam ser capturadas como artefatos duráveis em vez de saída apenas no terminal |
| PR #1933 | Expandida a cobertura de IOC de varredura doméstica para `settings.local.json` do Claude, `.claude/hooks/hooks.json` e `tasks.json` do VS Code / Code Insiders em nível de usuário no macOS, Linux e Windows |
| PR #1934 | Trocados caches de dependência comuns de CI para uso de `actions/cache/restore` somente de restauração para que os jobs de teste não salvem estado de dependência mutável de volta nos caches compartilhados |
| PR #1935 | Estabilizados testes de mutação do diretório atual do `ecc2` com um guard de diretório atual serializado somente para testes, preservando o gate de superfície de lançamento Rust sob execução paralela de testes |
| PR #1940 | Adicionado `.github/workflows/supply-chain-watch.yml`, agendado a cada 6 horas, para que a varredura de IOC TanStack/Mini Shai-Hulud/node-ipc e as verificações de assinatura/auditoria npm produzam um artefato durável `supply-chain-ioc-report.json` |
| PR #1941 | Removido o uso de cache de dependências do GitHub Actions dos workflows de teste CI, desativados scripts de ciclo de vida do gerenciador de pacotes para instalações npm/pnpm/Yarn/Bun, purgados caches de Actions existentes e adicionados testes de validador que rejeitam padrões inseguros de instalação/cache |
| AgentShield PR #83 | Merge de cobertura de IOC Mini Shai-Hulud para TanStack, Mistral, OpenSearch, Guardrails, UiPath, Squawk, persistência Claude Code / VS Code e artefatos de dead-man switch |
| AgentShield PR #84 | Merge da tabela completa de pacotes afetados pela campanha Mini Shai-Hulud, incluindo escopos `@cap-js`, `@draftlab`, `@tallyui`, `intercom-client`, `lightning` adicionais e IOCs de pacotes/versões relacionados |
| AgentShield PR #85 | Adicionada verificação de cadeia de suprimentos do GitHub Action, gating e pacotes de evidência para que o caminho de lançamento do scanner enterprise do AgentShield tenha uma superfície de assinatura de registro verificada |
| AgentShield PR #86 | Adicionado `ci-context.json` aos pacotes de evidência do AgentShield com workflow, commit, execução e proveniência de runtime do GitHub Actions na lista de permissões, mantendo variáveis de ambiente arbitrárias e tokens fora do bundle |
| ECC-Tools PR #75 | Apertado o gate de anúncio de pagamentos nativos do GitHub para que alegações de faturamento público permaneçam bloqueadas até que o readback de conta de teste gerenciada pelo Marketplace ao vivo esteja pronto |
| Commits de merge do trunk | `f04702bdac132662c8496e817bcd850c86e2b854`, `ee85e1482e3d6322ddb2706392ea0fc97469bd26`, `13585f1092c92fa3f20ffe0d756e40c5720b0de5`, `553d507ea63bc252e815a924c0d2baea961351a1`, `c0bac4d6ced7f78a5464c6e3fd8cfbb43515a9d5`, `c2c54e7c0b84a213848b9ab3dfeb3ae16fb9844d`, `6b8a49a6eed11cc7df19d8b1f2add085b37cf466`, `1949d75e18e59a37de269d88b188fc701f5cf122`, `6951b8d5d29d13cac6b89b461104ad03838553de`, `f7035b5644ffc857879b71c39353b2141f17c3f0` |
| Commits de merge do AgentShield | `f899b27ba3fa60ec7e0dca41cc2dadcb1a1fb75d`, `d1aa5313afd915d0b7296e57aabaeb979b1ea93b`, `908d8f3a52a6a65b21e737339b56906603eb1345`, `69a5e25b675b77666d0c96abc22639a5ba883403` |
| Commits de merge das ECC-Tools | `6d00d67043e92cadc80f160bfe947115bfef33b1` |
| Testes IOC locais | `node tests/ci/scan-supply-chain-iocs.test.js` passou 15/15 |
| Segurança Unicode | `node scripts/ci/check-unicode-safety.js` passou |
| Varredura IOC | `node scripts/ci/scan-supply-chain-iocs.js --root <ECC-workspace> --home` passou com 229 arquivos inspecionados após a atualização de instalação sem ciclo de vida |
| Verificação de registro npm | `npm audit signatures` verificou 241 assinaturas de registro e 30 atestados; `npm audit --audit-level=high` encontrou 0 vulnerabilidades |
| Purga do cache de Actions | `gh cache delete --all --succeed-on-no-caches` concluído e `gh cache list --limit 20` não retornou caches |
| Gate de superfície de lançamento Rust | `cd ecc2 && cargo test` passou 462/462 com os 14 avisos de código morto/não utilizado existentes |
| Suíte raiz | `node tests/run-all.js` passou 2442/2442, 0 falhas |
| Varreduras de repo | Verificações de caminho de persistência direcionadas não encontraram artefatos ativos de `gh-token-monitor`, `pgsql-monitor`, `transformers.pyz` ou `pgmonitor.py` |

A expansão de IOC de 15 de maio adicionou cobertura para variantes de campanha no estilo
OpenSearch/Mistral/Guardrails/UiPath/Squawk, `opensearch_init.js`, `vite_setup.mjs`,
strings de protocolo dead-drop/sessão e superfícies de persistência de ferramentas de IA sem
comprometer indicadores de alta entropia que acionam scanners de segredos.
O acompanhamento node-ipc de 15 de maio bloqueia `node-ipc@9.1.6`, `9.2.3`, `10.1.1`,
`10.1.2`, `11.0.0`, `11.1.0` e `12.0.1`, além do hash de payload `node-ipc.cjs`,
hashes de tarball malicioso, domínios de exfiltração DNS e marcadores de runtime reportados
pelo Socket.
O AgentShield PR #83 adiciona a cobertura enterprise correspondente do lado do scanner:
detecções de pacotes com versão fixada, descoberta de superfície de automação `.claude` / `.vscode`,
detecção de artefatos LaunchAgent/systemd/local-bin do `gh-token-monitor`, IOCs de rede/payload,
bundles de action/CLI construídos, 1758/1758 testes locais e verificação verde do GitHub Actions
antes do merge.
O AgentShield PR #84 fecha a lacuna posterior da tabela de pacotes da campanha completa adicionando
os escopos de pacote npm afetados extras e pacotes sem escopo reportados na tabela Wiz atual,
reconstruindo `dist/action.js` e `dist/index.js` e passando 1758/1758 testes locais mais a
matriz completa do GitHub Actions do AgentShield antes do merge.
O AgentShield PR #85 e os PRs trunk #1934, #1940 e #1941 estendem a resposta da detecção de IOC
para o hardening do caminho de lançamento: o AgentShield agora registra evidências de assinatura
de registro para sua superfície de action, o trunk tem um workflow de vigilância IOC agendado
e o CI do trunk não usa mais caches de dependência ou scripts de ciclo de vida do gerenciador
de pacotes na matriz de instalação de teste durante o hardening ativo da cadeia de suprimentos.
O AgentShield PR #86 completa o próximo slice de proveniência do pacote de evidências:
`agentshield scan --evidence-pack <dir>` agora escreve `ci-context.json`, inclui esse artefato
no digest assinado do bundle, documenta-o no README do bundle e verifica que variáveis de ambiente
com tokens como `GITHUB_TOKEN` não são copiadas para artefatos de revisão de segurança de longa duração.
O PR passou build local, typecheck, lint, 1764/1764 testes e a matriz completa do GitHub Actions
através do Node 18, 20 e 22 antes do merge.
O PR #1933 fecha a lacuna prática de persistência na estação de trabalho para os caminhos de
automação do Claude Code e VS Code documentados, incluindo arquivos de configuração em nível de
usuário que sobrevivem à desinstalação do pacote.

## Estado do Preview Pack

`preview-pack-manifest.md` agora monta o limite do preview pack do rc.1:

- notas de lançamento, quickstart, checklist de lançamento, prontidão de publicação, matriz de
  nomenclatura e evidência de 15 de maio;
- `docs/HERMES-SETUP.md` e `skills/hermes-imports/SKILL.md` como a superfície pública especializada
  em Hermes;
- docs de cross-harness, adaptador de harness, observabilidade e sincronização de progresso;
- texto de X, LinkedIn, artigo, Telegram e material de demonstração que deve receber URLs ao vivo
  finais após lançamento/publicação de pacote/plugin;
- bloqueadores explícitos para lançamento no GitHub, publicação npm `next`, plugin Claude,
  plugin Codex, prontidão de faturamento/produto das ECC Tools e anúncios.

O preview pack está montado para o gating final de checkout limpo, mas ainda
não é uma ação de publicação.

## Evidência do Marketplace Codex

Os documentos atuais do plugin Codex da OpenAI agora distinguem a distribuição em marketplace
pessoal/de repo da distribuição no Diretório Oficial de Plugins. Os marketplaces de repo vivem em
`.agents/plugins/marketplace.json`; `codex plugin marketplace add <source>`
pode adicionar atalhos do GitHub, URLs Git, URLs SSH ou raízes de marketplace locais.
A publicação no Diretório Oficial de Plugins e o gerenciamento de autoatendimento estão documentados
como em breve:

- <https://developers.openai.com/codex/plugins/build#add-a-marketplace-from-the-cli>
- <https://developers.openai.com/codex/plugins/build#how-codex-uses-marketplaces>
- <https://developers.openai.com/codex/plugins/build#publish-official-public-plugins>

| Superfície | Evidência |
| --- | --- |
| Formato do CLI | `codex plugin marketplace add --help` suporta atalho do GitHub, URLs Git, URLs SSH, raízes de marketplace locais, `--ref` e `--sparse` somente Git |
| Marketplace de repo | `.agents/plugins/marketplace.json` expõe `ecc@2.0.0-rc.1` com `source.path: "./"` da raiz do marketplace |
| Smoke de adição local | `HOME="$(mktemp -d)" codex plugin marketplace add <local-checkout>` adicionou marketplace `ecc` e registrou a raiz do marketplace instalado como `<local-checkout>` sem tocar na configuração real do Codex |
| Alinhamento do README | `.codex-plugin/README.md` agora usa `codex plugin marketplace add`, não o comando obsoleto `codex plugin install` |
| Status do diretório público | O caminho de distribuição Codex suportado para rc.1 é marketplace de repo/instalação manual; a submissão ao Diretório Oficial de Plugins permanece bloqueada na disponibilidade de publicação de autoatendimento da OpenAI |

## Bloqueadores Atuais de Publicação

- O pré-lançamento `v2.0.0-rc.1` no GitHub ainda não foi criado nesta passagem.
- O npm `ecc-universal@2.0.0-rc.1` ainda não foi publicado com a dist-tag `next`.
- A tag do plugin Claude e a propagação no marketplace permanecem aguardando aprovação.
- A distribuição via marketplace de repo do plugin Codex está verificada para rc.1, mas a
  publicação oficial no Diretório de Plugins ainda está bloqueada na superfície de publicação
  de autoatendimento em breve da OpenAI.
- O PR #73 das ECC Tools adicionou um `announcementGate` fail-closed `/api/billing/readiness`
  para alegações de pagamentos nativos do GitHub, e o PR #74 das ECC Tools adicionou
  `npm run billing:announcement-gate` como o verificador do operador, mas o readback ao vivo da
  conta de teste gerenciada pelo Marketplace ainda deve retornar
  `announcementGate.ready === true` antes de qualquer anúncio público de pagamento.
- As notas de lançamento, X, LinkedIn e texto longo ainda precisam de URLs ao vivo finais após
  as URLs de lançamento/pacote/plugin existirem.

## Resultado

As evidências de fila, discussão, roadmap Linear e cadeia de suprimentos são mais recentes
do que a evidência de publicação de 13 de maio. Elas melhoram a prontidão, mas não substituem
a passagem final de publicação com checkout limpo exigida por
`publication-readiness.md`.
