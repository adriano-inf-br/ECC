# Pacote de Aprovação do Proprietário ECC v2.0.0-rc.1

Data do snapshot: 2026-05-19.

Este pacote é a folha final de decisão humana para o lançamento público do rc.1. Ele
não publica nada por si só. Use-o para aprovar, adiar ou bloquear cada
ação de release após os comandos finais de evidência serem executados novamente a partir do commit
de release pretendido.

Commit de origem para a linha de base de evidências limpa que este pacote estende:
`9819626459a662773be7d0b1c18d82c1316b8c36`.

## Evidências Atuais

| Evidência | Estado registrado atual | Repetir antes da aprovação |
| --- | --- | --- |
| Auditoria da plataforma | ready true, 0 PRs abertos, 0 issues abertas, 0 lacunas em discussions, 0 arquivos sujos | sim |
| Smoke do preview pack | ready true, digest `531328aaaa53`, 5/5 verificações | sim |
| Gate de aprovação de release | ready false, digest `ef8f49f727b7`, 4/6 verificações passaram; decisões do proprietário e readbacks de URL ao vivo pendentes | sim |
| Prerelease do GitHub | ao vivo em <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1>; prerelease true, draft false, publicado em `2026-05-25T18:29:31Z` | sim |
| Publicação npm `next` | ao vivo em <https://www.npmjs.com/package/ecc-universal/v/2.0.0-rc.1>; `next` aponta para `2.0.0-rc.1`, `latest` permanece `1.10.0` | sim |
| Suíte de vídeos | ready true, 15/15 ativos de origem, 13/13 artefatos da suíte, 12/12 candidatos à publicação | sim |
| Testes de superfície de release | 28/28 passaram após a atualização de URL/pacote em 26 de maio | sim |
| Suíte local completa | 2568/2568 passaram antes do merge do PR #2013; regressão focada do GateGuard passou 91/91 novamente antes do merge do PR #2011 | sim |
| CI do GitHub | PR #1998, PR #1999, PR #2000, PR #2001, PR #2002, PR #2004, PR #2008, `main` pós-PR #2006, PR #2009, `main` pós-PR #2009, `main` pós-PR #2011 e `main` pós-PR #2013 todos foram mergeados ou avançaram após verificações obrigatórias verdes | verificar head atual |

## Registro de Decisões

| Decisão | Aprovar / adiar / bloquear | Evidência necessária primeiro | Notas |
| --- | --- | --- | --- |
| Prerelease do GitHub | aprovar | readback de prerelease ao vivo | Ao vivo em <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1>. URLs restantes de plugin/vídeo/faturamento permanecem gateadas por aprovação. |
| Publicação npm `next` | aprovar | `npm pack --dry-run`, `npm publish --tag next`, readback de dist-tag do registry | `ecc-universal@2.0.0-rc.1` está publicado em `next`; `latest` permanece `1.10.0` durante o rc.1. |
| Tag do plugin Claude | adiar | `claude plugin validate .claude-plugin/plugin.json`, `claude plugin tag .claude-plugin --dry-run` | Criar e fazer push da tag real somente após aprovação de release. |
| Repo-marketplace do Codex | adiar | smoke de marketplace add com home temporário e status atual do Plugin Directory oficial | Reivindicar apenas distribuição via repo-marketplace; não reivindicar listagem no Plugin Directory oficial sem evidência de listagem. |
| Linguagem de faturamento das ECC Tools | adiar | readback de prontidão ao vivo para a conta alvo e estado de faturamento/produto | Não anunciar pagamentos nativos ou Marketplace gerenciado Pro até que o gate esteja ao vivo. |
| Upload de vídeo | adiar | proprietário seleciona corte primário de lançamento mais clipes curtos, autoavaliação permanece limpa | Fazer upload apenas de cortes aprovados; manter saída de linha do tempo/projeto editável preservada. |
| X, LinkedIn, Discussion do GitHub, longform | adiar | atualizações do ledger de URLs ao vivo de release, npm, plugin, vídeo e faturamento | Posts de conta pessoal e cópia de saída precisam de aprovação explícita. |
| Alcance de patrocinador, parceiro, consultoria, conferência, podcast | adiar | URLs públicas finais mais cópia de saída aprovada pelo proprietário | Não enviar rascunhos até que o proprietário aprove o lote exato. |

## Preenchimento Final de URLs

Atualizar estas superfícies após as ações de publicação aprovadas serem concluídas:

| Superfície | Fonte do valor final | Alvos de atualização |
| --- | --- | --- |
| URL de prerelease do GitHub | `gh release view v2.0.0-rc.1 --repo affaan-m/ECC --json url` | notas de release, ledger de URLs, cópia social |
| URL do pacote rc do npm | `npm view ecc-universal@2.0.0-rc.1 name version dist.tarball dist.integrity time --json` | ledger de URLs, quickstart, notas de release |
| URL da tag do plugin Claude | tag `ecc--v2.0.0-rc.1` enviada ou readback do marketplace | ledger de URLs, docs do plugin, notas de release |
| Evidência de repo-marketplace do Codex | readback de `codex plugin marketplace add <local-checkout>` com home temporário | ledger de URLs, prontidão de publicação |
| URL do vídeo de lançamento principal | vídeo de lançamento principal aprovado pelo proprietário enviado | release do GitHub, X, LinkedIn, longform |
| URLs de clipes curtos | clipes aprovados enviados | thread X, LinkedIn, pacote de parceiro/patrocinador/palestra |
| URL de faturamento/prontidão das ECC Tools | readback de prontidão ao vivo ou status bloqueado explícito | cópia de patrocinador, cópia Pro, notas de release |

## Comandos Finais de Evidência

Executar a partir do commit exato de release antes de aprovar a publicação:

```bash
git status --short --branch
node scripts/platform-audit.js --json
npm run preview-pack:smoke -- --format json
npm run release:approval-gate -- --format json
npm run release:video-suite -- --format json
npm run harness:adapters -- --check
npm run harness:audit -- --format json
npm run observability:ready
npm run security:ioc-scan
npm audit --audit-level=moderate
npm audit signatures
node tests/docs/ecc2-release-surface.test.js
node tests/hooks/gateguard-fact-force.test.js
node tests/run-all.js
cd ecc2 && cargo test
```

## Texto de Aprovação

Use aprovações curtas e explícitas. Exemplo:

```text
Aprovado para prerelease do GitHub rc.1, publicação npm next, tag do plugin Claude e
anúncio de release após os comandos finais de evidência passarem a partir do commit <sha>.
Uploads de vídeo aprovados para <video-primario> e <lista-de-shorts>.
Mensagens de saída para patrocinador, parceiro, consultoria, conferência e podcast permanecem
bloqueadas até que eu aprove o lote exato.
```

## Não Aprovar Se

- O branch final estiver sujo ou não corresponder mais ao commit de release pretendido.
- Qualquer comando de evidência obrigatório falhar ou for ignorado sem um adiamento por escrito.
- A cópia de release reivindicar faturamento ao vivo, propagação do marketplace do plugin, npm
  `next`, ou listagem oficial no Plugin Directory do Codex antes de existir um readback.
- A cópia de anúncio contiver URLs desatualizadas, caminhos privados ou decisões de link ao vivo não resolvidas.
- O corte de vídeo selecionado tiver quadros pretos, áudio ausente, URLs desatualizadas, prova fraca
  do produto ou legendas não revisadas.
- O lote de saída não tiver sido revisado exatamente como será enviado.

Nenhum e-mail de saída, post de conta pessoal, publicação de pacote, tag de plugin ou anúncio de faturamento é autorizado apenas por este pacote.
