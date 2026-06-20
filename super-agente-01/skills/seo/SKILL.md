---
name: seo
description: Audite, planeje e implemente melhorias de SEO em SEO técnico, otimização on-page, dados estruturados, Core Web Vitals e estratégia de conteúdo. Use quando o usuário quiser melhor visibilidade nos mecanismos de busca, correção de SEO, marcação de schema, trabalho com sitemap/robots ou mapeamento de palavras-chave.
metadata:
  origin: ECC
---

# SEO

Melhore a visibilidade nos mecanismos de busca por meio de correção técnica, desempenho e relevância de conteúdo, não de truques.

## Quando Usar

Use esta skill quando:
- auditar rastreabilidade, indexabilidade, canonicals ou redirecionamentos
- melhorar tags de título, meta descriptions e estrutura de headings
- adicionar ou validar dados estruturados
- melhorar Core Web Vitals
- fazer pesquisa de palavras-chave e mapear palavras-chave para URLs
- planejar linking interno ou mudanças em sitemap/robots

## Como Funciona

### Princípios

1. Corrija bloqueadores técnicos antes da otimização de conteúdo.
2. Uma página deve ter uma intenção de busca principal clara.
3. Prefira sinais de qualidade de longo prazo a padrões manipulativos.
4. Premissas mobile-first importam porque a indexação é mobile-first.
5. As recomendações devem ser específicas para a página e implementáveis.

### Checklist de SEO Técnico

#### Rastreabilidade

- `robots.txt` deve permitir páginas importantes e bloquear superfícies de baixo valor
- nenhuma página importante deve ter `noindex` não intencional
- páginas importantes devem ser alcançáveis dentro de uma profundidade rasa de cliques
- evite cadeias de redirecionamento com mais de dois saltos
- tags canonical devem ser autoconsistentes e sem loops

#### Indexabilidade

- o formato de URL preferido deve ser consistente
- páginas multilíngues precisam de hreflang correto se usado
- sitemaps devem refletir a superfície pública pretendida
- nenhuma URL duplicada deve competir sem controle canonical

#### Desempenho

- LCP < 2,5s
- INP < 200ms
- CLS < 0,1
- correções comuns: pré-carregar assets hero, reduzir trabalho de render-blocking, reservar espaço de layout, reduzir JS pesado

#### Dados Estruturados

- homepage: schema de organização ou empresa quando apropriado
- páginas editoriais: `Article` / `BlogPosting`
- páginas de produto: `Product` e `Offer`
- páginas internas: `BreadcrumbList`
- seções de Q&A: `FAQPage` apenas quando o conteúdo realmente corresponder

### Regras On-Page

#### Tags de Título

- mire em aproximadamente 50-60 caracteres
- coloque a palavra-chave ou conceito principal perto do início
- torne o título legível para humanos, não recheado para bots

#### Meta Descriptions

- mire em aproximadamente 120-160 caracteres
- descreva a página com honestidade
- inclua o tema principal de forma natural

#### Estrutura de Headings

- um `H1` claro
- `H2` e `H3` devem refletir a hierarquia real do conteúdo
- não pule a estrutura apenas por estilização visual

### Mapeamento de Palavras-Chave

1. defina a intenção de busca
2. reúna variantes realistas de palavras-chave
3. priorize por correspondência de intenção, valor provável e concorrência
4. mapeie uma palavra-chave/tema principal para uma URL
5. detecte e evite canibalização

### Linking Interno

- vincule de páginas fortes para páginas que você quer ranquear
- use anchor text descritivo
- evite âncoras genéricas quando uma mais específica for possível
- adicione links retroativos de novas páginas para páginas existentes relevantes

## Exemplos

### Fórmula de título

```text
Tópico Principal - Modificador Específico | Marca
```

### Fórmula de meta description

```text
Ação + tópico + proposta de valor + um detalhe de suporte
```

### Exemplo JSON-LD

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Título da Página Aqui",
  "author": {
    "@type": "Person",
    "name": "Nome do Autor"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Nome da Marca"
  }
}
```

### Formato de saída de auditoria

```text
[ALTO] Tags de título duplicadas nas páginas de produto
Localização: src/routes/products/[slug].tsx
Problema: Títulos dinâmicos colapsam para a mesma string padrão, o que enfraquece a relevância e cria sinais duplicados.
Correção: Gere um título único por produto usando o nome do produto e a categoria principal.
```

## Anti-Padrões

| Anti-padrão | Correção |
| --- | --- |
| keyword stuffing | escreva para usuários primeiro |
| páginas quase duplicadas e rasas | consolide ou diferencie-as |
| schema para conteúdo que não está realmente presente | faça o schema corresponder à realidade |
| conselhos de conteúdo sem verificar a página real | leia a página real primeiro |
| saídas genéricas de "melhorar SEO" | vincule cada recomendação a uma página ou ativo |

## Skills Relacionadas

- `seo-specialist`
- `frontend-patterns`
- `brand-voice`
- `market-research`
