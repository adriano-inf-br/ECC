---
name: java-coding-standards
description: "Padrões de código Java para serviços Spring Boot e Quarkus: nomenclatura, imutabilidade, uso de Optional, streams, exceções, generics, CDI, padrões reativos e estrutura de projeto. Aplica automaticamente convenções específicas do framework."
metadata:
  origin: ECC
---

# Java Coding Standards

Padrões para código Java (17+) legível e de fácil manutenção em serviços Spring Boot e Quarkus.

## Quando Usar

- Escrever ou revisar código Java em projetos Spring Boot ou Quarkus
- Aplicar convenções de nomenclatura, imutabilidade ou tratamento de exceções
- Trabalhar com records, sealed classes ou pattern matching (Java 17+)
- Revisar uso de Optional, streams ou generics
- Estruturar pacotes e a organização do projeto
- **[QUARKUS]**: Trabalhar com escopos de CDI, entidades Panache ou pipelines reativos

## Como Funciona

### Detecção de framework

Antes de aplicar os padrões, determine o framework a partir do arquivo de build:

- Arquivo de build contém `quarkus` → aplique as convenções **[QUARKUS]**
- Arquivo de build contém `spring-boot` → aplique as convenções **[SPRING]**
- Nenhum detectado → aplique apenas as convenções compartilhadas

## Princípios fundamentais

- Prefira clareza a esperteza
- Imutável por padrão; minimize estado mutável compartilhado
- Falhe rápido com exceções significativas
- Nomenclatura e estrutura de pacotes consistentes
- **[QUARKUS]**: Favoreça o processamento em tempo de build em vez de tempo de execução; evite reflexão em tempo de execução sempre que possível

## Exemplos

As seções abaixo mostram exemplos concretos de Spring Boot, Quarkus e Java
compartilhado para nomenclatura, imutabilidade, injeção de dependências, código
reativo, exceções, estrutura de projeto, logging, configuração e testes.

## Nomenclatura

```java
// PASS: Classes/Records: PascalCase
public class MarketService {}
public record Money(BigDecimal amount, Currency currency) {}

// PASS: Métodos/campos: camelCase
private final MarketRepository marketRepository;
public Market findBySlug(String slug) {}

// PASS: Constantes: UPPER_SNAKE_CASE
private static final int MAX_PAGE_SIZE = 100;

// PASS: [QUARKUS] Recursos JAX-RS nomeados como *Resource, não *Controller
public class MarketResource {}

// PASS: [SPRING] Controllers REST nomeados como *Controller
public class MarketController {}
```

## Imutabilidade

```java
// PASS: Favoreça records e campos final
public record MarketDto(Long id, String name, MarketStatus status) {}

public class Market {
  private final Long id;
  private final String name;
  // somente getters, sem setters
}

// PASS: [QUARKUS] Entidades active-record do Panache usam campos public (convenção do Quarkus)
@Entity
public class Market extends PanacheEntity {
  public String name;
  public MarketStatus status;
  // O Panache gera os acessadores em tempo de build; campos public são idiomáticos aqui
}

// PASS: [QUARKUS] Entidades MongoDB do Panache
@MongoEntity(collection = "markets")
public class Market extends PanacheMongoEntity {
  public String name;
  public MarketStatus status;
}
```

## Uso de Optional

```java
// PASS: Retorne Optional de métodos find*
// [SPRING]
Optional<Market> market = marketRepository.findBySlug(slug);

// [QUARKUS] Panache
Optional<Market> market = Market.find("slug", slug).firstResultOptional();

// PASS: Use map/flatMap em vez de get()
return market
    .map(MarketResponse::from)
    .orElseThrow(() -> new EntityNotFoundException("Market not found"));
```

## Boas práticas com streams

```java
// PASS: Use streams para transformações, mantenha pipelines curtos
List<String> names = markets.stream()
    .map(Market::name)
    .filter(Objects::nonNull)
    .toList();

// FAIL: Evite streams aninhados complexos; prefira loops por clareza
```

## Injeção de dependências

```java
// PASS: [SPRING] Injeção por construtor (preferível a @Autowired em campos)
@Service
public class MarketService {
  private final MarketRepository marketRepository;

  public MarketService(MarketRepository marketRepository) {
    this.marketRepository = marketRepository;
  }
}

// PASS: [QUARKUS] Injeção por construtor
@ApplicationScoped
public class MarketService {
  private final MarketRepository marketRepository;

  @Inject
  public MarketService(MarketRepository marketRepository) {
    this.marketRepository = marketRepository;
  }
}

// PASS: [QUARKUS] Injeção em campo package-private (aceitável no Quarkus — evita problemas de proxy)
@ApplicationScoped
public class MarketService {
  @Inject
  MarketRepository marketRepository;
}

// FAIL: [SPRING] Injeção em campo com @Autowired
@Autowired
private MarketRepository marketRepository; // use injeção por construtor

// FAIL: [QUARKUS] @Singleton quando interceptação ou inicialização lazy são necessárias
@Singleton // não proxiável — use @ApplicationScoped em vez disso
public class MarketService {}
```

## Padrões reativos [QUARKUS]

```java
// PASS: Retorne Uni/Multi de endpoints reativos
@GET
@Path("/{slug}")
public Uni<Market> findBySlug(@PathParam("slug") String slug) {
  return Market.find("slug", slug)
      .<Market>firstResult()
      .onItem().ifNull().failWith(() -> new MarketNotFoundException(slug));
}

// PASS: Composição de pipeline não bloqueante
public Uni<OrderConfirmation> placeOrder(OrderRequest req) {
  return validateOrder(req)
      .chain(valid -> persistOrder(valid))
      .chain(order -> notifyFulfillment(order));
}

// FAIL: Chamada bloqueante dentro de um pipeline Uni/Multi
public Uni<Market> find(String slug) {
  Market m = Market.find("slug", slug).firstResult(); // BLOQUEANTE — quebra o event loop
  return Uni.createFrom().item(m);
}

// FAIL: Inscrever-se mais de uma vez em um Uni compartilhado
Uni<Market> shared = fetchMarket(slug);
shared.subscribe().with(m -> log(m));
shared.subscribe().with(m -> cache(m)); // inscrição dupla — use Uni.memoize()
```

## Exceções

- Use exceções unchecked para erros de domínio; envolva exceções técnicas com contexto
- Crie exceções específicas de domínio (ex.: `MarketNotFoundException`)
- Evite `catch (Exception ex)` abrangente, a menos que esteja relançando/logando centralmente

```java
throw new MarketNotFoundException(slug);
```

### Tratamento centralizado de exceções

```java
// [SPRING]
@RestControllerAdvice
public class GlobalExceptionHandler {
  @ExceptionHandler(MarketNotFoundException.class)
  public ResponseEntity<ErrorResponse> handle(MarketNotFoundException ex) {
    return ResponseEntity.status(404).body(ErrorResponse.from(ex));
  }
}

// [QUARKUS] Opção A: ExceptionMapper
@Provider
public class MarketNotFoundMapper implements ExceptionMapper<MarketNotFoundException> {
  @Override
  public Response toResponse(MarketNotFoundException ex) {
    return Response.status(404).entity(ErrorResponse.from(ex)).build();
  }
}

// [QUARKUS] Opção B: @ServerExceptionMapper (RESTEasy Reactive)
@ServerExceptionMapper
public RestResponse<ErrorResponse> handle(MarketNotFoundException ex) {
  return RestResponse.status(Status.NOT_FOUND, ErrorResponse.from(ex));
}
```

## Generics e segurança de tipos

- Evite tipos crus (raw types); declare parâmetros genéricos
- Prefira generics com limites (bounded) para utilitários reutilizáveis

```java
public <T extends Identifiable> Map<Long, T> indexById(Collection<T> items) { ... }
```

## Estrutura do projeto

### [SPRING] Maven/Gradle

```
src/main/java/com/example/app/
  config/
  controller/
  service/
  repository/
  domain/
  dto/
  util/
src/main/resources/
  application.yml
src/test/java/... (espelha main)
```

### [QUARKUS] Maven/Gradle

```
src/main/java/com/example/app/
  config/              # beans @ConfigMapping, @ConfigProperty, Producers
  resource/            # recursos JAX-RS (não "controller")
  service/
  repository/          # implementações de PanacheRepository (se não usar active record)
  domain/              # entidades JPA/Panache, entidades MongoDB
  dto/
  util/
  mapper/              # mappers MapStruct (se usados)
src/main/resources/
  application.properties   # convenção do Quarkus (YAML suportado com quarkus-config-yaml)
  import.sql               # auto-import do Hibernate para dev/test
src/test/java/... (espelha main)
```

## Formatação e estilo

- Use 2 ou 4 espaços de forma consistente (padrão do projeto)
- Um tipo público de nível superior por arquivo
- Mantenha métodos curtos e focados; extraia helpers
- Ordene os membros: constantes, campos, construtores, métodos públicos, protegidos, privados

## Code smells a evitar

- Listas longas de parâmetros → use DTO/builders
- Aninhamento profundo → early returns
- Números mágicos → constantes nomeadas
- Estado estático mutável → prefira injeção de dependências
- Blocos catch silenciosos → logue e aja ou relance
- **[QUARKUS]**: `@Singleton` onde `@ApplicationScoped` é o pretendido — quebra proxying e interceptação
- **[QUARKUS]**: Misturar `quarkus-resteasy-reactive` e `quarkus-resteasy` (clássico) — escolha uma stack
- **[QUARKUS]**: Active-record do Panache + padrão repository no mesmo bounded context — escolha um

## Logging

```java
// [SPRING] SLF4J
private static final Logger log = LoggerFactory.getLogger(MarketService.class);
log.info("fetch_market slug={}", slug);
log.error("failed_fetch_market slug={}", slug, ex);

// [QUARKUS] JBoss Logging (padrão, custo zero em tempo de build)
private static final Logger log = Logger.getLogger(MarketService.class);
log.infof("fetch_market slug=%s", slug);
log.errorf(ex, "failed_fetch_market slug=%s", slug);

// [QUARKUS] Alternativa: logging simplificado com @Inject
@Inject
Logger log; // injetado via CDI, com escopo da classe declarante
```

## Tratamento de null

- Aceite `@Nullable` apenas quando inevitável; caso contrário use `@NonNull`
- Use Bean Validation (`@NotNull`, `@NotBlank`) nas entradas
- **[QUARKUS]**: Aplique `@Valid` em parâmetros `@BeanParam`, `@RestForm` e no corpo da requisição

## Configuração

```java
// [SPRING] @ConfigurationProperties
@ConfigurationProperties(prefix = "market")
public record MarketProperties(int maxPageSize, Duration cacheTtl) {}

// [QUARKUS] @ConfigMapping (type-safe, validado em tempo de build)
@ConfigMapping(prefix = "market")
public interface MarketConfig {
  int maxPageSize();
  Duration cacheTtl();
}

// [QUARKUS] Valores simples com @ConfigProperty
@ConfigProperty(name = "market.max-page-size", defaultValue = "100")
int maxPageSize;
```

## Expectativas de teste

### Compartilhado
- JUnit 5 + AssertJ para asserções fluentes
- Mockito para mocking; evite mocks parciais sempre que possível
- Favoreça testes determinísticos; sem sleeps ocultos

### [SPRING]
- `@WebMvcTest` para slices de controller, `@DataJpaTest` para slices de repository
- `@SpringBootTest` reservado para testes de integração completos
- `@MockBean` para substituir beans no contexto Spring

### [QUARKUS]
- JUnit 5 + Mockito puros para testes unitários (sem `@QuarkusTest`)
- `@QuarkusTest` reservado para testes de integração de CDI
- `@InjectMock` para substituir beans CDI em testes de integração
- Dev Services para banco de dados/Kafka/Redis — evite configuração manual de Testcontainers quando os Dev Services bastarem
- `@QuarkusTestResource` para o ciclo de vida de serviços externos customizados

```java
// [SPRING] Teste de controller
@WebMvcTest(MarketController.class)
class MarketControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean MarketService marketService;
}

// [QUARKUS] Teste de integração
@QuarkusTest
class MarketResourceTest {
  @InjectMock
  MarketService marketService;

  @Test
  void should_return_404_when_market_not_found() {
    given().when().get("/markets/unknown").then().statusCode(404);
  }
}

// [QUARKUS] Teste unitário (sem CDI, sem @QuarkusTest)
@ExtendWith(MockitoExtension.class)
class MarketServiceTest {
  @Mock MarketRepository marketRepository;
  @InjectMocks MarketService marketService;
}
```

**Lembre-se**: Mantenha o código intencional, tipado e observável. Otimize para manutenibilidade em vez de micro-otimizações, a menos que comprovadamente necessário.
