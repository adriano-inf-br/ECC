---
name: error-handling
description: Padrões para tratamento robusto de erros em TypeScript, Python e Go. Cobre erros tipados, error boundaries, retries, circuit breakers e mensagens de erro voltadas ao usuário.
metadata:
  origin: ECC
---

# Padrões de Tratamento de Erros

Padrões consistentes e robustos de tratamento de erros para aplicações em produção.

## Quando Ativar

- Projetar tipos de erro ou hierarquias de exceção para um novo módulo ou serviço
- Adicionar lógica de retry ou circuit breakers para dependências externas não confiáveis
- Revisar endpoints de API em busca de tratamento de erro ausente
- Implementar mensagens de erro e feedback voltados ao usuário
- Depurar falhas em cascata ou supressão silenciosa de erros

## Princípios Centrais

1. **Falhe rápido e de forma explícita** — exponha os erros no limite onde ocorrem; não os encubra
2. **Erros tipados em vez de mensagens em string** — erros são valores de primeira classe com estrutura
3. **Mensagens para o usuário ≠ mensagens para o desenvolvedor** — mostre texto amigável aos usuários, registre o contexto completo no servidor
4. **Nunca suprima erros silenciosamente** — todo bloco `catch` deve tratar, relançar ou registrar
5. **Erros fazem parte do contrato da sua API** — documente todo código de erro que um cliente possa receber

## TypeScript / JavaScript

### Classes de Erro Tipadas

```typescript
// Define uma hierarquia de erros para o seu domínio
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = this.constructor.name
    // Mantém a cadeia de prototypes correta em JavaScript ES5 transpilado.
    // Necessário para que verificações `instanceof` (ex.: `error instanceof NotFoundError`)
    // funcionem corretamente ao estender a classe Error nativa.
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: { field: string; message: string }[]) {
    super(message, 'VALIDATION_ERROR', 422, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(reason = 'Authentication required') {
    super(reason, 'UNAUTHORIZED', 401)
  }
}

export class RateLimitError extends AppError {
  constructor(public readonly retryAfterMs: number) {
    super('Rate limit exceeded', 'RATE_LIMITED', 429)
  }
}
```

### Padrão Result (estilo sem throw)

Para operações em que a falha é esperada e comum (parsing, chamadas externas):

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }

function ok<T>(value: T): Result<T> {
  return { ok: true, value }
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

// Uso
async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.users.findUnique({ where: { id } })
    if (!user) return err(new NotFoundError('User', id))
    return ok(user)
  } catch (e) {
    return err(new AppError('Database error', 'DB_ERROR'))
  }
}

const result = await fetchUser('abc-123')
if (!result.ok) {
  // O TypeScript reconhece result.error aqui
  logger.error('Failed to fetch user', { error: result.error })
  return
}
// O TypeScript reconhece result.value aqui
console.log(result.value.email)
```

### Handler de Erro de API (Next.js / Express)

```typescript
import { NextRequest, NextResponse } from 'next/server'

function handleApiError(error: unknown): NextResponse {
  // Erro de aplicação conhecido
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.statusCode },
    )
  }

  // Erro de validação do Zod
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: error.issues.map(i => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
      },
      { status: 422 },
    )
  }

  // Erro inesperado — registre os detalhes, retorne mensagem genérica
  console.error('Unexpected error:', error)
  return NextResponse.json(
    { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
    { status: 500 },
  )
}

export async function POST(req: NextRequest) {
  try {
    // ... lógica do handler
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Error Boundary do React

```typescript
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info)
    console.error('Erro não tratado do React:', error, info)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

// Uso
<ErrorBoundary fallback={<p>Algo deu errado. Por favor, atualize a página.</p>}>
  <MyComponent />
</ErrorBoundary>
```

## Python

### Hierarquia de Exceções Personalizada

```python
class AppError(Exception):
    """Erro base da aplicação."""
    def __init__(self, message: str, code: str, status_code: int = 500):
        super().__init__(message)
        self.code = code
        self.status_code = status_code

class NotFoundError(AppError):
    def __init__(self, resource: str, id: str):
        super().__init__(f"{resource} not found: {id}", "NOT_FOUND", 404)

class ValidationError(AppError):
    def __init__(self, message: str, details: list[dict] | None = None):
        super().__init__(message, "VALIDATION_ERROR", 422)
        self.details = details or []
```

### Handler Global de Exceções do FastAPI

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": str(exc)}},
    )

@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception) -> JSONResponse:
    # Registra os detalhes completos, retorna mensagem genérica
    logger.exception("Unexpected error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "INTERNAL_ERROR", "message": "An unexpected error occurred"}},
    )
```

## Go

### Erros Sentinela e Encapsulamento de Erros

```go
package domain

import "errors"

// Erros sentinela para verificação de tipo
var (
    ErrNotFound    = errors.New("not found")
    ErrUnauthorized = errors.New("unauthorized")
    ErrConflict     = errors.New("conflict")
)

// Encapsula erros com contexto — nunca perca o original
func (r *UserRepository) FindByID(ctx context.Context, id string) (*User, error) {
    user, err := r.db.QueryRow(ctx, "SELECT * FROM users WHERE id = $1", id)
    if errors.Is(err, sql.ErrNoRows) {
        return nil, fmt.Errorf("user %s: %w", id, ErrNotFound)
    }
    if err != nil {
        return nil, fmt.Errorf("querying user %s: %w", id, err)
    }
    return user, nil
}

// No nível do handler, faça o unwrap para determinar a resposta
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(r.Context(), chi.URLParam(r, "id"))
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrNotFound):
            writeError(w, http.StatusNotFound, "not_found", err.Error())
        case errors.Is(err, domain.ErrUnauthorized):
            writeError(w, http.StatusForbidden, "forbidden", "Access denied")
        default:
            slog.Error("unexpected error", "err", err)
            writeError(w, http.StatusInternalServerError, "internal_error", "An unexpected error occurred")
        }
        return
    }
    writeJSON(w, http.StatusOK, user)
}
```

## Retry com Backoff Exponencial

```typescript
interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
  maxDelayMs?: number
  retryIf?: (error: unknown) => boolean
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelayMs = 500,
    maxDelayMs = 10_000,
    retryIf = () => true,
  } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts || !retryIf(error)) throw error

      const jitter = Math.random() * baseDelayMs
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1) + jitter, maxDelayMs)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// Uso: faça retry de erros transitórios de rede, não de 4xx
const data = await withRetry(() => fetch('/api/data').then(r => r.json()), {
  maxAttempts: 3,
  retryIf: (error) => !(error instanceof AppError && error.statusCode < 500),
})
```

## Mensagens de Erro Voltadas ao Usuário

Mapeie códigos de erro para mensagens legíveis por humanos. Mantenha detalhes técnicos fora do texto visível ao usuário.

```typescript
const USER_ERROR_MESSAGES: Record<string, string> = {
  NOT_FOUND: 'O item solicitado não pôde ser encontrado.',
  UNAUTHORIZED: 'Por favor, faça login para continuar.',
  FORBIDDEN: 'Você não tem permissão para fazer isso.',
  VALIDATION_ERROR: 'Por favor, verifique seus dados e tente novamente.',
  RATE_LIMITED: 'Muitas requisições. Por favor, aguarde um momento e tente novamente.',
  INTERNAL_ERROR: 'Algo deu errado do nosso lado. Por favor, tente novamente mais tarde.',
}

export function getUserMessage(code: string): string {
  return USER_ERROR_MESSAGES[code] ?? USER_ERROR_MESSAGES.INTERNAL_ERROR
}
```

## Error Handling Checklist

Before merging any code that touches error handling:

- [ ] Every `catch` block handles, re-throws, or logs — no silent swallowing
- [ ] API errors follow the standard envelope `{ error: { code, message } }`
- [ ] User-facing messages contain no stack traces or internal details
- [ ] Full error context is logged server-side
- [ ] Custom error classes extend a base `AppError` with a `code` field
- [ ] Async functions surface errors to callers — no fire-and-forget without fallback
- [ ] Retry logic only retries retriable errors (not 4xx client errors)
- [ ] React components are wrapped in `ErrorBoundary` for rendering errors
