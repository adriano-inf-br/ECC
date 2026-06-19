> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo frontend específico de web.

# Estilo de Código Web

## Organização de Arquivos

Organize por funcionalidade ou área de superfície, não por tipo de arquivo:

```text
src/
├── components/
│   ├── hero/
│   │   ├── Hero.tsx
│   │   ├── HeroVisual.tsx
│   │   └── hero.css
│   ├── scrolly-section/
│   │   ├── ScrollySection.tsx
│   │   ├── StickyVisual.tsx
│   │   └── scrolly.css
│   └── ui/
│       ├── Button.tsx
│       ├── SurfaceCard.tsx
│       └── AnimatedText.tsx
├── hooks/
│   ├── useReducedMotion.ts
│   └── useScrollProgress.ts
├── lib/
│   ├── animation.ts
│   └── color.ts
└── styles/
    ├── tokens.css
    ├── typography.css
    └── global.css
```

## Custom Properties de CSS

Defina design tokens como variáveis. Não fixe paleta, tipografia ou espaçamento repetidamente no código:

```css
:root {
  --color-surface: oklch(98% 0 0);
  --color-text: oklch(18% 0 0);
  --color-accent: oklch(68% 0.21 250);

  --text-base: clamp(1rem, 0.92rem + 0.4vw, 1.125rem);
  --text-hero: clamp(3rem, 1rem + 7vw, 8rem);

  --space-section: clamp(4rem, 3rem + 5vw, 10rem);

  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Propriedades Exclusivas de Animação

Prefira movimento amigável ao compositor:
- `transform`
- `opacity`
- `clip-path`
- `filter` (com parcimônia)

Evite animar propriedades vinculadas ao layout:
- `width`
- `height`
- `top`
- `left`
- `margin`
- `padding`
- `border`
- `font-size`

## HTML Semântico Primeiro

```html
<header>
  <nav aria-label="Main navigation">...</nav>
</header>
<main>
  <section aria-labelledby="hero-heading">
    <h1 id="hero-heading">...</h1>
  </section>
</main>
<footer>...</footer>
```

Não recorra a pilhas genéricas de `div` envoltórias quando existe um elemento semântico.

## Nomenclatura

- Componentes: PascalCase (`ScrollySection`, `SurfaceCard`)
- Hooks: prefixo `use` (`useReducedMotion`)
- Classes CSS: kebab-case ou classes utilitárias
- Timelines de animação: camelCase com intenção (`heroRevealTl`)
