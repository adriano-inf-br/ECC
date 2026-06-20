# Elementos Host de Componentes

O **elemento host** é o elemento do DOM que corresponde ao seletor de um componente. O template do componente é renderizado dentro deste elemento.

## Vinculando ao Elemento Host

Use a propriedade `host` no decorador `@Component` para vincular propriedades, atributos, estilos e eventos ao elemento host. Esta é a **abordagem preferida** em relação aos decoradores legados.

```ts
@Component({
  selector: 'custom-slider',
  host: {
    'role': 'slider', // Atributo estático
    '[attr.aria-valuenow]': 'value', // Vinculação de atributo
    '[class.active]': 'isActive()', // Vinculação de classe
    '[style.color]': 'color()', // Vinculação de estilo
    '[tabIndex]': 'disabled ? -1 : 0', // Vinculação de propriedade
    '(keydown)': 'onKeyDown($event)', // Vinculação de evento
  },
})
export class CustomSlider {
  value = 0;
  disabled = false;
  isActive = signal(false);
  color = signal('blue');

  onKeyDown(event: KeyboardEvent) {
    /* ... */
  }
}
```

## Decoradores Legados

`@HostBinding` e `@HostListener` são suportados para compatibilidade retroativa, mas devem ser evitados em código novo.

```ts
export class CustomSlider {
  @HostBinding('tabIndex')
  get tabIndex() {
    return this.disabled ? -1 : 0;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    /* ... */
  }
}
```

## Colisões de Vinculação

Se tanto o componente (vinculação no host) quanto o consumidor (vinculação no template) vincularem à mesma propriedade:

1. **Estático vs Estático**: a vinculação da instância (consumidor) vence.
2. **Estático vs Dinâmico**: a vinculação dinâmica vence.
3. **Dinâmico vs Dinâmico**: a vinculação no host do componente vence.

## Injetando Atributos do Host

Use `HostAttributeToken` com a função `inject` para ler atributos estáticos do elemento host no momento da construção.

```ts
import {Component, HostAttributeToken, inject} from '@angular/core';

@Component({
  selector: 'app-btn',
  template: `<ng-content />`,
})
export class AppButton {
  // Lança erro se 'type' estiver ausente, a menos que injetado com { optional: true }
  type = inject(new HostAttributeToken('type'));
}
```

Uso:

```html
<app-btn type="primary">Click Me</app-btn>
```
