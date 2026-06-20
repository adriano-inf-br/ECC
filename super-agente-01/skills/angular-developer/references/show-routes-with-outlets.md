# Exibindo Rotas com Outlets

A diretiva `RouterOutlet` é um placeholder onde o Angular renderiza o componente da URL atual.

## Uso Básico

Inclua `<router-outlet />` no seu template. O Angular insere o componente roteado como um irmão imediatamente após o outlet.

```html
<app-header /> <router-outlet />
<!-- O conteúdo da rota aparece aqui -->
<app-footer />
```

## Outlets Aninhados

Rotas filhas exigem seu próprio `<router-outlet />` dentro do template do componente pai.

```ts
// Template do componente pai
<h1>Settings</h1>
<router-outlet /> <!-- Componentes filhos como Profile ou Security são renderizados aqui -->
```

## Outlets Nomeados (Rotas Secundárias)

As páginas podem ter múltiplos outlets. Atribua um `name` a um outlet para direcioná-lo especificamente. O nome padrão é `'primary'`.

```html
<router-outlet />
<!-- Primário -->
<router-outlet name="sidebar" />
<!-- Secundário -->
```

Defina o `outlet` na configuração da rota:

```ts
{
  path: 'chat',
  component: Chat,
  outlet: 'sidebar'
}
```

## Eventos de Ciclo de Vida do Outlet

O `RouterOutlet` emite eventos quando os componentes são alterados:

- `activate`: Novo componente instanciado.
- `deactivate`: Componente destruído.
- `attach` / `detach`: Usados com `RouteReuseStrategy`.

```html
<router-outlet (activate)="onActivate($event)" />
```

## Passando Dados via `routerOutletData`

Você pode passar dados contextuais para o componente roteado usando o input `routerOutletData`. O componente acessa isso por meio do token de injeção `ROUTER_OUTLET_DATA` como um signal.

```ts
// No Pai
<router-outlet [routerOutletData]="{ theme: 'dark' }" />

// No Componente Roteado
outletData = inject(ROUTER_OUTLET_DATA) as Signal<{ theme: string }>;
```
