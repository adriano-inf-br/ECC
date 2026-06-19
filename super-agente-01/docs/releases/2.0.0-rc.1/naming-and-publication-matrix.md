# Matrix de Nomenclatura e Publicação ECC v2.0.0-rc.1

Data do snapshot: 2026-05-19. Estado de publicação atualizado em 2026-05-26 após os
readbacks de prerelease do GitHub e `next` do npm serem bem-sucedidos.

Esta matrix registra a identidade do rc.1 após a renomeação do repositório público para
`affaan-m/ECC`. É evidência para planejamento, não uma ação de publicação.

## Decisão

Para `v2.0.0-rc.1`, publicar a identidade pública como **ECC**.

Usar `affaan-m/ECC` como o repositório canônico do GitHub e `ECC` como o nome do produto
em cópia, slugs de plugin, superfícies de status, diagramas e material de release. Manter
o pacote npm e os pontos de entrada do pacote como `ecc-universal` até que exista um plano
de migração separado pós-rc.

Razão:

- a superfície de instalação atual já funciona como `ecc-universal` mais o slug de
  plugin `ecc`;
- o nome exato do pacote npm `ecc` já está ocupado por um pacote de
  criptografia de curva elíptica não relacionado;
- `affaan-m/ECC` é o repositório público ao vivo no GitHub;
- as superfícies de plugin Claude e Codex já são curtas o suficiente como `ecc`;
- o rc.1 deve provar o pipeline de release, plugin e publicação antes de qualquer
  renomeação de npm/pacote.

## Valores Atuais

| Superfície | Valor atual | Comando de evidência | Resultado atual | Decisão de release |
| --- | --- | --- | --- | --- |
| Nome de exibição do produto | `ECC` | `rg -n "^# ECC\|displayName.*ECC\|affaan-m/ECC" README.md .codex-plugin/plugin.json docs/releases/2.0.0-rc.1` | Presente no README, manifestos de plugin, cópia de release e ledger de URLs | Manter para rc.1 e GA |
| Repositório GitHub | `affaan-m/ECC` | `git remote get-url origin` | `https://github.com/affaan-m/ECC.git` | Manter para rc.1 e GA |
| Pacote npm | `ecc-universal` | `node -p "require('./package.json').name"` | `ecc-universal` | Manter para rc.1 |
| Versão do pacote npm | `2.0.0-rc.1` local, `1.10.0` registry latest, `2.0.0-rc.1` registry next | `node -p "require('./package.json').version"` e `npm view ecc-universal name version dist-tags --json` | rc.1 local está pronto; registry latest permanece `1.10.0`; `next` aponta para `2.0.0-rc.1` | Manter rc em `next`, não em `latest` |
| Nome curto exato do npm | `ecc` | `npm view ecc name version description repository.url --json` | Ocupado por `ecc@0.0.2`, "Elliptic curve cryptography functions." | Não usar |
| Nome curto com escopo do npm | `@affaan-m/ecc` | `npm view @affaan-m/ecc name version --json` | Registry 404 | Possível pacote com escopo futuro se a política de escopo do npm permitir |
| Nome anterior do pacote | `everything-claude-code` | `npm view everything-claude-code name version dist-tags --json` | Registry reporta não publicado em 2026-02-07 | Não reviver para rc.1 |
| Slug do plugin Claude | `ecc` | `node -p "require('./.claude-plugin/plugin.json').name"` | `ecc` | Manter |
| Versão do plugin Claude | `2.0.0-rc.1` | `claude plugin validate .claude-plugin/plugin.json`; `claude plugin tag .claude-plugin --dry-run` | Validação passou no Claude Code `2.1.143`; dry run criaria `ecc--v2.0.0-rc.1` | Pronto para gate de tag de release |
| Entrada no marketplace Claude | `ecc` | `.claude-plugin/marketplace.json`; `claude plugin marketplace add --help`; docs do marketplace de plugins da Anthropic | Versão e repositório apontam para a superfície rc.1 atual; fontes de marketplace GitHub, git URL, JSON de marketplace remoto e caminho local são suportadas | Manter |
| Slug do plugin Codex | `ecc` | `node -p "require('./.codex-plugin/plugin.json').name"` | `ecc` | Manter |
| Versão do plugin Codex | `2.0.0-rc.1` | `node tests/plugin-manifest.test.js`; `node tests/docs/ecc2-release-surface.test.js` | Manifesto do plugin passou 54/54; superfície de release passou 21/21 no Codex CLI `0.131.0` | Pronto para gate de marketplace Codex/gate de marketplace manual |
| Marketplace repo Codex | `ecc` | `.agents/plugins/marketplace.json`; `codex plugin marketplace add --help`; docs de plugin Codex da OpenAI | Marketplace repo add suporta atalho GitHub, URLs Git HTTP(S), URLs SSH, roots de marketplace local, `--ref` e `--sparse` somente Git; smokes de add local e GitHub-ref com home temporário passaram | Usar como caminho de distribuição Codex rc.1 |
| Pacote OpenCode | `ecc-universal` | `node -p "require('./.opencode/package.json').name"` | `ecc-universal` | Manter |
| Build OpenCode | Saída de pacote gerada | `npm run build:opencode` | Passou | Pronto para gate de dry-run de pacote |
| Superfície de npm pack | Pacote de runtime reduzido | `NPM_CONFIG_USERCONFIG=/dev/null npm pack --dry-run --json` | Produziu `ecc-universal-2.0.0-rc.1.tgz`, 2228 entradas, 4.348.504 bytes empacotados, 13.024.929 bytes desempacotados | Precisa de nova execução no commit final de release |

## Caminhos de Publicação

| Caminho | Evidência atual | Próxima ação necessária | Bloqueador |
| --- | --- | --- | --- |
| Release do GitHub | prerelease `v2.0.0-rc.1` está ao vivo em <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1> | Manter notas de release alinhadas com o ledger de URLs; executar novamente a evidência antes de qualquer edição de release posterior | URLs restantes de plugin, vídeo, faturamento e saída ainda gateadas |
| npm | `ecc-universal@2.0.0-rc.1` está ao vivo em `next`; registry latest permanece `1.10.0` | Manter rc em `next`; não mover `latest` antes da aprovação do GA | URLs restantes de plugin, vídeo, faturamento e saída ainda gateadas |
| Plugin Claude | `claude plugin validate .claude-plugin/plugin.json` passou; `claude plugin tag --help` confirma que o fluxo de tag de release cria tags `{name}--v{version}` e pode fazer push delas | Executar `claude plugin tag .claude-plugin --dry-run` do commit limpo de release, então fazer tag/push somente após aprovação de release | Nenhuma tag real de plugin de release foi criada nesta passagem |
| Marketplace Claude | `.claude-plugin/marketplace.json` aponta para `ecc` e o repositório público | Verificar caminho de atualização/instalação do marketplace após a tag existir | Propagação do marketplace externo não verificada |
| Plugin Codex | `codex plugin marketplace` suporta fontes de marketplace local e Git; `.codex-plugin/plugin.json` está presente; `.agents/plugins/marketplace.json` expõe `ecc` da raiz do repositório; smokes de add de marketplace local e GitHub-ref com home temporário passaram | Publicar docs rc.1 com o comando repo-marketplace, então monitorar o caminho oficial do Plugin Directory da OpenAI | Não reivindicar listagem oficial no Plugin Directory antes de evidência de envio à OpenAI |
| Pacote OpenCode | `.opencode/package.json` faz build a partir do código-fonte e é enviado dentro do pacote npm | Executar novamente `npm run build:opencode` e dry-run de pacote do commit de release | CLI OpenCode 1.2.21 não expõe um comando de publicação de plugin separado nesta passagem |
| Declaração de faturamento das ECC Tools | README e cópia de lançamento mencionam contexto de ECC Tools / marketplace | ECC-Tools #89/#90/#91 adicionam readback de faturamento de alvo selecionado, gating de anúncio de alvo selecionado e suporte `--env-file` ignorado; #92 adiciona o caminho bearer do operador não-quebrador; #93 registra a passagem do gate ao vivo de alvo selecionado | Evidência de faturamento pronta; repetir o gate ao vivo de alvo selecionado antes de qualquer anúncio de pagamento |
| Cópia social e longform | Thread X, cópia LinkedIn, esboço de artigo, cópia de release do GitHub existem | Substituir URLs desatualizadas e publicar somente após os gates restantes de plugin/vídeo/faturamento/saída serem aprovados | URLs de prerelease do GitHub e npm estão ao vivo; URLs de plugin, vídeo, faturamento e saída não são finais |

## Registro de Bloqueadores ITO-46

| Canal | Status atual | Metadados/evidência necessários | Responsável | Bloqueador ou seguimento |
| --- | --- | --- | --- | --- |
| Release do GitHub | Prerelease ao vivo em <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1> | Tag, URL de release, flag de prerelease, notas de release finais, ledger de URLs | Responsável pelo release | Manter edições de release por trás da evidência final e aprovação do proprietário |
| npm | `ecc-universal@2.0.0-rc.1` está publicado em `next`; registry latest é `1.10.0` | Resumo do pack, readback de publicação, readback de dist-tag `next`, evidência de assinatura do registry | Responsável pelo pacote | Não mover rc.1 para `latest` antes da aprovação do GA |
| Nome curto do npm | `ecc` está ocupado; `@affaan-m/ecc` retorna 404 | Outputs de disponibilidade de nome e plano de migração | Responsável pelo release | Manter `ecc-universal` para rc.1; renomeação com escopo é apenas pós-rc |
| Plugin Claude | `ecc@2.0.0-rc.1` valida; dry run de tag criaria `ecc--v2.0.0-rc.1` | `claude plugin validate .`, `claude plugin tag .claude-plugin --dry-run`, smoke de install/update do marketplace | Responsável pelo plugin | Push real de tag e propagação do marketplace requerem aprovação de release |
| Marketplace Claude | Docs e CLI suportam fontes GitHub, git URL, JSON de marketplace remoto e caminho local | JSON de marketplace do repositório público, metadados de suporte/contato, smoke de install pós-tag | Responsável pelo plugin | Nenhuma listagem oficial externa foi enviada nesta passagem |
| Marketplace repo Codex | Smokes de add de marketplace local e GitHub-ref com home temporário passaram no Codex CLI `0.131.0` | `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json`, evidência de marketplace de repositório/pessoal | Responsável pelo plugin | Listagem no Plugin Directory oficial requer evidência de envio/listagem da OpenAI |
| Plugin Directory oficial do Codex | Docs da OpenAI descrevem o diretório oficial curado; ECC não enviou nem recebeu evidência de listagem | Link de envio ao diretório ou caminho de aprovação da OpenAI quando disponível | Responsável pelo plugin | Rastrear como seguimento ITO-56/ITO-46; não reivindicar listagem oficial |
| Pacote OpenCode | `npm run build:opencode` passou | Metadados do pacote `.opencode` construído dentro do tarball npm | Responsável pelo pacote | Nenhum canal de publicação de plugin público separado identificado; segue o npm |
| Faturamento/pagamentos nativos | Readback de alvo selecionado do Marketplace Pro, preflight de anúncio de alvo selecionado, caminho do operador com env-file, bearer do operador não-quebrador e gate ao vivo de alvo selecionado passaram | Readback de alvo selecionado de 2026-05-20, proveniência de webhook, gate de anúncio de alvo selecionado, suporte `--env-file` das ECC-Tools #91, bearer do operador das ECC-Tools #92, evidência do gate ao vivo das ECC-Tools #93 | Responsável pelas ECC Tools | Repetir o gate ao vivo imediatamente antes do anúncio do rc.1; cópia final ainda aguarda aprovações de release/plugin/URL ao vivo |
| Cópia social/longform | Rascunhos existem; links do GitHub e npm estão ao vivo | URLs finais ao vivo do GitHub, npm, Claude, Codex, vídeo e faturamento | Responsável pelo release | Publicar somente após as aprovações restantes de plugin/vídeo/faturamento/saída existirem |

## Renomeação de Pacote Após o rc.1

Se a camada de pacote migrar de `ecc-universal` para uma superfície npm mais curta
após o rc.1, fazer como uma migração em etapas:

1. Manter `ecc-universal` como o pacote npm até que um pacote substituto tenha um
   responsável verificado, plano de deprecação e migração de instalação.
2. Manter `affaan-m/ECC` como o repositório canônico para docs públicos, notas de release,
   entradas de marketplace de plugin, metadados npm e links externos.
3. Reservar ou criar qualquer nova superfície de npm/pacote antes de anunciar a
   renomeação do pacote.
4. Publicar um guia de compatibilidade que mapeie comandos antigos, nomes de pacotes, slugs de
   plugin e URLs de docs para os novos nomes.

## Evidências Capturadas Nesta Passagem

```text
git rev-parse HEAD
67e63e63f9bfd074bd6a21bf6bac71f3dfefa58b

node -p "require('./package.json').name + '@' + require('./package.json').version"
ecc-universal@2.0.0-rc.1

node -p "require('./.claude-plugin/plugin.json').name + '@' + require('./.claude-plugin/plugin.json').version"
ecc@2.0.0-rc.1

node -p "require('./.codex-plugin/plugin.json').name + '@' + require('./.codex-plugin/plugin.json').version"
ecc@2.0.0-rc.1

node -p "require('./.opencode/package.json').name + '@' + require('./.opencode/package.json').version"
ecc-universal@2.0.0-rc.1

npm view ecc name version description repository.url --json
ecc@0.0.2 is occupied by an unrelated elliptic curve cryptography package.

npm view ecc-universal name version dist-tags --json
registry latest is 1.10.0; next is 2.0.0-rc.1.

npm view ecc-universal@2.0.0-rc.1 name version dist.tarball dist.integrity time --json
registry returned version 2.0.0-rc.1, the rc tarball URL, and published time
2026-05-26T00:36:22.940Z.

claude plugin validate .claude-plugin/plugin.json
Validation passed on Claude Code 2.1.143.

claude plugin validate .
Validation passed with one warning: root CLAUDE.md is not loaded as plugin
context; ship plugin context through skills instead.

claude plugin tag .claude-plugin --dry-run
Would create and push tag ecc--v2.0.0-rc.1.

node tests/docs/ecc2-release-surface.test.js
21 release-surface checks passed.

node tests/plugin-manifest.test.js
54 plugin-manifest checks passed.

npm run build:opencode
Passed.

npm pack --dry-run --json
Produced ecc-universal-2.0.0-rc.1.tgz, 2228 entries, 4,348,504 bytes
packed, and 13,024,929 bytes unpacked.

npm publish --tag next --dry-run
Dry run would publish ecc-universal@2.0.0-rc.1 to npm with tag next.

codex plugin marketplace add --help
Supports GitHub shorthand, HTTP(S) Git URLs, SSH URLs, local marketplace roots,
--ref, and Git-only --sparse.

HOME="$(mktemp -d)" codex plugin marketplace add <local-checkout>
Added marketplace ecc and recorded the installed marketplace root as
<local-checkout> without touching the real Codex config.

HOME="$(mktemp -d)" codex plugin marketplace add affaan-m/ECC --ref "$(git rev-parse HEAD)"
Added marketplace ecc from the GitHub repo pinned to
67e63e63f9bfd074bd6a21bf6bac71f3dfefa58b without touching the real Codex
config.
```
