---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# Estilo de Código C#

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de C#.

## Padrões

- Siga as convenções atuais do .NET e habilite os nullable reference types
- Prefira modificadores de acesso explícitos em APIs public e internal
- Mantenha os arquivos alinhados com o tipo principal que eles definem

## Tipos e Modelos

- Prefira `record` ou `record struct` para modelos imutáveis semelhantes a valores
- Use `class` para entidades ou tipos com identidade e ciclo de vida
- Use `interface` para limites de serviço e abstrações
- Evite `dynamic` no código da aplicação; prefira generics ou modelos explícitos

```csharp
public sealed record UserDto(Guid Id, string Email);

public interface IUserRepository
{
    Task<UserDto?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
}
```

## Imutabilidade

- Prefira setters `init`, parâmetros de construtor e coleções imutáveis para estado compartilhado
- Não mute modelos de entrada in-place ao produzir um estado atualizado

```csharp
public sealed record UserProfile(string Name, string Email);

public static UserProfile Rename(UserProfile profile, string name) =>
    profile with { Name = name };
```

## Async e Tratamento de Erros

- Prefira `async`/`await` em vez de chamadas bloqueantes como `.Result` ou `.Wait()`
- Propague o `CancellationToken` através das APIs async públicas
- Lance exceções específicas e registre logs com propriedades estruturadas

```csharp
public async Task<Order> LoadOrderAsync(
    Guid orderId,
    CancellationToken cancellationToken)
{
    try
    {
        return await repository.FindAsync(orderId, cancellationToken)
            ?? throw new InvalidOperationException($"Order {orderId} was not found.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to load order {OrderId}", orderId);
        throw;
    }
}
```

## Formatação

- Use `dotnet format` para formatação e correções de analyzer
- Mantenha as diretivas `using` organizadas e remova os imports não utilizados
- Prefira membros com corpo de expressão (expression-bodied) somente quando permanecerem legíveis
