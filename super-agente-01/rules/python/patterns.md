---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Padrões do Python

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Python.

## Protocol (Duck Typing)

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

## Dataclasses como DTOs

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## Context Managers e Generators

- Use context managers (instrução `with`) para gerenciamento de recursos
- Use generators para avaliação preguiçosa (lazy) e iteração eficiente em memória

## Referência

Veja a skill: `python-patterns` para padrões abrangentes incluindo decorators, concorrência e organização de pacotes.
