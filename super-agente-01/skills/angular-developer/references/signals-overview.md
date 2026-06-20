# Visão Geral dos Signals do Angular

Signals são a base da reatividade nas aplicações Angular modernas. Um **signal** é um wrapper em torno de um valor que notifica os consumidores interessados quando esse valor muda.

## Writable Signals (`signal`)

Use `signal()` para criar estado que pode ser atualizado diretamente.

```ts
import {signal} from '@angular/core';

// Cria um signal gravável
const count = signal(0);

// Lê o valor (sempre requer chamar a função getter)
console.log(count());

// Atualiza o valor diretamente
count.set(3);

// Atualiza com base no valor anterior
count.update((value) => value + 1);
```

### Expondo como Readonly

Ao expor estado a partir de um serviço, é uma boa prática expor uma versão readonly para evitar mutação externa.

```ts
private readonly _count = signal(0);
// Os consumidores podem ler isto, mas não podem chamar .set() ou .update()
readonly count = this._count.asReadonly();
```

## Computed Signals (`computed`)

Use `computed()` para criar signals somente leitura que derivam seu valor de outros signals.

- **Avaliado Preguiçosamente (Lazy)**: A função de derivação não executa até que o computed signal seja lido.
- **Memoizado**: O resultado é armazenado em cache. Ele só recalcula quando um dos signals dos quais depende muda.
- **Dependências Dinâmicas**: Apenas os signals _efetivamente lidos_ durante a derivação são rastreados.

```ts
import {signal, computed} from '@angular/core';

const count = signal(0);
const doubleCount = computed(() => count() * 2);

// doubleCount atualiza automaticamente quando count muda.
```

## Contextos Reativos

Um **contexto reativo** é um estado de runtime onde o Angular monitora as leituras de signals para estabelecer uma dependência.

O Angular entra automaticamente em um contexto reativo ao avaliar:

- signals `computed`
- callbacks de `effect`
- computações de `linkedSignal`
- templates de componentes

### Leituras Não Rastreadas (`untracked`)

Se você precisar ler um signal dentro de um contexto reativo _sem_ criar uma dependência (de modo que o contexto não reexecute quando o signal mudar), use `untracked()`.

```ts
import {effect, untracked} from '@angular/core';

effect(() => {
  // Este effect só executa quando currentUser muda.
  // Ele NÃO executa quando counter muda, embora counter seja lido aqui.
  console.log(`User: ${currentUser()}, Count: ${untracked(counter)}`);
});
```

### Operações Assíncronas em Contextos Reativos

O contexto reativo só fica ativo para código **síncrono**. Leituras de signals após um `await` não serão rastreadas. **Sempre leia os signals antes de fronteiras assíncronas.**

```ts
// Incorreto: theme() não é rastreado porque é lido após o await
effect(async () => {
  const data = await fetchUserData();
  console.log(theme());
});

// Correto: Leia o signal antes do await
effect(async () => {
  const currentTheme = theme();
  const data = await fetchUserData();
  console.log(currentTheme);
});
```
