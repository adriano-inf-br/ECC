# Contrato de Sincronização de Progresso

O ECC 2.0 rastreia o estado de execução entre GitHub, Linear, handoffs locais e o roadmap
do repositório. Este contrato define a evidência mínima necessária antes que uma atualização
de status possa afirmar que uma rota está atualizada.

## Fontes de Verdade

| Superfície | Papel | Regra atual |
| --- | --- | --- |
| PRs/issues/discussões do GitHub | Fila pública e estado de revisão | Verificar novamente as contagens ao vivo antes de cada lote de merge significativo e antes da aprovação de release. |
| Projeto Linear | Roadmap executivo e atualização de status para stakeholders | Usar documentos de projeto e comentários de projeto/issue porque as atualizações de status do projeto estão desabilitadas neste workspace; criar/reutilizar issues para rotas de execução duráveis. |
| Handoff local | Continuidade durável do operador | Atualizar o handoff ativo após cada lote de merge, drenagem de fila, gate de release ignorado ou ação externa bloqueada. |
| Roadmap do repositório | Espelho de planejamento auditável | Manter `docs/ECC-2.0-GA-ROADMAP.md` alinhado com evidências de PRs mesclados e gates não resolvidos. |
| `scripts/work-items.js` | Bridge do rastreador local | Sincronizar PRs/issues do GitHub no armazenamento de itens de trabalho SQLite para snapshots de status e acompanhamento bloqueado. |

## Rotas de Fluxo

O espelho do repositório usa estas rotas de fluxo para que o trabalho do ECC não colapse
em um único backlog indiferenciado:

- Higiene de fila e salvamento de trabalho desatualizado
- Release, nomenclatura, publicação de plugin e anúncios
- Conformidade do adaptador de harness
- Observabilidade local, HUD/status e controle de sessão
- Loops de avaliador/RAG e harness de auto-aperfeiçoamento
- Plataforma de segurança empresarial AgentShield
- Cobrança ECC Tools, verificações de risco de PR, análise profunda e sincronização com Linear
- Auditoria de artefatos legados e pendências de tradutor/revisão manual

Cada rota de fluxo precisa de um artefato proprietário, uma fonte de evidência atual e
uma próxima ação. Uma rota não está atualizada se qualquer um desses três campos estiver
ausente.

## Atualização de Lote de Merge Significativo

Após um lote de merge significativo, atualizar o Linear e o handoff com:

1. Contagens atuais da fila pública para repositórios GitHub rastreados.
2. Números de PRs mesclados, IDs de commit e evidências de validação.
3. Gates de release alterados, se houver.
4. Trabalho adiado ou ignorado e o motivo explícito.
5. Os próximos um ou dois slices de implementação.

Quando as atualizações de status do projeto Linear estiverem indisponíveis, usar um documento
de projeto mais comentários de projeto/issue em vez de criar issues de espaço reservado. A
capacidade de issues está disponível para rotas de execução duráveis, mas não use essa
capacidade de issues como substituta para status de projeto baseado em evidências. Criar ou
reutilizar issues com título exato somente quando a rota precisar de um proprietário de
execução durável, e vincular essas issues a evidências do repositório.

## Fronteira de Tempo Real

O caminho de tempo real local é baseado em arquivo por padrão:

- `node scripts/work-items.js sync-github --repo <owner/repo>` importa o estado atual de
  PR e issue do GitHub para o armazenamento de itens de trabalho SQLite.
- `node scripts/status.js --json` e `node scripts/work-items.js list --json`
  expõem o estado local para um HUD, handoff ou sincronização posterior com o Linear.
- O Linear permanece a superfície de status externo; o repositório não requer telemetria
  hospedada para estar pronto para release.

A telemetria hospedada, como PostHog, pode ser adicionada posteriormente, mas deve consumir
o mesmo modelo de eventos em vez de se tornar uma segunda fonte de verdade.

## Gate de Release

Não publicar, adicionar tag, anunciar, submeter pacotes no marketplace ou afirmar
disponibilidade de plugin apenas com base neste contrato. A prontidão para release ainda
requer os documentos de evidência de prontidão de publicação, verificações frescas de fila,
verificações de pacote, verificações de plugin e aprovação explícita do mantenedor.
