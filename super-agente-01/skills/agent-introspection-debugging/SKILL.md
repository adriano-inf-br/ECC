---
name: agent-introspection-debugging
description: Fluxo de trabalho estruturado de autodepuração para falhas de agents de IA usando captura, diagnóstico, recuperação contida e relatórios de introspecção.
metadata:
  origin: ECC
---

# Depuração por Introspecção de Agent

Use esta skill quando uma execução de agent está falhando repetidamente, consumindo tokens sem progresso, entrando em loop nas mesmas tools ou se desviando da tarefa pretendida.

Esta é uma skill de fluxo de trabalho, não um runtime oculto. Ela ensina o agent a depurar a si mesmo de forma sistemática antes de escalar para um humano.

## Quando Ativar

- Falhas de limite máximo de tool calls / limite de loop
- Retries repetidos sem progresso para frente
- Crescimento de contexto ou desvio de prompt que começa a degradar a qualidade da saída
- Incompatibilidade de estado do sistema de arquivos ou do ambiente entre a expectativa e a realidade
- Falhas de tool que provavelmente são recuperáveis com diagnóstico e uma ação corretiva menor

## Limites de Escopo

Ative esta skill para:
- capturar o estado de falha antes de tentar novamente às cegas
- diagnosticar padrões comuns de falha específicos de agent
- aplicar ações de recuperação contidas
- produzir um relatório de depuração estruturado e legível por humanos

Não use esta skill como fonte primária para:
- verificação de recurso após mudanças de código; use `verification-loop`
- depuração específica de framework quando uma skill ECC mais estreita já existir
- promessas de runtime que o harness atual não consegue impor automaticamente

## Loop de Quatro Fases

### Fase 1: Captura de Falha

Antes de tentar se recuperar, registre a falha com precisão.

Capture:
- tipo de erro, mensagem e stack trace quando disponíveis
- a última sequência de tool calls significativa
- o que o agent estava tentando fazer
- a pressão de contexto atual: prompts repetidos, logs colados superdimensionados, planos duplicados ou notas descontroladas
- as suposições de ambiente atuais: cwd, branch, estado de serviço relevante, arquivos esperados

Template mínimo de captura:

```markdown
## Failure Capture
- Session / task:
- Goal in progress:
- Error:
- Last successful step:
- Last failed tool / command:
- Repeated pattern seen:
- Environment assumptions to verify:
```

### Fase 2: Diagnóstico de Causa Raiz

Combine a falha com um padrão conhecido antes de mudar qualquer coisa.

| Padrão | Causa Provável | Verificação |
| --- | --- | --- |
| Máximo de tool calls / mesmo comando repetido | caminho de loop ou de observer sem saída | inspecione as últimas N tool calls em busca de repetição |
| Estouro de contexto / raciocínio degradado | notas sem limite, planos repetidos, logs superdimensionados | inspecione o contexto recente em busca de duplicação e volume de baixo sinal |
| `ECONNREFUSED` / timeout | serviço indisponível ou porta errada | verifique a saúde do serviço, a URL e as suposições de porta |
| `429` / esgotamento de quota | tempestade de retries ou falta de backoff | conte chamadas repetidas e inspecione o espaçamento dos retries |
| arquivo ausente após escrita / diff obsoleto | race, cwd errado ou desvio de branch | reverifique o caminho, o cwd, o git status e a existência real do arquivo |
| testes ainda falhando após o "fix" | hipótese errada | isole o teste exato que falha e re-derive o bug |

Perguntas de diagnóstico:
- isto é uma falha de lógica, falha de estado, falha de ambiente ou falha de política?
- o agent perdeu o objetivo real e começou a otimizar a subtarefa errada?
- a falha é determinística ou transiente?
- qual é a menor ação reversível que validaria o diagnóstico?

### Fase 3: Recuperação Contida

Recupere-se com a menor ação que muda a superfície de diagnóstico.

Ações de recuperação seguras:
- pare os retries repetidos e reformule a hipótese
- corte o contexto de baixo sinal e mantenha apenas o objetivo ativo, os bloqueadores e as evidências
- reverifique o estado real do sistema de arquivos / branch / processo
- restrinja a tarefa a um comando que falha, um arquivo ou um teste
- mude do raciocínio especulativo para a observação direta
- escale para um humano quando a falha for de alto risco ou bloqueada externamente

Não afirme ações de autocorreção não suportadas como "resetar o estado do agent" ou "atualizar a config do harness" a menos que você esteja de fato fazendo isso por meio de tools reais no ambiente atual.

Checklist de recuperação contida:

```markdown
## Recovery Action
- Diagnosis chosen:
- Smallest action taken:
- Why this is safe:
- What evidence would prove the fix worked:
```

### Fase 4: Relatório de Introspecção

Termine com um relatório que torne a recuperação legível para o próximo agent ou humano.

```markdown
## Agent Self-Debug Report
- Session / task:
- Failure:
- Root cause:
- Recovery action:
- Result: success | partial | blocked
- Token / time burn risk:
- Follow-up needed:
- Preventive change to encode later:
```

## Heurísticas de Recuperação

Prefira estas intervenções nesta ordem:

1. Reformule o objetivo real em uma frase.
2. Verifique o estado do mundo em vez de confiar na memória.
3. Reduza o escopo que está falhando.
4. Rode uma verificação discriminante.
5. Só então tente novamente.

Padrão ruim:
- tentar a mesma ação três vezes com uma redação ligeiramente diferente

Padrão bom:
- capturar a falha
- classificar o padrão
- rodar uma verificação direta
- mudar o plano apenas se a verificação a sustentar

## Integração com a ECC

- Use `verification-loop` após a recuperação se o código foi alterado.
- Use `continuous-learning-v2` quando o padrão de falha vale a pena virar um instinto ou skill futura.
- Use `council` quando o problema não é falha técnica mas ambiguidade de decisão.
- Use `workspace-surface-audit` se a falha veio de estado local conflitante ou desvio do repositório.

## Padrão de Saída

Quando esta skill está ativa, não termine apenas com "eu corrigi".

Sempre forneça:
- o padrão de falha
- a hipótese de causa raiz
- a ação de recuperação
- a evidência de que a situação agora está melhor ou ainda bloqueada
