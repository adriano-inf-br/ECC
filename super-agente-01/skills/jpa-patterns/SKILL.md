---
name: jpa-patterns
description: Padrões JPA/Hibernate para design de entidades, relacionamentos, otimização de consultas, transações, auditoria, indexação, paginação e pooling no Spring Boot.
metadata:
  origin: ECC
---

# JPA/Hibernate Patterns

Use para modelagem de dados, repositories e ajuste de desempenho no Spring Boot.

## Quando ativar

- Projetar entidades JPA e mapeamentos de tabelas
- Definir relacionamentos (@OneToMany, @ManyToOne, @ManyToMany)
- Otimizar consultas (prevenção de N+1, estratégias de fetch, projeções)
- Configurar transações, auditoria ou soft deletes
- Configurar paginação, ordenação ou métodos de repository customizados
- Ajustar o pooling de conexões (HikariCP) ou o cache de segundo nível

## Design de entidades

```java
@Entity
@Table(name = "markets", indexes = {
  @Index(name = "idx_markets_slug", columnList = "slug", unique = true)
})
@EntityListeners(AuditingEntityListener.class)
public class MarketEntity {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(nullable = false, unique = true, length = 120)
  private String slug;

  @Enumerated(EnumType.STRING)
  private MarketStatus status = MarketStatus.ACTIVE;

  @CreatedDate private Instant createdAt;
  @LastModifiedDate private Instant updatedAt;
}
```

Habilite a auditoria:
```java
@Configuration
@EnableJpaAuditing
class JpaConfig {}
```

## Relacionamentos e prevenção de N+1

```java
@OneToMany(mappedBy = "market", cascade = CascadeType.ALL, orphanRemoval = true)
private List<PositionEntity> positions = new ArrayList<>();
```

- Use lazy loading por padrão; use `JOIN FETCH` nas consultas quando necessário
- Evite `EAGER` em coleções; use projeções DTO para caminhos de leitura

```java
@Query("select m from MarketEntity m left join fetch m.positions where m.id = :id")
Optional<MarketEntity> findWithPositions(@Param("id") Long id);
```

## Padrões de repository

```java
public interface MarketRepository extends JpaRepository<MarketEntity, Long> {
  Optional<MarketEntity> findBySlug(String slug);

  @Query("select m from MarketEntity m where m.status = :status")
  Page<MarketEntity> findByStatus(@Param("status") MarketStatus status, Pageable pageable);
}
```

- Use projeções para consultas leves:
```java
public interface MarketSummary {
  Long getId();
  String getName();
  MarketStatus getStatus();
}
Page<MarketSummary> findAllBy(Pageable pageable);
```

## Transações

- Anote os métodos de serviço com `@Transactional`
- Use `@Transactional(readOnly = true)` para caminhos de leitura para otimizar
- Escolha a propagação com cuidado; evite transações de longa duração

```java
@Transactional
public Market updateStatus(Long id, MarketStatus status) {
  MarketEntity entity = repo.findById(id)
      .orElseThrow(() -> new EntityNotFoundException("Market"));
  entity.setStatus(status);
  return Market.from(entity);
}
```

## Paginação

```java
PageRequest page = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
Page<MarketEntity> markets = repo.findByStatus(MarketStatus.ACTIVE, page);
```

Para paginação no estilo cursor, inclua `id > :lastId` no JPQL com ordenação.

## Indexação e desempenho

- Adicione índices para filtros comuns (`status`, `slug`, chaves estrangeiras)
- Use índices compostos que correspondam aos padrões de consulta (`status, created_at`)
- Evite `select *`; projete apenas as colunas necessárias
- Faça escritas em lote com `saveAll` e `hibernate.jdbc.batch_size`

## Pooling de conexões (HikariCP)

Propriedades recomendadas:
```
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.validation-timeout=5000
```

Para o tratamento de LOB no PostgreSQL, adicione:
```
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true
```

## Caching

- O cache de 1º nível é por EntityManager; evite manter entidades entre transações
- Para entidades com leitura intensa, considere o cache de segundo nível com cautela; valide a estratégia de eviction

## Migrações

- Use Flyway ou Liquibase; nunca dependa do auto DDL do Hibernate em produção
- Mantenha as migrações idempotentes e aditivas; evite remover colunas sem um plano

## Testando o acesso a dados

- Prefira `@DataJpaTest` com Testcontainers para espelhar a produção
- Verifique a eficiência do SQL usando os logs: defina `logging.level.org.hibernate.SQL=DEBUG` e `logging.level.org.hibernate.orm.jdbc.bind=TRACE` para os valores dos parâmetros

**Lembre-se**: Mantenha entidades enxutas, consultas intencionais e transações curtas. Previna N+1 com estratégias de fetch e projeções, e indexe para seus caminhos de leitura/escrita.
