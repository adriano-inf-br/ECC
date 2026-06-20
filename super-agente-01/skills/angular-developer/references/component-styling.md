# Estilização de Componentes

Componentes Angular podem definir estilos que se aplicam especificamente ao seu template, possibilitando encapsulamento e modularidade.

## Definindo Estilos

Os estilos podem ser definidos inline ou em arquivos separados.

```ts
@Component({
  selector: 'app-photo',
  // Estilos inline
  styles: `
    img {
      border-radius: 50%;
    }
  `,
  // OU arquivo externo
  styleUrl: 'photo.component.css',
})
export class Photo {}
```

## View Encapsulation

Todo componente tem uma configuração de view encapsulation que determina como os estilos são escopados.

| Modo                            | Comportamento                                                                                              |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------- |
| `Emulated` (Padrão)             | Escopa os estilos ao componente usando atributos HTML únicos. Estilos globais ainda podem vazar para dentro. |
| `ShadowDom`                     | Usa a API nativa Shadow DOM do navegador para isolar os estilos completamente.                            |
| `None`                          | Desativa o encapsulamento. Os estilos do componente tornam-se globais.                                    |
| `ExperimentalIsolatedShadowDom` | Garante estritamente que apenas os estilos do componente sejam aplicados.                                 |

### Uso

```ts
import { ViewEncapsulation } from '@angular/core';

@Component({
  ...,
  encapsulation: ViewEncapsulation.None,
})
export class GlobalStyled {}
```

## Selectors Especiais

### `:host`

Mira no elemento host do componente (o elemento que corresponde ao selector do componente).

```css
:host {
  display: block;
  border: 1px solid black;
}
```

### `:host-context()`

Mira no elemento host com base em alguma condição em sua ascendência.

```css
/* Aplica estilos se algum ancestral tiver a classe 'theme-dark' */
:host-context(.theme-dark) {
  background-color: #333;
}
```

### `::ng-deep`

Desativa a view encapsulation para uma regra específica, permitindo que ela "vaze" para os componentes filhos.
**Nota: A equipe do Angular desencoraja fortemente o uso de `::ng-deep`.** Ele é suportado apenas por compatibilidade retroativa.

## Estilos em Templates

Você pode usar elementos `<style>` diretamente no template de um componente. As regras de view encapsulation ainda se aplicam.

```html
<style>
  .dynamic-class {
    color: red;
  }
</style>
<div class="dynamic-class">Hello</div>
```

## Estilos Externos

Usar `<link>` ou `@import` no CSS é tratado como estilos externos. **Estilos externos não são afetados pela view encapsulation emulada.**
