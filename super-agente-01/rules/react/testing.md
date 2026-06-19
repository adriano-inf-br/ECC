---
paths:
  - "**/*.test.tsx"
  - "**/*.test.jsx"
  - "**/*.spec.tsx"
  - "**/*.spec.jsx"
  - "**/__tests__/**/*.ts"
  - "**/__tests__/**/*.tsx"
---
# Testes React

> Este arquivo estende [typescript/testing.md](../typescript/testing.md) e [common/testing.md](../common/testing.md) com conteúdo específico de React.

## Escolha da Biblioteca

- **React Testing Library (RTL)** — o padrão para teste de componentes. Testa o comportamento através do DOM renderizado.
- **Vitest** — runner preferido para novos projetos baseados em Vite. Mais rápido que o Jest, ESM nativo, mesma API.
- **Jest** — ainda é o padrão para projetos Next.js / CRA. A RTL funciona de forma idêntica.
- **Playwright Component Testing** — quando os testes de componente precisam de um motor de navegador real (animação, layout, eventos complexos)
- **Cypress Component Testing** — runner alternativo de componente em navegador real

Escolha um único runner de teste de componente por projeto — não misture RTL + Playwright CT no mesmo repositório.

## Princípio Central

Teste o que o usuário vê e faz, não detalhes de implementação.

- Consulte primeiro por role acessível, depois por label, depois por texto — recorra a `data-testid` apenas quando nada mais servir
- Nunca faça assert sobre estado interno, props passadas aos filhos, ou quais hooks foram chamados
- Refatorar sem quebrar os testes = o teste estava testando comportamento; esse é o objetivo

## Prioridade de Consultas

A RTL expõe consultas em três famílias. Use esta ordem de prioridade, de cima para baixo:

1. **Acessível a todos**
   - `getByRole(role, { name })` — escolha principal
   - `getByLabelText` — para inputs de formulário
   - `getByPlaceholderText` — quando não há label disponível (e adicione um label)
   - `getByText` — para texto não interativo
   - `getByDisplayValue` — para campos de formulário com um valor atual

2. **Consultas semânticas**
   - `getByAltText` — para imagens
   - `getByTitle` — último recurso, baixo valor de acessibilidade

3. **Test IDs**
   - `getByTestId("some-id")` — apenas válvula de escape, quando nenhuma das anteriores funcionar

`getBy*` lança erro quando não há correspondência. `queryBy*` retorna null (use para afirmar ausência). `findBy*` retorna uma promise (use para async).

## Interação do Usuário

Prefira `userEvent` em vez de `fireEvent`. O `userEvent` simula sequências reais do navegador (focus, keydown, beforeinput, input, keyup) — o `fireEvent` dispara um único evento sintético.

```tsx
import userEvent from "@testing-library/user-event";

test("submits the form", async () => {
  const user = userEvent.setup();
  render(<UserForm onSubmit={handleSubmit} />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(handleSubmit).toHaveBeenCalledWith({ email: "user@example.com" });
});
```

- Sempre use `await` nas chamadas de `userEvent` — elas são assíncronas
- Chame `userEvent.setup()` uma vez no topo de cada teste, depois reutilize o `user` retornado

## Asserts Assíncronos

```tsx
// ERRADO: consulta síncrona para conteúdo renderizado de forma assíncrona
expect(screen.getByText("Loaded")).toBeInTheDocument();   // lança erro — ainda não está no DOM

// CORRETO: findBy* (retorna uma promise, faz retry)
expect(await screen.findByText("Loaded")).toBeInTheDocument();

// CORRETO: waitFor para asserts que não são de elemento
await waitFor(() => expect(saveSpy).toHaveBeenCalled());
```

- `findBy*` para o aparecimento assíncrono de elementos
- `waitFor` para expectativas assíncronas sobre efeitos colaterais ou outros matchers
- Nunca use `setTimeout` + assert — instável (flaky)

## Mock de Rede com MSW

Use o Mock Service Worker para qualquer teste que atinja uma fronteira de rede. O MSW roda na camada de rede, então o componente, os hooks e a biblioteca de fetch se comportam como em produção.

```tsx
// setup do teste
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("/api/users/:id", ({ params }) =>
    HttpResponse.json({ id: params.id, name: "Alice" }),
  ),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Override por teste:

```tsx
test("renders error on 500", async () => {
  server.use(http.get("/api/users/:id", () => new HttpResponse(null, { status: 500 })));
  render(<UserPage id="1" />);
  expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
});
```

## Evite Testes de Snapshot para Componentes

Snapshots da saída renderizada são frágeis, difíceis de revisar e aprovados sem análise pelos revisores. Use-os apenas para:

- Serialização pura de dados (ex.: um transformer que produz uma string estável)
- Capturar regressões não intencionais em saída não visual

Para regressão visual de componente, use screenshots de Playwright / Cypress / Percy — diffs visuais reais, não diffs de DOM.

## Helpers de Setup de Teste

Encapsule os providers uma vez:

```tsx
function renderWithProviders(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ThemeProvider theme={lightTheme}>
        <Router>{ui}</Router>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}
```

Exporte de `test-utils.tsx` e use em todo lugar.

## Teste de Custom Hook

Use `renderHook` da RTL:

```tsx
import { renderHook, act } from "@testing-library/react";

test("useCounter increments", () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

- Sempre encapsule chamadas que mudam estado em `act`
- Sempre teste através da API pública do hook, não da implementação interna

## Asserts de Acessibilidade

```tsx
import { axe } from "vitest-axe";   // ou jest-axe

test("UserCard has no a11y violations", async () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Rode asserts do axe em testes de componente — capturam labels ausentes, uso indevido de ARIA, contraste de cor (limitado).

## Quando Recorrer a Playwright / Cypress

O teste de componente com RTL + JSDOM não consegue:

- Testar layout real (flexbox, grid, renderização dependente de viewport)
- Testar scroll, drag-and-drop, colar da área de transferência
- Testar animação nativa do navegador, transições CSS
- Testar interações entre frames (iframes, popups)

Para isso, use Playwright Component Testing ou execuções end-to-end de Playwright/Cypress. Veja a [skill e2e-testing](../../skills/e2e-testing/SKILL.md).

## Metas de Cobertura

| Camada | Meta |
|---|---|
| Funções utilitárias puras | ≥90% |
| Custom hooks | ≥85% |
| Componentes (de apresentação) | ≥80% — comportamento, não linhas |
| Componentes container | ≥70% — caminhos felizes + estados de erro |
| Páginas (E2E coberto separadamente) | Mínimo de um smoke test por rota |

## Antipadrões

- Fazer assert em `container.querySelector` — contorna as consultas de acessibilidade
- Fazer assert no número de renderizações — detalhe de implementação
- Mockar hooks do React (`jest.mock("react", ...)`) — refatore o componente em vez disso
- Mockar componentes filhos por padrão — testa a integração, não o pai isoladamente
- Avisos de `act()` manuais ignorados — eles indicam bugs reais

## Referência de Skill

Veja `skills/react-testing/SKILL.md` para exemplos de testes end-to-end, padrões de MSW e scaffolding de testes de acessibilidade.
