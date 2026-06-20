---
description: Revisão abrangente de código Rust para ownership, lifetimes, tratamento de erros, uso de unsafe e padrões idiomáticos. Invoca o agent rust-reviewer.
---

# Revisão de Código Rust

Este comando invoca o agent **rust-reviewer** para uma revisão abrangente de código específica de Rust.

## O Que Este Comando Faz

1. **Verificar as Checagens Automatizadas**: Roda `cargo check`, `cargo clippy -- -D warnings`, `cargo fmt --check` e `cargo test` — pare se algum falhar
2. **Identificar Alterações Rust**: Encontra arquivos `.rs` modificados via `git diff HEAD~1` (ou `git diff main...HEAD` para PRs)
3. **Executar Auditoria de Segurança**: Roda `cargo audit` se disponível
4. **Varredura de Segurança**: Verifica uso de unsafe, injeção de comando, segredos hardcoded
5. **Revisão de Ownership**: Analisa clones desnecessários, problemas de lifetime, padrões de borrowing
6. **Gerar Relatório**: Categoriza os problemas por severidade

## Quando Usar

Use `/rust-review` quando:
- Após escrever ou modificar código Rust
- Antes de fazer commit de alterações em Rust
- Ao revisar pull requests com código Rust
- Ao se integrar a uma nova base de código Rust
- Ao aprender padrões idiomáticos de Rust

## Categorias de Revisão

### CRITICAL (Deve Corrigir)
- `unwrap()`/`expect()` sem verificação em caminhos de código de produção
- `unsafe` sem comentário `// SAFETY:` documentando os invariantes
- Injeção de SQL via interpolação de string em queries
- Injeção de comando via entrada não validada em `std::process::Command`
- Credenciais hardcoded
- Use-after-free via raw pointers

### HIGH (Deveria Corrigir)
- `.clone()` desnecessário para satisfazer o borrow checker
- Parâmetro `String` onde `&str` ou `impl AsRef<str>` é suficiente
- Bloqueio em contexto async (`std::thread::sleep`, `std::fs`)
- Bounds `Send`/`Sync` faltando em tipos compartilhados
- Match com curinga `_ =>` em enums críticos para o negócio
- Funções grandes (>50 linhas)

### MEDIUM (Considerar)
- Alocação desnecessária em caminhos quentes (hot paths)
- Falta de `with_capacity` quando o tamanho é conhecido
- Warnings do clippy suprimidos sem justificativa
- API pública sem documentação `///`
- Considere `#[must_use]` em tipos de retorno não-`must_use` onde ignorar os valores provavelmente é um bug

## Verificações Automatizadas Executadas

```bash
# Build gate (must pass before review)
cargo check

# Lints and suggestions
cargo clippy -- -D warnings

# Formatting
cargo fmt --check

# Tests
cargo test

# Security audit (if available)
if command -v cargo-audit >/dev/null; then cargo audit; else echo "cargo-audit not installed"; fi
```

## Exemplo de Uso

````text
User: /rust-review

Agent:
# Rust Code Review Report

## Files Reviewed
- src/service/user.rs (modified)
- src/handler/api.rs (modified)

## Static Analysis Results
- Build: Successful
- Clippy: No warnings
- Formatting: Passed
- Tests: All passing

## Issues Found

[CRITICAL] Unchecked unwrap in Production Path
File: src/service/user.rs:28
Issue: Using `.unwrap()` on database query result
```rust
let user = db.find_by_id(id).unwrap();  // Panics on missing user
```
Fix: Propagate error with context
```rust
let user = db.find_by_id(id)
    .context("failed to fetch user")?;
```

[HIGH] Unnecessary Clone
File: src/handler/api.rs:45
Issue: Cloning String to satisfy borrow checker
```rust
let name = user.name.clone();
process(&user, &name);
```
Fix: Restructure to avoid clone
```rust
let result = process_name(&user.name);
use_user(&user, result);
```

## Summary
- CRITICAL: 1
- HIGH: 1
- MEDIUM: 0

Recommendation: Block merge until CRITICAL issue is fixed
````

## Critérios de Aprovação

| Status | Condição |
|--------|-----------|
| Approve | Nenhum problema CRITICAL ou HIGH |
| Warning | Apenas problemas MEDIUM (mesclar com cautela) |
| Block | Problemas CRITICAL ou HIGH encontrados |

## Integração com Outros Comandos

- Use `/rust-test` primeiro para garantir que os testes passem
- Use `/rust-build` se ocorrerem erros de build
- Use `/rust-review` antes de fazer commit
- Use `/code-review` para questões não específicas de Rust

## Relacionados

- Agent: `agents/rust-reviewer.md`
- Skills: `skills/rust-patterns/`, `skills/rust-testing/`
