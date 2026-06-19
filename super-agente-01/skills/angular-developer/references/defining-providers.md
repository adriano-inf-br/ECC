# Definindo Provedores de Dependência

O Angular oferece maneiras automáticas e manuais de fornecer dependências ao seu sistema de Injeção de Dependência (DI).

## Provisão Automática

A maneira mais comum de fornecer um serviço é usar `providedIn: 'root'` em um `@Injectable()`.

### InjectionToken

Use `InjectionToken` para dependências que não são classes (objetos de configuração, funções, primitivos). Um `InjectionToken` também pode ser fornecido automaticamente.

```ts
import {InjectionToken} from '@angular/core';

export interface AppConfig {
  apiUrl: string;
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config', {
  providedIn: 'root',
  factory: () => ({apiUrl: 'https://api.example.com'}),
});
```

## Provisão Manual

Você usa o array `providers` quando um serviço não tem `providedIn`, quando deseja uma nova instância para um componente específico ou ao configurar valores de tempo de execução.

```ts
@Component({
  providers: [
    // Atalho para { provide: LocalService, useClass: LocalService }
    LocalService,

    // useClass: troca implementações
    {provide: Logger, useClass: BetterLogger},

    // useValue: fornece valores estáticos
    {provide: API_URL_TOKEN, useValue: 'https://api.example.com'},

    // useFactory: gera o valor dinamicamente
    {
      provide: ApiClient,
      useFactory: (http = inject(HttpClient)) => new ApiClient(http),
    },

    // useExisting: cria um alias
    {provide: OldLogger, useExisting: NewLogger},

    // multi: fornece múltiplos valores para o mesmo token como um array
    {provide: INTERCEPTOR_TOKEN, useClass: AuthInterceptor, multi: true},
  ],
})
export class Example {}
```

## Escopos de Provedores

- **Bootstrap da Aplicação**: singletons globais. Use para clientes HTTP, logging ou configuração de toda a aplicação.
- **Componente/Diretiva**: instâncias isoladas. Use para estado específico de componente ou formulários. Os serviços são destruídos quando o componente é destruído.
- **Rota**: serviços específicos de funcionalidade carregados apenas com rotas específicas.

## Padrão de Biblioteca: funções `provide*`

Autores de bibliotecas devem exportar funções que retornam arrays de provedores para encapsular a configuração:

```ts
export function provideAnalytics(config: AnalyticsConfig): Provider[] {
  return [{provide: ANALYTICS_CONFIG, useValue: config}, AnalyticsService];
}
```
