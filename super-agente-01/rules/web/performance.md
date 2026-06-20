> Este arquivo estende [common/performance.md](../common/performance.md) com conteúdo de performance específico de web.

# Regras de Performance Web

## Metas de Core Web Vitals

| Métrica | Meta |
|--------|--------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| FCP | < 1.5s |
| TBT | < 200ms |

## Orçamento de Bundle

| Tipo de Página | Orçamento de JS (gzipped) | Orçamento de CSS |
|-----------|---------------------|------------|
| Landing page | < 150kb | < 30kb |
| Página de app | < 300kb | < 50kb |
| Microsite | < 80kb | < 15kb |

## Estratégia de Carregamento

1. Inline do CSS crítico acima da dobra quando justificado
2. Preload apenas da imagem hero e da fonte primária
3. Defer do CSS ou JS não crítico
4. Import dinâmico de bibliotecas pesadas

```js
const gsapModule = await import('gsap');
const { ScrollTrigger } = await import('gsap/ScrollTrigger');
```

## Otimização de Imagens

- `width` e `height` explícitos
- `loading="eager"` mais `fetchpriority="high"` apenas para mídia hero
- `loading="lazy"` para assets abaixo da dobra
- Prefira AVIF ou WebP com fallbacks
- Nunca entregue imagens-fonte muito maiores do que o tamanho renderizado

## Carregamento de Fontes

- No máximo duas famílias de fontes, salvo uma exceção clara
- `font-display: swap`
- Faça subset quando possível
- Faça preload apenas do peso/estilo realmente crítico

## Performance de Animação

- Anime apenas propriedades amigáveis ao compositor
- Use `will-change` de forma restrita e remova-o quando terminar
- Prefira CSS para transições simples
- Use `requestAnimationFrame` ou bibliotecas de animação consagradas para movimento em JS
- Evite o excesso de handlers de scroll; use IntersectionObserver ou bibliotecas bem comportadas

## Checklist de Performance

- [ ] Todas as imagens têm dimensões explícitas
- [ ] Nenhum recurso acidental que bloqueia a renderização
- [ ] Nenhum layout shift de conteúdo dinâmico
- [ ] O movimento permanece em propriedades amigáveis ao compositor
- [ ] Scripts de terceiros carregam com async/defer e apenas quando necessário
