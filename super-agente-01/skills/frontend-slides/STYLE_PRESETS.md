# Style Presets Reference

Estilos visuais curados para `frontend-slides`.

Use este arquivo para:
- a base CSS obrigatória de ajuste à viewport
- seleção de preset e mapeamento de humor
- truques de CSS e regras de validação

Apenas formas abstratas. Evite ilustrações, a menos que o usuário peça explicitamente por elas.

## Viewport Fit Is Non-Negotiable

Cada slide deve caber totalmente em uma viewport.

### Golden Rule

```text
Each slide = exactly one viewport height.
Too much content = split into more slides.
Never scroll inside a slide.
```

### Density Limits

| Tipo de slide | Conteúdo Máximo |
|------------|-----------------|
| Slide de título | 1 cabeçalho + 1 subtítulo + tagline opcional |
| Slide de conteúdo | 1 cabeçalho + 4-6 marcadores ou 2 parágrafos |
| Grade de recursos | 6 cards no máximo |
| Slide de código | 8-10 linhas no máximo |
| Slide de citação | 1 citação + atribuição |
| Slide de imagem | 1 imagem, idealmente abaixo de 60vh |

## Mandatory Base CSS

Copie este bloco em cada apresentação gerada e então aplique o tema sobre ele.

```css
/* ===========================================
   AJUSTE À VIEWPORT: ESTILOS BASE OBRIGATÓRIOS
   =========================================== */

html, body {
    height: 100%;
    overflow-x: hidden;
}

html {
    scroll-snap-type: y mandatory;
    scroll-behavior: smooth;
}

.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
}

.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
}

:root {
    --title-size: clamp(1.5rem, 5vw, 4rem);
    --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
    --h3-size: clamp(1rem, 2.5vw, 1.75rem);
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --small-size: clamp(0.65rem, 1vw, 0.875rem);

    --slide-padding: clamp(1rem, 4vw, 4rem);
    --content-gap: clamp(0.5rem, 2vw, 2rem);
    --element-gap: clamp(0.25rem, 1vw, 1rem);
}

.card, .container, .content-box {
    max-width: min(90vw, 1000px);
    max-height: min(80vh, 700px);
}

.feature-list, .bullet-list {
    gap: clamp(0.4rem, 1vh, 1rem);
}

.feature-list li, .bullet-list li {
    font-size: var(--body-size);
    line-height: 1.4;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));
    gap: clamp(0.5rem, 1.5vw, 1rem);
}

img, .image-container {
    max-width: 100%;
    max-height: min(50vh, 400px);
    object-fit: contain;
}

@media (max-height: 700px) {
    :root {
        --slide-padding: clamp(0.75rem, 3vw, 2rem);
        --content-gap: clamp(0.4rem, 1.5vw, 1rem);
        --title-size: clamp(1.25rem, 4.5vw, 2.5rem);
        --h2-size: clamp(1rem, 3vw, 1.75rem);
    }
}

@media (max-height: 600px) {
    :root {
        --slide-padding: clamp(0.5rem, 2.5vw, 1.5rem);
        --content-gap: clamp(0.3rem, 1vw, 0.75rem);
        --title-size: clamp(1.1rem, 4vw, 2rem);
        --body-size: clamp(0.7rem, 1.2vw, 0.95rem);
    }

    .nav-dots, .keyboard-hint, .decorative {
        display: none;
    }
}

@media (max-height: 500px) {
    :root {
        --slide-padding: clamp(0.4rem, 2vw, 1rem);
        --title-size: clamp(1rem, 3.5vw, 1.5rem);
        --h2-size: clamp(0.9rem, 2.5vw, 1.25rem);
        --body-size: clamp(0.65rem, 1vw, 0.85rem);
    }
}

@media (max-width: 600px) {
    :root {
        --title-size: clamp(1.25rem, 7vw, 2.5rem);
    }

    .grid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.2s !important;
    }

    html {
        scroll-behavior: auto;
    }
}
```

## Viewport Checklist

- cada `.slide` tem `height: 100vh`, `height: 100dvh` e `overflow: hidden`
- toda a tipografia usa `clamp()`
- todo o espaçamento usa `clamp()` ou unidades de viewport
- as imagens têm restrições de `max-height`
- as grids se adaptam com `auto-fit` + `minmax()`
- existem breakpoints de altura curta em `700px`, `600px` e `500px`
- se algo parecer apertado, divida o slide

## Mood to Preset Mapping

| Humor | Bons Presets |
|------|--------------|
| Impressionado / Confiante | Bold Signal, Electric Studio, Dark Botanical |
| Animado / Energizado | Creative Voltage, Neon Cyber, Split Pastel |
| Calmo / Focado | Notebook Tabs, Paper & Ink, Swiss Modern |
| Inspirado / Tocado | Dark Botanical, Vintage Editorial, Pastel Geometry |

## Preset Catalog

### 1. Bold Signal

- Vibe: confiante, de alto impacto, pronto para keynote
- Melhor para: decks de pitch, lançamentos, declarações
- Fontes: Archivo Black + Space Grotesk
- Paleta: base carvão, card focal laranja vibrante, texto branco nítido
- Assinatura: números de seção superdimensionados, card de alto contraste em campo escuro

### 2. Electric Studio

- Vibe: limpo, ousado, polido como agência
- Melhor para: apresentações para clientes, revisões estratégicas
- Fontes: apenas Manrope
- Paleta: preto, branco, acento cobalto saturado
- Assinatura: divisão em dois painéis e alinhamento editorial nítido

### 3. Creative Voltage

- Vibe: energético, retrô-moderno, confiança brincalhona
- Melhor para: estúdios criativos, trabalho de marca, narrativa de produto
- Fontes: Syne + Space Mono
- Paleta: azul elétrico, amarelo neon, azul-marinho profundo
- Assinatura: texturas halftone, badges, contraste marcante

### 4. Dark Botanical

- Vibe: elegante, premium, atmosférico
- Melhor para: marcas de luxo, narrativas reflexivas, decks de produto premium
- Fontes: Cormorant + IBM Plex Sans
- Paleta: quase preto, marfim quente, blush, dourado, terracota
- Assinatura: círculos abstratos desfocados, linhas finas, movimentação contida

### 5. Notebook Tabs

- Vibe: editorial, organizado, tátil
- Melhor para: relatórios, revisões, narrativa estruturada
- Fontes: Bodoni Moda + DM Sans
- Paleta: papel creme sobre carvão com abas pastel
- Assinatura: folha de papel, abas laterais coloridas, detalhes de fichário

### 6. Pastel Geometry

- Vibe: acessível, moderno, amigável
- Melhor para: visões gerais de produto, onboarding, decks de marca mais leves
- Fontes: apenas Plus Jakarta Sans
- Paleta: campo azul pálido, card creme, acentos suaves rosa/menta/lavanda
- Assinatura: pílulas verticais, cards arredondados, sombras suaves

### 7. Split Pastel

- Vibe: brincalhão, moderno, criativo
- Melhor para: introduções de agência, workshops, portfólios
- Fontes: apenas Outfit
- Paleta: divisão pêssego + lavanda com badges menta
- Assinatura: pano de fundo dividido, tags arredondadas, sobreposições de grid leves

### 8. Vintage Editorial

- Vibe: espirituoso, conduzido por personalidade, inspirado em revistas
- Melhor para: marcas pessoais, palestras opinativas, narrativa
- Fontes: Fraunces + Work Sans
- Paleta: creme, carvão, acentos quentes empoeirados
- Assinatura: acentos geométricos, callouts com borda, manchetes serifadas marcantes

### 9. Neon Cyber

- Vibe: futurista, tech, cinético
- Melhor para: IA, infraestrutura, ferramentas de desenvolvimento, palestras sobre o futuro de X
- Fontes: Clash Display + Satoshi
- Paleta: azul-marinho meia-noite, ciano, magenta
- Assinatura: brilho, partículas, grids, energia de data-radar

### 10. Terminal Green

- Vibe: focado em desenvolvedor, hacker-limpo
- Melhor para: APIs, ferramentas de CLI, demonstrações de engenharia
- Fontes: apenas JetBrains Mono
- Paleta: GitHub dark + verde de terminal
- Assinatura: linhas de varredura, enquadramento de linha de comando, ritmo monoespaçado preciso

### 11. Swiss Modern

- Vibe: minimalista, preciso, orientado a dados
- Melhor para: corporativo, estratégia de produto, analytics
- Fontes: Archivo + Nunito
- Paleta: branco, preto, vermelho de sinalização
- Assinatura: grids visíveis, assimetria, disciplina geométrica

### 12. Paper & Ink

- Vibe: literário, reflexivo, conduzido por história
- Melhor para: ensaios, narrativas de keynote, decks de manifesto
- Fontes: Cormorant Garamond + Source Serif 4
- Paleta: creme quente, carvão, acento carmesim
- Assinatura: pull quotes, capitulares, linhas elegantes

## Direct Selection Prompts

Se o usuário já conhece o estilo que quer, permita que ele escolha diretamente entre os nomes de preset acima em vez de forçar a geração de prévias.

## Animation Feel Mapping

| Sensação | Direção da Movimentação |
|---------|------------------|
| Dramático / Cinematográfico | fades lentos, parallax, scale-ins grandes |
| Tech / Futurista | brilho, partículas, movimentação de grid, texto scramble |
| Brincalhão / Amigável | easing com mola, formas arredondadas, movimentação flutuante |
| Profissional / Corporativo | transições sutis de 200-300ms, slides limpos |
| Calmo / Minimalista | movimento muito contido, espaço em branco em primeiro lugar |
| Editorial / Revista | hierarquia forte, jogo escalonado de texto e imagem |

## CSS Gotcha: Negating Functions

Nunca escreva isto:

```css
right: -clamp(28px, 3.5vw, 44px);
margin-left: -min(10vw, 100px);
```

Os navegadores os ignoram silenciosamente.

Sempre escreva isto em vez disso:

```css
right: calc(-1 * clamp(28px, 3.5vw, 44px));
margin-left: calc(-1 * min(10vw, 100px));
```

## Validation Sizes

Teste no mínimo em:
- Desktop: `1920x1080`, `1440x900`, `1280x720`
- Tablet: `1024x768`, `768x1024`
- Mobile: `375x667`, `414x896`
- Celular em paisagem: `667x375`, `896x414`

## Anti-Patterns

Não use:
- templates de startup roxo sobre branco
- Inter / Roboto / Arial como a voz visual, a menos que o usuário queira explicitamente neutralidade utilitária
- paredes de marcadores, tipos minúsculos ou blocos de código que exigem rolagem
- ilustrações decorativas quando a geometria abstrata faria o trabalho melhor
