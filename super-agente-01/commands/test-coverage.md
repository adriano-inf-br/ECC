---
description: Analisa a cobertura, identifica lacunas e gera os testes faltantes rumo ao limite alvo.
---

# Test Coverage

Analise a cobertura de testes, identifique lacunas e gere os testes faltantes para atingir 80%+ de cobertura.

## Passo 1: Detecte o framework de teste

| Indicador | Comando de cobertura |
|-----------|-----------------|
| `jest.config.*` or `package.json` jest | `npx jest --coverage --coverageReporters=json-summary` |
| `vitest.config.*` | `npx vitest run --coverage` |
| `pytest.ini` / `pyproject.toml` pytest | `pytest --cov=src --cov-report=json` |
| `Cargo.toml` | `cargo llvm-cov --json` |
| `pom.xml` with JaCoCo | `mvn test jacoco:report` |
| `go.mod` | `go test -coverprofile=coverage.out ./...` |

## Passo 2: Analise o relatório de cobertura

1. Execute o comando de cobertura
2. Faça o parse da saída (resumo JSON ou saída do terminal)
3. Liste os arquivos **abaixo de 80% de cobertura**, ordenados do pior primeiro
4. Para cada arquivo com cobertura insuficiente, identifique:
   - Funções ou métodos não testados
   - Cobertura de branch faltante (if/else, switch, caminhos de erro)
   - Código morto que infla o denominador

## Passo 3: Gere os testes faltantes

Para cada arquivo com cobertura insuficiente, gere testes seguindo esta prioridade:

1. **Happy path** — Funcionalidade central com entradas válidas
2. **Tratamento de erros** — Entradas inválidas, dados faltantes, falhas de rede
3. **Casos extremos** — Arrays vazios, null/undefined, valores de fronteira (0, -1, MAX_INT)
4. **Cobertura de branch** — Cada if/else, case de switch, ternário

### Regras de geração de testes

- Coloque os testes ao lado do código-fonte: `foo.ts` → `foo.test.ts` (ou convenção do projeto)
- Use os padrões de teste existentes do projeto (estilo de import, biblioteca de assert, abordagem de mocking)
- Faça mock das dependências externas (banco de dados, APIs, sistema de arquivos)
- Cada teste deve ser independente — sem estado mutável compartilhado entre testes
- Nomeie os testes de forma descritiva: `test_create_user_with_duplicate_email_returns_409`

## Passo 4: Verifique

1. Execute a suíte de testes completa — todos os testes devem passar
2. Re-execute a cobertura — verifique a melhoria
3. Se ainda estiver abaixo de 80%, repita o Passo 3 para as lacunas restantes

## Passo 5: Reporte

Mostre a comparação antes/depois:

```
Coverage Report
──────────────────────────────
File                   Before  After
src/services/auth.ts   45%     88%
src/utils/validation.ts 32%    82%
──────────────────────────────
Overall:               67%     84%  PASS:
```

## Áreas de foco

- Funções com ramificação complexa (alta complexidade ciclomática)
- Tratadores de erro e blocos catch
- Funções utilitárias usadas em todo o código
- Tratadores de endpoint de API (fluxo request → response)
- Casos extremos: null, undefined, string vazia, array vazio, zero, números negativos
