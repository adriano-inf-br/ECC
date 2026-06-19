# Manifesto de Produção da Suite de Vídeos ECC 2.0

Data do snapshot: 2026-05-19.

Este é o contrato de produção para a suite de vídeos do lançamento ECC 2.0. Ele mantém
a história pública do lançamento, o inventário de fontes locais, os outputs de renderização e o
gate de autoavaliação em um único lugar, sem comprometer imagens brutas, exportações
privadas de transcrição ou caminhos locais absolutos.

## Afirmação

ECC 2.0 é o sistema operador nativo do harness para trabalho agentic.

Os vídeos devem provar essa afirmação diretamente:

- uma camada reutilizável entre Claude Code, Codex, OpenCode, Cursor, Gemini, Zed,
  GitHub Copilot e fluxos de trabalho de terminal;
- skills reutilizáveis, rules, hooks, agents, convenções MCP, gates de lançamento e
  fluxos de trabalho de operador;
- `ecc2/` como a direção alpha de control-plane/TUI, não o produto inteiro;
- AgentShield e gates de cadeia de suprimentos como a camada de confiança empresarial;
- OSS permanece gratuito, com GitHub Sponsors, ECC Tools Pro e consultoria como a
  superfície de financiamento.

Não enquadre o lançamento como uma renomeação, pivô, pacote de configuração ou pacote exclusivo do Claude.

## Entradas Privadas

Não faça commit de imagens brutas, transcrições JSON ou exportações de timeline.

Os operadores devem apontar o validador para mídia local usando variáveis de ambiente:

```bash
ECC_VIDEO_SOURCE_ROOT=/path/to/ecc_2_raws \
ECC_VIDEO_RELEASE_SUITE_ROOT=/path/to/ecc_2_release_suite \
npm run release:video-suite -- --format json
```

`ECC_VIDEO_SOURCE_ROOT` deve conter imagens de prova e pode conter um subdiretório `_edited/`
com clipes de fonte editados. `ECC_VIDEO_RELEASE_SUITE_ROOT` deve conter `edl/`, `segments/`,
`renders/`, `timelines/` e `transcripts/`.

## Inventário de Fontes

Estes basenames são as entradas locais obrigatórias para o validador da suite de lançamento.

| Asset | Trilha | Prova |
| --- | --- | --- |
| `longform-full-wide.mp4` | Vídeo principal de lançamento | sistema operador, direção de control-plane, prova de fechamento |
| `sf-longform-full.mp4` | Vídeo principal de lançamento | abertura de contexto estruturado |
| `sf-thread-2-whatisecc.mp4` | O que é ECC | clareza de categoria e explicação do GitHub App |
| `sf-thread-4-security.mp4` | Prova de segurança | AgentShield, hooks, MCP, risco de permissão |
| `thread-2-ghapp-money.mp4` | Clipe de dinheiro/prova | OSS mais hospedagem e serviços pagos |
| `architecture-2-wide.mp4` | B-roll | arquitetura nativa do harness |
| `terminal-scan-2-wide.mp4` | Prova de instalação | fluxo de trabalho de terminal e confiança na instalação |
| `new_site_raw.mp4` | B-roll | site e superfície do produto |
| `coverage-montage-wide.mp4` | Cobertura/prova social | distribuição e prova social |
| `metrics-ticker-2-wide.mp4` | Clipe de dinheiro/prova | prova de tração e funil |
| `growth-timeline-2-wide.mp4` | Cobertura/prova social | timeline de impulso do lançamento |
| `gh_app_1.png` | Clipe de dinheiro/prova | superfície do GitHub App hospedado |
| `star_history.png` | Cobertura/prova social | gráfico de adoção OSS |
| `x_analytics.png` | Cobertura/prova social | prova de distribuição social |
| `100k.png` | Cobertura/prova social | prova de marco de alcance |

## Entregáveis

| Entregável | Duração | Proporção | Output |
| --- | ---: | --- | --- |
| Vídeo principal de lançamento | 90-150s | 16:9 | `ecc-2-primary-launch.mp4` |
| Clipe de prova de instalação | 25-35s | 16:9 e 9:16 | `ecc-2-install-proof-*` |
| Clipe "O que é ECC" | 45-60s | 16:9 e 9:16 | `ecc-2-what-is-ecc-*` |
| Clipe de prova de segurança | 45-60s | 16:9 e 9:16 | `ecc-2-security-proof-*` |
| Clipe de dinheiro/prova | 30-45s | 16:9 e 9:16 | `ecc-2-money-proof-*` |
| Clipe de cobertura/prova social | 30-45s | 16:9 e 9:16 | `ecc-2-social-proof-*` |

## Vídeo Principal de Lançamento

O assembly bruto v1 do vídeo principal de lançamento é a espinha atual. Deve permanecer
liderado pela fala, com prova do produto cobrindo cortes abruptos e falas antigas.

| Ordem | Fonte | Entrada | Saída | Uso |
| --- | --- | ---: | ---: | --- |
| 01 | `sf-longform-full.mp4` | 161.12 | 177.68 | Abertura mais limpa: ECC como contexto estruturado com skills, commands, agents, hooks e configuração de projeto. |
| 02 | `thread-2-ghapp-money.mp4` | 21.84 | 30.40 | Tese direta do produto: otimização de harness agentic. |
| 03 | `thread-2-ghapp-money.mp4` | 41.00 | 59.72 | Não é mais um harness; ECC é a camada e as ferramentas sobre os harnesses. |
| 04 | `longform-full-wide.mp4` | 254.60 | 271.20 | IDE agentic, observabilidade, rastreamento e direção de control-plane multi-agent. |
| 05 | `sf-thread-2-whatisecc.mp4` | 40.08 | 60.60 | GitHub App analisa repositórios e injeta skills, prompts e hooks específicos do projeto. |
| 06 | `sf-thread-4-security.mp4` | 17.60 | 32.72 | Configuração de risco de segurança: hooks, servidores MCP, permissões. |
| 07 | `sf-thread-4-security.mp4` | 37.28 | 51.32 | Prova do AgentShield: rules, categorias, notas, secrets, injeção, exfiltração. |
| 08 | `thread-2-ghapp-money.mp4` | 59.72 | 75.96 | Modelo de negócios OSS-first mais superfície do GitHub App gerenciado. |
| 09 | `longform-full-wide.mp4` | 507.34 | 525.62 | Fechar com fluxos de trabalho, envio testado e trabalho diário seguro com agent. |

Artefatos locais obrigatórios do rough v1:

- `edl/primary-launch.edl.md`
- `timelines/primary-launch-v1.timeline.json`
- `renders/ecc-2-primary-launch-rough-v1.mp4`
- `renders/ecc-2-primary-launch-rough-v1.captions.srt`
- `segments/primary-launch-v1/01-structured-context.mp4`
- `segments/primary-launch-v1/02-agentic-harness-optimization.mp4`
- `segments/primary-launch-v1/03-not-another-harness.mp4`
- `segments/primary-launch-v1/04-agentic-ide-surface.mp4`
- `segments/primary-launch-v1/05-github-app-proof.mp4`
- `segments/primary-launch-v1/06-security-risk.mp4`
- `segments/primary-launch-v1/07-agentshield-proof.mp4`
- `segments/primary-launch-v1/08-oss-paid-model.mp4`
- `segments/primary-launch-v1/09-close-shipping-system.mp4`

## Outputs dos Candidatos a Publicação

O validador de lançamento também espera o conjunto atual de candidatos a publicação em
`renders/publish-candidates/`. Estes ainda são arquivos de revisão local, não uploads
públicos ou mídia com commit.

| Output | Alvo |
| --- | --- |
| `ecc-2-primary-launch.mp4` | 90-150s, 1920x1080, áudio |
| `ecc-2-primary-launch.captions.srt` | legendas principais |
| `ecc-2-install-proof-wide.mp4` | 25-35s, 1920x1080, áudio |
| `ecc-2-install-proof-vertical.mp4` | 25-35s, 1080x1920, áudio |
| `ecc-2-what-is-ecc-wide.mp4` | 45-60s, 1920x1080, áudio |
| `ecc-2-what-is-ecc-vertical.mp4` | 45-60s, 1080x1920, áudio |
| `ecc-2-security-proof-wide.mp4` | 45-60s, 1920x1080, áudio |
| `ecc-2-security-proof-vertical.mp4` | 45-60s, 1080x1920, áudio |
| `ecc-2-money-proof-wide.mp4` | 30-45s, 1920x1080, áudio |
| `ecc-2-money-proof-vertical.mp4` | 30-45s, 1080x1920, áudio |
| `ecc-2-social-proof-wide.mp4` | 30-45s, 1920x1080, áudio |
| `ecc-2-social-proof-vertical.mp4` | 30-45s, 1080x1920, áudio |

## Fluxo de trabalho compatível com video-use

Use a mesma forma de produção do Video Use mantendo a pilha de mídia específica do ECC
intacta:

1. Trate dados de transcrição e timeline como a superfície de edição.
2. Mantenha a inspeção visual sob demanda: tiras de filme, composições de forma de onda/timeline,
   ou amostras de quadros apenas em pontos de corte ambíguos.
3. Proponha a estratégia de edição e o EDL antes de renderizar.
4. Corte deterministicamente com FFmpeg.
5. Adicione sobreposições de prova com Remotion ou Manim onde as afirmações do produto
   precisam de evidência visual.
6. Exporte o MP4 mais o estado editável de timeline e legenda.
7. Execute autoavaliação de limite de corte, áudio, legenda, quadro preto e afirmação
   do produto antes de qualquer upload ou post social.

Não despeje quadros no repositório. Amostras de quadros usadas para autoavaliação pertencem
ao workspace local da suite de lançamento.

## Plano de Captura do Navegador

Use o Browser ou captura de área de trabalho equivalente apenas para imagens de prova que
devem estar atualizadas no dia do lançamento:

| Superfície | Captura |
| --- | --- |
| Repositório GitHub | README hero, bloco de instalação, links de sponsor, notas de lançamento |
| Plugin Codex | caminho de instalação via marketplace do repositório e README local do plugin |
| Pacote OpenCode | instalação do pacote e banner do plugin |
| ECC Tools Pro | página de faturamento/produto somente após a leitura de retorno ao vivo confirmar as afirmações |
| AgentShield | output CLI, visualização de categoria de política, gate de cadeia de suprimentos |
| `ecc2/` | superfície de control-plane/TUI alpha com enquadramento alpha |

Se uma superfície não estiver ao vivo, use uma captura local do navegador e rotule-a como
prova local ou release-candidate. Não afirme disponibilidade de marketplace, faturamento
ou diretório oficial antes de existir evidência.

## Gate de Autoavaliação

Execute o validador:

```bash
ECC_VIDEO_SOURCE_ROOT=/path/to/ecc_2_raws \
ECC_VIDEO_RELEASE_SUITE_ROOT=/path/to/ecc_2_release_suite \
npm run release:video-suite -- --format json
```

Depois verifique manualmente a renderização final para:

- a autoavaliação do validador passa para a renderização principal: 90-150 segundos, pelo menos
  1280x720, stream de vídeo presente, stream de áudio presente e output não vazio;
- a autoavaliação do validador passa para o conjunto de candidatos a publicação: MP4 principal mais
  legendas e cinco clipes curtos em formatos wide e vertical;
- o QA visual do validador reporta zero segmentos de quadro preto detectados para cada
  MP4 candidato a publicação;
- nenhum quadro em branco ou exposição acidental da área de trabalho;
- nenhum nome de repositório desatualizado, pivô, renomeação ou enquadramento exclusivo do Claude nas legendas;
- nenhuma legenda que reescreva a fala em uma afirmação falsa;
- nenhuma URL desatualizada, comandos de instalação antigos ou links de repositório pré-renomeação;
- nenhum número interno de MRR a menos que o post explicitamente precise deles;
- continuidade de áudio em todos os cortes;
- os primeiros 10 segundos dizem claramente o que é ECC;
- o CTA final encaminha para o repositório, sponsor, Pro ou consultoria sem desordem.

## Não Publique Se

- `npm run release:video-suite` não estiver pronto para os roots de fonte locais.
- A renderização principal de lançamento estiver fora da meta de 90-150 segundos.
- As legendas mencionarem o nome antigo do repositório.
- A prova do produto depender de telas privadas, secrets, dados de clientes ou caminhos
  locais brutos.
- As afirmações de URL de lançamento, npm, plugin, faturamento ou marketplace superarem as
  evidências em `publication-readiness.md`.
