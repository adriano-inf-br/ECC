# Lista de Verificação de Lançamento do ECC v2.0.0-rc.1

## Repositório

- verifique se o `main` local está sincronizado com `origin/main`
- verifique se `docs/ECC-2.0-GA-ROADMAP.md` reflete o plano atual do marco do Linear
  e o snapshot mais recente do projeto `ECC Platform Roadmap` no workspace do Ito
  Markets
- verifique se `docs/HERMES-SETUP.md` está presente
- verifique se `docs/architecture/cross-harness.md` está presente
- verifique se este diretório de lançamento está commitado
- verifique se `preview-pack-manifest.md` lista os artefatos de lançamento público, Hermes, adapter,
  observabilidade, publicação e anúncio antes de executar as verificações finais de publicação
- verifique se `release-name-plugin-publication-checklist-2026-05-18.md` ainda
  corresponde às superfícies atuais do GitHub, npm, Claude, Codex, OpenCode e faturamento
- mantenha tokens privados, documentos pessoais e exportações brutas de workspace fora do repositório

## Superfície de Lançamento

- verifique se os metadados de pacote, plugin, marketplace, OpenCode e agent permanecem em `2.0.0-rc.1`
- verifique se `ecc2/Cargo.toml` permanece em `0.1.0` para o rc.1; `ecc2/` permanece um scaffold alfa de plano de controle
- complete `publication-readiness.md` com evidências recentes antes de qualquer lançamento no GitHub, publicação no npm, envio de plugin ou post de anúncio
- execute `npm run release:approval-gate -- --format json` após as aprovações dos proprietários
  e os readbacks de URL ao vivo serem registrados; deve retornar ready true antes de qualquer
  ação de publicação, upload, redes sociais ou saída
- reexecute a lista de verificação de nome de lançamento/publicação de plugin antes de criar um
  pré-lançamento no GitHub, publicar no npm, enviar tags de plugin do Claude, registrar o
  caminho do marketplace do Codex ou postar cópia pública
- inclua `publication-evidence-2026-05-17.md` e
  `operator-readiness-dashboard-2026-05-17.md` na revisão final de evidências,
  depois reexecute as verificações voltadas para publicação a partir do commit exato de lançamento
- atualize os metadados de lançamento em um PR dedicado de versão de lançamento
- execute a suíte de testes raiz
- execute `cd ecc2 && cargo test`

## Conteúdo

- publique a thread do X a partir de `x-thread.md`
- publique o rascunho do LinkedIn a partir de `linkedin-post.md`
- use `article-outline.md` para o texto mais longo
- encaminhe a cópia de patrocinador, parceiro, consultoria, conferência, podcast e GitHub
  Discussion por `partner-sponsor-talks-pack.md`
- grave um clipe de prova de trabalho de 30 a 60 segundos
- valide a suíte de vídeo de lançamento com `npm run release:video-suite -- --format json`
  após definir `ECC_VIDEO_SOURCE_ROOT` e `ECC_VIDEO_RELEASE_SUITE_ROOT`
- mantenha `video-suite-production.md` alinhado com o render principal de lançamento real,
  cronograma, legendas e gate de autoavaliação

## Sugestões de Assets de Demonstração

- Hermes mais ECC lado a lado
- documentação de lançamento sendo gerada ou revisada a partir do repositório
- um fluxo de trabalho movendo-se de briefing para post para lista de verificação
- dashboard ou superfície de sessão do `ecc2/` com enquadramento alfa

## Mensagens

Use linguagem como:

- "release candidate"
- "stack de operador sanitizado"
- "sistema operacional cross-harness para trabalho agêntico"
- "ECC é o substrato reutilizável; Hermes é o shell de operador"
- "integrações privadas/locais chegam após sanitização"

Não envie alcance para patrocinador, parceiro, consultoria, conferência ou podcast
sem aprovação humana explícita.
