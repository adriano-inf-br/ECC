---
paths:
  - "**/*.java"
---
# Segurança em Java

> Este arquivo estende [common/security.md](../common/security.md) com conteúdo específico de Java.

## Gerenciamento de Segredos

- Nunca codifique chaves de API, tokens ou credenciais diretamente no código-fonte
- Use variáveis de ambiente: `System.getenv("API_KEY")`
- Use um gerenciador de segredos (Vault, AWS Secrets Manager) para segredos de produção
- Mantenha arquivos de configuração local com segredos no `.gitignore`

```java
// RUIM
private static final String API_KEY = "sk-abc123...";

// BOM — variável de ambiente
String apiKey = System.getenv("PAYMENT_API_KEY");
Objects.requireNonNull(apiKey, "PAYMENT_API_KEY must be set");
```

## Prevenção de Injeção SQL

- Sempre use consultas parametrizadas — nunca concatene entrada do usuário em SQL
- Use `PreparedStatement` ou a API de consultas parametrizadas do seu framework
- Valide e sanitize qualquer entrada usada em consultas nativas

```java
// RUIM — injeção SQL via concatenação de strings
Statement stmt = conn.createStatement();
String sql = "SELECT * FROM orders WHERE name = '" + name + "'";
stmt.executeQuery(sql);

// BOM — PreparedStatement com consulta parametrizada
PreparedStatement ps = conn.prepareStatement("SELECT * FROM orders WHERE name = ?");
ps.setString(1, name);

// BOM — JDBC template
jdbcTemplate.query("SELECT * FROM orders WHERE name = ?", mapper, name);
```

## Validação de Entrada

- Valide toda entrada do usuário nas fronteiras do sistema antes de processar
- Use Bean Validation (`@NotNull`, `@NotBlank`, `@Size`) em DTOs ao usar um framework de validação
- Sanitize caminhos de arquivo e strings fornecidas pelo usuário antes do uso
- Rejeite entradas que falham na validação com mensagens de erro claras

```java
// Validação manual em Java puro
public Order createOrder(String customerName, BigDecimal amount) {
    if (customerName == null || customerName.isBlank()) {
        throw new IllegalArgumentException("Customer name is required");
    }
    if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("Amount must be positive");
    }
    return new Order(customerName, amount);
}
```

## Autenticação e Autorização

- Nunca implemente criptografia de autenticação própria — use bibliotecas consolidadas
- Armazene senhas com bcrypt ou Argon2, nunca MD5/SHA1
- Imponha verificações de autorização nas fronteiras de serviço
- Limpe dados sensíveis dos logs — nunca registre senhas, tokens ou PII

## Segurança de Dependências

- Execute `mvn dependency:tree` ou `./gradlew dependencies` para auditar dependências transitivas
- Use OWASP Dependency-Check ou Snyk para varrer CVEs conhecidos
- Mantenha as dependências atualizadas — configure Dependabot ou Renovate

## Mensagens de Erro

- Nunca exponha stack traces, caminhos internos ou erros de SQL em respostas de API
- Mapeie exceções para mensagens genéricas e seguras ao cliente nas fronteiras dos handlers
- Registre erros detalhados no lado do servidor; retorne mensagens genéricas aos clientes

```java
// Registre o detalhe, retorne uma mensagem genérica
try {
    return orderService.findById(id);
} catch (OrderNotFoundException ex) {
    log.warn("Order not found: id={}", id);
    return ApiResponse.error("Resource not found");  // genérica, sem detalhes internos
} catch (Exception ex) {
    log.error("Unexpected error processing order id={}", id, ex);
    return ApiResponse.error("Internal server error");  // nunca exponha ex.getMessage()
}
```

## Referências

Veja a skill: `springboot-security` para padrões de autenticação e autorização do Spring Security.
Veja a skill: `quarkus-security` para segurança do Quarkus com JWT/OIDC, RBAC e CDI.
Veja a skill: `security-review` para checklists gerais de segurança.
