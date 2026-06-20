---
paths:
  - "**/*.java"
---
# Estilo de Código Java

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de Java.

## Formatação

- **google-java-format** ou **Checkstyle** (estilo Google ou Sun) para imposição
- Um único tipo público de nível superior por arquivo
- Indentação consistente: 2 ou 4 espaços (siga o padrão do projeto)
- Ordem dos membros: constantes, campos, construtores, métodos públicos, protegidos, privados

## Imutabilidade

- Prefira `record` para tipos de valor (Java 16+)
- Marque campos como `final` por padrão — use estado mutável somente quando necessário
- Retorne cópias defensivas em APIs públicas: `List.copyOf()`, `Map.copyOf()`, `Set.copyOf()`
- Copy-on-write: retorne novas instâncias em vez de mutar as existentes

```java
// BOM — tipo de valor imutável
public record OrderSummary(Long id, String customerName, BigDecimal total) {}

// BOM — campos final, sem setters
public class Order {
    private final Long id;
    private final List<LineItem> items;

    public List<LineItem> getItems() {
        return List.copyOf(items);
    }
}
```

## Nomenclatura

Siga as convenções padrão de Java:
- `PascalCase` para classes, interfaces, records, enums
- `camelCase` para métodos, campos, parâmetros, variáveis locais
- `SCREAMING_SNAKE_CASE` para constantes `static final`
- Pacotes: tudo em minúsculas, domínio invertido (`com.example.app.service`)

## Recursos Modernos do Java

Use recursos modernos da linguagem onde melhorem a clareza:
- **Records** para DTOs e tipos de valor (Java 16+)
- **Sealed classes** para hierarquias de tipos fechadas (Java 17+)
- **Pattern matching** com `instanceof` — sem cast explícito (Java 16+)
- **Text blocks** para strings de múltiplas linhas — SQL, templates JSON (Java 15+)
- **Switch expressions** com sintaxe de seta (Java 14+)
- **Pattern matching em switch** — tratamento exaustivo de tipos sealed (Java 21+)

```java
// Pattern matching com instanceof
if (shape instanceof Circle c) {
    return Math.PI * c.radius() * c.radius();
}

// Hierarquia de tipos sealed
public sealed interface PaymentMethod permits CreditCard, BankTransfer, Wallet {}

// Switch expression
String label = switch (status) {
    case ACTIVE -> "Active";
    case SUSPENDED -> "Suspended";
    case CLOSED -> "Closed";
};
```

## Uso de Optional

- Retorne `Optional<T>` de métodos localizadores que podem não ter resultado
- Use `map()`, `flatMap()`, `orElseThrow()` — nunca chame `get()` sem `isPresent()`
- Nunca use `Optional` como tipo de campo ou parâmetro de método

```java
// BOM
return repository.findById(id)
    .map(ResponseDto::from)
    .orElseThrow(() -> new OrderNotFoundException(id));

// RUIM — Optional como parâmetro
public void process(Optional<String> name) {}
```

## Tratamento de Erros

- Prefira exceções não verificadas (unchecked) para erros de domínio
- Crie exceções específicas de domínio estendendo `RuntimeException`
- Evite `catch (Exception e)` abrangente, exceto em handlers de nível superior
- Inclua contexto nas mensagens de exceção

```java
public class OrderNotFoundException extends RuntimeException {
    public OrderNotFoundException(Long id) {
        super("Order not found: id=" + id);
    }
}
```

## Streams

- Use streams para transformações; mantenha pipelines curtos (máximo de 3-4 operações)
- Prefira referências de método quando legíveis: `.map(Order::getTotal)`
- Evite efeitos colaterais em operações de stream
- Para lógica complexa, prefira um loop a um pipeline de stream rebuscado

## Referências

Veja a skill: `java-coding-standards` para os padrões de código completos com exemplos.
Veja a skill: `jpa-patterns` para padrões de design de entidades JPA/Hibernate.
