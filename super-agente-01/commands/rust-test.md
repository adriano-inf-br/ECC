---
description: Imponha o fluxo de trabalho de TDD para Rust. Escreva os testes primeiro, depois implemente. Verifique 80%+ de cobertura com cargo-llvm-cov.
---

# Comando TDD do Rust

Este comando impõe a metodologia de desenvolvimento orientado a testes para código Rust usando `#[test]`, rstest, proptest e mockall.

## O Que Este Comando Faz

1. **Definir Tipos/Traits**: Esboça as assinaturas das funções com `todo!()`
2. **Escrever os Testes**: Cria um módulo de testes abrangente (RED)
3. **Executar os Testes**: Verifica se os testes falham pelo motivo certo
4. **Implementar o Código**: Escreve código mínimo para passar (GREEN)
5. **Refatorar**: Melhora mantendo os testes verdes
6. **Verificar a Cobertura**: Garante 80%+ de cobertura com cargo-llvm-cov

## Quando Usar

Use `/rust-test` quando:
- Implementar novas funções, métodos ou traits em Rust
- Adicionar cobertura de testes a código Rust existente
- Corrigir bugs (escreva primeiro um teste que falha)
- Construir lógica de negócio crítica
- Aprender o fluxo de trabalho de TDD em Rust

## Ciclo de TDD

```
RED     -> Write failing test first
GREEN   -> Implement minimal code to pass
REFACTOR -> Improve code, tests stay green
REPEAT  -> Next test case
```

## Exemplo de Sessão

````text
User: /rust-test I need a function to validate user registration

Agent:
# TDD Session: Registration Validator

## Step 1: Define Interface

```rust
// src/validator.rs
pub struct RegistrationRequest {
    pub name: String,
    pub email: String,
    pub password: String,
}

pub enum ValidationResult {
    Valid,
    Invalid(Vec<String>),
}

pub fn validate_registration(request: &RegistrationRequest) -> ValidationResult {
    todo!()
}
```

## Step 2: Write Tests (RED)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn valid_registration_returns_valid() {
        let request = RegistrationRequest {
            name: "Alice".into(),
            email: "alice@example.com".into(),
            password: "SecureP@ss1".into(),
        };
        assert!(matches!(validate_registration(&request), ValidationResult::Valid));
    }

    #[test]
    fn blank_name_returns_invalid() {
        let request = RegistrationRequest {
            name: "".into(),
            email: "alice@example.com".into(),
            password: "SecureP@ss1".into(),
        };
        match validate_registration(&request) {
            ValidationResult::Invalid(errors) => {
                assert!(errors.contains(&"Name is required".to_string()));
            }
            ValidationResult::Valid => panic!("expected Invalid"),
        }
    }

    #[test]
    fn invalid_email_returns_invalid() {
        let request = RegistrationRequest {
            name: "Alice".into(),
            email: "not-an-email".into(),
            password: "SecureP@ss1".into(),
        };
        assert!(matches!(
            validate_registration(&request),
            ValidationResult::Invalid(_)
        ));
    }

    #[test]
    fn short_password_returns_invalid() {
        let request = RegistrationRequest {
            name: "Alice".into(),
            email: "alice@example.com".into(),
            password: "short".into(),
        };
        assert!(matches!(
            validate_registration(&request),
            ValidationResult::Invalid(_)
        ));
    }
}
```

## Step 3: Run Tests — Verify FAIL

```bash
$ cargo test
running 4 tests
test tests::valid_registration_returns_valid ... FAILED (not yet implemented)
test tests::blank_name_returns_invalid ... FAILED
test tests::invalid_email_returns_invalid ... FAILED
test tests::short_password_returns_invalid ... FAILED
```

Tests fail as expected (todo! panic).

## Step 4: Implement Minimal Code (GREEN)

```rust
pub fn validate_registration(request: &RegistrationRequest) -> ValidationResult {
    let mut errors = Vec::new();

    if request.name.trim().is_empty() {
        errors.push("Name is required".into());
    }
    if !request.email.contains('@') {
        errors.push("Invalid email format".into());
    }
    if request.password.len() < 8 {
        errors.push("Password must be at least 8 characters".into());
    }

    if errors.is_empty() {
        ValidationResult::Valid
    } else {
        ValidationResult::Invalid(errors)
    }
}
```

## Step 5: Run Tests — Verify PASS

```bash
$ cargo test
running 4 tests
test tests::valid_registration_returns_valid ... ok
test tests::blank_name_returns_invalid ... ok
test tests::invalid_email_returns_invalid ... ok
test tests::short_password_returns_invalid ... ok

test result: ok. 4 passed; 0 failed
```

All tests passing!

## Step 6: Check Coverage

```bash
$ cargo llvm-cov
Coverage: 100.0% of lines
```

Coverage: 100%

## TDD Complete!
````

## Padrões de Teste

### Testes Unitários

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn adds_two_numbers() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn handles_error() -> Result<(), Box<dyn std::error::Error>> {
        let result = parse_config(r#"port = 8080"#)?;
        assert_eq!(result.port, 8080);
        Ok(())
    }
}
```

### Testes Parametrizados com rstest

```rust
use rstest::{rstest, fixture};

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}
```

### Testes Async

```rust
#[tokio::test]
async fn fetches_data_successfully() {
    let client = TestClient::new().await;
    let result = client.get("/data").await;
    assert!(result.is_ok());
}
```

### Testes Baseados em Propriedades

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn encode_decode_roundtrip(input in ".*") {
        let encoded = encode(&input);
        let decoded = decode(&encoded).unwrap();
        assert_eq!(input, decoded);
    }
}
```

## Coverage Commands

```bash
# Summary report
cargo llvm-cov

# HTML report
cargo llvm-cov --html

# Fail if below threshold
cargo llvm-cov --fail-under-lines 80

# Run specific test
cargo test test_name

# Run with output
cargo test -- --nocapture

# Run without stopping on first failure
cargo test --no-fail-fast
```

## Coverage Targets

| Code Type | Target |
|-----------|--------|
| Critical business logic | 100% |
| Public API | 90%+ |
| General code | 80%+ |
| Generated / FFI bindings | Exclude |

## TDD Best Practices

**DO:**
- Write test FIRST, before any implementation
- Run tests after each change
- Use `assert_eq!` over `assert!` for better error messages
- Use `?` in tests that return `Result` for cleaner output
- Test behavior, not implementation
- Include edge cases (empty, boundary, error paths)

**DON'T:**
- Write implementation before tests
- Skip the RED phase
- Use `#[should_panic]` when `Result::is_err()` works
- Use `sleep()` in tests — use channels or `tokio::time::pause()`
- Mock everything — prefer integration tests when feasible

## Related Commands

- `/rust-build` - Fix build errors
- `/rust-review` - Review code after implementation
- `verification-loop` skill - Run full verification loop

## Related

- Skill: `skills/rust-testing/`
- Skill: `skills/rust-patterns/`
