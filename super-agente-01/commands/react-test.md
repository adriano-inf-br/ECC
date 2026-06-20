---
description: Imponha o fluxo de trabalho de TDD para React. Escreva primeiro os testes em React Testing Library (focados em comportamento, com prioridade em acessibilidade), depois implemente os componentes. Detecta Vitest ou Jest e verifica as metas de cobertura.
---

# Comando TDD do React

Este comando impõe o desenvolvimento orientado a testes para React usando React Testing Library mais Vitest ou Jest, detectados em runtime.

## O Que Este Comando Faz

1. **Definir a Assinatura do Componente**: Esboça o componente, o tipo de prop e os exports
2. **Escrever os Testes de Comportamento Primeiro**: Queries RTL (role-first), `userEvent`, MSW para rede — RED
3. **Executar os Testes**: Verifica se falham pelo motivo certo
4. **Implementar Código Mínimo**: Apenas o suficiente para passar — GREEN
5. **Refatorar**: Melhora mantendo os testes verdes
6. **Verificar a Cobertura**: Atinge as metas em [rules/react/testing.md](../rules/react/testing.md)

## Quando Usar

Use `/react-test` quando:

- Implementar um novo componente React ou hook customizado
- Adicionar cobertura de testes a um componente sem testes
- Corrigir um bug (escreva primeiro um teste que falha e que o reproduza)
- Construir formulários, máquinas de estado ou UI crítica de acessibilidade
- Ao se integrar ao fluxo de trabalho RTL + Vitest/Jest

## Ciclo de TDD

```
RED      -> Write failing test for the next behavior
GREEN    -> Implement minimal component code to pass
REFACTOR -> Improve component, tests stay green
REPEAT   -> Next behavior
```

## Detecção do Runner

```bash
test -f vitest.config.ts -o -f vitest.config.js -o -f vite.config.ts   # Vitest
grep -l '"jest"' package.json                                          # Jest
```

Prefira Vitest para novos projetos baseados em Vite; respeite o Jest em configurações existentes.

## Exemplo de Sessão

````text
User: /react-test I need a SearchInput component with debounced search

Agent:
# TDD Session: SearchInput

## Step 1: Define Signature

```tsx
// src/components/SearchInput.tsx
type Props = {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
};

export function SearchInput({ onSearch, placeholder, debounceMs }: Props) {
  throw new Error("not implemented");
}
```

## Step 2: Write Behavior Tests (RED)

```tsx
// src/components/SearchInput.test.tsx
import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  test("renders with placeholder", () => {
    render(<SearchInput onSearch={() => {}} placeholder="Search users" />);
    expect(screen.getByPlaceholderText("Search users")).toBeInTheDocument();
  });

  test("calls onSearch after typing", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);

    await user.type(screen.getByRole("textbox"), "alice");

    expect(onSearch).not.toHaveBeenCalled();        // before debounce
    vi.advanceTimersByTime(300);
    expect(onSearch).toHaveBeenCalledWith("alice"); // after debounce

    vi.useRealTimers();
  });

  test("does not call onSearch when typing pauses then continues", async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<SearchInput onSearch={onSearch} debounceMs={300} />);

    await user.type(screen.getByRole("textbox"), "ali");
    vi.advanceTimersByTime(200);                    // mid-debounce
    await user.type(screen.getByRole("textbox"), "ce");
    vi.advanceTimersByTime(300);

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("alice");

    vi.useRealTimers();
  });

  test("is keyboard reachable and accessible", () => {
    render(<SearchInput onSearch={() => {}} />);
    const input = screen.getByRole("textbox");
    input.focus();
    expect(input).toHaveFocus();
  });
});
```

## Step 3: Run Tests — Verify FAIL

```bash
$ vitest run src/components/SearchInput.test.tsx

× src/components/SearchInput.test.tsx (4 tests) ✘ Error: not implemented
```

✓ Tests fail as expected.

## Step 4: Implement Minimal Code (GREEN)

```tsx
import { useEffect, useState } from "react";

export function SearchInput({ onSearch, placeholder, debounceMs = 300 }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => onSearch(query), debounceMs);
    return () => clearTimeout(id);
  }, [query, onSearch, debounceMs]);

  return (
    <input
      type="text"
      value={query}
      placeholder={placeholder}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}
```

## Step 5: Run Tests — Verify PASS

```bash
$ vitest run src/components/SearchInput.test.tsx

✓ src/components/SearchInput.test.tsx (4 tests) 47ms
```

## Step 6: Coverage

```bash
$ vitest run --coverage src/components/SearchInput.test.tsx

% Stmts: 100  % Branch: 100  % Funcs: 100  % Lines: 100
```

## TDD Complete!
````

## Padrões de Teste

### Comportamento, não implementação

Use `getByRole`, `getByLabelText`, `getByText`. Evite `container.querySelector` e fazer asserções sobre o estado do componente.

### `userEvent.setup()` por teste

```tsx
const user = userEvent.setup();
await user.click(screen.getByRole("button", { name: /save/i }));
```

### MSW para rede

```tsx
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

server.use(http.post("/api/users", () => HttpResponse.json({ id: "1" }, { status: 201 })));
```

### Hooks customizados

```tsx
const { result } = renderHook(() => useCounter(0));
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

### Acessibilidade

```tsx
import { axe } from "vitest-axe";
expect(await axe(container)).toHaveNoViolations();
```

## Metas de Cobertura

| Camada | Meta |
|---|---|
| Utilitários puros | >=90% |
| Hooks customizados | >=85% |
| Componentes de apresentação | >=80% |
| Componentes container | >=70% |
| Páginas | Cobertas separadamente por E2E |

Configure em `vitest.config.ts` / `jest.config.js` para impor os limiares no CI.

## Antipadrões a Evitar

- `container.querySelector(...)` — contorna as queries de acessibilidade
- Fazer asserção sobre a contagem de renderizações
- Mockar o próprio `react` (`jest.mock("react", ...)`)
- Mockar componentes filhos por padrão (mocke apenas quando o filho tem efeitos colaterais pesados)
- Ignorar avisos de `act()` — eles sinalizam bugs reais
- Testes de snapshot de componentes renderizados (frágeis, aprovados sem critério) — use diff visual do Playwright/Cypress no lugar

## Comandos de Teste

```bash
# Vitest
vitest                              # watch
vitest run                          # one-shot
vitest run --coverage               # with coverage
vitest run path/to/file.test.tsx    # single file

# Jest
jest --watch
jest --coverage
jest path/to/file.test.tsx

# CI mode
CI=true vitest run --coverage
```

## Comandos Relacionados

- `/react-build` — corrija erros de build antes de rodar os testes
- `/react-review` — revise após a implementação
- skill `verification-loop` — laço completo de verificação

## Relacionados

- Skills: `skills/react-testing/`, `skills/tdd-workflow/`, `skills/accessibility/`, `skills/e2e-testing/`
- Rules: `rules/react/testing.md`
- Agents: `react-reviewer` (revisa a qualidade dos testes), `tdd-guide` (impõe o processo de TDD)
