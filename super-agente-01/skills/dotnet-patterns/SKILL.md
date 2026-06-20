---
name: dotnet-patterns
description: Padrões idiomáticos de C# e .NET, convenções, injeção de dependência, async/await e melhores práticas para construir aplicações .NET robustas e de fácil manutenção.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento .NET

Padrões idiomáticos de C# e .NET para construir aplicações robustas, performáticas e de fácil manutenção.

## Quando Ativar

- Escrevendo novo código C#
- Revisando código C#
- Refatorando aplicações .NET existentes
- Projetando arquiteturas de serviço com ASP.NET Core

## Princípios Centrais

### 1. Prefira a Imutabilidade

Use records e propriedades init-only para modelos de dados. A mutabilidade deve ser uma escolha explícita e justificada.

```csharp
// Bom: Objeto de valor imutável
public sealed record Money(decimal Amount, string Currency);

// Bom: DTO imutável com setters init
public sealed class CreateOrderRequest
{
    public required string CustomerId { get; init; }
    public required IReadOnlyList<OrderItem> Items { get; init; }
}

// Ruim: Modelo mutável com setters públicos
public class Order
{
    public string CustomerId { get; set; }
    public List<OrderItem> Items { get; set; }
}
```

### 2. Explícito em Vez de Implícito

Seja claro sobre nullability, modificadores de acesso e intenção.

```csharp
// Bom: Modificadores de acesso e nullability explícitos
public sealed class UserService
{
    private readonly IUserRepository _repository;
    private readonly ILogger<UserService> _logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _repository.FindByIdAsync(id, cancellationToken);
    }
}
```

### 3. Dependa de Abstrações

Use interfaces para fronteiras de serviço. Registre via container de DI.

```csharp
// Bom: Dependência baseada em interface
public interface IOrderRepository
{
    Task<Order?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<IReadOnlyList<Order>> FindByCustomerAsync(string customerId, CancellationToken cancellationToken);
    Task AddAsync(Order order, CancellationToken cancellationToken);
}

// Registro
builder.Services.AddScoped<IOrderRepository, SqlOrderRepository>();
```

## Padrões de Async/Await

### Uso Correto de Async

```csharp
// Bom: Async em todo o caminho, com CancellationToken
public async Task<OrderSummary> GetOrderSummaryAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    var order = await _repository.FindByIdAsync(orderId, cancellationToken)
        ?? throw new NotFoundException($"Order {orderId} not found");

    var customer = await _customerService.GetAsync(order.CustomerId, cancellationToken);

    return new OrderSummary(order, customer);
}

// Ruim: Bloqueando em código async
public OrderSummary GetOrderSummary(Guid orderId)
{
    var order = _repository.FindByIdAsync(orderId, CancellationToken.None).Result; // Risco de deadlock
    return new OrderSummary(order);
}
```

### Operações Async em Paralelo

```csharp
// Bom: Operações independentes concorrentes
public async Task<DashboardData> LoadDashboardAsync(CancellationToken cancellationToken)
{
    var ordersTask = _orderService.GetRecentAsync(cancellationToken);
    var metricsTask = _metricsService.GetCurrentAsync(cancellationToken);
    var alertsTask = _alertService.GetActiveAsync(cancellationToken);

    await Task.WhenAll(ordersTask, metricsTask, alertsTask);

    return new DashboardData(
        Orders: await ordersTask,
        Metrics: await metricsTask,
        Alerts: await alertsTask);
}
```

## Padrão Options

Vincule seções de configuração a objetos fortemente tipados.

```csharp
public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    public required string Host { get; init; }
    public required int Port { get; init; }
    public required string Username { get; init; }
    public bool UseSsl { get; init; } = true;
}

// Registro
builder.Services.Configure<SmtpOptions>(
    builder.Configuration.GetSection(SmtpOptions.SectionName));

// Uso via injeção
public class EmailService(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;
}
```

## Padrão Result

Retorne sucesso/falha explícito em vez de lançar exceções para falhas esperadas.

```csharp
public sealed record Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(T value) { IsSuccess = true; Value = value; }
    private Result(string error) { IsSuccess = false; Error = error; }

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(string error) => new(error);
}

// Uso
public async Task<Result<Order>> PlaceOrderAsync(CreateOrderRequest request)
{
    if (request.Items.Count == 0)
        return Result<Order>.Failure("Order must contain at least one item");

    var order = Order.Create(request);
    await _repository.AddAsync(order, CancellationToken.None);
    return Result<Order>.Success(order);
}
```

## Padrão Repository com EF Core

```csharp
public sealed class SqlOrderRepository : IOrderRepository
{
    private readonly AppDbContext _db;

    public SqlOrderRepository(AppDbContext db) => _db = db;

    public async Task<Order?> FindByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _db.Orders
            .Include(o => o.Items)
            .AsNoTracking()
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Order>> FindByCustomerAsync(
        string customerId,
        CancellationToken cancellationToken)
    {
        return await _db.Orders
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Order order, CancellationToken cancellationToken)
    {
        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
```

## Middleware e Pipeline

```csharp
// Middleware personalizado
public sealed class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestTimingMiddleware> _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger<RequestTimingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            _logger.LogInformation(
                "Request {Method} {Path} completed in {ElapsedMs}ms with status {StatusCode}",
                context.Request.Method,
                context.Request.Path,
                stopwatch.ElapsedMilliseconds,
                context.Response.StatusCode);
        }
    }
}
```

## Padrões de Minimal API

```csharp
// Organizado com grupos de rotas
var orders = app.MapGroup("/api/orders")
    .RequireAuthorization()
    .WithTags("Orders");

orders.MapGet("/{id:guid}", async (
    Guid id,
    IOrderRepository repository,
    CancellationToken cancellationToken) =>
{
    var order = await repository.FindByIdAsync(id, cancellationToken);
    return order is not null
        ? TypedResults.Ok(order)
        : TypedResults.NotFound();
});

orders.MapPost("/", async (
    CreateOrderRequest request,
    IOrderService service,
    CancellationToken cancellationToken) =>
{
    var result = await service.PlaceOrderAsync(request, cancellationToken);
    return result.IsSuccess
        ? TypedResults.Created($"/api/orders/{result.Value!.Id}", result.Value)
        : TypedResults.BadRequest(result.Error);
});
```

## Guard Clauses

```csharp
// Bom: Retornos antecipados com validação clara
public async Task<ProcessResult> ProcessPaymentAsync(
    PaymentRequest request,
    CancellationToken cancellationToken)
{
    ArgumentNullException.ThrowIfNull(request);

    if (request.Amount <= 0)
        throw new ArgumentOutOfRangeException(nameof(request.Amount), "Amount must be positive");

    if (string.IsNullOrWhiteSpace(request.Currency))
        throw new ArgumentException("Currency is required", nameof(request.Currency));

    // O caminho feliz continua aqui sem aninhamento
    var gateway = _gatewayFactory.Create(request.Currency);
    return await gateway.ChargeAsync(request, cancellationToken);
}
```

## Anti-Padrões a Evitar

| Anti-Padrão | Correção |
|---|---|
| Métodos `async void` | Retorne `Task` (exceto handlers de eventos) |
| `.Result` ou `.Wait()` | Use `await` |
| `catch (Exception) { }` | Trate ou relance com contexto |
| `new Service()` em construtores | Use injeção via construtor |
| Campos `public` | Use propriedades com accessors apropriados |
| `dynamic` em lógica de negócio | Use generics ou tipos explícitos |
| Estado `static` mutável | Use escopo de DI ou `ConcurrentDictionary` |
| `string.Format` em loops | Use `StringBuilder` ou interpolated string handlers |
