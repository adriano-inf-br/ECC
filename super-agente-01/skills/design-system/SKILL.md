---
name: design-system
description: Use esta skill para gerar ou auditar design systems, verificar consistência visual e revisar PRs que alteram estilos.
metadata:
  origin: ECC
---

# Design System — Gerar e Auditar Sistemas Visuais

## Quando Usar

- Iniciando um novo projeto que precisa de um design system
- Auditando um código existente para consistência visual
- Antes de um redesign — entenda o que você tem
- Quando a UI parece "estranha" mas você não consegue identificar o porquê
- Revisando PRs que alteram estilos

## Como Funciona

### Modo 1: Gerar Design System

Analisa seu código e gera um design system coeso:

```
1. Escaneia CSS/Tailwind/styled-components em busca de padrões existentes
2. Extrai: cores, tipografia, espaçamento, border-radius, sombras, breakpoints
3. Pesquisa 3 sites concorrentes para inspiração (via browser MCP)
4. Propõe um conjunto de design tokens (JSON + propriedades customizadas CSS)
5. Gera DESIGN.md com a justificativa para cada decisão
6. Cria uma página HTML interativa de preview (auto-contida, sem dependências)
```

Saída: `DESIGN.md` + `design-tokens.json` + `design-preview.html`

### Modo 2: Auditoria Visual

Pontua sua UI em 10 dimensões (0-10 cada):

```
1. Consistência de cores — você está usando sua paleta ou valores hex aleatórios?
2. Hierarquia tipográfica — h1 > h2 > h3 > body > caption está claro?
3. Ritmo de espaçamento — escala consistente (4px/8px/16px) ou arbitrária?
4. Consistência de componentes — elementos similares parecem similares?
5. Comportamento responsivo — fluido ou quebrado nos breakpoints?
6. Dark mode — completo ou pela metade?
7. Animação — proposital ou gratuita?
8. Acessibilidade — taxas de contraste, estados de foco, alvos de toque
9. Densidade de informação — congestionado ou limpo?
10. Polimento — estados de hover, transições, estados de carregamento, estados vazios
```

Cada dimensão recebe uma pontuação, exemplos específicos e uma correção com arquivo:linha exatos.

### Modo 3: Detecção de AI Slop

Identifica padrões de design genéricos gerados por IA:

```
- Gradientes gratuitos em tudo
- Padrões padrão de roxo para azul
- Cards com "glass morphism" sem propósito
- Cantos arredondados em coisas que não deveriam ser arredondadas
- Animações excessivas no scroll
- Hero genérico com texto centralizado sobre gradiente de stock
- Stack de fontes sans-serif sem personalidade
```

## Exemplos

**Gerar para um app SaaS:**
```
/design-system generate --style minimal --palette earth-tones
```

**Auditar UI existente:**
```
/design-system audit --url http://localhost:3000 --pages / /pricing /docs
```

**Verificar AI slop:**
```
/design-system slop-check
```
