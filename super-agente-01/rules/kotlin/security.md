---
paths:
  - "**/*.kt"
  - "**/*.kts"
---
# Segurança em Kotlin

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Kotlin e Android/KMP.

## Gerenciamento de Segredos

- Nunca codifique chaves de API, tokens ou credenciais diretamente no código-fonte
- Use `local.properties` (ignorado pelo git) para segredos de desenvolvimento local
- Use campos do `BuildConfig` gerados a partir de segredos do CI para builds de release
- Use `EncryptedSharedPreferences` (Android) ou Keychain (iOS) para armazenamento de segredos em tempo de execução

```kotlin
// RUIM
val apiKey = "sk-abc123..."

// BOM — a partir do BuildConfig (gerado em tempo de build)
val apiKey = BuildConfig.API_KEY

// BOM — a partir do armazenamento seguro em tempo de execução
val token = secureStorage.get("auth_token")
```

## Segurança de Rede

- Use HTTPS exclusivamente — configure `network_security_config.xml` para bloquear tráfego em texto puro
- Faça pinning de certificados para endpoints sensíveis usando o `CertificatePinner` do OkHttp ou equivalente do Ktor
- Defina timeouts em todos os clientes HTTP — nunca deixe os padrões (que podem ser infinitos)
- Valide e sanitize todas as respostas do servidor antes do uso

```xml
<!-- res/xml/network_security_config.xml -->
<network-security-config>
    <base-config cleartextTrafficPermitted="false" />
</network-security-config>
```

## Validação de Entrada

- Valide toda entrada do usuário antes de processar ou enviar à API
- Use consultas parametrizadas para Room/SQLDelight — nunca concatene entrada do usuário em SQL
- Sanitize caminhos de arquivo vindos de entrada do usuário para prevenir path traversal

```kotlin
// RUIM — injeção SQL
@Query("SELECT * FROM items WHERE name = '$input'")

// BOM — parametrizada
@Query("SELECT * FROM items WHERE name = :input")
fun findByName(input: String): List<ItemEntity>
```

## Proteção de Dados

- Use `EncryptedSharedPreferences` para dados chave-valor sensíveis no Android
- Use `@Serializable` com nomes de campo explícitos — não vaze nomes internos de propriedades
- Limpe dados sensíveis da memória quando não forem mais necessários
- Use `@Keep` ou regras do ProGuard para classes serializadas para evitar mangling de nomes

## Autenticação

- Armazene tokens em armazenamento seguro, não em SharedPreferences em texto puro
- Implemente refresh de token com tratamento adequado de 401/403
- Limpe todo o estado de autenticação no logout (tokens, dados de usuário em cache, cookies)
- Use autenticação biométrica (`BiometricPrompt`) para operações sensíveis

## ProGuard / R8

- Mantenha regras para todos os modelos serializados (`@Serializable`, Gson, Moshi)
- Mantenha regras para bibliotecas baseadas em reflexão (Koin, Retrofit)
- Teste os builds de release — a ofuscação pode quebrar a serialização silenciosamente

## Segurança do WebView

- Desabilite o JavaScript a menos que seja explicitamente necessário: `settings.javaScriptEnabled = false`
- Valide URLs antes de carregá-las no WebView
- Nunca exponha métodos `@JavascriptInterface` que acessam dados sensíveis
- Use `WebViewClient.shouldOverrideUrlLoading()` para controlar a navegação
