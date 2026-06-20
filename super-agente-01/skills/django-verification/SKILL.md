---
name: django-verification
description: "Loop de verificação para projetos Django: migrações, linting, testes com cobertura, varreduras de segurança e checagens de prontidão para deploy antes de um release ou PR."
metadata:
  origin: ECC
---

# Loop de Verificação do Django

Execute antes de PRs, após mudanças importantes e antes do deploy para garantir a qualidade e a segurança da aplicação Django.

## Quando Ativar

- Antes de abrir um pull request para um projeto Django
- Após mudanças importantes em models, atualizações de migração ou upgrades de dependências
- Verificação pré-deploy para staging ou produção
- Executar o pipeline completo de ambiente → lint → teste → segurança → prontidão para deploy
- Validar a segurança das migrações e a cobertura de testes

## Fase 1: Verificação de Ambiente

```bash
# Verifica a versão do Python
python --version  # Deve corresponder aos requisitos do projeto

# Verifica o ambiente virtual
which python
pip list --outdated

# Verifica as variáveis de ambiente
python -c "import os; import environ; print('DJANGO_SECRET_KEY set' if os.environ.get('DJANGO_SECRET_KEY') else 'MISSING: DJANGO_SECRET_KEY')"
```

Se o ambiente estiver mal configurado, pare e corrija.

## Fase 2: Qualidade e Formatação de Código

```bash
# Verificação de tipos
mypy . --config-file pyproject.toml

# Linting com ruff
ruff check . --fix

# Formatação com black
black . --check
black .  # Correção automática

# Ordenação de imports
isort . --check-only
isort .  # Correção automática

# Checagens específicas do Django
python manage.py check --deploy
```

Problemas comuns:
- Type hints ausentes em funções públicas
- Violações de formatação PEP 8
- Imports não ordenados
- Configurações de debug deixadas na configuração de produção

## Fase 3: Migrações

```bash
# Verifica migrações não aplicadas
python manage.py showmigrations

# Cria migrações ausentes
python manage.py makemigrations --check

# Simulação (dry-run) da aplicação de migrações
python manage.py migrate --plan

# Aplica as migrações (ambiente de teste)
python manage.py migrate

# Verifica conflitos de migração
python manage.py makemigrations --merge  # Apenas se houver conflitos
```

Relate:
- Número de migrações pendentes
- Quaisquer conflitos de migração
- Mudanças em models sem migrações

## Fase 4: Testes + Cobertura

```bash
# Executa todos os testes com pytest
pytest --cov=apps --cov-report=html --cov-report=term-missing --reuse-db

# Executa os testes de um app específico
pytest apps/users/tests/

# Executa com markers
pytest -m "not slow"  # Pula testes lentos
pytest -m integration  # Apenas testes de integração

# Relatório de cobertura
open htmlcov/index.html
```

Relate:
- Total de testes: X aprovados, Y falharam, Z pulados
- Cobertura geral: XX%
- Detalhamento da cobertura por app

Metas de cobertura:

| Componente | Alvo |
|-----------|--------|
| Models | 90%+ |
| Serializers | 85%+ |
| Views | 80%+ |
| Services | 90%+ |
| Geral | 80%+ |

## Fase 5: Varredura de Segurança

```bash
# Vulnerabilidades de dependências
pip-audit
safety check --full-report

# Checagens de segurança do Django
python manage.py check --deploy

# Linter de segurança Bandit
bandit -r . -f json -o bandit-report.json

# Varredura de segredos (se o gitleaks estiver instalado)
gitleaks detect --source . --verbose

# Verificação de variável de ambiente
python -c "from django.core.exceptions import ImproperlyConfigured; from django.conf import settings; settings.DEBUG"
```

Relate:
- Dependências vulneráveis encontradas
- Problemas de configuração de segurança
- Segredos hardcoded detectados
- Status do modo DEBUG (deve ser False em produção)

## Fase 6: Comandos de Gerenciamento do Django

```bash
# Verifica problemas em models
python manage.py check

# Coleta os arquivos estáticos
python manage.py collectstatic --noinput --clear

# Cria superusuário (se necessário para os testes)
echo "from apps.users.models import User; User.objects.create_superuser('admin@example.com', 'admin')" | python manage.py shell

# Integridade do banco de dados
python manage.py check --database default

# Verificação de cache (se estiver usando Redis)
python -c "from django.core.cache import cache; cache.set('test', 'value', 10); print(cache.get('test'))"
```

## Fase 7: Checagens de Performance

```bash
# Saída do Django Debug Toolbar (verifique consultas N+1)
# Execute em modo dev com DEBUG=True e acesse uma página
# Procure por consultas duplicadas no painel SQL

# Análise de contagem de consultas
django-admin debugsqlshell  # Se o django-debug-sqlshell estiver instalado

# Verifica índices ausentes
python manage.py shell << EOF
from django.db import connection
with connection.cursor() as cursor:
    cursor.execute("SELECT table_name, index_name FROM information_schema.statistics WHERE table_schema = 'public'")
    print(cursor.fetchall())
EOF
```

Relate:
- Número de consultas por página (deve ser < 50 para páginas típicas)
- Índices de banco de dados ausentes
- Consultas duplicadas detectadas

## Fase 8: Assets Estáticos

```bash
# Verifica dependências do npm (se estiver usando npm)
npm audit
npm audit fix

# Faz o build dos arquivos estáticos (se estiver usando webpack/vite)
npm run build

# Verifica os arquivos estáticos
ls -la staticfiles/
python manage.py findstatic css/style.css
```

## Fase 9: Revisão de Configuração

```python
# Execute no shell do Python para verificar as configurações
python manage.py shell << EOF
from django.conf import settings
import os

# Checagens críticas
checks = {
    'DEBUG is False': not settings.DEBUG,
    'SECRET_KEY set': bool(settings.SECRET_KEY and len(settings.SECRET_KEY) > 30),
    'ALLOWED_HOSTS set': len(settings.ALLOWED_HOSTS) > 0,
    'HTTPS enabled': getattr(settings, 'SECURE_SSL_REDIRECT', False),
    'HSTS enabled': getattr(settings, 'SECURE_HSTS_SECONDS', 0) > 0,
    'Database configured': settings.DATABASES['default']['ENGINE'] != 'django.db.backends.sqlite3',
}

for check, result in checks.items():
    status = '✓' if result else '✗'
    print(f"{status} {check}")
EOF
```

## Fase 10: Configuração de Logging

```bash
# Testa a saída de logging
python manage.py shell << EOF
import logging
logger = logging.getLogger('django')
logger.warning('Test warning message')
logger.error('Test error message')
EOF

# Verifica os arquivos de log (se configurados)
tail -f /var/log/django/django.log
```

## Fase 11: Documentação da API (se DRF)

```bash
# Gera o schema
python manage.py generateschema --format openapi-json > schema.json

# Valida o schema
# Verifica se schema.json é um JSON válido
python -c "import json; json.load(open('schema.json'))"

# Acessa a Swagger UI (se estiver usando drf-yasg)
# Visite http://localhost:8000/swagger/ no navegador
```

## Fase 12: Revisão do Diff

```bash
# Mostra as estatísticas do diff
git diff --stat

# Mostra as alterações de fato
git diff

# Mostra os arquivos alterados
git diff --name-only

# Verifica problemas comuns
git diff | grep -i "todo\|fixme\|hack\|xxx"
git diff | grep "print("  # Declarações de debug
git diff | grep "DEBUG = True"  # Modo debug
git diff | grep "import pdb"  # Depurador
```

Checklist:
- Sem declarações de debug (print, pdb, breakpoint())
- Sem comentários TODO/FIXME em código crítico
- Sem segredos ou credenciais hardcoded
- Migrações de banco de dados incluídas para mudanças em models
- Mudanças de configuração documentadas
- Tratamento de erros presente para chamadas externas
- Gerenciamento de transações onde necessário

## Template de Saída

```
DJANGO VERIFICATION REPORT
==========================

Phase 1: Environment Check
  ✓ Python 3.11.5
  ✓ Virtual environment active
  ✓ All environment variables set

Phase 2: Code Quality
  ✓ mypy: No type errors
  ✗ ruff: 3 issues found (auto-fixed)
  ✓ black: No formatting issues
  ✓ isort: Imports properly sorted
  ✓ manage.py check: No issues

Phase 3: Migrations
  ✓ No unapplied migrations
  ✓ No migration conflicts
  ✓ All models have migrations

Phase 4: Tests + Coverage
  Tests: 247 passed, 0 failed, 5 skipped
  Coverage:
    Overall: 87%
    users: 92%
    products: 89%
    orders: 85%
    payments: 91%

Phase 5: Security Scan
  ✗ pip-audit: 2 vulnerabilities found (fix required)
  ✓ safety check: No issues
  ✓ bandit: No security issues
  ✓ No secrets detected
  ✓ DEBUG = False

Phase 6: Django Commands
  ✓ collectstatic completed
  ✓ Database integrity OK
  ✓ Cache backend reachable

Phase 7: Performance
  ✓ No N+1 queries detected
  ✓ Database indexes configured
  ✓ Query count acceptable

Phase 8: Static Assets
  ✓ npm audit: No vulnerabilities
  ✓ Assets built successfully
  ✓ Static files collected

Phase 9: Configuration
  ✓ DEBUG = False
  ✓ SECRET_KEY configured
  ✓ ALLOWED_HOSTS set
  ✓ HTTPS enabled
  ✓ HSTS enabled
  ✓ Database configured

Phase 10: Logging
  ✓ Logging configured
  ✓ Log files writable

Phase 11: API Documentation
  ✓ Schema generated
  ✓ Swagger UI accessible

Phase 12: Diff Review
  Files changed: 12
  +450, -120 lines
  ✓ No debug statements
  ✓ No hardcoded secrets
  ✓ Migrations included

RECOMMENDATION: WARNING: Fix pip-audit vulnerabilities before deploying

NEXT STEPS:
1. Update vulnerable dependencies
2. Re-run security scan
3. Deploy to staging for final testing
```

## Checklist Pré-Deploy

- [ ] Todos os testes passando
- [ ] Cobertura ≥ 80%
- [ ] Sem vulnerabilidades de segurança
- [ ] Sem migrações não aplicadas
- [ ] DEBUG = False nas configurações de produção
- [ ] SECRET_KEY configurada corretamente
- [ ] ALLOWED_HOSTS definido corretamente
- [ ] Backups do banco de dados habilitados
- [ ] Arquivos estáticos coletados e servidos
- [ ] Logging configurado e funcionando
- [ ] Monitoramento de erros (Sentry, etc.) configurado
- [ ] CDN configurado (se aplicável)
- [ ] Backend de Redis/cache configurado
- [ ] Workers do Celery em execução (se aplicável)
- [ ] HTTPS/SSL configurado
- [ ] Variáveis de ambiente documentadas

## Integração Contínua

### Exemplo de GitHub Actions

```yaml
# .github/workflows/django-verification.yml
name: Django Verification

on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - name: Cache pip
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}

      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install ruff black mypy pytest pytest-django pytest-cov bandit safety pip-audit

      - name: Code quality checks
        run: |
          ruff check .
          black . --check
          isort . --check-only
          mypy .

      - name: Security scan
        run: |
          bandit -r . -f json -o bandit-report.json
          safety check --full-report
          pip-audit

      - name: Run tests
        env:
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test
          DJANGO_SECRET_KEY: test-secret-key
        run: |
          pytest --cov=apps --cov-report=xml --cov-report=term-missing

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Referência Rápida

| Verificação | Comando |
|-------|---------|
| Ambiente | `python --version` |
| Verificação de tipos | `mypy .` |
| Linting | `ruff check .` |
| Formatação | `black . --check` |
| Migrações | `python manage.py makemigrations --check` |
| Testes | `pytest --cov=apps` |
| Segurança | `pip-audit && bandit -r .` |
| Django check | `python manage.py check --deploy` |
| Collectstatic | `python manage.py collectstatic --noinput` |
| Estatísticas do diff | `git diff --stat` |

Lembre-se: a verificação automatizada detecta problemas comuns, mas não substitui a revisão manual de código nem os testes em ambiente de staging.
