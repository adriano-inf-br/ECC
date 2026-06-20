---
name: deep-research
description: Pesquisa profunda multifonte usando os MCPs firecrawl e exa. Busca na web, sintetiza descobertas e entrega relatórios com citações e atribuição de fontes. Use quando o usuário quiser pesquisa minuciosa sobre qualquer tópico com evidências e citações.
metadata:
  origin: ECC
---

# Deep Research

> **Skill propensa a desatualização (drift).** Os nomes das ferramentas MCP do
> Firecrawl/Exa, as cotas e os formatos de resultado mudam. Verifique as
> ferramentas MCP configuradas e a documentação atual da API antes de prometer
> cobertura ou citar contagens de fontes ao vivo.

Produza relatórios de pesquisa minuciosos e com citações a partir de múltiplas fontes da web usando as ferramentas MCP firecrawl e exa.

## Quando Ativar

- O usuário pede para pesquisar qualquer tópico em profundidade
- Análise competitiva, avaliação de tecnologia ou dimensionamento de mercado
- Due diligence sobre empresas, investidores ou tecnologias
- Qualquer pergunta que exija síntese a partir de múltiplas fontes
- O usuário diz "pesquise", "deep dive", "investigue" ou "qual é o estado atual de"

## Requisitos de MCP

Pelo menos uma das opções:
- **firecrawl** — `firecrawl_search`, `firecrawl_scrape`, `firecrawl_crawl`
- **exa** — `web_search_exa`, `web_search_advanced_exa`, `crawling_exa`

As duas juntas oferecem a melhor cobertura. Configure em `~/.claude.json` ou `~/.codex/config.toml`.

## Fluxo de trabalho

### Passo 1: Entenda o Objetivo

Faça 1-2 perguntas rápidas de esclarecimento:
- "Qual é o seu objetivo — aprender, tomar uma decisão ou escrever algo?"
- "Algum ângulo ou profundidade específica que você quer?"

Se o usuário disser "apenas pesquise" — pule adiante com padrões razoáveis.

### Passo 2: Planeje a Pesquisa

Divida o tópico em 3-5 subperguntas de pesquisa. Exemplo:
- Tópico: "Impacto da IA na saúde"
  - Quais são as principais aplicações de IA na saúde hoje?
  - Quais resultados clínicos foram mensurados?
  - Quais são os desafios regulatórios?
  - Quais empresas lideram esse espaço?
  - Qual é o tamanho do mercado e a trajetória de crescimento?

### Passo 3: Execute a Busca Multifonte

Para CADA subpergunta, busque usando as ferramentas MCP disponíveis:

**Com firecrawl:**
```
firecrawl_search(query: "<palavras-chave da subpergunta>", limit: 8)
```

**Com exa:**
```
web_search_exa(query: "<palavras-chave da subpergunta>", numResults: 8)
web_search_advanced_exa(query: "<palavras-chave>", numResults: 5, startPublishedDate: "2025-01-01")
```

**Estratégia de busca:**
- Use 2-3 variações diferentes de palavras-chave por subpergunta
- Misture consultas gerais e focadas em notícias
- Almeje 15-30 fontes únicas no total
- Priorize: acadêmicas, oficiais, notícias confiáveis > blogs > fóruns

### Passo 4: Leia a Fundo as Fontes-Chave

Para as URLs mais promissoras, obtenha o conteúdo completo:

**Com firecrawl:**
```
firecrawl_scrape(url: "<url>")
```

**Com exa:**
```
crawling_exa(url: "<url>", tokensNum: 5000)
```

Leia 3-5 fontes-chave na íntegra para obter profundidade. Não confie apenas nos trechos de busca.

### Passo 5: Sintetize e Escreva o Relatório

Estruture o relatório:

```markdown
# [Tópico]: Relatório de Pesquisa
*Gerado em: [data] | Fontes: [N] | Confiança: [Alta/Média/Baixa]*

## Resumo Executivo
[Visão geral de 3-5 frases das principais descobertas]

## 1. [Primeiro Tema Principal]
[Descobertas com citações inline]
- Ponto-chave ([Nome da Fonte](url))
- Dados de apoio ([Nome da Fonte](url))

## 2. [Segundo Tema Principal]
...

## 3. [Terceiro Tema Principal]
...

## Principais Conclusões
- [Insight acionável 1]
- [Insight acionável 2]
- [Insight acionável 3]

## Fontes
1. [Título](url) — [resumo de uma linha]
2. ...

## Metodologia
Buscadas [N] consultas na web e em notícias. Analisadas [M] fontes.
Subperguntas investigadas: [lista]
```

### Passo 6: Entregue

- **Tópicos curtos**: poste o relatório completo no chat
- **Relatórios longos**: poste o resumo executivo + principais conclusões, salve o relatório completo em um arquivo

## Pesquisa Paralela com Subagents

Para tópicos amplos, use a ferramenta Task do Claude Code para paralelizar:

```
Lance 3 agents de pesquisa em paralelo:
1. Agent 1: Pesquisa as subperguntas 1-2
2. Agent 2: Pesquisa as subperguntas 3-4
3. Agent 3: Pesquisa a subpergunta 5 + temas transversais
```

Cada agent busca, lê as fontes e retorna as descobertas. A sessão principal sintetiza no relatório final.

## Regras de Qualidade

1. **Toda afirmação precisa de uma fonte.** Sem asserções sem fonte.
2. **Faça referência cruzada.** Se apenas uma fonte afirma algo, sinalize como não verificado.
3. **Recência importa.** Prefira fontes dos últimos 12 meses.
4. **Reconheça lacunas.** Se você não conseguiu encontrar boas informações sobre uma subpergunta, diga isso.
5. **Sem alucinação.** Se você não sabe, diga "dados insuficientes encontrados".
6. **Separe fato de inferência.** Rotule estimativas, projeções e opiniões claramente.

## Exemplos

```
"Pesquise o estado atual da energia de fusão nuclear"
"Deep dive em Rust vs Go para serviços de backend em 2026"
"Pesquise as melhores estratégias para fazer bootstrapping de um negócio SaaS"
"O que está acontecendo com o mercado imobiliário dos EUA agora?"
"Investigue o cenário competitivo dos editores de código com IA"
```
