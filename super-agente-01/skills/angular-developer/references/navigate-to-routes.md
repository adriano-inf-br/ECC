# Navegar para Rotas

O Angular oferece formas declarativas e programáticas de navegar entre rotas.

## Navegação Declarativa (`RouterLink`)

Use a diretiva `RouterLink` em elementos de âncora.

```ts
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/dashboard" routerLinkActive="active-link">Dashboard</a>
      <a [routerLink]="['/user', userId]">Profile</a>
    </nav>
  `,
})
export class Nav {
  userId = '123';
}
```

- **Caminhos Absolutos**: começam com `/` (ex.: `/settings`).
- **Caminhos Relativos**: sem `/` inicial. Use `../` para subir um nível.

## Navegação Programática (`Router`)

Injete o serviço `Router` para navegar via código TypeScript.

### `router.navigate()`

Usa um array de comandos.

```ts
private router = inject(Router);
private route = inject(ActivatedRoute);

// Navegação padrão
this.router.navigate(['/profile']);

// Com parâmetros
this.router.navigate(['/search'], {
  queryParams: { q: 'angular' },
  fragment: 'results'
});

// Navegação relativa
this.router.navigate(['edit'], { relativeTo: this.route });
```

### `router.navigateByUrl()`

Usa um caminho em string. Ideal para navegação absoluta ou URLs completas.

```ts
this.router.navigateByUrl('/products/123?view=details');

// Substitui a entrada atual no histórico
this.router.navigateByUrl('/login', {replaceUrl: true});
```

## Parâmetros de URL

- **Parâmetros de Rota (Route Params)**: parte do caminho (ex.: `/user/123`).
- **Parâmetros de Consulta (Query Params)**: após o `?` (ex.: `/search?q=query`).
- **Parâmetros de Matriz (Matrix Params)**: com escopo em um segmento (ex.: `/products;category=books`).
