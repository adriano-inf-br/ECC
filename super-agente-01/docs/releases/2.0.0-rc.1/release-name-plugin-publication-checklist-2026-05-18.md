# Checklist de Publicação de Nome e Plugin do Lançamento ECC v2.0.0-rc.1

Data do snapshot: 2026-05-18. Decisão canônica do repo atualizada em 2026-05-19
após a renomeação pública do repo para `affaan-m/ECC`; estado de lançamento/pacote atualizado
em 2026-05-26 após os readbacks do pré-lançamento do GitHub e npm `next` terem sido bem-sucedidos.

Este checklist é o gate do operador para nomenclatura do lançamento, publicação do pacote
e distribuição de plugin Claude/Codex. Não é uma ação de publicação por si só.
Execute-o a partir do commit exato de lançamento antes de criar tags, publicar no npm,
submeter formulários ao marketplace ou postar anúncios.

## Decisão Fixa do rc.1

Lançar `v2.0.0-rc.1` como **ECC**.

- Manter o repo GitHub em `affaan-m/ECC`.
- Manter o pacote npm como `ecc-universal`.
- Manter os slugs dos plugins Claude e Codex como `ecc`.
- Publicar o pré-lançamento npm com a dist-tag `next`, não `latest`.
- Não renomear o pacote npm para `ecc` ou `@affaan-m/ecc` antes do rc.1.
- Tratar `affaan-m/ECC` como o repo público canônico para o texto de lançamento rc.1 e GA.

Razões:

- `ecc-universal` é a superfície atual de instalação e pacote em funcionamento.
- `ecc` no npm está ocupado por um pacote de curva elíptica não relacionado.
- `@affaan-m/ecc` está livre no npm, mas exigiria um plano de migração.
- `affaan-m/ECC` é agora o repo público GitHub ao vivo.
- Claude e Codex já expõem o namespace curto desejado como `ecc`.

## Evidência Atual da Superfície

| Superfície | Valor atual | Comando de evidência | Resultado atual | Ação de lançamento |
| --- | --- | --- | --- | --- |
| Commit Git | `67e63e63f9bfd074bd6a21bf6bac71f3dfefa58b` | `git rev-parse HEAD` | Registrado a partir do `main` limpo antes desta atualização de evidência ITO-46 | Reexecute a partir do commit final de lançamento |
| Repo GitHub | `affaan-m/ECC` | `git remote get-url origin` | `https://github.com/affaan-m/ECC.git` | Manter para rc.1 e GA |
| Pacote npm | `ecc-universal@2.0.0-rc.1` local e next do registro, `1.10.0` latest do registro | `node -p "require('./package.json').name + '@' + require('./package.json').version"` e `npm view ecc-universal name version dist-tags --json` | rc.1 local pronto; `next` do registro aponta para `2.0.0-rc.1`; `latest` permanece `1.10.0` | Manter rc.1 em `next`; não mover para `latest` antes da aprovação GA |
| Nome curto npm exato | `ecc` | `npm view ecc name version description repository.url --json` | Ocupado pelo `ecc@0.0.2` não relacionado | Não usar |
| Nome curto npm com escopo | `@affaan-m/ecc` | `npm view @affaan-m/ecc name version --json` | 404 | Candidato somente após plano de migração |
| Plugin Claude | `ecc@2.0.0-rc.1` | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin validate .`; `claude plugin tag .claude-plugin --dry-run` | Validação passou no Claude Code `2.1.143`; a validação completa do plugin tem um aviso esperado de contexto `CLAUDE.md` raiz; o dry run criaria `ecc--v2.0.0-rc.1` | Execute o dry-run da tag novamente a partir do commit final, depois crie/envie tag somente após aprovação |
| Marketplace Claude | `.claude-plugin/marketplace.json` | `claude plugin marketplace add --help`; docs do marketplace de plugin Anthropic | Fontes de marketplace com repo GitHub, URL git, JSON de marketplace remoto e caminho local são suportadas | Verifique o caminho de instalação/atualização do marketplace pós-tag após as evidências finais |
| Plugin Codex | `ecc@2.0.0-rc.1` | `node tests/plugin-manifest.test.js`; `codex plugin marketplace add --help`; docs de plugin OpenAI Codex | Manifest do plugin passou 54/54; smokes de marketplace de repo local e via ref GitHub passaram no Codex CLI `0.131.0` | Use marketplace de repo para rc.1; não reivindique listagem no diretório oficial até que o caminho de publicação da OpenAI esteja disponível |
| Pacote OpenCode | `ecc-universal@2.0.0-rc.1` | `node -p "require('./.opencode/package.json').name + '@' + require('./.opencode/package.json').version"` | Corresponde à identidade do pacote rc.1 | Seguir a publicação do pacote npm |
| Alegação de faturamento | Evidência de faturamento de alvo selecionado das ECC Tools pronta | Gate de faturamento das ECC Tools e readback de conta do Marketplace | Readback de alvo selecionado de 20 de maio e gate de anúncio de alvo selecionado ao vivo passou com `announcementGateReady: true`; repita imediatamente antes do anúncio | Não anuncie pagamentos nativos até que as aprovações finais de lançamento/plugin/URL ao vivo estejam verdes |

## Gate Obrigatório

Execute estas verificações a partir do commit final de lançamento e cole a saída exata em
um novo arquivo `publication-evidence-YYYY-MM-DD.md` antes das ações de lançamento:

```bash
git status --short --branch
git rev-parse HEAD
git remote get-url origin
npm view ecc name version description repository.url --json
npm view @affaan-m/ecc name version --json
npm view ecc-universal name version dist-tags --json
node tests/plugin-manifest.test.js
node tests/docs/ecc2-release-surface.test.js
claude plugin validate .claude-plugin/plugin.json
claude plugin tag .claude-plugin --dry-run
codex plugin marketplace add --help
HOME="$(mktemp -d)" codex plugin marketplace add ./
HOME="$(mktemp -d)" codex plugin marketplace add affaan-m/ECC --ref "$(git rev-parse HEAD)"
npm pack --dry-run --json
npm publish --tag next --dry-run
npm run build:opencode
npm run preview-pack:smoke
npm run release:approval-gate -- --format json
```

Se um comando não estiver disponível na máquina de lançamento, registre o erro exato e
mantenha a ação de publicação relacionada bloqueada.

## Ordem de Publicação

| Passo | Ação | Evidência obrigatória | Condição de parada |
| --- | --- | --- | --- |
| 1 | Congelar nome e versão | Pacote, plugin Claude, plugin Codex, pacote OpenCode, `VERSION` e docs de lançamento todos dizem `2.0.0-rc.1` | Qualquer incompatibilidade `preview`/`rc.1` |
| 2 | Verificar branch de lançamento limpo | `git status --short --branch` mostra apenas o commit de lançamento pretendido e nenhum desvio não relacionado | Qualquer arquivo sujo inexplicável |
| 3 | Verificar manifests de pacote e plugin | `node tests/plugin-manifest.test.js` e `node tests/docs/ecc2-release-surface.test.js` passam | Falha no manifest ou na superfície de lançamento |
| 4 | Dry-run da superfície do pacote | `npm pack --dry-run --json`; `npm publish --tag next --dry-run` | Arquivos ausentes, dist-tag errada ou falha no dry-run de publicação |
| 5 | Dry-run da distribuição Claude | `claude plugin validate`; `claude plugin tag .claude-plugin --dry-run`; evidência de ajuda/fonte do marketplace | Falha de validação, tag ou smoke de instalação |
| 6 | Verificar marketplace de repo Codex | `codex plugin marketplace add --help`; smoke de adição de marketplace de repo local e via ref GitHub em home temporária; status do diretório oficial da OpenAI registrado | Marketplace de repo ausente ou status do diretório oficial não verificado |
| 7 | Verificar pacote OpenCode | `npm run build:opencode` | Falha de build |
| 8 | Regenerar ledger de URL do lançamento | URLs ao vivo e URLs aguardando aprovação separadas em `release-url-ledger-YYYY-MM-DD.md` | Placeholder, URL privada ou desvio de URL de anúncio |
| 9 | Verificar pré-lançamento no GitHub | `gh release view v2.0.0-rc.1 --json tagName,url,isPrerelease` | URL ausente ou flag de pré-lançamento errado |
| 10 | Verificar rc npm | `npm view ecc-universal version dist-tags --json` mostra rc.1 em `next` e latest ainda em GA/estável | rc.1 pousa em `latest` ou saída do registro está pouco clara |
| 11 | Publicar/submeter ao plugin | Submissão oficial Claude e evidências de marketplace de repo Codex registradas | Formulário não submetido, listagem não visível ou status dos docs alterado |
| 12 | Anunciar | X, LinkedIn, lançamento no GitHub e texto longo usam URLs ao vivo finais | Qualquer URL final ainda está pendente |

## Não Prosseguir

- Não publique um build npm adicional antes de `npm pack --dry-run --json` ser
  capturado a partir do commit final de lançamento.
- Não crie ou envie tags de plugin Claude antes de `claude plugin tag
  .claude-plugin --dry-run` passar a partir do commit final de lançamento.
- Não reivindique uma listagem oficial no Diretório de Plugins Codex a menos que a OpenAI
  documente um caminho público de submissão ou confirme que o plugin foi listado.
- Não anuncie faturamento, Marketplace ou pagamentos nativos até que o readback ao vivo
  da conta do Marketplace das ECC Tools retorne pronto.
- Não renomeie o pacote npm até que o rc.1 seja publicado e um guia de migração
  mapeie nomes de instalação antigos para novos.
- Não poste texto social enquanto qualquer URL de plugin, vídeo, faturamento ou
  outbound obrigatória ainda estiver aguardando aprovação.

## Fontes de Distribuição Externas

- Docs do plugin Claude Code da Anthropic: `https://code.claude.com/docs/en/plugins`
- Docs do marketplace Claude Code da Anthropic:
  `https://code.claude.com/docs/en/plugin-marketplaces`
- Docs do plugin Codex da OpenAI:
  `https://developers.openai.com/codex/plugins/build#add-a-marketplace-from-the-cli`

Até este snapshot, a Anthropic documenta a distribuição via marketplace self-hosted
através de fontes GitHub, URL git, JSON de marketplace remoto e caminho local.
A OpenAI documenta a distribuição via marketplace de repo/pessoal para o Codex e descreve
um Diretório Oficial de Plugins, mas o ECC não submeteu ou recebeu uma listagem oficial
no diretório nesta passagem.
