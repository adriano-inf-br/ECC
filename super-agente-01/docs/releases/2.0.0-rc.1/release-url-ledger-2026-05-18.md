# Ledger de URL do Lançamento ECC v2.0.0-rc.1

Este ledger separa os links que já são públicos dos links que só se tornam
válidos após as etapas de lançamento, pacote, plugin e anúncio aguardando aprovação.
Regenere-o a partir do commit final de lançamento antes de postar qualquer anúncio público.

Capturado do snapshot de origem
`81fca2cea6f1399c52c8faa70f9a17e42f0bd447` em 2026-05-18. O arquivo do ledger
pode ser commitado em uma atualização posterior somente de docs após o snapshot de evidência que
descreve.

## Ao Vivo Agora

| Superfície | URL | Verificação |
| --- | --- | --- |
| Repositório | <https://github.com/affaan-m/everything-claude-code> | `git remote get-url origin` |
| Commit de origem da evidência | <https://github.com/affaan-m/everything-claude-code/commit/81fca2cea6f1399c52c8faa70f9a17e42f0bd447> | `git rev-parse HEAD` na captura da evidência |
| Pasta do preview pack do lançamento | <https://github.com/affaan-m/everything-claude-code/tree/main/docs/releases/2.0.0-rc.1> | Evidência do preview pack capturada de `81fca2ce` |
| Rascunho das notas de lançamento | <https://github.com/affaan-m/everything-claude-code/blob/main/docs/releases/2.0.0-rc.1/release-notes.md> | Texto de lançamento na árvore |
| Guia de configuração do Hermes | <https://github.com/affaan-m/everything-claude-code/blob/main/docs/HERMES-SETUP.md> | Guia Hermes sanitizado na árvore |
| Snapshot de evidência de 18 de maio | <https://github.com/affaan-m/everything-claude-code/blob/main/docs/releases/2.0.0-rc.1/publication-evidence-2026-05-18.md> | Evidência de prontidão mais forte atual |
| Painel do operador de 18 de maio | <https://github.com/affaan-m/everything-claude-code/blob/main/docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-18.md> | Painel prompt-para-artefato |
| CI no head enviado | <https://github.com/affaan-m/everything-claude-code/actions/runs/26011460500> | CI passou 37/37 jobs para `81fca2ce`, incluindo o job de varredura IOC da cadeia de suprimentos |
| Último Supply-Chain Watch | <https://github.com/affaan-m/everything-claude-code/actions/runs/26010432490> | Supply-Chain Watch passou para `25ac57ac`; reexecute a partir do commit final de lançamento antes da publicação |
| Página do pacote npm | <https://www.npmjs.com/package/ecc-universal> | `npm view ecc-universal name version dist-tags --json` retornou `latest: 1.10.0`; rc.1 ainda não está publicado |
| Docs CLI do marketplace Codex | <https://developers.openai.com/codex/cli/reference#codex-plugin-marketplace> | Os docs oficiais listam `codex plugin marketplace add` para atalhos GitHub, URLs Git, URLs SSH e raízes de marketplace locais |
| Status do Diretório Oficial de Plugins Codex | <https://developers.openai.com/codex/plugins/build#publish-official-public-plugins> | Os docs oficiais dizem que a publicação no Diretório Público de Plugins e o gerenciamento de autoatendimento estão em breve |

## URLs Aguardando Aprovação

| Superfície | URL pretendida ou comando | Gate antes do uso |
| --- | --- | --- |
| Pré-lançamento no GitHub | <https://github.com/affaan-m/everything-claude-code/releases/tag/v2.0.0-rc.1> | `gh release view v2.0.0-rc.1 --repo affaan-m/everything-claude-code --json tagName,url,isPrerelease` deve retornar o pré-lançamento |
| Pacote rc no npm | <https://www.npmjs.com/package/ecc-universal/v/2.0.0-rc.1> | Aprovação de `npm publish --tag next` e `npm view ecc-universal dist-tags --json` pós-publicação |
| Tag do plugin Claude | `claude plugin tag .claude-plugin --dry-run`, depois tag real somente após aprovação | Commit de lançamento limpo e aprovação de criação/envio da tag de plugin |
| Instalação via marketplace de repo Codex | `codex plugin marketplace add affaan-m/everything-claude-code --ref v2.0.0-rc.1` | A tag do GitHub deve existir; a submissão ao Diretório Oficial de Plugins permanece separada |
| Anúncio de pagamentos nativos das ECC Tools | URL do Marketplace/App das ECC Tools mais readback de prontidão de faturamento | A conta de teste gerenciada pelo Marketplace deve retornar `announcementGate.ready === true` |
| Anúncios públicos | URLs de X, LinkedIn, lançamento no GitHub e texto longo | As URLs de lançamento no GitHub, npm, plugin e faturamento devem resolver primeiro |

## Verificação Pré-Publicação

Execute estes imediatamente antes da publicação:

```bash
git status --short --branch
gh release view v2.0.0-rc.1 --repo affaan-m/everything-claude-code --json tagName,url,isPrerelease
npm view ecc-universal name version dist-tags --json
codex plugin marketplace add --help
rg -n "TODO|TBD|PLACEHOLDER" docs/releases/2.0.0-rc.1
npm run preview-pack:smoke
```

Não poste o texto social ou de notificação até que as URLs aguardando aprovação acima
resolvam a partir de um commit de lançamento limpo.
