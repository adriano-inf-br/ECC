---
name: ito-trade-planner
description: Monte uma planilha de planejamento de operações em mercados de previsão, sem caráter de aconselhamento, para fluxos de trabalho do Itô ou de venues. Use para inspecionar venues, ativos subjacentes, restrições, pré-requisitos de ordens e etapas de execução manual sem realizar operações nem recomendar posições.
metadata:
  origin: ECC
---

# Itô Trade Planner

Use esta skill quando um usuário quiser uma planilha estruturada para uma ideia
de mercado de previsão, ajuste de cesta, comparação de venues ou plano de
execução manual.

A skill é intencionalmente não executora. Ela produz checklists e tabelas de
parâmetros que o usuário pode revisar manualmente.

## Guardrails

- Não diga que uma operação é boa, ruim, ótima ou recomendada.
- Não forneça aconselhamento de investimento nem aconselhamento sobre
  dimensionamento de posição.
- Não realize, cancele, roteie ou assine ordens.
- Não solicite chaves privadas, frases-semente, senhas de exchange ou
  credenciais de carteira.
- Exija aprovação explícita do usuário antes que qualquer fluxo de trabalho passe
  da pesquisa para ferramentas capazes de executar.

## Fluxo de trabalho de planejamento

1. Reformule a ideia do usuário como uma hipótese neutra.
2. Identifique mercados, venues, ativos subjacentes, regras de resolução, taxas e
   restrições de atualidade dos dados.
3. Se `ITO_API_KEY` estiver configurada e for solicitada, leia os metadados da
   cesta do Itô.
4. Monte uma planilha manual:
   - mercado/ativo subjacente
   - venue
   - fonte de dados
   - preço ou status observável atual
   - regra de resolução
   - ressalva de liquidez
   - questões em aberto
   - link de ação manual ou próxima etapa de revisão
5. Execute `prediction-market-risk-review` antes de discutir automação, chaves,
   autenticação de venue ou restrições de capital.

## Linguagem permitida

Use:

- "planilha de planejamento manual"
- "questões a responder antes de agir"
- "dados observáveis da venue"
- "revisão de risco e restrições"

Evite:

- "você deveria comprar/vender"
- "melhor operação"
- "garantido"
- "sem risco"
- "tamanho ótimo"

## Contrato de saída

Encerre cada plano com:

```text
This is a planning worksheet, not investment or trading advice. Review venue
rules and make any trading decisions yourself.
```
