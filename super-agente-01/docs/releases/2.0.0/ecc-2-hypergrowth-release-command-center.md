# Centro de Comando do Lançamento de Hipercrescimento ECC 2.0

Data do snapshot: 2026-05-19.

Este é o mapa de execução para transformar o ECC 2.0 em um lançamento público completo,
funil de parceiros, funil de sponsors, superfície de consultoria e lançamento de conteúdo. Está
escrito para operadores. Use-o para decidir o que é disponibilizado, o que é anunciado e
o que permanece bloqueado até que existam evidências.

## Afirmação do Lançamento

ECC 2.0 é o sistema operador nativo do harness para trabalho agentic.

A prova pública deve mostrar o sistema real:

- skills reutilizáveis, rules, hooks, convenções MCP e gates de lançamento;
- Claude Code, Codex, OpenCode, Cursor, Gemini, Zed, GitHub Copilot e
  fluxos de trabalho exclusivos de terminal como superfícies de execução suportadas;
- `ecc2/` como a direção alpha de control-plane/TUI;
- Hermes como o shell de operador opcional para chat, cron, handoffs e roteamento
  de trabalho diário;
- ECC Tools Pro, GitHub Sponsors e consultoria como a superfície de negócios que
  financia a camada OSS.

Evite linguagem que enquadre isso como uma renomeação ou recuo do projeto antigo.
A cópia do lançamento deve mostrar a forma do produto 2.0 diretamente.

## Linha de Base de Crescimento Atual

| Métrica | Atual | Meta | Lacuna |
| --- | ---: | ---: | ---: |
| MRR | `$1.728/mês` | `$10.000/mês` | `$8.272/mês` |
| Movimento de Sponsor | GitHub Sponsors ativos mais entrada aberta | Loop de fechamento de sponsor repetível | Saída aprovada pelo proprietário |
| Movimento de Consultoria | Aberto, não-primário | Pacotes prontos para parceiros | Prova pública, palestras e captação |
| Movimento de Conteúdo | Candidatos a publicação de vídeos de lançamento prontos | Clipes de lançamento semanais e prova de fundador | Aprovação do proprietário, upload e URLs públicas |
| Movimento de Comunidade | Discord existe | Comunidade útil de programação/operador | Convite, canais, fixados, moderação |

O crescimento do MRR deve vir de quatro trilhas simultaneamente:

- GitHub Sponsors e sponsors de parceiros OSS;
- assinaturas do ECC Tools Pro;
- contratos de consultoria e implementação;
- palestras, podcasts, demos em conferências e webinars com parceiros que criam entrada.

## Segunda Fase de Hipercrescimento

O lançamento deve se comportar como um motor de prova, não como um anúncio de mudança de nome.
Cada superfície pública deve tornar o produto óbvio na primeira tela,
clipe, parágrafo ou demo:

| Fluxo de trabalho | Prova pública | Caminho de receita |
| --- | --- | --- |
| Categoria do produto | ECC como o sistema operador nativo do harness, não um pacote de configuração exclusivo do Claude | Converte tráfego OSS confuso em intenção de instalação, Pro e sponsor |
| Cobertura de harness | Claude Code, Codex, OpenCode, Cursor, Gemini, Zed, GitHub Copilot e fluxos de trabalho de terminal mostrados como superfícies de execução | Conversas com parceiros de ferramentas, IDEs, provedores de modelos e equipes de plataforma |
| Plano de controle | `ecc2/` alpha dashboard/status/superfície de sessão e shell de operador Hermes claramente enquadrados como direcionalmente ao vivo | Sprints de consultoria e implementação para equipes |
| Confiança empresarial | AgentShield, cadeia de suprimentos, lançamento, observabilidade e gates de CI mostrados como evidência repetível | Fornecedores de segurança, fornecedores de revisão de código, sponsors de plataforma e pilotos empresariais |
| Motor de mídia | Vídeo principal de lançamento, cinco clipes de prova, capturas de navegador, transcrições, EDLs, legendas e timelines editáveis | Alcance social, reserva de podcast/palestra, prova de sponsor, demos de parceiros |
| Funil de comunidade | GitHub Discussions, Discord quando aprovado, tiers de sponsor, Pro e CTAs de consultoria roteados sem desordem | Entrada repetível, não picos únicos de lançamento |

O ritmo operacional após o lançamento deve ser semanal:

1. um clipe de prova do produto;
2. um clipe de prova de segurança ou disciplina de lançamento;
3. um lote de alcance a parceiros/sponsors/palestras após aprovação do proprietário;
4. uma discussão pública ou prompt de comunidade;
5. uma leitura de retorno de funil mensurável cobrindo tráfego do repositório, cliques de sponsor, conversões Pro, movimento de MRR e respostas de entrada.

## Loop de Valor da Plataforma

A tese de plataforma de longo prazo está registrada em
[`docs/architecture/platform-value-loop.md`](../../architecture/platform-value-loop.md).
O ECC deve permanecer útil como OSS gratuito enquanto o valor gerenciado acumula em torno de
memória de equipe, sessões observáveis, gates de lançamento, evals, evidência de segurança,
análise hospedada, faturamento, fluxos de trabalho de parceiros e integrações específicas de produto.

As integrações de produto devem se comportar como loops de distribuição repetíveis:

1. disponibilize um pacote de skills público que funcione sem credenciais privadas;
2. mantenha dados de produto ao vivo ou ações atrás de um caminho explícito de API aprovado;
3. adicione fixtures, documentação, evals e gates de risco para que o fluxo de trabalho seja testável;
4. converta o uso sanitizado do produto em skills, documentação ou evidência do ECC;
5. encaminhe equipes sérias para sponsors, Pro, parceiros ou consultoria.

Itô é o exemplo atual: pesquisa de mercado de predição, comparação de basket,
planejamento manual não-advisory e fluxos de trabalho de data-atlas podem ser distribuídos
através do ECC, enquanto dados ao vivo do Itô e chamadas específicas de conta permanecem aprovados
por `ITO_API_KEY` e separados do faturamento do ECC Tools.

## Gates de Lançamento

| Trilha | Concluído quando | Ação atual |
| --- | --- | --- |
| Identidade do repositório | README, metadados do pacote, metadados do plugin, documentação de lançamento, fluxos de trabalho e cópia de lançamento todos usam `affaan-m/ECC` onde URLs públicas são necessárias | Varredura de URL canônica |
| Publicação de pacote e plugin | `ecc-universal@2.0.0-rc.1` dry-runs limpos, npm `next` aprovado, tag do plugin Claude dry-runs, smoke do marketplace de repositório Codex passa, build do OpenCode passa | Atualizar evidência de publicação a partir do commit final |
| Prova do produto | Quickstart, arquitetura cross-harness, prompts de demo, fronteira alpha de `ecc2/`, prova de segurança do AgentShield e links do ECC Tools hospedados são consistentes | Manter superfícies de prova concretas |
| Prova de receita | Tiers de sponsor, preços do Pro, CTA de consultoria, CTA de parceiro e linguagem de leitura de retorno de faturamento estão atualizados | Não anunciar afirmações de faturamento antes de leitura de retorno ao vivo |
| Prova de conteúdo | Vídeo de lançamento, clipes curtos, capturas de tela, notas de lançamento, GitHub Discussion, X, LinkedIn e post longform estão alinhados | Escolher cortes finais de vídeo, fazer upload após aprovação e anexar URLs públicas |
| Prova de comunidade | Convite do Discord, rules, canais, integração e roteamento de sponsor/comunidade estão prontos | Necessita de decisão de convite/token antes de links públicos |

## Suite de Vídeos

A trilha de vídeo deve usar a skill de edição de vídeo ECC existente mais o
modelo `browser-use/video-use` onde útil: transcrição como superfície de edição,
aprovação de estratégia antes da renderização, cortes determinísticos, output de timeline/projeto
quando disponível e autoavaliação antes da publicação.

Padrão de referência: <https://github.com/browser-use/video-use>

As classes de fonte primária já existem na biblioteca de mídia ECC local. Mantenha caminhos
absolutos brutos fora de documentos públicos; use basenames ou um manifesto de produção
privado ao passar trabalho para um editor ou agent.

| Entregável | Duração | Material de fonte | Meta de prova |
| --- | ---: | --- | --- |
| Vídeo principal de lançamento | 90-150s | `longform-full-wide.mp4`, `sf-longform-full.mp4`, `architecture-2-wide.mp4`, `terminal-scan-2-wide.mp4`, `new_site_raw.mp4` | ECC 2.0 como o sistema operador |
| Prova de instalação | 30s | README de instalação, varredura de terminal, quickstart, instalação de plugin | Adoção com menos cliques |
| O que é ECC | 45-60s | `sf-thread-2-whatisecc.mp4`, `vertical-2-whatisecc.mp4`, `architecture-2-*` | Clareza de categoria do produto |
| Prova de segurança | 45-60s | `sf-thread-4-security.mp4`, evidência do AgentShield, gates de cadeia de suprimentos | Confiança empresarial |
| Clipe de dinheiro/prova | 30-45s | `thread-2-ghapp-money.mp4`, `metrics-ticker-2-*`, `gh_app_*.png` | Credibilidade de sponsor, Pro e parceiro |
| Cobertura/prova social | 30-45s | `coverage-montage-wide.mp4`, `100k.png`, `star_history.png`, `x_analytics.png`, capturas de cobertura | Alavancagem de distribuição |

Etapas de produção:

1. Gerar transcrições para os clipes brutos longform e shortform.
2. Construir uma lista de decisão de edição com segmentos de hook, prova, demo, CTA de negócios e CTA final.
3. Cortar deterministicamente com FFmpeg.
4. Adicionar sobreposições e movimento de dados em Remotion ou Manim.
5. Adicionar legendas, leve correção de cor, normalização de áudio e reframes de plataforma.
6. Executar uma passagem de autoavaliação para quadros em branco, legendas ruins, cortes abruptos, hook fraco, prova de produto ausente e URLs desatualizadas.
7. Exportar os MP4 finais mais o estado editável de timeline/projeto.

## Plano de Distribuição

| Canal | Asset | CTA |
| --- | --- | --- |
| GitHub Release | notas de lançamento, quickstart, vídeo de lançamento, link de sponsor | estrela, instalar, sponsor |
| GitHub Discussion | anúncio curto e bullets de prova | perguntas, feedback, sponsors |
| X | thread de lançamento, clipe de instalação de 30s, clipes de prova | repositório, sponsor, Pro |
| LinkedIn | prova de produto amigável a parceiros, CTA de consultoria | sponsors, consultoria, palestras |
| YouTube/Shorts/Reels/TikTok | vídeo principal de lançamento e clipes | repositório, site, newsletter/comunidade |
| Podcasts/palestras | apresentação de uma página, esboço de demo, prova de fundador | reservas, parceiros |
| Alcance a sponsors | nota direta de sponsor e tabela de tiers | GitHub Sponsors ou Pro |

A fonte da verdade para cópia de sponsor, parceiro, consultoria, conferência, podcast e
GitHub Discussion é `docs/releases/2.0.0-rc.1/partner-sponsor-talks-pack.md`.
A fonte da verdade para aprovação do proprietário em ações de lançamento, pacote, plugin, vídeo,
faturamento, social e saída é `docs/releases/2.0.0-rc.1/owner-approval-packet-2026-05-19.md`.

## Regras de Cópia

Use linguagem direta do produto:

- `ECC 2.0 é o sistema operador nativo do harness para trabalho agentic.`
- `Uma camada reutilizável entre Claude Code, Codex, OpenCode, Cursor, Gemini, Zed, GitHub Copilot e fluxos de trabalho de terminal.`
- `OSS permanece gratuito. Sponsors e Pro financiam o trabalho.`
- `Use o ECC para skills, hooks, rules, convenções MCP, gates de lançamento e fluxos de trabalho de operador.`

Evite:

- `renomeamos o repositório`;
- `pivô`;
- enquadramento de pacote de configuração legado;
- `exclusivo do Claude`;
- linguagem genérica de jornada de fundador;
- afirmações sobre faturamento, pagamentos de marketplace ou listagens de diretório oficial
  antes de existirem evidências ao vivo.

## Primeira Ordem de Build

1. Fazer as correções de identidade do repositório público.
2. Atualizar URLs de pacote, plugin, fluxo de trabalho, lançamento e cópia de lançamento.
3. Registrar evidência final de publicação a partir do commit exato de lançamento.
4. Manter o manifesto da suite de vídeos, transcrições, candidatos a publicação e QA visual
   atualizados com `npm run release:video-suite -- --format json`.
5. Fazer captura de navegador do README, app ECC Tools, fluxo de instalação e superfícies
   de prova relevantes para b-roll.
6. Escolher o vídeo principal de lançamento aprovado pelo proprietário e cinco clipes curtos,
   depois fazer upload e anexar URLs públicas finais.
7. Finalizar GitHub release, thread X, post LinkedIn, anúncio de Discussion, cópia de email
   de sponsor, introdução de consultoria, DM de parceiro e apresentação de podcast/palestra.
8. Publicar somente após os gates de npm, plugin, URL de lançamento e leitura de retorno de
   faturamento estarem ao vivo ou explicitamente marcados como bloqueados.

## Aprovações do Proprietário

Estas ações precisam de aprovação humana ou credencial antes de serem executadas:

- enviar emails de upgrade anual ou de sponsor;
- atualizar o texto do perfil do LinkedIn;
- conectar o Discord com um token de bot e ID de guild;
- publicar npm ou criar tags de plugin;
- anunciar faturamento/pagamentos nativos;
- enviar alcance a parceiros, consultoria, conferência, podcast ou sponsor;
- postar cópia social final de contas pessoais.
