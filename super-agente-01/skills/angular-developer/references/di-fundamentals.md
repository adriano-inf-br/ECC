# Fundamentos de Injeção de Dependência (DI)

A Injeção de Dependência (DI) é um padrão de design usado para organizar e compartilhar código em uma aplicação, permitindo que você "injete" funcionalidades em diferentes partes. Isso melhora a manutenibilidade, a escalabilidade e a testabilidade do código.

## Como a DI Funciona no Angular

Há duas formas principais pelas quais o código interage com o sistema de DI do Angular:

1. **Fornecendo (Providing)**: tornar valores (objetos, funções, primitivos) disponíveis ao sistema de DI.
2. **Injetando (Injecting)**: solicitar esses valores ao sistema de DI.

Componentes, diretivas e serviços do Angular participam automaticamente da DI.

## Serviços

Um **serviço** é a forma mais comum de compartilhar dados e funcionalidade em uma aplicação. É uma classe TypeScript decorada com `@Injectable()`.

### Criando um Serviço

Use a opção `providedIn: 'root'` no decorador `@Injectable` para tornar o serviço um singleton disponível em toda a aplicação. Esta é a abordagem recomendada para a maioria dos serviços.

```ts
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root', // Torna isto um singleton disponível em todos os lugares
})
export class AnalyticsLogger {
  trackEvent(category: string, value: string) {
    console.log('Analytics event logged:', {category, value});
  }
}
```

Usos comuns para serviços incluem:

- Clientes de dados (chamadas de API)
- Gerenciamento de estado
- Autenticação e autorização
- Logging e tratamento de erros
- Funções utilitárias

## Injetando Dependências

Use a função `inject()` do Angular para solicitar dependências.

### A Função `inject()`

Você pode usar a função `inject()` para obter uma instância de um serviço (ou qualquer outro token fornecido).

```ts
import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {AnalyticsLogger} from './analytics-logger.service';

@Component({
  selector: 'app-navbar',
  template: `<a href="#" (click)="navigateToDetail($event)">Detail Page</a>`,
})
export class Navbar {
  // Injetando dependências usando inicializadores de campo de classe
  private router = inject(Router);
  private analytics = inject(AnalyticsLogger);

  navigateToDetail(event: Event) {
    event.preventDefault();
    this.analytics.trackEvent('navigation', '/details');
    this.router.navigate(['/details']);
  }
}
```

### Onde `inject()` pode ser usado? (Contexto de Injeção)

Você pode chamar `inject()` em um **contexto de injeção**. Os contextos de injeção mais comuns ocorrem durante a construção de um componente, diretiva ou serviço.

Lugares válidos para chamar `inject()`:

1. **Inicializadores de campo de classe** (Recomendado)
2. **Corpo do construtor**
3. **Route guards e resolvers** (que são executados em um contexto de injeção)
4. **Funções de fábrica** usadas em provedores

```typescript
import {Component, Directive, Injectable, inject, ElementRef} from '@angular/core';
import {HttpClient} from '@angular/common/http';

// 1. Em um Componente (Inicializador de campo e construtor)
@Component({
  /*...*/
})
export class Example {
  private service1 = inject(MyService); // Inicializador de campo válido

  private service2: MyService;
  constructor() {
    this.service2 = inject(MyService); // Corpo de construtor válido
  }
}

// 2. Em uma Diretiva
@Directive({
  /*...*/
})
export class MyDirective {
  private element = inject(ElementRef); // Inicializador de campo válido
}

// 3. Em um Serviço
@Injectable({providedIn: 'root'})
export class MyService {
  private http = inject(HttpClient); // Inicializador de campo válido
}

// 4. Em um Route Guard (Funcional)
export const authGuard = () => {
  const auth = inject(AuthService); // Route guard válido
  return auth.isAuthenticated();
};
```
