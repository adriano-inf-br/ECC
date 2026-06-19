# Contexto de Injeção

A função `inject()` só pode ser usada quando o código está sendo executado dentro de um **contexto de injeção**.

## Onde um Contexto de Injeção Está Disponível?

Um contexto de injeção está automaticamente disponível em:

1. **Inicializadores de campo** de classes instanciadas pela DI (`@Injectable`, `@Component`, `@Directive`, `@Pipe`).
2. **Construtores** de classes instanciadas pela DI.
3. **Funções de fábrica** especificadas em configurações de `useFactory` ou `InjectionToken`.
4. **APIs funcionais** executadas pelo Angular (ex.: route guards funcionais, resolvers, interceptors).

```ts
@Component({...})
export class Example {
  // Válido: inicializador de campo
  private router = inject(Router);

  constructor() {
    // Válido: construtor
    const http = inject(HttpClient);
  }

  onClick() {
    // Inválido: não é um contexto de injeção
    // const auth = inject(AuthService);
  }
}
```

## `runInInjectionContext`

Se você precisa executar uma função dentro de um contexto de injeção (frequentemente necessário para criação dinâmica de componentes ou testes), use `runInInjectionContext`. Isso requer acesso a um injetor existente (como `EnvironmentInjector` ou `Injector`).

```ts
import {Injectable, inject, EnvironmentInjector, runInInjectionContext} from '@angular/core';

@Injectable({providedIn: 'root'})
export class MyService {
  private injector = inject(EnvironmentInjector);

  doSomethingDynamic() {
    runInInjectionContext(this.injector, () => {
      // Agora é válido usar inject() aqui
      const router = inject(Router);
    });
  }
}
```

## `assertInInjectionContext`

Use `assertInInjectionContext` em funções utilitárias para garantir que elas sejam chamadas a partir de um contexto válido. Ela lança um erro claro se não for o caso.

```ts
import {assertInInjectionContext, inject, ElementRef} from '@angular/core';

export function injectNativeElement<T extends Element>(): T {
  assertInInjectionContext(injectNativeElement);
  return inject(ElementRef).nativeElement;
}
```
