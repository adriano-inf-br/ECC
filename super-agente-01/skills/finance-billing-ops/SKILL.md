---
name: finance-billing-ops
description: Fluxo de trabalho baseado em evidências para receita, precificação, reembolsos, faturamento de equipes e verdade do modelo de cobrança no ECC. Use quando o usuário quiser um snapshot de vendas, comparação de preços, diagnóstico de cobrança duplicada ou realidade de cobrança sustentada por código em vez de conselhos genéricos sobre pagamentos.
metadata:
  origin: ECC
---

# Finance Billing Ops

Use esta skill quando o usuário quiser entender dinheiro, precificação, reembolsos, lógica de assentos por equipe, ou se o produto realmente se comporta da forma que o site e o copy de vendas implicam.

Esta skill é mais ampla do que `customer-billing-ops`. Aquela skill é para remediação de clientes. Esta skill é para a verdade do operador: estado de receita, decisões de precificação, faturamento de equipes e comportamento de cobrança sustentado por código.

## Stack de Skills

Incorpore estas skills nativas do ECC no fluxo de trabalho quando relevante:

- `customer-billing-ops` para remediação específica de clientes e acompanhamento
- `research-ops` quando a precificação de concorrentes ou evidências atuais de mercado importam
- `market-research` quando a resposta deve terminar em uma recomendação de precificação
- `github-ops` quando a verdade de cobrança depende de código, backlog ou estado de release em repositórios irmãos
- `verification-loop` quando a resposta depende de provar o comportamento de checkout, tratamento de assentos ou direitos

## Quando Usar

- usuário pede vendas no Stripe, reembolsos, MRR ou atividade recente de clientes
- usuário pergunta se o faturamento por equipe, por assento ou empilhamento de quota é real no código
- usuário quer comparações de preços de concorrentes ou benchmarks de modelo de precificação
- a pergunta mistura fatos de receita com verdade de implementação do produto

## Restrições

- distinga dados ao vivo de snapshots salvos
- separe:
  - fato de receita
  - impacto no cliente
  - verdade do produto sustentada por código
  - recomendação
- não diga "por assento" a menos que o caminho de direito real o imponha
- não assuma que assinaturas duplicadas implicam valor duplicado

## Fluxo de Trabalho

### 1. Comece pela evidência de cobrança mais recente

Prefira dados de cobrança ao vivo. Se os dados não forem ao vivo, declare o timestamp do snapshot explicitamente.

Normalize o quadro:

- vendas pagas
- assinaturas ativas
- checkouts com falha ou incompletos
- reembolsos
- disputas
- assinaturas duplicadas

### 2. Separe incidentes de clientes da verdade do produto

Se a pergunta for específica do cliente, classifique primeiro:

- checkout duplicado
- intenção real de equipe
- controles de autoatendimento quebrados
- valor do produto não atendido
- pagamento com falha ou configuração incompleta

Depois separe isso da pergunta mais ampla do produto:

- o faturamento por equipe realmente existe?
- os assentos são realmente contados?
- a quantidade no checkout altera o direito?
- o site superestima o comportamento atual?

### 3. Inspecione o comportamento de cobrança sustentado por código

Se a resposta depender da verdade de implementação, inspecione o caminho do código:

- checkout
- página de precificação
- cálculo de direito
- tratamento de assento ou quota
- lógica de instalação vs. uso do usuário
- suporte ao portal de cobrança ou gerenciamento de autoatendimento

### 4. Termine com uma decisão e lacuna do produto

Reporte:

- snapshot de vendas
- diagnóstico do problema
- verdade do produto
- ação recomendada pelo operador
- lacuna do produto ou backlog

## Formato de Saída

```text
SNAPSHOT
- timestamp
- receita / assinaturas / anomalias

IMPACTO NO CLIENTE
- quem é afetado
- o que aconteceu

VERDADE DO PRODUTO
- o que o código realmente faz
- o que o site ou copy de vendas afirma

DECISÃO
- reembolsar / manter / converter / nenhuma ação

LACUNA DO PRODUTO
- item de acompanhamento exato a construir ou corrigir
```

## Armadilhas

- não confunda tentativas com falha com receita líquida
- não infira faturamento por equipe apenas de linguagem de marketing
- não compare preços de concorrentes de memória quando evidências atuais estão disponíveis
- não pule do diagnóstico direto para o reembolso sem classificar o problema

## Verificação

- a resposta inclui uma declaração de dados ao vivo ou timestamp de snapshot
- afirmações de verdade do produto são sustentadas por código
- impacto no cliente e conclusões mais amplas de precificação/produto são separados claramente
