# Padrões de Testes no tinystruct

## Quando Usar

Use estes padrões ao escrever testes unitários para suas aplicações com **JUnit 5**. Essencial para verificar a lógica de actions, registro de rotas e comportamento no modo HTTP.

## Como Funciona

### Testes Unitários de Aplicações
O `ActionRegistry` é um singleton. Para testar uma aplicação:
1. Instancie a aplicação.
2. Forneça um objeto `Settings` (aciona `init()` e o processamento de anotações).
3. Use `app.invoke(path, args)` para testar a lógica diretamente.

### Testes de Integração HTTP
Para testes que envolvem o servidor HTTP embutido:
1. Inicie o `HttpServer` em uma thread em segundo plano.
2. Use `ApplicationManager.call("start", context, Action.Mode.CLI)` para inicializar.
3. Aguarde a porta ficar disponível usando um `Socket`.
4. Use `URLRequest` e `HTTPHandler` para realizar requisições reais.

## Exemplos

### Teste Unitário
```java
import org.junit.jupiter.api.*;
import org.tinystruct.system.Settings;

class MyAppTest {
    private MyApp app;

    @BeforeEach
    void setUp() {
        app = new MyApp();
        app.setConfiguration(new Settings());
        app.init(); // aciona o processamento da anotação @Action e registra todas as actions
    }

    @Test
    void testHello() throws Exception {
        Object result = app.invoke("hello");
        Assertions.assertEquals("Hello!", result);
    }

    @Test
    void testGreet() throws Exception {
        Object result = app.invoke("greet", new Object[]{"James"});
        Assertions.assertEquals("Hello, James!", result);
    }
}
```

### Teste de Correspondência no ActionRegistry
```java
@Test
void testRouting() {
    ActionRegistry registry = ActionRegistry.getInstance();
    Action action = registry.getAction("greet/James");
    Assertions.assertNotNull(action);
}
```

### Padrão de Integração HTTP
Referência: `src/test/java/org/tinystruct/system/HttpServerHttpModeTest.java`

```java
// Padrão:
// 1. Inicia o servidor em uma thread
// 2. Verifica a disponibilidade da porta
// 3. Envia requisição HTTP via HTTPHandler
// 4. Verifica o corpo/status da resposta
```
