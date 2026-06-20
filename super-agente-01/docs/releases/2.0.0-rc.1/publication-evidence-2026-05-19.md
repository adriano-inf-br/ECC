# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-19

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace, anúncio de faturamento ou
anúncio social.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Upstream main | `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2` |
| Remote Git | `https://github.com/affaan-m/ECC.git` |
| Escopo da evidência | `main` atual após PR #1990 pontuação de integração GitHub do harness-audit, PR #1991 gate de identidade ECC canônica, PR #1992 gate de suíte de vídeo do lançamento, PR #1993 pacote de outreach de crescimento, PR #1994 atualização de evidência de publicação de 19 de maio, PR #1995 atualização do painel do operador, PR #1996 gate de autoavaliação do render primário, PR #1997 gate de candidato de publicação, PR #1998 gate de QA visual, PR #1999 atualização de evidência do painel de vídeo, PR #2000 atualização de evidência de contagem de suíte, PR #2001 adição de pacote de aprovação do proprietário, PR #2002 atualização do gate de painel de aprovação do proprietário, PR #2004 sincronização de evidência de prontidão Linear, PR #2005 atualização de evidência pós-PR #2004, PR #2008 correção do gate de evidência da cadeia de suprimentos do lançamento, PR #2006 adaptador Claude Code por projeto, PR #2009 correção de higiene do registro de projeto de aprendizado contínuo, PR #2011 correção de introspecção git com aspas do GateGuard, PR #2013 gate de aprovação de lançamento determinístico, PR #2017 sincronização de evidência do adaptador do AgentShield, PR #2018 sincronização de evidência Dependabot do AgentShield, ECC-Tools #80-#91 de observabilidade hospedada/readback, alvo selecionado Marketplace Pro, gate de anúncio de alvo selecionado e lote de caminho operador de arquivo de ambiente, AgentShield #94 cobertura de adaptador Zed/VS Code, AgentShield #95 fechamento de alerta Dependabot, PR #2019 sincronização do gate de lançamento Marketplace Pro e PR #2020 sincronização do gate de anúncio de alvo selecionado |
| Ressalva sobre status local | `git status --short --branch` estava limpo após puxar `origin/main`; os arquivos de evidência gerados são commitados após o snapshot de origem que descrevem |

O operador de lançamento deve repetir todas as verificações voltadas para publicação a partir do
commit final exato de lançamento com um checkout estritamente limpo antes de publicar.

## Estado da Fila e Discussão

| Superfície | Comando | Resultado |
| --- | --- | --- |
| Auditoria de plataforma | `node scripts/platform-audit.js --json` | Pronto verdadeiro; repos rastreados reportam 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 lacunas de Q&A respondíveis, 0 PRs conflitantes e 0 arquivos bloqueadores sujos |
| PRs do trunk | `gh pr list --repo affaan-m/ECC --state open --json number,title,url,author --limit 100` | `[]` |
| Issues do trunk | `gh issue list --repo affaan-m/ECC --state open --json number,title,url,author --limit 100` | `[]` |
| Auditoria de discussão via auditoria de plataforma | `node scripts/platform-audit.js --json` | Discussões `affaan-m/ECC` ativadas; 60 amostradas após o Q&A de localização de configuração #2015 ter sido respondido e aceito; 0 precisando de toque do mantenedor; 0 respondíveis sem resposta aceita |
| Worktree | `git status --short --branch` | `## main...origin/main` |

Os repositórios rastreados na auditoria de plataforma foram:

- `affaan-m/ECC`
- `affaan-m/agentshield`
- `affaan-m/JARVIS`
- `ECC-Tools/ECC-Tools`
- `ECC-Tools/ECC-website`

## Lote de Merge

| Item | Resultado |
| --- | --- |
| PR #1990 | Mergeada pontuação de harness-audit de integração GitHub e salvamento de conflito da faixa de PR insegura anterior |
| PR #1991 | Mergeado gate de identidade de lançamento ECC canônico através de README, metadados de plugin/pacote, superfícies OpenCode, metadados do Marketplace, padrões de auditoria, quickstart, ledger de URL do lançamento, matriz de nomenclatura/publicação e testes de lançamento |
| PR #1992 | Mergeado gate de suíte de vídeo do lançamento, manifest de produção, validador, superfície de arquivo de pacote, fiação do smoke do preview pack, testes de superfície de lançamento e saída JSON compacta CI |
| PR #1993 | Mergeado o pacote de parceiro, patrocinador, consultoria, conferência, podcast, GitHub Discussion e CTA de vídeo para a faixa de saída de hipercrescimento |
| PR #1994 | Mergeada a atualização de evidência de publicação de 19 de maio, gate de evidência de auditoria de plataforma, gate de evidência de smoke do preview pack e referências de URL/prontidão/roadmap |
| PR #1995 | Mergeada a atualização do painel do operador de 19 de maio com a linha de base MRR `$1.728/mês`, alvo `$10.000/mês` e ações principais de lançamento/vídeo/outbound |
| PR #1996 | Mergeado o gate de autoavaliação do render de lançamento primário para duração, tamanho, resolução, stream de vídeo e verificações de stream de áudio |
| PR #1997 | Mergeado o gate de candidato de publicação para o MP4/legendas de lançamento primário mais cinco clipes curtos em formatos wide e vertical |
| PR #1998 | Mergeado o gate de QA visual de vídeo do lançamento para candidatos de publicação e detecção de segmento de quadro preto |
| PR #1999 | Mergeada a atualização do painel do operador que moveu a suíte de vídeo do lançamento para atual após as evidências de candidato de publicação terem sido registradas |
| PR #2000 | Mergeada a atualização de evidência de contagem de suíte para que a auditoria de plataforma rejeite totais de suíte local obsoletos |
| PR #2001 | Mergeada a folha de decisão humana final para aprovações de lançamento, pacote, plugin, vídeo, faturamento, social e outbound; a execução do GitHub Actions `26102500291` concluiu com sucesso |
| PR #2002 | Mergeada a atualização do painel de aprovação do proprietário para que o painel do operador falhe de forma fechada quando a folha de decisão final estiver ausente ou incompleta; CI passou antes do merge |
| PR #2004 | Mergeada a sincronização de evidência de prontidão Linear de 19 de maio após o PR #2002, incluindo atualizações do roadmap, painel, manifest do preview pack, evidência de publicação, gerador do painel do operador e testes de superfície de lançamento |
| PR #2005 | Mergeada a atualização de evidência pós-PR #2004, mantendo o ledger de prontidão, painel, roadmap e referências de superfície de lançamento de 19 de maio atuais no `main` |
| PR #2008 | Mergeada a correção do gate de evidência da cadeia de suprimentos do lançamento para que a prontidão da auditoria de plataforma continue correspondendo às evidências de publicação atuais |
| PR #2006 | Mergeado o alvo de instalação `claude-project` para suporte ao adaptador Claude Code por projeto, depois corrigido o enum do schema do manifest em cima do branch de feature antes do merge |
| PR #2009 | Mergeada a correção de higiene do registro de projeto de aprendizado contínuo: payloads de hook não-git permanecem globais, worktrees vinculados sem remote migram para o ID do projeto da worktree principal e `instinct-cli.py projects delete`, `merge` e `gc` fornecem comandos de manutenção para o operador |
| PR #2011 | Mergeada a correção do tokenizador de introspecção git somente leitura do GateGuard para que pathspecs `git show` com aspas e espaços sejam preservados enquanto separadores shell com aspas permanecem fora do bypass |
| PR #2013 | Mergeado o `release:approval-gate` determinístico para que as ações finais de publicação, pacote, plugin, vídeo, faturamento, social e outbound permaneçam bloqueadas até que as decisões do proprietário e os readbacks de URL ao vivo estejam completos |
| PR #2017 | Mergeado o mirror de evidência do AgentShield #94 como `906e06406e95742944ccb05065f95a7e4dd4a036`, sincronizando superfícies de roadmap, evidência de publicação, manifest do preview pack e resposta a incidente de cadeia de suprimentos após o CI completo do GitHub ter passado |
| PR #2018 | Mergeado o mirror de evidência Dependabot do AgentShield #95 como `68b4e45145968acd52e68d900f8422061ed7f4a2`, sincronizando o roadmap, evidência de publicação e manifest do preview pack após o CI completo do PR ter passado |
| PR #2019 | Mergeada a sincronização do gate de lançamento de alvo selecionado Marketplace Pro como `30f60710d4e0424fc70d9bbdc105009db141d9d8`, atualizando o roadmap, evidência de publicação, matriz de nomenclatura, manifest do preview e painel do operador após o CI completo do PR ter passado |
| PR #2020 | Mergeada a sincronização do gate de anúncio de alvo selecionado como `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2`, atualizando o roadmap, evidência de publicação, matriz de nomenclatura, manifest do preview, ledger de URL do lançamento, superfícies de auditoria de plataforma e painel do operador após o CI completo do PR ter passado |

## Sincronização de Fila Zero Pós - 2026-05-19 Passagem Tardia

| Superfície | Evidência |
| --- | --- |
| Gate de aprovação ECC | PR #2013 mergeado como `9819626459a662773be7d0b1c18d82c1316b8c36`; execução do GitHub Actions `26128749863` concluiu com sucesso; `npm run release:approval-gate -- --format json` permanece intencionalmente bloqueado com digest `ef8f49f727b7`, 4/6 passando e falhas apenas em decisões do proprietário mais readbacks de URL ao vivo |
| Auditoria de plataforma ECC | `node scripts/platform-audit.js --json` em `2026-05-19T22:45:15Z` retornou pronto verdadeiro, 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 lacunas de Q&A respondíveis e 0 bloqueadores sujos nos repos `affaan-m/ECC`, `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools` e `ECC-Tools/ECC-website` |
| Hardening de faturamento das ECC-Tools | PR #79 das ECC-Tools mergeado como `67ee247ae1b7b50ecc1261ed5d62d65cc8390da8`; a saída de preflight e anúncio de faturamento ao vivo agora edita valores de login de conta para uma impressão digital estável enquanto preserva bloqueadores/ações de prontidão; a validação local passou nos testes direcionados, suíte completa de testes 678/678, lint, typecheck, preflight manual e `git diff --check`; execução CI main pós-merge `26129253509` concluiu com sucesso |
| Drenagem da fila JARVIS | PR #15 do JARVIS mergeou a bump de segurança `idna` 3.11 para 3.15 do Dependabot como `4b3685d6ee23b4da1f1a7d22281c6b5d6c0a42c7`; as verificações do PR e CI/CodeQL pós-merge passaram |
| Reparo de deploy JARVIS | PR #16 do JARVIS mergeado como `4369c34babd21d539c420866da51c7a8365f1c9e`; o workflow de deploy não usa mais uma condição `secrets.*` inválida em nível de job, o deploy do Vercel pula de forma limpa quando segredos estão ausentes, o build/push da imagem backend tem sucesso e as execuções CI, CodeQL e Deploy main `26129539376`, `26129539427` e `26129539425` concluíram com sucesso |
| Sincronização do roadmap Linear | Documento Linear `ecc-may-19-late-queue-zero-and-release-gate-sync-1c26f65e6b3f`, comentário do projeto `d42bf0e2-7a8e-4934-9f3f-e281498ee805` e comentários de issue em ITO-44, ITO-50, ITO-54, ITO-56 e ITO-61 registram o estado de fila zero da passagem tardia, gate de lançamento, segurança de faturamento e sincronização de progresso. |

## Sincronização de Observabilidade Hospedada e Adaptador AgentShield - 2026-05-20

| Superfície | Evidência |
| --- | --- |
| Fila de discussão ECC | A discussão #2015 foi respondida e marcada como aceita com orientação conservadora de configuração: não instale em `C:\`; use um workspace normal; instale `ecc@ecc` uma vez através do marketplace de plugin Claude; copie apenas as pastas de regras necessárias ao usar regras manuais; não empilhe plugin mais instalação manual completa. |
| Auditoria de plataforma ECC | `node scripts/platform-audit.js --json` em `2026-05-20T00:25:38Z` retornou pronto verdadeiro com 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 lacunas de Q&A respondíveis, 0 PRs conflitantes e 0 bloqueadores sujos nos repos `affaan-m/ECC`, `affaan-m/agentshield`, `affaan-m/JARVIS`, `ECC-Tools/ECC-Tools` e `ECC-Tools/ECC-website`. |
| Reverificação da auditoria de plataforma ECC | `npm run platform:audit -- --json` em `2026-05-20T00:42:11Z` retornou pronto verdadeiro com 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 lacunas de Q&A respondíveis, 0 PRs conflitantes, 0 erros do GitHub e 0 bloqueadores sujos no mesmo conjunto de repos rastreados após o AgentShield #94 ter sido mergeado. |
| ECC-Tools #80/#81/#82 | PR #80 mergeou aplicação de motivo de falha de recebimento de runtime como `4efc8cc858022f84c844690f3298633b081c4398`; PR #81 preservou IDs de aprovação de frota do AgentShield como `1fbf635f492284f75ba7166c029c39eb8cc15794`; PR #82 renderizou esses IDs de aprovação em comentários/check-runs de revisão de segurança hospedada como `7a7b4d096a176ae80b3a2076c09d45601e36013a`. |
| ECC-Tools #83/#84 | PR #83 mergeou reutilização determinística de ID externo Linear para acompanhamentos diferidos como `b6b107f33961bef18a85fb619f3a976eb5d752dd`; PR #84 mergeou sincronização de remediação AgentShield hospedada para Linear como `73bac7058071c55cb30c6b8ac6db779b3660c02c`. A validação local cobriu testes focados de rota/cliente, typecheck, lint, suíte completa de testes das ECC-Tools e verificações de espaço em branco antes do merge; GitHub Verify, Security Audit e Workers Builds passaram. |
| ECC-Tools #85/#86/#87 | PR #85 mergeou eventos de observabilidade de job hospedado como `1637e0f2bfa0a889387f2c20675680ccc5528123`; PR #86 mergeou readback de observabilidade de status hospedado como `5a9e94d3ff860307c3e7fd9fd065f0de2bd633dd`; PR #87 mergeou readback de observabilidade de plano de profundidade hospedado como `508fbc02b63cf1fcb5af2f3624608fa66e53b5d4`. A validação local para o slice de readback do plano de profundidade final passou no teste de rota de plano de profundidade hospedada focado, suíte completa de rotas (89/89), typecheck, lint, suíte Vitest completa das ECC-Tools (683/683) e `git diff --check`; GitHub Verify, Security Audit e Workers Builds passaram antes do merge. |
| ECC-Tools #88 | PR #88 mergeou readback autenticado de API de observabilidade hospedada como `c836ac3fb24ed7e2ae38cd61e41c9651ac9c00f8`. `GET /api/analysis/observability` agora resume eventos hospedados por tipo de evento e job para readback de operador/painel, pula registros KV mal formados obsoletos e o manual de deployment inclui o comando de smoke de produção. A verificação local passou typecheck, lint, suíte Vitest completa das ECC-Tools (686/686) e `git diff --check`; GitHub Verify, Security Audit e Workers Builds passaram antes do merge. |
| AgentShield #94 | PR #94 mergeou cobertura do adaptador Zed/VS Code como `4caee27acfadb50a4cd024e738b5c3cbd4b0bb03`. O AgentShield agora reporta Zed e VS Code como adaptadores de harness de primeira classe, descobre `.zed/settings.json`, `.zed/tasks.json` e arquivos de hook-code `.zed` e sinaliza `.zed/setup.mjs` na regra de IOC de persistência de ferramenta AI ao lado de `.vscode/setup.mjs`. A verificação local passou typecheck, lint, testes focados de scanner/regra, `npm test` completo (1822 testes), `npm run build` e `git diff --check`; as verificações do GitHub passaram através de GitGuardian, suíte de scan, self-scan, exemplos de self-scan, CI Node 18/20/22, CodeRabbit e Cubic após reexecutar uma falha transiente de upload de artefato. |
| AgentShield #95 | PR #95 mergeou a correção Dependabot `brace-expansion` como `25d91f0002214c408da4ceaac7def20bad40ca10`. O lockfile agora resolve entradas transitivas vulneráveis `brace-expansion` 5.x para `5.0.6`, `npm audit --audit-level=moderate` local retorna 0 vulnerabilidades e `gh api repos/affaan-m/agentshield/dependabot/alerts?state=open` retorna `[]`. A validação local passou typecheck, lint, `npm test` completo (1822 testes), build, auditoria e verificações de espaço em branco; as verificações do GitHub passaram através de Verify Node 18/20/22, self-scan, exemplos de self-scan, Test GitHub Action, GitGuardian, CodeRabbit e Cubic. |
| Sincronização do roadmap Linear | Comentário ITO-54 do Linear `74dcc101-3be5-4173-be13-62b80d54f569` e comentário do projeto ECC Platform Roadmap `348ea8f5-2a2d-46d9-a0fe-ed99653e7fe5` registram o lote de readback de status/plano de profundidade de observabilidade hospedada de 20 de maio; comentários Linear `291e2a4b-06e3-4672-a057-cdb141478161` e `b2d35de0-ca49-44cb-982a-ddec229e7691` adicionam o readback de API de observabilidade #88; comentário ITO-49 do Linear `faed69dd-35f5-469d-acb5-ddde6a70d6a1` e comentário do projeto `70187c1e-d481-4181-b418-09bd65d54b5e` adicionam a evidência do adaptador Zed/VS Code AgentShield #94; comentário ITO-49 do Linear `371fc3e4-611f-4d20-a23f-67db1260b418`, comentário ITO-57 `bd06e252-15c1-4256-b667-caa3f64f5968` e comentário do projeto `22c2c388-2fd1-4dea-a939-6141f40c9a21` adicionam o fechamento de alerta Dependabot AgentShield #95; comentários anteriores em ITO-54, ITO-48 e o projeto registram os lotes de sync de remediação hospedada #84 e emissão de evento de observabilidade hospedada #85. |

## Sincronização do Gate de Lançamento Marketplace Pro - 2026-05-20

| Superfície | Evidência |
| --- | --- |
| ECC-Tools #89 | PR #89 mergeado como `512bca6b99cdaa67058a6aa9a4e7e7f0b1d9873a` após Verify, Security Audit e Workers Builds passarem. Adicionou `billing:kv-readback -- --select-ready-target --require-ready`, permitindo que os operadores selecionem um alvo Marketplace Pro pronto internamente sem passar ou imprimir o login. |
| Readback de produção ao vivo | O readback Wrangler OAuth de 2026-05-20 encontrou registros Marketplace Pro prontos com proveniência de webhook, selecionou um alvo com ambas as famílias de chaves, prontidão de assento e webhook, sem excedente e 0 bloqueadores, com detalhes da conta editados. O antigo bloqueador de estado alvo Marketplace Pro ausente está eliminado. |
| ECC #2019 | PR #2019 mergeado como `30f60710d4e0424fc70d9bbdc105009db141d9d8`, sincronizando a evidência de readback de alvo selecionado no roadmap GA, evidência de publicação rc.1, matriz de nomenclatura, manifest do preview e painel do operador. |
| ECC-Tools #90 | PR #90 mergeado como `16a5bb33ee5ce7c31d2ad8d041e5afac03308f05` após Verify, Security Audit e Workers Builds passarem. Adicionou o gate de anúncio oficial de alvo selecionado através de `/api/billing/readiness?selectReadyTarget=1` e `npm run billing:announcement-gate -- --select-ready-target`, mantendo o login bruto da conta fora dos logs de comando. |
| ECC #2020 | PR #2020 mergeado como `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2`, sincronizando as ECC-Tools #90 no roadmap, evidência de publicação, matriz de nomenclatura, manifest do preview, prontidão de publicação, ledger de URL do lançamento, superfícies de auditoria de plataforma e painel do operador. |
| ECC-Tools #91 | PR #91 mergeado como `72119a1acc6f5a0cd3bb5d90afd6e87fd1fefd05` após Verify, Security Audit e Workers Builds passarem. Adicionou `--env-file` aos scripts de anúncio de faturamento e readback KV para arquivos locais de credenciais de operador ignorados, com testes provando que segredos sentinela e logins de conta não são impressos. |
| ECC-Tools #92 | PR #92 mergeado como `18d80197be779619283e0b37e2952bac53819a07` após Verify, Security Audit e Workers Builds passarem. Adicionou o bearer `INTERNAL_OPERATOR_API_SECRET` não disruptivo aceito pelas rotas de API internas privilegiadas sem rotacionar o `INTERNAL_API_SECRET` primário, e o Worker mergeado foi implantado em `api.ecc.tools`. |
| Gate de alvo selecionado ao vivo de 20 de maio | O readback Wrangler com suporte de vault passou com estado Marketplace Pro, impressão digital do alvo `e953a74209fe`, ambas as famílias de chaves, evidência de webhook, prontidão de assento, sem excedente e 0 bloqueadores. Após rotacionar o bearer do operador, `npm run billing:announcement-gate -- --preflight --select-ready-target` retornou pronto e `npm run billing:announcement-gate -- --select-ready-target` retornou `announcementGateReady: true`, 0 ações obrigatórias, 0 bloqueadores e resumo de auditoria 6 aprovados / 1 aviso / 0 falhas. |
| ECC-Tools #93 | PR #93 mergeado como `d3d62df83fa075660fa4530c3e0edc311a4355fe`, registrando o gate de anúncio de faturamento ao vivo passado no checklist de lançamento e roadmap de distribuição enquanto preserva os gates finais de aprovação de lançamento/plugin/URL. |
| CI main pós-merge | Execuções do GitHub Actions ECC `26135974576`, `26136949698` e `26138015245` concluíram com sucesso no `main` para `30f60710d4e0424fc70d9bbdc105009db141d9d8`, `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2` e `6e25458dbc15cd07cfb7a4e1f0b06f3eda41a043` através de lint, cobertura, segurança, validação e a matriz completa de SO/gerenciador de pacotes. As execuções CI main das ECC-Tools `26137280847`, `26138403065` e `26138669148` concluíram com sucesso para `72119a1acc6f5a0cd3bb5d90afd6e87fd1fefd05`, `18d80197be779619283e0b37e2952bac53819a07` e `d3d62df83fa075660fa4530c3e0edc311a4355fe`. |
| Gates locais pós-merge | `npm run platform:audit -- --json` retornou pronto verdadeiro com 0 PRs, 0 issues, 0 lacunas de discussão e 0 bloqueadores sujos; `npm run preview-pack:smoke -- --format json` retornou pronto verdadeiro com digest `531328aaaa53` antes da renovação do painel de 20 de maio e `eebb8a66c33e` após adicionar o artefato do painel de 20 de maio; `git diff --check HEAD~1..HEAD` estava limpo. |
| Sincronização do roadmap Linear | Comentário ITO-61 do Linear `467d148a-712a-4777-aad9-95593e9f1739` e comentário do projeto ECC Platform Roadmap `7642ee9c-3107-400c-a229-53e2895a8914` registram ECC-Tools #89, ECC #2019, a execução CI verde pós-merge e o gate anterior do bearer de token interno; comentário ITO-44 do Linear `a9297467-208a-41e4-8dbb-35f0dad5fe2b`, comentário ITO-56 `5008b70b-cf98-43cd-a8d4-f098ba9b9780`, comentário ITO-61 `5ebf0aaf-e2d3-4537-878f-484f49dcf87a` e resposta do projeto `1c74a3d0-f8ca-4306-997e-a37c53d49f97` registram a sincronização do gate de anúncio de alvo selecionado ECC #2020; uma nova sincronização Linear deve registrar ECC-Tools #92/#93 e a passagem do gate ao vivo. |
| Bloqueador remanescente | A evidência de faturamento de pagamentos nativos está pronta a partir da passagem do gate de alvo selecionado de 20 de maio. Repita o readback KV e `billing:announcement-gate -- --select-ready-target` imediatamente antes do lançamento e mantenha o texto de pagamentos nativos atrás dos gates finais de lançamento, plugin, URL ao vivo e aprovação do proprietário. |

## Evidências de Lançamento e Crescimento

| Gate | Comando | Resultado |
| --- | --- | --- |
| Testes de superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | 28 passados, 0 falhas |
| Smoke do preview pack | `npm run preview-pack:smoke -- --format json` | Pronto verdadeiro; digest `eebb8a66c33e`; 33 artefatos obrigatórios; 5 passados, 0 falhas |
| Gate de aprovação de lançamento | `npm run release:approval-gate -- --format json` | Bloqueado esperado; digest `ef8f49f727b7`; 4 passados, 2 falhas; decisões do proprietário e readbacks de URL ao vivo permanecem aguardando aprovação |
| Painel do operador | `npm run operator:dashboard -- --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-20.md` | Regenerado a partir da linha de base `main` de 20 de maio com auditoria de plataforma pronta verdadeiro, 0 PRs rastreados, 0 issues rastreados, 0 lacunas de discussão, MRR atual `$1.728/mês`, MRR alvo `$10.000/mês`, suíte de vídeo do lançamento marcada como atual, sincronização do gate de lançamento Linear atual e ações principais para publicação de plugin, notificações, aprovação de outbound, AgentShield e faturamento das ECC Tools |
| Verificação da cadeia de suprimentos | `npm audit --audit-level=moderate`; `npm audit signatures`; `yarn install --immutable --mode=skip-build` | A atualização atual da cadeia de suprimentos encontrou 0 vulnerabilidades npm, verificou 254 assinaturas de registro e 30 atestados e aceitou o lock do Yarn após fixar `@types/node@25.7.0` mais atualizar `brace-expansion` para `5.0.6` / `1.1.14` |
| Suíte de vídeo do lançamento | `npm run release:video-suite -- --format json --summary` com `ECC_VIDEO_SOURCE_ROOT` e `ECC_VIDEO_RELEASE_SUITE_ROOT` | Pronto verdadeiro; 15/15 ativos de origem presentes; 13/13 artefatos de render, timeline, legenda, EDL e segmento presentes; 12/12 saídas de candidato de publicação presentes com zero segmentos de quadro preto detectados; autoavaliação do render bruto primário passou a 144,759 segundos, 1920x1080, 1 stream de áudio e 106,78 MB |
| Conjunto de regressão focado pós-merge | `node tests/hooks/detect-project-worktree.test.js`; `node tests/hooks/observe-subdirectory-detection.test.js`; `node tests/scripts/instinct-cli-projects.test.js`; `node tests/hooks/hooks.test.js` | 10/10, 6/6, 5/5 e 237/237 passaram após o PR #2009 ter sido mergeado |
| Regressão PR #2011 do GateGuard | `node tests/hooks/gateguard-fact-force.test.js`; `npm test`; `git diff --check main...HEAD` | 91/91 passaram no branch do PR; suíte local completa passou 2560/2560 antes do merge; verificação de espaço em branco passou; suíte GateGuard focada passou novamente no `main` atual |
| Validação do gate de aprovação de lançamento PR #2013 | `npm test`; `npm run lint`; `git diff --check`; `npm run preview-pack:smoke -- --format json`; `npm run release:approval-gate -- --format json` | 2568/2568 testes passaram antes do merge; lint e espaço em branco passaram; preview pack permaneceu pronto com digest `531328aaaa53`; gate de aprovação de lançamento retornou a saída bloqueada esperada com digest `ef8f49f727b7` |
| Suíte local completa | `node tests/run-all.js` | 2568 passados, 0 falhas antes do merge do PR #2013 |
| CI PR #1998 | Execução do GitHub Actions `26099020341` | Concluiu com sucesso para `d500de1e9f11c0446b6a1349bd98b522d31f9125`; todas as verificações relatadas passaram, incluindo lint, validação, varredura de segurança, cobertura, GitGuardian, CodeRabbit, Cubic e a matriz de testes macOS/Ubuntu/Windows |
| CI PR #1999 | Execução do GitHub Actions `26100148726` | Concluiu com sucesso para `90584b6d5e5814bc2ad9a4cd651bebd043de989d`; lint, validação, varredura de segurança, cobertura, GitGuardian, CodeRabbit e a matriz macOS/Ubuntu/Windows passaram; Cubic completou neutro e não bloqueou o merge |
| CI PR #2001 | Execução do GitHub Actions `26102500291` | Concluiu com sucesso para `8148340ad14eb32c971346f0cb4cb9431ec0f5de`; verificações obrigatórias passaram antes do merge |
| CI PR #2002 | Execução do GitHub Actions `26103853507` | Concluiu com sucesso antes do merge; verificações obrigatórias passaram, Cubic permaneceu não bloqueante e PR #2002 mergeou no `main` como `c7d662c3c68719e5ef0b5305ca3f6782b3214224` |
| CI PR #2004 | Execução do GitHub Actions `26105012698` | Concluiu com sucesso após reexecutar o único job yarn Windows Node 18 falho; verificações obrigatórias passaram, Cubic permaneceu não bloqueante e PR #2004 mergeou no `main` como `ac7434ea8f39166b11e9d06ce64b38c4fb8d9202` |
| CI PR #2005 | Execução do GitHub Actions `26106321921` | Concluiu com sucesso com 37 jobs concluídos, 0 jobs falhos e PR #2005 mergeou no `main` como `d6022d6b8dc5ef1393cf18ae40ee58f646f3754e` |
| CI PR #2008 | Execução do GitHub Actions `26108473648` | Concluiu com sucesso na matriz obrigatória antes do merge; Cubic não bloqueante pulou após revisão |
| CI main pós-PR #2006 | Execução do GitHub Actions `26109953093` | Concluiu com sucesso com 37 jobs concluídos, 0 jobs falhos e `main` avançou para `98bd517451f38fa0150a53aab4234c2239a47b7e` |
| CI PR #2009 | Execução do GitHub Actions `26111313938` | Concluiu com sucesso com 37 jobs concluídos, 0 jobs falhos após substituir a fixture de regressão de worktree falsa quebrável por uma configuração real de `git worktree add` |
| CI main pós-PR #2009 | Execução do GitHub Actions `26111946778` | Concluiu com sucesso com 37 jobs concluídos, 0 jobs falhos e `main` avançou para `bc519e5b8ed42f26c0a5a611756e04351c323f21` |
| CI main pós-PR #2011 | Execução do GitHub Actions `26113695068` | Concluiu com sucesso com 37 jobs concluídos, 0 jobs falhos e `main` avançou para `14d88e517b0c56a80c1a6392b1cde2474948d29f` |
| CI main pós-PR #2013 | Execução do GitHub Actions `26128749863` | Concluiu com sucesso com `main` avançando para `9819626459a662773be7d0b1c18d82c1316b8c36` |
| CI main pós-PR #2019 | Execução do GitHub Actions `26135974576` | Concluiu com sucesso com `main` avançando para `30f60710d4e0424fc70d9bbdc105009db141d9d8` |
| CI main pós-PR #2020 | Execução do GitHub Actions `26136949698` | Concluiu com sucesso com `main` avançando para `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2` |
| CI main ECC-Tools #91 | Execução do GitHub Actions `26137280847` | Concluiu com sucesso no `main` das ECC-Tools com `72119a1acc6f5a0cd3bb5d90afd6e87fd1fefd05` após o suporte ao gate de faturamento de arquivo de ambiente ter sido mergeado |
| CI main ECC-Tools #92 | Execução do GitHub Actions `26138403065` | Concluiu com sucesso no `main` das ECC-Tools com `18d80197be779619283e0b37e2952bac53819a07` após o caminho bearer do operador ter sido mergeado |
| CI main ECC-Tools #93 | Execução do GitHub Actions `26138669148` | Concluiu com sucesso no `main` das ECC-Tools com `d3d62df83fa075660fa4530c3e0edc311a4355fe` após as evidências de anúncio de faturamento ao vivo terem sido mergeadas |
| Sincronização Linear | Documento Linear `ecc-may-19-post-pr-2002-sync-64cef8f668e0` mais comentário do projeto `a6411e3a-8c8e-4a58-adba-687e77d4c543`; documento da passagem tardia `ecc-may-19-late-queue-zero-and-release-gate-sync-1c26f65e6b3f` mais comentário do projeto `d42bf0e2-7a8e-4934-9f3f-e281498ee805`; comentário ITO-61 de 20 de maio `467d148a-712a-4777-aad9-95593e9f1739` mais comentário do projeto `7642ee9c-3107-400c-a229-53e2895a8914`; comentário ITO-44 de 20 de maio `a9297467-208a-41e4-8dbb-35f0dad5fe2b`, comentário ITO-56 `5008b70b-cf98-43cd-a8d4-f098ba9b9780`, comentário ITO-61 `5ebf0aaf-e2d3-4537-878f-484f49dcf87a` e resposta do projeto `1c74a3d0-f8ca-4306-997e-a37c53d49f97` | Faixas de projeto e issue registram evidências do PR #2002, roteamento da discussão #2003, gate de painel de aprovação do proprietário e status Em Progresso para ITO-47, ITO-48, ITO-49, ITO-51, ITO-54 e ITO-56; a sincronização da passagem tardia anexa as evidências do PR #2013, ECC-Tools #79 e JARVIS #15/#16 ao ITO-44, ITO-50, ITO-54, ITO-56 e ITO-61; a sincronização de 20 de maio anexa as evidências de alvo selecionado ECC-Tools #89/#90, ECC #2019/#2020 Marketplace Pro e gate de anúncio de alvo selecionado, e o caminho de gate env-file/bearer-token remanescente ao ITO-44, ITO-56, ITO-61 e ao projeto |
| Sanitização de caminho público | `node scripts/ci/validate-no-personal-paths.js` através da suíte local e CI | Passou |
| Markdown e espaço em branco | `markdownlint` focado nos docs de lançamento mais `git diff --check` antes do PR #1999 | Passou |

## Evidências de Produto e Posicionamento

| Superfície | Evidência |
| --- | --- |
| Identidade canônica do repo | URLs públicas e docs de lançamento agora usam `https://github.com/affaan-m/ECC` onde links públicos são necessários |
| Alegação de lançamento | As notas de lançamento e o material de lançamento enquadram o ECC como o sistema operador nativo de harness para trabalho agêntico, não apenas um pacote de configuração exclusivo para Claude |
| Prova de vídeo | `video-suite-production.md` faz o gate do render bruto local, timeline, legendas, inventário de origem, conjunto de clipes candidatos de publicação, autoavaliação, QA de quadro preto e regras de publicação sem caminho privado |
| Prova de crescimento | `partner-sponsor-talks-pack.md` fornece texto aguardando aprovação para patrocinadores, parceiros, consultoria, palestras, podcasts, GitHub Discussion e CTAs de vídeo |
| Prova de aprovação do proprietário | `owner-approval-packet-2026-05-19.md` centraliza os gates de decisão de lançamento, pacote, plugin, vídeo, faturamento, social e outbound |
| Linha de base de negócios | O centro de comando de hipercrescimento e o pacote de parceiros usam MRR atual `$1.728/mês`, MRR alvo `$10.000/mês` e gap `$8.272/mês` |
| Painel do operador | `operator-readiness-dashboard-2026-05-20.md` puxa a linha de base de crescimento para a mesma superfície de controle de fila, publicação, vídeo, outbound, AgentShield, gate de faturamento/env-file das ECC Tools, Linear e cadeia de suprimentos |
| Prova de progresso Linear | O documento do projeto Linear `ecc-may-19-post-pr-2002-sync-64cef8f668e0` espelha o estado pós-PR #2002 e registra faixas ativas para materiais de lançamento, AgentShield, análise profunda das ECC Tools, observabilidade e publicação final do lançamento; o documento Linear `ecc-may-19-late-queue-zero-and-release-gate-sync-1c26f65e6b3f` adiciona o gate de aprovação PR #2013, hardening de redação ECC-Tools #79 e evidências de reparo de fila/deploy JARVIS #15/#16; os comentários Linear de 20 de maio `74dcc101-3be5-4173-be13-62b80d54f569`, `348ea8f5-2a2d-46d9-a0fe-ed99653e7fe5`, `291e2a4b-06e3-4672-a057-cdb141478161`, `b2d35de0-ca49-44cb-982a-ddec229e7691`, `faed69dd-35f5-469d-acb5-ddde6a70d6a1`, `70187c1e-d481-4181-b418-09bd65d54b5e`, `371fc3e4-611f-4d20-a23f-67db1260b418`, `bd06e252-15c1-4256-b667-caa3f64f5968`, `22c2c388-2fd1-4dea-a939-6141f40c9a21`, `a9297467-208a-41e4-8dbb-35f0dad5fe2b`, `5008b70b-cf98-43cd-a8d4-f098ba9b9780`, `5ebf0aaf-e2d3-4537-878f-484f49dcf87a` e `1c74a3d0-f8ca-4306-997e-a37c53d49f97` adicionam evidências de readback de observabilidade hospedada das ECC-Tools, evidências do adaptador AgentShield, fechamento de alerta Dependabot do AgentShield e evidências do gate de anúncio de alvo selecionado do Marketplace ao ITO-44, ITO-49, ITO-54, ITO-56, ITO-57, ITO-61 e ao projeto |

## Bloqueadores Atuais de Publicação

- O pré-lançamento `v2.0.0-rc.1` no GitHub ainda não foi criado nesta passagem.
- O npm `ecc-universal@2.0.0-rc.1` ainda não foi publicado com a dist-tag `next`.
- A tag do plugin Claude e a propagação no marketplace permanecem aguardando aprovação.
- A distribuição via marketplace de repo do plugin Codex está verificada por evidências anteriores, mas
  a publicação oficial no Diretório de Plugins permanece bloqueada em submissão OpenAI ou
  evidências de listagem.
- As evidências de faturamento/pagamentos nativos das ECC Tools não estão mais bloqueadas pelo
  caminho de bearer de token interno ou gate de anúncio de alvo selecionado. Repita
  `billing:kv-readback -- --select-ready-target --require-ready` e
  `billing:announcement-gate -- --select-ready-target` imediatamente antes do
  lançamento e mantenha o texto atrás dos gates finais de lançamento, plugin, URL ao vivo e
  aprovação do proprietário.
  O PR #89 das ECC-Tools (`512bca6`) adicionou `billing:kv-readback --
  --select-ready-target --require-ready`; sua execução de produção de 2026-05-20 eliminou
  o antigo bloqueador de estado alvo ausente sem imprimir o login da conta.
  O PR #90 das ECC-Tools (`16a5bb3`) adicionou o gate de anúncio oficial de alvo selecionado,
  para que o preflight de produção não precise mais de um login bruto do GitHub.
  O PR #91 das ECC-Tools (`72119a1`) adicionou suporte `--env-file` para credenciais de
  faturamento locais ignoradas sem imprimir segredos carregados ou logins de conta.
  O PR #92 das ECC-Tools (`18d8019`) adicionou o caminho bearer de operador não disruptivo e
  o PR #93 das ECC-Tools (`d3d62df`) registrou a passagem do gate ao vivo.
- As notas de lançamento, X, LinkedIn, lançamento no GitHub, GitHub Discussion, texto longo,
  outreach de patrocinador, outreach de parceiro, texto de consultoria, propostas de conferência e
  propostas de podcast ainda precisam de URLs ao vivo finais mais aprovação humana antes de postar
  ou enviar.
- Links Discord/comunidade ainda precisam de um caminho real de convite ou credencial de bot/guild
  antes que os docs públicos devam redirecionar os usuários para lá.

## Resultado

A fila pública de PRs, fila de issues, fila de discussões, identidade ECC canônica,
suíte de vídeo do lançamento, preview pack, pacote de outreach de crescimento, superfície de adaptador
Claude Code por projeto, higiene do registro de projeto de aprendizado contínuo,
correção de introspecção git com aspas do GateGuard, gate de aprovação de lançamento determinístico,
hardening de redação do gate de anúncio de faturamento das ECC-Tools, readback de faturamento de alvo selecionado,
gate de anúncio de alvo selecionado, caminho operador env-file do gate de faturamento,
readback de observabilidade hospedada das ECC-Tools, cobertura do adaptador Zed/VS Code do AgentShield,
fechamento de alerta Dependabot do AgentShield e reparos de fila/deploy de segurança do JARVIS
estão atuais em 20 de maio de 2026 para o `main` do ECC através de
`c2471fe5c535310f8a8008c9ed7ea9f6757b33f2`, `main` das ECC-Tools através de
`72119a1acc6f5a0cd3bb5d90afd6e87fd1fefd05` e `main` do AgentShield através de
`25d91f0002214c408da4ceaac7def20bad40ca10`. O trabalho de vídeo remanescente é
aprovação do proprietário, upload e anexação de URL pública, não produção de render ou QA.

Isso melhora a prontidão de publicação mas não substitui as etapas de lançamento, pacote, plugin,
faturamento, Discord e anúncio aguardando aprovação em `publication-readiness.md`.
