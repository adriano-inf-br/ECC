---
name: springboot-tdd
description: Desenvolvimento orientado a testes para Spring Boot usando JUnit 5, Mockito, MockMvc, Testcontainers e JaCoCo. Use ao adicionar recursos, corrigir bugs ou refatorar.
metadata:
  origin: ECC
---

# Fluxo de Trabalho TDD com Spring Boot

Orientação de TDD para serviços Spring Boot com cobertura de 80%+ (unitária + integração).

## Quando Usar

- Novos recursos ou endpoints
- Correções de bugs ou refatorações
- Adicionar lógica de acesso a dados ou regras de segurança

## Fluxo de Trabalho

1) Escreva os testes primeiro (eles devem falhar)
2) Implemente o código mínimo para passar
3) Refatore com os testes passando
4) Aplique cobertura (JaCoCo)

## Testes Unitários (JUnit 5 + Mockito)

```java
@ExtendWith(MockitoExtension.class)
class MarketServiceTest {
  @Mock MarketRepository repo;
  @InjectMocks MarketService service;

  @Test
  void createsMarket() {
    CreateMarketRequest req = new CreateMarketRequest("name", "desc", Instant.now(), List.of("cat"));
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    Market result = service.create(req);

    assertThat(result.name()).isEqualTo("name");
    verify(repo).save(any());
  }
}
```

Padrões:
- Arrange-Act-Assert
- Evite mocks parciais; prefira stubbing explícito
- Use `@ParameterizedTest` para variantes

## Testes da Camada Web (MockMvc)

```java
@WebMvcTest(MarketController.class)
class MarketControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean MarketService marketService;

  @Test
  void returnsMarkets() throws Exception {
    when(marketService.list(any())).thenReturn(Page.empty());

    mockMvc.perform(get("/api/markets"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.content").isArray());
  }
}
```

## Testes de Integração (SpringBootTest)

```java
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarketIntegrationTest {
  @Autowired MockMvc mockMvc;

  @Test
  void createsMarket() throws Exception {
    mockMvc.perform(post("/api/markets")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {"name":"Test","description":"Desc","endDate":"2030-01-01T00:00:00Z","categories":["general"]}
        """))
      .andExpect(status().isCreated());
  }
}
```

## Testes de Persistência (DataJpaTest)

```java
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(TestContainersConfig.class)
class MarketRepositoryTest {
  @Autowired MarketRepository repo;

  @Test
  void savesAndFinds() {
    MarketEntity entity = new MarketEntity();
    entity.setName("Test");
    repo.save(entity);

    Optional<MarketEntity> found = repo.findByName("Test");
    assertThat(found).isPresent();
  }
}
```

## Testcontainers

- Use containers reutilizáveis para Postgres/Redis para espelhar a produção
- Injete via `@DynamicPropertySource` para inserir URLs JDBC no contexto do Spring

## Cobertura (JaCoCo)

Trecho Maven:
```xml
<plugin>
  <groupId>org.jacoco</groupId>
  <artifactId>jacoco-maven-plugin</artifactId>
  <version>0.8.14</version>
  <executions>
    <execution>
      <goals><goal>prepare-agent</goal></goals>
    </execution>
    <execution>
      <id>report</id>
      <phase>verify</phase>
      <goals><goal>report</goal></goals>
    </execution>
  </executions>
</plugin>
```

## Asserções

- Prefira AssertJ (`assertThat`) para legibilidade
- Para respostas JSON, use `jsonPath`
- Para exceções: `assertThatThrownBy(...)`

## Builders de Dados de Teste

```java
class MarketBuilder {
  private String name = "Test";
  MarketBuilder withName(String name) { this.name = name; return this; }
  Market build() { return new Market(null, name, MarketStatus.ACTIVE); }
}
```

## Comandos CI

- Maven: `mvn -T 4 test` ou `mvn verify`
- Gradle: `./gradlew test jacocoTestReport`

**Lembre-se**: Mantenha os testes rápidos, isolados e determinísticos. Teste comportamento, não detalhes de implementação.
