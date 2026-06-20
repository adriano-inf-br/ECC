---
name: ito-market-intelligence
description: Pesquisa eventos de mercados de previsão, venues, underliers, liquidez e contexto de notícias para fluxos de trabalho de cestas (baskets) da Itô. Use para inteligência de mercado somente leitura, exploração da Itô restrita por API e briefings de mercados de previsão fundamentados em fontes, sem aconselhamento de investimento ou trading ao vivo.
metadata:
  origin: ECC
---

# Itô Market Intelligence

Use esta skill quando o usuário quiser contexto de mercados de previsão, descoberta de eventos,
comparação de venues, exploração de temas de cesta ou um brief de mercado apoiado pela API da Itô.

Esta é uma skill de teaser pública. Ela pode trabalhar com fontes públicas por padrão. Qualquer
chamada de dados apoiada pela Itô requer acesso explícito à API por meio de `ITO_API_KEY`.

## Guardrails

- Não forneça aconselhamento de investimento, jurídico, tributário ou de trading.
- Não coloque, cancele, roteie nem simule ordens ao vivo.
- Não infira a situação financeira do usuário, a menos que ele a forneça.
- Trate dados da Polymarket, Kalshi, Itô, X, Exa, GitHub e da web como entradas de fonte,
  e não como verdade por si só.
- Separe fatos, sinais implícitos do mercado e sua interpretação.

## Fluxo de Trabalho

1. Esclareça o tema do mercado, o venue, a geografia e o horizonte de tempo.
2. Reúna dados públicos de mercado a partir de docs/APIs de venue ou pesquisa fundamentada em fontes.
3. Se `ITO_API_KEY` estiver presente e o usuário pedir explicitamente dados da Itô, chame
   apenas endpoints de leitura e declare que o acesso é restrito.
4. Normalize diferenças de evento, underlier, liquidez, taxa, resolução e latência de dados
   entre os venues.
5. Produza um brief de decisão:
   - resumo do mercado/evento
   - venues e underliers disponíveis
   - ressalvas de liquidez e qualidade de dados
   - contexto relevante de notícias/fontes
   - perguntas em aberto antes de qualquer ação do usuário

## Cadeias de Skills Úteis

- Use `deep-research` ou `exa-search` para descoberta de fontes.
- Use `x-api` para descoberta de sinal social público quando o acesso ao X estiver configurado.
- Use `market-research` para dimensionamento de mercado, concorrentes ou casos de uso de negócio.
- Use `prediction-market-risk-review` antes que qualquer fluxo de trabalho toque o capital do usuário,
  dados de portfólio ou credenciais capazes de executar.

## Contrato de Saída

Por padrão, produza um brief compacto com links de fonte e uma ressalva clara:

```text
This is market intelligence, not investment or trading advice.
```

Se o acesso estiver faltando, diga:

```text
Itô live basket/API data requires gated access. Request an ITO_API_KEY before
using Itô-backed reads.
```
