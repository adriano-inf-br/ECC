# Dashboard de Prontidão do Operador ECC

Este dashboard é gerado por `npm run operator:dashboard`. É um snapshot do operador, não uma aprovação de release.

Gerado: 2026-05-17T05:08:31.916Z
Commit: 6d130cfcd5d06b42c7eb30be8e109cfa87fde197
Status: trabalho pendente

## Status Atual

| Área | Status | Evidência |
| --- | --- | --- |
| Fila de PRs | Atual | 6 PRs abertos nos repositórios rastreados |
| Fila de issues | Atual | 3 issues abertas nos repositórios rastreados |
| Discussions | Atual | 0 precisam de toque do mantenedor; 0 sem resposta aceita |
| Worktree local | Precisa de trabalho | 7 arquivos sujos bloqueadores; 1 entrada suja ignorada |
| Geração do dashboard | Atual | auditoria da plataforma pronta: true; GitHub ignorado: false |
| Publicação | Não concluída | gates de release, npm, plugin, faturamento e anúncio rastreados abaixo |

## Checklist de Prompt-Para-Artefato

| Requisito objetivo | Artefato ou gate | Status | Evidência | Lacuna |
| --- | --- | --- | --- | --- |
| Manter PRs públicos abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js | atual | 6 PRs abertos em 5 repositórios rastreados | repetir antes do release |
| Manter issues públicas abaixo de 20 | varredura ao vivo do GitHub em scripts/platform-audit.js | atual | 3 issues abertas em 5 repositórios rastreados | repetir antes do release |
| Responder e gerenciar discussions do repositório | resumo de discussions em scripts/platform-audit.js | atual | 0 precisam de toque do mantenedor; 0 discussions respondíveis sem resposta aceita | repetir antes do release |
| Incorporar dashboard de conclusão ITO-44 em um comando repetível | npm run operator:dashboard | completo | script de pacote operator:dashboard existe | manter dashboard gerado anexado à evidência de publicação |
| Preview pack do ECC 2.0 pronto | docs/releases/2.0.0-rc.1/preview-pack-manifest.md | em_progresso | manifesto do preview pack está na árvore | aprovação de release com checkout limpo final e evidência de publicação ainda pendentes |
| Incluir skills especializadas do Hermes com segurança | docs/HERMES-SETUP.md e skills/hermes-imports/SKILL.md | em_progresso | configuração e skill de importação do Hermes estão presentes | smoke final do preview-pack e revisão de release pendentes |
| Preparar caminhos de mudança de nome, plugin Claude e plugin Codex | naming-and-publication-matrix mais publication-readiness | em_progresso | matrix de nomenclatura e gates de prontidão do plugin existem | tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação |
| Preparar notas de release, artigos, tweets e notificações push | arquivos sociais e de cópia de release em docs/releases/2.0.0-rc.1 | em_progresso | notas de release, thread no X e rascunho do LinkedIn estão presentes | atualização respaldada por URL e aprovação de publicação ainda pendentes |
| Avançar iteração empresarial do AgentShield | evidência de PR do AgentShield mais roadmap empresarial | em_progresso | evidência de PR empresarial do AgentShield está espelhada no roadmap de GA | automação de fluxo de trabalho em torno de rollout protegido e UX de revisão de runtime mais rica pendentes após promoção de política enviada |
| Avançar pagamentos nativos das ECC Tools e aplicativo harness-agnostic nativo de IA | evidência de PR das ECC Tools, gate de faturamento, lanes de análise hospedada | em_progresso | gate de anúncio de faturamento, lanes de análise hospedada, consumo de fleet-summary do AgentShield, caminhos de evidência de achados hospedados e vinculação de política de rota de harness estão espelhados no roadmap de GA | readback de conta de teste ao vivo no Marketplace, telemetria de promoção hospedada e UX de revisão do operador mais rica pendentes |
| Auditar, podar ou anexar trabalho legado | docs/stale-pr-salvage-ledger.md e inventário legado | em_progresso | ledger de recuperação legado e rastreamento ITO-55 estão presentes | cauda final de tradução/revisão manual permanece |
| Manter roadmap do Linear detalhado e rastreamento de progresso sincronizado | espelho de projeto Linear mais contrato de sincronização de progresso | em_progresso | espelho do repositório e contrato de sincronização de progresso estão presentes | sincronização recorrente de status do Linear e sincronização em tempo real produtizada permanecem pendentes |
| Fornecer observabilidade do ECC 2.0 para uso próprio | gate de prontidão de observabilidade | completo | comando observability:ready e doc de prontidão existem | implementação de runtime/dashboard pode continuar após os gates de release |
| Manter loop de proteção Mini Shai-Hulud/TanStack atualizado | vigilância de cadeia de suprimentos mais runbook | atual | vigilância agendada de cadeia de suprimentos agora emite artefatos de IOC e atualização de fontes de advisory | sincronização de status do Linear permanece como seguimento ITO-57 após cada lote significativo de merges |

## Principais Ações

- `ecc-preview-pack`: aprovação de release com checkout limpo final e evidência de publicação ainda pendentes
- `hermes-specialized-skills`: smoke final do preview-pack e revisão de release pendentes
- `naming-and-plugin-publication`: tag/push real, envio ao marketplace e escolha final do canal permanecem gateados por aprovação
- `release-notes-and-notifications`: atualização respaldada por URL e aprovação de publicação ainda pendentes
- `agentshield-enterprise-iteration`: automação de fluxo de trabalho em torno de rollout protegido e UX de revisão de runtime mais rica pendentes após promoção de política enviada
- `ecc-tools-next-level`: readback de conta de teste ao vivo no Marketplace, telemetria de promoção hospedada e UX de revisão do operador mais rica pendentes
- `legacy-salvage`: cauda final de tradução/revisão manual permanece
- `linear-roadmap-and-progress`: sincronização recorrente de status do Linear e sincronização em tempo real produtizada permanecem pendentes

## Próxima Ordem de Trabalho

1. Regenerar este dashboard a partir do commit final de release antes de registrar evidência de publicação.
2. Continuar ITO-57 com sincronização de status do Linear para o relatório de fontes de advisory da vigilância agendada de cadeia de suprimentos.
3. Avançar readback de conta de teste ao vivo no Marketplace das ECC Tools antes de publicar cópia de anúncio de pagamentos nativos.
4. Retomar ITO-45, ITO-46 e ITO-56 somente após o dashboard gerado e os gates finais de release serem atualizados.
