---
name: django-celery
description: Padrões de tarefas assíncronas em Django + Celery — configuração, design de tarefas, agendamento com beat, retries, workflows de canvas, monitoramento e testes. Use ao adicionar jobs em segundo plano, tarefas agendadas ou processamento assíncrono a uma app Django.
metadata:
  origin: ECC
---

# Django + Celery Async Task Patterns

Padrões de nível de produção para processamento de tarefas em segundo plano em Django usando Celery com Redis ou RabbitMQ.

## Quando Ativar

- Adicionar jobs em segundo plano ou processamento assíncrono a uma app Django
- Implementar tarefas periódicas/agendadas
- Descarregar operações lentas (email, geração de PDF, chamadas de API) do ciclo de requisição
- Configurar o Celery Beat para agendamento estilo cron
- Depurar falhas de tarefas, retries ou backlogs de fila
- Escrever testes para tarefas Celery

## Configuração do Projeto

### Instalação

```bash
pip install 'celery[redis]' django-celery-results django-celery-beat
```

### `celery.py` — Ponto de Entrada da App

```python
# config/celery.py
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('myproject')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()  # Descobre tasks.py em cada INSTALLED_APP

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
```

```python
# config/__init__.py
from .celery import app as celery_app

__all__ = ('celery_app',)
```

### Django Settings

```python
# config/settings/base.py

# Broker (Redis recomendado para produção)
CELERY_BROKER_URL = env('CELERY_BROKER_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = env('CELERY_RESULT_BACKEND', default='django-db')

# Serialização
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'

# Comportamento das tarefas
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 30 * 60        # Limite rígido: 30 min
CELERY_TASK_SOFT_TIME_LIMIT = 25 * 60   # Limite suave: envia SoftTimeLimitExceeded
CELERY_WORKER_PREFETCH_MULTIPLIER = 1   # Impede o worker de acumular tarefas longas
CELERY_TASK_ACKS_LATE = True            # Recoloca na fila em caso de crash do worker

# Persistência de resultados
CELERY_RESULT_EXPIRES = 60 * 60 * 24   # Mantém resultados por 24 horas

# Scheduler do beat (para tarefas periódicas)
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Apps instaladas
INSTALLED_APPS += [
    'django_celery_results',
    'django_celery_beat',
]
```

### Executando Workers

```bash
# Inicia o worker (desenvolvimento)
celery -A config worker --loglevel=info

# Inicia o scheduler do beat (tarefas periódicas)
celery -A config beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler

# Worker + beat combinados (somente dev, nunca produção)
celery -A config worker --beat --loglevel=info

# Produção: múltiplos workers com concorrência
celery -A config worker --loglevel=warning --concurrency=4 -Q default,high_priority
```

## Padrões de Design de Tarefas

### Tarefa Básica

```python
# apps/notifications/tasks.py
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task(name='notifications.send_welcome_email')
def send_welcome_email(user_id: int) -> None:
    """Envia email de boas-vindas a um usuário recém-registrado."""
    from apps.users.models import User
    from apps.notifications.services import EmailService

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        logger.warning('send_welcome_email: user %s not found', user_id)
        return  # Idempotente — não levanta exceção, a tarefa já é impossível de concluir

    EmailService.send_welcome(user)
    logger.info('Welcome email sent to user %s', user_id)
```

### Tarefa com Retry

```python
@shared_task(
    bind=True,
    name='integrations.sync_to_crm',
    max_retries=5,
    default_retry_delay=60,       # segundos antes do primeiro retry
    autoretry_for=(ConnectionError, TimeoutError),
    retry_backoff=True,           # backoff exponencial
    retry_backoff_max=600,        # limita em 10 minutos
    retry_jitter=True,            # aleatoriza para evitar thundering herd
)
def sync_contact_to_crm(self, contact_id: int) -> dict:
    """Sincroniza contato com CRM externo, com retry em falhas transitórias."""
    from apps.crm.services import CRMClient

    try:
        result = CRMClient().sync(contact_id)
        return result
    except CRMClient.RateLimitError as exc:
        # Delay de retry específico vindo do header da resposta
        raise self.retry(exc=exc, countdown=int(exc.retry_after))
```

### Padrão de Tarefa Idempotente

Projete tarefas de forma que possam rodar com segurança várias vezes com as mesmas entradas:

```python
@shared_task(name='orders.mark_shipped')
def mark_order_shipped(order_id: int, tracking_number: str) -> None:
    """Marca pedido como enviado — seguro para rodar várias vezes."""
    from apps.orders.models import Order

    updated = Order.objects.filter(
        pk=order_id,
        status=Order.Status.PROCESSING,    # Guarda: só atualiza se ainda não enviado
    ).update(
        status=Order.Status.SHIPPED,
        tracking_number=tracking_number,
    )

    if not updated:
        logger.info('mark_order_shipped: order %s already shipped or not found', order_id)
```

### Tarefa com Soft Time Limit

```python
from celery.exceptions import SoftTimeLimitExceeded

@shared_task(
    bind=True,
    name='reports.generate_pdf',
    soft_time_limit=120,
    time_limit=150,
)
def generate_pdf_report(self, report_id: int) -> str:
    """Gera relatório PDF com tratamento gracioso de timeout."""
    from apps.reports.services import PDFGenerator

    try:
        path = PDFGenerator.build(report_id)
        return path
    except SoftTimeLimitExceeded:
        # Limpa arquivos parciais antes do hard kill
        PDFGenerator.cleanup(report_id)
        raise
```

## Chamando Tarefas

```python
from datetime import timedelta
from django.utils import timezone

# Dispare e esqueça (async)
send_welcome_email.delay(user.pk)

# Agende no futuro
send_reminder.apply_async(args=[user.pk], countdown=3600)  # daqui a 1 hora
send_reminder.apply_async(args=[user.pk], eta=timezone.now() + timedelta(days=1))

# Aplique com roteamento de fila
sync_contact_to_crm.apply_async(args=[contact.pk], queue='high_priority')

# Rode sincronamente (somente testes / depuração)
result = generate_pdf_report.apply(args=[report.pk])
```

## Agendamento com Beat (Tarefas Periódicas)

### Agenda Definida em Código

```python
# config/settings/base.py
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'cleanup-expired-sessions': {
        'task': 'users.cleanup_expired_sessions',
        'schedule': crontab(hour=2, minute=0),   # 2h da manhã, diariamente
    },
    'sync-inventory': {
        'task': 'products.sync_inventory',
        'schedule': 60.0,                         # a cada 60 segundos
    },
    'weekly-digest': {
        'task': 'notifications.send_weekly_digest',
        'schedule': crontab(day_of_week='monday', hour=8, minute=0),
    },
}
```

### Agenda Definida em Banco de Dados (via django-celery-beat)

```python
# Gerencie tarefas periódicas pelo admin do Django ou por código
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json

schedule, _ = CrontabSchedule.objects.get_or_create(
    hour='*/6', minute='0',
    timezone='UTC',
)

PeriodicTask.objects.update_or_create(
    name='Sync inventory every 6 hours',
    defaults={
        'crontab': schedule,
        'task': 'products.sync_inventory',
        'args': json.dumps([]),
        'enabled': True,
    }
)
```

## Canvas: Encadeando e Agrupando Tarefas

```python
from celery import chain, group, chord

# Chain: roda tarefas sequencialmente, passando resultados
pipeline = chain(
    fetch_data.s(source_id),
    transform_data.s(),          # recebe o resultado de fetch_data como primeiro argumento
    load_to_warehouse.s(),
)
pipeline.delay()

# Group: roda tarefas em paralelo
parallel = group(
    send_welcome_email.s(user_id)
    for user_id in new_user_ids
)
parallel.delay()

# Chord: tarefas em paralelo + callback quando todas concluírem
result = chord(
    group(process_chunk.s(chunk) for chunk in data_chunks),
    aggregate_results.s(),       # chamado com a lista de resultados dos chunks
)
result.delay()
```

## Tratamento de Erros e Dead Letter Queue

```python
# apps/core/tasks.py
from celery.signals import task_failure

@task_failure.connect
def on_task_failure(sender, task_id, exception, args, kwargs, traceback, einfo, **kw):
    """Registra todas as falhas de tarefas no Sentry / alertas."""
    import sentry_sdk
    with sentry_sdk.new_scope() as scope:
        scope.set_context('celery', {
            'task': sender.name,
            'task_id': task_id,
            'args': args,
            'kwargs': kwargs,
        })
        sentry_sdk.capture_exception(exception)
```

```python
# Roteia tarefas falhas para a dead-letter queue após o máximo de retries
@shared_task(
    bind=True,
    max_retries=3,
    name='payments.charge_card',
)
def charge_card(self, order_id: int) -> None:
    from apps.payments.models import Order, FailedCharge

    try:
        _do_charge(order_id)
    except Exception as exc:
        if self.request.retries >= self.max_retries:
            # Persiste na tabela dead-letter para revisão manual
            FailedCharge.objects.create(
                order_id=order_id,
                error=str(exc),
                task_id=self.request.id,
            )
            return  # Não levanta exceção — a tarefa falhou permanentemente
        raise self.retry(exc=exc)
```

## Testando Tarefas Celery

### Teste Unitário (Sem Broker)

```python
# tests/test_tasks.py
import pytest
from unittest.mock import patch, MagicMock
from apps.notifications.tasks import send_welcome_email

class TestSendWelcomeEmail:

    @pytest.mark.django_db
    def test_sends_email_to_existing_user(self, user):
        with patch('apps.notifications.services.EmailService') as mock_email:
            send_welcome_email(user.pk)
            mock_email.send_welcome.assert_called_once_with(user)

    @pytest.mark.django_db
    def test_skips_missing_user_gracefully(self):
        """Não deve levantar exceção quando o usuário é deletado entre o enfileiramento e a execução."""
        send_welcome_email(99999)  # Usuário inexistente — não deve levantar exceção
```

### Teste de Integração com CELERY_TASK_ALWAYS_EAGER

```python
# config/settings/test.py
CELERY_TASK_ALWAYS_EAGER = True      # Roda as tarefas sincronamente nos testes
CELERY_TASK_EAGER_PROPAGATES = True  # Relevanta exceções das tarefas

# tests/test_integration.py
@pytest.mark.django_db
def test_registration_triggers_welcome_email(client):
    with patch('apps.notifications.services.EmailService') as mock_email:
        response = client.post('/api/users/', {
            'email': 'new@example.com',
            'password': 'strongpass123',
        })

    assert response.status_code == 201
    mock_email.send_welcome.assert_called_once()
```

### Testando Retries

```python
@pytest.mark.django_db
def test_task_retries_on_connection_error():
    with patch('apps.crm.services.CRMClient.sync') as mock_sync:
        mock_sync.side_effect = ConnectionError('timeout')

        with pytest.raises(ConnectionError):
            sync_contact_to_crm.apply(args=[1], throw=True)

        assert mock_sync.call_count == 1  # Apenas a primeira tentativa quando eager
```

## Monitoramento

```bash
# Inspeciona workers e filas ativos
celery -A config inspect active
celery -A config inspect stats
celery -A config inspect reserved

# Verifica os tamanhos das filas (Redis)
redis-cli llen celery

# Flower: monitor em tempo real baseado na web
pip install flower
celery -A config flower --port=5555
```

## Anti-Padrões

```python
# RUIM: Passar instâncias de model — podem estar desatualizadas no momento da execução
send_welcome_email.delay(user)        # Nunca passe objetos do ORM
send_welcome_email.delay(user.pk)     # Sempre passe PKs

# RUIM: Chamar tarefas sincronamente em views de produção
result = generate_report.apply()      # Bloqueia a thread da requisição

# RUIM: Tarefa não idempotente sem guardas
@shared_task
def charge_and_fulfill(order_id):
    order.charge()     # Pode cobrar duas vezes se a tarefa tiver retry!
    order.fulfill()

# BOM: Idempotente com guarda de status
@shared_task
def charge_and_fulfill(order_id):
    order = Order.objects.select_for_update().get(pk=order_id)
    if order.status != Order.Status.PENDING:
        return  # Já processado
    order.charge()
    order.fulfill()
```

## Checklist de Produção

| Verificação | Configuração |
|-------|---------|
| Worker reinicia em caso de crash | unidade `supervisord` ou `systemd` |
| `CELERY_TASK_ACKS_LATE = True` | Recoloca tarefas na fila em caso de crash do worker |
| `CELERY_WORKER_PREFETCH_MULTIPLIER = 1` | Distribuição justa de tarefas longas |
| Filas separadas por prioridade | `-Q default,high_priority,low_priority` |
| `CELERY_TASK_SOFT_TIME_LIMIT` definido | Timeout gracioso antes do hard kill |
| Integração com Sentry | Captura todos os sinais `task_failure` |
| Flower ou outro monitor | Visibilidade da profundidade das filas |
| Beat roda em um único nó apenas | Evita execução duplicada de tarefas agendadas |

## Skills Relacionadas

- `django-patterns` — ORM, camada de serviço e estrutura de projeto
- `django-tdd` — Testando models, views e services do Django
- `python-testing` — configuração e fixtures do pytest
```
