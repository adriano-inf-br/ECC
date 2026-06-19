# Requisitos de Teste

## Cobertura Mínima de Testes: 80%

Tipos de Teste (TODOS obrigatórios):
1. **Testes Unitários** - Funções, utilitários e componentes individuais
2. **Testes de Integração** - Endpoints de API, operações de banco de dados
3. **Testes E2E** - Fluxos críticos do usuário (framework escolhido por linguagem)

## Desenvolvimento Orientado a Testes (TDD)

Fluxo de trabalho OBRIGATÓRIO:
1. Escreva o teste primeiro (RED)
2. Execute o teste - ele deve FALHAR
3. Escreva a implementação mínima (GREEN)
4. Execute o teste - ele deve PASSAR
5. Refatore (IMPROVE)
6. Verifique a cobertura (80% ou mais)

## Solução de Problemas em Falhas de Teste

1. Use o agent **tdd-guide**
2. Verifique o isolamento dos testes
3. Verifique se os mocks estão corretos
4. Corrija a implementação, não os testes (a menos que os testes estejam errados)

## Suporte de Agents

- **tdd-guide** - Use PROATIVAMENTE para novas funcionalidades; impõe escrever os testes primeiro

## Estrutura de Teste (Padrão AAA)

Prefira a estrutura Arrange-Act-Assert para os testes:

```typescript
test('calculates similarity correctly', () => {
  // Arrange (Preparar)
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act (Agir)
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert (Verificar)
  expect(similarity).toBe(0)
})
```

### Nomeação de Testes

Use nomes descritivos que expliquem o comportamento em teste:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```
