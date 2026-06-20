---
paths:
  - "**/*.fs"
  - "**/*.fsx"
---
# Estilo de Código F#

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de F#.

## Padrões

- Siga as convenções padrão de F# e aproveite o sistema de tipos para garantir a corretude
- Prefira imutabilidade por padrão; use `mutable` apenas quando justificado por desempenho
- Mantenha os módulos focados e coesos

## Tipos e Modelos

- Prefira discriminated unions para modelagem de domínio em vez de hierarquias de classes
- Use records para dados com campos nomeados
- Use single-case unions para wrappers type-safe ao redor de primitivos
- Evite classes a menos que interoperabilidade ou estado mutável as exijam

```fsharp
type EmailAddress = EmailAddress of string

type OrderStatus =
    | Pending
    | Confirmed of confirmedAt: DateTimeOffset
    | Shipped of trackingNumber: string
    | Cancelled of reason: string

type Order =
    { Id: Guid
      CustomerId: string
      Status: OrderStatus
      Items: OrderItem list }
```

## Imutabilidade

- Records são imutáveis por padrão; use expressões `with` para atualizações
- Prefira `list`, `map`, `set` em vez de coleções mutáveis
- Evite células `ref` e campos mutáveis na lógica de domínio

```fsharp
let rename (profile: UserProfile) newName =
    { profile with Name = newName }
```

## Estilo de Função

- Prefira funções pequenas e componíveis em vez de métodos grandes
- Use o operador pipe `|>` para construir pipelines de dados legíveis
- Prefira correspondência de padrões em vez de cadeias if/else
- Use `Option` em vez de null; use `Result` para operações que podem falhar

```fsharp
let processOrder order =
    order
    |> validateItems
    |> Result.bind calculateTotal
    |> Result.map applyDiscount
    |> Result.mapError OrderError
```

## Async e Tratamento de Erros

- Use `task { }` para interoperabilidade com APIs assíncronas do .NET
- Use `async { }` para workflows assíncronos nativos do F#
- Propague o `CancellationToken` através das APIs assíncronas públicas
- Prefira `Result` e programação orientada a trilhos (railway-oriented) em vez de exceções para falhas esperadas

```fsharp
let loadOrderAsync (orderId: Guid) (ct: CancellationToken) =
    task {
        let! order = repository.FindAsync(orderId, ct)
        return
            order
            |> Option.defaultWith (fun () ->
                failwith $"Order {orderId} was not found.")
    }
```

## Formatação

- Use `fantomas` para formatação automática
- Prefira espaço em branco significativo; evite parênteses desnecessários
- Remova declarações `open` não utilizadas

### Ordem das Declarações Open

Agrupe as declarações `open` em quatro seções separadas por uma linha em branco, cada seção ordenada lexicamente dentro de si:

1. `System.*`
2. `Microsoft.*`
3. Namespaces de terceiros
4. Namespaces próprios / do projeto

```fsharp
open System
open System.Collections.Generic
open System.Threading.Tasks

open Microsoft.AspNetCore.Http
open Microsoft.Extensions.Logging

open FsCheck.Xunit
open Swensen.Unquote

open MyApp.Domain
open MyApp.Infrastructure
```
