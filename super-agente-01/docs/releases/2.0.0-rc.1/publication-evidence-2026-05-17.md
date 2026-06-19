# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-17

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Upstream main | `e6c16b40b80b3b323586c9e8341faa87c01a728c` |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Escopo da evidência | `main` atual após o lote de merge de localização japonesa e tailandesa, reparo de âncora markdown ja-JP pós-merge, suporte ao alvo de instalação Zed, reverificação de proteção Mini Shai-Hulud/TanStack, cobertura de IOC de armazenamento de tokens `gh-token-monitor`, mirror de saída de Action de promoção de política do AgentShield, mirror de rastreamento de auditoria do juiz de promoção hospedado das ECC-Tools, mirror de preflight de anúncio de faturamento das ECC-Tools, mirror de estado de readback do Marketplace de produção das ECC-Tools, roteamento de painel legacy-tail, prontidão de progresso Linear e o gate de smoke determinístico do preview pack |
| Ressalva sobre status local | `git status --short --branch` mostrou `## main...origin/main` mais `docs/drafts/` não rastreado sem relação; os arquivos de evidência gerados são commitados após o snapshot de origem que descrevem |

O operador real do lançamento deve repetir todas as verificações voltadas para publicação a partir do
commit de lançamento final com um checkout estritamente limpo antes de publicar.

## Estado da Fila e Discussão

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs do trunk | `gh pr list --state open --limit 50 --json number,title` | 0 PRs abertos |
| Issues do trunk | `gh issue list --state open --limit 50 --json number,title` | 0 issues abertos |
| Auditoria de plataforma | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Pronto; repos rastreados reportam 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 Q&A respondíveis sem respostas aceitas e 0 arquivos bloqueadores sujos |
| Painel do operador | `npm run operator:dashboard -- --markdown --allow-untracked docs/drafts/ --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-17.md` | Gerado painel atual para `e6c16b40b80b3b323586c9e8341faa87c01a728c`; painel pronto verdadeiro, publicação pronta falso porque os gates de lançamento, npm, plugin, faturamento e anúncio estão aguardando aprovação |

Os repositórios rastreados na auditoria de plataforma foram:

- `affaan-m/everything-claude-code`
- `affaan-m/agentshield`
- `affaan-m/JARVIS`
- `ECC-Tools/ECC-Tools`
- `ECC-Tools/ECC-website`

## Lote de Merge e Triagem

| Item | Resultado |
| --- | --- |
| Issue #1957 | Fechado com orientação do mantenedor após confirmar que o README e docs de hooks já documentam a instalação manual de hooks suportada |
| Issue #1958 | Fechado no lote de fila anterior após a varredura IOC da cadeia de suprimentos e a passagem de proteção |
| PR #1962 | Fechado em vez de mergeado porque o ESLint 10 requer uma faixa de engine Node mais recente do que o contrato de suporte Node 18 atual |
| PR #1961 | Mergeado TypeScript 6.0.3 como `344a9bdf9c45c7589dedd3c66a8a2ebf2cbf2e5b`; patch do mantenedor adicionou tipos Node ao `.opencode/tsconfig.json`; matriz completa do GitHub Actions passou |
| PR #1963 | Mergeado `@types/node` 25.8.0 como `b66ae3fbe070ef1fd2b610b4011f1345b4d75875`; patch do mantenedor sincronizou o lockfile npm; matriz completa do GitHub Actions passou |
| PR #1953 | Mergeada localização japonesa como `9495b109e2c5fc5b1044ddfa1e2179f9d4aa86be`; patches do mantenedor corrigiram links de segurança/patrocínio localizados, traduziram os itens frontmatter reportados pelo cubic, confirmaram que a paridade `docs/zh-CN` para `docs/ja-JP` tem 0 arquivos ausentes e aprovaram após CodeRabbit, GitGuardian e cubic passarem |
| Correção trunk pós-merge | Enviado `afe0ae8d725f7773147dc4aa7943a45846853a0d` para remover âncoras intra-arquivo quebradas de `docs/ja-JP/skills/autonomous-loops/SKILL.md`; isso restaurou o lint raiz no `main` após o PR #1953 |
| Issue #1951 | Fechado automaticamente como concluído quando o PR #1953 foi mergeado |
| Commit do adaptador Zed | Enviado `2371a3cf0543365c1c18e84eba786b1abcb28941` para adicionar suporte Zed local ao projeto através do alvo de instalação seletiva, orientação README do Zed e cobertura de planejamento `.zed/settings.json` |
| Correção CI Windows do Zed | Enviado `744f4169972fd81618c3114ea1ca5ffb85ef4c82` para normalizar a asserção de caminho de origem do plano de instalação do Zed entre separadores de caminho Windows |
| Discussão #1896 | Adicionada atualização do mantenedor confirmando suporte Zed no `main`, documentando o comando dry-run e esclarecendo que segredos BYOK/OpenRouter ficam nas configurações de usuário Zed/local em vez de arquivos de projeto gerenciados pelo ECC |
| PR #1967 | Mergeada localização tailandesa como `6b282aaa4389e9411e86bfe09d8f4de8018dcf8e` após aplicar os dois comentários de limpeza do mantenedor, validar markdownlint e cobertura do seletor de idioma, e aprovar após CodeRabbit, GitGuardian, Greptile e cubic passarem no head atual |
| Slice do scanner de armazenamento de tokens da cadeia de suprimentos | Enviado `36d390aa7d733d458963a203b91998d3aec477b2` para detectar o armazenamento de tokens dead-man-switch `~/.config/gh-token-monitor/token` do Mini Shai-Hulud, atualizar o manual de resposta a incidentes e adicionar cobertura de fixtures; as varreduras locais permaneceram limpas e o GitHub Actions `26003629550` passou |
| Slice do painel legacy-tail | Enviado `f397216aee5a0ca7d168726d3cc41eb47f728b37` e commits de regeneração do painel para manter evidências de cauda de localização anexadas ao ITO-55 e evitar que trabalho legado obsoleto seja tratado como lançamento atual |
| Slice de prontidão de progresso Linear | Enviado `355c4f128183aa7f7ce9da9485af07d257d67f69` e commit de regeneração do painel `1a384dc5dbd24a3be725e1b26c169bddb6c850b6` para exigir evidências de progresso Linear atualizadas após lotes de merge significativos |
| Slice de smoke do preview pack | Enviado `3215e655eff70b9fea5382ce5996666a1f48d1af` para adicionar `npm run preview-pack:smoke`, cobrindo artefatos do preview pack, limites de importação Hermes, comandos de verificação e bloqueadores de publicação aguardando aprovação; commits de lint e acompanhamento do painel pousaram através de `27dc2918a24a50b8dd5e23dba2aa6a05bd17c0d7` |
| Slice de saída de hardening enterprise do AgentShield | Enviado AgentShield `1124535345d7040242ecd3803f65bcd4dcaf6ec2` para expor saídas de status/contagem de hardening do gerenciador de pacotes e evidências resumidas de job do GitHub Action editadas para credenciais de registro, desvio de script de ciclo de vida e desvio de gate de idade de lançamento |
| Slice de saída de Action de promoção de política do AgentShield | Enviado AgentShield `1593925dca025632dd8a6454509fce3fe7517cdf` para expor saídas de status/contagem/digest de promoção de política mais itens de revisão de resumo de job do GitHub Action para aprovação do proprietário, rollout protegido e smoke de runtime; o mesmo job de Action marca o smoke de runtime verificado quando escaneia com a política promovida |
| Slice de telemetria de promoção de política das ECC-Tools | Enviado ECC-Tools `86589517b11b95f1b0216ae7737563fb67ee1604` para rotear saídas de Action de promoção de política do AgentShield para descobertas de revisão de segurança hospedadas e pontuação de Prontidão de Promoção Hospedada |
| Slice de UX do operador de promoção de política das ECC-Tools | Enviado ECC-Tools `16c537fd385458c438ff32fb4211079b2f8ea1c4` para renderizar status de saída de Action de promoção de política, pacote, contagem de itens de revisão, contagem de ações restantes e digest em comentários de jobs de segurança hospedados e check-runs |
| Slice de rastreamento de auditoria do juiz de promoção hospedado das ECC-Tools | Enviado ECC-Tools `05d4e8296e37ba72e471beaa23ea4c81eb2aa31f` para renderizar impressões digitais de solicitação do juiz de promoção hospedado e rastreamentos de auditoria de citações permitidas sem expor saída bruta do provedor |
| Slice de preflight de anúncio de faturamento das ECC-Tools | Enviado ECC-Tools `91a441b92342b842832ac28b018ee46f0c4a906f` para adicionar `npm run billing:announcement-gate -- --preflight` para verificação de entrada e endpoint de readback do Marketplace de forma segura antes de chamadas de API privilegiadas |
| Slice de estado de readback do Marketplace de produção das ECC-Tools | Enviado ECC-Tools `eb6941290b2fa70db01a51084e9e79a160238468` para registrar que os nomes de segredos do Cloudflare de produção incluem `INTERNAL_API_SECRET`, mas o KV de produção atualmente não tem registros `account-billing:*` ou `billing-state:*` |

## Comandos do Gate de Lançamento

| Gate | Comando | Resultado |
| --- | --- | --- |
| Lint raiz | `npm run lint` | Passou após o reparo de âncora autonomous-loop ja-JP |
| Suíte raiz | `npm test` | 2487 passados, 0 falhas |
| CI do GitHub Actions | `gh run view 25989533576 --json status,conclusion,jobs` | Concluído com sucesso com 37/37 jobs verdes, incluindo Security Scan e todos os jobs de teste Windows |
| Auditoria do harness | `node scripts/harness-audit.js --format json` | 70/70, sem ações principais |
| Prontidão de observabilidade | `npm run observability:ready -- --format json` | 21/21, pronto sim |
| Segurança de workflow | `node scripts/ci/validate-workflow-security.js` | Validados 8 arquivos de workflow |
| Varredura IOC da cadeia de suprimentos | `node scripts/ci/scan-supply-chain-iocs.js --root ~/GitHub --home --json`; `node scripts/ci/scan-supply-chain-iocs.js --root ~/Documents/GitHub --home --json` | Passou; cada varredura de workspace inspecionou 1.879 arquivos com 0 descobertas, incluindo alvos de persistência em nível de usuário |
| Auditoria npm | `npm audit --audit-level=high` | 0 vulnerabilidades |
| Assinaturas npm | `npm audit signatures` nos repos `agentshield`, `everything-claude-code`, `ECC-Tools`, `ECC-website` e `JARVIS/frontend` | Passou nos principais roots de pacote Node ECC |
| Smoke do preview pack | `npm run preview-pack:smoke` | Passou; pronto sim; digest `dfb1ed014607`; 5 verificações passadas e 0 falhas |
| Slice de saída de CI enterprise do AgentShield | `npm run build`, testes de action focados, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check` locais do AgentShield; GitHub Actions `25994354007`, `25994354011`, `25994354026` | Gates locais passaram; CI remoto, Test GitHub Action e Self-Scan concluídos com sucesso para `1124535` |
| Slice de saída de Action de promoção de política do AgentShield | `npm run build`, `npx vitest run tests/action-promotion.test.ts tests/action.test.ts`, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check` locais do AgentShield; GitHub Actions `25995929182`, `25995929190`, `25995929161` | Gates locais passaram; CI remoto, Test GitHub Action e Self-Scan concluídos com sucesso para `1593925` |
| Slice de telemetria hospedada de promoção de política das ECC-Tools | Verificações vitest focadas locais das ECC-Tools para roteamento de saída de Action de promoção de política e prontidão de promoção hospedada, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check`; GitHub Actions `25996758218` | Gates locais passaram; CI remoto concluído com sucesso para `8658951` |
| Slice de UX do operador de promoção de política das ECC-Tools | Verificações vitest focadas locais das ECC-Tools para valores de saída de Action de promoção de política em descobertas/comentários/checks hospedados, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check`; GitHub Actions `25997300046` | Gates locais passaram; CI remoto concluído com sucesso para `16c537f` |
| Slice de rastreamento de auditoria do juiz de promoção hospedado das ECC-Tools | Verificações vitest focadas locais das ECC-Tools para rastreamentos de auditoria do model-judge hospedado, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check`; GitHub Actions `25997840703` | Gates locais passaram; CI remoto concluído com sucesso para `05d4e82` |
| Slice de preflight de anúncio de faturamento das ECC-Tools | Testes de preflight vitest focados locais das ECC-Tools, `npm run typecheck`, `npm run lint`, `npm test` completo e `git diff --check`; GitHub Actions `25998238507` | Gates locais passaram; CI remoto concluído com sucesso para `91a441b` |
| Slice de estado de readback do Marketplace de produção das ECC-Tools | `npm test` e `git diff --check` locais das ECC-Tools; `wrangler secret list` do Cloudflare confirmou que `INTERNAL_API_SECRET` existe pelo nome; `wrangler kv key list` para `account-billing:` e `billing-state:` ambos retornaram listas vazias; GitHub Actions `25998610438` | Gates locais passaram; CI remoto concluído com sucesso para `eb69412`; anúncio ao vivo permanece bloqueado até que registros de compra/webhook do Marketplace populem o KV |
| Filas do GitHub | `gh pr list`; `gh issue list`; `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | 0 PRs abertos, 0 issues abertos, 0 lacunas de toque do mantenedor nas discussões, 0 Q&A respondíveis sem respostas aceitas, 0 erros de busca no GitHub e auditoria de plataforma pronta no conjunto de repos rastreados após as evidências geradas serem commitadas |
| Painel do operador | `npm run operator:dashboard -- --markdown --allow-untracked docs/drafts/ --write docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-17.md` | Painel gerado para `e6c16b40b80b3b323586c9e8341faa87c01a728c` com plataforma pronta verdadeiro, painel pronto verdadeiro e gates de publicação macro ainda incompletos |
| CI do GitHub Actions | `gh run watch 26003629550 --repo affaan-m/everything-claude-code --exit-status` | Concluído com sucesso para `36d390aa7d733d458963a203b91998d3aec477b2`, incluindo Validate Components, Lint, Security Scan, Coverage e a matriz completa de SO/Node/gerenciador de pacotes |

## Bloqueadores Atuais de Publicação

- O pré-lançamento `v2.0.0-rc.1` no GitHub ainda não foi criado nesta passagem.
- O npm `ecc-universal@2.0.0-rc.1` ainda não foi publicado com a dist-tag `next`.
- A tag do plugin Claude e a propagação no marketplace permanecem aguardando aprovação.
- A distribuição via marketplace de repo do plugin Codex está verificada para rc.1, mas a
  publicação oficial no Diretório de Plugins permanece bloqueada na superfície de publicação
  de autoatendimento da OpenAI.
- O texto de faturamento/pagamentos nativos das ECC Tools permanece bloqueado até que um
  caminho de compra/webhook do Marketplace escreva registros de produção `account-billing:*` e
  `billing-state:*`, então `npm run billing:announcement-gate --
  --account <github-login>` retorne um gate pronto para anúncio.
- As notas de lançamento, X, LinkedIn, lançamento no GitHub e texto longo ainda precisam de URLs
  ao vivo finais após as URLs de lançamento/pacote/plugin existirem.
- O checkout local ainda tem `docs/drafts/` não rastreado sem relação, portanto uma passagem de
  lançamento com checkout estritamente limpo continua sendo necessária antes da publicação real.

## Resultado

A fila pública de PRs, fila de issues e fila de discussões rastreadas estão limpas em
17 de maio de 2026, e o `main` atual passou pelos gates Node, harness, observabilidade,
segurança de workflow, auditoria/assinatura npm e IOC da cadeia de suprimentos listados acima.
Isso melhora a prontidão de publicação mas não substitui as etapas de lançamento, pacote, plugin,
faturamento e anúncio aguardando aprovação em `publication-readiness.md`.
