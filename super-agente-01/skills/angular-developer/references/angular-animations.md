# Angular Animations

Ao animar elementos no Angular, **primeiro analise a versão do Angular do projeto** no `package.json`.
Para aplicações modernas (**Angular v20.2 e acima**), prefira usar CSS nativo com `animate.enter` e `animate.leave`. Para aplicações mais antigas, você pode precisar usar o pacote depreciado `@angular/animations`.

## 1. Animações com CSS Nativo (Recomendado para v20.2+)

O Angular moderno fornece `animate.enter` e `animate.leave` para animar elementos à medida que entram ou saem do DOM. Eles aplicam classes CSS nos momentos apropriados.

### `animate.enter` e `animate.leave`

Use-os diretamente nos elementos para aplicar classes CSS durante a fase de entrada ou de saída. O Angular remove automaticamente as classes de entrada quando a animação termina. Para `animate.leave`, o Angular aguarda a conclusão da animação antes de remover o elemento do DOM.

Exemplo de `animate.enter`:

```html
@if (isShown()) {
<div class="enter-container" animate.enter="enter-animation">
  <p>The box is entering.</p>
</div>
}
```

```css
/* Garanta que você tenha um estilo inicial se usar transitions em vez de keyframes */
.enter-container {
  border: 1px solid #dddddd;
  margin-top: 1em;
  padding: 20px;
  font-weight: bold;
  font-size: 20px;
}
.enter-container p {
  margin: 0;
}
.enter-animation {
  animation: slide-fade 1s;
}
@keyframes slide-fade {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

_Nota: `animate.leave` pode ser adicionado a elementos filhos que estão sendo removidos._

### Event Bindings e Bibliotecas de Terceiros

Você pode fazer binding em `(animate.enter)` e `(animate.leave)` para chamar funções ou usar bibliotecas JS como GSAP.

```html
@if(show()) {
<div (animate.leave)="onLeave($event)">...</div>
}
```

```ts
import { AnimationCallbackEvent } from '@angular/core';

onLeave(event: AnimationCallbackEvent) {
  // Lógica de animação customizada aqui
  // CRÍTICO: você DEVE chamar animationComplete() ao terminar para que o Angular remova o elemento!
  event.animationComplete();
}
```

## 2. Animações CSS Avançadas

O CSS oferece ferramentas robustas para sequências de animação avançadas.

### Animando Estado e Estilos

Alterne classes CSS nos elementos usando property binding para disparar transitions.

```html
<div [class.open]="isOpen">...</div>
```

```css
div {
  transition: height 0.3s ease-out;
  height: 100px;
}
div.open {
  height: 200px;
}
```

### Animando Altura Automática

Você pode usar `css-grid` para animar até a altura automática.

```css
.container {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s;
}
.container.open {
  grid-template-rows: 1fr;
}
.container > div {
  overflow: hidden;
}
```

### Animações Escalonadas e Paralelas

- **Escalonamento (staggering)**: Use `animation-delay` ou `transition-delay` com valores diferentes para os itens de uma lista.
- **Paralelas**: Aplique múltiplas animações na forma abreviada de `animation` (ex.: `animation: rotate 3s, fade-in 2s;`).

### Controle Programático

Recupere animações diretamente usando as Web APIs padrão:

```ts
const animations = element.getAnimations();
animations.forEach((anim) => anim.pause());
```

## 3. DSL de Animações Legada (Depreciada)

Para projetos mais antigos (anteriores à v20.2 ou onde `@angular/animations` já é amplamente usado), você usa a DSL dos metadados do componente.

**Importante:** Não misture animações legadas e `animate.enter`/`leave` no mesmo componente.

### Configuração

```ts
bootstrapApplication(App, {
  providers: [provideAnimationsAsync()],
});
```

### Definindo Transitions

```ts
import {signal} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';

@Component({
  animations: [
    trigger('openClose', [
      state('open', style({opacity: 1})),
      state('closed', style({opacity: 0})),
      transition('open <=> closed', [animate('0.5s')]),
    ]),
  ],
  template: `<div [@openClose]="isOpen() ? 'open' : 'closed'">...</div>`,
})
export class OpenClose {
  isOpen = signal(true);
}
```
