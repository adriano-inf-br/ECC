# Estado Dependente com `linkedSignal`

A função `linkedSignal` permite criar estado gravável que está intrinsecamente vinculado a algum outro estado. É perfeita para estado que precisa de um valor padrão derivado de um input ou de outro signal, mas que ainda pode ser modificado de forma independente pelo usuário.

Se o estado de origem mudar, o `linkedSignal` é reiniciado para um novo valor computado.

## Uso Básico

Quando você só precisa recomputar com base em uma origem, passe uma função de computação. O `linkedSignal` funciona como `computed`, mas o signal resultante é gravável (você pode chamar `.set()` ou `.update()` nele).

```ts
import { Component, signal, linkedSignal } from '@angular/core';

@Component({...})
export class ShippingMethodPicker {
  shippingOptions = signal(['Ground', 'Air', 'Sea']);

  // Assume a primeira opção como padrão.
  // Se shippingOptions mudar, selectedOption reinicia para a nova primeira opção.
  selectedOption = linkedSignal(() => this.shippingOptions()[0]);

  changeShipping(index: number) {
    // Ainda podemos atualizar este signal manualmente!
    this.selectedOption.set(this.shippingOptions()[index]);
  }
}
```

## Uso Avançado: Considerando o Estado Anterior

Às vezes, quando o estado de origem muda, você quer preservar a seleção manual do usuário se ela ainda for válida. Para isso, use a sintaxe de objeto fornecendo `source` e `computation`.

A função `computation` recebe o novo valor da origem e um objeto `previous` contendo o valor anterior da origem e o valor anterior do `linkedSignal`.

```ts
interface ShippingMethod { id: number; name: string; }

@Component({...})
export class ShippingMethodPicker {
  shippingOptions = signal<ShippingMethod[]>([
    {id: 0, name: 'Ground'}, {id: 1, name: 'Air'}, {id: 2, name: 'Sea'}
  ]);

  selectedOption = linkedSignal<ShippingMethod[], ShippingMethod>({
    source: this.shippingOptions,
    computation: (newOptions, previous) => {
      // Se as opções recém-carregadas ainda contiverem a opção previamente
      // selecionada pelo usuário, mantenha-a selecionada. Caso contrário, reinicie para a primeira opção.
      return newOptions.find(opt => opt.id === previous?.value.id) ?? newOptions[0];
    }
  });
}
```

### Quando usar `linkedSignal` vs `computed` vs `effect`

- Use `computed`: quando o estado é **estritamente** derivado de outro estado e nunca deve ser atualizado manualmente.
- Use `linkedSignal`: quando o estado é derivado de outro estado, mas o usuário **precisa** poder sobrescrevê-lo ou atualizá-lo manualmente.
- **Nunca** use `effect` para sincronizar uma parte do estado com outra. Isso é um antipadrão. Use `computed` ou `linkedSignal` em vez disso.
