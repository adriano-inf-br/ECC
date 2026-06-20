# Prontidão de Observabilidade do ECC 2.0

O ECC 2.0 deve ser observável antes de se tornar mais autônomo. O padrão local é um gate
de prontidão opt-in, de propriedade do repositório, que verifica se os sinais principais
estão presentes sem enviar telemetria para nenhum lugar.

Execute:

```bash
npm run observability:ready
node scripts/observability-readiness.js --format json
```

O gate é determinístico e seguro para executar em CI. Ele apenas verifica os arquivos do
repositório e relata se a superfície de release pode expor os sinais que um operador precisa.

## Modelo de Sinais

- Status ao vivo: `scripts/loop-status.js` pode emitir JSON, observar loops ativos e
  gravar snapshots para dashboards ou handoffs.
- Contrato HUD/status: `docs/architecture/hud-status-session-control.md` e
  `examples/hud-status-contract.json` definem o payload portátil para contexto,
  chamadas de ferramentas, agentes ativos, tarefas, verificações, custo, risco, filas,
  controles de sessão e sincronização de rastreadores.
- Rastreamentos de sessão: `scripts/session-inspect.js` pode inspecionar sessões do Claude,
  dmux e baseadas em adaptador, e gravar snapshots canônicos.
- Baseline de harness: `scripts/harness-audit.js` fornece um scorecard repetível para
  cobertura de ferramentas, eficiência de contexto, gates de qualidade, persistência de
  memória, cobertura de evals, guardrails de segurança e eficiência de custo.
- Atividade de ferramentas: `scripts/hooks/session-activity-tracker.js` registra eventos
  `tool-usage.jsonl` locais que o ECC2 pode sincronizar.
- Registro de risco: `ecc2/src/observability/mod.rs` pontua chamadas de ferramentas e
  armazena um registro paginado para revisão.
- Sincronização de progresso: `docs/architecture/progress-sync-contract.md` define como
  GitHub, Linear, handoffs locais, o roadmap do repositório e `scripts/work-items.js`
  permanecem alinhados durante lotes de merge e revisões de gate de release.
- Segurança de release: `docs/releases/2.0.0-rc.1/publication-readiness.md`,
  evidências pós-hardening, resposta a incidentes da cadeia de suprimentos, validação de
  segurança do fluxo de trabalho, verificações de npm pack e testes de superfície de release
  devem estar presentes antes de qualquer tag pública, publicação de pacote, submissão de
  plugin ou ação de anúncio.

## Pressão de Referência

O ecossistema atual de ferramentas de agentes está convergindo para as mesmas necessidades
operacionais:

- dmux, Orca e Superset enfatizam worktrees isolados mais um lugar para ver o estado
  do agente e o trabalho de merge/revisão.
- Claude HUD torna o contexto, a atividade de ferramentas, a atividade de agentes e o
  progresso de tarefas visíveis dentro do loop de codificação.
- Autocontext registra cada execução como rastreamentos duráveis, relatórios, artefatos e
  melhorias reutilizáveis.
- Meta-Harness trata o próprio harness como algo a avaliar e melhorar, o que requer logs
  limpos do comportamento do propositor e dos resultados.
- Zed e OpenCode enfatizam superfícies de controle de agentes, mudanças revisáveis e
  configuração específica do harness que ainda deve preservar o conhecimento portátil do
  projeto.

A resposta do ECC não é uma dependência de análise hospedada por padrão. O primeiro gate
de release-candidate é local e baseado em arquivo. A telemetria hospedada pode vir depois,
mas somente depois que o modelo de evento local for útil o suficiente para ser confiável.

## Fluxo de Trabalho do Operador

1. Executar `npm run observability:ready`.
2. Executar `npm run harness:audit -- --format json` para o scorecard mais amplo de harness.
3. Executar `node scripts/loop-status.js --json --write-dir .ecc/loop-status`
   durante lotes autônomos mais longos.
4. Revisar `examples/hud-status-contract.json` antes de conectar um novo HUD ou
   dashboard do operador.
5. Executar `node scripts/session-inspect.js --list-adapters` para confirmar quais
   superfícies de sessão estão disponíveis.
6. Executar `node scripts/work-items.js sync-github --repo <owner/repo>` antes de
   depender do status de item de trabalho local para um repositório rastreado.
7. Usar logs de ferramentas do ECC2 para operações arriscadas, análise de conflitos e
   revisão de handoff antes de aumentar a autonomia.
8. Reexecutar as verificações de evidências de segurança de release antes de qualquer ação
   de release público: prontidão de publicação, resposta a incidentes da cadeia de
   suprimentos, validação de segurança do fluxo de trabalho, superfície do pacote e testes
   de superfície de release.

O estado final é prático: antes de pedir ao ECC para executar loops multi-agente maiores,
o operador pode provar que o sistema tem status ao vivo, rastreamentos de sessão duráveis,
scorecards de baseline, um registro de risco local e um contrato de sincronização de progresso
que evita que GitHub, Linear, handoffs e evidências de roadmap se dispersem.
