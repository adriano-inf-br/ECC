# Reatividade Assíncrona com `resource`

> [!IMPORTANT]
> A API `resource` é atualmente experimental no Angular.

Um `Resource` incorpora a busca de dados assíncrona à reatividade baseada em signals do Angular. Ele executa uma função loader assíncrona sempre que suas dependências mudam, expondo o status e o resultado como signals síncronos.

## Uso Básico

A função `resource` aceita um objeto de opções com duas propriedades principais:

1. `params`: Uma computação reativa (como `computed`). Quando os signals lidos aqui mudam, o resource busca os dados novamente.
2. `loader`: Uma função assíncrona que busca dados com base nos parâmetros.

```ts
import { Component, resource, signal, computed } from '@angular/core';

@Component({...})
export class UserProfile {
  userId = signal('123');

  userResource = resource({
    // Rastreando userId reativamente
    params: () => ({ id: this.userId() }),

    // Executa sempre que params mudam
    loader: async ({ params, abortSignal }) => {
      const response = await fetch(`/api/users/${params.id}`, { signal: abortSignal });
      if (!response.ok) throw new Error('Network error');
      return response.json();
    }
  });

  // Use o valor do resource em signals computados
  userName = computed(() => {
    if (this.userResource.hasValue()) {
      return this.userResource.value()?.name;
    } else {
      return 'Loading...';
    }
  });
}
```

## Abortando Requisições

Se o signal `params` mudar enquanto um loader anterior ainda estiver em execução, o `Resource` tentará abortar a requisição pendente usando o `abortSignal` fornecido. **Sempre passe o `abortSignal` para suas chamadas `fetch`.**

## Recarregando Dados

Você pode forçar imperativamente o resource a reexecutar o loader sem que os params mudem, chamando `.reload()`.

```ts
this.userResource.reload();
```

## Signals de Status do Resource

O objeto `Resource` fornece vários signals para ler seu estado atual:

- `value()`: Os dados resolvidos, ou `undefined`.
- `hasValue()`: Booleano de type-guard. `true` se existir um valor.
- `isLoading()`: Booleano que indica se o loader está em execução no momento.
- `error()`: O erro lançado pelo loader, ou `undefined`.
- `status()`: Uma constante de string representando o estado exato (`'idle'`, `'loading'`, `'resolved'`, `'error'`, `'reloading'`, `'local'`).

## Mutação Local

Você pode atualizar de forma otimista o valor do resource diretamente. Isso altera o status para `'local'`.

```ts
this.userResource.value.set({name: 'Optimistic Update'});
```

## Busca de Dados Reativa com `httpResource`

Se você estiver usando o `HttpClient` do Angular, prefira usar `httpResource`. É um wrapper especializado que aproveita a stack HTTP do Angular (incluindo interceptors) ao mesmo tempo em que fornece a mesma API de resource baseada em signals.
