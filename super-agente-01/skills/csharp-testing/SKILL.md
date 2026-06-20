---
name: csharp-testing
description: Padrões de teste para C# e .NET com xUnit, FluentAssertions, mocking, testes de integração e boas práticas de organização de testes.
metadata:
  origin: ECC
---

# C# Testing Patterns

Padrões de teste abrangentes para aplicações .NET usando xUnit, FluentAssertions e práticas modernas de teste.

## Quando Ativar

- Escrever novos testes para código C#
- Revisar a qualidade e cobertura dos testes
- Configurar infraestrutura de testes para projetos .NET
- Depurar testes flaky ou lentos

## Pilha de Frameworks de Teste

| Tool | Propósito |
|---|---|
| **xUnit** | Framework de testes (preferido para .NET) |
| **FluentAssertions** | Sintaxe de assertion legível |
| **NSubstitute** ou **Moq** | Mock de dependências |
| **Testcontainers** | Infraestrutura real em testes de integração |
| **WebApplicationFactory** | Testes de integração do ASP.NET Core |
| **Bogus** | Geração realista de dados de teste |

## Estrutura de Teste Unitário

### Arrange-Act-Assert

```csharp
public sealed class OrderServiceTests
{
    private readonly IOrderRepository _repository = Substitute.For<IOrderRepository>();
    private readonly ILogger<OrderService> _logger = Substitute.For<ILogger<OrderService>>();
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _sut = new OrderService(_repository, _logger);
    }

    [Fact]
    public async Task PlaceOrderAsync_ReturnsSuccess_WhenRequestIsValid()
    {
        // Arrange (preparar)
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-123",
            Items = [new OrderItem("SKU-001", 2, 29.99m)]
        };

        // Act (agir)
        var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

        // Assert (verificar)
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value!.CustomerId.Should().Be("cust-123");
    }

    [Fact]
    public async Task PlaceOrderAsync_ReturnsFailure_WhenNoItems()
    {
        // Arrange (preparar)
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-123",
            Items = []
        };

        // Act (agir)
        var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

        // Assert (verificar)
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().Contain("at least one item");
    }
}
```

### Testes Parametrizados com Theory

```csharp
[Theory]
[InlineData("", false)]
[InlineData("a", false)]
[InlineData("ab@c.d", false)]
[InlineData("user@example.com", true)]
[InlineData("user+tag@example.co.uk", true)]
public void IsValidEmail_ReturnsExpected(string email, bool expected)
{
    EmailValidator.IsValid(email).Should().Be(expected);
}

[Theory]
[MemberData(nameof(InvalidOrderCases))]
public async Task PlaceOrderAsync_RejectsInvalidOrders(CreateOrderRequest request, string expectedError)
{
    var result = await _sut.PlaceOrderAsync(request, CancellationToken.None);

    result.IsSuccess.Should().BeFalse();
    result.Error.Should().Contain(expectedError);
}

public static TheoryData<CreateOrderRequest, string> InvalidOrderCases => new()
{
    { new() { CustomerId = "", Items = [ValidItem()] }, "CustomerId" },
    { new() { CustomerId = "c1", Items = [] }, "at least one item" },
    { new() { CustomerId = "c1", Items = [new("", 1, 10m)] }, "SKU" },
};
```

## Mock com NSubstitute

```csharp
[Fact]
public async Task GetOrderAsync_ReturnsNull_WhenNotFound()
{
    // Arrange
    var orderId = Guid.NewGuid();
    _repository.FindByIdAsync(orderId, Arg.Any<CancellationToken>())
        .Returns((Order?)null);

    // Act (agir)
    var result = await _sut.GetOrderAsync(orderId, CancellationToken.None);

    // Assert (verificar)
    result.Should().BeNull();
}

[Fact]
public async Task PlaceOrderAsync_PersistsOrder()
{
    // Arrange (preparar)
    var request = ValidOrderRequest();

    // Act (agir)
    await _sut.PlaceOrderAsync(request, CancellationToken.None);

    // Assert (verificar) — verifica que o repositório foi chamado
    await _repository.Received(1).AddAsync(
        Arg.Is<Order>(o => o.CustomerId == request.CustomerId),
        Arg.Any<CancellationToken>());
}
```

## Testes de Integração do ASP.NET Core

### Configuração do WebApplicationFactory

```csharp
public sealed class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public OrderApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Substitui o DB real por in-memory para os testes
                services.RemoveAll<DbContextOptions<AppDbContext>>();
                services.AddDbContext<AppDbContext>(options =>
                    options.UseInMemoryDatabase("TestDb"));
            });
        }).CreateClient();
    }

    [Fact]
    public async Task GetOrder_Returns404_WhenNotFound()
    {
        var response = await _client.GetAsync($"/api/orders/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateOrder_Returns201_WithValidRequest()
    {
        var request = new CreateOrderRequest
        {
            CustomerId = "cust-1",
            Items = [new("SKU-001", 1, 19.99m)]
        };

        var response = await _client.PostAsJsonAsync("/api/orders", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();
    }
}
```

### Testes com Testcontainers

```csharp
public sealed class PostgresOrderRepositoryTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    private AppDbContext _db = null!;

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_postgres.GetConnectionString())
            .Options;
        _db = new AppDbContext(options);
        await _db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        await _db.DisposeAsync();
        await _postgres.DisposeAsync();
    }

    [Fact]
    public async Task AddAsync_PersistsOrder()
    {
        var repo = new SqlOrderRepository(_db);
        var order = Order.Create("cust-1", [new OrderItem("SKU-001", 2, 10m)]);

        await repo.AddAsync(order, CancellationToken.None);

        var found = await repo.FindByIdAsync(order.Id, CancellationToken.None);
        found.Should().NotBeNull();
        found!.Items.Should().HaveCount(1);
    }
}
```

## Organização dos Testes

```
tests/
  MyApp.UnitTests/
    Services/
      OrderServiceTests.cs
      PaymentServiceTests.cs
    Validators/
      EmailValidatorTests.cs
  MyApp.IntegrationTests/
    Api/
      OrderApiTests.cs
    Repositories/
      OrderRepositoryTests.cs
  MyApp.TestHelpers/
    Builders/
      OrderBuilder.cs
    Fixtures/
      DatabaseFixture.cs
```

## Builders de Dados de Teste

```csharp
public sealed class OrderBuilder
{
    private string _customerId = "cust-default";
    private readonly List<OrderItem> _items = [new("SKU-001", 1, 10m)];

    public OrderBuilder WithCustomer(string customerId)
    {
        _customerId = customerId;
        return this;
    }

    public OrderBuilder WithItem(string sku, int quantity, decimal price)
    {
        _items.Add(new OrderItem(sku, quantity, price));
        return this;
    }

    public Order Build() => Order.Create(_customerId, _items);
}

// Uso nos testes
var order = new OrderBuilder()
    .WithCustomer("cust-vip")
    .WithItem("SKU-PREMIUM", 3, 99.99m)
    .Build();
```

## Anti-Padrões Comuns

| Anti-Padrão | Correção |
|---|---|
| Testar detalhes de implementação | Teste comportamento e resultados |
| Estado de teste mutável compartilhado | Instância nova por teste (o xUnit faz isso via construtores) |
| `Thread.Sleep` em testes assíncronos | Use `Task.Delay` com timeout, ou helpers de polling |
| Fazer assertion sobre a saída de `ToString()` | Faça assertion sobre propriedades tipadas |
| Uma assertion gigante por teste | Uma assertion lógica por teste |
| Nomes de teste descrevendo a implementação | Nomeie por comportamento: `Method_ExpectedResult_WhenCondition` |
| Ignorar `CancellationToken` | Sempre passe e verifique o cancelamento |

## Executando os Testes

```bash
# Roda todos os testes
dotnet test

# Roda com cobertura
dotnet test --collect:"XPlat Code Coverage"

# Roda um projeto específico
dotnet test tests/MyApp.UnitTests/

# Filtra por nome de teste
dotnet test --filter "FullyQualifiedName~OrderService"

# Modo watch durante o desenvolvimento
dotnet watch test --project tests/MyApp.UnitTests/
```
