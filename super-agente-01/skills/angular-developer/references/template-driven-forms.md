# Formulários Orientados a Template (Template-Driven Forms)

Formulários orientados a template usam vinculação de dados bidirecional (`[(ngModel)]`) para atualizar o modelo de dados no componente conforme as alterações são feitas no template e vice-versa. Eles são ideais para formulários simples e usam diretivas no template HTML para gerenciar o estado e a validação do formulário.

## Diretivas Centrais

Formulários orientados a template dependem do `FormsModule`, que fornece estas diretivas-chave:

- `NgModel`: reconcilia as mudanças de valor no elemento de formulário com o modelo de dados (`[(ngModel)]`).
- `NgForm`: cria automaticamente um `FormGroup` de nível superior vinculado à tag `<form>`.
- `NgModelGroup`: cria um `FormGroup` aninhado vinculado a um elemento do DOM.

## Configuração

Primeiro, importe o `FormsModule` no seu componente ou módulo.

```ts
import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-user-form',
  imports: [FormsModule],
  templateUrl: './user-form.component.html',
})
export class UserForm {
  user = {name: '', role: 'Guest'};

  onSubmit() {
    console.log('Form submitted!', this.user);
  }
}
```

## Construindo o Template do Formulário

### Vinculação Bidirecional com `[(ngModel)]`

Use `[(ngModel)]` nos elementos de entrada. **Todo elemento que usa `[(ngModel)]` DEVE ter um atributo `name`.** O Angular usa o atributo `name` para registrar o controle com o `NgForm` pai.

```html
<form #userForm="ngForm" (ngSubmit)="onSubmit()">
  <!-- Entrada básica -->
  <div>
    <label for="name">Name:</label>
    <input type="text" id="name" required [(ngModel)]="user.name" name="name" #nameCtrl="ngModel" />
  </div>

  <!-- Caixa de seleção -->
  <div>
    <label for="role">Role:</label>
    <select id="role" [(ngModel)]="user.role" name="role">
      <option value="Admin">Admin</option>
      <option value="Guest">Guest</option>
    </select>
  </div>

  <!-- Botão de submit (desabilitado se o formulário for inválido) -->
  <button type="submit" [disabled]="!userForm.form.valid">Submit</button>
</form>
```

## Estado do Formulário e do Controle

O Angular aplica automaticamente classes CSS aos controles e formulários com base em seu estado:

| Estado            | Classe se Verdadeiro              | Classe se Falso |
| :---------------- | :-------------------------------- | :-------------- |
| Visitado          | `ng-touched`                      | `ng-untouched`  |
| Valor Alterado    | `ng-dirty`                        | `ng-pristine`   |
| Valor é Válido    | `ng-valid`                        | `ng-invalid`    |
| Formulário Enviado| `ng-submitted` (apenas em `<form>`) | -             |

Você pode usar essas classes para fornecer feedback visual no seu CSS:

```css
.ng-valid[required],
.ng-valid.required {
  border-left: 5px solid #42a948; /* verde */
}
.ng-invalid:not(form) {
  border-left: 5px solid #a94442; /* vermelho */
}
```

## Validação e Mensagens de Erro

Para exibir mensagens de erro condicionalmente, exporte a diretiva `ngModel` para uma variável de referência de template (ex.: `#nameCtrl="ngModel"`).

```html
<input type="text" id="name" required [(ngModel)]="user.name" name="name" #nameCtrl="ngModel" />

<!-- Exibe o erro apenas se o controle for inválido E (tocado OU alterado) -->
@if (nameCtrl.invalid && (nameCtrl.dirty || nameCtrl.touched)) {
<div class="alert alert-danger">
  @if (nameCtrl.errors?.['required']) {
  <div>Name is required.</div>
  }
</div>
}
```

## Enviando o Formulário

1. Use o evento `(ngSubmit)` no elemento `<form>`.
2. Vincule o estado desabilitado do botão de submit à validade geral do formulário usando a variável de referência de template do `NgForm` (ex.: `[disabled]="!userForm.form.valid"`).

## Redefinindo o Formulário

Para redefinir programaticamente o formulário ao seu estado original (limpando valores e flags de validação), use o método `reset()` na instância do `NgForm`.

```html
<button type="button" (click)="userForm.reset()">Reset</button>
```
