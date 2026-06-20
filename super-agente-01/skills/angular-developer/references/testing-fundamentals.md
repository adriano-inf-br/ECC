# Fundamentos de Testes

Este guia cobre os princípios e práticas fundamentais para escrever testes unitários e de componentes no Angular. Use o runner já configurado no projeto.

## Filosofia Central: Async-First

Aplicações Angular modernas frequentemente agendam mudanças de estado de forma assíncrona, especialmente ao usar signals ou detecção de mudanças sem zone (zoneless). Os testes devem levar isso em conta.

Prefira o padrão "Agir, Aguardar, Verificar":

1. **Agir:** atualize o estado ou execute uma ação (ex.: definir um input de componente, clicar em um botão).
2. **Aguardar:** use `await fixture.whenStable()` para permitir que o framework processe a atualização agendada e renderize as mudanças.
3. **Verificar:** valide o resultado.

### Exemplo de Estrutura Básica de Teste

```ts
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MyComponent} from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let h1: HTMLElement;

  beforeEach(async () => {
    // 1. Configura o módulo de teste
    await TestBed.configureTestingModule({
      imports: [MyComponent],
    }).compileComponents();

    // 2. Cria o fixture do componente
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    h1 = fixture.nativeElement.querySelector('h1');
  });

  it('should display the default title', async () => {
    // AGIR: (Implícito) O componente é criado com o estado padrão.
    // AGUARDAR a vinculação inicial de dados.
    await fixture.whenStable();
    // VERIFICAR o estado inicial.
    expect(h1.textContent).toContain('Default Title');
  });

  it('should display a different title after a change', async () => {
    // AGIR: Altera a propriedade title do componente.
    component.title.set('New Test Title');

    // AGUARDAR a conclusão da atualização assíncrona.
    await fixture.whenStable();

    // VERIFICAR que o DOM foi atualizado.
    expect(h1.textContent).toContain('New Test Title');
  });
});
```

## TestBed e ComponentFixture

- **`TestBed`**: o utilitário principal para criar um módulo Angular específico de teste. Use `TestBed.configureTestingModule({...})` no seu `beforeEach` para declarar componentes, fornecer serviços e configurar os imports necessários para o seu teste.
- **`ComponentFixture`**: um handle para a instância do componente criada e seu ambiente.
  - `fixture.componentInstance`: acessa a instância da classe do componente.
  - `fixture.nativeElement`: acessa o elemento DOM raiz do componente.
  - `fixture.debugElement`: um wrapper específico do Angular em torno do `nativeElement` que fornece formas mais seguras e independentes de plataforma para consultar o DOM (ex.: `debugElement.query(By.css('p'))`).
