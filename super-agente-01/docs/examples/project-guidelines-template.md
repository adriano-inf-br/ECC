# Template de Diretrizes de Projeto

Este é um template de skill específico de projeto que foi enviado anteriormente como uma skill ECC ativa.

Agora reside em `docs/examples/` porque é material de referência, não uma skill reutilizável entre projetos.

Este é um exemplo de uma skill específica de projeto. Use este template para seus próprios projetos.

Baseado em uma aplicação real de produção: [Zenith](https://zenith.chat) - plataforma de descoberta de clientes com IA.

## Quando Usar

Referencie esta skill ao trabalhar no projeto específico para o qual ela foi projetada. Skills de projeto contêm:
- Visão geral da arquitetura
- Estrutura de arquivos
- Padrões de código
- Requisitos de teste
- Fluxo de trabalho de implantação

---

## Visão Geral da Arquitetura

**Stack Tecnológico:**
- **Frontend**: Next.js 15 (App Router), TypeScript, React
- **Backend**: FastAPI (Python), modelos Pydantic
- **Banco de dados**: Supabase (PostgreSQL)
- **IA**: Claude API com chamadas de ferramentas e saída estruturada
- **Implantação**: Google Cloud Run
- **Testes**: Playwright (E2E), pytest (backend), React Testing Library

**Serviços:**
```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Next.js 15 + TypeScript + TailwindCSS                     │
│  Implantado: Vercel / Cloud Run                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  FastAPI + Python 3.11 + Pydantic                          │
│  Implantado: Cloud Run                                     │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐
        │ Supabase │   │  Claude  │   │  Redis   │
        │ Database │   │   API    │   │  Cache   │
        └──────────┘   └──────────┘   └──────────┘
```

---

## Estrutura de Arquivos

```
project/
├── frontend/
│   └── src/
│       ├── app/              # Páginas do app router do Next.js
│       │   ├── api/          # Rotas de API
│       │   ├── (auth)/       # Rotas protegidas por autenticação
│       │   └── workspace/    # Workspace principal do app
│       ├── components/       # Componentes React
│       │   ├── ui/           # Componentes de UI base
│       │   ├── forms/        # Componentes de formulário
│       │   └── layouts/      # Componentes de layout
│       ├── hooks/            # Hooks React personalizados
│       ├── lib/              # Utilitários
│       ├── types/            # Definições TypeScript
│       └── config/           # Configuração
│
├── backend/
│   ├── routers/              # Handlers de rota FastAPI
│   ├── models.py             # Modelos Pydantic
│   ├── main.py               # Ponto de entrada do app FastAPI
│   ├── auth_system.py        # Autenticação
│   ├── database.py           # Operações de banco de dados
│   ├── services/             # Lógica de negócio
│   └── tests/                # Testes pytest
│
├── deploy/                   # Configurações de implantação
├── docs/                     # Documentação
└── scripts/                  # Scripts utilitários
```

---

## Padrões de Código

### Formato de Resposta da API (FastAPI)

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Optional

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    success: bool
    data: Optional[T] = None
    error: Optional[str] = None

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(success=True, data=data)

    @classmethod
    def fail(cls, error: str) -> "ApiResponse[T]":
        return cls(success=False, error=error)
```

### Chamadas de API no Frontend (TypeScript)

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    return { success: false, error: String(error) }
  }
}
```

### Integração com IA Claude (Saída Estruturada)

```python
from anthropic import Anthropic
from pydantic import BaseModel

class AnalysisResult(BaseModel):
    summary: str
    key_points: list[str]
    confidence: float

async def analyze_with_claude(content: str) -> AnalysisResult:
    client = Anthropic()

    response = client.messages.create(
        model="claude-sonnet-4-5-20250514",
        max_tokens=1024,
        messages=[{"role": "user", "content": content}],
        tools=[{
            "name": "provide_analysis",
            "description": "Provide structured analysis",
            "input_schema": AnalysisResult.model_json_schema()
        }],
        tool_choice={"type": "tool", "name": "provide_analysis"}
    )

    # Extrair resultado do uso de ferramenta
    tool_use = next(
        block for block in response.content
        if block.type == "tool_use"
    )

    return AnalysisResult(**tool_use.input)
```

### Hooks Personalizados (React)

```typescript
import { useState, useCallback } from 'react'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  fetchFn: () => Promise<ApiResponse<T>>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const result = await fetchFn()

    if (result.success) {
      setState({ data: result.data!, loading: false, error: null })
    } else {
      setState({ data: null, loading: false, error: result.error! })
    }
  }, [fetchFn])

  return { ...state, execute }
}
```

---

## Requisitos de Teste

### Backend (pytest)

```bash
# Executar todos os testes
poetry run pytest tests/

# Executar com cobertura
poetry run pytest tests/ --cov=. --cov-report=html

# Executar arquivo de teste específico
poetry run pytest tests/test_auth.py -v
```

**Estrutura de teste:**
```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

### Frontend (React Testing Library)

```bash
# Executar testes
npm run test

# Executar com cobertura
npm run test -- --coverage

# Executar testes E2E
npm run test:e2e
```

**Estrutura de teste:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkspacePanel } from './WorkspacePanel'

describe('WorkspacePanel', () => {
  it('renderiza o workspace corretamente', () => {
    render(<WorkspacePanel />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('lida com a criação de sessão', async () => {
    render(<WorkspacePanel />)
    fireEvent.click(screen.getByText('New Session'))
    expect(await screen.findByText('Session created')).toBeInTheDocument()
  })
})
```

---

## Fluxo de Trabalho de Implantação

### Lista de Verificação Pré-Implantação

- [ ] Todos os testes passando localmente
- [ ] `npm run build` bem-sucedido (frontend)
- [ ] `poetry run pytest` passa (backend)
- [ ] Sem segredos embutidos no código
- [ ] Variáveis de ambiente documentadas
- [ ] Migrações de banco de dados prontas

### Comandos de Implantação

```bash
# Build e implantação do frontend
cd frontend && npm run build
gcloud run deploy frontend --source .

# Build e implantação do backend
cd backend
gcloud run deploy backend --source .
```

### Variáveis de Ambiente

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Backend (.env)
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
```

---

## Regras Críticas

1. **Sem emojis** em código, comentários ou documentação
2. **Imutabilidade** - nunca mute objetos ou arrays
3. **TDD** - escreva testes antes da implementação
4. **80% de cobertura** mínima
5. **Muitos arquivos pequenos** - 200-400 linhas típico, 800 máximo
6. **Sem console.log** em código de produção
7. **Tratamento adequado de erros** com try/catch
8. **Validação de entrada** com Pydantic/Zod

---

## Skills Relacionadas

- `coding-standards.md` - Melhores práticas gerais de codificação
- `backend-patterns.md` - Padrões de API e banco de dados
- `frontend-patterns.md` - Padrões de React e Next.js
- `tdd-workflow/` - Metodologia de desenvolvimento orientado a testes
