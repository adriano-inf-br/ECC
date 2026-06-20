---
name: rust-patterns
description: Padrões Rust idiomáticos, ownership, tratamento de erros, traits, concorrência e boas práticas para construir aplicações seguras e de alto desempenho.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento Rust

Padrões Rust idiomáticos e boas práticas para construir aplicações seguras, de alto desempenho e fáceis de manter.

## Quando Usar

- Escrevendo novo código Rust
- Revisando código Rust
- Refatorando código Rust existente
- Projetando estrutura de crate e organização de módulos

## Como Funciona

Esta skill aplica convenções Rust idiomáticas em seis áreas principais: ownership e borrowing para prevenir condições de corrida em tempo de compilação, propagação de erros `Result`/`?` com `thiserror` para bibliotecas e `anyhow` para aplicações, enums e pattern matching exaustivo para tornar estados ilegais irrepresentáveis, traits e generics para abstração de custo zero, concorrência segura via `Arc<Mutex<T>>`, canais e async/await, e superfícies `pub` mínimas organizadas por domínio.

## Princípios Fundamentais

### 1. Ownership e Borrowing

O sistema de ownership do Rust previne condições de corrida e bugs de memória em tempo de compilação.

```rust
// Bom: Passe referências quando não precisar de ownership
fn process(data: &[u8]) -> usize {
    data.len()
}

// Bom: Tome ownership apenas quando precisar armazenar ou consumir
fn store(data: Vec<u8>) -> Record {
    Record { payload: data }
}

// Ruim: Clonagem desnecessária para evitar o borrow checker
fn process_bad(data: &Vec<u8>) -> usize {
    let cloned = data.clone(); // Desperdício — apenas empreste
    cloned.len()
}
```

### Use `Cow` para Ownership Flexível

```rust
use std::borrow::Cow;

fn normalize(input: &str) -> Cow<'_, str> {
    if input.contains(' ') {
        Cow::Owned(input.replace(' ', "_"))
    } else {
        Cow::Borrowed(input) // Custo zero quando não há mutação necessária
    }
}
```

## Tratamento de Erros

### Use `Result` e `?` — Nunca `unwrap()` em Produção

```rust
// Bom: Propague erros com contexto
use anyhow::{Context, Result};

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)
        .with_context(|| format!("falha ao ler config de {path}"))?;
    let config: Config = toml::from_str(&content)
        .with_context(|| format!("falha ao fazer parsing da config de {path}"))?;
    Ok(config)
}

// Ruim: Entra em pânico ao encontrar erro
fn load_config_bad(path: &str) -> Config {
    let content = std::fs::read_to_string(path).unwrap(); // Entra em pânico!
    toml::from_str(&content).unwrap()
}
```

### Erros de Biblioteca com `thiserror`, Erros de Aplicação com `anyhow`

```rust
// Código de biblioteca: erros estruturados e tipados
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("registro não encontrado: {id}")]
    NotFound { id: String },
    #[error("conexão falhou")]
    Connection(#[from] std::io::Error),
    #[error("dados inválidos: {0}")]
    InvalidData(String),
}

// Código de aplicação: tratamento de erros flexível
use anyhow::{bail, Result};

fn run() -> Result<()> {
    let config = load_config("app.toml")?;
    if config.workers == 0 {
        bail!("contagem de workers deve ser > 0");
    }
    Ok(())
}
```

### Combinadores `Option` em vez de Matching Aninhado

```rust
// Bom: Cadeia de combinadores
fn find_user_email(users: &[User], id: u64) -> Option<String> {
    users.iter()
        .find(|u| u.id == id)
        .map(|u| u.email.clone())
}

// Ruim: Matching profundamente aninhado
fn find_user_email_bad(users: &[User], id: u64) -> Option<String> {
    match users.iter().find(|u| u.id == id) {
        Some(user) => match &user.email {
            email => Some(email.clone()),
        },
        None => None,
    }
}
```

## Enums e Pattern Matching

### Modele Estados como Enums

```rust
// Bom: Estados impossíveis são irrepresentáveis
enum ConnectionState {
    Disconnected,
    Connecting { attempt: u32 },
    Connected { session_id: String },
    Failed { reason: String, retries: u32 },
}

fn handle(state: &ConnectionState) {
    match state {
        ConnectionState::Disconnected => connect(),
        ConnectionState::Connecting { attempt } if *attempt > 3 => abort(),
        ConnectionState::Connecting { .. } => wait(),
        ConnectionState::Connected { session_id } => use_session(session_id),
        ConnectionState::Failed { retries, .. } if *retries < 5 => retry(),
        ConnectionState::Failed { reason, .. } => log_failure(reason),
    }
}
```

### Matching Exaustivo — Sem Catch-All para Lógica de Negócio

```rust
// Bom: Trate cada variante explicitamente
match command {
    Command::Start => start_service(),
    Command::Stop => stop_service(),
    Command::Restart => restart_service(),
    // Adicionar uma nova variante força o tratamento aqui
}

// Ruim: Wildcard oculta novas variantes
match command {
    Command::Start => start_service(),
    _ => {} // Ignora silenciosamente Stop, Restart e futuras variantes
}
```

## Traits e Generics

### Aceite Generics, Retorne Tipos Concretos

```rust
// Bom: Entrada genérica, saída concreta
fn read_all(reader: &mut impl Read) -> std::io::Result<Vec<u8>> {
    let mut buf = Vec::new();
    reader.read_to_end(&mut buf)?;
    Ok(buf)
}

// Bom: Bounds de trait para múltiplas restrições
fn process<T: Display + Send + 'static>(item: T) -> String {
    format!("processado: {item}")
}
```

### Trait Objects para Dispatch Dinâmico

```rust
// Use quando precisar de coleções heterogêneas ou sistemas de plugin
trait Handler: Send + Sync {
    fn handle(&self, request: &Request) -> Response;
}

struct Router {
    handlers: Vec<Box<dyn Handler>>,
}

// Use generics quando precisar de desempenho (monomorphization)
fn fast_process<H: Handler>(handler: &H, request: &Request) -> Response {
    handler.handle(request)
}
```

### Padrão Newtype para Segurança de Tipos

```rust
// Bom: Tipos distintos impedem mistura de argumentos
struct UserId(u64);
struct OrderId(u64);

fn get_order(user: UserId, order: OrderId) -> Result<Order> {
    // Não é possível trocar acidentalmente IDs de usuário e pedido
    todo!()
}

// Ruim: Fácil de trocar argumentos
fn get_order_bad(user_id: u64, order_id: u64) -> Result<Order> {
    todo!()
}
```

## Structs e Modelagem de Dados

### Padrão Builder para Construção Complexa

```rust
struct ServerConfig {
    host: String,
    port: u16,
    max_connections: usize,
}

impl ServerConfig {
    fn builder(host: impl Into<String>, port: u16) -> ServerConfigBuilder {
        ServerConfigBuilder { host: host.into(), port, max_connections: 100 }
    }
}

struct ServerConfigBuilder { host: String, port: u16, max_connections: usize }

impl ServerConfigBuilder {
    fn max_connections(mut self, n: usize) -> Self { self.max_connections = n; self }
    fn build(self) -> ServerConfig {
        ServerConfig { host: self.host, port: self.port, max_connections: self.max_connections }
    }
}

// Uso: ServerConfig::builder("localhost", 8080).max_connections(200).build()
```

## Iteradores e Closures

### Prefira Cadeias de Iteradores a Loops Manuais

```rust
// Bom: Declarativo, lazy, composável
let active_emails: Vec<String> = users.iter()
    .filter(|u| u.is_active)
    .map(|u| u.email.clone())
    .collect();

// Ruim: Acumulação imperativa
let mut active_emails = Vec::new();
for user in &users {
    if user.is_active {
        active_emails.push(user.email.clone());
    }
}
```

### Use `collect()` com Anotação de Tipo

```rust
// Colete em tipos diferentes
let names: Vec<_> = items.iter().map(|i| &i.name).collect();
let lookup: HashMap<_, _> = items.iter().map(|i| (i.id, i)).collect();
let combined: String = parts.iter().copied().collect();

// Colete Results — curto-circuita no primeiro erro
let parsed: Result<Vec<i32>, _> = strings.iter().map(|s| s.parse()).collect();
```

## Concorrência

### `Arc<Mutex<T>>` para Estado Mutável Compartilhado

```rust
use std::sync::{Arc, Mutex};

let counter = Arc::new(Mutex::new(0));
let handles: Vec<_> = (0..10).map(|_| {
    let counter = Arc::clone(&counter);
    std::thread::spawn(move || {
        let mut num = counter.lock().expect("mutex envenenado");
        *num += 1;
    })
}).collect();

for handle in handles {
    handle.join().expect("thread worker entrou em pânico");
}
```

### Canais para Passagem de Mensagens

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::sync_channel(16); // Canal limitado com backpressure

for i in 0..5 {
    let tx = tx.clone();
    std::thread::spawn(move || {
        tx.send(format!("mensagem {i}")).expect("receptor desconectado");
    });
}
drop(tx); // Fecha o sender para que o iterador rx termine

for msg in rx {
    println!("{msg}");
}
```

### Async com Tokio

```rust
use tokio::time::Duration;

async fn fetch_with_timeout(url: &str) -> Result<String> {
    let response = tokio::time::timeout(
        Duration::from_secs(5),
        reqwest::get(url),
    )
    .await
    .context("requisição expirou")?
    .context("requisição falhou")?;

    response.text().await.context("falha ao ler corpo")
}

// Spawne tasks concorrentes
async fn fetch_all(urls: Vec<String>) -> Vec<Result<String>> {
    let handles: Vec<_> = urls.into_iter()
        .map(|url| tokio::spawn(async move {
            fetch_with_timeout(&url).await
        }))
        .collect();

    let mut results = Vec::with_capacity(handles.len());
    for handle in handles {
        results.push(handle.await.unwrap_or_else(|e| panic!("task spawnada entrou em pânico: {e}")));
    }
    results
}
```

## Código Unsafe

### Quando Unsafe é Aceitável

```rust
// Aceitável: Limite de FFI com invariantes documentados (Rust 2024+)
/// # Safety
/// `ptr` deve ser um ponteiro válido e alinhado para um `Widget` inicializado.
unsafe fn widget_from_raw<'a>(ptr: *const Widget) -> &'a Widget {
    // SAFETY: o chamador garante que ptr é válido e alinhado
    unsafe { &*ptr }
}

// Aceitável: Caminho crítico de desempenho com prova de correção
// SAFETY: index é sempre < len devido ao limite do loop
unsafe { slice.get_unchecked(index) }
```

### Quando Unsafe NÃO é Aceitável

```rust
// Ruim: Usar unsafe para ignorar o borrow checker
// Ruim: Usar unsafe por conveniência
// Ruim: Usar unsafe sem comentário Safety
// Ruim: Transmutar entre tipos não relacionados
```

## Sistema de Módulos e Estrutura de Crate

### Organize por Domínio, Não por Tipo

```text
my_app/
├── src/
│   ├── main.rs
│   ├── lib.rs
│   ├── auth/          # Módulo de domínio
│   │   ├── mod.rs
│   │   ├── token.rs
│   │   └── middleware.rs
│   ├── orders/        # Módulo de domínio
│   │   ├── mod.rs
│   │   ├── model.rs
│   │   └── service.rs
│   └── db/            # Infraestrutura
│       ├── mod.rs
│       └── pool.rs
├── tests/             # Testes de integração
├── benches/           # Benchmarks
└── Cargo.toml
```

### Visibilidade — Exponha Minimamente

```rust
// Bom: pub(crate) para compartilhamento interno
pub(crate) fn validate_input(input: &str) -> bool {
    !input.is_empty()
}

// Bom: Re-exporte a API pública de lib.rs
pub mod auth;
pub use auth::AuthMiddleware;

// Ruim: Tornar tudo pub
pub fn internal_helper() {} // Deveria ser pub(crate) ou privado
```

## Integração de Ferramentas

### Comandos Essenciais

```bash
# Build e verificação
cargo build
cargo check              # Verificação de tipos rápida sem geração de código
cargo clippy             # Lints e sugestões
cargo fmt                # Formatar código

# Testes
cargo test
cargo test -- --nocapture    # Mostrar saída do println
cargo test --lib             # Apenas testes unitários
cargo test --test integration # Apenas testes de integração

# Dependências
cargo audit              # Auditoria de segurança
cargo tree               # Árvore de dependências
cargo update             # Atualizar dependências

# Desempenho
cargo bench              # Executar benchmarks
```

## Referência Rápida: Idiomas Rust

| Idioma | Descrição |
|-------|-------------|
| Empreste, não clone | Passe `&T` em vez de clonar, a menos que ownership seja necessário |
| Torne estados ilegais irrepresentáveis | Use enums para modelar apenas estados válidos |
| `?` em vez de `unwrap()` | Propague erros, nunca entre em pânico em código de biblioteca/produção |
| Parse, não valide | Converta dados não estruturados em structs tipadas na fronteira |
| Newtype para segurança de tipos | Envolva primitivos em newtypes para prevenir trocas de argumentos |
| Prefira iteradores a loops | Cadeias declarativas são mais claras e frequentemente mais rápidas |
| `#[must_use]` em Results | Garanta que os chamadores tratem os valores de retorno |
| `Cow` para ownership flexível | Evite alocações quando o borrowing é suficiente |
| Matching exaustivo | Sem wildcard `_` para enums críticos de negócio |
| Superfície `pub` mínima | Use `pub(crate)` para APIs internas |

## Anti-Padrões a Evitar

```rust
// Ruim: .unwrap() em código de produção
let value = map.get("key").unwrap();

// Ruim: .clone() para satisfazer o borrow checker sem entender por quê
let data = expensive_data.clone();
process(&original, &data);

// Ruim: Usar String quando &str é suficiente
fn greet(name: String) { /* deveria ser &str */ }

// Ruim: Box<dyn Error> em bibliotecas (use thiserror)
fn parse(input: &str) -> Result<Data, Box<dyn std::error::Error>> { todo!() }

// Ruim: Ignorar avisos must_use
let _ = validate(input); // Descartando silenciosamente um Result

// Ruim: Bloquear em contexto async
async fn bad_async() {
    std::thread::sleep(Duration::from_secs(1)); // Bloqueia o executor!
    // Use: tokio::time::sleep(Duration::from_secs(1)).await;
}
```

**Lembre-se**: Se compila, provavelmente está correto — mas apenas se você evitar `unwrap()`, minimizar `unsafe` e deixar o sistema de tipos trabalhar por você.
