> Este arquivo estende [common/patterns.md](../common/patterns.md) com orientações de qualidade de design específicas de web.

# Padrões de Qualidade de Design Web

## Política Anti-Template

Não entregue UI genérica com cara de template. A saída de frontend deve parecer intencional, opinativa e específica para o produto.

### Padrões Banidos

- Grids de cards padrão com espaçamento uniforme e sem hierarquia
- Seção hero de prateleira com título centralizado, blob de gradiente e CTA genérico
- Defaults de biblioteca sem modificações passados como design finalizado
- Layouts planos sem camadas, profundidade ou movimento
- Raio, espaçamento e sombras uniformes em todos os componentes
- Estilização segura de cinza-sobre-branco com uma cor de destaque decorativa
- Layouts de dashboard por números com sidebar + cards + gráficos e sem ponto de vista
- Pilhas de fontes padrão usadas sem uma razão deliberada

### Qualidades Exigidas

Toda superfície de frontend significativa deve demonstrar pelo menos quatro destas:

1. Hierarquia clara por meio de contraste de escala
2. Ritmo intencional no espaçamento, não padding uniforme em todo lugar
3. Profundidade ou camadas por meio de sobreposição, sombras, superfícies ou movimento
4. Tipografia com personalidade e uma estratégia real de pareamento
5. Cor usada de forma semântica, não apenas decorativa
6. Estados de hover, focus e active que pareçam projetados
7. Composição editorial ou bento que quebra o grid, onde apropriado
8. Textura, grão ou atmosfera quando combinar com a direção visual
9. Movimento que esclarece o fluxo em vez de distrair dele
10. Visualização de dados tratada como parte do design system, não como algo secundário

## Antes de Escrever Código de Frontend

1. Escolha uma direção de estilo específica. Evite defaults vagos como "clean minimal".
2. Defina uma paleta de forma intencional.
3. Escolha a tipografia deliberadamente.
4. Reúna pelo menos um pequeno conjunto de referências reais.
5. Use as skills de design/frontend do ECC quando relevante.

## Direções de Estilo Que Valem a Pena

- Editorial / revista
- Neo-brutalismo
- Glassmorphism com profundidade real
- Dark luxury ou light luxury com contraste disciplinado
- Layouts bento
- Scrollytelling
- Integração 3D
- Swiss / International
- Retrofuturismo

Não use dark mode por padrão automaticamente. Escolha a direção visual que o produto realmente quer.

## Checklist de Componente

- [ ] Ele evita parecer um template padrão de Tailwind ou shadcn?
- [ ] Ele tem estados intencionais de hover/focus/active?
- [ ] Ele usa hierarquia em vez de ênfase uniforme?
- [ ] Isto pareceria crível no screenshot de um produto real?
- [ ] Se suporta ambos os temas, tanto o light quanto o dark parecem intencionais?
