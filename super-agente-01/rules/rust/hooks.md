---
paths:
  - "**/*.rs"
  - "**/Cargo.toml"
---
# Hooks Rust

> Este arquivo estende [common/hooks.md](../common/hooks.md) com conteúdo específico de Rust.

## Hooks PostToolUse

Configure em `~/.claude/settings.json`:

- **cargo fmt**: Formata automaticamente arquivos `.rs` após a edição
- **cargo clippy**: Executa verificações de lint após editar arquivos Rust
- **cargo check**: Verifica a compilação após mudanças (mais rápido que `cargo build`)
