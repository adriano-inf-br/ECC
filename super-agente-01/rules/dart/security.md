---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/AndroidManifest.xml"
  - "**/Info.plist"
---
# Segurança Dart/Flutter

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Dart, Flutter e mobile.

## Gerenciamento de Segredos

- Nunca embuta chaves de API, tokens ou credenciais diretamente no código-fonte Dart
- Use `--dart-define` ou `--dart-define-from-file` para configuração de tempo de compilação (os valores não são realmente secretos — use um proxy de backend para segredos do lado do servidor)
- Use `flutter_dotenv` ou equivalente, com arquivos `.env` listados no `.gitignore`
- Armazene segredos de tempo de execução em armazenamento seguro da plataforma: `flutter_secure_storage` (Keychain no iOS, EncryptedSharedPreferences no Android)

```dart
// RUIM
const apiKey = 'sk-abc123...';

// BOM — configuração de tempo de compilação (não secreta, apenas configurável)
const apiKey = String.fromEnvironment('API_KEY');

// BOM — segredo de tempo de execução vindo de armazenamento seguro
final token = await secureStorage.read(key: 'auth_token');
```

## Segurança de Rede

- Imponha HTTPS — sem chamadas `http://` em produção
- Configure o `network_security_config.xml` do Android para bloquear tráfego em texto puro
- Defina `NSAppTransportSecurity` no `Info.plist` para proibir carregamentos arbitrários
- Defina timeouts de requisição em todos os clientes HTTP — nunca deixe os padrões
- Considere certificate pinning para endpoints de alta segurança

```dart
// Dio com timeout e imposição de HTTPS
final dio = Dio(BaseOptions(
  baseUrl: 'https://api.example.com',
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 30),
));
```

## Validação de Entrada

- Valide e sanitize toda entrada do usuário antes de enviá-la para a API ou armazenamento
- Nunca passe entrada não sanitizada para consultas SQL — use consultas parametrizadas (sqflite, drift)
- Sanitize URLs de deep link antes da navegação — valide esquema, host e parâmetros de caminho
- Use `Uri.tryParse` e valide antes de navegar

```dart
// RUIM — injeção SQL
await db.rawQuery("SELECT * FROM users WHERE email = '$userInput'");

// BOM — parametrizado
await db.query('users', where: 'email = ?', whereArgs: [userInput]);

// RUIM — deep link não validado
final uri = Uri.parse(incomingLink);
context.go(uri.path); // poderia navegar para qualquer rota

// BOM — deep link validado
final uri = Uri.tryParse(incomingLink);
if (uri != null && uri.host == 'myapp.com' && _allowedPaths.contains(uri.path)) {
  context.go(uri.path);
}
```

## Proteção de Dados

- Armazene tokens, PII (dados pessoais identificáveis) e credenciais apenas em `flutter_secure_storage`
- Nunca grave dados sensíveis em `SharedPreferences` ou arquivos locais em texto puro
- Limpe o estado de autenticação no logout: tokens, dados de usuário em cache, cookies
- Use autenticação biométrica (`local_auth`) para operações sensíveis
- Evite registrar dados sensíveis em log — sem `print(token)` ou `debugPrint(password)`

## Específico do Android

- Declare apenas as permissões necessárias no `AndroidManifest.xml`
- Exporte componentes Android (`Activity`, `Service`, `BroadcastReceiver`) apenas quando necessário; adicione `android:exported="false"` onde não for preciso
- Revise os intent filters — componentes exportados com intent filters implícitos são acessíveis por qualquer app
- Use `FLAG_SECURE` para telas que exibem dados sensíveis (impede capturas de tela)

```xml
<!-- AndroidManifest.xml — restringe componentes exportados -->
<activity android:name=".MainActivity" android:exported="true">
    <!-- Apenas a launcher activity precisa de exported=true -->
</activity>
<activity android:name=".SensitiveActivity" android:exported="false" />
```

## Específico do iOS

- Declare apenas as descrições de uso necessárias no `Info.plist` (`NSCameraUsageDescription`, etc.)
- Armazene segredos no Keychain — o `flutter_secure_storage` usa o Keychain no iOS
- Use App Transport Security (ATS) — proíba carregamentos arbitrários
- Habilite a entitlement de proteção de dados para arquivos sensíveis

## Segurança de WebView

- Use `webview_flutter` v4+ (`WebViewController` / `WebViewWidget`) — o widget `WebView` legado foi removido
- Desabilite o JavaScript a menos que seja explicitamente necessário (`JavaScriptMode.disabled`)
- Valide URLs antes de carregar — nunca carregue URLs arbitrárias vindas de deep links
- Nunca exponha callbacks Dart ao JavaScript a menos que seja absolutamente necessário e cuidadosamente isolado em sandbox
- Use `NavigationDelegate.onNavigationRequest` para interceptar e validar requisições de navegação

```dart
// API do webview_flutter v4+ (WebViewController + WebViewWidget)
final controller = WebViewController()
  ..setJavaScriptMode(JavaScriptMode.disabled) // desabilitado a menos que seja necessário
  ..setNavigationDelegate(
    NavigationDelegate(
      onNavigationRequest: (request) {
        final uri = Uri.tryParse(request.url);
        if (uri == null || uri.host != 'trusted.example.com') {
          return NavigationDecision.prevent;
        }
        return NavigationDecision.navigate;
      },
    ),
  );

// Na sua árvore de widgets:
WebViewWidget(controller: controller)
```

## Ofuscação e Segurança de Build

- Habilite a ofuscação em builds de release: `flutter build apk --obfuscate --split-debug-info=./debug-info/`
- Mantenha a saída de `--split-debug-info` fora do controle de versão (usada apenas para simbolização de crashes)
- Garanta que as regras do ProGuard/R8 não exponham inadvertidamente classes serializadas
- Execute `flutter analyze` e resolva todos os avisos antes do release
