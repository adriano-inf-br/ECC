# Outputs (Eventos Personalizados)

Outputs permitem que um componente filho emita eventos personalizados que um componente pai pode escutar. O Angular recomenda usar a nova função `output()` para aplicações modernas.

## Outputs baseados em função

Declare outputs usando a função `output()`. Isso retorna um `OutputEmitterRef`.

```ts
import {Component, output} from '@angular/core';

@Component({
  selector: 'custom-slider',
  template: `<button (click)="changeValue(50)">Set to 50</button>`,
})
export class CustomSlider {
  // Output sem dados de evento
  panelClosed = output<void>();

  // Output com dados de evento (number)
  valueChanged = output<number>();

  changeValue(newValue: number) {
    this.valueChanged.emit(newValue);
  }
}
```

### Uso no Template

Vincule ao evento de output usando parênteses `()`. Se o evento emitir dados, acesse-os usando a variável especial `$event`.

```html
<custom-slider (panelClosed)="savePanelState()" (valueChanged)="logValue($event)" />
```

## Opções de Configuração

A função `output` aceita um objeto de configuração para especificar um alias.

```ts
@Component({...})
export class CustomSlider {
  // O evento é chamado 'valueChanged' no template,
  // mas acessado como 'changed' na classe do componente.
  changed = output<number>({ alias: 'valueChanged' });
}
```

## Inscrição Programática

Ao criar componentes dinamicamente, você pode se inscrever em outputs de forma programática:

```ts
const componentRef = viewContainerRef.createComponent(CustomSlider);

const subscription = componentRef.instance.valueChanged.subscribe((val) => {
  console.log('Value changed:', val);
});

// Faça a limpeza manualmente se necessário (o Angular limpa componentes destruídos automaticamente)
subscription.unsubscribe();
```

## Outputs baseados em Decorator (@Output)

A API legada usa o decorator `@Output()` com um `EventEmitter`. Continua suportada, mas não é recomendada para código novo.

```ts
import { Component, Output, EventEmitter } from '@angular/core';

@Component({...})
export class LegacyExample {
  @Output() valueChanged = new EventEmitter<number>();

  // Com alias
  @Output('customEventName') changed = new EventEmitter<void>();
}
```

## Boas Práticas

- **Prefira `output()`**: Use o `output()` baseado em função em vez de `@Output()` e `EventEmitter`.
- **Nomenclatura**: Use `camelCase` para nomes de output. Evite prefixar com `on` (por exemplo, use `valueChanged` em vez de `onValueChanged`).
- **Sem Propagação no DOM**: Eventos personalizados do Angular não propagam (bubble) pela árvore do DOM como eventos nativos.
- **Evite Colisões**: Não escolha nomes que colidam com eventos nativos do DOM (como `click` ou `submit`).
