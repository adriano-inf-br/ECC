# Testes com o RouterTestingHarness

Ao testar componentes que envolvem roteamento, é crucial **não fazer mock do Router ou de serviços relacionados**. Em vez disso, use o `RouterTestingHarness`, que fornece uma forma robusta e confiável de testar a lógica de roteamento em um ambiente que reflete de perto uma aplicação real.

Usar o harness garante que você está testando a configuração real do router, os guards e os resolvers, levando a testes mais significativos.

## Configurando para Testes de Router

O `RouterTestingHarness` é a principal ferramenta para testar cenários de roteamento. Você também precisa fornecer suas rotas de teste usando a função `provideRouter` na configuração do seu `TestBed`.

### Exemplo de Configuração

```ts
import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {Dashboard} from './dashboard.component';
import {HeroDetail} from './hero-detail.component';

describe('Dashboard Component Routing', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    // 1. Configure o TestBed com rotas de teste
    await TestBed.configureTestingModule({
      providers: [
        // Use provideRouter com suas rotas específicas de teste
        provideRouter([
          {path: '', component: Dashboard},
          {path: 'heroes/:id', component: HeroDetail},
        ]),
      ],
    }).compileComponents();

    // 2. Crie o RouterTestingHarness
    harness = await RouterTestingHarness.create();
  });
});
```

### Conceitos-Chave

1. **`provideRouter([...])`**: Forneça uma configuração de roteamento específica de teste. Ela deve incluir as rotas necessárias para que o componente em teste funcione corretamente.
2. **`RouterTestingHarness.create()`**: Cria e inicializa o harness de forma assíncrona e realiza uma navegação inicial para a URL raiz (`/`).

## Escrevendo Testes de Router

Uma vez que o harness é criado, você pode usá-lo para conduzir a navegação e fazer asserções sobre o estado do router e dos componentes ativados.

### Exemplo: Testando a Navegação

```ts
it('should navigate to a hero detail when a hero is selected', async () => {
  // 1. Navegue até o componente inicial e obtenha sua instância
  const dashboard = await harness.navigateByUrl('/', Dashboard);

  // Suponha que o dashboard tenha um método para selecionar um herói
  const heroToSelect = {id: 42, name: 'Test Hero'};
  dashboard.selectHero(heroToSelect);

  // Aguarde a estabilidade após a ação que dispara a navegação
  await harness.fixture.whenStable();

  // 2. Faça a asserção sobre a URL
  expect(harness.router.url).toEqual('/heroes/42');

  // 3. Obtenha o componente ativado após a navegação
  const heroDetail = await harness.getHarness(HeroDetail);

  // 4. Faça a asserção sobre o estado do novo componente
  expect(await heroDetail.componentInstance.hero.name).toBe('Test Hero');
});

it('should get the activated component directly', async () => {
  // Navegue e obtenha a instância do componente em uma única etapa
  const dashboardInstance = await harness.navigateByUrl('/', Dashboard);

  expect(dashboardInstance).toBeInstanceOf(Dashboard);
});
```

### Boas Práticas

- **Navegue com o Harness:** Sempre use `harness.navigateByUrl()` para simular a navegação. Esse método retorna uma promise que resolve com a instância do componente ativado.
- **Acesse o Estado do Router:** Use `harness.router` para acessar a instância ativa do router e fazer asserções sobre seu estado (por exemplo, `harness.router.url`).
- **Obtenha os Componentes Ativados:** Use `harness.getHarness(ComponentType)` para obter uma instância de um harness de componente para o componente roteado atualmente ativado, ou `harness.routeDebugElement` para obter o `DebugElement`.
- **Aguarde a Estabilidade:** Após realizar uma ação que cause navegação, sempre faça `await harness.fixture.whenStable()` para garantir que o roteamento esteja completo antes de fazer asserções.
