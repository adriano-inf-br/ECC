# Registro de URLs da Versão ECC v2.0.0-rc.1

Este registro separa os links que já são públicos dos links que só se tornam
válidos após as etapas restantes de aprovação de plugin, vídeo, faturamento e
anúncio. Regenere-o a partir do commit final de lançamento antes de publicar
qualquer anúncio público.

Atualizado em 2026-05-26 após o GitHub prerelease e as leituras de retorno do
pacote npm `next` terem sido bem-sucedidas. As superfícies restantes de plugin,
vídeo, faturamento e saída ainda precisam ser verificadas a partir do commit
exato de lançamento antes da publicação.

## Disponível Agora

| Superfície | URL | Verificação |
| --- | --- | --- |
| Repositório | <https://github.com/affaan-m/ECC> | `git remote get-url origin` retorna `https://github.com/affaan-m/ECC.git` |
| URL do GitHub prerelease | <https://github.com/affaan-m/ECC/releases/tag/v2.0.0-rc.1> | `gh release view v2.0.0-rc.1 --repo affaan-m/ECC --json tagName,url,isPrerelease,isDraft,publishedAt` retornou prerelease `true`, rascunho `false`, publicado em `2026-05-25T18:29:31Z` |
| Pasta do pacote de lançamento | <https://github.com/affaan-m/ECC/tree/main/docs/releases/2.0.0-rc.1> | Pacote de lançamento no repositório |
| Rascunho das notas de lançamento | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/release-notes.md> | Cópia de lançamento no repositório |
| Guia de configuração do Hermes | <https://github.com/affaan-m/ECC/blob/main/docs/HERMES-SETUP.md> | Guia do Hermes sanitizado no repositório |
| Snapshot de evidências de 19 de maio | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/publication-evidence-2026-05-19.md> | Evidência atual mais forte de identidade, vídeo, crescimento e prontidão de CI |
| Snapshot de evidências de 18 de maio | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/publication-evidence-2026-05-18.md> | Evidência anterior de prontidão da cadeia de suprimentos e do caminho de publicação |
| Painel do operador de 18 de maio | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-18.md> | Painel anterior de prompt para artefato |
| Painel do operador de 19 de maio | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-19.md> | Painel anterior de prompt para artefato com trilhas de hipercrescimento, vídeo e saída |
| Painel do operador de 20 de maio | <https://github.com/affaan-m/ECC/blob/main/docs/releases/2.0.0-rc.1/operator-readiness-dashboard-2026-05-20.md> | Painel atual de prompt para artefato com sincronização do gate de lançamento do Marketplace Pro |
| Página do pacote npm | <https://www.npmjs.com/package/ecc-universal> | `npm view ecc-universal name version dist-tags versions --json` retornou `latest: 1.10.0`, `next: 2.0.0-rc.1`, e incluiu `2.0.0-rc.1` em `versions` |
| URL do pacote rc no npm | <https://www.npmjs.com/package/ecc-universal/v/2.0.0-rc.1> | `npm view ecc-universal@2.0.0-rc.1 name version dist.tarball dist.integrity time --json` retornou a versão `2.0.0-rc.1`, tarball `https://registry.npmjs.org/ecc-universal/-/ecc-universal-2.0.0-rc.1.tgz`, e hora de publicação `2026-05-26T00:36:22.940Z` |
| Documentação CLI do marketplace Codex | <https://developers.openai.com/codex/cli/reference#codex-plugin-marketplace> | Documentação oficial lista `codex plugin marketplace add` para abreviação do GitHub, URLs Git, URLs SSH e roots de marketplace locais |
| Status do Diretório Oficial de Plugins Codex | <https://developers.openai.com/codex/plugins/build#publish-official-public-plugins> | Documentação oficial diz que a publicação no Diretório de Plugins público e o gerenciamento self-serve estão chegando em breve |

## URLs com Aprovação Pendente

| Superfície | URL ou comando pretendido | Gate antes de usar |
| --- | --- | --- |
| Tag de plugin Claude | `claude plugin tag .claude-plugin --dry-run`, depois tag real somente após aprovação | Commit de lançamento limpo e aprovação de tag/push do plugin |
| Instalação via marketplace de repositório Codex | `codex plugin marketplace add affaan-m/ECC --ref v2.0.0-rc.1` | Tag do GitHub deve existir; envio ao Diretório Oficial de Plugins permanece separado |
| Anúncio de pagamentos nativos do ECC Tools | URL do Marketplace/App do ECC Tools mais leitura de retorno de prontidão de faturamento do alvo selecionado pelo caminho bearer do operador | Alvo selecionado gerenciado pelo Marketplace retornou `announcementGate.ready === true` em 2026-05-20; repita imediatamente antes da publicação |
| Anúncios públicos | URLs de X, LinkedIn, GitHub release e longform | URLs restantes de plugin, vídeo e faturamento devem resolver ou ser explicitamente marcadas como bloqueadas; cópia de saída exata ainda precisa de aprovação do proprietário |

## Verificação Pré-Publicação

Execute estes imediatamente antes da publicação:

```bash
git status --short --branch
gh release view v2.0.0-rc.1 --repo affaan-m/ECC --json tagName,url,isPrerelease
npm view ecc-universal name version dist-tags --json
npm view ecc-universal@2.0.0-rc.1 name version dist.tarball dist.integrity time --json
codex plugin marketplace add --help
rg -n "TODO|TBD|PLACEHOLDER" docs/releases/2.0.0-rc.1
npm run preview-pack:smoke
npm run release:approval-gate -- --format json
```

Não alegue propagação de plugin, listagem no Diretório Oficial de Plugins Codex, upload
de vídeo, faturamento/pagamentos nativos do ECC Tools, ou prontidão final de saída até que
as URLs com aprovação pendente acima resolvam a partir de um commit de lançamento limpo.
