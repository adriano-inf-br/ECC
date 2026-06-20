---
paths:
  - "**/*.rs"
---
# Segurança Rust

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Rust.

## Gerenciamento de Segredos

- Nunca embuta chaves de API, tokens ou credenciais no código-fonte
- Use variáveis de ambiente: `std::env::var("API_KEY")`
- Falhe rapidamente se segredos obrigatórios estiverem ausentes na inicialização
- Mantenha arquivos `.env` no `.gitignore`

```rust
// RUIM
const API_KEY: &str = "sk-abc123...";

// BOM — variável de ambiente com validação antecipada
fn load_api_key() -> anyhow::Result<String> {
    std::env::var("PAYMENT_API_KEY")
        .context("PAYMENT_API_KEY must be set")
}
```

## Prevenção de Injeção SQL

- Sempre use consultas parametrizadas — nunca formate entrada de usuário em strings SQL
- Use query builder ou ORM (sqlx, diesel, sea-orm) com parâmetros de bind

```rust
// RUIM — Injeção SQL via format string
let query = format!("SELECT * FROM users WHERE name = '{name}'");
sqlx::query(&query).fetch_one(&pool).await?;

// BOM — consulta parametrizada com sqlx
// A sintaxe de placeholder varia por backend: Postgres: $1  |  MySQL: ?  |  SQLite: $1
sqlx::query("SELECT * FROM users WHERE name = $1")
    .bind(&name)
    .fetch_one(&pool)
    .await?;
```

## Validação de Entrada

- Valide toda entrada de usuário nos limites do sistema antes de processar
- Use o sistema de tipos para impor invariantes (padrão newtype)
- Parse, não valide — converta dados não estruturados em structs tipados no limite
- Rejeite entrada inválida com mensagens de erro claras

```rust
// Parse, não valide — estados inválidos são irrepresentáveis
pub struct Email(String);

impl Email {
    pub fn parse(input: &str) -> Result<Self, ValidationError> {
        let trimmed = input.trim();
        let at_pos = trimmed.find('@')
            .filter(|&p| p > 0 && p < trimmed.len() - 1)
            .ok_or_else(|| ValidationError::InvalidEmail(input.to_string()))?;
        let domain = &trimmed[at_pos + 1..];
        if trimmed.len() > 254 || !domain.contains('.') {
            return Err(ValidationError::InvalidEmail(input.to_string()));
        }
        // Para uso em produção, prefira uma crate de e-mail validada (ex.: `email_address`)
        Ok(Self(trimmed.to_string()))
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}
```

## Código Unsafe

- Minimize blocos `unsafe` — prefira abstrações seguras
- Todo bloco `unsafe` deve ter um comentário `// SAFETY:` explicando a invariante
- Nunca use `unsafe` para contornar o borrow checker por conveniência
- Audite todo código `unsafe` durante a revisão — é um sinal de alerta sem justificativa
- Prefira wrappers FFI `safe` em torno de bibliotecas C

```rust
// BOM — comentário de segurança documenta TODAS as invariantes necessárias
let widget: &Widget = {
    // SAFETY: `ptr` é não-nulo, alinhado, aponta para um Widget inicializado,
    // e não existem referências mutáveis ou mutações durante seu lifetime.
    unsafe { &*ptr }
};

// RUIM — sem justificativa de segurança
unsafe { &*ptr }
```

## Segurança de Dependências

- Execute `cargo audit` para varrer CVEs conhecidas nas dependências
- Execute `cargo deny check` para conformidade de licenças e advisories
- Use `cargo tree` para auditar dependências transitivas
- Mantenha as dependências atualizadas — configure Dependabot ou Renovate
- Minimize a quantidade de dependências — avalie antes de adicionar novas crates

```bash
# Auditoria de segurança
cargo audit

# Nega advisories, versões duplicadas e licenças restritas
cargo deny check

# Inspeciona a árvore de dependências
cargo tree
cargo tree -d  # Mostra apenas duplicatas
```

## Mensagens de Erro

- Nunca exponha caminhos internos, stack traces ou erros de banco de dados em respostas de API
- Registre erros detalhados no servidor; retorne mensagens genéricas para os clientes
- Use `tracing` ou `log` para logging estruturado no servidor

```rust
// Mapeia erros para códigos de status apropriados e mensagens genéricas
// (O exemplo usa axum; adapte o tipo de resposta ao seu framework)
match order_service.find_by_id(id) {
    Ok(order) => Ok((StatusCode::OK, Json(order))),
    Err(ServiceError::NotFound(_)) => {
        tracing::info!(order_id = id, "order not found");
        Err((StatusCode::NOT_FOUND, "Resource not found"))
    }
    Err(e) => {
        tracing::error!(order_id = id, error = %e, "unexpected error");
        Err((StatusCode::INTERNAL_SERVER_ERROR, "Internal server error"))
    }
}
```

## Referências

Veja a skill: `rust-patterns` para diretrizes de código unsafe e padrões de posse.
Veja a skill: `security-review` para checklists gerais de segurança.
