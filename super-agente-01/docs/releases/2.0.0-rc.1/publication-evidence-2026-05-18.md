# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-18

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Upstream main | `4470e2e6702f17099d6feb137ba03ff00582c202` |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Escopo da evidência | `main` atual após correções de bypass do validador de segurança de workflow do PR #1970, correções de relatório de custos da bridge de métricas do PR #1971, merge da skill `uncloud` do PR #1972, limpeza de scripts obsoletos do PR #1973, verificação/fechamento de relatório de custos do issue #1974, guards de resposta de provedor OpenAI/AstraFlow do PR #1976, revisão/fechamento do PR #1978, atualização do catálogo/painel do operador, mirror de readback de faturamento Wrangler OAuth das ECC-Tools, mirror de evidência de frota `840952a` do AgentShield e IOC Mini Shai-Hulud, reverificação de proteção Mini Shai-Hulud/TanStack, hardening do scanner IOC defensive-deny, checklist de publicação de nome/plugin do lançamento, aplicação de gate de prontidão/smoke para esse checklist, hardening de escopo de publicação OIDC do lançamento, normalização de quebra de linha de workflow, CI/varredura de segurança no head atual, sincronização de itens de trabalho, sincronização de progresso Linear, atualização de dry-run do caminho de publicação ITO-46, fechamento do ITO-46 no Linear e atualização do painel do operador pós-fechamento |
| Ressalva sobre status local | `git status --short --branch` estava limpo no momento da geração do painel; os arquivos de evidência gerados são commitados após o snapshot de origem que descrevem |

O operador real do lançamento deve repetir todas as verificações voltadas para publicação a partir do
commit de lançamento final com um checkout estritamente limpo antes de publicar.

## Estado da Fila e Discussão

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs do trunk | `gh pr list --limit 100 --json number,title,state,author,updatedAt,url` | 0 PRs abertos |
| Issues do trunk | `gh issue list --limit 100 --json number,title,state,updatedAt,url,labels` | 0 issues abertos |
| Auditoria de discussão | `npm run discussion:audit -- --json` | Pronto; 58 discussões amostradas em `affaan-m/everything-claude-code`, 0 precisando de toque do mantenedor, 0 discussões respondíveis sem resposta aceita e 0 erros de busca |
| Auditoria de plataforma | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Pronto; repos rastreados reportam 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 Q&A respondíveis sem respostas aceitas e 0 arquivos bloqueadores sujos |
| Sincronização de itens de trabalho | `node scripts/work-items.js sync-github --repo <tracked-repo>` para cinco repos rastreados; `node scripts/status.js --json`; `node scripts/work-items.js list --json` | Todos os cinco repos rastreados sincronizados com 0 PRs/issues abertos e nenhum item de trabalho alterado; o status local reporta 0 abertos, 0 bloqueados e 0 fechados |
| Painel do operador | `npm run operator:dashboard -- --markdown --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-18.md` | Regenerado em `4470e2e6702f17099d6feb137ba03ff00582c202`; painel pronto verdadeiro, publicação pronta falso porque os gates de lançamento, npm, plugin, faturamento e anúncio estão aguardando aprovação; 0 PRs, 0 issues e 0 lacunas de discussão permanecem nos repos rastreados; evidência enterprise do AgentShield inclui `840952a`; o gate de pagamentos nativos das ECC Tools agora nomeia o bloqueador ITO-61 narrowed: criar ou verificar billing-state alvo Pro gerenciado pelo Marketplace com proveniência de webhook, configurar a conta alvo e `INTERNAL_API_SECRET`, depois reexecutar readback do alvo e o gate de anúncio ao vivo |

Os repositórios rastreados na auditoria de plataforma e sincronização de itens de trabalho foram:

- `affaan-m/everything-claude-code`
- `affaan-m/agentshield`
- `affaan-m/JARVIS`
- `ECC-Tools/ECC-Tools`
- `ECC-Tools/ECC-website`

## Lote de Merge e Triagem

| Item | Resultado |
| --- | --- |
| PR #1970 | Mergeadas correções do validador de segurança de workflow para bypasses de checkout `write-all` e `refs/pull/*` com aspas; main inclui `e06d0382` e `7bb31720` desse slice |
| PR #1971 | Mergeadas correções de relatório de custos da bridge de métricas, comportamento de varredura completa do arquivo de custos e deduplicação de avisos persistentes nos subprocessos de hook; main inclui commits através de `9b1d8918` |
| PR #1972 | Mergeado `skills/uncloud/SKILL.md` com estrutura de ativação e referências de comando uncloud; main inclui `8b6aed0`, `2e5f30f` e `caee7cf` |
| PR #1973 | Mergeada remoção do `skills/strategic-compact/suggest-compact.sh` obsoleto após confirmar que o hook ativo é `scripts/hooks/suggest-compact.js`; main remoto inclui `812d4d06` |
| Issue #1974 | Fechado após verificar que o `origin/main` atual já lê a última linha acumulada de custo da bridge de métricas e testes focados de custo/métricas passam |
| Atualização de catálogo/operador | Enviado `81fca2ce` para atualizar a contagem do catálogo gerado, o ledger de URLs e o estado do painel do operador após #1973/#1974 |
| PR #1976 | Mergeado hardening de resposta de provedor para provedores compatíveis com OpenAI e AstraFlow; main inclui guards de acompanhamento `eb0d8939` para escolhas de provedor vazias/filtradas, `response.usage` OpenAI ausente, texto de erro de resposta filtrada compartilhada e validação de construção de provedor sem credenciais |
| Validação de guard de provedor | `uv run --extra dev pytest -q tests/test_provider_tools.py tests/test_astraflow_provider.py`, `uv run --extra dev pytest -q`, `node tests/run-all.js` e `git diff --check` passaram antes de mergear o acompanhamento #1976 no main: 11 testes Python focados em provedor, 76 testes Python completos, 2509 testes Node e verificações de espaços em branco limpas |
| Hardening do scanner IOC defensive-deny | Enviado `04d4d819` para que entradas de IOC `permissions.deny` explícitas do Claude sejam tratadas como controles defensivos enquanto o mesmo IOC ainda falha em hooks, tasks, scripts, locks e arquivos de payload; `npm test` local passou 2511/2511 e CI no head atual `26017368895` passou 37/37 |
| Checklist de publicação de nome/plugin do lançamento | Enviado `6c0fbfb6` para adicionar `docs/releases/2.0.0-rc.1/release-name-plugin-publication-checklist-2026-05-18.md`; o artefato congela rc.1 como Everything Claude Code / ECC, mantém npm `ecc-universal`, mantém o slug `ecc` dos plugins Claude/Codex, cita caminhos de publicação de plugin Anthropic/OpenAI atuais e bloqueia ações de renomeação/publicação npm/tag de plugin/submissão/faturamento/social até que evidências finais de lançamento existam; CI do GitHub Actions `26034898420` passou |
| Aplicação de checklist do painel e preview pack | Adicionado `680aeff0` para que `scripts/operator-readiness-dashboard.js` e `scripts/preview-pack-smoke.js` exijam o checklist de publicação de nome/plugin do lançamento; testes locais de painel e smoke passaram e o smoke do preview pack agora aplica 26 artefatos obrigatórios |
| Mirror de evidência enterprise do AgentShield | Adicionado `2ba0c62d` e atualizado o gerador de painel/roadmap GA/roadmap enterprise do AgentShield para que a evidência de lançamento do ECC nomeie os payloads de ticket de revisão de frota `840952a` do AgentShield e a cobertura atual de trilha de IOC Mini Shai-Hulud |
| PR #1978 | Fechado PR amplo/com falhas de harness Excel externo após revisão; registrado um caminho de divisão correto para uma futura proposta menor de harness Excel, PR de alvo de instalação/ferramentas, PR de runtime de plugin e PR de automação de tradução |
| Rastreamento de rascunho de anúncio | Adicionado `docs/drafts/release-1.10.1-announcement.md` para que o rascunho do anúncio de estabilização seja rastreado em vez de permanecer como estado local não rastreado bloqueador do lançamento |
| Smoke do preview pack na worktree limpa | Worktree separada em `680aeff0fb9a8598858e3105ba4742973ef386ab`; `node scripts/preview-pack-smoke.js --root <worktree> --format json` passou 5/5 com digest `0ed831dbd0cf`; 26 artefatos obrigatórios, comandos de verificação final, limite de sanitização pública do Hermes e bloqueadores de publicação aguardando aprovação foram todos preservados |
| Filas públicas | Reverificadas após o lote de merge e fechamento de issues; 0 PRs, 0 issues e 0 lacunas de discussão permanecem nos repos rastreados |
| Escopo de publicação OIDC do lançamento | Enviado `7911af4a` para manter o caminho de publicação confiável do workflow de lançamento com escopo para publicação de lançamento em vez de ampliar permissões OIDC para jobs não relacionados; a validação de segurança de workflow local passou |
| Normalização de workflow de lançamento | Enviado `97567a91` para normalizar as quebras de linha do workflow de lançamento após o slice de hardening OIDC; CI no head atual `26050727969` passou para `97567a91e79e1ee4c291eb78f5f9c30c2046ac94` |
| Atualização de evidência de prontidão do operador | Enviados `0f1775e3`, `fe7b4f2b` e `67e63e63` para atualizar evidências do bloqueador, regenerar o painel do operador e alinhar a prontidão de publicação com as evidências mais recentes de CI/segurança; enviado `4470e2e6` para fechar a evidência do caminho de publicação ITO-46, depois regenerado o painel em `4470e2e6702f17099d6feb137ba03ff00582c202`; CI no head atual `26057806361` passou para `4470e2e6702f17099d6feb137ba03ff00582c202` |

## Evidência de Cadeia de Suprimentos e Segurança

| Gate | Comando | Resultado |
| --- | --- | --- |
| Varredura IOC do repo | `npm run security:ioc-scan` | Passou; 198 arquivos inspecionados |
| Varredura IOC de persistência doméstica | `node scripts/ci/scan-supply-chain-iocs.js --home --json` | Passou; 200 arquivos inspecionados; `findings: []` |
| Reverificação IOC do workspace ECC | `node scripts/ci/scan-supply-chain-iocs.js --root <local ECC root> --home --json` | Passou; 1212 arquivos inspecionados; `findings: []`; o caminho local exato é mantido fora das evidências de lançamento público |
| Varredura estreita de persistência ativa | Busca direcionada sobre caminhos de campanha Claude, VS Code, LaunchAgent/systemd, local-bin, `/tmp` e `/private/tmp` em nível de usuário | Alvos ativos existentes: 2; sem correspondências de marcador de campanha |
| Testes de fixtures do scanner | `node tests/ci/scan-supply-chain-iocs.test.js` | 20 passados, 0 falhas, incluindo cobertura de passagem de Claude deny-wall defensivo e falha-fechada de hook-com-mesmo-IOC |
| Atualização de fonte de aviso | `node scripts/ci/supply-chain-advisory-sources.js --refresh --json` | Pronto com 9 fontes; a atualização ao vivo produziu 1 aviso de URL OpenAI do Node fetch enquanto as fontes primárias TanStack, GitHub advisory, StepSecurity, Wiz, Socket, npm e CISA retornaram OK |
| Instalação sem ciclo de vida | `npm ci --ignore-scripts` | Concluído sem problemas; 213 pacotes instalados, 0 vulnerabilidades |
| Auditoria npm | `npm audit --audit-level=high` | 0 vulnerabilidades |
| Assinaturas npm | `npm audit signatures` | 213 assinaturas de registro verificadas; 17 atestados verificados |
| Segurança de workflow | `node scripts/ci/validate-workflow-security.js` | Validados 8 arquivos de workflow após o hardening de escopo de publicação OIDC do lançamento |
| Varredura de projeto AgentShield | `npx --no-install ecc-agentshield scan --format json` | Grau A / 99; 0 críticos, 0 altos, 0 médios; 6 descobertas baixas de telemetria/governança de skill de exemplo em documentos |
| Varredura de segurança CI no head atual | `gh run view 26057806361 --repo affaan-m/everything-claude-code --json status,conclusion,headSha,jobs,url` | Concluído com sucesso para `4470e2e6702f17099d6feb137ba03ff00582c202`; 37/37 jobs CI passaram, incluindo lint, validação de workflow/componente, cobertura, testes de gerenciador de pacotes multiplataforma, auditoria npm e varredura IOC da cadeia de suprimentos |
| Último Supply-Chain Watch | `gh run view 26010432490 --repo affaan-m/everything-claude-code --json status,conclusion,headSha,url` | Concluído com sucesso para `25ac57ac40e9fc5a0606e76e6339e72c79748c99`; reexecute do commit final de lançamento antes da publicação |

## Atualização do Caminho de Publicação ITO-46

| Gate | Comando | Resultado |
| --- | --- | --- |
| Linha de base limpa do caminho de publicação | `git status --short --branch`; `git rev-parse HEAD`; `git remote get-url origin` | `main` limpo em `67e63e63f9bfd074bd6a21bf6bac71f3dfefa58b`; remote `https://github.com/affaan-m/everything-claude-code.git` |
| Readback de identidade de pacote/plugin | `node -p "JSON.stringify({pkg, claude, codex, opencode}, null, 2)"` | `ecc-universal@2.0.0-rc.1`; plugin Claude `ecc@2.0.0-rc.1`; plugin Codex `ecc@2.0.0-rc.1`; pacote OpenCode `ecc-universal@2.0.0-rc.1` |
| Disponibilidade de nome | `npm view ecc name version description repository.url --json`; `npm view @affaan-m/ecc name version --json`; `npm view ecc-universal name version dist-tags --json` | `ecc` está ocupado pelo pacote não relacionado `ecc@0.0.2`; `@affaan-m/ecc` retorna 404; o registro `ecc-universal` latest permanece `1.10.0` sem dist-tag `next` |
| Testes de manifest de plugin | `node tests/plugin-manifest.test.js` | 54 passados, 0 falhas |
| Testes de superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | 21 passados, 0 falhas |
| Validação do plugin Claude | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin validate .`; `claude plugin tag .claude-plugin --dry-run` | Claude Code `2.1.143`; validação do manifest passou; validação completa do plugin passou com um aviso esperado de contexto `CLAUDE.md` raiz; o dry run de tag criaria `ecc--v2.0.0-rc.1` |
| Ajuda de fonte do marketplace Claude | `claude plugin marketplace add --help`; `claude plugin marketplace update --help` | Marketplace add suporta URL, caminho local, repo GitHub, `--scope` e `--sparse`; update suporta atualização direcionada ou de todos os marketplaces |
| Ajuda do marketplace Codex | `codex plugin marketplace add --help` | Codex CLI `0.131.0`; marketplace add suporta caminhos locais, `owner/repo[@ref]`, URL Git HTTPS, URL Git SSH, `--ref` e `--sparse` |
| Smoke local do marketplace Codex | `HOME="$(mktemp -d)" codex plugin marketplace add ./` | Adicionado marketplace `ecc` do checkout local sem tocar na configuração real do Codex |
| Smoke do marketplace Codex via ref do GitHub | `HOME="$(mktemp -d)" codex plugin marketplace add affaan-m/everything-claude-code --ref "$(git rev-parse HEAD)"` | Adicionado marketplace `ecc` do repo público do GitHub fixado em `67e63e63f9bfd074bd6a21bf6bac71f3dfefa58b` sem tocar na configuração real do Codex |
| Dry-run do pacote npm | `NPM_CONFIG_USERCONFIG=/dev/null npm pack --dry-run --json`; `NPM_CONFIG_USERCONFIG=/dev/null npm publish --tag next --dry-run` | Pack produziu `ecc-universal-2.0.0-rc.1.tgz`, 2228 arquivos, 4.348.504 bytes empacotados, 13.024.929 bytes desempacotados, shasum `29d6a17029d80f5cb1df068880ba86c55a5d60f1`; o dry-run de publicação publicaria `ecc-universal@2.0.0-rc.1` com a tag `next` |
| Build do pacote OpenCode | `npm run build:opencode` | Passou |
| Smoke do preview pack | `npm run preview-pack:smoke` | Pronto sim; digest `0ed831dbd0cf`; 5 passados, 0 falhas |
| Verificação de documentação oficial | Anthropic `https://code.claude.com/docs/en/plugins` e `https://code.claude.com/docs/en/plugin-marketplaces`; OpenAI `https://developers.openai.com/codex/plugins/build` | Anthropic documenta fontes de marketplace self-hosted; OpenAI documenta marketplaces de repo/pessoais e o Diretório Oficial de Plugins. O ECC não criou uma tag de lançamento real, listagem oficial ou publicação npm nesta passagem |
| Fechamento do ITO-46 | Comentário Linear ITO-46 `9ef92056-ab23-4eed-bfdb-932dddc2b056`; status da issue Linear `Done`; GitHub Actions `26057806361` | Os docs do caminho de publicação agora registram cada canal, conflitos de nome, comandos de dry-run de pacote/plugin e registro de bloqueadores; a distribuição via marketplace de repo do Codex está verificada mas a listagem oficial no Diretório de Plugins não é reivindicada antes das evidências de submissão/listagem da OpenAI |

## Sincronização de Progresso Linear

| Superfície | Evidência |
| --- | --- |
| Comentários de issue ITO-57 | `0b9931b9-1556-4ebc-a70c-f3635557625d` registra contagens da fila de 18 de maio, evidências de merge #1970/#1971/#1972/#1976, verificação da cadeia de suprimentos, URL de CI no head atual, gates adiados e próximos slices; resposta `6fa15367-d994-4e53-ade3-9462477e1100` registra a reverificação expandida TanStack/Mini Shai-Hulud, correção do scanner defensive-deny, CI no head atual `26017368895` e auditoria de plataforma pós-envio; comentário `3fe5b2b7-c4fe-401c-a317-b40d72119cb3` registra a atualização de emergência final contra `97567a91`, AgentShield `4e36aab`, varreduras de workspace ECC/Ito/Documents limpas, ausência de artefatos dead-man/persistência e postura de gerenciador de pacotes/Claude deny-wall; comentário `43837404-c01c-4aaa-b5e2-1e784c136d69` registra o alerta 44 `brace-expansion` das ECC-Tools corrigido em `e56fc1a` com CI `26054671308` e API do Dependabot `state: fixed` |
| Status da issue ITO-52 | `f2e5a208-de91-4a3a-960b-5362d12aa5a4` registra controles de feedback de aprendizado em equipe `69ca535` das ECC-Tools, verificação local e CI `26054455434`; Linear ITO-52 está Done |
| Status da issue ITO-61 | `6904e4fb-bec7-4787-90e2-759f077a628c` registra o bloqueador de readback de pagamentos nativos narrowed: o Wrangler OAuth agora funciona, o readback agregado está limpo, mas ainda não há billing-state alvo Pro gerenciado pelo Marketplace com proveniência de webhook e o preflight de anúncio local está faltando a conta alvo mais `INTERNAL_API_SECRET` |
| Comentário do projeto da plataforma ECC | `e32e5b7a-287b-4bf4-9ed7-314389a157e1` registra o estado anterior de fila pública atual, segurança, #1976 e gates restantes a nível de projeto; comentários ITO-44 de acompanhamento `a01eeef3-c69b-48c0-8804-a4682acfc1ef` e `6b0885cc-c4e9-40db-899b-f7b88b4aa046` registram a conclusão do ITO-52 e o alerta Dependabot das ECC-Tools corrigido |
| Ressalva sobre atualização de status do projeto | O Linear retornou "Project status updates are not enabled for this workspace"; o comentário do projeto foi usado como superfície de status suportada |

## Bloqueadores Atuais de Publicação

- O pré-lançamento `v2.0.0-rc.1` no GitHub ainda não foi criado nesta passagem.
- O npm `ecc-universal@2.0.0-rc.1` ainda não foi publicado com a dist-tag `next`.
- A tag do plugin Claude e a propagação no marketplace permanecem aguardando aprovação.
- A distribuição via marketplace de repo do plugin Codex está verificada para rc.1, mas a
  publicação oficial no Diretório de Plugins permanece bloqueada na superfície de publicação
  de autoatendimento da OpenAI.
- O texto de faturamento/pagamentos nativos das ECC Tools permanece bloqueado até que um
  caminho de compra/webhook do Marketplace Pro escreva proveniência `billing-state:*` de produção
  pronta para a conta de teste do Marketplace alvo, depois
  `npm run billing:kv-readback -- --account <github-login> --require-ready`
  com autenticação API do Cloudflare funcionando ou Wrangler OAuth reparado, seguido por
  `npm run billing:announcement-gate -- --account <github-login>`, retornem
  gates prontos para anúncio. O readback agregado mais recente do Wrangler OAuth encontrou
  256 registros `account-billing:*`, 256 registros `billing-state:*`, 197
  registros de origem Marketplace, 59 registros de origem Stripe, 53 registros Pro, 4
  registros de proveniência de webhook do Marketplace, todos `Open Source`, 0 estados Marketplace Pro,
  0 estados Marketplace Pro prontos e 0 falhas de parse. O commit `632e059` das ECC-Tools
  adiciona o modo de readback de conta alvo de acompanhamento, edita o login da conta e os nomes
  de chave KV brutos e exige ambas as famílias de chaves alvo antes que `--require-ready` possa passar.
  O commit `13cd3fc` das ECC-Tools normaliza a caixa das chaves billing-state. A última tentativa
  ITO-61 falha porque nenhum estado Marketplace Pro gerenciado existe e o preflight de anúncio
  está faltando a conta alvo mais `INTERNAL_API_SECRET`; o ITO-61 Linear rastreia
  os critérios exatos de aceitação da conta alvo.
- As notas de lançamento, X, LinkedIn, lançamento no GitHub e texto longo ainda precisam de URLs
  ao vivo finais após as URLs de lançamento/pacote/plugin existirem.
- O checkout local está limpo após a atualização do painel/evidência, mas uma passagem de
  lançamento com checkout estritamente limpo continua sendo necessária antes da publicação real.

## Resultado

A fila pública de PRs, fila de issues, fila de discussões, bridge de itens de trabalho local,
gate de publicação de nome/plugin do lançamento e loop de proteção Mini Shai-Hulud/TanStack estão
atuais em 18 de maio de 2026 para o `main` atual através de `97567a91`, com hardening do gate de
faturamento das ECC Tools de acompanhamento em `632e059` e hardening de segurança/enterprise
do AgentShield através de `4e36aab`.
Isso melhora a prontidão de publicação mas não substitui as etapas de lançamento, pacote, plugin,
faturamento e anúncio aguardando aprovação em `publication-readiness.md`.
