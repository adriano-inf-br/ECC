# Definir Rotas

Rotas são objetos que definem qual componente deve renderizar para um caminho de URL específico.

## Configuração Básica

Defina as rotas em um array `Routes` e forneça-as usando `provideRouter` no seu `appConfig`.

```ts
// app.routes.ts
export const routes: Routes = [
  {path: '', component: HomePage},
  {path: 'admin', component: AdminPage},
];

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
```

## Caminhos de URL

- **Estático**: Corresponde a uma string exata (ex.: `'admin'`).
- **Parâmetros de Rota**: Segmentos dinâmicos prefixados com dois-pontos (ex.: `'user/:id'`).
- **Wildcard**: Corresponde a qualquer URL usando `**`. Útil para páginas "Não Encontrado". **Sempre coloque no final do array.**

## Estratégia de Correspondência

O Angular usa uma estratégia de **primeira correspondência vence**. Rotas específicas devem vir antes das menos específicas.

## Redirecionamentos

Use `redirectTo` para apontar um caminho para outro.

```ts
{ path: 'articles', redirectTo: '/blog' },
{ path: 'blog', component: Blog },
```

## Títulos de Página

Associe títulos às rotas para acessibilidade. Os títulos podem ser estáticos ou dinâmicos (via `ResolveFn` ou um `TitleStrategy` customizado).

```ts
{ path: 'home', component: Home, title: 'Home Page' }
```

## Dados e Providers de Rota

- **Dados Estáticos**: Anexe metadados usando a propriedade `data`.
- **Providers de Rota**: Escope dependências a uma rota específica e seus filhos usando o array `providers`.

## Rotas Aninhadas (Filhas)

Defina subvisões usando a propriedade `children`. Os componentes pais devem incluir um `<router-outlet />`.

```ts
{
  path: 'product/:id',
  component: Product,
  children: [
    { path: 'info', component: ProductInfo },
    { path: 'reviews', component: ProductReviews },
  ],
}
```
