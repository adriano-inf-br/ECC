---
paths:
  - "**/*.fs"
  - "**/*.fsx"
  - "**/*.fsproj"
  - "**/appsettings*.json"
---
# Segurança F#

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de F#.

## Gerenciamento de Segredos

- Nunca embuta chaves de API, tokens ou strings de conexão diretamente no código-fonte
- Use variáveis de ambiente, user secrets para desenvolvimento local e um gerenciador de segredos em produção
- Mantenha os arquivos `appsettings.*.json` livres de credenciais reais

```fsharp
// RUIM
let apiKey = "sk-live-123"

// BOM
let apiKey =
    configuration["OpenAI:ApiKey"]
    |> Option.ofObj
    |> Option.defaultWith (fun () -> failwith "OpenAI:ApiKey is not configured.")
```

## Prevenção de Injeção SQL

- Sempre use consultas parametrizadas com ADO.NET, Dapper ou EF Core
- Nunca concatene entrada do usuário em strings SQL
- Valide campos de ordenação e operadores de filtro antes de usar composição dinâmica de consultas

```fsharp
let findByCustomer (connection: IDbConnection) customerId =
    task {
        let sql = "SELECT * FROM Orders WHERE CustomerId = @customerId"
        return! connection.QueryAsync<Order>(sql, {| customerId = customerId |})
    }
```

## Validação de Entrada

- Valide as entradas na fronteira da aplicação usando tipos
- Use single-case discriminated unions para valores validados
- Rejeite entrada inválida antes que ela entre na lógica de domínio

```fsharp
type ValidatedEmail = private ValidatedEmail of string

module ValidatedEmail =
    let create (input: string) =
        if System.Text.RegularExpressions.Regex.IsMatch(input, @"^[^@]+@[^@]+\.[^@]+$") then
            Ok(ValidatedEmail input)
        else
            Error "Invalid email address"

    let value (ValidatedEmail v) = v
```

## Autenticação e Autorização

- Prefira handlers de autenticação do framework em vez de parsing customizado de tokens
- Imponha políticas de autorização nas fronteiras de endpoint ou handler
- Nunca registre tokens crus, senhas ou PII (dados pessoais identificáveis) em log

## Tratamento de Erros

- Retorne mensagens seguras voltadas ao cliente
- Registre exceções detalhadas com contexto estruturado no lado do servidor
- Não exponha stack traces, texto SQL ou caminhos de sistema de arquivos em respostas de API

## Referências

Veja a skill: `security-review` para checklists mais amplos de revisão de segurança de aplicações.
