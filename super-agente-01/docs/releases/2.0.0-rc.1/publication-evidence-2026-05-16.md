# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-16

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Upstream main | `6bced468d76b269243a6f0bd28472853aa78e0e4` |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Escopo da evidência | `main` atual após PR #1944, PR #1945, triagem do issue #1946, PR #1947 de proteção da cadeia de suprimentos, AgentShield PR #87, AgentShield PR #88, AgentShield PR #89, AgentShield PR #90, AgentShield PR #91, AgentShield PR #92, ECC-Tools PR #76, ECC-Tools PR #77, ECC-Tools PR #78, triagem de localização japonesa, sincronização ITO-57 e atualização do painel do operador |
| Ressalva sobre status local | `git status --short --branch` mostrou `## main...origin/main` mais `docs/drafts/` não rastreado sem relação |

O operador real do lançamento deve repetir todas as verificações voltadas para publicação a partir do
commit de lançamento final com um checkout estritamente limpo antes de publicar.

## Estado da Fila e Discussão

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs do trunk | `gh pr list --state open --json number,title,url --limit 20` | 6 PRs abertos: Dependabot #1959-#1963 mais PR #1953, que permanece aberto com mudanças solicitadas para paridade de localização japonesa |
| Issues do trunk | `gh issue list --state open --json number,title,url --limit 20` | 3 issues abertos: #1951 vinculado ao PR de localização em espera, mais #1957 e #1958 aguardando o próximo lote da fila |
| Auditoria de plataforma | `node scripts/platform-audit.js --json --allow-untracked docs/drafts/` | Pronto; PRs abertos 6, issues abertos 3, lacunas de toque do mantenedor nas discussões 0, lacunas de respostas ausentes nas discussões 0, arquivos bloqueadores sujos 0 em um checkout limpo; a geração de branch atual vê as edições mirror como trabalho local sujo |
| Painel do operador | `npm run operator:dashboard -- --json --allow-untracked docs/drafts/` | `dashboardReady: true`, `platformReady: true`, head `6bced468d76b269243a6f0bd28472853aa78e0e4` |

## Lote de Merge e Triagem

| Item | Resultado |
| --- | --- |
| PR #1944 | Mergeado atualização de paleta ANSI da linha de status como `50ac061f9e72d7daa137f1bd08760cf74e9b577d`; `node tests/hooks/ecc-statusline.test.js` e `node scripts/ci/validate-hooks.js` passaram antes do merge |
| PR #1945 | Mergeada skill comunitária `recsys-pipeline-architect` como `9e973b29fb1a2a0aeb9e6980017b67c3ddb05201`; patches do mantenedor sincronizaram contagens do catálogo e removeram emojis bloqueados pela segurança Unicode |
| Issue #1946 | Fechado como triado com um comentário corrigido do mantenedor; `ITO-60` do Linear agora rastreia o UX de preflight de forçamento proativo de fatos do GateGuard |
| PR #1947 | Mergeadas evidências de vigilância/fonte de aviso agendados da cadeia de suprimentos como `4093d1bb7a14db1b4d4ea5bd00f2073baf94bfb0`; o trunk agora tem a varredura de IOC TanStack/Mini Shai-Hulud/node-ipc mais superfícies de relatório de fontes de aviso conectadas às evidências de vigilância agendadas |
| AgentShield PR #87 | Mergeada classificação de confiança de runtime de cache de plugin como `26bb44650663816d07180e0d20c1895e431a326c`; descobertas de cache de plugin Claude instalado agora emitem `runtimeConfidence: plugin-cache`, `plugins/cache` mapeia apenas para cache Claude em `.claude` e implementações de hook em cache não são mais erroneamente rotuladas como `hook-code` ativo |
| AgentShield PR #88 | Mergeada inspeção/readback de pacote de evidências como `65ed6e2a87545dc99d962b58413f49096a4d70ec`; `agentshield evidence-pack inspect` agora emite resumos JSON/texto verificados para relatório, política, linha de base, cadeia de suprimentos, contexto CI, remediação e erros de artefato malformado |
| AgentShield PR #89 | Mergeado roteamento de frota de pacote de evidências como `521ada9091bb6d818511ab8589ae675b920c106a`; `agentshield evidence-pack fleet <dirs...> [--json]` agora agrega múltiplos bundles verificados em rotas prontas, bloqueador de segurança, revisão de política, regressão de linha de base, revisão de cadeia de suprimentos e inválidas com totais de descoberta, política, linha de base, cadeia de suprimentos e remediação |
| AgentShield PR #90 | Mergeados itens de revisão de frota como `6d1c57c92000541d65a3b6bc366f0322d7d0dacc`; `agentshield evidence-pack fleet --json` agora emite `reviewItems` com rota, severidade, contexto de repositório/alvo, caminhos de evidência de origem, motivo e recomendação pronta para o proprietário, e o CLI de texto imprime um bloco `Review items` |
| AgentShield PR #91 | Mergeada exportação de política com checksum como `73e1e3586dc4513a462e39c9799f75eea104e110`; `agentshield policy export` escreve um arquivo de política JSON por pacote selecionado mais `manifest.json` com digests SHA-256 e suporta seleção de pacote, proprietários repetidos, prefixos de nome e saída JSON |
| AgentShield PR #92 | Mergeada promoção de política verificada por checksum como `e7e259dc6212b63a8e03a253ca6b8c1e3c2abff7`; `agentshield policy promote` verifica o manifest de exportação e o digest de política selecionado, rejeita JSON adulterado, requer seleção explícita de pacote para manifests de múltiplos pacotes, suporta revisão JSON de simulação e escreve a política ativa somente após verificação |
| ECC-Tools PR #76 | Mergeado consumo de resumo de frota do AgentShield como `5bde2328d15f584481fb6334e6960716dbf3e16f`; a `security-evidence-review` hospedada agora reconhece `agentshield-evidence/fleet-summary.json`, classifica como `evidence-pack-fleet`, roteia resultados de frota inválidos/bloqueadores de segurança/política/linha de base/cadeia de suprimentos para descobertas hospedadas e falha de forma fechada em JSON de frota malformado |
| ECC-Tools PR #77 | Mergeada saída de evidência de origem de descoberta hospedada como `31fd883b3f0cee135aee4839b01d34855b7867f6`; comentários de PR de jobs hospedados e detalhes de check-run agora incluem uma coluna `Evidence` com até três caminhos de evidência de origem por descoberta, incluindo descobertas derivadas de frota do AgentShield |
| ECC-Tools PR #78 | Mergeada revisão de harness de rota de frota do AgentShield como `0d4eb949aa56f56da88e6654273a22ffb95983a1`; a `harness-compatibility-audit` hospedada agora coleta resumos de frota, mapeia caminhos de alvo de rota para proprietários de harness Claude/Codex/OpenCode/MCP/plugin e emite descobertas de revisão de proprietário com caminhos de evidência de origem |
| ITO-57 | Atualizado com evidência de fonte de aviso do PR #1947, atualização de origem pós-merge, varredura IOC, verificações de auditoria/assinatura npm e ressalva de atualização do aplicativo OpenAI |
| ITO-49 | Atualizado com evidências de merge dos PRs #87, #88, #89, #90, #91 e #92 do AgentShield, evidências de testes locais, status CI, contagens de classificação de varredura `~/.claude` ao vivo, resultados de varredura de proteção Mini Shai-Hulud local e validação de promoção de política |
| ITO-50 | Atualizado com evidências de merge dos PRs #76, #77 e #78 das ECC-Tools, comportamento de revisão de segurança hospedada, comportamento de caminho de evidência de descoberta hospedada, comportamento de revisão de proprietário de rota de frota de harness, evidências de testes locais e verificações remotas de build Verify/Security Audit/Workers |
| ITO-44 | Atualizado com limpeza da fila, atualização do painel e lacunas macro restantes |

## Comandos do Gate de Lançamento

| Gate | Comando | Resultado |
| --- | --- | --- |
| Suíte raiz | `npm test` | 2469 passados, 0 falhas |
| Suíte `ecc2` Rust | `cd ecc2 && cargo test` | 462 passados, 0 falhas; apenas avisos de código morto/não utilizado existentes |
| Superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | 20 passados |
| Adaptadores de harness | `npm run harness:adapters -- --check` | PASS; 11 adaptadores |
| Auditoria do harness | `npm run harness:audit -- --format json` | 70/70, sem ações principais |
| Prontidão de observabilidade | `npm run observability:ready` | 21/21, pronto sim |
| Varredura IOC da cadeia de suprimentos | `npm run security:ioc-scan` | Passou; 227 arquivos inspecionados |
| Atualização de fonte de aviso | `npm run security:advisory-sources -- --refresh --json` | Pronto; 9 fontes ativas; payload Linear ainda aponta para `ITO-57` para sincronização |
| Auditoria npm | `npm audit --audit-level=moderate` | 0 vulnerabilidades |
| Assinaturas npm | `npm audit signatures` | 241 assinaturas de registro verificadas; 30 atestados verificados |
| Renderizador do painel | `node tests/scripts/operator-readiness-dashboard.test.js` | 7 passados, 0 falhas |

## Bloqueadores Atuais de Publicação

- O pré-lançamento `v2.0.0-rc.1` no GitHub ainda não foi criado nesta passagem.
- O npm `ecc-universal@2.0.0-rc.1` ainda não foi publicado com a dist-tag `next`.
- A tag do plugin Claude e a propagação no marketplace permanecem aguardando aprovação.
- A distribuição via marketplace de repo do plugin Codex está verificada para rc.1, mas a
  publicação oficial no Diretório de Plugins permanece bloqueada na superfície de publicação
  de autoatendimento em breve da OpenAI.
- O texto de faturamento/pagamentos nativos das ECC Tools permanece bloqueado até que o
  readback ao vivo da conta de teste gerenciada pelo Marketplace retorne um gate pronto para anúncio.
- As notas de lançamento, X, LinkedIn, lançamento no GitHub e texto longo ainda precisam de URLs
  ao vivo finais após as URLs de lançamento/pacote/plugin existirem.
- O checkout local ainda tem `docs/drafts/` não rastreado sem relação, portanto uma passagem de
  lançamento com checkout estritamente limpo continua sendo necessária antes da publicação real.

## Resultado

A fila pública de PRs, fila de issues e fila de discussões estão limpas, e o preview pack do rc.1
passou pelos principais gates Node, Rust, superfície de lançamento, harness, observabilidade
e cadeia de suprimentos em 16 de maio de 2026. Isso melhora a prontidão de publicação mas
não substitui as etapas de lançamento, pacote, plugin e anúncio aguardando aprovação em
`publication-readiness.md`.
