---
paths:
  - "**/*.rs"
---
# Estilo de Código Rust

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Rust.

## Formatação

- **rustfmt** para aplicação — sempre execute `cargo fmt` antes de fazer commit
- **clippy** para lints — `cargo clippy -- -D warnings` (trate avisos como erros)
- Indentação de 4 espaços (padrão do rustfmt)
- Largura máxima de linha: 100 caracteres (padrão do rustfmt)

## Imutabilidade

As variáveis em Rust são imutáveis por padrão — adote isso:

- Use `let` por padrão; use `let mut` apenas quando a mutação for necessária
- Prefira retornar novos valores em vez de mutar no local
- Use `Cow<'_, T>` quando uma função pode ou não precisar alocar

```rust
use std::borrow::Cow;

// BOM — imutável por padrão, novo valor retornado
fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input)
    }
}

// RUIM — mutação desnecessária
fn normalize_bad(input: &mut String) {
    *input = input.replace(' ', "_");
}
```

## Nomenclatura

Siga as convenções padrão de Rust:
- `snake_case` para funções, métodos, variáveis, módulos, crates
- `PascalCase` (UpperCamelCase) para tipos, traits, enums, parâmetros de tipo
- `SCREAMING_SNAKE_CASE` para constantes e statics
- Lifetimes: minúsculas curtas (`'a`, `'de`) — nomes descritivos para casos complexos (`'input`)

## Posse e Empréstimo (Ownership and Borrowing)

- Empreste (`&T`) por padrão; tome posse apenas quando precisar armazenar ou consumir
- Nunca clone para satisfazer o borrow checker sem entender a causa raiz
- Aceite `&str` em vez de `String`, `&[T]` em vez de `Vec<T>` em parâmetros de função
- Use `impl Into<String>` para construtores que precisam possuir uma `String`

```rust
// BOM — empresta quando a posse não é necessária
fn word_count(text: &str) -> usize {
    text.split_whitespace().count()
}

// BOM — toma posse no construtor via Into
fn new(name: impl Into<String>) -> Self {
    Self { name: name.into() }
}

// RUIM — toma String quando &str é suficiente
fn word_count_bad(text: String) -> usize {
    text.split_whitespace().count()
}
```

## Tratamento de Erros

- Use `Result<T, E>` e `?` para propagação — nunca `unwrap()` em código de produção
- **Bibliotecas**: defina erros tipados com `thiserror`
- **Aplicações**: use `anyhow` para contexto de erro flexível
- Adicione contexto com `.with_context(|| format!("failed to ..."))?`
- Reserve `unwrap()` / `expect()` para testes e estados verdadeiramente inalcançáveis

```rust
// BOM — erro de biblioteca com thiserror
#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("failed to read config: {0}")]
    Io(#[from] std::io::Error),
    #[error("invalid config format: {0}")]
    Parse(String),
}

// BOM — erro de aplicação com anyhow
use anyhow::Context;

fn load_config(path: &str) -> anyhow::Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read {path}"))?;
    toml::from_str(&content)
        .with_context(|| format!("failed to parse {path}"))
}
```

## Iteradores em vez de Loops

Prefira cadeias de iteradores para transformações; use loops para controle de fluxo complexo:

```rust
// BOM — declarativo e combinável
let active_emails: Vec<&str> = users.iter()
    .filter(|u| u.is_active)
    .map(|u| u.email.as_str())
    .collect();

// BOM — loop para lógica complexa com retornos antecipados
for user in &users {
    if let Some(verified) = verify_email(&user.email)? {
        send_welcome(&verified)?;
    }
}
```

## Organização de Módulos

Organize por domínio, não por tipo:

```text
src/
├── main.rs
├── lib.rs
├── auth/           # Módulo de domínio
│   ├── mod.rs
│   ├── token.rs
│   └── middleware.rs
├── orders/         # Módulo de domínio
│   ├── mod.rs
│   ├── model.rs
│   └── service.rs
└── db/             # Infraestrutura
    ├── mod.rs
    └── pool.rs
```

## Visibilidade

- Padronize como privado; use `pub(crate)` para compartilhamento interno
- Marque como `pub` apenas o que faz parte da API pública da crate
- Reexporte a API pública a partir de `lib.rs`

## Referências

Veja a skill: `rust-patterns` para idiomas e padrões abrangentes de Rust.
