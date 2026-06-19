---
name: make-interfaces-feel-better
description: Aplique detalhes concretos de design-engineering que tornam interfaces mais polidas. Use ao revisar ou melhorar espaçamento de UI, tipografia, bordas, sombras, motion, áreas de toque, ícones, quebra de texto e estados de interação.
metadata:
  origin: community
---

# Deixe as Interfaces Melhores

Use esta skill para os pequenos detalhes de design-engineering que se acumulam em
uma interface mais polida.

Fonte: recuperada de PR comunitário obsoleto #1659 por `linus707`.

## Quando Usar

- O usuário diz que a UI parece estranha, plana, genérica, apertada, instável ou inacabada.
- Você está construindo controles, cards, listas, dashboards, navegação, formulários ou
  barras de ferramentas.
- Um componente precisa de estados de hover, active, focus, entrada, saída, carregando ou vazio.
- Uma revisão de Frontend precisa de recomendações específicas de antes/depois.

## Princípios Fundamentais

### Raio Concêntrico

Para superfícies arredondadas aninhadas próximas:

```text
raio externo = raio interno + padding
```

Se o padding for grande, trate as camadas como superfícies separadas em vez de forçar a
matemática. O objetivo é coerência óptica, não adoração de fórmulas.

### Alinhamento Óptico

Centralização geométrica nem sempre é centralização visual. Botões de ícone, triângulos
de play, setas, estrelas e ícones assimétricos frequentemente precisam de um pequeno deslocamento.
Corrija o SVG quando possível; caso contrário, ajuste com uma mudança de margin ou padding em nível de pixel.

### Sombras e Bordas

Use bordas para separação e anéis de foco. Use sombras em camadas quando um card,
botão, dropdown ou popover precisar de profundidade. As sombras devem ser transparentes e
sutis o suficiente para funcionar em diferentes fundos.

### Quebra de Texto

- Use `text-wrap: balance` em títulos e subtítulos curtos.
- Use `text-wrap: pretty` em textos de corpo curtos a médios, legendas, descrições
  e itens de lista.
- Evite ambos em prosa longa, código e conteúdo pré-formatado.
- Use `font-variant-numeric: tabular-nums` para contadores, temporizadores, preços, tabelas
  e outros números que se atualizam.

### Suavização de Fonte

No macOS, aplique suavização de fonte antialiased no layout raiz quando o projeto
ainda não o fizer:

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Contornos de Imagem

Imagens frequentemente precisam de um contorno interno sutil para que suas bordas não se misturem com a
superfície.

```css
img {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}

@media (prefers-color-scheme: dark) {
  img {
    outline-color: rgba(255, 255, 255, 0.1);
  }
}
```

Use contornos em alfa neutro preto ou branco. Não tinja contornos de imagem com a
paleta da marca.

### Motion

Use transições CSS para mudanças de estado interativas porque elas podem redirecionar
quando o usuário muda de intenção durante o movimento. Reserve keyframes para entradas
encenadas de uso único ou sequências de carregamento.

Bons padrões de motion:

- Entrada: combine opacity, pequeno `translateY` e opcionalmente blur.
- Saída: mais curta e mais discreta do que a entrada, geralmente 150ms.
- Pressionar: `scale(0.96)` para botões táteis, com uma forma de desabilitar quando o
  movimento distrai.
- Troca de ícones: cross-fade com opacity, scale e blur em vez de alternâncias de visibilidade instantâneas.

### Escopo de Transição

Nunca use `transition: all`. Especifique as propriedades alteradas:

```css
.button {
  transition-property: transform, background-color, box-shadow;
  transition-duration: 150ms;
  transition-timing-function: ease-out;
}
```

Use `will-change` apenas para travamento no primeiro frame em
propriedades compatíveis com compositor como `transform`, `opacity` e `filter`. Nunca use
`will-change: all`.

### Áreas de Toque

Controles interativos devem ter pelo menos uma área de toque de 40x40px, idealmente 44x44px
onde o layout permitir. Expanda com um pseudo-elemento quando o ícone visível
for menor, mas não deixe áreas de toque expandidas se sobreponham.

## Saída de Revisão

Ao revisar uma passagem de polimento de UI, reporte mudanças concretas em linhas de antes/depois:

| Princípio | Antes | Depois |
| --- | --- | --- |
| Raio concêntrico | Mesmo raio no pai e no filho | Raio do pai considera o padding |
| Números tabulares | Contador muda conforme os dígitos mudam | Contador usa `tabular-nums` |
| Escopo de transição | `transition: all` | Propriedades de transição explícitas |

Inclua caminhos de arquivo e propriedades quando não forem óbvios a partir dos trechos.
Omita princípios que você verificou mas não alterou.

## Checklist

- Elementos arredondados aninhados são opticamente coerentes.
- Ícones estão visualmente centralizados.
- Botões, cards e popovers usam bordas ou sombras pelo motivo certo.
- Títulos e textos curtos evitam quebras de linha inadequadas.
- Números dinâmicos usam numerais tabulares.
- Imagens têm contornos neutros onde necessário.
- Animações de entrada e saída são divididas, sutis e interrompíveis onde
  apropriado.
- Botões têm estados ativos táteis sem motion exagerado.
- `transition: all` e `will-change: all` estão ausentes.
- Controles pequenos ainda têm áreas de toque utilizáveis.
