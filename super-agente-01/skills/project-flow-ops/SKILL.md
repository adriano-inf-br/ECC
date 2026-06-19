---
name: project-flow-ops
description: Operar o fluxo de execução entre GitHub e Linear triando issues e pull requests, vinculando trabalho ativo e mantendo o GitHub como camada pública enquanto o Linear permanece como a camada de execução interna. Use quando o usuário quiser controle do backlog, triagem de PR ou coordenação GitHub-para-Linear.
metadata:
  origin: ECC
---

# Project Flow Ops

Esta skill transforma issues do GitHub, PRs e tarefas do Linear desconectados em um único fluxo de execução.

Use quando o problema for coordenação, não codificação.

## Quando Usar

- Triagem de backlogs abertos de PR ou issue
- Decidir o que pertence ao Linear vs. o que deve permanecer apenas no GitHub
- Vincular trabalho ativo do GitHub a lanes de execução internas
- Classificar PRs em merge, port/rebuild, fechar ou estacionar
- Auditar se comentários de revisão, falhas de CI ou issues obsoletas estão bloqueando a execução

## Modelo Operacional

- **GitHub** é a verdade pública e da comunidade
- **Linear** é a verdade de execução interna para trabalho agendado ativo
- Nem toda issue do GitHub precisa de uma issue no Linear
- Crie ou atualize o Linear apenas quando o trabalho for:
  - ativo
  - delegado
  - agendado
  - multi-funcional
  - importante o suficiente para rastrear internamente

## Fluxo de Trabalho Principal

### 1. Leia a superfície pública primeiro

Colete:

- Estado da issue ou PR do GitHub
- Autor e status do branch
- Comentários de revisão
- Status do CI
- Issues vinculadas

### 2. Classifique o trabalho

Cada item deve terminar em um desses estados:

| Estado | Significado |
|-------|---------|
| Merge | autossuficiente, em conformidade com a política, pronto |
| Port/Rebuild | ideia útil, mas deve ser reimplantada manualmente dentro do ECC |
| Fechar | direção errada, obsoleto, inseguro ou duplicado |
| Estacionar | potencialmente útil, mas não agendado agora |

### 3. Decida se o Linear é justificado

Crie ou atualize o Linear apenas se:

- a execução está ativamente planejada
- múltiplos repositórios ou workstreams estão envolvidos
- o trabalho precisa de propriedade interna ou sequenciamento
- a issue faz parte de uma lane de programa maior

Não espelhe tudo mecanicamente.

### 4. Mantenha os dois sistemas consistentes

Quando o trabalho estiver ativo:

- A issue/PR do GitHub deve dizer o que está acontecendo publicamente
- O Linear deve rastrear proprietário, prioridade e lane de execução internamente

Quando o trabalho for entregue ou rejeitado:

- publique a resolução pública de volta ao GitHub
- marque a tarefa do Linear correspondentemente

## Regras de Revisão

- Nunca faça merge a partir do título, resumo ou confiança sozinhos; use o diff completo
- Features de fonte externa devem ser reconstruídas dentro do ECC quando forem valiosas mas não autossuficientes
- CI vermelho significa classificar e corrigir ou bloquear; não finja que está pronto para merge
- Se o bloqueador real for a direção do produto, diga isso em vez de se esconder por trás de ferramentas

## Formato de Saída

Retorne:

```text
STATUS PÚBLICO
- estado da issue / PR
- estado do CI / revisão

CLASSIFICAÇÃO
- merge / port-rebuild / fechar / estacionar
- justificativa em um parágrafo

AÇÃO LINEAR
- criar / atualizar / nenhum item Linear necessário
- projeto / lane se aplicável

PRÓXIMA AÇÃO DO OPERADOR
- próximo movimento exato
```

## Bons Casos de Uso

- "Audite o backlog de PR aberto e me diga o que fazer merge vs. reconstruir"
- "Mapeie as issues do GitHub em nossas lanes de programa ECC 1.x e ECC 2.0"
- "Verifique se isso precisa de uma issue no Linear ou deve ficar apenas no GitHub"
