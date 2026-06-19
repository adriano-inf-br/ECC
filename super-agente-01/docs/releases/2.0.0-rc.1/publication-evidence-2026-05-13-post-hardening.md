# ECC v2.0.0-rc.1 Evidência de Publicação - 2026-05-13 Pós-Hardening

Esta é apenas uma evidência de prontidão para lançamento. Ela não cria um lançamento no GitHub,
publicação no npm, tag de plugin, submissão ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Base upstream main | `209abd403b7eaa968c6d4fa67be82e04b55706d6` |
| Branch de evidência | `docs/post-hardening-release-evidence-20260513` |
| Escopo da evidência | `main` atual após PR #1850 e PR #1851 |
| Remote Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Ressalva sobre status local | A árvore de trabalho tinha o diretório não rastreado sem relação `docs/drafts/` |

O operador real do lançamento deve repetir estas verificações a partir do commit de lançamento
final com um checkout limpo antes de publicar.

## Estado da Fila e Lançamento

| Superfície | Comando | Resultado |
| --- | --- | --- |
| PRs e issues do GitHub | `gh pr list` / `gh issue list` nos repos trunk, AgentShield e JARVIS | 0 PRs abertos e 0 issues abertos nos repos acessíveis `affaan-m` |
| Discussões do trunk | Contagem de discussões GraphQL para `affaan-m/everything-claude-code` | 0 discussões abertas |
| Alertas do Dependabot | API de alertas do Dependabot para trunk, AgentShield e JARVIS | 0 alertas abertos |
| Estado do lançamento | `gh release view v2.0.0-rc.1` | Ainda não criado; o lançamento permanece aguardando aprovação |

Os contadores de repos da organização ECC-Tools não foram reverificados pelo token
GraphQL atual nesta passagem porque o token não consegue resolver esses repos da org.
O handoff anterior de checkout local pós-#42 registrou ambos os repos ECC-Tools com
0 PRs abertos e 0 issues abertos.

## Hardening Aplicado Desde a Evidência Anterior

| PR | Commit de merge | Evidência |
| --- | --- | --- |
| #1850 | `248673271455e9dc85b8add2a6ab76107b718639` | Removido acesso à ferramenta `Bash` dos agents analisadores somente leitura e cópias zh-CN; descobertas altas do AgentShield nessa superfície caíram de 21 -> 18 sem novas descobertas altas |
| #1851 | `209abd403b7eaa968c6d4fa67be82e04b55706d6` | Desativada a persistência de credenciais do `actions/checkout` em workflows com permissão de escrita e adicionada uma regra de validador de segurança de workflow para manter essa proteção em vigor |

## Evidência dos Comandos Obrigatórios

| Evidência | Comando | Resultado |
| --- | --- | --- |
| Auditoria do harness | `npm run harness:audit -- --format json` | `overall_score: 70`, `max_score: 70`, sem ações principais |
| Scorecard do adaptador | `npm run harness:adapters -- --check` | `Harness Adapter Compliance: PASS`; 11 adaptadores |
| Prontidão de observabilidade | `npm run observability:ready -- --format json` | `overall_score: 21`, `max_score: 21`, `ready: true`, sem ações principais; inclui Release Safety 3/3 |
| Validador de segurança de workflow | `node scripts/ci/validate-workflow-security.js` | Validados 7 arquivos de workflow |
| Testes do validador de workflow | `node tests/ci/validate-workflow-security.test.js` | Passaram 14/14 |
| Superfície de lançamento | `node tests/docs/ecc2-release-surface.test.js` | Passaram 18/18 |
| Superfície de pacote | `node tests/scripts/npm-publish-surface.test.js` | Passaram 2/2 |
| Suíte raiz | `node tests/run-all.js` | Passaram 2381/2381, 0 falhas |
| Lint de Markdown | `npx markdownlint-cli '**/*.md' --ignore node_modules --ignore docs/drafts` | Passou |
| Superfície Rust | `cd ecc2 && cargo test` | Passaram 462/462; apenas avisos para funções/campos não utilizados |
| Verificações de Segurança do GitGuardian | Verificação do GitHub nos PRs de segurança pós-hardening | Passou antes do merge |

## Evidência da Cadeia de Suprimentos

| Superfície | Comando ou verificação | Resultado |
| --- | --- | --- |
| Auditoria local de vulnerabilidades npm | `npm audit --json` | 0 vulnerabilidades |
| Auditoria local de assinaturas npm | `npm audit signatures` | 241 assinaturas de registro verificadas e 30 atestados verificados |
| Auditoria de avisos Rust | `cd ecc2 && cargo audit -q` | Passou silenciosamente |
| Verificação de IOC TanStack / Mini Shai-Hulud | Grep para namespaces de pacotes afetados, nomes de arquivos de payload e marcador de commit conhecido | Sem dependência de runtime ou lockfile nos pacotes afetados; sem correspondências de IOC do worm |
| Verificações de Segurança do GitGuardian | Verificação do GitHub nos PRs de segurança pós-hardening | Passou antes do merge |

## Mapeamento de Avisos Externos

O incidente TanStack de maio de 2026 mapeia para o risco de lançamento do ECC através de três
classes de workflow:

- workflows `pull_request_target` que executam ou fazem checkout de código de PR não confiável;
- caches de dependência compartilhados cruzando fronteiras de confiança entre fork, base e workflow de lançamento;
- jobs de lançamento com tokens graváveis ou tokens OIDC expostos a execução de processos subsequentes.

As proteções atuais do ECC cobrem essas classes através de:

- rejeição de refs de checkout não confiáveis em workflows `workflow_run` e `pull_request_target`;
- rejeição de caches compartilhados em workflows `pull_request_target` e `id-token: write`;
- obrigatoriedade de `npm audit signatures` quando workflows executam `npm audit`;
- obrigatoriedade de `npm ci --ignore-scripts` em workflows com permissões de escrita;
- obrigatoriedade de `persist-credentials: false` no `actions/checkout` em workflows com permissões de escrita.

## Bloqueadores Que Ainda Requerem Aprovação ou Ação Externa

- Criar ou verificar o pré-lançamento `v2.0.0-rc.1` no GitHub.
- Publicar `ecc-universal@2.0.0-rc.1` com a dist-tag npm `next`.
- Criar e enviar a tag do plugin Claude somente após aprovação explícita.
- Confirmar o caminho de submissão ao marketplace ao vivo Claude/Codex/OpenCode ou registrar
  o proprietário e status da submissão manual.
- Verificar as alegações de faturamento/App/Marketplace das ECC Tools antes de usá-las no
  texto de lançamento.
- Atualizar o texto de anúncio com URLs ao vivo após o lançamento e após as URLs de pacote/plugin existirem.
