---
name: laravel-patterns
description: Padrões de arquitetura Laravel, roteamento/controllers, Eloquent ORM, camadas de serviço, filas, eventos, caching e API resources para apps em produção.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento Laravel

Padrões de arquitetura Laravel prontos para produção para aplicações escaláveis e de fácil manutenção.

## Quando Usar

- Construir aplicações web ou APIs com Laravel
- Estruturar controllers, services e lógica de domínio
- Trabalhar com models Eloquent e relacionamentos
- Projetar APIs com resources e paginação
- Adicionar filas, eventos, caching e jobs em background

## Como Funciona

- Estruture o app em torno de fronteiras claras (controllers -> services/actions -> models).
- Use bindings explícitos e scoped bindings para manter o roteamento previsível; ainda imponha autorização para controle de acesso.
- Prefira models tipados, casts e scopes para manter a lógica de domínio consistente.
- Mantenha trabalho pesado em I/O em filas e faça cache de leituras custosas.
- Centralize a configuração em `config/*` e mantenha os ambientes explícitos.

## Exemplos

### Estrutura do Projeto

Use um layout convencional do Laravel com fronteiras claras de camada (HTTP, services/actions, models).

### Layout Recomendado

```
app/
├── Actions/            # Casos de uso de propósito único
├── Console/
├── Events/
├── Exceptions/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Requests/       # Validação via Form Request
│   └── Resources/      # API resources
├── Jobs/
├── Models/
├── Policies/
├── Providers/
├── Services/           # Services de domínio coordenadores
└── Support/
config/
database/
├── factories/
├── migrations/
└── seeders/
resources/
├── views/
└── lang/
routes/
├── api.php
├── web.php
└── console.php
```

### Controllers -> Services -> Actions

Mantenha os controllers enxutos. Coloque a orquestração em services e a lógica de propósito único em actions.

```php
final class CreateOrderAction
{
    public function __construct(private OrderRepository $orders) {}

    public function handle(CreateOrderData $data): Order
    {
        return $this->orders->create($data);
    }
}

final class OrdersController extends Controller
{
    public function __construct(private CreateOrderAction $createOrder) {}

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->createOrder->handle($request->toDto());

        return response()->json([
            'success' => true,
            'data' => OrderResource::make($order),
            'error' => null,
            'meta' => null,
        ], 201);
    }
}
```

### Roteamento e Controllers

Prefira route-model binding e resource controllers para maior clareza.

```php
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('projects', ProjectController::class);
});
```

### Route Model Binding (Scoped)

Use scoped bindings para prevenir acesso entre tenants.

```php
Route::scopeBindings()->group(function () {
    Route::get('/accounts/{account}/projects/{project}', [ProjectController::class, 'show']);
});
```

### Rotas Aninhadas e Nomes de Binding

- Mantenha prefixos e caminhos consistentes para evitar duplo aninhamento (ex.: `conversation` vs `conversations`).
- Use um único nome de parâmetro que corresponda ao model vinculado (ex.: `{conversation}` para `Conversation`).
- Prefira scoped bindings ao aninhar para impor relacionamentos pai-filho.

```php
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\MessageController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->prefix('conversations')->group(function () {
    Route::post('/', [ConversationController::class, 'store'])->name('conversations.store');

    Route::scopeBindings()->group(function () {
        Route::get('/{conversation}', [ConversationController::class, 'show'])
            ->name('conversations.show');

        Route::post('/{conversation}/messages', [MessageController::class, 'store'])
            ->name('conversation-messages.store');

        Route::get('/{conversation}/messages/{message}', [MessageController::class, 'show'])
            ->name('conversation-messages.show');
    });
});
```

Se quiser que um parâmetro resolva para uma classe de model diferente, defina binding explícito. Para lógica de binding customizada, use `Route::bind()` ou implemente `resolveRouteBinding()` no model.

```php
use App\Models\AiConversation;
use Illuminate\Support\Facades\Route;

Route::model('conversation', AiConversation::class);
```

### Bindings do Service Container

Vincule interfaces a implementações em um service provider para injeção de dependências clara.

```php
use App\Repositories\EloquentOrderRepository;
use App\Repositories\OrderRepository;
use Illuminate\Support\ServiceProvider;

final class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(OrderRepository::class, EloquentOrderRepository::class);
    }
}
```

### Padrões de Model Eloquent

### Configuração do Model

```php
final class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'owner_id', 'status'];

    protected $casts = [
        'status' => ProjectStatus::class,
        'archived_at' => 'datetime',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNull('archived_at');
    }
}
```

### Casts Customizados e Objetos de Valor

Use enums ou objetos de valor para tipagem estrita.

```php
use Illuminate\Database\Eloquent\Casts\Attribute;

protected $casts = [
    'status' => ProjectStatus::class,
];
```

```php
protected function budgetCents(): Attribute
{
    return Attribute::make(
        get: fn (int $value) => Money::fromCents($value),
        set: fn (Money $money) => $money->toCents(),
    );
}
```

### Eager Loading para Evitar N+1

```php
$orders = Order::query()
    ->with(['customer', 'items.product'])
    ->latest()
    ->paginate(25);
```

### Query Objects para Filtros Complexos

```php
final class ProjectQuery
{
    public function __construct(private Builder $query) {}

    public function ownedBy(int $userId): self
    {
        $query = clone $this->query;

        return new self($query->where('owner_id', $userId));
    }

    public function active(): self
    {
        $query = clone $this->query;

        return new self($query->whereNull('archived_at'));
    }

    public function builder(): Builder
    {
        return $this->query;
    }
}
```

### Global Scopes e Soft Deletes

Use global scopes para filtragem padrão e `SoftDeletes` para registros recuperáveis.
Use um global scope ou um named scope para o mesmo filtro, não ambos, a menos que intencione comportamento em camadas.

```php
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

final class Project extends Model
{
    use SoftDeletes;

    protected static function booted(): void
    {
        static::addGlobalScope('active', function (Builder $builder): void {
            $builder->whereNull('archived_at');
        });
    }
}
```

### Query Scopes para Filtros Reutilizáveis

```php
use Illuminate\Database\Eloquent\Builder;

final class Project extends Model
{
    public function scopeOwnedBy(Builder $query, int $userId): Builder
    {
        return $query->where('owner_id', $userId);
    }
}

// Em service, repository etc.
$projects = Project::ownedBy($user->id)->get();
```

### Transações para Atualizações Multi-Passo

```php
use Illuminate\Support\Facades\DB;

DB::transaction(function (): void {
    $order->update(['status' => 'paid']);
    $order->items()->update(['paid_at' => now()]);
});
```

### Migrations

### Convenção de Nomenclatura

- Os nomes de arquivo usam timestamps: `YYYY_MM_DD_HHMMSS_create_users_table.php`
- Migrations usam classes anônimas (sem classe nomeada); o nome do arquivo comunica a intenção
- Os nomes de tabela são `snake_case` e plural por padrão

### Exemplo de Migration

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->index();
            $table->unsignedInteger('total_cents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
```

### Form Requests e Validação

Mantenha a validação em form requests e transforme as entradas em DTOs.

```php
use App\Models\Order;

final class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }

    public function toDto(): CreateOrderData
    {
        return new CreateOrderData(
            customerId: (int) $this->validated('customer_id'),
            items: $this->validated('items'),
        );
    }
}
```

### API Resources

Mantenha as respostas da API consistentes com resources e paginação.

```php
$projects = Project::query()->active()->paginate(25);

return response()->json([
    'success' => true,
    'data' => ProjectResource::collection($projects->items()),
    'error' => null,
    'meta' => [
        'page' => $projects->currentPage(),
        'per_page' => $projects->perPage(),
        'total' => $projects->total(),
    ],
]);
```

### Eventos, Jobs e Filas

- Emita eventos de domínio para efeitos colaterais (e-mails, analytics)
- Use jobs em fila para trabalho lento (relatórios, exportações, webhooks)
- Prefira handlers idempotentes com retries e backoff

### Caching

- Faça cache de endpoints com muitas leituras e queries custosas
- Invalide caches em eventos do model (created/updated/deleted)
- Use tags ao fazer cache de dados relacionados para invalidação fácil

### Configuração e Ambientes

- Mantenha segredos em `.env` e configuração em `config/*.php`
- Use overrides de configuração por ambiente e `config:cache` em produção
