# Reactive Forms

Reactive forms oferecem uma abordagem orientada a modelo para lidar com entradas de formulário. São construídos em torno de fluxos observáveis e fornecem acesso síncrono ao modelo de dados, tornando-os mais escaláveis e testáveis do que os template-driven forms.

## Classes Centrais

Reactive forms são construídos usando estas classes fundamentais de `@angular/forms`:

- `FormControl`: Gerencia o valor e a validade de uma entrada individual.
- `FormGroup`: Gerencia um grupo de controles (uma estrutura semelhante a um objeto).
- `FormArray`: Gerencia um array de controles indexado numericamente.
- `FormBuilder`: Um serviço que fornece métodos de fábrica para criar instâncias de controle.

## Configuração

Importe o `ReactiveFormsModule` no seu componente.

```ts
import {Component, inject} from '@angular/core';
import {ReactiveFormsModule, FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

@Component({
  selector: 'app-profile-editor',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-editor.component.html',
})
export class ProfileEditor {
  private fb = inject(FormBuilder);

  // Usando FormBuilder para uma definição concisa
  profileForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: [''],
    address: this.fb.group({
      street: [''],
      city: [''],
    }),
    aliases: this.fb.array([this.fb.control('')]),
  });

  onSubmit() {
    console.warn(this.profileForm.value);
  }
}
```

## Vinculação no Template

Use diretivas para vincular o modelo à view:

- `[formGroup]`: Vincula um `FormGroup` a um `<form>` ou `<div>`.
- `formControlName`: Vincula um controle nomeado dentro de um grupo a uma entrada.
- `formGroupName`: Vincula um `FormGroup` aninhado.
- `formArrayName`: Vincula um `FormArray` aninhado.
- `[formControl]`: Vincula um `FormControl` independente.

```html
<form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
  <input type="text" formControlName="firstName" />

  <div formGroupName="address">
    <input type="text" formControlName="street" />
  </div>

  <div formArrayName="aliases">
    @for (alias of aliases.controls; track $index) {
    <input type="text" [formControlName]="$index" />
    }
  </div>

  <button type="submit" [disabled]="!profileForm.valid">Submit</button>
</form>
```

## Acessando Controles

Use getters para acesso fácil aos controles, especialmente para `FormArray`.

```ts
get aliases() {
  return this.profileForm.get('aliases') as FormArray;
}

addAlias() {
  this.aliases.push(this.fb.control(''));
}
```

## Atualizando Valores

- `patchValue()`: Atualiza apenas as propriedades especificadas. Falha silenciosamente em incompatibilidades estruturais.
- `setValue()`: Substitui o modelo inteiro. Impõe rigorosamente a estrutura do formulário.

```ts
updateProfile() {
  this.profileForm.patchValue({
    firstName: 'Nancy',
    address: { street: '123 Drew Street' }
  });
}
```

## Eventos de Mudança Unificados

O Angular moderno (v18+) fornece um único observable `events` em todos os controles para rastrear eventos de valor, status, pristine, touched, reset e submit.

```ts
import {ValueChangeEvent, StatusChangeEvent} from '@angular/forms';

this.profileForm.events.subscribe((event) => {
  if (event instanceof ValueChangeEvent) {
    console.log('New value:', event.value);
  }
});
```

## Gerenciamento Manual de Estado

- `markAsTouched()` / `markAllAsTouched()`: Útil para exibir erros de validação no submit.
- `markAsDirty()` / `markAsPristine()`: Rastreia se o valor foi modificado.
- `updateValueAndValidity()`: Dispara manualmente o recálculo de valor e status.
- As opções `{ emitEvent: false }` ou `{ onlySelf: true }` podem ser passadas para a maioria dos métodos para controlar a propagação.
