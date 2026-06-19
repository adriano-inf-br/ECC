---
paths:
  - "**/*.cs"
  - "**/*.csx"
---
# Padrões C#

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de C#.

## Padrão de Resposta de API

```csharp
public sealed record ApiResponse<T>(
    bool Success,
    T? Data = default,
    string? Error = null,
    object? Meta = null);
```

## Padrão Repositório

```csharp
public interface IRepository<T>
{
    Task<IReadOnlyList<T>> FindAllAsync(CancellationToken cancellationToken);
    Task<T?> FindByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<T> CreateAsync(T entity, CancellationToken cancellationToken);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
```

## Padrão Options

Use opções fortemente tipadas para configuração em vez de ler strings cruas por toda a base de código.

```csharp
public sealed class PaymentsOptions
{
    public const string SectionName = "Payments";
    public required string BaseUrl { get; init; }
    public required string ApiKeySecretName { get; init; }
}
```

## Injeção de Dependência

- Dependa de interfaces nas fronteiras de serviço
- Mantenha os construtores focados; se um serviço precisa de dependências demais, separe responsabilidades
- Registre os tempos de vida intencionalmente: singleton para serviços sem estado/compartilhados, scoped para dados de requisição, transient para workers leves e puros
