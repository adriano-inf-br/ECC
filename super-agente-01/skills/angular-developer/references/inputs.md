# Inputs

Inputs permitem que dados fluam de um componente pai para um componente filho. O Angular recomenda usar a API `input` baseada em signals para aplicações modernas.

## Inputs Baseados em Signals

Declare inputs usando a função `input()`. Ela retorna um `InputSignal`.

```ts
import {Component, input, computed} from '@angular/core';

@Component({
  selector: 'app-user',
  template: `<p>User: {{ name() }} ({{ age() }})</p>`,
})
export class User {
  // Input opcional com valor padrão
  name = input('Guest');

  // Input obrigatório
  age = input.required<number>();

  // Inputs são signals reativos
  label = computed(() => `Name: ${this.name()}`);
}
```

### Uso no Template

```html
<app-user [name]="userName" [age]="25" />
```

## Opções de Configuração

A função `input` aceita um objeto de configuração:

- **Alias**: altera o nome da propriedade usado nos templates.
- **Transform**: modifica o valor antes que ele chegue ao componente.

```ts
import { input, booleanAttribute } from '@angular/core';

@Component({...})
export class CustomButton {
  // Exemplo de alias
  label = input('', { alias: 'btnLabel' });

  // Exemplo de transform usando helper embutido
  disabled = input(false, { transform: booleanAttribute });
}
```

## Model Inputs (Vinculação Bidirecional)

Use `model()` para criar um input que suporta vinculação bidirecional de dados.

```ts
@Component({
  selector: 'custom-counter',
  template: `<button (click)="increment()">+</button>`,
})
export class CustomCounter {
  value = model(0);

  increment() {
    this.value.update((v) => v + 1);
  }
}
```

### Uso

```html
<!-- Vinculação bidirecional com um signal -->
<custom-counter [(value)]="mySignal" />

<!-- Vinculação bidirecional com uma propriedade comum -->
<custom-counter [(value)]="myProperty" />
```

## Inputs Baseados em Decorador (@Input)

A API legada continua suportada, mas não é recomendada para código novo.

```ts
import { Component, Input } from '@angular/core';

@Component({...})
export class Legacy {
  @Input({ required: true }) value = 0;
  @Input({ transform: trimString }) label = '';
}
```

## Boas Práticas

- **Prefira Signals**: use `input()` em vez de `@Input()` para melhor reatividade e segurança de tipos.
- **Inputs Obrigatórios**: use `input.required()` para dados obrigatórios e obter erros em tempo de build.
- **Transforms Puros**: garanta que as funções de transform de input sejam puras e analisáveis estaticamente.
- **Evite Colisões**: não use nomes de input que colidam com propriedades padrão do DOM (ex.: `id`, `title`).
