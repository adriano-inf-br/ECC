---
name: fsharp-testing
description: Padrões de teste em F# com xUnit, FsUnit, Unquote, testes baseados em propriedades com FsCheck, testes de integração e melhores práticas de organização de testes.
metadata:
  origin: ECC
---

# Padrões de Teste em F#

Padrões de teste abrangentes para aplicações F# usando xUnit, FsUnit, Unquote, FsCheck e práticas modernas de teste em .NET.

## Quando Ativar

- Escrever novos testes para código F#
- Revisar qualidade e cobertura de testes
- Configurar infraestrutura de testes para projetos F#
- Depurar testes instáveis ou lentos

## Stack de Frameworks de Teste

| Ferramenta | Propósito |
|---|---|
| **xUnit** | Framework de teste (escolha padrão do ecossistema .NET) |
| **FsUnit.xUnit** | Sintaxe de asserção amigável a F# para xUnit |
| **Unquote** | Biblioteca de asserção usando quotations de F# para mensagens de falha claras |
| **FsCheck.xUnit** | Teste baseado em propriedades integrado com xUnit |
| **NSubstitute** | Mock de dependências .NET |
| **Testcontainers** | Infraestrutura real em testes de integração |
| **WebApplicationFactory** | Testes de integração ASP.NET Core |

## Testes Unitários com xUnit + FsUnit

### Estrutura Básica de Teste

```fsharp
module OrderServiceTests

open Xunit
open FsUnit.Xunit

[<Fact>]
let ``create sets status to Pending`` () =
    let order = Order.create "cust-1" [ validItem ]
    order.Status |> should equal Pending

[<Fact>]
let ``confirm changes status to Confirmed`` () =
    let order = Order.create "cust-1" [ validItem ]
    let confirmed = Order.confirm order
    confirmed.Status |> should be (ofCase <@ Confirmed @>)
```

### Asserções com Unquote

O Unquote usa quotations de F# para que as mensagens de falha mostrem a expressão completa que falhou, não apenas "esperado X obteve Y".

```fsharp
module OrderValidationTests

open Xunit
open Swensen.Unquote

[<Fact>]
let ``PlaceOrder returns success when request is valid`` () =
    let request = { CustomerId = "cust-123"; Items = [ validItem ] }
    let result = OrderService.placeOrder request
    test <@ Result.isOk result @>

[<Fact>]
let ``order total sums item prices`` () =
    let items = [ { Sku = "A"; Quantity = 2; Price = 10m }
                  { Sku = "B"; Quantity = 1; Price = 5m } ]
    let total = Order.calculateTotal items
    test <@ total = 25m @>

[<Fact>]
let ``validated email rejects empty input`` () =
    let result = ValidatedEmail.create ""
    test <@ Result.isError result @>
```

### Testes Assíncronos

```fsharp
[<Fact>]
let ``PlaceOrder returns success when request is valid`` () = task {
    let deps = createTestDeps ()
    let request = { CustomerId = "cust-123"; Items = [ validItem ] }

    let! result = OrderService.placeOrder deps request

    test <@ Result.isOk result @>
}

[<Fact>]
let ``PlaceOrder returns error when items are empty`` () = task {
    let deps = createTestDeps ()
    let request = { CustomerId = "cust-123"; Items = [] }

    let! result = OrderService.placeOrder deps request

    test <@ Result.isError result @>
}
```

### Testes Parametrizados com Theory

```fsharp
[<Theory>]
[<InlineData("")>]
[<InlineData("   ")>]
let ``PlaceOrder rejects empty customer ID`` (customerId: string) =
    let request = { CustomerId = customerId; Items = [ validItem ] }
    let result = OrderService.placeOrder request
    result |> should be (ofCase <@ Error @>)

[<Theory>]
[<InlineData("", false)>]
[<InlineData("a", false)>]
[<InlineData("user@example.com", true)>]
[<InlineData("user+tag@example.co.uk", true)>]
let ``IsValidEmail returns expected result`` (email: string, expected: bool) =
    test <@ EmailValidator.isValid email = expected @>
```

## Teste Baseado em Propriedades com FsCheck

### Usando FsCheck.xUnit

```fsharp
open FsCheck
open FsCheck.Xunit

[<Property>]
let ``order total is always non-negative`` (items: NonEmptyList<PositiveInt * decimal>) =
    let orderItems =
        items.Get
        |> List.map (fun (qty, price) ->
            { Sku = "SKU"; Quantity = qty.Get; Price = abs price })
    let total = Order.calculateTotal orderItems
    total >= 0m

[<Property>]
let ``serialization roundtrips`` (order: Order) =
    let json = JsonSerializer.Serialize order
    let deserialized = JsonSerializer.Deserialize<Order> json
    deserialized = order
```

### Geradores Personalizados

```fsharp
type OrderGenerators =
    static member ValidEmail () =
        gen {
            let! user = Gen.elements [ "alice"; "bob"; "carol" ]
            let! domain = Gen.elements [ "example.com"; "test.org" ]
            return $"{user}@{domain}"
        }
        |> Arb.fromGen

[<Property(Arbitrary = [| typeof<OrderGenerators> |])>]
let ``valid emails pass validation`` (email: string) =
    EmailValidator.isValid email
```

## Mock de Dependências

### Stubs de Função (Preferido)

```fsharp
let createTestDeps () =
    let mutable savedOrders = []
    { FindOrder = fun id -> task { return Map.tryFind id testData }
      SaveOrder = fun order -> task { savedOrders <- order :: savedOrders }
      SendNotification = fun _ -> Task.CompletedTask }

[<Fact>]
let ``PlaceOrder saves the confirmed order`` () = task {
    let mutable saved = []
    let deps =
        { createTestDeps () with
            SaveOrder = fun order -> task { saved <- order :: saved } }

    let! _ = OrderService.placeOrder deps validRequest

    test <@ saved.Length = 1 @>
}
```

### NSubstitute para Interfaces .NET

```fsharp
open NSubstitute

[<Fact>]
let ``calls repository with correct ID`` () = task {
    let repo = Substitute.For<IOrderRepository>()
    repo.FindByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>())
        .Returns(Task.FromResult(Some testOrder))

    let service = OrderService(repo)
    let! _ = service.GetOrder(testOrder.Id, CancellationToken.None)

    do! repo.Received(1).FindByIdAsync(testOrder.Id, Arg.Any<CancellationToken>())
}
```

## Testes de Integração ASP.NET Core

```fsharp
type OrderApiTests (factory: WebApplicationFactory<Program>) =
    interface IClassFixture<WebApplicationFactory<Program>>

    let client =
        factory.WithWebHostBuilder(fun builder ->
            builder.ConfigureServices(fun services ->
                services.RemoveAll<DbContextOptions<AppDbContext>>() |> ignore
                services.AddDbContext<AppDbContext>(fun options ->
                    options.UseInMemoryDatabase("TestDb") |> ignore) |> ignore))
            .CreateClient()

    [<Fact>]
    member _.``GET order returns 404 when not found`` () = task {
        let! response = client.GetAsync($"/api/orders/{Guid.NewGuid()}")
        test <@ response.StatusCode = HttpStatusCode.NotFound @>
    }
```

## Organização dos Testes

```
tests/
  MyApp.Tests/
    Unit/
      OrderServiceTests.fs
      PaymentServiceTests.fs
    Integration/
      OrderApiTests.fs
      OrderRepositoryTests.fs
    Properties/
      OrderPropertyTests.fs
    Helpers/
      TestData.fs
      TestDeps.fs
```

## Anti-Padrões Comuns

| Anti-Padrão | Correção |
|---|---|
| Testar detalhes de implementação | Testar comportamento e resultados |
| Estado de teste compartilhado mutável | Estado novo por teste |
| `Thread.Sleep` em testes assíncronos | Use `Task.Delay` com timeout, ou auxiliares de polling |
| Asserir sobre a saída de `sprintf` | Asserir sobre valores tipados e correspondências de padrão |
| Ignorar `CancellationToken` | Sempre passe e verifique o cancelamento |
| Pular testes baseados em propriedades | Use FsCheck para qualquer função com invariantes claras |

## Skills Relacionadas

- `dotnet-patterns` - Padrões idiomáticos de .NET, injeção de dependência e arquitetura
- `csharp-testing` - Padrões de teste em C# (infraestrutura compartilhada como WebApplicationFactory e Testcontainers também se aplica a F#)

## Executando Testes

```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific project
dotnet test tests/MyApp.Tests/

# Filter by test name
dotnet test --filter "FullyQualifiedName~OrderService"

# Watch mode during development
dotnet watch test --project tests/MyApp.Tests/
```
