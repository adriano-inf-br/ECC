---
name: django-tdd
description: Estratégias de teste no Django com pytest-django, metodologia TDD, factory_boy, mocking, cobertura e testes de APIs com Django REST Framework.
metadata:
  origin: ECC
---

# Testes no Django com TDD

Desenvolvimento orientado a testes para aplicações Django usando pytest, factory_boy e Django REST Framework.

## Quando Ativar

- Escrever novas aplicações Django
- Implementar APIs com Django REST Framework
- Testar models, views e serializers do Django
- Configurar a infraestrutura de testes para projetos Django

## Fluxo de trabalho de TDD para Django

### Ciclo Red-Green-Refactor

```python
# Passo 1: RED - Escreva um teste que falha
def test_user_creation():
    user = User.objects.create_user(email='test@example.com', password='testpass123')
    assert user.email == 'test@example.com'
    assert user.check_password('testpass123')
    assert not user.is_staff

# Passo 2: GREEN - Faça o teste passar
# Crie o model User ou a factory

# Passo 3: REFACTOR - Melhore mantendo os testes verdes
```

## Configuração

### Configuração do pytest

```ini
# pytest.ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.test
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts =
    --reuse-db
    --nomigrations
    --cov=apps
    --cov-report=html
    --cov-report=term-missing
    --strict-markers
markers =
    slow: marca testes como lentos
    integration: marca testes como testes de integração
```

### Configurações de Teste

```python
# config/settings/test.py
from .base import *

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Desabilita migrações por velocidade
class DisableMigrations:
    def __contains__(self, item):
        return True

    def __getitem__(self, item):
        return None

MIGRATION_MODULES = DisableMigrations()

# Hashing de senha mais rápido
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Backend de e-mail
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Celery sempre em modo eager
CELERY_TASK_ALWAYS_EAGER = True
CELERY_TASK_EAGER_PROPAGATES = True
```

### conftest.py

```python
# tests/conftest.py
import pytest
from django.utils import timezone
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture(autouse=True)
def timezone_settings(settings):
    """Garante um fuso horário consistente."""
    settings.TIME_ZONE = 'UTC'

@pytest.fixture
def user(db):
    """Cria um usuário de teste."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123',
        username='testuser'
    )

@pytest.fixture
def admin_user(db):
    """Cria um usuário admin."""
    return User.objects.create_superuser(
        email='admin@example.com',
        password='adminpass123',
        username='admin'
    )

@pytest.fixture
def authenticated_client(client, user):
    """Retorna um client autenticado."""
    client.force_login(user)
    return client

@pytest.fixture
def api_client():
    """Retorna o API client do DRF."""
    from rest_framework.test import APIClient
    return APIClient()

@pytest.fixture
def authenticated_api_client(api_client, user):
    """Retorna um API client autenticado."""
    api_client.force_authenticate(user=user)
    return api_client
```

## Factory Boy

### Configuração das Factories

```python
# tests/factories.py
import factory
from factory import fuzzy
from datetime import datetime, timedelta
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    """Factory para o model User."""

    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    username = factory.Sequence(lambda n: f"user{n}")
    password = factory.PostGenerationMethodCall('set_password', 'testpass123')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True

class CategoryFactory(factory.django.DjangoModelFactory):
    """Factory para o model Category."""

    class Meta:
        model = Category

    name = factory.Faker('word')
    slug = factory.LazyAttribute(lambda obj: obj.name.lower())
    description = factory.Faker('text')

class ProductFactory(factory.django.DjangoModelFactory):
    """Factory para o model Product."""

    class Meta:
        model = Product

    name = factory.Faker('sentence', nb_words=3)
    slug = factory.LazyAttribute(lambda obj: obj.name.lower().replace(' ', '-'))
    description = factory.Faker('text')
    price = fuzzy.FuzzyDecimal(10.00, 1000.00, 2)
    stock = fuzzy.FuzzyInteger(0, 100)
    is_active = True
    category = factory.SubFactory(CategoryFactory)
    created_by = factory.SubFactory(UserFactory)

    @factory.post_generation
    def tags(self, create, extracted, **kwargs):
        """Adiciona tags ao produto."""
        if not create:
            return
        if extracted:
            for tag in extracted:
                self.tags.add(tag)
```

### Usando Factories

```python
# tests/test_models.py
import pytest
from tests.factories import ProductFactory, UserFactory

def test_product_creation():
    """Testa a criação de produto usando a factory."""
    product = ProductFactory(price=100.00, stock=50)
    assert product.price == 100.00
    assert product.stock == 50
    assert product.is_active is True

def test_product_with_tags():
    """Testa um produto com tags."""
    tags = [TagFactory(name='electronics'), TagFactory(name='new')]
    product = ProductFactory(tags=tags)
    assert product.tags.count() == 2

def test_multiple_products():
    """Testa a criação de múltiplos produtos."""
    products = ProductFactory.create_batch(10)
    assert len(products) == 10
```

## Testes de Models

### Testes de Models

```python
# tests/test_models.py
import pytest
from django.core.exceptions import ValidationError
from tests.factories import UserFactory, ProductFactory

class TestUserModel:
    """Testa o model User."""

    def test_create_user(self, db):
        """Testa a criação de um usuário comum."""
        user = UserFactory(email='test@example.com')
        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert not user.is_staff
        assert not user.is_superuser

    def test_create_superuser(self, db):
        """Testa a criação de um superusuário."""
        user = UserFactory(
            email='admin@example.com',
            is_staff=True,
            is_superuser=True
        )
        assert user.is_staff
        assert user.is_superuser

    def test_user_str(self, db):
        """Testa a representação em string do usuário."""
        user = UserFactory(email='test@example.com')
        assert str(user) == 'test@example.com'

class TestProductModel:
    """Testa o model Product."""

    def test_product_creation(self, db):
        """Testa a criação de um produto."""
        product = ProductFactory()
        assert product.id is not None
        assert product.is_active is True
        assert product.created_at is not None

    def test_product_slug_generation(self, db):
        """Testa a geração automática de slug."""
        product = ProductFactory(name='Test Product')
        assert product.slug == 'test-product'

    def test_product_price_validation(self, db):
        """Testa que o preço não pode ser negativo."""
        product = ProductFactory(price=-10)
        with pytest.raises(ValidationError):
            product.full_clean()

    def test_product_manager_active(self, db):
        """Testa o método active do manager."""
        ProductFactory.create_batch(5, is_active=True)
        ProductFactory.create_batch(3, is_active=False)

        active_count = Product.objects.active().count()
        assert active_count == 5

    def test_product_stock_management(self, db):
        """Testa o gerenciamento de estoque."""
        product = ProductFactory(stock=10)
        product.reduce_stock(5)
        product.refresh_from_db()
        assert product.stock == 5

        with pytest.raises(ValueError):
            product.reduce_stock(10)  # Estoque insuficiente
```

## Testes de Views

### Testes de Views do Django

```python
# tests/test_views.py
import pytest
from django.urls import reverse
from tests.factories import ProductFactory, UserFactory

class TestProductViews:
    """Testa as views de produto."""

    def test_product_list(self, client, db):
        """Testa a view de listagem de produtos."""
        ProductFactory.create_batch(10)

        response = client.get(reverse('products:list'))

        assert response.status_code == 200
        assert len(response.context['products']) == 10

    def test_product_detail(self, client, db):
        """Testa a view de detalhe do produto."""
        product = ProductFactory()

        response = client.get(reverse('products:detail', kwargs={'slug': product.slug}))

        assert response.status_code == 200
        assert response.context['product'] == product

    def test_product_create_requires_login(self, client, db):
        """Testa que a criação de produto exige autenticação."""
        response = client.get(reverse('products:create'))

        assert response.status_code == 302
        assert response.url.startswith('/accounts/login/')

    def test_product_create_authenticated(self, authenticated_client, db):
        """Testa a criação de produto como usuário autenticado."""
        response = authenticated_client.get(reverse('products:create'))

        assert response.status_code == 200

    def test_product_create_post(self, authenticated_client, db, category):
        """Testa a criação de um produto via POST."""
        data = {
            'name': 'Test Product',
            'description': 'A test product',
            'price': '99.99',
            'stock': 10,
            'category': category.id,
        }

        response = authenticated_client.post(reverse('products:create'), data)

        assert response.status_code == 302
        assert Product.objects.filter(name='Test Product').exists()
```

## Testes de API com DRF

### Testes de Serializer

```python
# tests/test_serializers.py
import pytest
from rest_framework.exceptions import ValidationError
from apps.products.serializers import ProductSerializer
from tests.factories import ProductFactory

class TestProductSerializer:
    """Testa o ProductSerializer."""

    def test_serialize_product(self, db):
        """Testa a serialização de um produto."""
        product = ProductFactory()
        serializer = ProductSerializer(product)

        data = serializer.data

        assert data['id'] == product.id
        assert data['name'] == product.name
        assert data['price'] == str(product.price)

    def test_deserialize_product(self, db):
        """Testa a desserialização dos dados de produto."""
        data = {
            'name': 'Test Product',
            'description': 'Test description',
            'price': '99.99',
            'stock': 10,
            'category': 1,
        }

        serializer = ProductSerializer(data=data)

        assert serializer.is_valid()
        product = serializer.save()

        assert product.name == 'Test Product'
        assert float(product.price) == 99.99

    def test_price_validation(self, db):
        """Testa a validação de preço."""
        data = {
            'name': 'Test Product',
            'price': '-10.00',
            'stock': 10,
        }

        serializer = ProductSerializer(data=data)

        assert not serializer.is_valid()
        assert 'price' in serializer.errors

    def test_stock_validation(self, db):
        """Testa que o estoque não pode ser negativo."""
        data = {
            'name': 'Test Product',
            'price': '99.99',
            'stock': -5,
        }

        serializer = ProductSerializer(data=data)

        assert not serializer.is_valid()
        assert 'stock' in serializer.errors
```

### Testes de ViewSet da API

```python
# tests/test_api.py
import pytest
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
from tests.factories import ProductFactory, UserFactory

class TestProductAPI:
    """Testa os endpoints da API de Product."""

    @pytest.fixture
    def api_client(self):
        """Retorna o API client."""
        return APIClient()

    def test_list_products(self, api_client, db):
        """Testa a listagem de produtos."""
        ProductFactory.create_batch(10)

        url = reverse('api:product-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 10

    def test_retrieve_product(self, api_client, db):
        """Testa a recuperação de um produto."""
        product = ProductFactory()

        url = reverse('api:product-detail', kwargs={'pk': product.id})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == product.id

    def test_create_product_unauthorized(self, api_client, db):
        """Testa a criação de produto sem autenticação."""
        url = reverse('api:product-list')
        data = {'name': 'Test Product', 'price': '99.99'}

        response = api_client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_create_product_authorized(self, authenticated_api_client, db):
        """Testa a criação de produto como usuário autenticado."""
        url = reverse('api:product-list')
        data = {
            'name': 'Test Product',
            'description': 'Test',
            'price': '99.99',
            'stock': 10,
        }

        response = authenticated_api_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['name'] == 'Test Product'

    def test_update_product(self, authenticated_api_client, db):
        """Testa a atualização de um produto."""
        product = ProductFactory(created_by=authenticated_api_client.user)

        url = reverse('api:product-detail', kwargs={'pk': product.id})
        data = {'name': 'Updated Product'}

        response = authenticated_api_client.patch(url, data)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['name'] == 'Updated Product'

    def test_delete_product(self, authenticated_api_client, db):
        """Testa a exclusão de um produto."""
        product = ProductFactory(created_by=authenticated_api_client.user)

        url = reverse('api:product-detail', kwargs={'pk': product.id})
        response = authenticated_api_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_filter_products_by_price(self, api_client, db):
        """Testa a filtragem de produtos por preço."""
        ProductFactory(price=50)
        ProductFactory(price=150)

        url = reverse('api:product-list')
        response = api_client.get(url, {'price_min': 100})

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1

    def test_search_products(self, api_client, db):
        """Testa a busca de produtos."""
        ProductFactory(name='Apple iPhone')
        ProductFactory(name='Samsung Galaxy')

        url = reverse('api:product-list')
        response = api_client.get(url, {'search': 'Apple'})

        assert response.status_code == status.HTTP_200_OK
        assert response.data['count'] == 1
```

## Mocking e Patching

### Fazendo Mock de Serviços Externos

```python
# tests/test_views.py
from unittest.mock import patch, Mock
import pytest

class TestPaymentView:
    """Testa a view de pagamento com o gateway de pagamento mockado."""

    @patch('apps.payments.services.stripe')
    def test_successful_payment(self, mock_stripe, client, user, product):
        """Testa um pagamento bem-sucedido com o Stripe mockado."""
        # Configura o mock
        mock_stripe.Charge.create.return_value = {
            'id': 'ch_123',
            'status': 'succeeded',
            'amount': 9999,
        }

        client.force_login(user)
        response = client.post(reverse('payments:process'), {
            'product_id': product.id,
            'token': 'tok_visa',
        })

        assert response.status_code == 302
        mock_stripe.Charge.create.assert_called_once()

    @patch('apps.payments.services.stripe')
    def test_failed_payment(self, mock_stripe, client, user, product):
        """Testa um pagamento que falha."""
        mock_stripe.Charge.create.side_effect = Exception('Card declined')

        client.force_login(user)
        response = client.post(reverse('payments:process'), {
            'product_id': product.id,
            'token': 'tok_visa',
        })

        assert response.status_code == 302
        assert 'error' in response.url
```

### Fazendo Mock do Envio de E-mail

```python
# tests/test_email.py
from django.core import mail
from django.test import override_settings

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
def test_order_confirmation_email(db, order):
    """Testa o e-mail de confirmação do pedido."""
    order.send_confirmation_email()

    assert len(mail.outbox) == 1
    assert order.user.email in mail.outbox[0].to
    assert 'Order Confirmation' in mail.outbox[0].subject
```

## Testes de Integração

### Testes de Fluxo Completo

```python
# tests/test_integration.py
import pytest
from django.urls import reverse
from tests.factories import UserFactory, ProductFactory

class TestCheckoutFlow:
    """Testa o fluxo completo de checkout."""

    def test_guest_to_purchase_flow(self, client, db):
        """Testa o fluxo completo, de visitante até a compra."""
        # Passo 1: Registro
        response = client.post(reverse('users:register'), {
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
        })
        assert response.status_code == 302

        # Passo 2: Login
        response = client.post(reverse('users:login'), {
            'email': 'test@example.com',
            'password': 'testpass123',
        })
        assert response.status_code == 302

        # Passo 3: Navegar pelos produtos
        product = ProductFactory(price=100)
        response = client.get(reverse('products:detail', kwargs={'slug': product.slug}))
        assert response.status_code == 200

        # Passo 4: Adicionar ao carrinho
        response = client.post(reverse('cart:add'), {
            'product_id': product.id,
            'quantity': 1,
        })
        assert response.status_code == 302

        # Passo 5: Checkout
        response = client.get(reverse('checkout:review'))
        assert response.status_code == 200
        assert product.name in response.content.decode()

        # Passo 6: Concluir a compra
        with patch('apps.checkout.services.process_payment') as mock_payment:
            mock_payment.return_value = True
            response = client.post(reverse('checkout:complete'))

        assert response.status_code == 302
        assert Order.objects.filter(user__email='test@example.com').exists()
```

## Melhores Práticas de Teste

### FAÇA

- **Use factories**: Em vez de criação manual de objetos
- **Uma asserção por teste**: Mantenha os testes focados
- **Nomes de teste descritivos**: `test_user_cannot_delete_others_post`
- **Teste casos extremos**: Entradas vazias, valores None, condições de fronteira
- **Faça mock de serviços externos**: Não dependa de APIs externas
- **Use fixtures**: Elimine duplicação
- **Teste permissões**: Garanta que a autorização funcione
- **Mantenha os testes rápidos**: Use `--reuse-db` e `--nomigrations`

### NÃO FAÇA

- **Não teste o interno do Django**: Confie que o Django funciona
- **Não teste código de terceiros**: Confie que as bibliotecas funcionam
- **Não ignore testes que falham**: Todos os testes devem passar
- **Não torne os testes dependentes**: Os testes devem rodar em qualquer ordem
- **Não exagere no mock**: Faça mock apenas de dependências externas
- **Não teste métodos privados**: Teste a interface pública
- **Não use o banco de dados de produção**: Sempre use o banco de dados de teste

## Cobertura

### Configuração de Cobertura

```bash
# Executa os testes com cobertura
pytest --cov=apps --cov-report=html --cov-report=term-missing

# Gera o relatório HTML
open htmlcov/index.html
```

### Metas de Cobertura

| Componente | Cobertura Alvo |
|-----------|-----------------|
| Models | 90%+ |
| Serializers | 85%+ |
| Views | 80%+ |
| Services | 90%+ |
| Utilitários | 80%+ |
| Geral | 80%+ |

## Referência Rápida

| Padrão | Uso |
|---------|-------|
| `@pytest.mark.django_db` | Habilita o acesso ao banco de dados |
| `client` | Test client do Django |
| `api_client` | API client do DRF |
| `factory.create_batch(n)` | Cria múltiplos objetos |
| `patch('module.function')` | Faz mock de dependências externas |
| `override_settings` | Altera temporariamente as configurações |
| `force_authenticate()` | Ignora a autenticação nos testes |
| `assertRedirects` | Verifica redirecionamentos |
| `assertTemplateUsed` | Verifica o uso de template |
| `mail.outbox` | Verifica os e-mails enviados |

Lembre-se: testes são documentação. Bons testes explicam como o seu código deve funcionar. Mantenha-os simples, legíveis e fáceis de manter.
