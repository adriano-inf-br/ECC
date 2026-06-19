---
paths:
  - "**/*.fs"
  - "**/*.fsx"
  - "**/*.fsproj"
---
# Testes F#

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de F#.

## Framework de Testes

- Prefira **xUnit** com **FsUnit.xUnit** para asserções amigáveis ao F#
- Use **Unquote** para asserções baseadas em quotations com mensagens de falha claras
- Use **FsCheck.xUnit** para testes baseados em propriedades
- Use **NSubstitute** ou stubs de função para fazer mock de dependências
- Use **Testcontainers** quando testes de integração precisarem de infraestrutura real

## Organização dos Testes

- Espelhe a estrutura de `src/` sob `tests/`
- Separe claramente a cobertura unitária, de integração e end-to-end
- Nomeie testes pelo comportamento, não por detalhes de implementação

```fsharp
open Xunit
open Swensen.Unquote

[<Fact>]
let ``PlaceOrder returns success when request is valid`` () =
    let request = { CustomerId = "cust-123"; Items = [ validItem ] }
    let result = OrderService.placeOrder request
    test <@ Result.isOk result @>

[<Fact>]
let ``PlaceOrder returns error when items are empty`` () =
    let request = { CustomerId = "cust-123"; Items = [] }
    let result = OrderService.placeOrder request
    test <@ Result.isError result @>
```

## Testes Baseados em Propriedades com FsCheck

```fsharp
open FsCheck.Xunit

[<Property>]
let ``order total is never negative`` (items: OrderItem list) =
    let total = Order.calculateTotal items
    total >= 0m
```

## Testes de Integração ASP.NET Core

- Use `WebApplicationFactory<TEntryPoint>` para cobertura de integração de API
- Teste autenticação, validação e serialização através de HTTP, não contornando o middleware

## Cobertura

- Mire em 80%+ de cobertura de linhas
- Concentre a cobertura na lógica de domínio, validação, autenticação e caminhos de falha
- Execute `dotnet test` na CI com coleta de cobertura habilitada onde disponível
