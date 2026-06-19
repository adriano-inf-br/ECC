---
name: exa-search
description: Busca neural via Exa MCP para pesquisa de web, código e empresas. Use quando o usuário precisar de busca na web, exemplos de código, inteligência sobre empresas, busca de pessoas ou pesquisa profunda com IA usando o mecanismo de busca neural da Exa.
metadata:
  origin: ECC
---

# Exa Search

> **Skill propensa a deriva.** Os nomes das ferramentas, parâmetros e limites de
> conta do Exa MCP podem mudar. Confirme a superfície de ferramentas exposta e a
> documentação atual da Exa antes de depender de um modo de busca, categoria ou
> comportamento de livecrawl específico.

Busca neural para conteúdo web, código, empresas e pessoas via servidor Exa MCP.

## When to Activate

- O usuário precisa de informações atuais da web ou notícias
- Buscar exemplos de código, documentação de API ou referências técnicas
- Pesquisar empresas, concorrentes ou participantes do mercado
- Encontrar perfis profissionais ou pessoas em um domínio
- Executar pesquisa de fundo para qualquer tarefa de desenvolvimento
- O usuário diz "busque por", "pesquise", "encontre" ou "qual é a novidade sobre"

## Requisito de MCP

O servidor Exa MCP deve estar configurado. Adicione a `~/.claude.json`:

```json
"exa-web-search": {
  "command": "npx",
  "args": ["-y", "exa-mcp-server"],
  "env": { "EXA_API_KEY": "YOUR_EXA_API_KEY_HERE" }
}
```

Obtenha uma chave de API em [exa.ai](https://exa.ai).
A configuração atual da Exa neste repositório documenta a superfície de ferramentas exposta aqui: `web_search_exa` e `get_code_context_exa`.
Se o seu servidor Exa expuser ferramentas adicionais, verifique os nomes exatos delas antes de depender delas em documentação ou prompts.

## Ferramentas Principais

### web_search_exa
Busca geral na web para informações atuais, notícias ou fatos.

```
web_search_exa(query: "latest AI developments 2026", numResults: 5)
```

**Parâmetros:**

| Param | Tipo | Padrão | Observações |
|-------|------|---------|-------|
| `query` | string | obrigatório | Consulta de busca |
| `numResults` | number | 8 | Número de resultados |
| `type` | string | `auto` | Modo de busca |
| `livecrawl` | string | `fallback` | Prefere crawling ao vivo quando necessário |
| `category` | string | nenhum | Foco opcional, como `company` ou `research paper` |

### get_code_context_exa
Encontra exemplos de código e documentação do GitHub, Stack Overflow e sites de documentação.

```
get_code_context_exa(query: "Python asyncio patterns", tokensNum: 3000)
```

**Parâmetros:**

| Param | Tipo | Padrão | Observações |
|-------|------|---------|-------|
| `query` | string | obrigatório | Consulta de busca de código ou API |
| `tokensNum` | number | 5000 | Tokens de conteúdo (1000-50000) |

## Padrões de Uso

### Consulta Rápida
```
web_search_exa(query: "Node.js 22 new features", numResults: 3)
```

### Pesquisa de Código
```
get_code_context_exa(query: "Rust error handling patterns Result type", tokensNum: 3000)
```

### Pesquisa de Empresas ou Pessoas
```
web_search_exa(query: "Vercel funding valuation 2026", numResults: 3, category: "company")
web_search_exa(query: "site:linkedin.com/in AI safety researchers Anthropic", numResults: 5)
```

### Mergulho Técnico Profundo
```
web_search_exa(query: "WebAssembly component model status and adoption", numResults: 5)
get_code_context_exa(query: "WebAssembly component model examples", tokensNum: 4000)
```

## Dicas

- Use `web_search_exa` para informações atuais, buscas de empresas e descoberta ampla
- Use operadores de busca como `site:`, frases entre aspas e `intitle:` para refinar os resultados
- Diminua `tokensNum` (1000-2000) para trechos de código focados, aumente (5000+) para contexto abrangente
- Use `get_code_context_exa` quando precisar de uso de API ou exemplos de código em vez de páginas web genéricas

## Skills Relacionadas

- `deep-research` — Fluxo de trabalho completo de pesquisa usando firecrawl + exa juntos
- `market-research` — Pesquisa orientada a negócios com frameworks de decisão
