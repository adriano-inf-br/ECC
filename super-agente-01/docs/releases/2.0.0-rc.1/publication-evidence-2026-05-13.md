# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-13

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Base upstream main | `797f283036904128bb1b348ae62019eb9f08cf39` |
| Branch de evidência | `docs/release-readiness-20260513` |
| Escopo da evidência | `main` atual após PR #1846 mais normalização de marcadores de lista zh-CN CLAUDE somente via markdownlint |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Ressalva sobre status local | A árvore de trabalho tinha o diretório não rastreado sem relação `docs/drafts/` |

O operador real do lançamento deve repetir estas verificações a partir do commit de lançamento
final com um checkout limpo antes de publicar.

## Estado da Fila e Lançamento

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs e issues do GitHub | `gh pr list` / `gh issue list` nos repos trunk, AgentShield, JARVIS, ECC-Tools, ECC-website | 0 PRs abertos e 0 issues abertos nos repos rastreados |
| Discussões do trunk | Varredura de discussões GraphQL para `affaan-m/everything-claude-code` | As últimas 100 discussões estavam fechadas; nenhum backlog de discussão aberta encontrado |
| Gate de assinatura de auditoria npm | PR #1846 | Mergeado como `797f283`; workflows que executam `npm audit` agora precisam de `npm audit signatures` |

## Evidência dos Comandos Obrigatórios

| Evidência | Comando | Resultado |
| --- | --- | --- |
| Auditoria do harness | `npm run harness:audit -- --format json` | `overall_score: 70`, `max_score: 70`, sem ações principais |
| Scorecard do adaptador | `npm run harness:adapters -- --check` | `Harness Adapter Compliance: PASS`; 11 adaptadores |
| Prontidão de observabilidade | `npm run observability:ready -- --format json` | `overall_score: 16`, `max_score: 16`, `ready: true`, sem ações principais |
| Suíte raiz | `node tests/run-all.js` | `2376` passados, `0` falhas |
| Lint de Markdown | `npx markdownlint-cli '**/*.md' --ignore node_modules` | Passou após normalizar dois documentos zh-CN CLAUDE de marcadores asterisco para marcadores traço |
| Superfície de pacote | `node tests/scripts/npm-publish-surface.test.js` | Passaram `2/2`; a superfície de pacote ainda exclui artefatos de bytecode/cache Python |
| Superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | Passaram `18/18` |
| Superfície Rust | `cd ecc2 && cargo test` | Passaram `462/462`; apenas avisos para funções/campos não utilizados |

## Evidência do Gate de Segurança

| Superfície | Comando ou verificação | Resultado |
| --- | --- | --- |
| Auditoria local de assinaturas npm | `npm audit signatures` antes do PR #1846 | 241 assinaturas de registro verificadas e 30 atestados verificados |
| Auditoria local de vulnerabilidades npm | `npm audit --audit-level=high` antes do PR #1846 | 0 vulnerabilidades |
| Validador de segurança de workflow | `node scripts/ci/validate-workflow-security.js` | Validados 7 arquivos de workflow |
| Testes do validador de workflow | `node tests/ci/validate-workflow-security.test.js` | Passaram `11/11`, incluindo os novos casos de gate de assinatura |
| GitHub CI para #1846 | Verificações atuais de PR no head | Matriz completa de SO/gerenciador de pacotes passou, incluindo `windows-latest / Node 18.x / pnpm` |

## Bloqueadores Que Ainda Requerem Aprovação ou Ação Externa

- Criar ou verificar o pré-lançamento `v2.0.0-rc.1` no GitHub.
- Publicar `ecc-universal@2.0.0-rc.1` com a dist-tag npm `next`.
- Criar e enviar a tag do plugin Claude somente após aprovação explícita.
- Confirmar o caminho de submissão ao marketplace ao vivo Claude/Codex/OpenCode ou registrar
  o proprietário e status da submissão manual.
- Verificar as alegações de faturamento/App/Marketplace das ECC Tools antes de usá-las no
  texto de lançamento.
- Atualizar o texto de anúncio com URLs ao vivo após o lançamento e após as URLs de pacote/plugin existirem.
