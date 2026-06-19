---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Estilo de Código Python

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Python.

## Padrões

- Siga as convenções do **PEP 8**
- Use **type annotations** em todas as assinaturas de função

## Imutabilidade

Prefira estruturas de dados imutáveis:

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## Formatação

- **black** para formatação de código
- **isort** para ordenação de imports
- **ruff** para linting

## Referência

Veja a skill: `python-patterns` para idiomas e padrões abrangentes de Python.
