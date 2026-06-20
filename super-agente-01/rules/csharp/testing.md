---
paths:
  - "**/*.cs"
  - "**/*.csx"
  - "**/*.csproj"
---
# Testes C#

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de C#.

## Framework de Testes

- Prefira **xUnit** para testes unitários e de integração
- Use **FluentAssertions** para asserções legíveis
- Use **Moq** ou **NSubstitute** para fazer mock de dependências
- Use **Testcontainers** quando testes de integração precisarem de infraestrutura real

## Organização dos Testes

- Espelhe a estrutura de `src/` sob `tests/`
- Separe claramente a cobertura unitária, de integração e end-to-end
- Nomeie testes pelo comportamento, não por detalhes de implementação

```csharp
public sealed class OrderServiceTests
{
    [Fact]
    public async Task FindByIdAsync_ReturnsOrder_WhenOrderExists()
    {
        // Arrange (preparar)
        // Act (agir)
        // Assert (verificar)
    }
}
```

## Testes de Integração ASP.NET Core

- Use `WebApplicationFactory<TEntryPoint>` para cobertura de integração de API
- Teste autenticação, validação e serialização através de HTTP, não contornando o middleware

## Cobertura

- Mire em 80%+ de cobertura de linhas
- Concentre a cobertura na lógica de domínio, validação, autenticação e caminhos de falha
- Execute `dotnet test` na CI com coleta de cobertura habilitada onde disponível
