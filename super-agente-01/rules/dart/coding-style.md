---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Estilo de Código Dart/Flutter

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Dart e Flutter.

## Formatação

- **dart format** para todos os arquivos `.dart` — imposto na CI (`dart format --set-exit-if-changed .`)
- Comprimento de linha: 80 caracteres (padrão do dart format)
- Vírgulas finais em listas de argumentos/parâmetros multilinha para melhorar diffs e formatação

## Imutabilidade

- Prefira `final` para variáveis locais e `const` para constantes de tempo de compilação
- Use construtores `const` sempre que todos os campos forem `final`
- Retorne coleções não modificáveis a partir de APIs públicas (`List.unmodifiable`, `Map.unmodifiable`)
- Use `copyWith()` para mutações de estado em classes de estado imutáveis

```dart
// RUIM
var count = 0;
List<String> items = ['a', 'b'];

// BOM
final count = 0;
const items = ['a', 'b'];
```

## Nomenclatura

Siga as convenções do Dart:
- `camelCase` para variáveis, parâmetros e construtores nomeados
- `PascalCase` para classes, enums, typedefs e extensões
- `snake_case` para nomes de arquivos e nomes de bibliotecas
- `SCREAMING_SNAKE_CASE` para constantes declaradas com `const` no nível superior
- Prefixe membros privados com `_`
- Nomes de extensões descrevem o tipo que estendem: `StringExtensions`, não `MyHelpers`

## Null Safety

- Evite `!` (operador bang) — prefira `?.`, `??`, `if (x != null)` ou correspondência de padrões do Dart 3; reserve o `!` apenas onde um valor nulo é um erro de programação e travar é o comportamento correto
- Evite `late` a menos que a inicialização seja garantida antes do primeiro uso (prefira nullable ou inicialização no construtor)
- Use `required` para parâmetros de construtor que devem sempre ser fornecidos

```dart
// RUIM — trava em tempo de execução se user for nulo
final name = user!.name;

// BOM — operadores null-aware
final name = user?.name ?? 'Unknown';

// BOM — correspondência de padrões do Dart 3 (exaustiva, verificada pelo compilador)
final name = switch (user) {
  User(:final name) => name,
  null => 'Unknown',
};

// BOM — guarda de nulo com retorno antecipado
String getUserName(User? user) {
  if (user == null) return 'Unknown';
  return user.name; // promovido para não-nulo após a guarda
}
```

## Tipos Sealed e Correspondência de Padrões (Dart 3+)

Use classes sealed para modelar hierarquias de estado fechadas:

```dart
sealed class AsyncState<T> {
  const AsyncState();
}

final class Loading<T> extends AsyncState<T> {
  const Loading();
}

final class Success<T> extends AsyncState<T> {
  const Success(this.data);
  final T data;
}

final class Failure<T> extends AsyncState<T> {
  const Failure(this.error);
  final Object error;
}
```

Sempre use `switch` exaustivo com tipos sealed — sem default/wildcard:

```dart
// RUIM
if (state is Loading) { ... }

// BOM
return switch (state) {
  Loading() => const CircularProgressIndicator(),
  Success(:final data) => DataWidget(data),
  Failure(:final error) => ErrorWidget(error.toString()),
};
```

## Tratamento de Erros

- Especifique os tipos de exceção nas cláusulas `on` — nunca use `catch (e)` genérico
- Nunca capture subtipos de `Error` — eles indicam bugs de programação
- Use tipos no estilo `Result` ou classes sealed para erros recuperáveis
- Evite usar exceções para controle de fluxo

```dart
// RUIM
try {
  await fetchUser();
} catch (e) {
  log(e.toString());
}

// BOM
try {
  await fetchUser();
} on NetworkException catch (e) {
  log('Network error: ${e.message}');
} on NotFoundException {
  handleNotFound();
}
```

## Async / Futures

- Sempre faça `await` em Futures ou chame explicitamente `unawaited()` para sinalizar fire-and-forget intencional
- Nunca marque uma função como `async` se ela nunca faz `await` em nada
- Use `Future.wait` / `Future.any` para operações concorrentes
- Verifique `context.mounted` antes de usar `BuildContext` após qualquer `await` (Flutter 3.7+)

```dart
// RUIM — ignorando o Future
fetchData(); // fire-and-forget sem sinalizar intenção

// BOM
unawaited(fetchData()); // fire-and-forget explícito
await fetchData();      // ou devidamente aguardado
```

## Imports

- Use imports `package:` em todo o código — nunca imports relativos (`../`) para código entre features ou entre camadas
- Ordem: `dart:` → `package:` externo → `package:` interno (mesmo pacote)
- Sem imports não utilizados — `dart analyze` impõe isso com `unused_import`

## Geração de Código

- Arquivos gerados (`.g.dart`, `.freezed.dart`, `.gr.dart`) devem ser commitados ou ignorados pelo git de forma consistente — escolha uma estratégia por projeto
- Nunca edite manualmente arquivos gerados
- Mantenha as anotações de geradores (`@JsonSerializable`, `@freezed`, `@riverpod`, etc.) apenas no arquivo-fonte canônico
