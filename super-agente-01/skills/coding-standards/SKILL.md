---
name: coding-standards
description: Convenções de código de baseline aplicáveis entre projetos para nomenclatura, legibilidade, imutabilidade e revisão de qualidade de código. Use as skills detalhadas de frontend ou backend para padrões específicos de framework.
metadata:
  origin: ECC
---

# Coding Standards & Best Practices

Convenções de código de baseline aplicáveis entre projetos.

Esta skill é o piso compartilhado, não o playbook detalhado de framework.

- Use `frontend-patterns` para React, estado, formulários, renderização e arquitetura de UI.
- Use `backend-patterns` ou `api-design` para camadas de repository/service, design de endpoints, validação e preocupações específicas de servidor.
- Use `rules/common/coding-style.md` quando precisar da camada de regra reutilizável mais curta em vez de um passo a passo completo de skill.

## When to Activate

- Iniciar um novo projeto ou módulo
- Revisar código para qualidade e manutenibilidade
- Refatorar código existente para seguir as convenções
- Impor consistência de nomenclatura, formatação ou estrutura
- Configurar regras de linting, formatação ou checagem de tipos
- Fazer o onboarding de novos contribuidores nas convenções de código

## Limites de Escopo

Ative esta skill para:
- nomenclatura descritiva
- imutabilidade por padrão
- imposição de legibilidade, KISS, DRY e YAGNI
- expectativas de tratamento de erros e revisão de code smells

Não use esta skill como fonte primária para:
- composição React, hooks ou padrões de renderização
- arquitetura de backend, design de API ou camadas de banco de dados
- orientação específica de domínio de framework quando já existe uma skill ECC mais especializada

## Princípios de Qualidade de Código

### 1. Legibilidade em Primeiro Lugar
- Código é mais lido do que escrito
- Nomes claros de variáveis e funções
- Código autodocumentado preferível a comentários
- Formatação consistente

### 2. KISS (Keep It Simple, Stupid)
- A solução mais simples que funciona
- Evite over-engineering
- Sem otimização prematura
- Fácil de entender > código esperto

### 3. DRY (Don't Repeat Yourself)
- Extraia lógica comum para funções
- Crie componentes reutilizáveis
- Compartilhe utilitários entre módulos
- Evite programação por copiar e colar

### 4. YAGNI (You Aren't Gonna Need It)
- Não construa features antes de serem necessárias
- Evite generalidade especulativa
- Adicione complexidade apenas quando necessário
- Comece simples, refatore quando preciso

## TypeScript/JavaScript Standards

### Nomenclatura de Variáveis

```typescript
// PASS: BOM: Nomes descritivos
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// FAIL: RUIM: Nomes pouco claros
const q = 'election'
const flag = true
const x = 1000
```

### Nomenclatura de Funções

```typescript
// PASS: BOM: Padrão verbo-substantivo
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// FAIL: RUIM: Pouco claro ou apenas substantivo
async function market(id: string) { }
function similarity(a, b) { }
function email(e) { }
```

### Padrão de Imutabilidade (CRÍTICO)

```typescript
// PASS: SEMPRE use o spread operator
const updatedUser = {
  ...user,
  name: 'New Name'
}

const updatedArray = [...items, newItem]

// FAIL: NUNCA mute diretamente
user.name = 'New Name'  // RUIM
items.push(newItem)     // RUIM
```

### Tratamento de Erros

```typescript
// PASS: BOM: Tratamento de erros abrangente
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}

// FAIL: RUIM: Sem tratamento de erros
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}
```

### Boas Práticas de Async/Await

```typescript
// PASS: BOM: Execução em paralelo quando possível
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// FAIL: RUIM: Sequencial quando desnecessário
const users = await fetchUsers()
const markets = await fetchMarkets()
const stats = await fetchStats()
```

### Type Safety

```typescript
// PASS: BOM: Tipos apropriados
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
  created_at: Date
}

function getMarket(id: string): Promise<Market> {
  // Implementação
}

// FAIL: RUIM: Usando 'any'
function getMarket(id: any): Promise<any> {
  // Implementação
}
```

## React Best Practices

### Estrutura de Componente

```typescript
// PASS: BOM: Componente funcional com tipos
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant}`}
    >
      {children}
    </button>
  )
}

// FAIL: RUIM: Sem tipos, estrutura pouco clara
export function Button(props) {
  return <button onClick={props.onClick}>{props.children}</button>
}
```

### Custom Hooks

```typescript
// PASS: BOM: Custom hook reutilizável
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Uso
const debouncedQuery = useDebounce(searchQuery, 500)
```

### Gerenciamento de Estado

```typescript
// PASS: BOM: Atualizações de estado apropriadas
const [count, setCount] = useState(0)

// Atualização funcional para estado baseado no estado anterior
setCount(prev => prev + 1)

// FAIL: RUIM: Referência direta ao estado
setCount(count + 1)  // Pode ficar obsoleto em cenários assíncronos
```

### Renderização Condicional

```typescript
// PASS: BOM: Renderização condicional clara
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// FAIL: RUIM: Inferno de ternários
{isLoading ? <Spinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## API Design Standards

### Convenções de REST API

```
GET    /api/markets              # Listar todos os markets
GET    /api/markets/:id          # Obter um market específico
POST   /api/markets              # Criar um novo market
PUT    /api/markets/:id          # Atualizar market (completo)
PATCH  /api/markets/:id          # Atualizar market (parcial)
DELETE /api/markets/:id          # Excluir market

# Parâmetros de query para filtragem
GET /api/markets?status=active&limit=10&offset=0
```

### Formato de Resposta

```typescript
// PASS: BOM: Estrutura de resposta consistente
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

// Resposta de sucesso
return NextResponse.json({
  success: true,
  data: markets,
  meta: { total: 100, page: 1, limit: 10 }
})

// Resposta de erro
return NextResponse.json({
  success: false,
  error: 'Invalid request'
}, { status: 400 })
```

### Validação de Entrada

```typescript
import { z } from 'zod'

// PASS: BOM: Validação por schema
const CreateMarketSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  endDate: z.string().datetime(),
  categories: z.array(z.string()).min(1)
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    const validated = CreateMarketSchema.parse(body)
    // Prosseguir com os dados validados
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
  }
}
```

## Organização de Arquivos

### Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # rotas de API
│   ├── markets/           # páginas de markets
│   └── (auth)/           # páginas de auth (route groups)
├── components/            # componentes React
│   ├── ui/               # componentes de UI genéricos
│   ├── forms/            # componentes de formulário
│   └── layouts/          # componentes de layout
├── hooks/                # custom hooks React
├── lib/                  # utilitários e configs
│   ├── api/             # clientes de API
│   ├── utils/           # funções auxiliares
│   └── constants/       # constantes
├── types/                # tipos TypeScript
└── styles/              # estilos globais
```

### Nomenclatura de Arquivos

```
components/Button.tsx          # PascalCase para componentes
hooks/useAuth.ts              # camelCase com prefixo 'use'
lib/formatDate.ts             # camelCase para utilitários
types/market.types.ts         # camelCase com sufixo .types
```

## Comments & Documentation

### Quando Comentar

```typescript
// PASS: BOM: Explique o PORQUÊ, não o O QUÊ
// Use backoff exponencial para evitar sobrecarregar a API durante quedas
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// Usando mutação deliberadamente aqui por performance com arrays grandes
items.push(newItem)

// FAIL: RUIM: Afirmar o óbvio
// Incrementa o contador em 1
count++

// Define name como o nome do usuário
name = user.name
```

### JSDoc para APIs Públicas

```typescript
/**
 * Pesquisa markets usando similaridade semântica.
 *
 * @param query - Consulta de pesquisa em linguagem natural
 * @param limit - Número máximo de resultados (padrão: 10)
 * @returns Array de markets ordenados por pontuação de similaridade
 * @throws {Error} Se a API da OpenAI falhar ou o Redis estiver indisponível
 *
 * @example
 * ```typescript
 * const results = await searchMarkets('election', 5)
 * console.log(results[0].name) // "Trump vs Biden"
 * ```
 */
export async function searchMarkets(
  query: string,
  limit: number = 10
): Promise<Market[]> {
  // Implementação
}
```

## Boas Práticas de Performance

### Memoização

```typescript
import { useMemo, useCallback } from 'react'

// PASS: BOM: Memoize computações caras
// Copie antes de ordenar - Array.prototype.sort muta in place
const sortedMarkets = useMemo(() => {
  return [...markets].sort((a, b) => b.volume - a.volume)
}, [markets])

// PASS: BOM: Memoize callbacks
const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])
```

### Lazy Loading

```typescript
import { lazy, Suspense } from 'react'

// PASS: BOM: Faça lazy load de componentes pesados
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyChart />
    </Suspense>
  )
}
```

### Consultas de Banco de Dados

```typescript
// PASS: BOM: Selecione apenas as colunas necessárias
const { data } = await supabase
  .from('markets')
  .select('id, name, status')
  .limit(10)

// FAIL: RUIM: Selecionar tudo
const { data } = await supabase
  .from('markets')
  .select('*')
```

## Testing Standards

### Estrutura de Teste (Padrão AAA)

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Nomenclatura de Testes

```typescript
// PASS: BOM: Nomes de teste descritivos
test('returns empty array when no markets match query', () => { })
test('throws error when OpenAI API key is missing', () => { })
test('falls back to substring search when Redis unavailable', () => { })

// FAIL: RUIM: Nomes de teste vagos
test('works', () => { })
test('test search', () => { })
```

## Detecção de Code Smells

Fique atento a estes anti-patterns:

### 1. Funções Longas
```typescript
// FAIL: RUIM: Função > 50 linhas
function processMarketData() {
  // 100 linhas de código
}

// PASS: BOM: Dividir em funções menores
function processMarketData() {
  const validated = validateData()
  const transformed = transformData(validated)
  return saveData(transformed)
}
```

### 2. Aninhamento Profundo
```typescript
// FAIL: RUIM: 5+ níveis de aninhamento
if (user) {
  if (user.isAdmin) {
    if (market) {
      if (market.isActive) {
        if (hasPermission) {
          // Fazer algo
        }
      }
    }
  }
}

// PASS: BOM: Retornos antecipados
if (!user) return
if (!user.isAdmin) return
if (!market) return
if (!market.isActive) return
if (!hasPermission) return

// Fazer algo
```

### 3. Números Mágicos
```typescript
// FAIL: RUIM: Números sem explicação
if (retryCount > 3) { }
setTimeout(callback, 500)

// PASS: BOM: Constantes nomeadas
const MAX_RETRIES = 3
const DEBOUNCE_DELAY_MS = 500

if (retryCount > MAX_RETRIES) { }
setTimeout(callback, DEBOUNCE_DELAY_MS)
```

**Lembre-se**: A qualidade do código não é negociável. Código claro e de fácil manutenção viabiliza desenvolvimento rápido e refatoração com confiança.
