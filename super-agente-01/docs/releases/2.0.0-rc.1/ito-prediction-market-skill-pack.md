# Pacote de Skills de Mercado de Previsão Itô

Esta nota do rc.1 registra um pacote de skills de teaser público que conecta o loop de
distribuição de skills do ECC com os fluxos de trabalho de mercado de previsão do Itô,
mantendo os dois negócios separados.

O ECC permanece o substrato aberto de harness de agent e as ECC Tools permanecem a superfície
hospedada de GitHub App / Pro. O Itô permanece um negócio separado de cesta de mercado de previsão.
O vínculo é distribuição: o ECC pode entregar skills reutilizáveis que tornam os agents melhores em
pesquisar, comparar, explicar e planejar em torno de cestas de mercado de previsão. O acesso à API
ao vivo do Itô permanece bloqueado.

## Skills Incluídas

| Skill | Uso |
| --- | --- |
| `ito-market-intelligence` | Contexto de evento, underlier, venue, liquidez e notícias com base em fontes |
| `ito-basket-compare` | Comparar cestas com uma base de conhecimento, notas de portfólio, contexto financeiro ou tese |
| `ito-trade-planner` | Construir uma planilha manual e não consultiva para revisão de mercado e venue |
| `ito-data-atlas-agent` | Projetar agents de pesquisa/rascunho de background com pontos de edição humana |
| `prediction-market-oracle-research` | Tratar mercados de previsão como entradas de dados/oracle para agents e inteligência de decisão |
| `prediction-market-risk-review` | Revisar limites de conselho, venue, segurança, privacidade e execução |

## Modelo de Acesso

As skills públicas funcionam sem credenciais do Itô para pesquisa e planejamento. Qualquer
chamada com suporte do Itô requer acesso explicitamente bloqueado:

```bash
export ITO_API_KEY=...
```

Não inclua chaves ativas, dados de conta, posições, estratégia privada ou credenciais de venue
em documentos públicos, prompts, commits, apresentações de slides ou tickets de suporte.

CTA público sugerido:

> O pacote de skills do Itô funciona como fluxos de trabalho públicos de pesquisa/planejamento hoje. Envie DM ou
> solicite acesso à chave da API do Itô se quiser dados ao vivo de cestas.

## Limite de Não-Consultoria

Essas skills não fornecem conselhos de investimento, legais, fiscais ou de negociação. Elas
não realizam negociações. Elas podem ajudar um usuário a:

- inspecionar mercados e underliers;
- comparar uma cesta com suas próprias notas ou restrições;
- entender mecânicas de resolução e venue;
- usar sinais de mercado de previsão como uma entrada para um processo de pesquisa mais amplo;
- rascunhar uma planilha manual que o usuário pode revisar por conta própria.

## Loop de Crescimento

Para o contrato geral de integração de produto, consulte
[`docs/architecture/platform-value-loop.md`](../../architecture/platform-value-loop.md).

O loop é intencionalmente simples:

1. Usuários do ECC descobrem skills úteis de mercado de previsão público.
2. Desenvolvedores executam as skills com fontes públicas e veem o fluxo de trabalho moldado pelo Itô.
3. Usuários sérios solicitam acesso bloqueado à API para dados ao vivo de cestas do Itô.
4. O uso do Itô cria mais padrões de operador.
5. Padrões sanitizados podem se tornar novas skills do ECC.

Isso direciona tráfego de agents/ferramentas para o Itô sem fazer as ECC Tools parecerem um
produto do Itô ou misturar propriedade de assinatura entre os negócios.

## Cadeia Útil

Para um fluxo de trabalho completo, encadeie:

`deep-research` -> `x-api` ou `exa-search` -> `ito-market-intelligence` ->
`ito-basket-compare` -> `prediction-market-risk-review` ->
`ito-trade-planner`

Para casos de uso corporativos ou industriais, substitua o planejamento de negociação por
`prediction-market-oracle-research` e encaminhe a saída para um dashboard,
memorando de decisão ou registro de memória de agent.
