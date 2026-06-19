---
name: ito-basket-compare
description: Compara cestas (baskets) de mercados de previsão da Itô com a base de conhecimento do usuário, notas de portfólio, contexto financeiro, watchlist ou tese de pesquisa. Use para comparação de cestas somente leitura e análise de lacunas, sem aconselhamento de investimento ou trading ao vivo.
metadata:
  origin: ECC
---

# Itô Basket Compare

Use esta skill para comparar uma cesta (basket), tema ou conjunto de mercados com a
base de conhecimento do usuário, notas de portfólio, memorando de pesquisa, contexto de CRM ou tese declarada.

Esta skill é somente leitura. Ela não recomenda operações. Ela ajuda o usuário a inspecionar
fit, exposição, premissas e contexto ausente antes de decidir o que fazer.

## Guardrails

- Não forneça aconselhamento de investimento nem diga ao usuário para comprar, vender, manter, fazer hedge,
  alavancar ou dimensionar uma operação.
- Não execute, prepare nem submeta ordens.
- Não use documentos privados a menos que o usuário aponte explicitamente para eles.
- Use `ITO_API_KEY` apenas para dados de cesta/mercado da Itô somente leitura, após solicitação
  explícita do usuário.
- Ao comparar com dados financeiros, preserve a privacidade e resuma apenas os
  campos necessários para a comparação.

## Modos de Comparação

### Cesta vs Base de Conhecimento

1. Identifique o tema da cesta e os ativos subjacentes (underliers).
2. Recupere as notas, documentos ou trechos de memória relevantes do usuário.
3. Mapeie cada underlier para afirmações, fontes, incertezas e premissas desatualizadas.
4. Retorne sinais alinhados, sinais conflitantes e pesquisa ausente.

### Cesta vs Notas de Portfólio

1. Analise a watchlist, o resumo de posições ou as notas de exposição do usuário.
2. Compare temas, geografias, horizontes de tempo e resultados de eventos.
3. Sinalize concentração, correlação e exposição narrativa duplicada.
4. Evite recomendações; formule a saída como inspeção e perguntas.

### Cesta vs Contexto Financeiro

1. Aceite apenas contexto financeiro fornecido ou explicitamente selecionado pelo usuário.
2. Identifique descompassos de liquidez, drawdown, horizonte de tempo e restrições.
3. Pergunte sobre restrições ausentes em vez de adivinhar.

## Contrato de Saída

Use esta estrutura:

1. Resumo da cesta
2. Alvo da comparação
3. Correspondências
4. Conflitos ou premissas desatualizadas
5. Contexto ausente
6. Checklist de ações do usuário

Termine com:

```text
This comparison is informational and not investment or trading advice.
```
