---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
  - "**/appsettings*.json"
---
# Segurança C#

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de C#.

## Gerenciamento de Segredos

- Nunca embuta chaves de API, tokens ou strings de conexão diretamente no código-fonte
- Use variáveis de ambiente, user secrets para desenvolvimento local e um gerenciador de segredos em produção
- Mantenha os arquivos `appsettings.*.json` livres de credenciais reais

```csharp
// RUIM
const string ApiKey = "sk-live-123";

// BOM
var apiKey = builder.Configuration["OpenAI:ApiKey"]
    ?? throw new InvalidOperationException("OpenAI:ApiKey is not configured.");
```

## Prevenção de Injeção SQL

- Sempre use consultas parametrizadas com ADO.NET, Dapper ou EF Core
- Nunca concatene entrada do usuário em strings SQL
- Valide campos de ordenação e operadores de filtro antes de usar composição dinâmica de consultas

```csharp
const string sql = "SELECT * FROM Orders WHERE CustomerId = @customerId";
await connection.QueryAsync<Order>(sql, new { customerId });
```

## Validação de Entrada

- Valide DTOs na fronteira da aplicação
- Use data annotations, FluentValidation ou cláusulas de guarda explícitas
- Rejeite estado de modelo inválido antes de executar a lógica de negócio

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
