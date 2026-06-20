---
name: tinystruct-patterns
description: Orientação especializada para desenvolver com o framework Java tinystruct. Use ao trabalhar na base de código tinystruct ou em qualquer projeto construído sobre tinystruct — incluindo criação de classes Application, rotas mapeadas com @Action, testes unitários, ActionRegistry, tratamento dual HTTP/CLI, servidor HTTP embutido, sistema de eventos, JSON com Builder/Builders, persistência de banco de dados com AbstractData, geração de POJO, Server-Sent Events (SSE), uploads de arquivo e networking HTTP de saída.
metadata:
  origin: ECC
---

# Padrões de Desenvolvimento tinystruct

Padrões de arquitetura e implementação para construir módulos com o framework Java **tinystruct** — um framework leve e de alto desempenho que trata CLI e HTTP como cidadãos iguais, sem exigir método `main()` e com configuração mínima.

## Princípio Central

**CLI e HTTP são cidadãos iguais.** Todo método anotado com `@Action` deve idealmente ser executável tanto de um terminal quanto de um navegador web sem modificação. Essa capacidade de "modo dual" é a filosofia de design central do tinystruct.

## Quando Ativar

### Quando Usar

- Criando novos módulos `Application` estendendo `AbstractApplication`.
- Definindo rotas e ações de linha de comando usando `@Action`.
- Tratando estado por requisição via `Context`.
- Realizando serialização JSON usando os componentes nativos `Builder` e `Builders`.
- Trabalhando com persistência de banco de dados via POJOs `AbstractData`.
- Gerando POJOs de tabelas de banco de dados usando o comando `generate`.
- Implementando Server-Sent Events (SSE) para push em tempo real.
- Tratando uploads de arquivo via dados multipart.
- Fazendo requisições HTTP de saída com `URLRequest` e `HTTPHandler`.
- Configurando conexões de banco de dados ou configurações do sistema em `application.properties`.
- Depurando conflitos de roteamento (Actions) ou análise de argumentos CLI.

## Como Funciona

O framework tinystruct trata qualquer método anotado com `@Action` como um endpoint roteável para ambientes terminal e web. Aplicações são criadas estendendo `AbstractApplication`, que fornece hooks de ciclo de vida principais como `init()` e acesso ao `Context` da requisição.

O roteamento é tratado pelo `ActionRegistry`, que mapeia automaticamente segmentos de caminho para argumentos de método e injeta dependências. Para serviços somente de dados, os componentes nativos `Builder` e `Builders` devem ser usados para serialização JSON para manter uma pegada zero de dependências. A camada de banco de dados usa POJOs `AbstractData` pareados com arquivos de mapeamento XML para operações CRUD sem bibliotecas ORM externas.

## Exemplos

### Aplicação Básica (MyService)
```java
public class MyService extends AbstractApplication {
    @Override
    public void init() {
        this.setTemplateRequired(false); // Desativa busca de .view para apps de dados/API
    }

    @Override public String version() { return "1.0.0"; }

    @Action("greet")
    public String greet() {
        return "Hello from tinystruct!";
    }

    // Parâmetro de caminho: GET /?q=greet/James  OU  bin/dispatcher greet/James
    @Action("greet")
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}
```

### Desambiguação de Modo HTTP (login)
```java
@Action(value = "login", mode = Mode.HTTP_POST)
public String doLogin(Request<?, ?> request) throws ApplicationException {
    request.getSession().setAttribute("userId", "42");
    return "Logged in";
}
```

### Tratamento Nativo de Dados JSON (Builder + Builders)
```java
import org.tinystruct.data.component.Builder;
import org.tinystruct.data.component.Builders;

@Action("api/data")
public String getData() throws ApplicationException {
    Builders dataList = new Builders();
    Builder item = new Builder();
    item.put("id", 1);
    item.put("name", "James");
    dataList.add(item);

    Builder response = new Builder();
    response.put("status", "success");
    response.put("data", dataList);
    return response.toString(); // {"status":"success","data":[{"id":1,"name":"James"}]}
}
```

### SSE (Server-Sent Events)
```java
import org.tinystruct.http.SSEPushManager;

@Action("sse/connect")
public String connect() {
    return "{\"type\":\"connect\",\"message\":\"Connected to SSE\"}";
}

// Enviar para um cliente específico
String sessionId = getContext().getId();
Builder msg = new Builder();
msg.put("text", "Hello, user!");
SSEPushManager.getInstance().push(sessionId, msg);

// Broadcast para todos
// Broadcast para todos
SSEPushManager.getInstance().broadcast(msg);
```

### Upload de Arquivo
```java
import org.tinystruct.data.FileEntity;

@Action(value = "upload", mode = Mode.HTTP_POST)
public String upload(Request<?, ?> request) throws ApplicationException {
    List<FileEntity> files = request.getAttachments();
    if (files != null) {
        for (FileEntity file : files) {
            System.out.println("Uploaded: " + file.getFilename());
        }
    }
    return "Upload OK";
}
```

## Integração do Servidor MCP e Ferramentas

O tinystruct fornece suporte nativo ao Model Context Protocol (MCP) a partir da versão do SDK **`1.7.26`**.
As APIs de MCP (ex.: `org.tinystruct.mcp.MCPTool`, `org.tinystruct.mcp.MCPServer`, `org.tinystruct.mcp.MCPException`) estão incluídas diretamente na dependência central:
```xml
<dependency>
    <groupId>org.tinystruct</groupId>
    <artifactId>tinystruct</artifactId>
    <version>1.7.26</version>
</dependency>
```

> **AVISO DE SEGURANÇA (Injeção de Prompt):**
> Os valores de retorno de ferramentas são alimentados diretamente de volta na janela de contexto do modelo de IA. Você **DEVE** validar e sanitizar todos os argumentos fornecidos pelo chamador antes de incluí-los na string de retorno da ferramenta. Falhar em sanitizar entradas pode permitir que um atacante injete instruções adversariais (Injeção de Prompt) que substituem o comportamento do modelo. Sempre valide comprimento, conjuntos de caracteres e nulidade.

**Para criar uma Ferramenta MCP:**
1. Estenda `org.tinystruct.mcp.MCPTool`.
2. Anote operações com `@Action` e declare parâmetros usando `@Argument` dentro do array `arguments`.
3. Aceite parâmetros como argumentos de método explícitos correspondendo às chaves em `@Argument`. (**Não** use `getContext().getAttribute(...)` para argumentos de ferramenta).

```java
import org.tinystruct.mcp.MCPTool;
import org.tinystruct.mcp.MCPException;
import org.tinystruct.system.annotation.Action;
import org.tinystruct.system.annotation.Argument;

public class MyCustomTool extends MCPTool {
    public MyCustomTool() {
        super("custom", "A custom tool for demonstrating MCP");
    }

    @Action(
        value = "custom/hello",
        description = "Say hello to someone",
        arguments = {
            @Argument(key = "name", description = "The name to greet", type = "string", optional = false)
        }
    )
    public String hello(String name) throws MCPException {
        // SEGURANÇA: Valide/sanitize entradas de ferramentas antes de retornar ao modelo
        // para prevenir vulnerabilidades de injeção de Prompt.
        if (name == null || name.length() > 50 || !name.matches("^[a-zA-Z0-9 ]+$")) {
            throw new MCPException("Invalid name provided");
        }
        return "Hello, " + name + "!";
    }
}
```

**Para implantar um Servidor MCP:**
1. Estenda `org.tinystruct.mcp.MCPServer`.
2. Sobrescreva `init()` e registre suas ferramentas usando `this.registerTool()`. O framework escaneia e mapeia automaticamente os métodos `@Action`.

```java
import org.tinystruct.mcp.MCPServer;

public class MyMCPServer extends MCPServer {
    @Override
    public void init() {
        super.init();
        this.registerTool(new MyCustomTool());
    }

    @Override
    public String version() {
        return "1.0.0";
    }
}
```

Execute o servidor via dispatcher:
```bash
bin/dispatcher start --import org.tinystruct.system.HttpServer --import com.example.MyMCPServer
```

## Configuração

As configurações são gerenciadas em `src/main/resources/application.properties`.

```properties
# Banco de dados
driver=org.h2.Driver
database.url=jdbc:h2:~/mydb
database.user=sa
database.password=

# Servidor
default.home.page=hello
server.port=8080

# Localidade
default.language=en_US

# Sessão (Redis para ambientes clusterizados)
# default.session.repository=org.tinystruct.http.RedisSessionRepository
# redis.host=127.0.0.1
# redis.port=6379
```

Acesse valores de configuração na sua aplicação:
```java
String port = this.getConfiguration("server.port");
```

## Alertas e Anti-padrões

| Sintoma | Padrão Correto |
|---|---|
| Importando `com.google.gson` ou `com.fasterxml.jackson` | Use `org.tinystruct.data.component.Builder` / `Builders`. |
| Usando `List<Builder>` para arrays JSON | Use `Builders` para evitar problemas de apagamento de tipo genérico. |
| `ApplicationRuntimeException: template not found` | Chame `setTemplateRequired(false)` em `init()` para apps somente de API. |
| Anotando métodos `private` com `@Action` | Actions devem ser `public` para serem registradas pelo framework. |
| Codificando `main(String[] args)` nos apps | Use `bin/dispatcher` como ponto de entrada para todos os módulos. |
| Registro manual no `ActionRegistry` | Prefira a anotação `@Action` para descoberta automática. |
| Action não encontrada em tempo de execução | Garanta que a classe seja importada via `--import` ou listada em `application.properties`. |
| Arg CLI não visível | Passe com `--key value`; acesse via `getContext().getAttribute("--key")`. |
| Dois métodos com mesmo caminho, errado dispara | Defina `mode` explícito (ex.: `HTTP_GET` vs `HTTP_POST`) para desambiguar. |

## Boas Práticas

1. **Aplicações Granulares**: Quebre a lógica em aplicações menores e focadas em vez de uma classe monolítica.
2. **Configuração em `init()`**: Use `init()` para configuração (config, BD) em vez do construtor. NÃO chame `setAction()` — use a anotação `@Action`.
3. **Consciência de Modo**: Use o parâmetro `Mode` em `@Action` para restringir operações sensíveis a apenas `CLI` ou métodos HTTP específicos.
4. **Context em vez de Parâmetros**: Para flags CLI opcionais, use `getContext().getAttribute("--flag")` em vez de adicionar parâmetros à assinatura do método.
5. **Eventos Assíncronos**: Para tarefas pesadas acionadas por eventos, use `CompletableFuture.runAsync()` dentro do handler de evento.

## Referência Técnica

Guias detalhados estão disponíveis no diretório `references/`:

- [Arquitetura & Config](references/architecture.md) — Abstrações, Mapa de Pacotes, Propriedades
- [Roteamento & @Action](references/routing.md) — Detalhes de anotação, Modes, Parâmetros
- [Tratamento de Dados](references/data-handling.md) — Builder, Builders, serialização e análise JSON
- [Persistência de Banco de Dados](references/database.md) — POJOs AbstractData, CRUD, XML de mapeamento, geração de POJO
- [Sistema & Uso](references/system-usage.md) — Context, Sessões, SSE, Uploads de Arquivo, Eventos, Networking
- [Padrões de Testes](references/testing.md) — Testes unitários JUnit 5 e de integração HTTP

## Arquivos de Fonte de Referência (Internos)

- `src/main/java/org/tinystruct/AbstractApplication.java` — Classe base principal com hooks de ciclo de vida
- `src/main/java/org/tinystruct/system/annotation/Action.java` — Anotação & Modes
- `src/main/java/org/tinystruct/application/ActionRegistry.java` — Motor de Roteamento
- `src/main/java/org/tinystruct/data/component/Builder.java` — Serializador de objeto JSON
- `src/main/java/org/tinystruct/data/component/Builders.java` — Serializador de array JSON
- `src/main/java/org/tinystruct/data/component/AbstractData.java` — Classe POJO base com CRUD
- `src/main/java/org/tinystruct/data/Mapping.java` — Parser XML de mapeamento
- `src/main/java/org/tinystruct/data/tools/MySQLGenerator.java` — Referência de gerador de POJO
- `src/main/java/org/tinystruct/data/component/FieldType.java` — Mapeamentos de tipo SQL-para-Java
- `src/main/java/org/tinystruct/data/component/Condition.java` — Construtor fluente de query SQL
- `src/main/java/org/tinystruct/http/SSEPushManager.java` — Gerenciamento de conexão SSE
- `src/test/java/org/tinystruct/application/ActionRegistryTest.java` — Exemplos de teste do registry
- `src/test/java/org/tinystruct/system/HttpServerHttpModeTest.java` — Padrões de teste de integração HTTP
