# Criando e Usando Serviços

Serviços no Angular são pedaços reutilizáveis de código que lidam com busca de dados, lógica de negócio ou gerenciamento de estado que múltiplos componentes ou outros serviços precisam acessar.

## Criando um Serviço

Você pode gerar um serviço usando o Angular CLI:

```bash
ng generate service my-data
```

Ou pode criar manualmente uma classe TypeScript e decorá-la com `@Injectable()`.

```ts
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BasicDataStore {
  private data: string[] = [];

  addData(item: string): void {
    this.data.push(item);
  }

  getData(): string[] {
    return [...this.data];
  }
}
```

### A Opção `providedIn: 'root'`

Usar `providedIn: 'root'` é a abordagem recomendada para a maioria dos serviços. Ela diz ao Angular para:

- **Criar uma única instância (singleton)** para toda a aplicação.
- **Torná-la disponível em todos os lugares** automaticamente, sem precisar listá-la em nenhum array `providers`.
- **Habilitar o tree-shaking**, ou seja, o serviço só é incluído no bundle JavaScript final se for de fato injetado em algum lugar.

## Injetando um Serviço

Uma vez criado um serviço, você pode injetá-lo em componentes, diretivas ou outros serviços usando a função `inject()`.

### Injetando em um Componente

```ts
import {Component, inject} from '@angular/core';
import {BasicDataStore} from './basic-data-store.service';

@Component({
  selector: 'app-example',
  template: `
    <div>
      <p>Data items: {{ dataStore.getData().length }}</p>
      <button (click)="dataStore.addData('New Item')">Add Item</button>
    </div>
  `,
})
export class Example {
  // Injeta o serviço como um campo da classe
  dataStore = inject(BasicDataStore);
}
```

### Injetando em Outro Serviço

Serviços podem injetar outros serviços exatamente da mesma forma.

```ts
import {Injectable, inject} from '@angular/core';
import {AdvancedDataStore} from './advanced-data-store.service';

@Injectable({
  providedIn: 'root',
})
export class BasicDataStore {
  // Injetando outro serviço
  private advancedDataStore = inject(AdvancedDataStore);

  private data: string[] = [];

  getData(): string[] {
    // Combina dados deste serviço e do serviço injetado
    return [...this.data, ...this.advancedDataStore.getData()];
  }
}
```

## Padrões Avançados de Serviço

Embora `providedIn: 'root'` cubra a maioria dos cenários, às vezes você pode precisar de:

- **Instâncias específicas de componente**: Se um componente precisa de sua própria instância isolada de um serviço, forneça-o diretamente no array `@Component({ providers: [MyService] })` do componente.
- **Factory providers**: Para criação dinâmica.
- **Value providers**: Para injetar objetos de configuração.
