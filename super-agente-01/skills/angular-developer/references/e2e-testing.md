# Testes de Ponta a Ponta (E2E)

Use testes E2E para cobrir jornadas críticas do usuário em um navegador real. Prefira o framework já configurado no workspace Angular, como Cypress ou Playwright.

## Executando Testes E2E

Verifique `package.json` e `angular.json` para o comando específico do projeto. Padrões comuns incluem:

```shell
npm run e2e
pnpm e2e
ng e2e
```

Quando a aplicação precisa ser construída ou servida primeiro, use os scripts existentes do projeto em vez de inventar um ponto de entrada de teste paralelo.

## Estrutura de Teste

- Mantenha as specs E2E próximas ao framework de teste configurado, como `cypress/e2e/` ou `e2e/`.
- Coloque helpers reutilizáveis de login/setup no diretório de suporte do framework.
- Mantenha fixtures explícitas e pequenas o suficiente para que cada teste possa explicar o estado do usuário do qual depende.

### Exemplo com Cypress

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

### Exemplo com Playwright

```typescript
import {expect, test} from '@playwright/test';

test('redirects to dashboard on valid credentials', async ({page}) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', {name: 'Sign in'}).click();
  await expect(page).toHaveURL(/dashboard/);
});
```

## Boas Práticas

- Prefira localizadores acessíveis (`getByRole`, `getByLabel`) ou atributos `data-*` estáveis.
- Evite seletores que dependam de classes CSS, profundidade do DOM ou texto incidental.
- Aguarde estados de UI, rotas ou respostas de rede específicos em vez de esperas (sleeps) arbitrárias.
- Mantenha os testes de smoke curtos e reserve a cobertura completa de fluxo de trabalho para os caminhos de maior valor.
