---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Segurança do Python

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Python.

## Gerenciamento de Segredos

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # Lança KeyError se ausente
```

## Varredura de Segurança

- Use **bandit** para análise estática de segurança:
  ```bash
  bandit -r src/
  ```

## Referência

Veja a skill: `django-security` para diretrizes de segurança específicas do Django (se aplicável).
