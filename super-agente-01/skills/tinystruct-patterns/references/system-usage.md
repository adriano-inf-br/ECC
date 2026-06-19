# Referência de Sistema e Uso do tinystruct

## Quando Usar

Use estes padrões para gerenciar estado de requisição, administrar sessões web, implementar Server-Sent Events (SSE), lidar com uploads de arquivos ou realizar requisições HTTP de saída.

## Como Funciona

### Context e Argumentos CLI
`Context` é o armazenamento principal de estado específico da requisição. Flags CLI passadas como `--key value` são armazenadas no `Context` como `"--key"`.

### Gerenciamento de Sessão
Arquitetura plugável. O padrão é `MemorySessionRepository`. Configure Redis em `application.properties`:
```properties
default.session.repository=org.tinystruct.http.RedisSessionRepository
redis.host=127.0.0.1
redis.port=6379
```

### Server-Sent Events (SSE)
Suporte embutido para push em tempo real. O `HttpServer` trata automaticamente o ciclo de vida do SSE ao detectar o cabeçalho `Accept: text/event-stream`. As conexões são rastreadas por ID de sessão no `SSEPushManager`.

### Requisições HTTP de Saída
Use `URLRequest` e `HTTPHandler` para fazer requisições HTTP a serviços externos.

## Exemplos

### Context e Argumentos CLI
```java
@Action("echo")
public String echo() {
    // CLI: bin/dispatcher echo --words "Hello World"
    Object words = getContext().getAttribute("--words");
    if (words != null) return words.toString();
    return "No words provided";
}
```

### Gerenciamento de Sessão
```java
@Action(value = "login", mode = Mode.HTTP_POST)
public String login(Request<?, ?> request) {
    request.getSession().setAttribute("userId", "42");
    return "Logged in";
}
```

### Server-Sent Events (SSE)
```java
@Action("sse/connect")
public String connect() {
    return "{\"type\":\"connect\",\"message\":\"Connected\"}";
}

// Em outro método ou handler de evento:
String sessionId = getContext().getId();
SSEPushManager.getInstance().push(sessionId, new Builder().put("msg", "hello"));
```

### Upload de Arquivos
```java
import org.tinystruct.data.FileEntity;

@Action(value = "upload", mode = Mode.HTTP_POST)
public String upload(Request<?, ?> request) throws ApplicationException {
    List<FileEntity> files = request.getAttachments();
    if (files != null) {
        for (FileEntity file : files) {
            // file.getFilename(), file.getContent()
        }
    }
    return "Uploaded";
}
```

### HTTP de Saída
```java
import org.tinystruct.net.URLRequest;
import org.tinystruct.net.handlers.HTTPHandler;

URLRequest request = new URLRequest(new URL("https://api.example.com"));
request.setMethod("POST").setBody("{\"data\":\"val\"}");

HTTPHandler handler = new HTTPHandler();
var response = handler.handleRequest(request);
if (response.getStatusCode() == 200) {
    String body = response.getBody();
}
```

### Sistema de Eventos
Registre handlers em `init()` para execução assíncrona de tarefas.
```java
EventDispatcher.getInstance().registerHandler(MyEvent.class, event -> {
    CompletableFuture.runAsync(() -> doHeavyWork(event.getPayload()));
});
```
