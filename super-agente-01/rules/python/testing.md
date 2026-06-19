---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Testes do Python

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Python.

## Framework

Use **pytest** como framework de testes.

## Cobertura

```bash
pytest --cov=src --cov-report=term-missing
```

## Organização dos Testes

Use `pytest.mark` para categorização de testes:

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_database_connection():
    ...
```

## Referência

Veja a skill: `python-testing` para padrões detalhados de pytest e fixtures.
