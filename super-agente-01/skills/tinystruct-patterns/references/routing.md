# Referência de Roteamento @Action no tinystruct

## Quando Usar

Use a anotação `@Action` em suas aplicações para definir rotas tanto para comandos CLI quanto para endpoints HTTP. É adequado sempre que você precisar mapear lógica a um caminho específico, lidar com requisições parametrizadas ou restringir a execução a métodos HTTP específicos, mantendo uma estrutura de comandos consistente entre ambientes.

## Como Funciona

O `ActionRegistry` analisa as anotações `@Action` para construir uma tabela de roteamento. Para métodos parametrizados, o framework mapeia automaticamente os tipos de parâmetros Java para os segmentos regex correspondentes.

### Regras de Geração de Regex
- `getUser(int id)` → padrão: `^/?user/(-?\d+)$`
- `search(String query)` → padrão: `^/?search/([^/]+)$`

Tipos de parâmetros suportados: `String`, `int/Integer`, `long/Long`, `float/Float`, `double/Double`, `boolean/Boolean`, `char/Character`, `short/Short`, `byte/Byte`, `Date` (interpretado como `yyyy-MM-dd HH:mm:ss`).

### Valores de Mode

| Mode | Quando é acionado |
|---|---|
| `DEFAULT` | Tanto CLI quanto HTTP (GET, POST, etc.) |
| `CLI` | Apenas o dispatcher CLI |
| `HTTP_GET` | Apenas HTTP GET |
| `HTTP_POST` | Apenas HTTP POST |
| `HTTP_PUT` | Apenas HTTP PUT |
| `HTTP_DELETE` | Apenas HTTP DELETE |
| `HTTP_PATCH` | Apenas HTTP PATCH |

> **Nota:** Você pode mapear nomes de métodos HTTP para `Mode` usando `Action.Mode.fromName(String methodName)`. Valores desconhecidos ou nulos retornam `Mode.DEFAULT`.

## Exemplos

### Declaração Básica de Action
```java
@Action(
    value = "path/subpath",          // obrigatório: segmento de URI ou comando CLI
    description = "O que faz",       // exibido na saída de --help
    mode = Mode.DEFAULT,             // padrão: Mode.DEFAULT
    example = "bin/dispatcher path/subpath/42"
)
public String myAction(int id) { ... }
```

### Caminhos Parametrizados
```java
@Action("user/{id}")
public String getUser(int id) { ... }
// → CLI: bin/dispatcher user/42
// → HTTP: /?q=user/42
```

### Injeção de Dependência
O `ActionRegistry` injeta automaticamente `Request` e/ou `Response` do `Context` se forem parâmetros:

```java
@Action(value = "upload", mode = Mode.HTTP_POST)
public String upload(Request<?, ?> req, Response<?, ?> res) throws ApplicationException {
    // Acesse request/response brutos se necessário
    return "ok";
}
```

### Prioridade de Correspondência de Caminhos
Se dois métodos compartilham o mesmo caminho, o framework usa a primeira correspondência no `ActionRegistry`. Use valores explícitos de `Mode` para desambiguar (por exemplo, separando um GET para um formulário e um POST para envio).
