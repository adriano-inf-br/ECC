# Estratégias de Carregamento de Rotas

O Angular oferece duas estratégias principais para carregar rotas e componentes, equilibrando o tempo de carregamento inicial e a responsividade da navegação.

## Carregamento Antecipado (Eager Loading)

Os componentes são agrupados no payload JavaScript inicial e ficam disponíveis imediatamente.

```ts
{ path: 'home', component: Home }
```

- **Prós**: transições sem interrupção.
- **Contras**: aumenta o tamanho do bundle inicial.

## Carregamento Tardio (Lazy Loading)

Componentes ou rotas são carregados apenas quando o usuário navega até eles. Isso cria "chunks" JavaScript separados.

### Carregamento Tardio de Componentes

Use `loadComponent` para buscar o componente sob demanda.

```ts
{
  path: 'admin',
  loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)`,
}
```

### Carregamento Tardio de Rotas Filhas

Use `loadChildren` para buscar um conjunto de rotas.

```ts
{
  path: 'settings',
  loadChildren: () => import('./settings/settings.routes'),
}
```

## Contexto de Injeção e Carregamento Tardio

As funções de carregamento (loaders) são executadas dentro do **contexto de injeção** da rota atual. Isso permite chamar `inject()` para tomar decisões de carregamento sensíveis ao contexto.

```ts
{
  path: 'dashboard',
  loadComponent: () => {
    const flags = inject(FeatureFlags);
    return flags.isPremium
      ? import('./premium-dashboard')
      : import('./basic-dashboard');
  },
}
```

## Recomendação

- Use **Carregamento Antecipado** para as páginas de aterrissagem principais.
- Use **Carregamento Tardio** para todas as outras áreas de funcionalidade, mantendo o bundle inicial pequeno.
