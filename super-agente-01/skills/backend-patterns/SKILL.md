---
name: backend-patterns
description: Padrões de arquitetura de backend, design de API, otimização de banco de dados e melhores práticas server-side para Node.js, Express e API routes do Next.js.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento Backend

Padrões de arquitetura de backend e melhores práticas para aplicações server-side escaláveis.

## When to Activate

- Projetar endpoints de API REST ou GraphQL
- Implementar camadas de repository, service ou controller
- Otimizar queries de banco de dados (N+1, indexação, connection pooling)
- Adicionar cache (Redis, em memória, cabeçalhos de cache HTTP)
- Configurar background jobs ou processamento assíncrono
- Estruturar tratamento de erros e validação para APIs
- Construir middleware (auth, logging, rate limiting)

## Padrões de Design de API

### Estrutura de API RESTful

```typescript
// PASS: URLs baseadas em recursos
GET    /api/markets                 # Listar recursos
GET    /api/markets/:id             # Obter um único recurso
POST   /api/markets                 # Criar recurso
PUT    /api/markets/:id             # Substituir recurso
PATCH  /api/markets/:id             # Atualizar recurso
DELETE /api/markets/:id             # Excluir recurso

// PASS: Parâmetros de query para filtragem, ordenação, paginação
GET /api/markets?status=active&sort=volume&limit=20&offset=0
```

### Padrão Repository

```typescript
// Abstrai a lógica de acesso a dados
interface MarketRepository {
  findAll(filters?: MarketFilters): Promise<Market[]>
  findById(id: string): Promise<Market | null>
  create(data: CreateMarketDto): Promise<Market>
  update(id: string, data: UpdateMarketDto): Promise<Market>
  delete(id: string): Promise<void>
}

class SupabaseMarketRepository implements MarketRepository {
  async findAll(filters?: MarketFilters): Promise<Market[]> {
    let query = supabase.from('markets').select('*')

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data
  }

  // Outros métodos...
}
```

### Padrão de Camada de Service

```typescript
// Lógica de negócio separada do acesso a dados
class MarketService {
  constructor(private marketRepo: MarketRepository) {}

  async searchMarkets(query: string, limit: number = 10): Promise<Market[]> {
    // Lógica de negócio
    const embedding = await generateEmbedding(query)
    const results = await this.vectorSearch(embedding, limit)

    // Busca os dados completos
    const markets = await this.marketRepo.findByIds(results.map(r => r.id))

    // Ordena por similaridade
    return markets.sort((a, b) => {
      const scoreA = results.find(r => r.id === a.id)?.score || 0
      const scoreB = results.find(r => r.id === b.id)?.score || 0
      return scoreA - scoreB
    })
  }

  private async vectorSearch(embedding: number[], limit: number) {
    // Implementação da busca vetorial
  }
}
```

### Padrão Middleware

```typescript
// Pipeline de processamento de requisição/resposta
export function withAuth(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const user = await verifyToken(token)
      req.user = user
      return handler(req, res)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' })
    }
  }
}

// Uso
export default withAuth(async (req, res) => {
  // O handler tem acesso a req.user
})
```

## Padrões de Banco de Dados

### Otimização de Query

```typescript
// PASS: BOM: Selecione apenas as colunas necessárias
const { data } = await supabase
  .from('markets')
  .select('id, name, status, volume')
  .eq('status', 'active')
  .order('volume', { ascending: false })
  .limit(10)

// FAIL: RUIM: Selecionar tudo
const { data } = await supabase
  .from('markets')
  .select('*')
```

### Prevenção de Query N+1

```typescript
// FAIL: RUIM: Problema de query N+1
const markets = await getMarkets()
for (const market of markets) {
  market.creator = await getUser(market.creator_id)  // N queries
}

// PASS: BOM: Busca em lote
const markets = await getMarkets()
const creatorIds = markets.map(m => m.creator_id)
const creators = await getUsers(creatorIds)  // 1 query
const creatorMap = new Map(creators.map(c => [c.id, c]))

markets.forEach(market => {
  market.creator = creatorMap.get(market.creator_id)
})
```

### Padrão de Transação

```typescript
async function createMarketWithPosition(
  marketData: CreateMarketDto,
  positionData: CreatePositionDto
) {
  // Usa transação do Supabase
  const { data, error } = await supabase.rpc('create_market_with_position', {
    market_data: marketData,
    position_data: positionData
  })

  if (error) throw new Error('Transaction failed')
  return data
}

// Função SQL no Supabase
CREATE OR REPLACE FUNCTION create_market_with_position(
  market_data jsonb,
  position_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  -- A transação começa automaticamente
  INSERT INTO markets VALUES (market_data);
  INSERT INTO positions VALUES (position_data);
  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    -- O rollback acontece automaticamente
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;
```

## Estratégias de Cache

### Camada de Cache Redis

```typescript
class CachedMarketRepository implements MarketRepository {
  constructor(
    private baseRepo: MarketRepository,
    private redis: RedisClient
  ) {}

  async findById(id: string): Promise<Market | null> {
    // Verifica o cache primeiro
    const cached = await this.redis.get(`market:${id}`)

    if (cached) {
      return JSON.parse(cached)
    }

    // Cache miss - busca do banco de dados
    const market = await this.baseRepo.findById(id)

    if (market) {
      // Mantém em cache por 5 minutos
      await this.redis.setex(`market:${id}`, 300, JSON.stringify(market))
    }

    return market
  }

  async invalidateCache(id: string): Promise<void> {
    await this.redis.del(`market:${id}`)
  }
}
```

### Padrão Cache-Aside

```typescript
async function getMarketWithCache(id: string): Promise<Market> {
  const cacheKey = `market:${id}`

  // Tenta o cache
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Cache miss - busca do BD
  const market = await db.markets.findUnique({ where: { id } })

  if (!market) throw new Error('Market not found')

  // Atualiza o cache
  await redis.setex(cacheKey, 300, JSON.stringify(market))

  return market
}
```

## Padrões de Tratamento de Erros

### Tratador de Erros Centralizado

```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

export function errorHandler(error: unknown, req: Request): Response {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: error.statusCode })
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: error.errors
    }, { status: 400 })
  }

  // Loga erros inesperados
  console.error('Unexpected error:', error)

  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 })
}

// Uso
export async function GET(request: Request) {
  try {
    const data = await fetchData()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return errorHandler(error, request)
  }
}
```

### Retry com Backoff Exponencial

```typescript
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      if (i < maxRetries - 1) {
        // Backoff exponencial: 1s, 2s, 4s
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError!
}

// Uso
const data = await fetchWithRetry(() => fetchFromAPI())
```

## Autenticação e Autorização

### Validação de Token JWT

```typescript
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
}

export function verifyToken(token: string): JWTPayload {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    return payload
  } catch (error) {
    throw new ApiError(401, 'Invalid token')
  }
}

export async function requireAuth(request: Request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new ApiError(401, 'Missing authorization token')
  }

  return verifyToken(token)
}

// Uso em uma API route
export async function GET(request: Request) {
  const user = await requireAuth(request)

  const data = await getDataForUser(user.userId)

  return NextResponse.json({ success: true, data })
}
```

### Controle de Acesso Baseado em Papel (RBAC)

```typescript
type Permission = 'read' | 'write' | 'delete' | 'admin'

interface User {
  id: string
  role: 'admin' | 'moderator' | 'user'
}

const rolePermissions: Record<User['role'], Permission[]> = {
  admin: ['read', 'write', 'delete', 'admin'],
  moderator: ['read', 'write', 'delete'],
  user: ['read', 'write']
}

export function hasPermission(user: User, permission: Permission): boolean {
  return rolePermissions[user.role].includes(permission)
}

export function requirePermission(permission: Permission) {
  return (handler: (request: Request, user: User) => Promise<Response>) => {
    return async (request: Request) => {
      const user = await requireAuth(request)

      if (!hasPermission(user, permission)) {
        throw new ApiError(403, 'Insufficient permissions')
      }

      return handler(request, user)
    }
  }
}

// Uso - a HOF envolve o handler
export const DELETE = requirePermission('delete')(
  async (request: Request, user: User) => {
    // O handler recebe o usuário autenticado com permissão verificada
    return new Response('Deleted', { status: 200 })
  }
)
```

## Rate Limiting

O rate limiting deve usar um armazenamento compartilhado, como Redis, um gateway ou
o limitador nativo da plataforma. Não use contadores em memória por processo para
APIs de produção: eles são zerados a cada deploy, ficam fragmentados entre réplicas e falham em modo aberto em
ambientes serverless ou de múltiplas instâncias.

Mantenha a camada de backend responsável por escolher o ponto de integração e o formato
do erro; use `api-design` para o contrato HTTP e `security-review` para a revisão de
casos de abuso.

## Background Jobs e Filas

### Padrão de Fila Simples

```typescript
class JobQueue<T> {
  private queue: T[] = []
  private processing = false

  async add(job: T): Promise<void> {
    this.queue.push(job)

    if (!this.processing) {
      this.process()
    }
  }

  private async process(): Promise<void> {
    this.processing = true

    while (this.queue.length > 0) {
      const job = this.queue.shift()!

      try {
        await this.execute(job)
      } catch (error) {
        console.error('Job failed:', error)
      }
    }

    this.processing = false
  }

  private async execute(job: T): Promise<void> {
    // Lógica de execução do job
  }
}

// Uso para indexar markets
interface IndexJob {
  marketId: string
}

const indexQueue = new JobQueue<IndexJob>()

export async function POST(request: Request) {
  const { marketId } = await request.json()

  // Adiciona à fila em vez de bloquear
  await indexQueue.add({ marketId })

  return NextResponse.json({ success: true, message: 'Job queued' })
}
```

## Logging e Monitoramento

### Logging Estruturado

```typescript
interface LogContext {
  userId?: string
  requestId?: string
  method?: string
  path?: string
  [key: string]: unknown
}

class Logger {
  log(level: 'info' | 'warn' | 'error', message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    }

    console.log(JSON.stringify(entry))
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error.message,
      stack: error.stack
    })
  }
}

const logger = new Logger()

// Uso
export async function GET(request: Request) {
  const requestId = crypto.randomUUID()

  logger.info('Fetching markets', {
    requestId,
    method: 'GET',
    path: '/api/markets'
  })

  try {
    const markets = await fetchMarkets()
    return NextResponse.json({ success: true, data: markets })
  } catch (error) {
    logger.error('Failed to fetch markets', error as Error, { requestId })
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Lembre-se**: padrões de backend permitem aplicações server-side escaláveis e fáceis de manter. Escolha padrões que se ajustem ao seu nível de complexidade.
