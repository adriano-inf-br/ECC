# Persistência de Banco de Dados no tinystruct

## Quando Usar

Use a camada de dados semelhante a ORM embutida para operações de banco de dados. Ela oferece uma alternativa leve ao JPA/Hibernate usando POJOs que estendem `AbstractData` e arquivos de mapeamento XML.

## Como Funciona

### Arquitetura

Cada tabela é representada por:
1. **Java POJO**: Estende `AbstractData`, fornece getters/setters e `setData(Row)`.
2. **XML de Mapeamento**: `ClassName.map.xml` em recursos, vinculando campos Java a colunas do banco.

#### Classe Base Principal: `AbstractData`
Fornece métodos CRUD:
- `append()` / `appendAndGetId()`
- `update()`
- `delete()`
- `findAll()` / `findOneById()` / `findOneByKey(key, value)`
- `findWith(where, params)`
- `find(SQL, params)`

### Geração de POJO (CLI)

Introspecte uma tabela de banco de dados ativa para produzir o POJO e o arquivo de mapeamento.

#### Configuração
`application.properties`:
```properties
driver=com.mysql.cj.jdbc.Driver
database.url=jdbc:mysql://localhost:3306/mydb
database.user=root
database.password=secret
```

#### Comando
```bash
# Modo interativo
bin/dispatcher generate

# Especificar tabela
bin/dispatcher generate --tables users
```

## Exemplos

### Operações CRUD
```java
// CREATE
User user = new User();
user.setUsername("james");
user.append();

// READ
User user = new User();
user.setId(42);
user.findOneById();

// UPDATE
user.setEmail("new@example.com");
user.update();

// DELETE
user.delete();
```

### Consultas com Condições
```java
User user = new User();
Table results = user.findWith("username LIKE ?", new Object[]{"%jam%"});

// Construtor de Condição Fluente
Condition condition = new Condition();
condition.setRequestFields("id,username");
Table filtered = user.find(
    condition.select("`users`").and("email LIKE ?").orderBy("id DESC"),
    new Object[]{"%@example.com"}
);
```

### Estrutura do XML de Mapeamento
`User.map.xml`:
```xml
<mapping>
  <class name="User" table="users">
    <id name="Id" column="id" increment="true" generate="false" length="11" type="int"/>
    <property name="username" column="username" length="50" type="varchar"/>
    <property name="email" column="email" length="100" type="varchar"/>
  </class>
</mapping>
```

## Regras Importantes

1. **Posicionamento do Arquivo**: O XML de mapeamento **deve** espelhar o caminho de pacote do POJO em `src/main/resources/`.
2. **Nomenclatura**: Nomes de tabelas são singularizados para nomes de classes (`users` → `User`). Colunas com sublinhado se tornam campos camelCase (`created_at` → `createdAt`).
3. **Setters**: Use métodos `setFieldAsXxx` (ex.: `setFieldAsString`) nos setters para sincronizar o estado com o mapa interno de campos.
4. **Campo Id**: O campo de chave primária em Java é sempre chamado `Id` (herdado de `AbstractData`).
