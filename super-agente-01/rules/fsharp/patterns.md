---
paths:
  - "**/*.fs"
  - "**/*.fsx"
---
# Padrões F#

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de F#.

## Tipo Result para Tratamento de Erros

Use `Result<'T, 'TError>` com programação orientada a trilhos (railway-oriented) em vez de exceções para falhas esperadas.

```fsharp
type OrderError =
    | InvalidCustomer of string
    | EmptyItems
    | ItemOutOfStock of sku: string

let validateOrder (request: CreateOrderRequest) : Result<ValidatedOrder, OrderError> =
    if String.IsNullOrWhiteSpace request.CustomerId then
        Error(InvalidCustomer "CustomerId is required")
    elif request.Items |> List.isEmpty then
        Error EmptyItems
    else
        Ok { CustomerId = request.CustomerId; Items = request.Items }
```

## Option para Valores Ausentes

Prefira `Option<'T>` em vez de null. Use `Option.map`, `Option.bind` e `Option.defaultValue` para transformar.

```fsharp
let findUser (id: Guid) : User option =
    users |> Map.tryFind id

let getUserEmail userId =
    findUser userId
    |> Option.map (fun u -> u.Email)
    |> Option.defaultValue "unknown@example.com"
```

## Discriminated Unions para Modelagem de Domínio

Modele estados de negócio explicitamente. O compilador impõe o tratamento exaustivo.

```fsharp
type PaymentState =
    | AwaitingPayment of amount: decimal
    | Paid of paidAt: DateTimeOffset * transactionId: string
    | Refunded of refundedAt: DateTimeOffset * reason: string
    | Failed of error: string

let describePayment = function
    | AwaitingPayment amount -> $"Awaiting payment of {amount:C}"
    | Paid (at, txn) -> $"Paid at {at} (txn: {txn})"
    | Refunded (at, reason) -> $"Refunded at {at}: {reason}"
    | Failed error -> $"Payment failed: {error}"
```

## Computation Expressions

Use computation expressions para simplificar operações sequenciais que podem falhar.

```fsharp
let placeOrder request =
    result {
        let! validated = validateOrder request
        let! inventory = checkInventory validated.Items
        let! order = createOrder validated inventory
        return order
    }
```

## Organização de Módulos

- Agrupe funções relacionadas em módulos em vez de classes
- Use `[<RequireQualifiedAccess>]` para evitar colisões de nomes
- Mantenha os módulos pequenos e focados em uma única responsabilidade

```fsharp
[<RequireQualifiedAccess>]
module Order =
    let create customerId items = { Id = Guid.NewGuid(); CustomerId = customerId; Items = items; Status = Pending }
    let confirm order = { order with Status = Confirmed(DateTimeOffset.UtcNow) }
    let cancel reason order = { order with Status = Cancelled reason }
```

## Injeção de Dependência

- Defina dependências como parâmetros de função ou record de funções
- Use interfaces com moderação, principalmente na fronteira com bibliotecas .NET
- Prefira aplicação parcial para injetar dependências em pipelines

```fsharp
type OrderDeps =
    { FindOrder: Guid -> Task<Order option>
      SaveOrder: Order -> Task<unit>
      SendNotification: Order -> Task<unit> }

let processOrder (deps: OrderDeps) orderId =
    task {
        match! deps.FindOrder orderId with
        | None -> return Error "Order not found"
        | Some order ->
            let confirmed = Order.confirm order
            do! deps.SaveOrder confirmed
            do! deps.SendNotification confirmed
            return Ok confirmed
    }
```
