# Injetores Hierárquicos

O sistema de injeção de dependência do Angular é hierárquico, ou seja, os serviços podem ter escopo em diferentes níveis da aplicação.

## Tipos de Hierarquias de Injetores

1. **Hierarquia `EnvironmentInjector`**: configurada via `@Injectable({ providedIn: 'root' })` ou `ApplicationConfig.providers` durante o bootstrap. Estes são singletons globais.
2. **Hierarquia `ElementInjector`**: criada implicitamente em cada elemento do DOM. Configurada via o array `providers` ou `viewProviders` em `@Component()` ou `@Directive()`.

## Regras de Resolução

Quando uma dependência é solicitada, o Angular a resolve em duas fases:

1. Ele busca subindo a árvore do **`ElementInjector`**, começando do componente/diretiva solicitante até o elemento raiz.
2. Se não for encontrada, ele busca na árvore do **`EnvironmentInjector`**, começando do injetor de ambiente mais próximo até a raiz.
3. Se ainda assim não for encontrada, ele lança um erro (a menos que esteja marcada como opcional).

## Modificadores de Resolução

Você pode alterar como o Angular busca por uma dependência usando o objeto de opções em `inject()`:

- **`optional`**: se a dependência não for encontrada, retorna `null` em vez de lançar um erro.
- **`self`**: verifica apenas o `ElementInjector` atual. Não busca na árvore pai.
- **`skipSelf`**: começa a busca no `ElementInjector` pai, pulando o elemento atual.
- **`host`**: interrompe a busca ao atingir o limite da view do componente host.

```ts
@Component({...})
export class Example {
  // Retorna null se não for encontrada, em vez de quebrar
  optionalService = inject(MyService, { optional: true });

  // Pula os provedores deste componente, olha no pai
  parentService = inject(ParentService, { skipSelf: true });
}
```

## `providers` vs `viewProviders`

Ao fornecer um serviço no nível do componente:

- **`providers`**: o serviço fica disponível para o componente, sua view (template) e qualquer **conteúdo projetado** (`<ng-content>`).
- **`viewProviders`**: o serviço fica disponível para o componente e sua view, mas **NÃO** para o conteúdo projetado. Use isto para isolar serviços do conteúdo passado pelos consumidores.
