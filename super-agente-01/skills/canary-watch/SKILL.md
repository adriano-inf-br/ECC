---
name: canary-watch
description: Use esta skill para monitorar e verificar uma URL implantada após releases — verifica endpoints HTTP, streams SSE, ativos estáticos, erros de console e regressões de desempenho após deploys, merges ou upgrades de dependências. Verificação de smoke / canary / pós-deploy.
metadata:
  origin: ECC
---

# Canary Watch — Monitoramento Pós-Deploy

## Quando Usar

- Depois de implantar em produção ou staging
- Depois de fazer merge de um PR arriscado
- Quando você quer verificar se uma correção realmente corrigiu o problema
- Monitoramento contínuo durante uma janela de lançamento
- Após upgrades de dependências

## Como Funciona

Monitora uma URL implantada em busca de regressões. Roda em loop até ser interrompido ou até a janela de observação expirar.

### O Que Ele Observa

```
1. Status HTTP — a página está retornando 200?
2. Erros de Console — novos erros que não existiam antes?
3. Falhas de Rede — chamadas de API falhando, respostas 5xx?
4. Desempenho — regressão de LCP/CLS/INP vs baseline?
5. Conteúdo — elementos-chave sumiram? (h1, nav, footer, CTA)
6. Saúde de API — endpoints críticos respondem dentro do SLA?
7. Ativos Estáticos — requisições de JS, CSS, imagem e fonte retornam 2xx/3xx com os content types esperados?
8. Streams SSE — endpoints de event-stream conectam e recebem um evento inicial ou heartbeat?
```

### Modos de Observação

**Verificação rápida** (padrão): passada única, reporta resultados
```
/canary-watch https://myapp.com
```

**Observação sustentada**: verifica a cada N minutos por M horas
```
/canary-watch https://myapp.com --interval 5m --duration 2h
```

**Modo diff**: compara staging vs produção
```
/canary-watch --compare https://staging.myapp.com https://myapp.com
```

### Limiares de Alerta

```yaml
critical:  # immediate alert
  - HTTP status != 200
  - Console error count > 5 (new errors only)
  - LCP > 4s
  - API endpoint returns 5xx
  - Static asset returns 4xx/5xx
  - SSE endpoint cannot connect or drops before first heartbeat

warning:   # flag in report
  - LCP increased > 500ms from baseline
  - CLS > 0.1
  - New console warnings
  - Response time > 2x baseline
  - Static asset content type changed unexpectedly
  - SSE heartbeat latency > 2x baseline

info:      # log only
  - Minor performance variance
  - New network requests (third-party scripts added?)
```

### Notificações

Quando um limiar crítico é ultrapassado:
- Notificação de desktop (macOS/Linux)
- Opcional: webhook do Slack/Discord
- Registrar em `~/.claude/canary-watch.log`

## Saída

```markdown
## Relatório de Canary — myapp.com — 2026-03-23 03:15 PST

### Status: HEALTHY ✓

| Verificação | Resultado | Baseline | Delta |
|-------|--------|----------|-------|
| HTTP | 200 ✓ | 200 | — |
| Erros de console | 0 ✓ | 0 | — |
| LCP | 1.8s ✓ | 1.6s | +200ms |
| CLS | 0.01 ✓ | 0.01 | — |
| API /health | 145ms ✓ | 120ms | +25ms |
| Ativos estáticos | 42/42 ✓ | 42/42 | — |
| SSE /events | conectado ✓ | conectado | +80ms heartbeat |

### Nenhuma regressão detectada. O deploy está limpo.
```

## Integração

Combine com:
- `/browser-qa` para verificação pré-deploy
- Hooks: adicione como um hook PostToolUse no `git push` para verificar automaticamente após deploys
- CI: rode no GitHub Actions após a etapa de deploy
