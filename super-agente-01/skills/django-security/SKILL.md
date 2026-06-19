---
name: django-security
description: Melhores práticas de segurança no Django, autenticação, autorização, proteção CSRF, prevenção de Injeção SQL, prevenção de XSS e configurações de deploy seguras.
metadata:
  origin: ECC
---

# Melhores Práticas de Segurança no Django

Diretrizes abrangentes de segurança para aplicações Django, a fim de proteger contra vulnerabilidades comuns.

## Quando Ativar

- Configurar autenticação e autorização no Django
- Implementar permissões e papéis de usuário
- Configurar definições de segurança para produção
- Revisar uma aplicação Django em busca de problemas de segurança
- Fazer deploy de aplicações Django em produção

## Configurações Centrais de Segurança

### Configuração de Settings de Produção

```python
# settings/production.py
import os

DEBUG = False  # CRÍTICO: Nunca use True em produção

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Cabeçalhos de segurança
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000  # 1 ano
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS e Cookies
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'

# Chave secreta (deve ser definida via variável de ambiente)
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ImproperlyConfigured('DJANGO_SECRET_KEY environment variable is required')

# Validação de senha
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 12,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]
```

## Autenticação

### Model de Usuário Customizado

```python
# apps/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Model de usuário customizado para melhor segurança."""

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)

    USERNAME_FIELD = 'email'  # Usa o e-mail como username
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email

# settings/base.py
AUTH_USER_MODEL = 'users.User'
```

### Hashing de Senha

```python
# O Django usa PBKDF2 por padrão. Para segurança mais forte:
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',
]
```

### Gerenciamento de Sessão

```python
# Configuração de sessão
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'  # Ou 'db'
SESSION_CACHE_ALIAS = 'default'
SESSION_COOKIE_AGE = 3600 * 24 * 7  # 1 semana
SESSION_SAVE_EVERY_REQUEST = False
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # Melhor UX, porém menos seguro
```

## Autorização

### Permissões

```python
# models.py
from django.db import models
from django.contrib.auth.models import Permission

class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    class Meta:
        permissions = [
            ('can_publish', 'Can publish posts'),
            ('can_edit_others', 'Can edit posts of others'),
        ]

    def user_can_edit(self, user):
        """Verifica se o usuário pode editar este post."""
        return self.author == user or user.has_perm('app.can_edit_others')

# views.py
from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic import UpdateView

class PostUpdateView(LoginRequiredMixin, PermissionRequiredMixin, UpdateView):
    model = Post
    permission_required = 'app.can_edit_others'
    raise_exception = True  # Retorna 403 em vez de redirecionar

    def get_queryset(self):
        """Permite que os usuários editem apenas seus próprios posts."""
        return Post.objects.filter(author=self.request.user)
```

### Permissões Customizadas

```python
# permissions.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permite que apenas os proprietários editem objetos."""

    def has_object_permission(self, request, view, obj):
        # Permissões de leitura liberadas para qualquer requisição
        if request.method in permissions.SAFE_METHODS:
            return True

        # Permissões de escrita apenas para o proprietário
        return obj.author == request.user

class IsAdminOrReadOnly(permissions.BasePermission):
    """Permite que admins façam qualquer coisa; os demais, somente leitura."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class IsVerifiedUser(permissions.BasePermission):
    """Permite apenas usuários verificados."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_verified
```

### Controle de Acesso Baseado em Papéis (RBAC)

```python
# models.py
from django.contrib.auth.models import AbstractUser, Group

class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('moderator', 'Moderator'),
        ('user', 'Regular User'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='user')

    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    def is_moderator(self):
        return self.role in ['admin', 'moderator']

# Mixins
class AdminRequiredMixin:
    """Mixin para exigir o papel de admin."""

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_admin():
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied
        return super().dispatch(request, *args, **kwargs)
```

## Prevenção de Injeção SQL

### Proteção do ORM do Django

```python
# BOM: o ORM do Django escapa automaticamente os parâmetros
def get_user(username):
    return User.objects.get(username=username)  # Seguro

# BOM: usando parâmetros com raw()
def search_users(query):
    return User.objects.raw('SELECT * FROM users WHERE username = %s', [query])

# RUIM: Nunca interpole entrada do usuário diretamente
def get_user_bad(username):
    return User.objects.raw(f'SELECT * FROM users WHERE username = {username}')  # VULNERÁVEL!

# BOM: usando filter com escape adequado
def get_users_by_email(email):
    return User.objects.filter(email__iexact=email)  # Seguro

# BOM: usando objetos Q para consultas complexas
from django.db.models import Q
def search_users_complex(query):
    return User.objects.filter(
        Q(username__icontains=query) |
        Q(email__icontains=query)
    )  # Seguro
```

### Segurança Extra com raw()

```python
# Se você precisar usar SQL bruto, sempre use parâmetros
User.objects.raw(
    'SELECT * FROM users WHERE email = %s AND status = %s',
    [user_input_email, status]
)
```

## Prevenção de XSS

### Escape em Templates

```django
{# O Django escapa variáveis automaticamente por padrão - SEGURO #}
{{ user_input }}  {# HTML escapado #}

{# Marque como safe explicitamente apenas para conteúdo confiável #}
{{ trusted_html|safe }}  {# Não escapado #}

{# Use filtros de template para HTML seguro #}
{{ user_input|escape }}  {# Igual ao padrão #}
{{ user_input|striptags }}  {# Remove todas as tags HTML #}

{# Escape de JavaScript #}
<script>
    var username = {{ username|escapejs }};
</script>
```

### Manipulação Segura de Strings

```python
from django.utils.safestring import mark_safe
from django.utils.html import escape

# RUIM: Nunca marque entrada do usuário como safe sem escapar
def render_bad(user_input):
    return mark_safe(user_input)  # VULNERÁVEL!

# BOM: Escape primeiro, depois marque como safe
def render_good(user_input):
    return mark_safe(escape(user_input))

# BOM: Use format_html para HTML com variáveis
from django.utils.html import format_html

def greet_user(username):
    return format_html('<span class="user">{}</span>', escape(username))
```

### Cabeçalhos HTTP

```python
# settings.py
SECURE_CONTENT_TYPE_NOSNIFF = True  # Previne MIME sniffing
SECURE_BROWSER_XSS_FILTER = True  # Habilita o filtro XSS
X_FRAME_OPTIONS = 'DENY'  # Previne clickjacking

# Middleware customizado
from django.conf import settings

class SecurityHeaderMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Content-Security-Policy'] = "default-src 'self'"
        return response
```

## Proteção CSRF

### Proteção CSRF Padrão

```python
# settings.py - CSRF está habilitado por padrão
CSRF_COOKIE_SECURE = True  # Enviar apenas via HTTPS
CSRF_COOKIE_HTTPONLY = True  # Previne acesso via JavaScript
CSRF_COOKIE_SAMESITE = 'Lax'  # Previne CSRF em alguns casos
CSRF_TRUSTED_ORIGINS = ['https://example.com']  # Domínios confiáveis

# Uso em template
<form method="post">
    {% csrf_token %}
    {{ form.as_p }}
    <button type="submit">Submit</button>
</form>

# Requisições AJAX
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

fetch('/api/endpoint/', {
    method: 'POST',
    headers: {
        'X-CSRFToken': getCookie('csrftoken'),
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
});
```

### Isentando Views (Use com Cautela)

```python
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt  # Use apenas quando absolutamente necessário!
def webhook_view(request):
    # Webhook de um serviço externo
    pass
```

## Segurança no Upload de Arquivos

### Validação de Arquivos

```python
import os
from django.core.exceptions import ValidationError

def validate_file_extension(value):
    """Valida a extensão do arquivo."""
    ext = os.path.splitext(value.name)[1]
    valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension.')

def validate_file_size(value):
    """Valida o tamanho do arquivo (máx. 5MB)."""
    filesize = value.size
    if filesize > 5 * 1024 * 1024:
        raise ValidationError('File too large. Max size is 5MB.')

# models.py
class Document(models.Model):
    file = models.FileField(
        upload_to='documents/',
        validators=[validate_file_extension, validate_file_size]
    )
```

### Armazenamento Seguro de Arquivos

```python
# settings.py
MEDIA_ROOT = '/var/www/media/'
MEDIA_URL = '/media/'

# Use um domínio separado para mídia em produção
MEDIA_DOMAIN = 'https://media.example.com'

# Não sirva uploads de usuários diretamente
# Use whitenoise ou um CDN para arquivos estáticos
# Use um servidor separado ou S3 para arquivos de mídia
```

## Segurança de API

### Limitação de Taxa (Rate Limiting)

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'upload': '10/hour',
    }
}

# Throttle customizado
from rest_framework.throttling import UserRateThrottle

class BurstRateThrottle(UserRateThrottle):
    scope = 'burst'
    rate = '60/min'

class SustainedRateThrottle(UserRateThrottle):
    scope = 'sustained'
    rate = '1000/day'
```

### Autenticação para APIs

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({'message': 'You are authenticated'})
```

## Cabeçalhos de Segurança

### Content Security Policy

```python
# settings.py
CSP_DEFAULT_SRC = "'self'"
CSP_SCRIPT_SRC = "'self' https://cdn.example.com"
CSP_STYLE_SRC = "'self' 'unsafe-inline'"
CSP_IMG_SRC = "'self' data: https:"
CSP_CONNECT_SRC = "'self' https://api.example.com"

# Middleware
class CSPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response['Content-Security-Policy'] = (
            f"default-src {CSP_DEFAULT_SRC}; "
            f"script-src {CSP_SCRIPT_SRC}; "
            f"style-src {CSP_STYLE_SRC}; "
            f"img-src {CSP_IMG_SRC}; "
            f"connect-src {CSP_CONNECT_SRC}"
        )
        return response
```

## Variáveis de Ambiente

### Gerenciando Segredos

```python
# Use python-decouple ou django-environ
import environ

env = environ.Env(
    # define a conversão de tipo, valor padrão
    DEBUG=(bool, False)
)

# lendo o arquivo .env
environ.Env.read_env()

SECRET_KEY = env('DJANGO_SECRET_KEY')
DATABASE_URL = env('DATABASE_URL')
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# arquivo .env (nunca faça commit deste arquivo)
DEBUG=False
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
ALLOWED_HOSTS=example.com,www.example.com
```

## Registrando Eventos de Segurança

```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/security.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django.security': {
            'handlers': ['file', 'console'],
            'level': 'WARNING',
            'propagate': True,
        },
        'django.request': {
            'handlers': ['file'],
            'level': 'ERROR',
            'propagate': False,
        },
    },
}
```

## Checklist Rápido de Segurança

| Verificação | Descrição |
|-------|-------------|
| `DEBUG = False` | Nunca rode com DEBUG em produção |
| Apenas HTTPS | Forçar SSL, cookies seguros |
| Segredos fortes | Use variáveis de ambiente para a SECRET_KEY |
| Validação de senha | Habilite todos os validadores de senha |
| Proteção CSRF | Habilitada por padrão; não desabilite |
| Prevenção de XSS | O Django escapa automaticamente; não use `&#124;safe` com entrada do usuário |
| Injeção SQL | Use o ORM; nunca concatene strings em consultas |
| Uploads de arquivos | Valide tipo e tamanho do arquivo |
| Limitação de taxa | Aplique throttling nos endpoints de API |
| Cabeçalhos de segurança | CSP, X-Frame-Options, HSTS |
| Logging | Registre eventos de segurança |
| Atualizações | Mantenha o Django e as dependências atualizados |

Lembre-se: segurança é um processo, não um produto. Revise e atualize regularmente suas práticas de segurança.
