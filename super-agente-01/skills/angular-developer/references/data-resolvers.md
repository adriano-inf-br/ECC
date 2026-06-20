# Data Resolvers

Data resolvers buscam dados antes de uma rota ser ativada, garantindo que os componentes tenham os dados necessários ao renderizar.

## Criando um Resolver

Implemente o tipo `ResolveFn`.

```ts
export const userResolver: ResolveFn<User> = (route, state) => {
  const userService = inject(UserService);
  const id = route.paramMap.get('id')!;
  return userService.getUser(id);
};
```

## Configurando a Rota

Adicione o resolver sob a chave `resolve`.

```ts
{
  path: 'user/:id',
  component: UserProfile,
  resolve: {
    user: userResolver
  }
}
```

## Acessando os Dados Resolvidos

### 1. Via `ActivatedRoute` (Tradicional)

```ts
private route = inject(ActivatedRoute);
data = toSignal(this.route.data);
user = computed(() => this.data().user);
```

### 2. Via Inputs do Componente (Moderno)

Habilite `withComponentInputBinding()` em `provideRouter` para passar os dados resolvidos diretamente para `@Input` ou `input()`.

```ts
// app.config.ts
provideRouter(routes, withComponentInputBinding());

// component.ts
user = input.required<User>();
```

## Tratamento de Erros

A navegação é bloqueada se um resolver falhar.

- Use `withNavigationErrorHandler` para tratamento global.
- Use `catchError` dentro do resolver para retornar um `RedirectCommand` ou dados de fallback.

```ts
return userService
  .get(id)
  .pipe(catchError(() => of(new RedirectCommand(router.parseUrl('/error')))));
```

## Boas Práticas

- **Mantenha leve**: Busque apenas dados críticos.
- **Forneça feedback**: Escute os eventos do router para mostrar uma barra de carregamento global durante a navegação, já que a UI permanece na página antiga até o resolver terminar.
