---
paths:
  - "**/*.component.ts"
  - "**/*.component.html"
  - "**/*.service.ts"
  - "**/*.directive.ts"
  - "**/*.pipe.ts"
  - "**/*.guard.ts"
  - "**/*.resolver.ts"
  - "**/*.module.ts"
---
# Estilo de Código Angular

> This file extends [common/coding-style.md](../common/coding-style.md) with Angular specific content.

## Consciência de Versão

Sempre verifique a versão do Angular do projeto antes de escrever código — os recursos diferem significativamente entre versões. Execute `ng version` ou inspecione o `package.json`. Ao criar um novo projeto, não fixe uma versão a menos que o usuário especifique uma.

Após gerar ou modificar código Angular, sempre execute `ng build` para capturar erros antes de finalizar.

## Nomenclatura de Arquivos

Siga as convenções da CLI do Angular — um artefato por arquivo:

- `user-profile.component.ts` + `user-profile.component.html` + `user-profile.component.spec.ts`
- `user.service.ts`, `auth.guard.ts`, `date-format.pipe.ts`
- Pastas de feature: `features/users/`, `features/auth/`
- Gere com a CLI: `ng generate component features/users/user-card`

## Componentes

Prefira componentes standalone (padrão a partir da v17). Use detecção de mudanças `OnPush` em todos os novos componentes.

```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './user-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCardComponent {
  user = input.required<User>();
  select = output<string>();
}
```

## Injeção de Dependência

Use `inject()` em vez de injeção via construtor. Mantenha os construtores vazios ou remova-os por completo.

```typescript
// CORRETO
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private router = inject(Router);
}

// ERRADO: Injeção via construtor é verbosa e mais difícil de fazer tree-shaking
constructor(private http: HttpClient, private router: Router) {}
```

Use `InjectionToken` para dependências que não são classes:

```typescript
const API_URL = new InjectionToken<string>('API_URL');

// Forneça:
{ provide: API_URL, useValue: 'https://api.example.com' }

// Consuma:
private apiUrl = inject(API_URL);
```

## Signals

### Primitivas Centrais

```typescript
count = signal(0);
doubled = computed(() => this.count() * 2);

increment() {
  this.count.update(n => n + 1);
}
```

### `linkedSignal` — Estado Derivado Gravável

Use `linkedSignal` quando um signal deve ser resetado ou adaptado quando uma fonte muda, mas também ser gravável de forma independente:

```typescript
selectedOption = linkedSignal(() => this.options()[0]);
// Reseta para a primeira opção quando options muda, mas o usuário pode sobrescrever
```

### `resource` — Dados Assíncronos em Signals

Use `resource()` para buscar dados assíncronos de forma reativa sem subscriptions manuais:

```typescript
userResource = resource({
  request: () => ({ id: this.userId() }),
  loader: ({ request }) => fetch(`/api/users/${request.id}`).then(r => r.json()),
});

// Acesso: userResource.value(), userResource.isLoading(), userResource.error()
```

### Uso de `effect`

Use `effect()` apenas para efeitos colaterais que devem reagir a mudanças de signal (logging, manipulação de DOM de terceiros). Nunca use effects para sincronizar signals — use `computed` ou `linkedSignal` em vez disso. Para trabalho de DOM após a renderização, use `afterRenderEffect`.

```typescript
// CORRETO: Efeito colateral
effect(() => console.log('User changed:', this.user()));

// ERRADO: Use computed em vez disso
effect(() => { this.fullName.set(`${this.first()} ${this.last()}`); });
```

## Templates

Use a sintaxe de blocos da v17+. Sempre forneça `track` em `@for`:

```html
@for (item of items(); track item.id) {
  <app-item [item]="item" />
}

@if (isLoading()) {
  <app-spinner />
} @else if (error()) {
  <app-error [message]="error()" />
} @else {
  <app-content [data]="data()" />
}
```

Nenhuma lógica em templates além de condicionais simples — mova para métodos do componente ou pipes.

## Formulários

Escolha a estratégia de formulário que corresponda à abordagem existente do projeto:

- **Signal Forms** (v21+): Preferido para novos projetos na v21+. Estado de formulário baseado em signals.
- **Reactive Forms**: `FormBuilder` + `FormGroup` + `FormControl`. Melhor para formulários complexos com validação dinâmica.
- **Template-Driven Forms**: `ngModel`. Adequado apenas para formulários simples.

```typescript
// Reactive Forms — abordagem padrão para a maioria dos apps
export class LoginComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit() {
    if (this.form.valid) {
      // use this.form.value
    }
  }
}
```

## Estilos de Componentes

Use estilos em nível de componente com `ViewEncapsulation.Emulated` (padrão). Evite `ViewEncapsulation.None` a menos que esteja construindo um design system que intencionalmente vaza estilos.

- Escope os estilos ao componente — não use nomes de classe globais dentro das folhas de estilo do componente
- Use `:host` para estilização do elemento host
- Prefira CSS custom properties para valores tematizáveis

## Detecção de Mudanças

- Use por padrão `ChangeDetectionStrategy.OnPush` em todos os novos componentes
- Signals e o pipe `async` lidam com a detecção automaticamente — evite `markForCheck()` e `detectChanges()`
- Nunca mute objetos `@Input()` no lugar ao usar OnPush
