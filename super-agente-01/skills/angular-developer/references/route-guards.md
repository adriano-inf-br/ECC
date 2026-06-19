# Route Guards

Route guards controlam se um usuário pode navegar para uma rota ou sair dela.

## Tipos de Guards

- **`CanActivate`**: O usuário pode acessar esta rota? (por exemplo, verificação de autenticação).
- **`CanActivateChild`**: O usuário pode acessar os filhos desta rota?
- **`CanDeactivate`**: O usuário pode sair desta rota? (por exemplo, alterações não salvas).
- **`CanMatch`**: Esta rota deve sequer ser considerada para correspondência? (por exemplo, feature flags). Se retornar `false`, o router continua verificando outras rotas.

## Criando um Guard

Os guards são tipicamente funcionais desde o Angular 15.

```ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirecionar para o login
  return router.parseUrl('/login');
};
```

## Aplicando Guards

Adicione-os à configuração da rota como um array. Eles executam em ordem.

```ts
{
  path: 'admin',
  component: Admin,
  canActivate: [authGuard],
  canActivateChild: [adminChildGuard],
  canDeactivate: [unsavedChangesGuard]
}
```

## Valores de Retorno

- `boolean`: `true` para permitir, `false` para bloquear.
- `UrlTree` ou `RedirectCommand`: Redireciona para uma rota diferente.
- `Observable` ou `Promise`: Resolve para os tipos acima.

## Nota de Segurança

**Guards do lado do cliente NÃO substituem a segurança do lado do servidor.** Sempre verifique as permissões no servidor.
