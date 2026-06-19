---
description: Revisão abrangente de código Python para conformidade com PEP 8, type hints, segurança e idiomas Pythônicos. Invoca o agent python-reviewer.
---

# Revisão de Código Python

Este comando invoca o agent **python-reviewer** para uma revisão abrangente de código específica de Python.

## O Que Este Comando Faz

1. **Identificar Alterações Python**: Encontra arquivos `.py` modificados via `git diff`
2. **Executar Análise Estática**: Roda `ruff`, `mypy`, `pylint`, `black --check`
3. **Varredura de Segurança**: Verifica injeção de SQL, injeção de comando, desserialização insegura
4. **Revisão de Segurança de Tipos**: Analisa type hints e erros do mypy
5. **Verificação de Código Pythônico**: Confirma que o código segue PEP 8 e as boas práticas de Python
6. **Gerar Relatório**: Categoriza os problemas por severidade

## Quando Usar

Use `/python-review` quando:
- Após escrever ou modificar código Python
- Antes de fazer commit de alterações em Python
- Ao revisar pull requests com código Python
- Ao se integrar a uma nova base de código Python
- Ao aprender padrões e idiomas Pythônicos

## Categorias de Revisão

### CRITICAL (Deve Corrigir)
- Vulnerabilidades de injeção de SQL/comando
- Uso inseguro de eval/exec
- Desserialização insegura com pickle
- Credenciais hardcoded
- Carregamento inseguro de YAML
- Cláusulas except vazias que ocultam erros

### HIGH (Deveria Corrigir)
- Type hints faltando em funções públicas
- Argumentos padrão mutáveis
- Engolir exceções silenciosamente
- Não usar context managers para recursos
- Laços ao estilo C em vez de comprehensions
- Usar type() em vez de isinstance()
- Condições de corrida sem locks

### MEDIUM (Considerar)
- Violações de formatação do PEP 8
- Docstrings faltando em funções públicas
- Instruções print em vez de logging
- Operações de string ineficientes
- Números mágicos sem constantes nomeadas
- Não usar f-strings para formatação
- Criação desnecessária de listas

## Verificações Automatizadas Executadas

```bash
# Type checking
mypy .

# Linting and formatting
ruff check .
black --check .
isort --check-only .

# Security scanning
bandit -r .

# Dependency audit
pip-audit
safety check

# Testing
pytest --cov=app --cov-report=term-missing
```

## Exemplo de Uso

```text
User: /python-review

Agent:
# Python Code Review Report

## Files Reviewed
- app/routes/user.py (modified)
- app/services/auth.py (modified)

## Static Analysis Results
✓ ruff: No issues
✓ mypy: No errors
WARNING: black: 2 files need reformatting
✓ bandit: No security issues

## Issues Found

[CRITICAL] SQL Injection vulnerability
File: app/routes/user.py:42
Issue: User input directly interpolated into SQL query
```python
query = f"SELECT * FROM users WHERE id = {user_id}"  # Bad
```
Fix: Use parameterized query
```python
query = "SELECT * FROM users WHERE id = %s"  # Good
cursor.execute(query, (user_id,))
```

[HIGH] Mutable default argument
File: app/services/auth.py:18
Issue: Mutable default argument causes shared state
```python
def process_items(items=[]):  # Bad
    items.append("new")
    return items
```
Fix: Use None as default
```python
def process_items(items=None):  # Good
    if items is None:
        items = []
    items.append("new")
    return items
```

[MEDIUM] Missing type hints
File: app/services/auth.py:25
Issue: Public function without type annotations
```python
def get_user(user_id):  # Bad
    return db.find(user_id)
```
Fix: Add type hints
```python
def get_user(user_id: str) -> Optional[User]:  # Good
    return db.find(user_id)
```

[MEDIUM] Not using context manager
File: app/routes/user.py:55
Issue: File not closed on exception
```python
f = open("config.json")  # Bad
data = f.read()
f.close()
```
Fix: Use context manager
```python
with open("config.json") as f:  # Good
    data = f.read()
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 2

Recommendation: FAIL: Block merge until CRITICAL issue is fixed

## Formatting Required
Run: `black app/routes/user.py app/services/auth.py`
```

## Approval Criteria

| Status | Condition |
|--------|-----------|
| PASS: Approve | No CRITICAL or HIGH issues |
| WARNING: Warning | Only MEDIUM issues (merge with caution) |
| FAIL: Block | CRITICAL or HIGH issues found |

## Integration with Other Commands

- Use the `tdd-workflow` skill first to ensure tests pass
- Use `/code-review` for non-Python specific concerns
- Use `/python-review` before committing
- Use `/build-fix` if static analysis tools fail

## Framework-Specific Reviews

### Django Projects
The reviewer checks for:
- N+1 query issues (use `select_related` and `prefetch_related`)
- Missing migrations for model changes
- Raw SQL usage when ORM could work
- Missing `transaction.atomic()` for multi-step operations

### FastAPI Projects
The reviewer checks for:
- CORS misconfiguration
- Pydantic models for request validation
- Response models correctness
- Proper async/await usage
- Dependency injection patterns

### Flask Projects
The reviewer checks for:
- Context management (app context, request context)
- Proper error handling
- Blueprint organization
- Configuration management

## Related

- Agent: `agents/python-reviewer.md`
- Skills: `skills/python-patterns/`, `skills/python-testing/`

## Common Fixes

### Add Type Hints
```python
# Before
def calculate(x, y):
    return x + y

# After
from typing import Union

def calculate(x: Union[int, float], y: Union[int, float]) -> Union[int, float]:
    return x + y
```

### Use Context Managers
```python
# Before
f = open("file.txt")
data = f.read()
f.close()

# After
with open("file.txt") as f:
    data = f.read()
```

### Use List Comprehensions
```python
# Before
result = []
for item in items:
    if item.active:
        result.append(item.name)

# After
result = [item.name for item in items if item.active]
```

### Fix Mutable Defaults
```python
# Before
def append(value, items=[]):
    items.append(value)
    return items

# After
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### Use f-strings (Python 3.6+)
```python
# Before
name = "Alice"
greeting = "Hello, " + name + "!"
greeting2 = "Hello, {}".format(name)

# After
greeting = f"Hello, {name}!"
```

### Fix String Concatenation in Loops
```python
# Before
result = ""
for item in items:
    result += str(item)

# After
result = "".join(str(item) for item in items)
```

## Python Version Compatibility

The reviewer notes when code uses features from newer Python versions:

| Feature | Minimum Python |
|---------|----------------|
| Type hints | 3.5+ |
| f-strings | 3.6+ |
| Walrus operator (`:=`) | 3.8+ |
| Position-only parameters | 3.8+ |
| Match statements | 3.10+ |
| Type unions (&#96;x &#124; None&#96;) | 3.10+ |

Ensure your project's `pyproject.toml` or `setup.py` specifies the correct minimum Python version.
