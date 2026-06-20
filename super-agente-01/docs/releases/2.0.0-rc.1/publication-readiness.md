# Prontidão de Publicação ECC v2.0.0-rc.1

Este checklist é o gate de lançamento para superfícies de publicação pública. Não o use
como evidência por si só. Preencha os campos de evidência com saídas de comandos frescos ou
URLs do commit exato sendo lançado.

Para a decisão de nomenclatura atual do rc.1 e o caminho de publicação de pacote/plugin, consulte
[`naming-and-publication-matrix.md`](naming-and-publication-matrix.md).
Para o gate de nome de lançamento, pacote, plugin Claude, plugin Codex e
ordem de publicação de 18 de maio, consulte
[`release-name-plugin-publication-checklist-2026-05-18.md`](release-name-plugin-publication-checklist-2026-05-18.md).
Para o limite do preview pack rc.1 montado, consulte
[`preview-pack-manifest.md`](preview-pack-manifest.md).
Para a passagem de evidência de dry-run de 12 de maio, consulte
[`publication-evidence-2026-05-12.md`](publication-evidence-2026-05-12.md).
Para a atualização de evidência de prontidão de lançamento de 13 de maio, consulte
[`publication-evidence-2026-05-13.md`](publication-evidence-2026-05-13.md).
Para a atualização de evidência pós-hardening de 13 de maio após PR #1850 e PR #1851, consulte
[`publication-evidence-2026-05-13-post-hardening.md`](publication-evidence-2026-05-13-post-hardening.md).
Para a atualização de evidência de fila, discussão, roadmap Linear, acompanhamento Mini Shai-Hulud/TanStack,
vigilância de cadeia de suprimentos agendada, hardening de instalação de CI sem ciclo de vida,
purga de cache do GitHub Actions, verificação de lançamento do AgentShield, gate de faturamento,
proveniência do pacote de evidências do AgentShield #86 e guard de diretório atual do `ecc2` de 15 de maio
através do PR #1941, consulte
[`publication-evidence-2026-05-15.md`](publication-evidence-2026-05-15.md).
Para a limpeza de fila de 16 de maio, merge de skill recsys, triagem de issue GateGuard,
evidência de confiança de runtime de cache de plugin do AgentShield #87, inspeção/readback de pacote de evidências do AgentShield #88,
roteamento de frota de pacote de evidências do AgentShield #89,
itens de revisão de frota do AgentShield #90, exportação de política com checksum do AgentShield #91,
promoção de política verificada por checksum do AgentShield #92, consumo de resumo de frota das ECC-Tools #76,
caminhos de evidência de descoberta hospedada das ECC-Tools #77, vinculação de rota de política de harness das ECC-Tools #78,
atualização do painel do operador e reexecução final combinada do gate no `main` atual, consulte
[`publication-evidence-2026-05-16.md`](publication-evidence-2026-05-16.md).
Para a limpeza de fila de 17 de maio, merge de localização japonesa, merges de TypeScript e tipos Node do Dependabot,
reparo de lint ja-JP pós-merge, reverificação local de proteção Mini Shai-Hulud/TanStack,
roteamento de cauda legado e progresso Linear, gate de smoke determinístico do preview pack e
atualização atual do painel do operador, consulte
[`publication-evidence-2026-05-17.md`](publication-evidence-2026-05-17.md).
Para a fila no head atual de 18 de maio, lote de merge de segurança de workflow/métricas/uncloud,
revisão/fechamento do PR #1978, reverificação local e doméstica de proteção Mini Shai-Hulud/TanStack,
gates de instalação/auditoria/assinatura npm sem ciclo de vida,
varredura de projeto do AgentShield, mirror de evidência enterprise/IOC `840952a` do AgentShield,
hardening de escopo de publicação OIDC do lançamento, normalização de workflow, atualizações posteriores
de painel/prontidão de publicação através de `67e63e63`, sincronização de itens de trabalho,
comentários de progresso Linear, fechamento do ITO-46, atualização do painel do operador e
sucesso de CI/varredura de segurança no head atual através do lote de merge de identidade, vídeo e
pacote de crescimento de 19 de maio, consulte
[`publication-evidence-2026-05-19.md`](publication-evidence-2026-05-19.md).
Para o painel de prontidão prompt-para-artefato voltado ao operador da mesma passagem de 16 de maio, consulte
[`operator-readiness-dashboard-2026-05-15.md`](operator-readiness-dashboard-2026-05-15.md).
Para a atualização do painel do operador de 17 de maio, consulte
[`operator-readiness-dashboard-2026-05-17.md`](operator-readiness-dashboard-2026-05-17.md).
Para a atualização do painel do operador de 18 de maio, consulte
[`operator-readiness-dashboard-2026-05-18.md`](operator-readiness-dashboard-2026-05-18.md).

Para o painel de hipercrescimento/operador de 19 de maio, consulte
[`operator-readiness-dashboard-2026-05-19.md`](operator-readiness-dashboard-2026-05-19.md).
O painel atual do operador de gate de lançamento Marketplace Pro de 20 de maio está em
[`operator-readiness-dashboard-2026-05-20.md`](operator-readiness-dashboard-2026-05-20.md).
Para a folha de decisão final do proprietário para aprovações de lançamento, npm, plugin, vídeo, faturamento,
social e outbound, consulte
[`owner-approval-packet-2026-05-19.md`](owner-approval-packet-2026-05-19.md).
Para o ledger de URL de lançamento ao vivo/pendente de 26 de maio após os readbacks do pré-lançamento do GitHub e
npm `next`, consulte
[`release-url-ledger-2026-05-19.md`](release-url-ledger-2026-05-19.md).

## Matriz de Identidade do Lançamento

| Superfície | Valor esperado | Fonte da verdade | Verificação fresca | Artefato de evidência | Proprietário | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Nome do produto | ECC | `README.md`, manifests de plugin, notas de lançamento | `rg -n "^# ECC\|displayName.*ECC\|affaan-m/ECC" README.md .codex-plugin/plugin.json docs/releases/2.0.0-rc.1` | `release-name-plugin-publication-checklist-2026-05-18.md` mais `release-url-ledger-2026-05-19.md` | Proprietário do lançamento | Evidência registrada |
| Repo GitHub | `affaan-m/ECC` | Remote Git e URLs de lançamento | `git remote get-url origin` | `release-url-ledger-2026-05-19.md` | Proprietário do lançamento | Evidência registrada |
| Tag Git | `v2.0.0-rc.1` | Lançamentos do GitHub | `gh release view v2.0.0-rc.1 --repo affaan-m/ECC` | Pré-lançamento ao vivo em <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1>; prerelease verdadeiro, draft falso | Proprietário do lançamento | Evidência registrada |
| Pacote npm | `ecc-universal` | `package.json` | `node -p "require('./package.json').name"` | `publication-evidence-2026-05-12.md` | Proprietário do pacote | Evidência registrada |
| Versão npm | `2.0.0-rc.1` | `VERSION`, `package.json`, lockfiles | `node -p "require('./package.json').version"` | `publication-evidence-2026-05-12.md` | Proprietário do pacote | Evidência registrada |
| Dist-tag npm | `next` para rc, `latest` somente para GA | Registro npm | `npm view ecc-universal dist-tags --json` | Registro tem `latest: 1.10.0` e `next: 2.0.0-rc.1` | Proprietário do pacote | Evidência registrada |
| Slug do plugin Claude | `ecc` / caminho de instalação `ecc@ecc` | `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | `node tests/hooks/hooks.test.js` | `publication-evidence-2026-05-12.md` | Proprietário do plugin | Evidência registrada |
| Manifest do plugin Claude | `2.0.0-rc.1`, sem campos `agents` não suportados ou `hooks` explícitos | `.claude-plugin/plugin.json`, `.claude-plugin/PLUGIN_SCHEMA_NOTES.md` | `claude plugin validate .claude-plugin/plugin.json` | `publication-evidence-2026-05-12.md` | Proprietário do plugin | Evidência registrada |
| Manifest do plugin Codex | `2.0.0-rc.1` com fonte de skill compartilhada | `.codex-plugin/plugin.json` | `node tests/docs/ecc2-release-surface.test.js` | `publication-evidence-2026-05-12.md` | Proprietário do plugin | Evidência registrada |
| Marketplace de repo Codex | `ecc@2.0.0-rc.1` exposto através de `.agents/plugins/marketplace.json` | `.agents/plugins/marketplace.json`, `.codex-plugin/README.md` | `HOME="$(mktemp -d)" codex plugin marketplace add <local-checkout>` | `publication-evidence-2026-05-15.md` | Proprietário do plugin | Caminho de marketplace de repo verificado; não reivindique listagem oficial no Diretório de Plugins antes das evidências de submissão OpenAI |
| Pacote OpenCode | Módulo de plugin `ecc-universal` | `.opencode/package.json`, `.opencode/index.ts` | `npm run build:opencode` | `publication-evidence-2026-05-12.md` | Proprietário do pacote | Evidência registrada |
| Metadados do agente | `2.0.0-rc.1` | `agent.yaml`, `.agents/plugins/marketplace.json` | `node tests/scripts/catalog.test.js` | `publication-evidence-2026-05-12.md` | Proprietário do lançamento | Evidência registrada |
| Texto de migração | Caminho de upgrade rc.1, não alegação GA | `release-notes.md`, `quickstart.md`, `HERMES-SETUP.md` | `npx markdownlint-cli '**/*.md' --ignore node_modules` | `publication-evidence-2026-05-13.md` | Proprietário de docs | Evidência registrada |

## Gates de Publicação

| Gate | Evidência obrigatória | Verificação fresca | Campo de bloqueador | Proprietário | Status |
| --- | --- | --- | --- | --- | --- |
| Lançamento no GitHub | Tag existe, notas de lançamento usam URLs finais, assets anexados se necessário | `gh release view v2.0.0-rc.1 --json tagName,url,isPrerelease` | `Pronto: pré-lançamento v2.0.0-rc.1 está ao vivo; URLs restantes de plugin, vídeo, faturamento e outbound ainda estão gatadas` | Proprietário do lançamento | Evidência registrada |
| Pacote npm | `npm pack --dry-run` tem os arquivos esperados, versão corresponde, rc vai para `next` | `npm pack --dry-run`; `npm view ecc-universal name version dist-tags --json`; `npm view ecc-universal@2.0.0-rc.1 name version dist.tarball dist.integrity time --json` | `Pronto: ecc-universal@2.0.0-rc.1 está ao vivo no next; latest permanece em 1.10.0` | Proprietário do pacote | Evidência registrada |
| Plugin Claude | Manifest valida, marketplace JSON aponta para repo público, docs de instalação correspondem ao slug | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin tag .claude-plugin --dry-run`; smoke de instalação em home temporária isolada | `Bloqueador: criação/envio real de tag requer aprovação` | Proprietário do plugin | Dry-run de checkout limpo e smoke de instalação registrados |
| Plugin Codex | Versão do manifest corresponde ao pacote e docs, marketplace de repo aponta para a raiz do plugin e o status atual do Diretório Oficial de Plugins da OpenAI está registrado | `node tests/docs/ecc2-release-surface.test.js`; `node tests/plugin-manifest.test.js`; `codex plugin marketplace add --help`; `codex plugin marketplace add <local-checkout>` em home temporária | `Bloqueador: listagem no Diretório Oficial de Plugins requer evidências de submissão/listagem da OpenAI` | Proprietário do plugin | Distribuição via marketplace de repo verificada; diretório oficial pendente |
| Pacote OpenCode | Saída de build é regenerada a partir da fonte e os metadados do pacote estão atuais | `npm run build:opencode` | `Bloqueador: nenhum para build local; distribuição pública ainda segue o lançamento npm/plugin` | Proprietário do pacote | Evidência registrada |
| Referência de faturamento das ECC Tools | Qualquer alegação de faturamento vincula ao estado verificado do Marketplace/App | `env -u GITHUB_TOKEN gh repo view ECC-Tools/ECC-Tools --json nameWithOwner,isPrivate,viewerPermission` mais readback interno `/api/billing/readiness?selectReadyTarget=1` usando o caminho bearer do operador | `Pronto: CI main das ECC-Tools #92 e CI main das ECC-Tools #93 passaram; readback de alvo selecionado ao vivo retornou announcementGate.ready === true em 2026-05-20; repita antes do anúncio de pagamento` | Proprietário das ECC Tools | Evidência de faturamento pronta; texto final aguarda aprovações de lançamento/plugin/URL ao vivo |
| Texto de anúncio | X, LinkedIn, lançamento no GitHub e texto longo apontam para URLs ao vivo | varredura de marcador de placeholder e `release-url-ledger-2026-05-19.md` | `Bloqueador: links GitHub e npm estão ao vivo; URLs restantes de plugin, vídeo, faturamento e outbound ainda precisam de aprovação/readback` | Proprietário do lançamento | Ledger de URL registrado; URLs finais pendentes |
| Hardening de workflow privilegiado | Workflows de lançamento e manutenção evitam tokens de checkout persistidos | `node scripts/ci/validate-workflow-security.js` | `Bloqueador:` | Proprietário do lançamento | Evidência registrada na atualização pós-hardening |

## Evidência dos Comandos Obrigatórios

Registre o SHA exato do commit e a saída do comando antes de qualquer ação de publicação:

| Evidência | Comando | Resultado obrigatório | Saída registrada |
| --- | --- | --- | --- |
| Branch de lançamento limpo | `git status --short --branch` | No commit de lançamento pretendido; sem arquivos não relacionados | Linha de base atual de 20 de maio `c2471fe5c535310f8a8008c9ed7ea9f6757b33f2`: `## main...origin/main`; repita a partir do commit final exato de publicação antes do lançamento |
| Smoke do preview pack | `npm run preview-pack:smoke` | Artefatos do preview pack, limite Hermes, lista de comandos de verificação final e bloqueadores de publicação passam | `publication-evidence-2026-05-19.md`: pronto sim, digest `eebb8a66c33e`, 33 artefatos, 5 passados, 0 falhas; repita na passagem final de lançamento com checkout estritamente limpo |
| Gate de aprovação de lançamento | `npm run release:approval-gate -- --format json` | Pronto verdadeiro somente após as linhas de decisão do proprietário serem aprovadas, URLs ao vivo de lançamento/pacote/plugin/vídeo/faturamento estarem registradas e o texto de lançamento/outbound não ter placeholders ou caminhos privados | O estado atual de 26 de maio está intencionalmente bloqueado porque as decisões do proprietário de plugin/vídeo/faturamento/outbound e os readbacks de URL permanecem aguardando aprovação |
| Auditoria do harness | `npm run harness:audit -- --format json` | 80/80 passando | Gate de lançamento atual: 80/80 nas 8 categorias aplicáveis, 0 ações principais |
| Scorecard do adaptador | `npm run harness:adapters -- --check` | PASS | Gate de lançamento atual: PASS, 11 adaptadores |
| Prontidão de observabilidade | `npm run observability:ready` | 21/21 passando | Gate de lançamento atual: 21/21, pronto verdadeiro |
| Gate de segurança de lançamento | `npm run observability:ready -- --format json` | Categoria Release Safety passando com prontidão de publicação, cadeia de suprimentos, segurança de workflow, superfície de pacote e evidências de superfície de lançamento | Gate de lançamento atual mantém Release Safety passando em 3/3; repita o gate JSON a partir do commit final exato de lançamento |
| Verificação da cadeia de suprimentos | `npm audit --audit-level=moderate`; `npm audit signatures`; `yarn install --immutable --mode=skip-build`; `cd ecc2 && cargo audit -q`; alertas Dependabot; Verificações de Segurança GitGuardian | 0 vulnerabilidades/alertas, assinaturas de registro verificadas, locks de gerenciador de pacotes aceitos, GitGuardian limpo | Branch atual da cadeia de suprimentos: `npm audit` encontrou 0 vulnerabilidades; `npm audit signatures` verificou 254 assinaturas de registro e 30 atestados; instalação imutável do Yarn aceitou o lock após fixar `@types/node@25.7.0` e mover `brace-expansion` para `5.0.6` / `1.1.14`; CI PR #2008 `26108473648`, CI main pós-PR #2006 `26109953093`, CI PR #2009 `26111313938` e CI main pós-PR #2009 `26111946778` concluíram com 0 falhas |
| Suíte raiz | `node tests/run-all.js` | 0 falhas | Suíte local atual de 19 de maio: 2568 passados, 0 falhas antes do PR #2013 ser mergeado; regressões focadas pós-PR #2009 também passaram para detecção de worktree, observação de subdiretório/fallback global, CLI de manutenção de projeto e a suíte de hooks |
| Lint de Markdown | `npx markdownlint-cli '**/*.md' --ignore node_modules` | 0 falhas | Gate de lançamento atual: lint focado passou para `publication-readiness.md`, `publication-evidence-2026-05-19.md` e `docs/ECC-2.0-GA-ROADMAP.md` |
| Superfície de pacote | `node tests/scripts/npm-publish-surface.test.js` | 0 falhas; sem bytecode Python no tarball npm | Gate de lançamento atual: 2/2 passados |
| Superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | 0 falhas | Gate de lançamento atual: 27/27 passados após atualizar a asserção de contagem de discussão para a linha de base pós-PR #2005 |
| Superfície Rust opcional | `cd ecc2 && cargo test` | 0 falhas ou deferimento explícito | `publication-evidence-2026-05-16.md`: 462/462 passados, apenas avisos existentes |
| Linha de base da fila | `node scripts/platform-audit.js --json` nos repos trunk, AgentShield, JARVIS, ECC Tools e site ECC | Menos de 20 PRs abertos e menos de 20 issues abertos | Linha de base atual de 20 de maio após PR #2020: auditoria de plataforma pronta verdadeiro, 0 PRs abertos, 0 issues abertos, 0 lacunas de discussão, 0 PRs conflitantes e 0 arquivos bloqueadores sujos nos repos rastreados |
| Linha de base de discussão | `node scripts/platform-audit.js --json` e `node scripts/discussion-audit.js --json` | Sem fila de discussão ativa não gerenciada e sem Q&A respondível faltando uma resposta aceita | Linha de base pós-PR #2005: auditoria de plataforma amostrou 59 discussões do trunk, 0 precisando de toque do mantenedor, 0 discussões respondíveis sem resposta aceita; `docs/architecture/discussion-response-playbook.md` registra modelos de resposta e regras de escalada de segurança |
| Roadmap Linear | Readback de projeto e issue Linear | Roadmap detalhado existe com faixas de lançamento, segurança, AgentShield, ECC Tools, legado e observabilidade | Os comentários Linear de 18 de maio incluem ITO-57 `3fe5b2b7-c4fe-401c-a317-b40d72119cb3` e ITO-44 `fb4a4f33-6c2d-421a-bbdb-63cfad3e3ee4`; evidência anterior registra o projeto e 16 faixas de issue |
| Painel de prontidão do operador | `npm run operator:dashboard -- --json` | Estado atual da fila mapeado para entregas de macro-objetivo e lacunas incompletas | O painel atual de 20 de maio é atualizado a partir da linha de base pós-PR #2020; auditoria de plataforma pronta verdadeiro, 0 PRs abertos, 0 issues abertos, 0 lacunas de discussão, 0 arquivos sujos, suíte de vídeo do lançamento atual, faturamento/caminho env-file de alvo selecionado espelhado e gates de publicação ainda aguardando aprovação |
| Ledger de URL do lançamento | `docs/releases/2.0.0-rc.1/release-url-ledger-2026-05-19.md` mais varredura de marcador de placeholder | Links ao vivo e links aguardando aprovação são separados antes do texto de anúncio ser publicado | O ledger registra URLs públicas de repo/docs/pré-lançamento GitHub/npm/documentação OpenAI Codex e bloqueia URLs de plugin/vídeo/faturamento/social até que as verificações aguardando aprovação passem |
| Checklist de publicação de nome e plugin do lançamento | `docs/releases/2.0.0-rc.1/release-name-plugin-publication-checklist-2026-05-18.md` | Valores de nome/pacote/plugin estão congelados, comandos finais de lançamento estão listados e os caminhos de publicação Claude/Codex citam documentação oficial atual | O checklist mantém `ECC`, `ecc-universal` e slug de plugin `ecc` para rc.1; sem renomeação npm, publicação npm, tag de plugin, listagem oficial, alegação de faturamento ou anúncio antes das evidências finais |

## Não Publique Se

- `main` tiver mudanças não revisadas na superfície de lançamento após as evidências terem sido registradas.
- `npm view ecc-universal dist-tags --json` contradisser a tag rc/GA pretendida.
- A validação do plugin Claude estiver indisponível ou nenhum smoke de instalação com checkout limpo
  estiver registrado para o commit de lançamento pretendido.
- As notas de lançamento ou rascunhos de anúncio ainda contiverem URLs de placeholder,
  `TODO`, `TBD`, caminhos de workspace privado ou referências pessoais do operador.
- O texto de faturamento, Marketplace ou submissão de plugin reivindicar uma superfície ao vivo antes
  que a URL ao vivo exista.
- Trabalho de recuperação de PR obsoleto estiver em andamento no mesmo branch.

## Ordem de Anúncio

1. Mergear o PR da versão de lançamento.
2. Registrar a evidência dos comandos obrigatórios a partir do commit de lançamento.
3. Verificar o readback do pré-lançamento no GitHub.
4. Verificar se npm ainda aponta rc.1 para `next` e não `latest`.
5. Submeter ou atualizar as superfícies de marketplace de plugin.
6. Regenerar o ledger de URL do lançamento e atualizar as notas de lançamento com URLs ao vivo finais.
7. Publicar o texto do lançamento no GitHub.
8. Publicar o texto de X, LinkedIn e longo somente após as URLs públicas funcionarem.
