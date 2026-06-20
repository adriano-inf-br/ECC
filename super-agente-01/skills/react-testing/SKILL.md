---
name: react-testing
description: Testes de componentes React com React Testing Library, Vitest/Jest, MSW para mock de rede, asserções de acessibilidade com axe, e a fronteira de decisão entre testes de componentes e execuções end-to-end com Playwright/Cypress. Use ao escrever ou corrigir testes para componentes React, hooks ou páginas.
metadata:
  origin: ECC
---

# Testes React

Padrões abrangentes de testes React para testes de componentes focados em comportamento, testes de hooks customizados, asserções de acessibilidade e mock em nível de rede.

## Quando Ativar

- Escrevendo testes para componentes React, hooks customizados ou páginas
- Adicionando cobertura de testes a componentes legados não testados
- Migrando do Enzyme ou padrões de era de componentes de classe para React Testing Library
- Configurando Vitest ou Jest para um novo projeto React
- Mockando requisições HTTP em testes
- Verificando violações de acessibilidade
- Decidindo quais testes pertencem ao RTL vs Playwright Component Testing vs E2E completo

## Princípio Fundamental

Teste o que o usuário vê e faz, não detalhes de implementação.

Um teste deve:

- Renderizar o componente com os mesmos providers que ele tem em produção
- Interagir com ele via queries acessíveis (role, label) e `userEvent`
- Verificar saída visível e efeitos colaterais observáveis (callback disparado, requisição enviada)

Um teste NÃO deve:

- Inspecionar o estado do componente, props passadas aos filhos ou quais hooks foram chamados
- Mockar o próprio React ou hooks de framework
- Verificar o número de renders ou estrutura DOM além do que afeta os usuários

## Escolha de Biblioteca

| Runner | Quando | Observação |
|---|---|---|
| **Vitest** | Vite, Remix, setups modernos | Mais rápido, ESM nativo, API compatível com Jest |
| **Jest** | Next.js, CRA, repositórios estabelecidos | Padrão para muitos projetos React |
| **Playwright Component Testing** | Motor de browser real necessário | Use quando JSDOM não tem o recurso necessário |
| **Cypress Component Testing** | Browser real, Cypress já em uso | Alternativa ao Playwright CT |

Escolha um. Não execute RTL + Vitest E Playwright CT no mesmo repositório sem uma separação clara de escopo.

## Prioridade de Query

React Testing Library expõe queries em três camadas — use de cima para baixo:

1. **Acessível a todos**: `getByRole`, `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`
2. **Semântica**: `getByAltText`, `getByTitle`
3. **Test IDs (escape hatch)**: `getByTestId`

```tsx
// Melhor
screen.getByRole("button", { name: /salvar/i });

// OK para inputs
screen.getByLabelText("Email");

// Último recurso
screen.getByTestId("save-btn");
```

Variantes:

- `getBy*` — lança erro se não encontrar correspondência
- `queryBy*` — retorna `null` (use para "verificar ausência")
- `findBy*` — assíncrono, retorna uma Promise (use para elementos que aparecem após trabalho assíncrono)

## Interação do Usuário com `userEvent`

```tsx
import userEvent from "@testing-library/user-event";

test("envia o formulário", async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<UserForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText("Email"), "user@example.com");
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  expect(onSubmit).toHaveBeenCalledWith({ email: "user@example.com" });
});
```

- Sempre `await` chamadas de userEvent
- Chame `userEvent.setup()` uma vez por teste, reutilize o `user` retornado
- `userEvent` simula uma sequência real de browser; `fireEvent` despacha um único evento sintético — prefira `userEvent`

## Padrões Assíncronos

```tsx
// Elemento que aparece após trabalho assíncrono
expect(await screen.findByText("Carregado")).toBeInTheDocument();

// Asserção de efeito colateral
await waitFor(() => expect(saveSpy).toHaveBeenCalled());

// Elemento que deve desaparecer
await waitForElementToBeRemoved(() => screen.queryByText("Carregando"));
```

Nunca `setTimeout` + asserção — instável. Use os matchers acima.

## Mock de Rede com MSW

Mock Service Worker faz mock na camada de rede. O componente, hooks e biblioteca de fetch se comportam exatamente como em produção.

### Configuração

```ts
// test/setup.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users/:id", ({ params }) =>
    HttpResponse.json({ id: params.id, name: "Alice" }),
  ),
  http.post("/api/users", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "new-id", ...body }, { status: 201 });
  }),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Configure `onUnhandledRequest: "error"` para que qualquer requisição não mockada falhe o teste de forma explícita — passes silenciosos são piores que erros visíveis.

### Sobrescrita por teste

```tsx
test("renderiza erro no 500", async () => {
  server.use(
    http.get("/api/users/:id", () => new HttpResponse(null, { status: 500 })),
  );
  render(<UserPage id="1" />);
  expect(await screen.findByText(/algo deu errado/i)).toBeInTheDocument();
});
```

## Envolvimento de Providers

Envolva providers uma vez em um `test-utils.tsx`:

```tsx
// test-utils.tsx
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions,
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>{ui}</MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
    options,
  );
}

export * from "@testing-library/react";
```

Depois `import { renderWithProviders, screen } from "test-utils"` em cada arquivo de teste.

## Testes de Hook Customizado

```tsx
import { renderHook, act } from "@testing-library/react";

test("useCounter incrementa e decrementa", () => {
  const { result } = renderHook(() => useCounter(0));

  expect(result.current.count).toBe(0);

  act(() => result.current.increment());
  expect(result.current.count).toBe(1);

  act(() => result.current.decrement());
  expect(result.current.count).toBe(0);
});

test("useCounter aceita valor inicial", () => {
  const { result } = renderHook(() => useCounter(10));
  expect(result.current.count).toBe(10);
});

test("useUser busca dados do usuário", async () => {
  // Instancie o QueryClient UMA VEZ por teste fora do wrapper para que sobreviva a re-renders.
  // Criá-lo dentro do closure do wrapper reseta o estado do cache em cada render, produzindo testes instáveis.
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const { result } = renderHook(() => useUser("1"), { wrapper });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toEqual({ id: "1", name: "Alice" });
});
```

- Envolva chamadas que alteram estado em `act`
- Teste apenas através da API pública do hook
- Para hooks que usam contexto, passe um `wrapper`

## Asserções de Acessibilidade

```tsx
import { axe, toHaveNoViolations } from "jest-axe"; // ou vitest-axe
expect.extend(toHaveNoViolations);

test("UserCard não tem violações de a11y", async () => {
  const { container } = render(<UserCard user={mockUser} />);
  expect(await axe(container)).toHaveNoViolations();
});
```

Execute axe em testes de componentes para cada componente interativo. Captura:

- Labels ausentes em inputs de formulário
- Uso inválido de ARIA
- Contraste de cor ruim (limitado — JSDOM não tem motor CSS real, então funciona apenas para estilos inline; contraste visual pertence ao Playwright)
- Texto alternativo ausente em imagens
- Violações de ordem de headings

Link cruzado: [skills/accessibility/SKILL.md](../accessibility/SKILL.md) para o manual de testes de a11y mais amplo.

## Quando NÃO Usar Testes de Snapshot

Snapshots da saída renderizada:

- Quebram em cada mudança de estilo
- São aprovados sem análise durante a revisão
- Testam detalhes de implementação (estrutura DOM), não comportamento

Usos aceitáveis de snapshot:

- Funções de serialização de dados puros (`formatInvoice(invoice)` -> string estável)
- Arquivos de configuração gerados (ex.: saída de configuração do webpack)

Para regressão visual em componentes, use screenshots do Playwright/Cypress ou Percy/Chromatic — diffs visuais reais, não strings DOM.

## Quando Usar Playwright / Cypress

JSDOM (usado por Vitest/Jest) não consegue:

- Renderizar layout real (flexbox, grid, consultas de viewport)
- Executar animações nativas de browser, transições CSS
- Testar comportamento de scroll, arrastar e soltar, colar da área de transferência
- Lidar com iframes, popups, downloads, fluxos cross-origin
- Executar rede real em ambiente controlado com suporte completo ao DevTools

Para qualquer um desses, use Playwright Component Testing (teste de componente em browser real) ou E2E completo. Veja [skill e2e-testing](../e2e-testing/SKILL.md).

Fronteira de decisão:

- Um hook, um componente presentacional, um formulário com lógica -> RTL
- Um componente cujo layout importa ou que usa APIs de browser não disponíveis no JSDOM -> Playwright CT
- Um fluxo de usuário completo através de múltiplas páginas -> Playwright/Cypress E2E

## Metas de Cobertura

| Camada | Meta |
|---|---|
| Utilitários puros | >=90% |
| Hooks customizados | >=85% |
| Componentes presentacionais | >=80% — comportamento, não linhas |
| Componentes container | >=70% — caminhos principais + estados de erro |
| Páginas | Coberto por E2E separadamente; mínimo de smoke test |

Configure via `vitest.config.ts` / `jest.config.js`:

```ts
// vitest.config.ts
test: {
  coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    thresholds: {
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
}
```

## Anti-Padrões

- `container.querySelector("...")` — ignora queries de acessibilidade, permite que testes passem quando usuários reais falhariam
- Verificar o número de renders — detalhe de implementação
- `jest.mock("react", ...)` — nunca mocke o React. Refatore o componente
- Mockar componentes filhos por padrão — testa a integração, não o isolamento. Mocke apenas quando o filho tem efeitos colaterais pesados
- Ignorar avisos de `act()` — eles sinalizam bugs reais (atualização de estado após desmontagem, wrapping assíncrono ausente)
- Compartilhar estado mutável entre testes — instável quando a ordem dos testes muda
- Testes que passam com `it.skip()` removido — seu teste não verifica realmente o que você pensa

## Fluxo de Trabalho TDD

```
RED     -> Escreva um teste falhando para o próximo requisito
GREEN   -> Escreva código mínimo do componente para passar
REFACTOR -> Melhore o componente, os testes permanecem verdes
REPEAT  -> Próximo requisito
```

Para novos componentes:

1. Defina o tipo de prop e a assinatura do componente
2. Escreva o primeiro teste para o caso mais simples
3. Verifique se ele falha pelo motivo certo
4. Implemente apenas o suficiente para passar
5. Adicione o próximo caso de teste
6. Refatore quando o terceiro teste similar revelar um padrão

## Comandos de Teste

```bash
# Vitest
vitest                            # watch
vitest run                        # execução única
vitest run --coverage             # com cobertura
vitest run path/to/file.test.tsx  # arquivo único

# Jest
jest --watch
jest --coverage
jest path/to/file.test.tsx

# Modo CI
CI=true vitest run --coverage
```

## Relacionados

- Rules: [rules/react/testing.md](../../rules/react/testing.md)
- Skills: [react-patterns](../react-patterns/SKILL.md), [accessibility](../accessibility/SKILL.md), [e2e-testing](../e2e-testing/SKILL.md), [tdd-workflow](../tdd-workflow/SKILL.md)
- Agents: `react-reviewer` (revisa a qualidade dos testes durante a revisão de código), `tdd-guide` (aplica o processo TDD)
- Commands: `/react-test`, `/react-review`

## Exemplos

### Envio de formulário com MSW e userEvent

```tsx
test("envia formulário de usuário e mostra sucesso", async () => {
  server.use(
    http.post("/api/users", () =>
      HttpResponse.json({ id: "1", name: "Alice" }, { status: 201 }),
    ),
  );

  const user = userEvent.setup();
  renderWithProviders(<UserForm />);

  await user.type(screen.getByLabelText("Nome"), "Alice");
  await user.type(screen.getByLabelText("Email"), "alice@example.com");
  await user.click(screen.getByRole("button", { name: /salvar/i }));

  expect(await screen.findByText(/salvo com sucesso/i)).toBeInTheDocument();
});
```

### Testando um error boundary

```tsx
function Quebrado() {
  throw new Error("boom");
}

test("error boundary renderiza fallback", () => {
  // Suprima o console.error do React para o lançamento esperado, depois restaure para que
  // o spy não vaze entre testes e oculte erros reais em outros lugares.
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    render(
      <ErrorBoundary fallback={<div>Algo deu errado</div>}>
        <Quebrado />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Algo deu errado")).toBeInTheDocument();
  } finally {
    errorSpy.mockRestore();
  }
});
```

### Testando um limite Suspense

```tsx
test("mostra carregando e depois conteúdo", async () => {
  renderWithProviders(
    <Suspense fallback={<div>Carregando...</div>}>
      <UserDetail id="1" />
    </Suspense>,
  );

  expect(screen.getByText("Carregando...")).toBeInTheDocument();
  expect(await screen.findByText("Alice")).toBeInTheDocument();
});
```
