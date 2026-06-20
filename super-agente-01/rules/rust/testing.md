---
paths:
  - "**/*.rs"
---
# Testes em Rust

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Rust.

## Framework de Testes

- **`#[test]`** com módulos `#[cfg(test)]` para testes unitários
- **rstest** para testes parametrizados e fixtures
- **proptest** para testes baseados em propriedades
- **mockall** para mocking baseado em traits
- **`#[tokio::test]`** para testes assíncronos

## Organização de Testes

```text
my_crate/
├── src/
│   ├── lib.rs           # Testes unitários em módulos #[cfg(test)]
│   ├── auth/
│   │   └── mod.rs       # #[cfg(test)] mod tests { ... }
│   └── orders/
│       └── service.rs   # #[cfg(test)] mod tests { ... }
├── tests/               # Testes de integração (cada arquivo = binário separado)
│   ├── api_test.rs
│   ├── db_test.rs
│   └── common/          # Utilitários de teste compartilhados
│       └── mod.rs
└── benches/             # Benchmarks com Criterion
    └── benchmark.rs
```

Testes unitários ficam dentro de módulos `#[cfg(test)]` no mesmo arquivo. Testes de integração ficam em `tests/`.

## Padrão de Teste Unitário

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn creates_user_with_valid_email() {
        let user = User::new("Alice", "alice@example.com").unwrap();
        assert_eq!(user.name, "Alice");
    }

    #[test]
    fn rejects_invalid_email() {
        let result = User::new("Bob", "not-an-email");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("invalid email"));
    }
}
```

## Testes Parametrizados

```rust
use rstest::rstest;

#[rstest]
#[case("hello", 5)]
#[case("", 0)]
#[case("rust", 4)]
fn test_string_length(#[case] input: &str, #[case] expected: usize) {
    assert_eq!(input.len(), expected);
}
```

## Testes Assíncronos

```rust
#[tokio::test]
async fn fetches_data_successfully() {
    let client = TestClient::new().await;
    let result = client.get("/data").await;
    assert!(result.is_ok());
}
```

## Mocking com mockall

Defina traits no código de produção; gere mocks nos módulos de teste:

```rust
// Trait de produção — pub para que os testes de integração possam importá-lo
pub trait UserRepository {
    fn find_by_id(&self, id: u64) -> Option<User>;
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockall::predicate::eq;

    mockall::mock! {
        pub Repo {}
        impl UserRepository for Repo {
            fn find_by_id(&self, id: u64) -> Option<User>;
        }
    }

    #[test]
    fn service_returns_user_when_found() {
        let mut mock = MockRepo::new();
        mock.expect_find_by_id()
            .with(eq(42))
            .times(1)
            .returning(|_| Some(User { id: 42, name: "Alice".into() }));

        let service = UserService::new(Box::new(mock));
        let user = service.get_user(42).unwrap();
        assert_eq!(user.name, "Alice");
    }
}
```

## Nomenclatura de Testes

Use nomes descritivos que expliquem o cenário:
- `creates_user_with_valid_email()`
- `rejects_order_when_insufficient_stock()`
- `returns_none_when_not_found()`

## Cobertura

- Mire em 80%+ de cobertura de linhas
- Use **cargo-llvm-cov** para relatórios de cobertura
- Foque na lógica de negócio — exclua código gerado e bindings FFI

```bash
cargo llvm-cov                       # Resumo
cargo llvm-cov --html                # Relatório HTML
cargo llvm-cov --fail-under-lines 80 # Falha se abaixo do limiar
```

## Comandos de Teste

```bash
cargo test                       # Executa todos os testes
cargo test -- --nocapture        # Mostra a saída de println
cargo test test_name             # Executa testes que correspondem ao padrão
cargo test --lib                 # Apenas testes unitários
cargo test --test api_test       # Teste de integração específico (tests/api_test.rs)
cargo test --doc                 # Apenas doc tests
```

## Referências

Veja a skill: `rust-testing` para padrões abrangentes de teste incluindo testes baseados em propriedades, fixtures e benchmarking com Criterion.
