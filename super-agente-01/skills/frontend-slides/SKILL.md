---
name: frontend-slides
description: Crie apresentações HTML deslumbrantes e ricas em animação do zero ou convertendo arquivos PowerPoint. Use quando o usuário quiser construir uma apresentação, converter um PPT/PPTX para web ou criar slides para uma palestra/pitch. Ajuda quem não é designer a descobrir sua estética por meio da exploração visual em vez de escolhas abstratas.
metadata:
  origin: ECC
---

# Frontend Slides

Crie apresentações HTML ricas em animação, sem dependências, que rodam inteiramente no navegador.

Inspirado na abordagem de exploração visual apresentada no trabalho de zarazhangrui (crédito: @zarazhangrui).

## When to Activate

- Criar um deck de palestra, deck de pitch, deck de workshop ou apresentação interna
- Converter slides `.ppt` ou `.pptx` em uma apresentação HTML
- Melhorar o layout, a movimentação ou a tipografia de uma apresentação HTML existente
- Explorar estilos de apresentação com um usuário que ainda não conhece sua preferência de design

## Non-Negotiables

1. **Zero dependências**: opte por um único arquivo HTML autossuficiente com CSS e JS inline.
2. **Ajuste à viewport é obrigatório**: cada slide deve caber dentro de uma viewport sem rolagem interna.
3. **Mostre, não conte**: use prévias visuais em vez de questionários abstratos de estilo.
4. **Design distinto**: evite decks genéricos com gradiente roxo, Inter sobre branco, com aparência de template.
5. **Qualidade de produção**: mantenha o código comentado, acessível, responsivo e performático.

Antes de gerar, leia `STYLE_PRESETS.md` para a base CSS segura para viewport, os limites de densidade, o catálogo de presets e os truques de CSS.

## Workflow

### 1. Detect Mode

Escolha um caminho:
- **Nova apresentação**: o usuário tem um tema, anotações ou um rascunho completo
- **Conversão de PPT**: o usuário tem `.ppt` ou `.pptx`
- **Aprimoramento**: o usuário já tem slides HTML e quer melhorias

### 2. Discover Content

Pergunte apenas o mínimo necessário:
- propósito: pitch, ensino, palestra de conferência, atualização interna
- extensão: curta (5-10), média (10-20), longa (20+)
- estado do conteúdo: texto finalizado, anotações brutas, apenas o tema

Se o usuário tiver conteúdo, peça que ele o cole antes da estilização.

### 3. Discover Style

Opte pela exploração visual por padrão.

Se o usuário já conhece o preset desejado, pule as prévias e use-o diretamente.

Caso contrário:
1. Pergunte qual sensação o deck deve criar: impressionado, energizado, focado, inspirado.
2. Gere **3 arquivos de prévia de slide único** em `.ecc-design/slide-previews/`.
3. Cada prévia deve ser autossuficiente, mostrar tipografia/cor/movimentação claramente e ficar abaixo de aproximadamente 100 linhas de conteúdo de slide.
4. Pergunte ao usuário qual prévia manter ou quais elementos mesclar.

Use o guia de presets em `STYLE_PRESETS.md` ao mapear humor para estilo.

### 4. Build the Presentation

Produza:
- `presentation.html`
- `[presentation-name].html`

Use uma pasta `assets/` apenas quando o deck contiver imagens extraídas ou fornecidas pelo usuário.

Estrutura obrigatória:
- seções de slide semânticas
- uma base CSS segura para viewport de `STYLE_PRESETS.md`
- propriedades customizadas de CSS para valores de tema
- uma classe controladora de apresentação para navegação por teclado, roda do mouse e toque
- Intersection Observer para animações de revelação
- suporte a movimento reduzido

### 5. Enforce Viewport Fit

Trate isso como uma barreira rígida.

Regras:
- cada `.slide` deve usar `height: 100vh; height: 100dvh; overflow: hidden;`
- todo o tipo e espaçamento devem escalar com `clamp()`
- quando o conteúdo não couber, divida em múltiplos slides
- nunca resolva o estouro reduzindo o texto abaixo de tamanhos legíveis
- nunca permita barras de rolagem dentro de um slide

Use os limites de densidade e o bloco CSS obrigatório em `STYLE_PRESETS.md`.

### 6. Validate

Verifique o deck finalizado nestes tamanhos:
- 1920x1080
- 1280x720
- 768x1024
- 375x667
- 667x375

Se houver automação de navegador disponível, use-a para verificar que nenhum slide estoura e que a navegação por teclado funciona.

### 7. Deliver

Na entrega:
- exclua arquivos de prévia temporários, a menos que o usuário queira mantê-los
- abra o deck com o abridor apropriado para a plataforma quando útil
- resuma o caminho do arquivo, o preset usado, a contagem de slides e os pontos fáceis de customização de tema

Use o abridor correto para o SO atual:
- macOS: `open file.html`
- Linux: `xdg-open file.html`
- Windows: `start "" file.html`

## PPT / PPTX Conversion

Para conversão de PowerPoint:
1. Prefira `python3` com `python-pptx` para extrair texto, imagens e notas.
2. Se `python-pptx` não estiver disponível, pergunte se deve instalá-lo ou recorrer a um fluxo de trabalho manual/baseado em exportação.
3. Preserve a ordem dos slides, as notas do palestrante e os assets extraídos.
4. Após a extração, execute o mesmo fluxo de trabalho de seleção de estilo de uma nova apresentação.

Mantenha a conversão multiplataforma. Não dependa de ferramentas exclusivas do macOS quando o Python puder fazer o trabalho.

## Implementation Requirements

### HTML / CSS

- Use CSS e JS inline, a menos que o usuário queira explicitamente um projeto multiarquivo.
- As fontes podem vir do Google Fonts ou do Fontshare.
- Prefira fundos atmosféricos, forte hierarquia de tipos e uma direção visual clara.
- Use formas abstratas, gradientes, grids, ruído e geometria em vez de ilustrações.

### JavaScript

Inclua:
- navegação por teclado
- navegação por toque / swipe
- navegação por roda do mouse
- indicador de progresso ou índice de slide
- gatilhos de animação de revelação ao entrar

### Accessibility

- use estrutura semântica (`main`, `section`, `nav`)
- mantenha o contraste legível
- suporte navegação apenas por teclado
- respeite `prefers-reduced-motion`

## Content Density Limits

Use estes máximos, a menos que o usuário peça explicitamente slides mais densos e a legibilidade ainda se mantenha:

| Tipo de slide | Limite |
|------------|-------|
| Título | 1 cabeçalho + 1 subtítulo + tagline opcional |
| Conteúdo | 1 cabeçalho + 4-6 marcadores ou 2 parágrafos curtos |
| Grade de recursos | 6 cards no máximo |
| Código | 8-10 linhas no máximo |
| Citação | 1 citação + atribuição |
| Imagem | 1 imagem restrita pela viewport |

## Anti-Patterns

- gradientes genéricos de startup sem identidade visual
- decks com fontes do sistema, a menos que intencionalmente editoriais
- longas paredes de marcadores
- blocos de código que precisam de rolagem
- caixas de conteúdo de altura fixa que quebram em telas curtas
- funções CSS negadas inválidas como `-clamp(...)`

## Related ECC Skills

- `frontend-patterns` para padrões de componente e interação em torno do deck
- `liquid-glass-design` quando uma apresentação intencionalmente toma emprestada a estética glass da Apple
- `e2e-testing` se você precisar de verificação automatizada de navegador para o deck final

## Deliverable Checklist

- a apresentação roda a partir de um arquivo local em um navegador
- cada slide cabe na viewport sem rolagem
- o estilo é distinto e intencional
- a animação é significativa, não ruidosa
- o movimento reduzido é respeitado
- os caminhos de arquivo e os pontos de customização são explicados na entrega
