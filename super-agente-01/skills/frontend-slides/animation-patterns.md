# Referência de Padrões de Animação

Use esta referência ao gerar apresentações. Combine as animações com o sentimento desejado.

## Guia de Efeito para Sentimento

| Sentimento | Animações | Dicas Visuais |
|---------|-----------|-------------|
| **Dramático / Cinematográfico** | Fade-ins lentos (1-1.5s), transições em grande escala (0.9 a 1), rolagem em paralaxe | Fundos escuros, efeitos de holofote, imagens em sangria total |
| **Tecnológico / Futurístico** | Brilho neon (box-shadow), texto glitch/scramble, revelações em grade | Sistemas de partículas (canvas), padrões de grade, acentos monoespaçados, ciano/magenta/azul elétrico |
| **Divertido / Amigável** | Easing elástico (física de mola), flutuação/balanço | Cantos arredondados, cores pastel/vivas, elementos desenhados à mão |
| **Profissional / Corporativo** | Animações sutis e rápidas (200-300ms), slides limpos | Azul-marinho/ardósia/carvão, espaçamento preciso, foco em visualização de dados |
| **Calmo / Minimalista** | Movimento muito lento e sutil, fades suaves | Muito espaço em branco, paleta discreta, tipografia serifada, espaçamento generoso |
| **Editorial / Revista** | Revelações de texto escalonadas, interação imagem-texto | Hierarquia tipográfica forte, citações em destaque, layouts que rompem a grade, títulos serifados + corpo sem serifa |

## Animações de Entrada

```css
/* Fade + Deslize para Cima (mais versátil) */
.reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s var(--ease-out-expo),
                transform 0.6s var(--ease-out-expo);
}
.visible .reveal {
    opacity: 1;
    transform: translateY(0);
}

/* Escala de Entrada */
.reveal-scale {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.6s, transform 0.6s var(--ease-out-expo);
}
.visible .reveal-scale {
    opacity: 1;
    transform: scale(1);
}

/* Deslize da Esquerda */
.reveal-left {
    opacity: 0;
    transform: translateX(-50px);
    transition: opacity 0.6s, transform 0.6s var(--ease-out-expo);
}
.visible .reveal-left {
    opacity: 1;
    transform: translateX(0);
}

/* Desfoque de Entrada */
.reveal-blur {
    opacity: 0;
    filter: blur(10px);
    transition: opacity 0.8s, filter 0.8s var(--ease-out-expo);
}
.visible .reveal-blur {
    opacity: 1;
    filter: blur(0);
}
```

## Efeitos de Fundo

```css
/* Malha de Gradiente — gradientes radiais em camadas para profundidade */
.gradient-bg {
    background:
        radial-gradient(ellipse at 20% 80%, rgba(120, 0, 255, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(0, 255, 200, 0.2) 0%, transparent 50%),
        var(--bg-primary);
}

/* Textura de Ruído — SVG inline para granulado */
.noise-bg {
    background-image: url("data:image/svg+xml,..."); /* SVG de ruído inline */
}

/* Padrão de Grade — linhas estruturais sutis */
.grid-bg {
    background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 50px 50px;
}
```

## Efeitos Interativos

```javascript
/* Inclinação 3D ao Passar o Mouse — adiciona profundidade a cartões/painéis */
class TiltEffect {
    constructor(element) {
        this.element = element;
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.perspective = '1000px';

        this.element.addEventListener('mousemove', (e) => {
            const rect = this.element.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            this.element.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
        });

        this.element.addEventListener('mouseleave', () => {
            this.element.style.transform = 'rotateY(0) rotateX(0)';
        });
    }
}
```

## Solução de Problemas

| Problema | Solução |
|---------|-----|
| Fontes não carregando | Verifique a URL do Fontshare/Google Fonts; certifique-se de que os nomes das fontes coincidem no CSS |
| Animações não disparando | Verifique se o Intersection Observer está rodando; confira se a classe `.visible` está sendo adicionada |
| Scroll snap não funcionando | Certifique-se de que `scroll-snap-type: y mandatory` está no html; cada slide precisa de `scroll-snap-align: start` |
| Problemas no mobile | Desative efeitos pesados no breakpoint de 768px; teste eventos de toque; reduza a contagem de partículas |
| Problemas de desempenho | Use `will-change` com moderação; prefira animações de `transform`/`opacity`; limite os handlers de scroll |
