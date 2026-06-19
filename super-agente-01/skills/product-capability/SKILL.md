---
name: product-capability
description: Traduz a intenção de um PRD, solicitações de roadmap ou discussões de produto em um plano de capacidade pronto para implementação que expõe restrições, invariantes, interfaces e decisões não resolvidas antes que o trabalho multi-serviço comece. Use quando o usuário precisar de uma rota PRD-para-SRS nativa do ECC em vez de prosa de planejamento vaga.
metadata:
  origin: ECC
---

# Product Capability

Esta skill transforma a intenção do produto em restrições de engenharia explícitas.

Use quando a lacuna não é "o que devemos construir?" mas "o que deve ser verdadeiro exatamente antes que a implementação comece?"

## Quando Usar

- Existe um PRD, item de roadmap, discussão ou nota do fundador, mas as restrições de implementação ainda são implícitas
- Uma feature cruza múltiplos serviços, repositórios ou equipes e precisa de um contrato de capacidade antes de codificar
- A intenção do produto é clara, mas as implicações de arquitetura, dados, ciclo de vida ou política ainda são nebulosas
- Engenheiros sênior continuam reafirmando as mesmas suposições ocultas durante a revisão
- Você precisa de um artefato reutilizável que possa sobreviver entre harnesses e sessões

## Artefato Canônico

Se o repositório tiver um arquivo de contexto de produto durável como `PRODUCT.md`, `docs/product/` ou um diretório de especificação de programa, atualize-o lá.

Se ainda não existir um manifesto de capacidade, crie um usando o template em:

- `docs/examples/product-capability-template.md`

O objetivo não é criar outra pilha de planejamento. O objetivo é tornar as restrições de capacidade ocultas duráveis e reutilizáveis.

## Regras Não Negociáveis

- Não invente verdades sobre o produto. Marque questões não resolvidas explicitamente.
- Separe as promessas visíveis ao usuário dos detalhes de implementação.
- Identifique o que é política fixa, o que é preferência de arquitetura e o que ainda está em aberto.
- Se a solicitação conflitar com as restrições existentes do repositório, diga isso claramente em vez de suavizar.
- Prefira um artefato de capacidade reutilizável a notas ad hoc dispersas.

## Entradas

Leia apenas o que for necessário:

1. Intenção do produto
   - issue, discussão, PRD, nota de roadmap, mensagem do fundador
2. Arquitetura atual
   - documentos relevantes do repositório, contratos, schemas, rotas, fluxos de trabalho existentes
3. Contexto de capacidade existente
   - `PRODUCT.md`, documentos de design, RFCs, notas de migração, documentos de modelo operacional
4. Restrições de entrega
   - auth, billing, compliance, rollout, compatibilidade retroativa, performance, política de revisão

## Fluxo de Trabalho Principal

### 1. Reafirmar a capacidade

Comprima a solicitação em uma declaração precisa:

- quem é o usuário ou operador
- qual nova capacidade existe após isso ser entregue
- qual resultado muda por causa disso

Se esta declaração for fraca, a implementação irá derivar.

### 2. Resolver as restrições de capacidade

Extraia as restrições que devem ser mantidas antes da implementação:

- regras de negócio
- limites de escopo
- invariantes
- limites de confiança
- propriedade de dados
- transições de ciclo de vida
- requisitos de rollout / migração
- expectativas de falha e recuperação

Essas são as coisas que frequentemente vivem apenas na memória de engenheiros sênior.

### 3. Definir o contrato voltado para implementação

Produza um plano de capacidade no estilo SRS com:

- resumo da capacidade
- não-objetivos explícitos
- atores e superfícies
- estados e transições necessários
- interfaces / entradas / saídas
- implicações do modelo de dados
- restrições de segurança / billing / política
- requisitos de observabilidade e operador
- questões abertas que bloqueiam a implementação

### 4. Traduzir para execução

Termine com a transferência exata:

- pronto para implementação direta
- precisa de revisão de arquitetura primeiro
- precisa de esclarecimento de produto primeiro

Se útil, aponte para a próxima rota nativa do ECC:

- `project-flow-ops`
- `workspace-surface-audit`
- `api-connector-builder`
- `dashboard-builder`
- `tdd-workflow`
- `verification-loop`

## Formato de Saída

Retorne o resultado nesta ordem:

```text
CAPACIDADE
- reafirmação em um parágrafo

RESTRIÇÕES
- regras fixas, invariantes e limites

CONTRATO DE IMPLEMENTAÇÃO
- atores
- superfícies
- estados e transições
- implicações de interface/dados

NÃO-OBJETIVOS
- o que esta rota explicitamente não possui

QUESTÕES ABERTAS
- bloqueadores ou decisões de produto ainda necessários

TRANSFERÊNCIA
- o que deve acontecer a seguir e qual rota ECC deve assumir
```

## Bons Resultados

- A intenção do produto agora é concreta o suficiente para implementar sem redescobrir restrições ocultas no meio de um PR.
- A revisão de engenharia tem um artefato durável em vez de depender de memória ou contexto do Slack.
- O plano resultante é reutilizável no Claude Code, Codex, Cursor, OpenCode e nas superfícies de planejamento do ECC 2.0.
