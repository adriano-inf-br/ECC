# Ciclo de Vida e Eventos do Router

O Angular Router emite eventos através do observable `Router.events`, permitindo que você rastreie o ciclo de vida da navegação do início ao fim.

## Eventos Comuns do Router (Cronológicos)

1. **`NavigationStart`**: A navegação começa.
2. **`RoutesRecognized`**: O router corresponde a URL a uma rota.
3. **`GuardsCheckStart` / `End`**: Avaliação de `canActivate`, `canMatch`, etc.
4. **`ResolveStart` / `End`**: Fase de resolução de dados (buscando dados via resolvers).
5. **`NavigationEnd`**: A navegação foi concluída com sucesso.
6. **`NavigationCancel`**: Navegação cancelada (por exemplo, guard retornou `false`).
7. **`NavigationError`**: A navegação falhou (por exemplo, erro em um resolver).

## Inscrevendo-se nos Eventos

Injete o `Router` e filtre o observable `events`.

```ts
import {Router, NavigationStart, NavigationEnd} from '@angular/router';

export class MyService {
  private router = inject(Router);

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((event) => {
      console.log('Navigated to:', event.url);
    });
  }
}
```

## Depuração

Habilite o log detalhado no console de todos os eventos de roteamento durante o bootstrap da aplicação.

```ts
provideRouter(routes, withDebugTracing());
```

## Casos de Uso Comuns

- **Indicadores de Carregamento**: Mostre um spinner quando `NavigationStart` for disparado e oculte-o em `NavigationEnd`/`Cancel`/`Error`.
- **Analytics**: Rastreie visualizações de página escutando `NavigationEnd`.
- **Gerenciamento de Rolagem**: Responda a eventos `Scroll` para comportamento de rolagem personalizado.
