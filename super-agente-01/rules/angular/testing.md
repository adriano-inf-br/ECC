---
paths:
  - "**/*.spec.ts"
  - "**/*.test.ts"
---
# Testes no Angular

> This file extends [common/testing.md](../common/testing.md) with Angular specific content.

## Test Runner

Use o test runner configurado pelo projeto. Verifique `angular.json` e `package.json`; projetos Angular comumente usam Vitest, Jest ou Jasmine + Karma.

```bash
ng test               # modo watch
ng test --no-watch    # modo CI
```

## Configuração do TestBed

Para componentes standalone, importe o componente diretamente. Chame `compileComponents()` para componentes com templates externos.

```typescript
describe('UserCardComponent', () => {
  let fixture: ComponentFixture<UserCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
  });
});
```

## Signal Inputs

Defina inputs baseados em signal via `fixture.componentRef.setInput()`:

```typescript
fixture.componentRef.setInput('user', mockUser);
fixture.detectChanges();
```

## Component Harnesses

Prefira component harnesses do Angular CDK em vez de queries diretas ao DOM para interação com a UI. Os harnesses são mais resilientes a mudanças de marcação.

```typescript
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

let loader: HarnessLoader;

beforeEach(() => {
  loader = TestbedHarnessEnvironment.loader(fixture);
});

it('triggers save on button click', async () => {
  const button = await loader.getHarness(MatButtonHarness.with({ text: 'Save' }));
  await button.click();
  expect(saveSpy).toHaveBeenCalled();
});
```

## Testes de Roteamento

Use `RouterTestingHarness` para componentes que dependem do router:

```typescript
import { RouterTestingHarness } from '@angular/router/testing';

it('renders user on navigation', async () => {
  const harness = await RouterTestingHarness.create();
  const component = await harness.navigateByUrl('/users/1', UserDetailComponent);
  expect(component.userId()).toBe('1');
});
```

## Testes Assíncronos

Use `fakeAsync` + `tick` para assíncrono controlado. Use `waitForAsync` para assíncrono real com `fixture.whenStable()`.

```typescript
it('loads user after delay', fakeAsync(() => {
  const service = TestBed.inject(UserService);
  vi.spyOn(service, 'getUser').mockReturnValue(of(mockUser));

  fixture.detectChanges();
  tick();
  fixture.detectChanges();

  expect(fixture.nativeElement.querySelector('.name').textContent).toBe(mockUser.name);
}));
```

## Testes de HTTP

```typescript
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  httpMock = TestBed.inject(HttpTestingController);
});

afterEach(() => httpMock.verify());
```

## Testes de Serviço

Injete os serviços diretamente, sem um component fixture:

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
  });
});
```

## O Que Testar

- **Serviços**: Todos os métodos públicos, caminhos de erro, interações HTTP
- **Componentes**: Bindings de input/output, saída renderizada para estados-chave, interações do usuário via harnesses
- **Pipes**: Transformação pura — testes unitários simples, sem necessidade de TestBed
- **Guards/Resolvers**: Valores de retorno para estados permitidos e negados usando `RouterTestingHarness`

## Testes E2E

Use o framework E2E configurado do projeto, como Cypress ou Playwright, para fluxos de usuário críticos.

```typescript
describe('Login flow', () => {
  it('redirects to dashboard on valid credentials', () => {
    cy.visit('/login');
    cy.get('[data-cy=email]').type('user@example.com');
    cy.get('[data-cy=password]').type('password123');
    cy.get('[data-cy=submit]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

- Adicione atributos `data-cy` a elementos interativos para seletores estáveis
- Não dependa de classes CSS ou conteúdo de texto para seletores em testes E2E

## Cobertura

Mire ≥80% para serviços e pipes. Componentes: teste comportamento, não detalhes de implementação.

## Referência de Skill

Veja a skill: `angular-developer` para padrões de teste abrangentes, uso de harnesses e melhores práticas de assíncrono.
