---
description: Reformula requisitos, avalia riscos e cria um plano de implementação passo a passo. ESPERE a CONFIRMAÇÃO do usuário antes de tocar em qualquer código.
argument-hint: "[descrição da funcionalidade | path/to/*.prd.md]"
---

# Comando Plan

Este comando cria um plano de implementação abrangente antes de escrever qualquer código. Ele aceita requisitos em texto livre ou um arquivo markdown de PRD.

Por padrão, roda inline. Não chame a tool Task nem nenhum subagent por padrão. Isso mantém o `/plan` utilizável a partir de instalações de plugin que entregam comandos sem arquivos de agent.

## O Que Este Comando Faz

1. **Reformula Requisitos** - Esclarece o que precisa ser construído
2. **Identifica Riscos** - Expõe possíveis problemas e bloqueadores
3. **Cria Plano em Etapas** - Divide a implementação em fases
4. **Espera Confirmação** - DEVE receber a aprovação do usuário antes de prosseguir

## Quando Usar

Use `/plan` quando:
- Iniciar uma nova funcionalidade
- Fazer mudanças arquiteturais significativas
- Trabalhar em refatorações complexas
- Múltiplos arquivos/componentes forem afetados
- Os requisitos forem pouco claros ou ambíguos

## Como Funciona

O assistente vai:

1. **Analisar a solicitação** e reformular os requisitos em termos claros
2. **Fundamentar o plano** em padrões relevantes do codebase quando o repositório estiver disponível
3. **Dividir em fases** com etapas específicas e acionáveis
4. **Identificar dependências** entre componentes
5. **Avaliar riscos** e potenciais bloqueadores
6. **Estimar complexidade** (Alta/Média/Baixa)
7. **Apresentar o plano** e ESPERAR sua confirmação explícita

## Modos de Entrada

| Entrada | Modo | Comportamento |
|---|---|---|
| `path/to/name.prd.md` | Modo artefato PRD | Lê o PRD, escolhe o próximo marco de entrega pendente ou fase de implementação, e escreve `.claude/plans/{name}.plan.md` |
| Qualquer outro caminho markdown | Modo referência | Lê o arquivo como contexto e produz um plano inline |
| Texto livre | Modo conversacional | Produz um plano inline |
| Entrada vazia | Modo de esclarecimento | Pergunta o que deve ser planejado |

No modo artefato PRD, crie `.claude/plans/` se necessário. Se o PRD contiver uma tabela `Delivery Milestones`, atualize apenas a linha selecionada de `pending` para `in-progress` e defina sua célula `Plan` para o caminho do plano gerado. Se o PRD usar o formato legado `.claude/PRPs/prds/` com `Implementation Phases`, leia-o sem migrar os caminhos.

## Fundamentação em Padrões

Antes de escrever o plano, busque no codebase as convenções que a implementação deve espelhar. Capture o melhor exemplo para cada categoria relevante com referências de arquivo:

| Categoria | O que capturar |
|---|---|
| Nomenclatura | Nomenclatura de arquivo, função, tipo, comando ou script na área afetada |
| Tratamento de erros | Como falhas são levantadas, retornadas, logadas ou tratadas com elegância |
| Logging | Níveis, formato e o que é logado |
| Acesso a dados | Padrões de repositório, serviço, query ou sistema de arquivos |
| Testes | Localização dos arquivos de teste, framework, fixtures e estilo de asserção |

Se não existir código similar, declare isso explicitamente. Não invente um padrão.

## Saída de Artefato PRD

Quando chamado com um arquivo `.prd.md`, escreva o plano em `.claude/plans/{kebab-case-name}.plan.md` usando esta estrutura:

````markdown
# Plan: {Feature Name}

**Source PRD**: {path}
**Selected Milestone**: {milestone or phase name}
**Complexity**: {Small | Medium | Large}

## Summary
{2-3 sentences}

## Patterns to Mirror
| Category | Source | Pattern |
|---|---|---|
| Naming | `path:line` | {short description} |
| Errors | `path:line` | {short description} |
| Tests | `path:line` | {short description} |

## Files to Change
| File | Action | Why |
|---|---|---|
| `path` | CREATE / UPDATE / DELETE | {reason} |

## Tasks
### Task 1: {name}
- **Action**: {what to do}
- **Mirror**: {pattern to follow}
- **Validate**: {command that proves correctness}

## Validation
```bash
{project-specific validation commands}
```

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|

## Acceptance
- [ ] All tasks complete
- [ ] Validation passes
- [ ] Patterns mirrored, not reinvented
````

Depois de escrever o artefato, reporte seu caminho e ESPERE a confirmação antes de escrever código.

## Exemplo de Uso

```
User: /plan I need to add real-time notifications when markets resolve

Assistant:
# Implementation Plan: Real-Time Market Resolution Notifications

## Requirements Restatement
- Send notifications to users when markets they're watching resolve
- Support multiple notification channels (in-app, email, webhook)
- Ensure notifications are delivered reliably
- Include market outcome and user's position result

## Implementation Phases

### Phase 1: Database Schema
- Add notifications table with columns: id, user_id, market_id, type, status, created_at
- Add user_notification_preferences table for channel preferences
- Create indexes on user_id and market_id for performance

### Phase 2: Notification Service
- Create notification service in lib/notifications.ts
- Implement notification queue using BullMQ/Redis
- Add retry logic for failed deliveries
- Create notification templates

### Phase 3: Integration Points
- Hook into market resolution logic (when status changes to "resolved")
- Query all users with positions in market
- Enqueue notifications for each user

### Phase 4: Frontend Components
- Create NotificationBell component in header
- Add NotificationList modal
- Implement real-time updates via Supabase subscriptions
- Add notification preferences page

## Dependencies
- Redis (for queue)
- Email service (SendGrid/Resend)
- Supabase real-time subscriptions

## Risks
- HIGH: Email deliverability (SPF/DKIM required)
- MEDIUM: Performance with 1000+ users per market
- MEDIUM: Notification spam if markets resolve frequently
- LOW: Real-time subscription overhead

## Estimated Complexity: MEDIUM
- Backend: 4-6 hours
- Frontend: 3-4 hours
- Testing: 2-3 hours
- Total: 9-13 hours

**WAITING FOR CONFIRMATION**: Proceed with this plan? (yes/no/modify)
```

## Notas Importantes

**CRÍTICO**: Este comando **NÃO** escreverá nenhum código até você confirmar explicitamente o plano com "yes", "proceed" ou resposta afirmativa similar.

Se quiser mudanças, responda com:
- "modify: [your changes]"
- "different approach: [alternative]"
- "skip phase 2 and do phase 3 first"

## Integração com Outros Comandos

Após o planejamento:
- Use a skill `tdd-workflow` para implementar com desenvolvimento orientado a testes
- Use `/build-fix` se ocorrerem erros de build
- Use `/code-review` para revisar a implementação concluída
- Use `/pr` ou `/prp-pr` para abrir um pull request

> **Precisa dos requisitos primeiro?** Use `/plan-prd` para um PRD enxuto em `.claude/prds/{name}.prd.md`.
>
> **Precisa do fluxo PRP legado?** Use `/prp-plan` para planejamento PRP profundo com artefatos em `.claude/PRPs/`. Use `/prp-implement` para executar esses planos com loops de validação rigorosos.

## Agent Planner Opcional

O ECC também fornece um agent `planner` para instalações manuais que incluem arquivos de agent. Use-o apenas quando o runtime local já expuser esse subagent e o usuário pedir explicitamente que você delegue o planejamento.

Se o subagent `planner` estiver indisponível, continue planejando inline em vez de exibir um erro "Agent type 'planner' not found".

Para instalações manuais, o arquivo-fonte fica em:
`agents/planner.md`
