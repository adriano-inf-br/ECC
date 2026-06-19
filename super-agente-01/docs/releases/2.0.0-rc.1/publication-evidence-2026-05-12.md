# Evidência de Publicação ECC v2.0.0-rc.1 — 2026-05-12

Esta é apenas evidência de release em dry-run. Não cria um release do GitHub, publicação
npm, tag de plugin, envio ao marketplace ou post de anúncio.

## Commit de Origem

| Campo | Evidência |
| --- | --- |
| Base principal upstream | `0598af70a51346bae34d987b9bed143386055967` |
| Branch de evidência | `codex/release-publication-evidence` |
| Escopo da evidência | Árvore de trabalho com atualizações de higiene de pacote e docs de release deste branch |
| Remote do Git | `https://github.com/affaan-m/everything-claude-code.git` |
| Ressalva de status local | Árvore de trabalho tinha o diretório não rastreado não relacionado `docs/drafts/` |

O operador de release real deve repetir estas verificações a partir do commit final de release
com um checkout limpo antes de publicar.

## Estado do Registry e Release

| Superfície | Comando | Resultado |
| --- | --- | --- |
| Prerelease do GitHub | `gh release view v2.0.0-rc.1 --repo affaan-m/everything-claude-code --json tagName,url,isPrerelease` | `release not found` |
| Dist-tags npm | `npm view ecc-universal dist-tags --json` | `{ "latest": "1.10.0" }` |
| Metadados do pacote npm | `node -p "require('./package.json').name + '@' + require('./package.json').version"` | `ecc-universal@2.0.0-rc.1` |
| Identidade do produto | `rg -n "Everything Claude Code" README.md CHANGELOG.md docs/releases/2.0.0-rc.1` | Presente no README e nos docs de release do rc.1 |

## Dry Run do npm

A primeira passagem do pack expôs arquivos de cache bytecode Python locais no tarball
porque entradas amplas de `files` do pacote incluíam caminhos locais não rastreados `__pycache__`.
Este branch adiciona exclusões explícitas de arquivo de pacote e um teste de regressão
para que `npm pack` falhe se bytecode Python aparecer na superfície do pacote.

| Comando | Resultado |
| --- | --- |
| `node tests/scripts/npm-publish-surface.test.js` | Passou `2/2`; inclui asserção de exclusão de bytecode Python |
| `npm pack --dry-run --json` | `ecc-universal-2.0.0-rc.1.tgz`; `entryCount: 965`; `size: 1565968`; `unpackedSize: 4934637`; `hasBytecode: false` |
| `npm publish --tag next --dry-run --json` | Alvo de dry-run é o registry npm com `tag next`; `entryCount: 965`; `hasBytecode: false` |

Smoke de instalação temporária:

| Comando | Resultado |
| --- | --- |
| `npm pack --pack-destination /tmp/ecc-publication-smoke-dd9ud5 --json` | Criou `ecc-universal-2.0.0-rc.1.tgz` para smoke de instalação local |
| `npm install --prefix /tmp/ecc-publication-smoke-dd9ud5 /tmp/ecc-publication-smoke-dd9ud5/ecc-universal-2.0.0-rc.1.tgz` | Adicionou 8 pacotes |
| `node /tmp/ecc-publication-smoke-dd9ud5/node_modules/ecc-universal/scripts/ecc.js --help` | Exibiu ajuda da CLI de instalação seletiva do ECC |
| `node /tmp/ecc-publication-smoke-dd9ud5/node_modules/ecc-universal/scripts/catalog.js profiles --json` | Retornou os 6 perfis de instalação: `minimal`, `core`, `developer`, `security`, `research`, `full` |
| `find /tmp/ecc-publication-smoke-dd9ud5/node_modules/ecc-universal -path '*__pycache__*' -o -name '*.pyc' -o -name '*.pyo' -o -name '*.pyd'` | Sem saída |

## Evidência de Plugin e Harness

| Superfície | Comando | Resultado |
| --- | --- | --- |
| Manifesto do plugin Claude | `claude plugin validate .claude-plugin/plugin.json` | Passou |
| Preflight de tag do plugin Claude | `claude plugin tag .claude-plugin --dry-run` | Bloqueado pelo diretório não rastreado não relacionado `docs/drafts/` |
| Dry-run forçado da tag do plugin Claude | `claude plugin tag .claude-plugin --dry-run --force` | Criaria `ecc--v2.0.0-rc.1` no HEAD; não usar `--force` para release real a menos que o mantenedor decida |
| CLI de marketplace do Codex | `codex plugin marketplace --help` e ajuda de subcomando | Suporta `add`, `upgrade` e `remove`; `add` suporta roots de marketplace de repositório e local |
| Pacote OpenCode | `npm run build:opencode` | Passou |
| Rota de hook/plugin Claude | `node tests/hooks/hooks.test.js` | Passou `236/236` |
| Superfície de release Codex | `node tests/docs/ecc2-release-surface.test.js` | Passou `18/18` |
| Metadados de agent/catálogo | `node tests/scripts/catalog.test.js` | Passou `7/7` |
| Gate de observabilidade | `npm run observability:ready` | Passou `16/16` |

## Smoke do Plugin Claude com Checkout Limpo

Esta passagem de seguimento usou uma worktree limpa desanexada em
`/tmp/ecc-clean-plugin-evidence` do commit
`bfacf37715b39655cbc2c48f12f2a35c67cb0253`. Usou uma home temporária isolada
(`HOME=/tmp/ecc-clean-plugin-home`) e um projeto local temporário
(`/tmp/ecc-plugin-install-smoke`), portanto não escreveu na config real de plugin Claude
do usuário.

| Comando | Resultado |
| --- | --- |
| `git -C /tmp/ecc-clean-plugin-evidence status --short --branch` | `## HEAD (no branch)` sem arquivos sujos ou não rastreados |
| `claude plugin validate .claude-plugin/plugin.json` | Passou |
| `claude plugin validate .claude-plugin/marketplace.json` | Passou |
| `claude plugin tag .claude-plugin --dry-run` | Passou sem `--force`; criaria `ecc--v2.0.0-rc.1` no HEAD e faria push de `refs/tags/ecc--v2.0.0-rc.1` |
| `claude plugin marketplace add /tmp/ecc-clean-plugin-evidence --scope local` com `HOME` temporário | Adicionou marketplace `ecc` nas configurações locais |
| `claude plugin list --available --json` com `HOME` temporário | Listou `ecc@ecc`, versão `2.0.0-rc.1`, fonte `./` |
| `claude plugin install ecc@ecc --scope local` com `HOME` temporário | Instalou `ecc@ecc` no escopo local |
| `claude plugin list --json` com `HOME` temporário | Listou `ecc@ecc`, versão `2.0.0-rc.1`, habilitado, escopo local, caminho de instalação em `/tmp/ecc-clean-plugin-home/.claude/plugins/cache/ecc/ecc/2.0.0-rc.1` |
| `claude plugin uninstall ecc@ecc --scope local` com `HOME` temporário | Desinstalado com sucesso; lista final de plugins foi `[]` |

## Verificação de Placeholder de Anúncio

A varredura de placeholder proibido retornou apenas as linhas do checklist de publication-readiness
que nomeiam esses placeholders proibidos. Nenhuma instância de placeholder do pack de lançamento foi encontrada.

## Bloqueadores Restantes

- Criar ou verificar prerelease do GitHub `v2.0.0-rc.1`.
- Publicar `ecc-universal@2.0.0-rc.1` com dist-tag npm `next`.
- Criar e fazer push da tag do plugin Claude somente após aprovação explícita. O dry run com
  checkout limpo e smoke de instalação temporária agora passam.
- Confirmar o caminho de envio ao marketplace ao vivo do Claude/Codex/OpenCode ou registrar
  o responsável pelo envio manual e status.
- Verificar declarações de faturamento/App/Marketplace das ECC Tools antes de usá-las na cópia de lançamento.
- Atualizar cópia de anúncio com URLs ao vivo após existirem URLs de release e pacote/plugin.
