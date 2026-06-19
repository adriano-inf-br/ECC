---
paths:
  - "**/*.java"
---
# Padrões de Java

> Este arquivo estende [common/patterns.md](../common/patterns.md) com conteúdo específico de Java.

## Padrão Repository

Encapsule o acesso a dados atrás de uma interface:

```java
public interface OrderRepository {
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Order save(Order order);
    void deleteById(Long id);
}
```

Implementações concretas tratam dos detalhes de armazenamento (JPA, JDBC, em memória para testes).

## Camada de Serviço

Lógica de negócio em classes de serviço; mantenha controllers e repositórios enxutos:

```java
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentGateway paymentGateway;

    public OrderService(OrderRepository orderRepository, PaymentGateway paymentGateway) {
        this.orderRepository = orderRepository;
        this.paymentGateway = paymentGateway;
    }

    public OrderSummary placeOrder(CreateOrderRequest request) {
        var order = Order.from(request);
        paymentGateway.charge(order.total());
        var saved = orderRepository.save(order);
        return OrderSummary.from(saved);
    }
}
```

## Injeção via Construtor

Sempre use injeção via construtor — nunca injeção em campo:

```java
// BOM — injeção via construtor (testável, imutável)
public class NotificationService {
    private final EmailSender emailSender;

    public NotificationService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }
}

// RUIM — injeção em campo (não testável sem reflexão, exige mágica do framework)
public class NotificationService {
    @Inject // ou @Autowired
    private EmailSender emailSender;
}
```

## Mapeamento de DTO

Use records para DTOs. Faça o mapeamento nas fronteiras de serviço/controller:

```java
public record OrderResponse(Long id, String customer, BigDecimal total) {
    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerName(), order.getTotal());
    }
}
```

## Padrão Builder

Use para objetos com muitos parâmetros opcionais:

```java
public class SearchCriteria {
    private final String query;
    private final int page;
    private final int size;
    private final String sortBy;

    private SearchCriteria(Builder builder) {
        this.query = builder.query;
        this.page = builder.page;
        this.size = builder.size;
        this.sortBy = builder.sortBy;
    }

    public static class Builder {
        private String query = "";
        private int page = 0;
        private int size = 20;
        private String sortBy = "id";

        public Builder query(String query) { this.query = query; return this; }
        public Builder page(int page) { this.page = page; return this; }
        public Builder size(int size) { this.size = size; return this; }
        public Builder sortBy(String sortBy) { this.sortBy = sortBy; return this; }
        public SearchCriteria build() { return new SearchCriteria(this); }
    }
}
```

## Tipos Sealed para Modelos de Domínio

```java
public sealed interface PaymentResult permits PaymentSuccess, PaymentFailure {
    record PaymentSuccess(String transactionId, BigDecimal amount) implements PaymentResult {}
    record PaymentFailure(String errorCode, String message) implements PaymentResult {}
}

// Tratamento exaustivo (Java 21+)
String message = switch (result) {
    case PaymentSuccess s -> "Paid: " + s.transactionId();
    case PaymentFailure f -> "Failed: " + f.errorCode();
};
```

## Envelope de Resposta da API

Respostas de API consistentes:

```java
public record ApiResponse<T>(boolean success, T data, String error) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```

## Referências

Veja a skill: `springboot-patterns` para padrões de arquitetura do Spring Boot.
Veja a skill: `quarkus-patterns` para padrões de arquitetura do Quarkus com REST, Panache e mensageria.
Veja a skill: `jpa-patterns` para design de entidades e otimização de consultas.
