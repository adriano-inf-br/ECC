---
paths:
  - "**/*.java"
---
# Testes em Java

> Este arquivo estende [common/testing.md](../common/testing.md) com conteúdo específico de Java.

## Framework de Testes

- **JUnit 5** (`@Test`, `@ParameterizedTest`, `@Nested`, `@DisplayName`)
- **AssertJ** para asserções fluentes (`assertThat(result).isEqualTo(expected)`)
- **Mockito** para criar mocks de dependências
- **Testcontainers** para testes de integração que exigem bancos de dados ou serviços

## Organização dos Testes

```
src/test/java/com/example/app/
  service/           # Testes unitários da camada de serviço
  controller/        # Testes da camada web / API
  repository/        # Testes de acesso a dados
  integration/       # Testes de integração entre camadas
```

Espelhe a estrutura de pacotes de `src/main/java` em `src/test/java`.

## Padrão de Teste Unitário

```java
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = new OrderService(orderRepository);
    }

    @Test
    @DisplayName("findById returns order when exists")
    void findById_existingOrder_returnsOrder() {
        var order = new Order(1L, "Alice", BigDecimal.TEN);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        var result = orderService.findById(1L);

        assertThat(result.customerName()).isEqualTo("Alice");
        verify(orderRepository).findById(1L);
    }

    @Test
    @DisplayName("findById throws when order not found")
    void findById_missingOrder_throws() {
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.findById(99L))
            .isInstanceOf(OrderNotFoundException.class)
            .hasMessageContaining("99");
    }
}
```

## Testes Parametrizados

```java
@ParameterizedTest
@CsvSource({
    "100.00, 10, 90.00",
    "50.00, 0, 50.00",
    "200.00, 25, 150.00"
})
@DisplayName("discount applied correctly")
void applyDiscount(BigDecimal price, int pct, BigDecimal expected) {
    assertThat(PricingUtils.discount(price, pct)).isEqualByComparingTo(expected);
}
```

## Testes de Integração

Use Testcontainers para integração real com banco de dados:

```java
@Testcontainers
class OrderRepositoryIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    private OrderRepository repository;

    @BeforeEach
    void setUp() {
        var dataSource = new PGSimpleDataSource();
        dataSource.setUrl(postgres.getJdbcUrl());
        dataSource.setUser(postgres.getUsername());
        dataSource.setPassword(postgres.getPassword());
        repository = new JdbcOrderRepository(dataSource);
    }

    @Test
    void save_and_findById() {
        var saved = repository.save(new Order(null, "Bob", BigDecimal.ONE));
        var found = repository.findById(saved.getId());
        assertThat(found).isPresent();
    }
}
```

Para testes de integração do Spring Boot, veja a skill: `springboot-tdd`.
Para testes de integração do Quarkus, veja a skill: `quarkus-tdd`.

## Nomenclatura de Testes

Use nomes descritivos com `@DisplayName`:
- `methodName_scenario_expectedBehavior()` para nomes de métodos
- `@DisplayName("descrição legível por humanos")` para relatórios

## Cobertura

- Mire em 80%+ de cobertura de linhas
- Use JaCoCo para relatórios de cobertura
- Foque na lógica de serviço e de domínio — pule getters triviais/classes de configuração

## Referências

Veja a skill: `springboot-tdd` para padrões de TDD do Spring Boot com MockMvc e Testcontainers.
Veja a skill: `quarkus-tdd` para padrões de TDD do Quarkus com REST Assured e Dev Services.
Veja a skill: `java-coding-standards` para as expectativas de teste.
