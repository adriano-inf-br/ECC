---
paths:
  - "**/*.dart"
  - "**/pubspec.yaml"
---
# Padrões Dart/Flutter

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Dart, Flutter e do ecossistema comum.

## Padrão Repositório

```dart
abstract interface class UserRepository {
  Future<User?> getById(String id);
  Future<List<User>> getAll();
  Stream<List<User>> watchAll();
  Future<void> save(User user);
  Future<void> delete(String id);
}

class UserRepositoryImpl implements UserRepository {
  const UserRepositoryImpl(this._remote, this._local);

  final UserRemoteDataSource _remote;
  final UserLocalDataSource _local;

  @override
  Future<User?> getById(String id) async {
    final local = await _local.getById(id);
    if (local != null) return local;
    final remote = await _remote.getById(id);
    if (remote != null) await _local.save(remote);
    return remote;
  }

  @override
  Future<List<User>> getAll() async {
    final remote = await _remote.getAll();
    for (final user in remote) {
      await _local.save(user);
    }
    return remote;
  }

  @override
  Stream<List<User>> watchAll() => _local.watchAll();

  @override
  Future<void> save(User user) => _local.save(user);

  @override
  Future<void> delete(String id) async {
    await _remote.delete(id);
    await _local.delete(id);
  }
}
```

## Gerenciamento de Estado: BLoC/Cubit

```dart
// Cubit — transições de estado simples
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);

  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
}

// BLoC — orientado a eventos
@immutable
sealed class CartEvent {}
class CartItemAdded extends CartEvent { CartItemAdded(this.item); final Item item; }
class CartItemRemoved extends CartEvent { CartItemRemoved(this.id); final String id; }
class CartCleared extends CartEvent {}

@immutable
class CartState {
  const CartState({this.items = const []});
  final List<Item> items;
  CartState copyWith({List<Item>? items}) => CartState(items: items ?? this.items);
}

class CartBloc extends Bloc<CartEvent, CartState> {
  CartBloc() : super(const CartState()) {
    on<CartItemAdded>((event, emit) =>
        emit(state.copyWith(items: [...state.items, event.item])));
    on<CartItemRemoved>((event, emit) =>
        emit(state.copyWith(items: state.items.where((i) => i.id != event.id).toList())));
    on<CartCleared>((_, emit) => emit(const CartState()));
  }
}
```

## Gerenciamento de Estado: Riverpod

```dart
// Provider simples
@riverpod
Future<List<User>> users(Ref ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.getAll();
}

// Notifier para estado mutável
@riverpod
class CartNotifier extends _$CartNotifier {
  @override
  List<Item> build() => [];

  void add(Item item) => state = [...state, item];
  void remove(String id) => state = state.where((i) => i.id != id).toList();
  void clear() => state = [];
}

// ConsumerWidget
class CartPage extends ConsumerWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartNotifierProvider);
    return ListView(
      children: items.map((item) => CartItemTile(item: item)).toList(),
    );
  }
}
```

## Injeção de Dependência

A injeção via construtor é preferida. Use `get_it` ou providers do Riverpod na raiz de composição:

```dart
// registro com get_it (em um arquivo de setup)
void setupDependencies() {
  final di = GetIt.instance;
  di.registerSingleton<ApiClient>(ApiClient(baseUrl: Env.apiUrl));
  di.registerSingleton<UserRepository>(
    UserRepositoryImpl(di<ApiClient>(), di<LocalDatabase>()),
  );
  di.registerFactory(() => UserListViewModel(di<UserRepository>()));
}
```

## Padrão ViewModel (sem BLoC/Riverpod)

```dart
class UserListViewModel extends ChangeNotifier {
  UserListViewModel(this._repository);

  final UserRepository _repository;

  AsyncState<List<User>> _state = const Loading();
  AsyncState<List<User>> get state => _state;

  Future<void> load() async {
    _state = const Loading();
    notifyListeners();
    try {
      final users = await _repository.getAll();
      _state = Success(users);
    } on Exception catch (e) {
      _state = Failure(e);
    }
    notifyListeners();
  }
}
```

## Padrão UseCase

```dart
class GetUserUseCase {
  const GetUserUseCase(this._repository);
  final UserRepository _repository;

  Future<User?> call(String id) => _repository.getById(id);
}

class CreateUserUseCase {
  const CreateUserUseCase(this._repository, this._idGenerator);
  final UserRepository _repository;
  final IdGenerator _idGenerator; // injetado — a camada de domínio não deve depender do pacote uuid diretamente

  Future<void> call(CreateUserInput input) async {
    // Valida, aplica regras de negócio e então persiste
    final user = User(id: _idGenerator.generate(), name: input.name, email: input.email);
    await _repository.save(user);
  }
}
```

## Estado Imutável com freezed

```dart
@freezed
class UserState with _$UserState {
  const factory UserState({
    @Default([]) List<User> users,
    @Default(false) bool isLoading,
    String? errorMessage,
  }) = _UserState;
}
```

## Fronteiras de Camada da Clean Architecture

```
lib/
├── domain/              # Dart puro — sem Flutter, sem pacotes externos
│   ├── entities/
│   ├── repositories/    # Interfaces abstratas
│   └── usecases/
├── data/                # Implementa as interfaces de domínio
│   ├── datasources/
│   ├── models/          # DTOs com fromJson/toJson
│   └── repositories/
└── presentation/        # Widgets Flutter + gerenciamento de estado
    ├── pages/
    ├── widgets/
    └── providers/ (ou blocs/ ou viewmodels/)
```

- O domínio não deve importar `package:flutter` nem qualquer pacote da camada de dados
- A camada de dados mapeia DTOs para entidades de domínio nas fronteiras do repositório
- A apresentação chama use cases, não repositórios diretamente

## Navegação (GoRouter)

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(
      path: '/users/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return UserDetailPage(userId: id);
      },
    ),
  ],
  // refreshListenable reavalia o redirect sempre que o estado de autenticação muda
  refreshListenable: GoRouterRefreshStream(authCubit.stream),
  redirect: (context, state) {
    final isLoggedIn = context.read<AuthCubit>().state is AuthAuthenticated;
    if (!isLoggedIn && !state.matchedLocation.startsWith('/login')) {
      return '/login';
    }
    return null;
  },
);
```

## Referências

Veja a skill: `flutter-dart-code-review` para o checklist abrangente de revisão.
Veja a skill: `compose-multiplatform-patterns` para padrões de interoperabilidade Kotlin Multiplatform/Flutter.
