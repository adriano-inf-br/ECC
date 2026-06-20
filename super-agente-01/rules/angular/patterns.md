---
paths:
  - "**/*.component.ts"
  - "**/*.component.html"
  - "**/*.service.ts"
  - "**/*.store.ts"
  - "**/*.routes.ts"
---
# Padrões do Angular

> This file extends [common/patterns.md](../common/patterns.md) with Angular specific content.

## Divisão Smart / Dumb Component

Componentes smart (container) controlam a busca de dados e o estado. Componentes dumb (de apresentação) recebem inputs e emitem outputs apenas — sem injeção de serviço.

```typescript
// Smart — controla os dados
@Component({ standalone: true, changeDetection: ChangeDetectionStrategy.OnPush })
export class UserPageComponent {
  private userService = inject(UserService);
  user = toSignal(this.userService.getUser(this.userId));
}
```

```html
<!-- Dumb — apresentação pura -->
<app-user-card [user]="user()" (select)="onSelect($event)" />
```

## Camada de Serviço

Os serviços controlam todo o acesso a dados e a lógica de negócio. Os componentes delegam — sem `HttpClient` em componentes.

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}
```

## Dados Assíncronos com `resource`

Use `resource()` para busca assíncrona reativa. Prefira em vez de pipelines RxJS manuais para carregamento simples de dados:

```typescript
export class UserDetailComponent {
  userId = input.required<string>();

  userResource = resource({
    request: () => ({ id: this.userId() }),
    loader: ({ request }) =>
      firstValueFrom(inject(UserService).getUser(request.id)),
  });
}
```

Acesse o estado: `userResource.value()`, `userResource.isLoading()`, `userResource.error()`, `userResource.reload()`.

## Padrões de Estado com Signals

```typescript
// Estado mutável local
count = signal(0);

// Derivado (nunca duplicado)
doubled = computed(() => this.count() * 2);

// Estado derivado gravável que reseta com a fonte
selectedItem = linkedSignal(() => this.items()[0]);

// Faz a ponte de Observable para signal
users = toSignal(this.userService.getUsers(), { initialValue: [] });
```

Nunca armazene valores derivados em signals separados — use `computed`. Nunca use `effect` para sincronizar signals — use `computed` ou `linkedSignal`.

## Limpeza de Subscriptions

Use `takeUntilDestroyed()` para todas as subscriptions manuais. Nunca use `ngOnDestroy` + `Subject` + `takeUntil` manuais em código novo.

```typescript
export class UserComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.userService.updates$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(update => this.handleUpdate(update));
  }
}
```

## Roteamento

### Definição de Rota

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'admin',
    canMatch: [authGuard],           // CanMatch impede o carregamento do chunk por completo
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'users/:id',
    resolve: { user: userResolver },
    component: UserDetailComponent,
  },
];
```

- Use `canMatch` em vez de `canActivate` quando o módulo da rota não deve carregar para usuários não autorizados
- Faça lazy-load de todos os módulos de feature com `loadChildren`
- Pré-busque dados com `resolve` para evitar estados de carregamento nos componentes

### Guards Funcionais

```typescript
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isAuthenticated()
    ? true
    : inject(Router).createUrlTree(['/login']);
};
```

### Resolvers de Dados

```typescript
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.paramMap.get('id')!);
};
```

### View Transitions

Habilite transições suaves de rota com a View Transitions API:

```typescript
// app.config.ts
provideRouter(routes, withViewTransitions())
```

## Padrões de Injeção de Dependência

### Providers com Escopo

Forneça serviços em nível de componente ou de rota quando eles não devem ser singletons:

```typescript
@Component({
  providers: [UserEditService],   // com escopo nesta subárvore de componentes
})
export class UserEditComponent {}
```

### `InjectionToken`

```typescript
export const CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');

// Em providers:
{ provide: CONFIG, useValue: appConfig }
{ provide: CONFIG, useFactory: () => loadConfig(), deps: [] }

// Consuma:
private config = inject(CONFIG);
```

### `viewProviders` vs `providers`

- `providers`: Disponível para o componente e todos os seus content children
- `viewProviders`: Disponível apenas para a própria view do componente (não para conteúdo projetado)

## HTTP Interceptors

Use interceptors funcionais (v15+) para autenticação, tratamento de erros e retentativas:

```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (!token) return next(req);
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
```

Registre em `app.config.ts`:

```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]))
```

## Operadores RxJS

- `switchMap` — busca, navegação (cancela o anterior)
- `mergeMap` — requisições paralelas independentes
- `exhaustMap` — envios de formulário (ignora até concluir)
- Sempre trate erros com `catchError` — nunca deixe streams morrerem silenciosamente

```typescript
search$ = this.query$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(q => this.service.search(q).pipe(catchError(() => of([])))),
);
```

## Formulários

Corresponda à estratégia de formulário existente do projeto. Para novos apps v21+, prefira signal forms.

```typescript
// Reactive Forms — padrão para formulários complexos
export class UserFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
}
```

## Estratégias de Renderização

- **CSR** (padrão): SPA padrão
- **SSR + Hydration**: `ng add @angular/ssr` — melhora o FCP e o SEO
- **SSG (Prerendering)**: Páginas estáticas em tempo de build para rotas com muito conteúdo

Ao usar SSR, evite `window`, `document`, `localStorage` diretamente — use `isPlatformBrowser` ou o token `DOCUMENT`.

## Acessibilidade

Use o Angular CDK para componentes headless e acessíveis (Accordion, Listbox, Combobox, Menu, Tabs, Toolbar, Tree, Grid). Estilize atributos ARIA em vez de gerenciá-los manualmente:

```css
[aria-selected="true"] { background: var(--color-selected); }
```

## Referência de Skill

Veja a skill: `angular-developer` para orientação aprofundada sobre signals, formulários, roteamento, DI, SSR e padrões de acessibilidade.
