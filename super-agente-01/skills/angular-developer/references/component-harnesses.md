# Testando com Component Harnesses

Component harnesses são a forma padrão e preferida de interagir com componentes em testes. Eles fornecem uma API robusta e centrada no usuário que torna os testes menos frágeis e mais fáceis de ler, isolando-os de mudanças na estrutura interna do DOM de um componente.

## Por que Usar Harnesses?

- **Robustez:** Os testes não quebram quando você refatora o HTML ou as classes CSS internas de um componente.
- **Legibilidade:** Os testes descrevem interações da perspectiva do usuário (ex.: `button.click()`, `slider.getValue()`) em vez de queries no DOM (`fixture.nativeElement.querySelector(...)`).
- **Reutilização:** O mesmo harness pode ser usado tanto em testes unitários quanto em testes E2E.

O Angular Material fornece um test harness para cada componente da sua biblioteca.

## Usando um Harness em um Teste Unitário

O `TestbedHarnessEnvironment` é o ponto de entrada para usar harnesses em testes unitários.

### Exemplo: Testando com um `MatButtonHarness`

```ts
import {TestbedHarnessEnvironment} from '@angular/cdk/testing/testbed';
import {MatButtonHarness} from '@angular/material/button/testing';
import {MyButtonContainerComponent} from './my-button-container.component';

describe('MyButtonContainerComponent', () => {
  let fixture: ComponentFixture<MyButtonContainerComponent>;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyButtonContainerComponent, MatButtonModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MyButtonContainerComponent);
    // Cria um harness loader para a fixture do componente
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should find a button with specific text', async () => {
    // Carrega o harness para um MatButton com o texto "Submit"
    const submitButton = await loader.getHarness(MatButtonHarness.with({text: 'Submit'}));

    // Usa a API do harness para interagir com o componente
    expect(await submitButton.isDisabled()).toBe(false);
    await submitButton.click();

    // ... asserções
  });
});
```

### Conceitos-Chave

1. **`HarnessLoader`**: Um objeto usado para encontrar e criar instâncias de harness. Obtenha um loader para a fixture do seu componente usando `TestbedHarnessEnvironment.loader(fixture)`.

2. **`loader.getHarness(HarnessClass)`**: Encontra de forma assíncrona e retorna uma instância de harness para o primeiro componente correspondente.

3. **`HarnessClass.with({ ... })`**: Muitos harnesses fornecem um método estático `with` que retorna um `HarnessPredicate`. Isso permite filtrar e encontrar componentes com base em suas propriedades, como texto, selector ou estado disabled. Sempre use isto para mirar com precisão no componente que você quer testar.

4. **API do Harness:** Uma vez que você tenha uma instância de harness, use seus métodos (ex.: `.click()`, `.getText()`, `.getValue()`) para interagir com o componente. Esses métodos lidam automaticamente com a espera por operações assíncronas e a detecção de mudanças.
