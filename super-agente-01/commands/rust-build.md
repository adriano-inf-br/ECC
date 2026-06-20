---
description: Corrige erros de build do Rust, problemas do borrow checker e problemas de dependência de forma incremental. Invoca o agent rust-build-resolver para correções mínimas e cirúrgicas.
---

# Build e Correção do Rust

Este comando invoca o agent **rust-build-resolver** para corrigir incrementalmente erros de build do Rust com alterações mínimas.

## O Que Este Comando Faz

1. **Executar Diagnósticos**: Roda `cargo check`, `cargo clippy`, `cargo fmt --check`
2. **Analisar os Erros**: Identifica os códigos de erro e os arquivos afetados
3. **Corrigir Incrementalmente**: Um erro por vez
4. **Verificar Cada Correção**: Reexecuta `cargo check` após cada alteração
5. **Reportar o Resumo**: Mostra o que foi corrigido e o que resta

## Quando Usar

Use `/rust-build` quando:
- `cargo build` ou `cargo check` falhar com erros
- `cargo clippy` reportar warnings
- Erros do borrow checker ou de lifetime bloquearem a compilação
- A resolução de dependências do Cargo falhar
- Após puxar alterações que quebram o build

## Comandos de Diagnóstico Executados

```bash
# Primary build check
cargo check 2>&1

# Lints and suggestions
cargo clippy -- -D warnings 2>&1

# Formatting check
cargo fmt --check 2>&1

# Dependency issues
cargo tree --duplicates

# Security audit (if available)
if command -v cargo-audit >/dev/null; then cargo audit; else echo "cargo-audit not installed"; fi
```

## Exemplo de Sessão

````text
User: /rust-build

Agent:
# Rust Build Resolution

## Initial Diagnostics

```bash
$ cargo check
error[E0502]: cannot borrow `map` as mutable because it is also borrowed as immutable
  --> src/service/cache.rs:25:5
error[E0308]: mismatched types
  --> src/handler/api.rs:42:12
error[E0425]: cannot find value `db` in this scope
  --> src/handler/api.rs:58:9
```

Errors found: 3

## Fix 1: Borrow Checker Error

File: src/service/cache.rs:25
Error: E0502 — cannot borrow `map` as mutable because also borrowed as immutable
Cause: Immutable borrow still active during mutable insert

```rust
// Changed: restructured to end immutable borrow before mutable access
if !map.contains_key("key") {
    map.insert("key".into(), default);
}
```

```bash
$ cargo check
# 2 errors remaining
```

## Fix 2: Type Mismatch

File: src/handler/api.rs:42
Error: E0308 — mismatched types: expected `usize`, found `&str`

```rust
// Changed
let count = params.get("count");
// To
let count: usize = params.get("count")
    .and_then(|s| s.parse().ok())
    .unwrap_or(0);
```

```bash
$ cargo check
# 1 error remaining
```

## Fix 3: Unresolved Name

File: src/handler/api.rs:58
Error: E0425 — cannot find value `db` in this scope
Cause: Missing import

```rust
// Added
use crate::db;
```

```bash
$ cargo check
# Build successful!
```

## Final Verification

```bash
$ cargo clippy -- -D warnings
# No warnings

$ cargo test
running 6 tests
test service::cache::tests::test_insert ... ok
test service::cache::tests::test_get ... ok
test handler::api::tests::test_parse_count ... ok
test handler::api::tests::test_missing_count ... ok
test handler::api::tests::test_db_import ... ok
test handler::api::tests::test_response ... ok

test result: ok. 6 passed; 0 failed; 0 ignored
```

## Summary

| Metric | Count |
|--------|-------|
| Build errors fixed | 3 |
| Clippy warnings fixed | 0 |
| Files modified | 2 |
| Remaining issues | 0 |

Build Status: SUCCESS
````

## Erros Comuns Corrigidos

| Erro | Correção Típica |
|-------|-------------|
| `cannot borrow as mutable` | Reestruture para encerrar o borrow imutável primeiro; clone apenas se justificado |
| `does not live long enough` | Use um tipo owned ou adicione anotação de lifetime |
| `cannot move out of` | Reestruture para tomar posse (ownership); clone apenas como último recurso |
| `mismatched types` | Adicione `.into()`, `as` ou uma conversão explícita |
| `trait X not implemented` | Adicione `#[derive(Trait)]` ou implemente manualmente |
| `unresolved import` | Adicione ao Cargo.toml ou corrija o caminho do `use` |
| `cannot find value` | Adicione o import ou corrija o caminho |

## Estratégia de Correção

1. **Erros de build primeiro** - O código precisa compilar
2. **Warnings do clippy em segundo** - Corrija construções suspeitas
3. **Formatação em terceiro** - Conformidade com `cargo fmt`
4. **Uma correção por vez** - Verifique cada alteração
5. **Alterações mínimas** - Não refatore, apenas corrija

## Condições de Parada

O agent vai parar e reportar se:
- O mesmo erro persistir após 3 tentativas
- A correção introduzir mais erros
- Exigir alterações arquiteturais
- Um erro do borrow checker exigir redesenhar a posse (ownership) dos dados

## Comandos Relacionados

- `/rust-test` - Execute os testes após o build ter sucesso
- `/rust-review` - Revise a qualidade do código
- skill `verification-loop` - Laço completo de verificação

## Relacionados

- Agent: `agents/rust-build-resolver.md`
- Skill: `skills/rust-patterns/`
