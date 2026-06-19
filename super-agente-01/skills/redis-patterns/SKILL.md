---
name: redis-patterns
description: Padrões de estrutura de dados Redis, estratégias de cache, locks distribuídos, rate limiting, pub/sub e gerenciamento de conexões para aplicações em produção.
metadata:
  origin: ECC
---

# Padrões Redis

Referência rápida de boas práticas Redis para casos de uso comuns de Backend.

## Como Funciona

Redis é um armazenamento de estrutura de dados em memória que suporta strings, hashes, listas, sets, sorted sets, streams e mais. Comandos Redis individuais são atômicos em uma única instância; fluxos de trabalho de múltiplos passos requerem scripts Lua, transações MULTI/EXEC ou sincronização explícita para permanecerem atômicos. Os dados são opcionalmente persistidos via snapshots RDB ou logs AOF. Os clientes se comunicam via TCP usando o protocolo RESP; pools de conexão são essenciais para evitar sobrecarga de handshake por requisição.

## Quando Ativar

- Adicionando cache a uma aplicação
- Implementando rate limiting ou throttling
- Construindo locks distribuídos ou coordenação
- Configurando armazenamento de sessão ou token
- Usando Pub/Sub ou Redis Streams para mensagens
- Configurando Redis em produção (pooling, eviction, clustering)

## Cheat Sheet de Estrutura de Dados

| Caso de Uso | Estrutura | Exemplo de Chave |
|----------|-----------|-------------|
| Cache simples | String | `product:123` |
| Sessão de usuário | Hash | `session:abc` |
| Leaderboard | Sorted Set | `scores:weekly` |
| Visitantes únicos | Set | `visitors:2024-01-01` |
| Feed de atividade | List | `feed:user:456` |
| Stream de eventos | Stream | `events:orders` |
| Contadores / rate limits | String (INCR) | `ratelimit:user:123` |
| Bloom filter / HLL | HyperLogLog | `hll:pageviews` |

## Padrões Fundamentais

### Cache-Aside (Lazy Loading)

```python
import redis
import json

r = redis.Redis(host='localhost', port=6379, decode_responses=True)

def get_product(product_id: int):
    cache_key = f"product:{product_id}"
    cached = r.get(cache_key)

    if cached:
        return json.loads(cached)

    product = db.query("SELECT * FROM products WHERE id = %s", product_id)
    r.setex(cache_key, 3600, json.dumps(product))  # TTL: 1 hora
    return product
```

### Cache Write-Through

```python
def update_product(product_id: int, data: dict):
    # Escreva no banco de dados primeiro
    db.execute("UPDATE products SET ... WHERE id = %s", product_id)

    # Atualize o cache imediatamente
    cache_key = f"product:{product_id}"
    r.setex(cache_key, 3600, json.dumps(data))
```

### Invalidação de Cache

```python
# Invalidação baseada em tag — agrupe chaves relacionadas em um set
def cache_product(product_id: int, category_id: int, data: dict):
    key = f"product:{product_id}"
    tag = f"tag:category:{category_id}"
    pipe = r.pipeline(transaction=True)
    pipe.setex(key, 3600, json.dumps(data))
    pipe.sadd(tag, key)
    pipe.expire(tag, 3600)
    pipe.execute()

def invalidate_category(category_id: int):
    tag = f"tag:category:{category_id}"
    keys = r.smembers(tag)
    if keys:
        r.delete(*keys)
    r.delete(tag)
```

### Armazenamento de Sessão

```python
import time
import uuid

def create_session(user_id: int, ttl: int = 86400) -> str:
    session_id = str(uuid.uuid4())
    key = f"session:{session_id}"
    pipe = r.pipeline(transaction=True)
    pipe.hset(key, mapping={
        "user_id": user_id,
        "created_at": int(time.time()),
    })
    pipe.expire(key, ttl)
    pipe.execute()
    return session_id

def get_session(session_id: str) -> dict | None:
    data = r.hgetall(f"session:{session_id}")
    return data if data else None

def delete_session(session_id: str):
    r.delete(f"session:{session_id}")
```

## Rate Limiting

### Janela Fixa (Simples)

```python
def is_rate_limited(user_id: int, limit: int = 100, window: int = 60) -> bool:
    key = f"ratelimit:{user_id}:{int(time.time()) // window}"
    pipe = r.pipeline(transaction=True)
    pipe.incr(key)
    pipe.expire(key, window)
    count, _ = pipe.execute()
    return count > limit
```

### Janela Deslizante (Lua — Atômica)

```lua
-- sliding_window.lua
local key = KEYS[1]
local now = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local limit = tonumber(ARGV[3])

redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
local count = redis.call('ZCARD', key)

if count < limit then
    -- Use membro único (now + sequência) para evitar colisões no mesmo milissegundo
    local seq_key = key .. ':seq'
    local seq = redis.call('INCR', seq_key)
    redis.call('EXPIRE', seq_key, math.ceil(window / 1000))
    redis.call('ZADD', key, now, now .. '-' .. seq)
    redis.call('EXPIRE', key, math.ceil(window / 1000))
    return 1
end
return 0
```

```python
sliding_window = r.register_script(open('sliding_window.lua').read())

def allow_request(user_id: int) -> bool:
    key = f"ratelimit:sliding:{user_id}"
    now = int(time.time() * 1000)
    return bool(sliding_window(keys=[key], args=[now, 60000, 100]))
```

## Locks Distribuídos

### Lock Distribuído (Nó Único — SET NX PX)

```python
import uuid

def acquire_lock(resource: str, ttl_ms: int = 5000) -> str | None:
    lock_key = f"lock:{resource}"
    token = str(uuid.uuid4())
    acquired = r.set(lock_key, token, px=ttl_ms, nx=True)
    return token if acquired else None

def release_lock(resource: str, token: str) -> bool:
    release_script = """
    if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
    else
        return 0
    end
    """
    result = r.eval(release_script, 1, f"lock:{resource}", token)
    return bool(result)

# Uso
token = acquire_lock("order:payment:123")
if token:
    try:
        process_payment()
    finally:
        release_lock("order:payment:123", token)
```

> Para configurações multi-nó use a biblioteca `redlock-py` que implementa o algoritmo Redlock completo.

## Pub/Sub e Streams

### Pub/Sub (Fire-and-Forget)

```python
# Publisher
def publish_event(channel: str, payload: dict):
    r.publish(channel, json.dumps(payload))

# Subscriber (bloqueante — execute em thread/processo separado)
def subscribe_events(channel: str):
    pubsub = r.pubsub()
    pubsub.subscribe(channel)
    for message in pubsub.listen():
        if message['type'] == 'message':
            handle(json.loads(message['data']))
```

### Redis Streams (Fila Durável)

```python
# Producer
def emit(stream: str, event: dict):
    r.xadd(stream, event, maxlen=10000)  # Limita o tamanho do stream

# Consumer group — garante entrega pelo menos uma vez
try:
    r.xgroup_create('events:orders', 'processor', id='0', mkstream=True)
except Exception:
    pass  # Grupo já existe

def consume(stream: str, group: str, consumer: str):
    while True:
        messages = r.xreadgroup(group, consumer, {stream: '>'}, count=10, block=2000)
        for _, entries in (messages or []):
            for msg_id, data in entries:
                process(data)
                r.xack(stream, group, msg_id)
```

> Prefira **Streams** ao Pub/Sub quando precisar de garantias de entrega, consumer groups ou replay.

## Design de Chaves

### Convenções de Nomenclatura

```
# Padrão: recurso:id:campo
user:123:profile
order:456:status
cache:product:789

# Padrão: namespace:recurso:id
myapp:session:abc123
myapp:ratelimit:user:123

# Padrão: recurso:data (chaves com limite de tempo)
stats:pageviews:2024-01-01
```

### Estratégia de TTL

| Tipo de Dado | TTL Sugerido |
|-----------|--------------|
| Sessão de usuário | 24h (`86400`) |
| Cache de resposta API | 5–15 min |
| Janela de rate limit | Corresponda ao tamanho da janela |
| Tokens de curta duração | 5–10 min |
| Leaderboard | 1h–24h |
| Dados estáticos/referência | 1h–1 semana |

Sempre defina um TTL. Chaves sem TTL acumulam indefinidamente e causam pressão de memória.

## Gerenciamento de Conexão

### Connection Pooling

```python
from redis import ConnectionPool, Redis

pool = ConnectionPool(
    host='localhost',
    port=6379,
    db=0,
    max_connections=20,
    decode_responses=True,
    socket_connect_timeout=2,
    socket_timeout=2,
)

r = Redis(connection_pool=pool)
```

### Modo Cluster

```python
from redis.cluster import RedisCluster

r = RedisCluster(
    startup_nodes=[{"host": "redis-1", "port": 6379}],
    decode_responses=True,
    skip_full_coverage_check=True,
)
```

### Sentinel (Alta Disponibilidade)

```python
from redis.sentinel import Sentinel

sentinel = Sentinel(
    [('sentinel-1', 26379), ('sentinel-2', 26379)],
    socket_timeout=0.5,
)
master = sentinel.master_for('mymaster', decode_responses=True)
replica = sentinel.slave_for('mymaster', decode_responses=True)
```

## Políticas de Eviction

| Política | Comportamento | Melhor Para |
|--------|----------|----------|
| `noeviction` | Erro na escrita quando cheio | Filas / dados críticos |
| `allkeys-lru` | Evict pelo menos recentemente usado | Cache geral |
| `volatile-lru` | LRU apenas entre chaves com TTL | Store de dados mistos |
| `allkeys-lfu` | Evict pelo menos frequentemente usado | Padrões de acesso assimétrico |
| `volatile-ttl` | Evict o que expira mais cedo | Priorizar dados de longa duração |

Configure via `redis.conf`: `maxmemory-policy allkeys-lru`

## Anti-Padrões

| Anti-Padrão | Problema | Solução |
|---|---|---|
| Chaves sem TTL | Memória cresce ilimitadamente | Sempre defina TTL |
| `KEYS *` em produção | Bloqueia o servidor (O(N)) | Use cursor `SCAN` |
| Armazenar blobs grandes (>100KB) | Serialização lenta, pressão de memória | Armazene referência + busque do object store |
| Redis único para tudo | Sem isolamento entre cache e fila | Use DBs ou instâncias separadas |
| Ignorar limites do connection pool | Esgotamento de conexão sob carga | Dimensione o pool para a carga de trabalho |
| Não tratar cache miss stampede | Thundering herd na inicialização a frio | Use locks ou expiração antecipada probabilística |
| `FLUSHALL` sem reflexão | Limpa toda a instância | Escopice exclusões por padrão de chave |

### Prevenção de Cache Miss Stampede

```python
import threading

_locks: dict[str, threading.Lock] = {}
_locks_mutex = threading.Lock()

def get_with_lock(key: str, fetch_fn, ttl: int = 300):
    cached = r.get(key)
    if cached:
        return json.loads(cached)

    with _locks_mutex:
        if key not in _locks:
            _locks[key] = threading.Lock()
        lock = _locks[key]
    with lock:
        cached = r.get(key)  # Verifique novamente após adquirir o lock
        if cached:
            return json.loads(cached)
        value = fetch_fn()
        r.setex(key, ttl, json.dumps(value))
        return value
```

> Observação: para implantações multi-processo, substitua o lock in-process por `acquire_lock`/`release_lock` da seção Locks Distribuídos acima.

## Exemplos

**Adicionar cache a um endpoint de API Django/Flask:**
Use cache-aside com `setex` e TTL de 5 minutos na resposta. Chaveie pelos parâmetros da requisição.

**Rate-limit uma API por usuário:**
Use janela fixa com `pipeline(transaction=True)` para endpoints de baixo tráfego; use janela deslizante Lua para throttling preciso por usuário.

**Coordenar um job em background entre workers:**
Use `acquire_lock` com um TTL que exceda a duração esperada do job. Sempre libere em um bloco `finally`.

**Fan-out de notificações para múltiplos subscribers:**
Use Pub/Sub para fire-and-forget. Mude para Streams se precisar de entrega garantida ou replay para consumers tardios.

## Referência Rápida

| Padrão | Quando Usar |
|---------|-------------|
| Cache-aside | Leitura intensiva, tolera ligeira desatualização |
| Write-through | Consistência forte necessária |
| Lock distribuído | Prevenir acesso concorrente a um recurso |
| Rate limit com janela deslizante | Throttling preciso por usuário |
| Redis Streams | Fila de eventos durável com consumer groups |
| Pub/Sub | Broadcast sem necessidade de garantias de entrega |
| Leaderboard com Sorted Set | Pontuação ranqueada, paginação |
| HyperLogLog | Contagem única aproximada com baixo uso de memória |

## Relacionados

- Skill: `postgres-patterns` — padrões de dados relacionais
- Skill: `backend-patterns` — padrões de API e camada de serviço
- Skill: `database-migrations` — versionamento de schema
- Skill: `django-patterns` — integração com o framework de cache do Django
- Agent: `database-reviewer` — fluxo completo de revisão de banco de dados
