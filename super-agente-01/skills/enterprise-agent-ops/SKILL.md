---
name: enterprise-agent-ops
description: Opere cargas de trabalho de Agent de longa duração com observabilidade, limites de segurança e gerenciamento de ciclo de vida.
metadata:
  origin: ECC
---

# Enterprise Agent Ops

Use esta skill para sistemas de Agent hospedados em nuvem ou em execução contínua que precisam de controles operacionais além de sessões únicas de CLI.

## Domínios Operacionais

1. ciclo de vida de runtime (iniciar, pausar, parar, reiniciar)
2. observabilidade (logs, métricas, traces)
3. controles de segurança (escopos, permissões, kill switches)
4. gerenciamento de mudanças (rollout, rollback, auditoria)

## Controles de Base

- artefatos de deployment imutáveis
- credenciais de menor privilégio
- injeção de segredos em nível de ambiente
- orçamentos rígidos de timeout e retry
- log de auditoria para ações de alto risco

## Métricas a Acompanhar

- taxa de sucesso
- média de retries por tarefa
- tempo até a recuperação
- custo por tarefa bem-sucedida
- distribuição de classes de falha

## Padrão de Incidente

Quando as falhas disparam:
1. congele novos rollouts
2. capture traces representativos
3. isole a rota em falha
4. corrija com a menor mudança segura possível
5. execute verificações de regressão + segurança
6. retome gradualmente

## Integrações de Deployment

Esta skill combina com:
- fluxos de trabalho do PM2
- serviços systemd
- orquestradores de containers
- gates de CI/CD
