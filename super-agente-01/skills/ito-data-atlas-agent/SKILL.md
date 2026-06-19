---
name: ito-data-atlas-agent
description: Projeta agents em background no estilo Data Atlas para pesquisa de cestas (baskets) da Itô, descoberta de mercados, rascunho de parâmetros e edição com humano no loop (human-in-the-loop). Use para planejamento de arquitetura e fluxo de trabalho, não para execução de ordens ao vivo.
metadata:
  origin: ECC
---

# Itô Data Atlas Agent

Use esta skill para projetar um agent que monitora fontes de dados, constrói cestas (baskets)
candidatas de mercados de previsão, rascunha mudanças de parâmetros e entrega o resultado a um
humano para revisão.

Esta skill descreve arquitetura e fluxo de trabalho. Ela não executa trading ao vivo.

## Guardrails

- Mantenha toda execução por trás de aprovação humana explícita.
- Exija `ITO_API_KEY` apenas para acesso somente leitura aos dados da Itô, a menos que uma implementação
  privada separada adicione explicitamente controles de execução.
- Não persista dados privados do usuário, a menos que o repositório de destino já tenha um contrato de
  armazenamento e o usuário peça por isso.
- Não exponha lógica de estratégia privada, credenciais de venue nem caminhos locais em
  documentos públicos.

## Padrão de Arquitetura

Use quatro pistas (lanes):

1. Coletor de pesquisa: web pública, X, GitHub, docs de venue, metadados de API e
   endpoints de leitura da Itô quando houver acesso restrito.
2. Rascunhador de cestas: transforma fontes em underliers, pesos, regras e
   perguntas candidatas.
3. Revisor de risco: verifica a atualidade dos dados, limites de venue, ambiguidade de
   resolução, notas de compliance e exposição a prompt-injection.
4. Editor humano: abre um chat ou estado de UI onde o usuário pode aprovar, rejeitar,
   ajustar ou pedir mais pesquisa.

## Fluxo de Trabalho

1. Defina o objetivo do usuário e as ações excluídas.
2. Liste as fontes de dados e os requisitos de acesso.
3. Rascunhe uma especificação de cesta com proveniência para cada underlier.
4. Produza parâmetros editáveis em vez de ordens executáveis.
5. Armazene uma trilha de auditoria: entradas, saída do modelo, fontes e decisão humana.

## Cadeias de Skills Úteis

- `deep-research` para coleta de fontes.
- `x-api` para sinal social/de evento atual.
- `ito-market-intelligence` para contexto de venue e underlier.
- `ito-basket-compare` para correspondência com a base de conhecimento do usuário.
- `prediction-market-risk-review` antes de qualquer integração capaz de executar.

## Contrato de Saída

Retorne uma especificação de fluxo de trabalho pronta para implementação com:

- fontes de dados
- portões de acesso (access gates)
- papéis de agent
- pontos de aprovação humana
- limite de armazenamento/auditoria
- não-objetivos (non-goals)
