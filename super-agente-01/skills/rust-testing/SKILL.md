---
name: rust-testing
description: Padrões de teste Rust incluindo testes unitários, testes de integração, testes assíncronos, testes baseados em propriedades, mocking e cobertura. Segue a metodologia TDD.
metadata:
  origin: ECC
---

# Padrões de Testes Rust

Padrões abrangentes de testes Rust para escrever testes confiáveis e fáceis de manter seguindo a metodologia TDD.

## Quando Usar

- Escrevendo novas funções, métodos ou traits Rust
- Adicionando cobertura de testes ao código existente
- Criando benchmarks para código crítico de desempenho
- Implementando testes baseados em propriedades para validação de entrada
- Seguindo o fluxo de trabalho TDD em projetos Rust

## Como Funciona

1. **Identifique o código alvo** — Encontre a função, trait ou módulo para testar
2. **Escreva um teste** — Use `#[test]` em um módulo `#[cfg(test)]`, rstest para testes parametrizados ou proptest para testes baseados em propriedades
3. **Mocke dependências** — Use mockall para isolar a unidade sob teste
4. **Execute os testes (RED)** — Verifique se o teste falha com o erro esperado
5. **Implemente (GREEN)** — Escreva código mínimo para passar
6. **Refatore** — Melhore enquanto mantém os testes verdes
7. **Verifique a cobertura** — Use cargo-llvm-cov, meta de 80%+

## Fluxo de Trabalho TDD para Rust

### O Ciclo RED-GREEN-REFACTOR

```
RED     → Escreva um teste falhando primeiro
GREEN   → Escreva código mínimo para passar no teste
REFACTOR → Melhore o código mantendo os testes verdes
REPEAT  → Continue com o próximo requisito
```

### TDD Passo a Passo em Rust

```rust
// RED: Escreva o teste primeiro, use todo!() como placeholder
pub fn add(a: i32, b: i32) -> i32 { todo!() }

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn test_add() { assert_eq!(add(2, 3), 5); }
}
// cargo test → entra em pânico em 'ainda não implementado'
```

```rust
// GREEN: Substitua todo!() pela implementação mínima
pub fn add(a: i32, b: i32) -> i32 { a + b }
// cargo test → PASS, depois REFACTOR mantendo os testes verdes
```

## Testes Unitários

### Organização de Testes em Nível de Módulo

```rust
// src/user.rs
pub struct User {
    pub name: String,
    pub email: String,
}

impl User {
    pub fn new(name: impl Into<String>, email: impl Into<String>) -> Result<Self, String> {
        let email = email.into();
        if !email.contains('@') {
            return Err(format!("email inválido: {email}"));
        }
        Ok(Self { name: name.into(), email })
    }

    pub fn display_name(&self) -> &str {
        &self.name
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_user_with_valid_email() {
        let user = User::new("Alice", "alice@example.com").unwrap();
        assert_eq!(user.display_name(), "Alice");
        assert_eq!(user.email, "alice@example.com");
    }

    #[test]
    fn rejects_invalid_email() {
        let result = User::new("Bob", "not-an-email");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("email inválido"));
    }
}
```

### Macros de Asserção

```rust
assert_eq!(2 + 2, 4);                                    // Igualdade
assert_ne!(2 + 2, 5);                                    // Desigualdade
assert!(vec![1, 2, 3].contains(&2));                     // Booleano
assert_eq!(value, 42, "esperava 42 mas obteve {value}"); // Mensagem customizada
assert!((0.1_f64 + 0.2 - 0.3).abs() < f64::EPSILON);   // Comparação de float
```

## Testes de Erro e Pânico

### Testando Retornos de `Result`

```rust
#[test]
fn parse_returns_error_for_invalid_input() {
    let result = parse_config("}{invalid");
    assert!(result.is_err());

    // Verifique variante específica de erro
    let err = result.unwrap_err();
    assert!(matches!(err, ConfigError::ParseError(_)));
}

#[test]
fn parse_succeeds_for_valid_input() -> Result<(), Box<dyn std::error::Error>> {
    let config = parse_config(r#"{"port": 8080}"#)?;
    assert_eq!(config.port, 8080);
    Ok(()) // Teste falha se qualquer ? retornar Err
}
```

### Testando Pânicos

```rust
#[test]
#[should_panic]
fn panics_on_empty_input() {
    process(&[]);
}

#[test]
#[should_panic(expected = "index out of bounds")]
fn panics_with_specific_message() {
    let v: Vec<i32> = vec![];
    let _ = v[0];
}
```

## Testes de Integração

### Estrutura de Arquivos

```text
my_crate/
├── src/
│   └── lib.rs
├── tests/              # Testes de integração
│   ├── api_test.rs     # Cada arquivo é um binário de teste separado
│   ├── db_test.rs
│   └── common/         # Utilitários de teste compartilhados
│       └── mod.rs
```

### Escrevendo Testes de Integração

```rust
// tests/api_test.rs
use my_crate::{App, Config};

#[test]
fn full_request_lifecycle() {
    let config = Config::test_default();
    let app = App::new(config);

    let response = app.handle_request("/health");
    assert_eq!(response.status, 200);
    assert_eq!(response.body, "OK");
}
```

## Testes Assíncronos

### Com Tokio

```rust
#[tokio::test]
async fn fetches_data_successfully() {
    let client = TestClient::new().await;
    let result = client.get("/data").await;
    assert!(result.is_ok());
    assert_eq!(result.unwrap().items.len(), 3);
}

#[tokio::test]
async fn handles_timeout() {
    use std::time::Duration;
    let result = tokio::time::timeout(
        Duration::from_millis(100),
        slow_operation(),
    ).await;

    assert!(result.is_err(), "deveria ter expirado");
}
```

## Padrões de Organização de Testes

### Testes Parametrizados com `rstest`

```rust
use rstest::{rstest, fixture};

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}

// Fixtures
#[fixture]
fn test_db() -> TestDb {
    TestDb::new_in_memory()
}

#[rstest]
fn test_insert(test_db: TestDb) {
    test_db.insert("key", "value");
    assert_eq!(test_db.get("key"), Some("value".into()));
}
```

### Helpers de Teste

```rust
#[cfg(test)]
mod tests {
    use super::*;

    /// Cria um usuário de teste com valores padrão razoáveis.
    fn make_user(name: &str) -> User {
        User::new(name, &format!("{name}@test.com")).unwrap()
    }

    #[test]
    fn user_display() {
        let user = make_user("alice");
        assert_eq!(user.display_name(), "alice");
    }
}
```

## Testes Baseados em Propriedades com `proptest`

### Testes de Propriedade Básicos

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn encode_decode_roundtrip(input in ".*") {
        let encoded = encode(&input);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(input, decoded);
    }

    #[test]
    fn sort_preserves_length(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        let original_len = vec.len();
        vec.sort();
        assert_eq!(vec.len(), original_len);
    }

    #[test]
    fn sort_produces_ordered_output(mut vec in prop::collection::vec(any::<i32>(), 0..100)) {
        vec.sort();
        for window in vec.windows(2) {
            assert!(window[0] <= window[1]);
        }
    }
}
```

### Estratégias Customizadas

```rust
use proptest::prelude::*;

fn valid_email() -> impl Strategy<Value = String> {
    ("[a-z]{1,10}", "[a-z]{1,5}")
        .prop_map(|(user, domain)| format!("{user}@{domain}.com"))
}

proptest! {
    #[test]
    fn accepts_valid_emails(email in valid_email()) {
        assert!(User::new("Test", &email).is_ok());
    }
}
```

## Mocking com `mockall`

### Mocking Baseado em Trait

```rust
use mockall::{automock, predicate::eq};

#[automock]
trait UserRepository {
    fn find_by_id(&self, id: u64) -> Option<User>;
    fn save(&self, user: &User) -> Result<(), StorageError>;
}

#[test]
fn service_returns_user_when_found() {
    let mut mock = MockUserRepository::new();
    mock.expect_find_by_id()
        .with(eq(42))
        .times(1)
        .returning(|_| Some(User { id: 42, name: "Alice".into() }));

    let service = UserService::new(Box::new(mock));
    let user = service.get_user(42).unwrap();
    assert_eq!(user.name, "Alice");
}

#[test]
fn service_returns_none_when_not_found() {
    let mut mock = MockUserRepository::new();
    mock.expect_find_by_id()
        .returning(|_| None);

    let service = UserService::new(Box::new(mock));
    assert!(service.get_user(99).is_none());
}
```

## Doc Tests

### Documentação Executável

```rust
/// Soma dois números.
///
/// # Exemplos
///
/// ```
/// use my_crate::add;
///
/// assert_eq!(add(2, 3), 5);
/// assert_eq!(add(-1, 1), 0);
/// ```
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Faz o parsing de uma string de configuração.
///
/// # Erros
///
/// Retorna `Err` se a entrada não for TOML válido.
///
/// ```no_run
/// use my_crate::parse_config;
///
/// let config = parse_config(r#"port = 8080"#).unwrap();
/// assert_eq!(config.port, 8080);
/// ```
///
/// ```no_run
/// use my_crate::parse_config;
///
/// assert!(parse_config("}{invalid").is_err());
/// ```
pub fn parse_config(input: &str) -> Result<Config, ParseError> {
    todo!()
}
```

## Benchmarks com Criterion

```toml
# Cargo.toml
[dev-dependencies]
criterion = { version = "0.5", features = ["html_reports"] }

[[bench]]
name = "benchmark"
harness = false
```

```rust
// benches/benchmark.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -> u64 {
    match n {
        0 | 1 => n,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn bench_fibonacci(c: &mut Criterion) {
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));
}

criterion_group!(benches, bench_fibonacci);
criterion_main!(benches);
```

## Cobertura de Testes

### Executando a Cobertura

```bash
# Instale: cargo install cargo-llvm-cov (ou use taiki-e/install-action no CI)
cargo llvm-cov                    # Resumo
cargo llvm-cov --html             # Relatório HTML
cargo llvm-cov --lcov > lcov.info # Formato LCOV para CI
cargo llvm-cov --fail-under-lines 80  # Falha se abaixo do limiar
```

### Metas de Cobertura

| Tipo de Código | Meta |
|-----------|--------|
| Lógica de negócio crítica | 100% |
| API pública | 90%+ |
| Código geral | 80%+ |
| Gerado / bindings FFI | Excluir |

## Comandos de Teste

```bash
cargo test                        # Executar todos os testes
cargo test -- --nocapture         # Mostrar saída do println
cargo test test_name              # Executar testes correspondentes ao padrão
cargo test --lib                  # Apenas testes unitários
cargo test --test api_test        # Apenas testes de integração
cargo test --doc                  # Apenas doc tests
cargo test --no-fail-fast         # Não pare na primeira falha
cargo test -- --ignored           # Executar testes ignorados
```

## Boas Práticas

**FAÇA:**
- Escreva os testes PRIMEIRO (TDD)
- Use módulos `#[cfg(test)]` para testes unitários
- Teste comportamento, não implementação
- Use nomes de testes descritivos que expliquem o cenário
- Prefira `assert_eq!` a `assert!` para melhores mensagens de erro
- Use `?` em testes que retornam `Result` para saída de erro mais limpa
- Mantenha os testes independentes — sem estado mutável compartilhado

**NÃO FAÇA:**
- Use `#[should_panic]` quando puder testar `Result::is_err()`
- Mocke tudo — prefira testes de integração quando viável
- Ignore testes instáveis — corrija ou coloque em quarentena
- Use `sleep()` em testes — use canais, barreiras ou `tokio::time::pause()`
- Pule testes de caminho de erro

## Integração CI

```yaml
# GitHub Actions
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: dtolnay/rust-toolchain@stable
      with:
        components: clippy, rustfmt

    - name: Verificar formatação
      run: cargo fmt --check

    - name: Clippy
      run: cargo clippy -- -D warnings

    - name: Executar testes
      run: cargo test

    - uses: taiki-e/install-action@cargo-llvm-cov

    - name: Cobertura
      run: cargo llvm-cov --fail-under-lines 80
```

**Lembre-se**: Testes são documentação. Eles mostram como seu código deve ser usado. Escreva-os com clareza e mantenha-os atualizados.
