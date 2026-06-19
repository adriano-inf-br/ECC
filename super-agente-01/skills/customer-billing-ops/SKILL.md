---
name: customer-billing-ops
description: Opere fluxos de trabalho de cobrança de clientes, como assinaturas, reembolsos, triagem de churn, recuperação de portal de cobrança e análise de planos, usando tools de cobrança conectadas como o Stripe. Use quando o usuário precisar ajudar um cliente, inspecionar o estado de uma assinatura ou gerenciar operações de cobrança que impactam a receita.
metadata:
  origin: ECC
---

# Customer Billing Ops

Use esta skill para operações reais de clientes, não para design genérico de APIs de pagamento.

O objetivo é ajudar o operador a responder: quem é este cliente, o que aconteceu, qual é a correção mais segura e qual acompanhamento devemos enviar?

## Quando Usar

- O cliente diz que a cobrança está quebrada, quer um reembolso ou não consegue cancelar
- Investigar assinaturas duplicadas, cobranças acidentais, renovações que falharam ou risco de churn
- Revisar o mix de planos, assinaturas ativas, conversão anual vs mensal ou confusão de assentos de equipe
- Criar ou validar um fluxo de portal de cobrança
- Auditar reclamações de suporte que tocam em assinaturas, faturas, reembolsos ou métodos de pagamento

## Superfície de Tools Preferida

- Use tools de cobrança conectadas como o Stripe primeiro
- Use e-mail, GitHub ou rastreadores de issue apenas como evidência de apoio
- Prefira portais hospedados de cobrança/cliente a código personalizado de gerenciamento de conta quando a plataforma já fornecer os controles necessários

## Proteções

- Nunca exponha chaves secretas, dados completos de cartão ou PII desnecessária do cliente na resposta
- Não reembolse às cegas; primeiro classifique o problema
- Distinga entre:
  - compra duplicada acidental
  - compra deliberada multi-assento ou de equipe
  - produto quebrado / valor não entregue
  - checkout que falhou ou ficou incompleto
  - cancelamento por falta de controles de autoatendimento
- Para planos anuais, planos de equipe e estados rateados, verifique o formato do contrato antes de agir

## Fluxo de Trabalho

### 1. Identifique o cliente de forma limpa

Comece pelo identificador mais forte disponível:

- e-mail do cliente
- ID de cliente do Stripe
- ID da assinatura
- ID da fatura
- nome de usuário do GitHub ou e-mail de suporte se for conhecido por mapear de volta à cobrança

Retorne um resumo de identidade conciso:

- cliente
- assinaturas ativas
- assinaturas canceladas
- faturas
- anomalias óbvias, como assinaturas ativas duplicadas

### 2. Classifique o problema

Coloque o caso em um balde antes de agir:

| Caso | Ação típica |
|------|----------------|
| Assinatura pessoal duplicada | cancelar extras, considerar reembolso |
| Intenção real de multi-assento/equipe | preservar assentos, esclarecer o modelo de cobrança |
| Pagamento falho / checkout incompleto | recuperar via portal ou atualizar método de pagamento |
| Falta de controles de autoatendimento | fornecer portal, caminho de cancelamento ou acesso a faturas |
| Falha de produto ou quebra de confiança | reembolsar, pedir desculpas, registrar problema de produto |

### 3. Tome primeiro a ação reversível mais segura

Ordem preferida:

1. restaurar o gerenciamento por autoatendimento
2. corrigir o estado de cobrança duplicado ou quebrado
3. reembolsar apenas a cobrança afetada ou a duplicada
4. documentar o motivo
5. enviar um acompanhamento curto ao cliente

Se a correção exigir trabalho de produto, separe:

- remediação do cliente agora
- bug de produto / lacuna de fluxo de trabalho para o backlog

### 4. Verifique lacunas de produto do lado do operador

Se a dor do cliente vem de uma superfície de operador ausente, aponte isso explicitamente. Exemplos comuns:

- nenhum portal de cobrança
- nenhuma visibilidade de uso/rate-limit
- nenhuma explicação de plano/assento
- nenhum fluxo de cancelamento
- nenhuma proteção contra assinatura duplicada

Trate esses casos como itens de acompanhamento do ECC ou do site, não apenas como incidentes de suporte.

### 5. Produza o handoff para o operador

Termine com:

- resumo do estado do cliente
- ação tomada
- impacto na receita
- texto de acompanhamento a enviar
- issue de produto ou backlog a criar

## Formato de Saída

Use esta estrutura:

```text
CLIENTE
- nome / e-mail
- identificadores de conta relevantes

ESTADO DE COBRANÇA
- assinaturas ativas
- estado de fatura ou renovação
- anomalias

DECISÃO
- classificação do problema
- por que esta ação está correta

AÇÃO TOMADA
- reembolso / cancelar / portal / nenhuma ação

ACOMPANHAMENTO
- mensagem curta ao cliente

LACUNA DE PRODUTO
- o que deve ser corrigido no produto ou site
```

## Exemplos de Boas Recomendações

- "A correção certa é um portal de cobrança, não um dashboard personalizado ainda"
- "Isto parece um checkout pessoal duplicado, não uma compra real de assento de equipe"
- "Reembolse uma cobrança duplicada, mantenha a assinatura ativa restante e depois converta o cliente para cobrança de organização se necessário"
