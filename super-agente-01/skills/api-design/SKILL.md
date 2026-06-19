---
name: api-design
description: Padrões de design de API REST incluindo nomenclatura de recursos, códigos de status, paginação, filtragem, respostas de erro, versionamento e limitação de taxa para APIs de produção.
metadata:
  origin: ECC
---

# Padrões de Design de API

Convenções e melhores práticas para projetar APIs REST consistentes e amigáveis ao desenvolvedor.

## When to Activate

- Projetar novos endpoints de API
- Revisar contratos de API existentes
- Adicionar paginação, filtragem ou ordenação
- Implementar tratamento de erros para APIs
- Planejar estratégia de versionamento de API
- Construir APIs públicas ou voltadas a parceiros

## Design de Recursos

### Estrutura de URL

```
# Recursos são substantivos, plural, minúsculos, kebab-case
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# Sub-recursos para relacionamentos
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/orders

# Ações que não mapeiam para CRUD (use verbos com moderação)
POST   /api/v1/orders/:id/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### Regras de Nomenclatura

```
# BOM
/api/v1/team-members          # kebab-case para recursos com múltiplas palavras
/api/v1/orders?status=active  # query params para filtragem
/api/v1/users/123/orders      # recursos aninhados para indicar posse

# RUIM
/api/v1/getUsers              # verbo na URL
/api/v1/user                  # singular (use plural)
/api/v1/team_members          # snake_case em URLs
/api/v1/users/123/getOrders   # verbo em recurso aninhado
```

## Métodos HTTP e Códigos de Status

### Semântica dos Métodos

| Método | Idempotente | Seguro | Usar Para |
|--------|-----------|------|---------|
| GET | Sim | Sim | Recuperar recursos |
| POST | Não | Não | Criar recursos, disparar ações |
| PUT | Sim | Não | Substituição completa de um recurso |
| PATCH | Não* | Não | Atualização parcial de um recurso |
| DELETE | Sim | Não | Remover um recurso |

*PATCH pode ser tornado idempotente com a implementação adequada

### Referência de Códigos de Status

```
# Sucesso
200 OK                    — GET, PUT, PATCH (com corpo de resposta)
201 Created               — POST (inclua o cabeçalho Location)
204 No Content            — DELETE, PUT (sem corpo de resposta)

# Erros do Cliente
400 Bad Request           — Falha de validação, JSON malformado
401 Unauthorized          — Autenticação ausente ou inválida
403 Forbidden             — Autenticado mas sem autorização
404 Not Found             — O recurso não existe
409 Conflict              — Entrada duplicada, conflito de estado
422 Unprocessable Entity  — Semanticamente inválido (JSON válido, dados ruins)
429 Too Many Requests     — Limite de taxa excedido

# Erros do Servidor
500 Internal Server Error — Falha inesperada (nunca exponha detalhes)
502 Bad Gateway           — Serviço upstream falhou
503 Service Unavailable   — Sobrecarga temporária, inclua Retry-After
```

### Erros Comuns

```
# RUIM: 200 para tudo
{ "status": 200, "success": false, "error": "Not found" }

# BOM: use códigos de status HTTP de forma semântica
HTTP/1.1 404 Not Found
{ "error": { "code": "not_found", "message": "User not found" } }

# RUIM: 500 para erros de validação
# BOM: 400 ou 422 com detalhes ao nível do campo

# RUIM: 200 para recursos criados
# BOM: 201 com o cabeçalho Location
HTTP/1.1 201 Created
Location: /api/v1/users/abc-123
```

## Formato de Resposta

### Resposta de Sucesso

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Resposta de Coleção (com Paginação)

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=8&per_page=20"
  }
}
```

### Resposta de Erro

```json
{
  "error": {
    "code": "validation_error",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "message": "Must be between 0 and 150",
        "code": "out_of_range"
      }
    ]
  }
}
```

### Variantes de Envelope de Resposta

```typescript
// Opção A: Envelope com wrapper de data (recomendado para APIs públicas)
interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: PaginationLinks;
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: FieldError[];
  };
}

// Opção B: Resposta plana (mais simples, comum em APIs internas)
// Sucesso: apenas retorne o recurso diretamente
// Erro: retorne o objeto de erro
// Diferencie pelo código de status HTTP
```

## Paginação

### Baseada em Offset (Simples)

```
GET /api/v1/users?page=2&per_page=20

# Implementação
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

**Prós:** Fácil de implementar, suporta "pular para a página N"
**Contras:** Lenta em offsets grandes (OFFSET 100000), inconsistente com inserções concorrentes

### Baseada em Cursor (Escalável)

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

# Implementação
SELECT * FROM users
WHERE id > :cursor_id
ORDER BY id ASC
LIMIT 21;  -- busca um extra para determinar has_next
```

```json
{
  "data": [...],
  "meta": {
    "has_next": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

**Prós:** Desempenho consistente independentemente da posição, estável com inserções concorrentes
**Contras:** Não pode pular para uma página arbitrária, o cursor é opaco

### Quando Usar Cada Uma

| Caso de Uso | Tipo de Paginação |
|----------|----------------|
| Painéis administrativos, conjuntos de dados pequenos (<10K) | Offset |
| Rolagem infinita, feeds, grandes conjuntos de dados | Cursor |
| APIs públicas | Cursor (padrão) com offset (opcional) |
| Resultados de busca | Offset (usuários esperam números de página) |

## Filtragem, Ordenação e Busca

### Filtragem

```
# Igualdade simples
GET /api/v1/orders?status=active&customer_id=abc-123

# Operadores de comparação (use notação de colchetes)
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?created_at[after]=2025-01-01

# Múltiplos valores (separados por vírgula)
GET /api/v1/products?category=electronics,clothing

# Campos aninhados (notação de ponto)
GET /api/v1/orders?customer.country=US
```

### Ordenação

```
# Campo único (prefixo - para ordem decrescente)
GET /api/v1/products?sort=-created_at

# Múltiplos campos (separados por vírgula)
GET /api/v1/products?sort=-featured,price,-created_at
```

### Busca de Texto Completo

```
# Parâmetro de query de busca
GET /api/v1/products?q=wireless+headphones

# Busca específica de campo
GET /api/v1/users?email=alice
```

### Conjuntos de Campos Esparsos (Sparse Fieldsets)

```
# Retorna apenas os campos especificados (reduz o payload)
GET /api/v1/users?fields=id,name,email
GET /api/v1/orders?fields=id,total,status&include=customer.name
```

## Autenticação e Autorização

### Autenticação Baseada em Token

```
# Token Bearer no cabeçalho Authorization
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# Chave de API (para servidor-a-servidor)
GET /api/v1/data
X-API-Key: sk_live_abc123
```

### Padrões de Autorização

```typescript
// Nível de recurso: verifica posse
app.get("/api/v1/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: { code: "not_found" } });
  if (order.userId !== req.user.id) return res.status(403).json({ error: { code: "forbidden" } });
  return res.json({ data: order });
});

// Baseada em papel (role-based): verifica permissões
app.delete("/api/v1/users/:id", requireRole("admin"), async (req, res) => {
  await User.delete(req.params.id);
  return res.status(204).send();
});
```

## Limitação de Taxa (Rate Limiting)

### Cabeçalhos

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000

# Quando excedido
HTTP/1.1 429 Too Many Requests
Retry-After: 60
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

### Faixas de Limite de Taxa

| Faixa | Limite | Janela | Caso de Uso |
|------|-------|--------|----------|
| Anônimo | 30/min | Por IP | Endpoints públicos |
| Autenticado | 100/min | Por usuário | Acesso padrão à API |
| Premium | 1000/min | Por chave de API | Planos de API pagos |
| Interno | 10000/min | Por serviço | Serviço-a-serviço |

## Versionamento

### Versionamento no Caminho da URL (Recomendado)

```
/api/v1/users
/api/v2/users
```

**Prós:** Explícito, fácil de rotear, cacheável
**Contras:** A URL muda entre versões

### Versionamento por Cabeçalho

```
GET /api/users
Accept: application/vnd.myapp.v2+json
```

**Prós:** URLs limpas
**Contras:** Mais difícil de testar, fácil de esquecer

### Estratégia de Versionamento

```
1. Comece com /api/v1/ — não versione até precisar
2. Mantenha no máximo 2 versões ativas (atual + anterior)
3. Cronograma de descontinuação (deprecation):
   - Anuncie a descontinuação (6 meses de aviso para APIs públicas)
   - Adicione o cabeçalho Sunset: Sunset: Sat, 01 Jan 2026 00:00:00 GMT
   - Retorne 410 Gone após a data de encerramento
4. Mudanças não disruptivas não precisam de uma nova versão:
   - Adicionar novos campos às respostas
   - Adicionar novos parâmetros de query opcionais
   - Adicionar novos endpoints
5. Mudanças disruptivas exigem uma nova versão:
   - Remover ou renomear campos
   - Mudar os tipos de campos
   - Mudar a estrutura da URL
   - Mudar o método de autenticação
```

## Padrões de Implementação

### TypeScript (Next.js API Route)

```typescript
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "validation_error",
        message: "Request validation failed",
        details: parsed.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      },
    }, { status: 422 });
  }

  const user = await createUser(parsed.data);

  return NextResponse.json(
    { data: user },
    {
      status: 201,
      headers: { Location: `/api/v1/users/${user.id}` },
    },
  );
}
```

### Python (Django REST Framework)

```python
from rest_framework import serializers, viewsets, status
from rest_framework.response import Response

class CreateUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=100)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "created_at"]

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "create":
            return CreateUserSerializer
        return UserSerializer

    def create(self, request):
        serializer = CreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = UserService.create(**serializer.validated_data)
        return Response(
            {"data": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
            headers={"Location": f"/api/v1/users/{user.id}"},
        )
```

### Go (net/http)

```go
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        writeError(w, http.StatusBadRequest, "invalid_json", "Invalid request body")
        return
    }

    if err := req.Validate(); err != nil {
        writeError(w, http.StatusUnprocessableEntity, "validation_error", err.Error())
        return
    }

    user, err := h.service.Create(r.Context(), req)
    if err != nil {
        switch {
        case errors.Is(err, domain.ErrEmailTaken):
            writeError(w, http.StatusConflict, "email_taken", "Email already registered")
        default:
            writeError(w, http.StatusInternalServerError, "internal_error", "Internal error")
        }
        return
    }

    w.Header().Set("Location", fmt.Sprintf("/api/v1/users/%s", user.ID))
    writeJSON(w, http.StatusCreated, map[string]any{"data": user})
}
```

## Checklist de Design de API

Antes de publicar um novo endpoint:

- [ ] A URL do recurso segue as convenções de nomenclatura (plural, kebab-case, sem verbos)
- [ ] Método HTTP correto utilizado (GET para leituras, POST para criações, etc.)
- [ ] Códigos de status apropriados retornados (não 200 para tudo)
- [ ] Entrada validada com schema (Zod, Pydantic, Bean Validation)
- [ ] Respostas de erro seguem o formato padrão com códigos e mensagens
- [ ] Paginação implementada para endpoints de listagem (cursor ou offset)
- [ ] Autenticação obrigatória (ou explicitamente marcada como pública)
- [ ] Autorização verificada (o usuário só pode acessar seus próprios recursos)
- [ ] Limitação de taxa configurada
- [ ] A resposta não vaza detalhes internos (stack traces, erros de SQL)
- [ ] Nomenclatura consistente com os endpoints existentes (camelCase vs snake_case)
- [ ] Documentado (especificação OpenAPI/Swagger atualizada)
