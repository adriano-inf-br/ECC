# Signal Forms

Signal Forms são recomendados para novos formulários quando a versão alvo do Angular os suportar. Eles fornecem uma forma reativa, type-safe e orientada a modelo de gerenciar o estado do formulário usando Angular Signals.

Ao usar Signal Forms, não use `null` como valor ou tipo de nenhum campo.

## Imports

Você pode importar o seguinte de `@angular/forms/signals`:

```ts
import {
  form,
  FormField,
  submit,
  // Regras para o estado do campo
  disabled,
  hidden,
  readonly,
  debounce,
  // Helpers de schema
  applyWhen,
  applyEach,
  schema,
  // Validação personalizada
  validate,
  validateHttp,
  validateStandardSchema,
  // Metadados
  metadata,
} from '@angular/forms/signals';
```

## Criando um Formulário

Use a função `form()` com um modelo Signal. A estrutura do formulário é derivada diretamente do modelo.

```ts
import {Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';

@Component({
  // ...
  imports: [FormField],
})
export class Example {
  // 1. Defina seu modelo com valores iniciais (evite undefined)
  userModel = signal({
    name: '', // CRÍTICO: NUNCA use null ou undefined como valores iniciais
    email: '',
    age: 0, // Use 0 para números, NÃO null
    address: {
      street: '',
      city: '',
    },
    hobbies: [] as string[], // Use [] para arrays, NÃO null
  });

  // ERRADO - NÃO FAÇA ISTO:
  // badModel = signal({
  //   name: null,      // ERRO: use '' em vez disso
  //   age: null,       // ERRO: use 0 em vez disso
  //   items: null      // ERRO: use [] em vez disso
  // });

  // 2. Crie o formulário
  userForm = form(this.userModel);
}
```

## Validação

Importe os validadores de `@angular/forms/signals`.

```ts
import {required, email, min, max, minLength, maxLength, pattern} from '@angular/forms/signals';
```

Use-os na função de schema passada para `form()`:

```ts
userForm = form(this.userModel, (schemaPath) => {
  // Required
  required(schemaPath.name, {message: 'Name is required'});

  // Required condicional.
  required(schemaPath.name, {
    when({valueOf}) {
      return valueOf(schemaPath.age) > 10;
    },
  });
  // when só está disponível para required
  // NÃO faça isto: pattern(p.name, /xxx/, {when /* ERRO */)

  // Email
  email(schemaPath.email, {message: 'Invalid email'});

  // Min/Max para números
  min(schemaPath.age, 18);
  max(schemaPath.age, 100);

  // MinLength/MaxLength para strings/arrays
  minLength(schemaPath.password, 8);
  maxLength(schemaPath.description, 500);

  // Pattern (Regex)
  pattern(schemaPath.zipCode, /^\d{5}$/);
});
```

## FieldState vs FormField: O Requisito Parental

É importante entender a diferença entre **FormField** (a estrutura) e **FieldState** (os dados/signals reais).

**REGRA**: Você deve **CHAMAR** um campo como uma função para acessar seus signals de estado (valid, touched, dirty, hidden, etc.).

```ts
// f é um FormField (estrutural)
const f = form(signal({cat: {name: 'pirojok-the-cat', age: 5}}));

f.cat.name; // FormField: Você não pode obter flags daqui!
f.cat.name.touched(); // ERRO: touched() não existe em FormField

f.cat.name(); // FieldState: Chamá-lo dá acesso aos signals
f.cat.name().touched(); // VÁLIDO: Acessando o signal
f.cat().name.touched(); // ERRO: f.cat() é estado, ele não tem filhos!
```

De forma semelhante em um template:

```html
<!-- ERRADO: A propriedade 'hidden' não existe no tipo 'FormField' -->
@if (bookingForm.hotelDetails.hidden()) { ... }

<!-- CERTO: Chame-o primeiro -->
@if (bookingForm.hotelDetails().hidden()) { ... }
```

## Disabled / Readonly / Hidden

Controle o status do campo usando regras no schema.

```ts
import {disabled, readonly, hidden} from '@angular/forms/signals';

userForm = form(this.userModel, (schemaPath) => {
  // Desabilitado condicionalmente
  disabled(schemaPath.password, ({valueOf}) => !valueOf(schemaPath.createAccount));

  // Oculto condicionalmente (NÃO remove do modelo, apenas marca como hidden)
  hidden(schemaPath.shippingAddress, ({valueOf}) => valueOf(schemaPath.sameAsBilling));

  // Readonly
  readonly(schemaPath.username);
});
```

## Vinculação (Binding)

Importe `FormField` e use a diretiva `[formField]`.

```ts
import {FormField} from '@angular/forms/signals';
```

Todas as props do estado, como `disabled`, `hidden`, `readonly` e `name`, são vinculadas automaticamente.
_NÃO_ vincule o campo `name`.

**CRÍTICO: ATRIBUTOS PROIBIDOS**
Ao usar `[formField]`, você NÃO DEVE definir os seguintes atributos no template (estáticos ou vinculados):

- `min`, `max` (Use validadores no schema em vez disso)
- `value`, `[value]`, `[attr.value]` (Já tratados por `[formField]`)
- `[attr.min]`, `[attr.max]`
- `[disabled]`, `[readonly]` (Já tratados por `[formField]`)

NÃO faça isto: `<input min="1" [formField]>` ou `<input [value]="val" [formField]>`.

```html
<!-- Input -->
<input [formField]="userForm.name" />

<!-- Checkbox -->
<input type="checkbox" [formField]="userForm.isAdmin" />

<!-- Select -->
<select [formField]="userForm.country">
  <option value="us">US</option>
</select>

<!-- userForm.name NÃO pode ser nullable, porque input não aceita null-->
<input [formField]="userForm.name" />
```

## Reactive Forms

**NÃO importe** `FormControl`, `FormGroup`, `FormArray` ou `FormBuilder` de `@angular/forms`. Os Signal Forms substituem esses conceitos por completo.
Os signal forms NÃO têm um builder.

## Acessando o Estado

Cada campo no formulário é uma função que retorna seu estado.

```ts
// Acesse o campo chamando-o
const emailState = this.userForm.email();

// Value (WritableSignal)
const value = this.userForm().value();

// Estado de Validação (Signals)
const isValid = this.userForm().valid();
const isInvalid = this.userForm().invalid();
const errors = this.userForm().errors(); // Array de erros
const isPending = this.userForm().pending(); // Validação assíncrona pendente

// Estado de Interação (Signals)
const isTouched = this.userForm().touched();
const isDirty = this.userForm().dirty();

// Estado de Disponibilidade (Signals)
const isDisabled = this.userForm().disabled();
const isHidden = this.userForm().hidden();
const isReadonly = this.userForm().readonly();
```

IMPORTANTE!: Certifique-se de chamar o campo para obter seu estado.

```ts
form().invalid()
form.field().dirty()
form.field.subfield().touched()
form.a.b.c.d().value()
form.address.ssn().pending()
form().reset()

// A única exceção é length:
form.children.length
form.length // NOTA: sem parênteses!
form.client.addresses.length  // Sem "()"

@for (income of form.addresses; track $index) {/**/}
```

## Submetendo

Use a função `submit()`. Ela marca automaticamente todos os campos como touched antes de executar a ação.

**CRÍTICO**: O callback de `submit()` DEVE ser `async` e DEVE retornar uma Promise.

```ts
import { submit } from '@angular/forms/signals';

// CORRETO - callback async
onSubmit() {
  submit(this.userForm, async () => {
    // Isto só executa se o formulário for válido
    await this.apiService.save(this.userModel());
    console.log('Saved!');
  });
}

// ERRADO - palavra-chave async ausente
onSubmit() {
  submit(this.userForm, () => {  // ERRO: deve ser async
    console.log('Saved!');
  });
}
```

## Lidando com Erros

`field().errors()` retorna o array de erros do tipo ValidationError:

```ts
interface ValidationError {
  readonly kind: string;
  readonly message?: string;
}
```

_NÃO_ retorne null dos validadores.
Quando não houver erros, retorne undefined

### Contexto

Funções passadas para regras como `validate()`, `disabled()`, `applyWhen` recebem um objeto de contexto. É **CRÍTICO** entender sua estrutura:

```ts
validate(
  schemaPath.username,
  ({
    value, // Signal<T>: Valor atual gravável do campo
    fieldTree, // FieldTree<T>: Subcampos (se for um grupo/array)
    state, // FieldState<T>: Acessa flags como state.valid(), state.dirty()
    valueOf, // (path) => T: Lê valores de OUTROS campos (rastreando dependências), ex. valueOf(schemaPath.password)
    stateOf, // (path) => FieldState: Acessa o estado (valid/dirty) de OUTROS campos, ex. stateOf(schemaPath.password).valid()
    pathKeys, // Signal<string[]>: Caminho da raiz até este campo
  }) => {
    // ERRADO: if (touched()) ... (touched não está no contexto)
    // CERTO: if (state.touched()) ...

    if (value() === 'admin') {
      return {kind: 'reserved', message: 'Username admin is reserved'};
    }
  },
);
```

### IMPORTANTE: Paths NÃO são Signals

Dentro do callback de `form()`, `schemaPath` e seus filhos (por exemplo, `schemaPath.user.name`) **NÃO** são signals e **NÃO** são chamáveis.

```ts
// ERRADO - Isto lançará um erro:
applyWhen(p.ssn, () => p.ssn().touched(), (ssnField) => { ... });

// CERTO - Use stateOf() para obter o estado de um path:
applyWhen(p.ssn, ({ stateOf }) => stateOf(p.ssn).touched(), (ssnField) => { ... });

// CERTO - Use valueOf() para obter o valor de um path:
applyWhen(p.ssn, ({ valueOf }) => valueOf(p.ssn) !== '', (ssnField) => { ... });
```

### Múltiplos Itens

- Use `applyEach` para aplicar regras por item.
- **CRÍTICO**: O callback de `applyEach` recebe APENAS UM argumento (o path do item), NÃO dois:

```ts
// CORRETO - argumento único
applyEach(s.items, (item) => {
  required(item.name);
});

// ERRADO - NÃO passe o índice
applyEach(s.items, (item, index) => {
  // ERRO: o callback recebe 1 argumento
  required(item.name);
});
```

- No template, use `@for` para iterar sobre os itens.
- Para remover um item de um array, basta remover o item apropriado do array nos dados.
- **Vinculação de `select`**: Você PODE vincular a `<select [formField]="form.country">`. Garanta que as options tenham atributos `value`.

### Loops @for Aninhados

**CRÍTICO**: O Angular NÃO tem `$parent`. Em loops aninhados, armazene o índice externo em uma variável:

```html
<!-- ERRADO - $parent não existe -->
@for (item of form.items; track $index) { @for (option of item.options; track $index) {
<button (click)="removeOption($parent.$index, $index)">Remove</button>
<!-- ERRO -->
} }

<!-- CORRETO - use let para armazenar o índice externo -->
@for (item of form.items; track $index; let outerIndex = $index) { @for (option of item.options;
track $index) {
<button (click)="removeOption(outerIndex, $index)">Remove</button>
} }
```

### Desabilitando o Botão do Formulário

```html
<button [disabled]="form().invalid() || form().pending()" />
<!-- Ou -->
<button [disabled]="taxForm.invalid()" />
```

NÃO use `[disabled]` em um input. O `[formField]` fará isso.
NÃO use `[readonly]` em um input. O `[formField]` fará isso.
Se precisar desabilitar ou tornar readonly um campo, use as regras `disabled()` ou `readonly()` no schema.

### Validação Assíncrona

Não use `validate()` para validação assíncrona; em vez disso, use `validateAsync()`:

**CRÍTICO**:

1. A opção `params` DEVE ser uma função que retorna o valor a ser validado.
2. O handler `onError` é **OBRIGATÓRIO** - ele NÃO é opcional!

```ts
import {resource} from '@angular/core';
import {validateAsync} from '@angular/forms/signals';

userForm = form(this.userModel, (s) => {
  validateAsync(s.username, {
    // 1. DEVE ser uma função - params recebe o contexto e retorna o valor
    params: ({value}) => value(),

    // 2. Crie o resource - a factory recebe um Signal
    factory: (username) =>
      resource({
        params: username, // Use 'params' em resource()
        loader: async ({params: value}) => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return value === 'taken';
        },
      }),

    // 3. Mapeie o sucesso para erros
    onSuccess: (isTaken) =>
      isTaken ? {kind: 'taken', message: 'Username is already taken'} : undefined,

    // 4. Trate os erros - ISTO É OBRIGATÓRIO!
    onError: () => ({kind: 'error', message: 'Validation failed'}),
  });
});
```

**Exemplos ERRADOS:**

```ts
// ERRADO - params deve ser uma função
validateAsync(s.username, {
  params: s.username, // ERRO: deve ser ({ value }) => value()
  // ...
});

// ERRADO - onError ausente (é obrigatório!)
validateAsync(s.username, {
  params: ({value}) => value(),
  factory: (username) =>
    resource({
      /* ... */
    }),
  onSuccess: (result) => (result ? {kind: 'error'} : undefined),
  // ERRO: 'onError' está ausente, mas é obrigatório!
});
```

### Usando Resource

**CRÍTICO**: No `resource()` do Angular, use `params` para o signal de entrada.

```ts
// CORRETO
resource({
  params: mySignal,
  loader: async ({params: value}) => {
    /* ... */
  },
});

// ERRADO
resource({
  request: mySignal, // ERRO: deveria ser 'params'
  loader: async ({request}) => {
    /* ... */
  },
});
```

Use `debounce()` para atrasar a sincronização entre a UI e o modelo.

```ts
import {debounce} from '@angular/forms/signals';

userForm = form(this.userModel, (s) => {
  // Atrasa as atualizações do modelo em 300ms
  debounce(s.username, 300);
});
```

### Validação Condicional

```ts
form(
  data,
  (path) => {
    applyWhen(
      name,
      ({value}) => value() !== 'admin',
      (namePath) => {
        validate(namePath.last /* ... */);
        disable(namePath.last /* ... */);
      },
    );
  },
  {injector: TestBed.inject(Injector)},
);
```

O `applyWhen` passa o path mapeado para o primeiro argumento.
Se você precisar do campo pai, basta passá-lo para o `applyWhen`:

```ts
form(
  data,
  (path) => {
    applyWhen(
      cat,
      ({value}) => value().name !== 'admin',
      (catPath) => {
        require(cat.catPath /* ... */);
      },
    );
  },
  {injector: TestBed.inject(Injector)},
);
```

## Armadilhas Comuns (NÃO FAÇA ESTAS)

| Cenário de Erro        | ERRADO (Erro Comum)                           | CERTO (Forma Correta)                                       |
| :--------------------- | :-------------------------------------------- | :---------------------------------------------------------- |
| **Acessando Flags**    | `form.field.valid()`                          | `form.field().valid()`                                      |
| **Acessando value**    | `form.field.value()`                          | `form.field().value()`                                      |
| **Definindo value**    | `form.field.set(x)`                           | Atualize o signal do modelo: `this.model.update(...)`       |
| **Flags da raiz do form** | `form.invalid()`                           | `form().invalid()`                                          |
| **Chamada dupla**      | `form.field()()`                              | `form.field().value()`                                      |
| **Contexto de Regras** | `({ touched }) => touched()`                  | `({ state }) => state.touched()`                            |
| **Chamando Paths**     | `applyWhen(p.foo, () => p.foo() === 'x')`     | `applyWhen(p.foo, ({ valueOf }) => valueOf(p.foo) === 'x')` |
| **args de applyWhen**  | `applyWhen(condition, () => {...})`           | `applyWhen(path, condition, schemaFn)` - precisa de 3 args  |
| **Length de array**    | `form.items().length`                         | `form.items.length` (estrutural)                            |
| **Array multi-select** | `<select [formField]="form.tags">` (string[]) | Use checkboxes para campos de array                         |
| **atributo readonly**  | `<input readonly [formField]>`                | Use a regra `readonly()` no schema                          |
| **atributos min/max**  | `<input min="1" max="10">`                    | Use as regras `min()` e `max()` no schema                   |
| **vinculação de value** | `<input [value]="val">`                      | NÃO use `[value]` com `[formField]`                         |
| **opção when**         | `pattern(p.x, /.../, {when: ...})`            | `when` só funciona com `required()`                         |
| **callback de Submit** | `submit(form, () => { ... })`                 | `submit(form, async () => { ... })`                         |
| **params async**       | `params: s.field`                             | `params: ({ value }) => value()`                            |
| **onError async**      | Omitir `onError`                              | `onError` é OBRIGATÓRIO em `validateAsync`                  |
| **API resource()**     | `request: signal`                             | `params: signal`                                            |
| **args de applyEach**  | `applyEach(s.items, (item, index) => ...)`    | `applyEach(s.items, (item) => ...)`                         |
| **@for aninhado**      | `$parent.$index`                              | Use `let outerIndex = $index`                               |
| **import de FormState** | `import { FormState }`                       | `FormState` não existe, use `FieldState`                    |
| **Null no modelo**     | `signal({ name: null })`                      | `signal({ name: '' })` ou `signal({ age: 0 })`              |
| **Sintaxe de Validate** | `validate(s.field, { value } => ...)`        | `validate(s.field, ({ value }) => ...)`                     |
| **Array de Checkbox**  | `[formField]="form.tags"` (string[])          | Checkboxes vinculam SOMENTE a `boolean`                     |

## Exemplo de Formulário Grande

### `src/app/app.ts`

```ts
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  form,
  FormField,
  submit,
  required,
  email,
  min,
  hidden,
  applyEach,
  validate,
} from '@angular/forms/signals';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormField],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  model = signal({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      age: 0,
    },
    tripDetails: {
      destination: 'Mars',
      launchDate: '',
    },
    package: {
      tier: 'economy',
      extras: [] as string[],
    },
    companions: [] as Array<{name: string; relation: string}>,
  });

  bookingForm = form(this.model, (s) => {
    required(s.personalInfo.firstName, {message: 'First name is required'});
    required(s.personalInfo.lastName, {message: 'Last name is required'});
    required(s.personalInfo.email, {message: 'Email is required'});
    email(s.personalInfo.email, {message: 'Invalid email address'});
    required(s.personalInfo.age, {message: 'Age is required'});
    min(s.personalInfo.age, 18, {message: 'Must be at least 18'});

    required(s.tripDetails.destination);
    required(s.tripDetails.launchDate);
    validate(s.tripDetails.launchDate, ({value}) => {
      const date = new Date(value());
      if (isNaN(date.getTime())) return undefined;
      const today = new Date();
      if (date < today) {
        return {kind: 'pastData', message: 'Launch date must be in the future'};
      }
      return undefined;
    });

    // valueOf é usado para acessar valores de outros campos nas regras
    hidden(s.package.extras, ({valueOf}) => valueOf(s.package.tier) === 'economy');

    applyEach(s.companions, (companion) => {
      required(companion.name, {message: 'Companion name required'});
      required(companion.relation, {message: 'Relation required'});
    });
  });

  addCompanion() {
    this.model.update((m) => ({
      ...m,
      companions: [...m.companions, {name: '', relation: ''}],
    }));
  }

  removeCompanion(index: number) {
    this.model.update((m) => ({
      ...m,
      companions: m.companions.filter((_, i) => i !== index),
    }));
  }

  onSubmit() {
    // CRÍTICO: o callback de submit DEVE ser async
    submit(this.bookingForm, async () => {
      console.log('Booking Confirmed:', this.model());
      // Se precisar fazer trabalho assíncrono:
      // await this.apiService.save(this.model());
    });
  }
}
```

### `src/app/app.html`

```html
<form (submit)="onSubmit(); $event.preventDefault()">
  <h1>Interstellar Booking</h1>

  <section>
    <h2>Personal Info</h2>

    <label>
      First Name
      <input [formField]="bookingForm.personalInfo.firstName" />
      @if (bookingForm.personalInfo.firstName().touched() &&
      bookingForm.personalInfo.firstName().errors().length) {
      <span>{{ bookingForm.personalInfo.firstName().errors()[0].message }}</span>
      }
    </label>

    <label>
      Last Name
      <input [formField]="bookingForm.personalInfo.lastName" />
      @if (bookingForm.personalInfo.lastName().touched() &&
      bookingForm.personalInfo.lastName().errors().length) {
      <span>{{ bookingForm.personalInfo.lastName().errors()[0].message }}</span>
      }
    </label>

    <label>
      Email
      <input type="email" [formField]="bookingForm.personalInfo.email" />
      @if (bookingForm.personalInfo.email().touched() &&
      bookingForm.personalInfo.email().errors().length) {
      <span>{{ bookingForm.personalInfo.email().errors()[0].message }}</span>
      }
    </label>

    <label>
      Age
      <input type="number" [formField]="bookingForm.personalInfo.age" />
      @if (bookingForm.personalInfo.age().touched() &&
      bookingForm.personalInfo.age().errors().length) {
      <span>{{ bookingForm.personalInfo.age().errors()[0].message }}</span>
      }
    </label>
  </section>

  <section>
    <h2>Trip Details</h2>

    <label>
      Destination
      <select [formField]="bookingForm.tripDetails.destination">
        <option value="Mars">Mars</option>
        <option value="Moon">Moon</option>
        <option value="Titan">Titan</option>
      </select>
    </label>

    <label>
      Launch Date
      <input type="date" [formField]="bookingForm.tripDetails.launchDate" />
      @if (bookingForm.tripDetails.launchDate().touched() &&
      bookingForm.tripDetails.launchDate().errors().length) {
      <span>{{ bookingForm.tripDetails.launchDate().errors()[0].message }}</span>
      }
    </label>
  </section>

  <section>
    <h2>Package</h2>

    <label>
      <input type="radio" value="economy" [formField]="bookingForm.package.tier" />
      Economy
    </label>
    <label>
      <input type="radio" value="business" [formField]="bookingForm.package.tier" />
      Business
    </label>
    <label>
      <input type="radio" value="first" [formField]="bookingForm.package.tier" />
      First Class
    </label>

    @if (!bookingForm.package.extras().hidden()) {
    <div>
      <h3>Extras</h3>
      <!-- Multi-select para arrays deve usar select multiple -->
      <select multiple [formField]="bookingForm.package.extras">
        <option value="wifi">WiFi</option>
        <option value="gym">Gym</option>
      </select>
    </div>
    }
  </section>

  <section>
    <h2>Companions</h2>
    <button type="button" (click)="addCompanion()">Add Companion</button>

    @for (companion of bookingForm.companions; track $index) {
    <div>
      <input [formField]="companion.name" placeholder="Name" />
      @if (companion.name().touched() && companion.name().errors().length) {
      <span>{{ companion.name().errors()[0].message }}</span>
      }

      <input [formField]="companion.relation" placeholder="Relation" />
      @if (companion.relation().touched() && companion.relation().errors().length) {
      <span>{{ companion.relation().errors()[0].message }}</span>
      }

      <button type="button" (click)="removeCompanion($index)">Remove</button>
    </div>
    }
  </section>

  <button [disabled]="bookingForm().invalid()">Submit</button>
</form>
```

## Recuperando-se de Erros de Build

Se você encontrar erros de build, aqui estão as correções mais comuns:

### `Property 'value' does not exist on type 'FieldTree'`

**Problema**: Acessar `.value()` diretamente em um campo sem chamá-lo primeiro.

```ts
// ERRADO
const val = this.form.field.value();
// CERTO
const val = this.form.field().value();
```

### `Property 'set' does not exist on type 'FieldTree'`

**Problema**: Tentar definir valores na árvore do formulário. Os Signal Forms são orientados a modelo.

```ts
// ERRADO
this.form.address.street.set('Main St');
// CERTO - atualize o signal do modelo em vez disso
this.model.update((m) => ({...m, address: {...m.address, street: 'Main St'}}));
```

### `Type 'string[]' is not assignable to type 'string'`

**Problema**: Vincular `[formField]` a um campo de array com um `<select>` de valor único.

```html
<!-- ERRADO - assignees é string[], select espera string -->
<select [formField]="form.assignees">
  ...
</select>

<!-- CERTO - Use select multiple para campos de array -->
<select multiple [formField]="form.assignees">
  <option value="us">US</option>
</select>
```
