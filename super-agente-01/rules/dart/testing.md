---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
  - "**/analysis_options.yaml"
---
# Testes Dart/Flutter

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Dart e Flutter.

## Framework de Testes

- **flutter_test** / **dart:test** — test runner embutido
- **mockito** (com `@GenerateMocks`) ou **mocktail** (sem geração de código) para mocking
- **bloc_test** para testes unitários de BLoC/Cubit
- **fake_async** para controlar o tempo em testes unitários
- **integration_test** para testes end-to-end em dispositivo

## Tipos de Teste

| Tipo | Ferramenta | Localização | Quando Escrever |
|------|------|----------|---------------|
| Unitário | `dart:test` | `test/unit/` | Toda lógica de domínio, gerenciadores de estado, repositórios |
| Widget | `flutter_test` | `test/widget/` | Todos os widgets com comportamento significativo |
| Golden | `flutter_test` | `test/golden/` | Componentes de UI críticos ao design |
| Integração | `integration_test` | `integration_test/` | Fluxos de usuário críticos em dispositivo/emulador real |

## Testes Unitários: Gerenciadores de Estado

### BLoC com `bloc_test`

```dart
group('CartBloc', () {
  late CartBloc bloc;
  late MockCartRepository repository;

  setUp(() {
    repository = MockCartRepository();
    bloc = CartBloc(repository);
  });

  tearDown(() => bloc.close());

  blocTest<CartBloc, CartState>(
    'emits updated items when CartItemAdded',
    build: () => bloc,
    act: (b) => b.add(CartItemAdded(testItem)),
    expect: () => [CartState(items: [testItem])],
  );

  blocTest<CartBloc, CartState>(
    'emits empty cart when CartCleared',
    seed: () => CartState(items: [testItem]),
    build: () => bloc,
    act: (b) => b.add(CartCleared()),
    expect: () => [const CartState()],
  );
});
```

### Riverpod com `ProviderContainer`

```dart
test('usersProvider loads users from repository', () async {
  final container = ProviderContainer(
    overrides: [userRepositoryProvider.overrideWithValue(FakeUserRepository())],
  );
  addTearDown(container.dispose);

  final result = await container.read(usersProvider.future);
  expect(result, isNotEmpty);
});
```

## Testes de Widget

```dart
testWidgets('CartPage shows item count badge', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        cartNotifierProvider.overrideWith(() => FakeCartNotifier([testItem])),
      ],
      child: const MaterialApp(home: CartPage()),
    ),
  );

  await tester.pump();
  expect(find.text('1'), findsOneWidget);
  expect(find.byType(CartItemTile), findsOneWidget);
});

testWidgets('shows empty state when cart is empty', (tester) async {
  await tester.pumpWidget(
    ProviderScope(
      overrides: [cartNotifierProvider.overrideWith(() => FakeCartNotifier([]))],
      child: const MaterialApp(home: CartPage()),
    ),
  );

  await tester.pump();
  expect(find.text('Your cart is empty'), findsOneWidget);
});
```

## Fakes em vez de Mocks

Prefira fakes escritos à mão para dependências complexas:

```dart
class FakeUserRepository implements UserRepository {
  final _users = <String, User>{};
  Object? fetchError;

  @override
  Future<User?> getById(String id) async {
    if (fetchError != null) throw fetchError!;
    return _users[id];
  }

  @override
  Future<List<User>> getAll() async {
    if (fetchError != null) throw fetchError!;
    return _users.values.toList();
  }

  @override
  Stream<List<User>> watchAll() => Stream.value(_users.values.toList());

  @override
  Future<void> save(User user) async {
    _users[user.id] = user;
  }

  @override
  Future<void> delete(String id) async {
    _users.remove(id);
  }

  void addUser(User user) => _users[user.id] = user;
}
```

## Testes Assíncronos

```dart
// Use fake_async para controlar timers e Futures
test('debounce triggers after 300ms', () {
  fakeAsync((async) {
    final debouncer = Debouncer(delay: const Duration(milliseconds: 300));
    var callCount = 0;
    debouncer.run(() => callCount++);
    expect(callCount, 0);
    async.elapse(const Duration(milliseconds: 200));
    expect(callCount, 0);
    async.elapse(const Duration(milliseconds: 200));
    expect(callCount, 1);
  });
});
```

## Testes Golden

```dart
testWidgets('UserCard golden test', (tester) async {
  await tester.pumpWidget(
    MaterialApp(home: UserCard(user: testUser)),
  );

  await expectLater(
    find.byType(UserCard),
    matchesGoldenFile('goldens/user_card.png'),
  );
});
```

Execute `flutter test --update-goldens` quando mudanças visuais intencionais forem feitas.

## Nomenclatura de Testes

Use nomes descritivos, focados em comportamento:

```dart
test('returns null when user does not exist', () { ... });
test('throws NotFoundException when id is empty string', () { ... });
testWidgets('disables submit button while form is invalid', (tester) async { ... });
```

## Organização dos Testes

```
test/
├── unit/
│   ├── domain/
│   │   └── usecases/
│   └── data/
│       └── repositories/
├── widget/
│   └── presentation/
│       └── pages/
└── golden/
    └── widgets/

integration_test/
└── flows/
    ├── login_flow_test.dart
    └── checkout_flow_test.dart
```

## Cobertura

- Mire em 80%+ de cobertura de linhas para a lógica de negócio (domínio + gerenciadores de estado)
- Todas as transições de estado devem ter testes: loading → success, loading → error, retry
- Execute `flutter test --coverage` e inspecione `lcov.info` com um relatório de cobertura
- Falhas de cobertura devem bloquear a CI quando abaixo do limiar
