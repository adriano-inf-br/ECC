# Efeitos Colaterais com `effect` e `afterRenderEffect`

No Angular, um **effect** é uma operação que é executada sempre que um ou mais valores de signal que ele rastreia mudam.

## Quando usar `effect`

Effects destinam-se a sincronizar o estado de signals com APIs imperativas que não usam signals.

**Casos de Uso Válidos:**

- Registrar analytics.
- Sincronizar estado com `localStorage` ou `sessionStorage`.
- Realizar renderização personalizada em um `<canvas>` ou biblioteca de gráficos de terceiros.

**REGRA CRÍTICA: NÃO use effects para propagar estado.**
Se você se pegar usando `.set()` ou `.update()` em um signal _dentro_ de um effect para manter dois signals sincronizados, você está cometendo um erro. Isso causa erros `ExpressionChangedAfterItHasBeenChecked` e loops infinitos. **Sempre use `computed()` ou `linkedSignal()` para derivação de estado.**

## Uso Básico

Effects são executados de forma assíncrona durante o processo de detecção de mudanças. Eles sempre são executados pelo menos uma vez.

```ts
import { Component, signal, effect } from '@angular/core';

@Component({...})
export class Example {
  count = signal(0);

  constructor() {
    // O effect deve ser criado em um contexto de injeção (ex.: um construtor)
    effect((onCleanup) => {
      console.log(`Count changed to ${this.count()}`);

      const timer = setTimeout(() => console.log('Timer finished'), 1000);

      // A função de limpeza é executada antes da próxima execução, ou quando destruído
      onCleanup(() => clearTimeout(timer));
    });
  }
}
```

## Manipulação do DOM com `afterRenderEffect`

O `effect` padrão é executado _antes_ de o Angular atualizar o DOM. Se você precisa inspecionar ou modificar manualmente o DOM com base na mudança de um signal (ex.: integrar uma biblioteca de UI de terceiros), use `afterRenderEffect`.

O `afterRenderEffect` é executado depois que o Angular termina de renderizar o DOM.

### Fases de Renderização

Para prevenir reflows (forced layout thrashing), o `afterRenderEffect` obriga você a dividir suas leituras e escritas do DOM em fases específicas.

```ts
import { Component, afterRenderEffect, viewChild, ElementRef } from '@angular/core';

@Component({...})
export class Chart {
  canvas = viewChild.required<ElementRef>('canvas');

  constructor() {
    afterRenderEffect({
      // 1. Lê do DOM
      earlyRead: () => {
        return this.canvas().nativeElement.getBoundingClientRect().width;
      },
      // 2. Escreve no DOM (recebe o resultado da fase anterior)
      write: (width) => {
        // NUNCA leia do DOM na fase de escrita.
        setupChart(this.canvas().nativeElement, width);
      }
    });
  }
}
```

**Fases Disponíveis (executadas nesta ordem):**

1. `earlyRead`
2. `write` (Nunca leia aqui)
3. `mixedReadWrite` (Evite se possível)
4. `read` (Nunca escreva aqui)

_Nota: o `afterRenderEffect` só é executado no cliente, nunca durante a Renderização no Servidor (SSR)._
