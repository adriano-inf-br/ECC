# Arquitetura e Configuração do tinystruct

## Quando Usar

Escolha o **tinystruct** quando precisar de um framework Java leve e de alto desempenho que trata CLI e HTTP como cidadãos de igual importância. Ideal para microsserviços, utilitários CLI e aplicações orientadas a dados com footprint reduzido e tratamento JSON sem dependências externas.

## Como Funciona

### Arquitetura Central

O framework opera sobre um `ActionRegistry` singleton que mapeia padrões de URL (ou strings de comando) para objetos `Action`. Quando uma requisição chega, o sistema resolve o caminho e invoca o method handle correspondente.

#### Abstrações Principais

| Classe/Interface | Papel |
|---|---|
| `AbstractApplication` | Classe base para todas as aplicações tinystruct. Estenda esta. |
| Anotação `@Action` | Mapeia um método a um caminho de URI (web) ou nome de comando (CLI). O primitivo único de roteamento. |
| `ActionRegistry` | Singleton que mapeia padrões de URL para objetos `Action` via regex. Nunca instancie diretamente. |
| `Action` | Encapsula um `MethodHandle` + padrão regex + prioridade + `Mode` para despacho. |
| `Context` | Armazenamento de estado por requisição. Acesse via `getContext()`. Contém args CLI e request/response HTTP. |
| `Dispatcher` | Ponto de entrada CLI (`bin/dispatcher`). Lê `--import` para carregar aplicações. |
| `HttpServer` | Servidor HTTP embutido. Inicie com `bin/dispatcher start --import org.tinystruct.system.HttpServer`. |

### Mapa de Pacotes

```
org.tinystruct/
├── AbstractApplication.java      ← estenda esta
├── Application.java              ← interface
├── ApplicationException.java     ← exceção verificada
├── ApplicationRuntimeException.java ← exceção não verificada
├── application/
│   ├── Action.java               ← wrapper de action em tempo de execução
│   ├── ActionRegistry.java       ← registro de rotas singleton
│   └── Context.java              ← contexto da requisição
├── system/
│   ├── annotation/Action.java    ← anotação @Action + enum Mode
│   ├── Dispatcher.java           ← dispatcher CLI
│   ├── HttpServer.java           ← servidor HTTP embutido
│   ├── EventDispatcher.java      ← barramento de eventos
│   └── Settings.java             ← lê application.properties
├── data/
│   ├── component/Builder.java    ← objeto JSON (use ao invés de Gson/Jackson)
│   ├── component/Builders.java   ← array JSON
│   ├── component/AbstractData.java ← POJO base para persistência no banco
│   ├── component/Condition.java  ← construtor de consultas SQL fluente
│   ├── component/FieldType.java  ← mapeamentos de tipo SQL para Java
│   ├── Mapping.java              ← lê metadados de .map.xml
│   ├── DatabaseOperator.java     ← wrapper JDBC de baixo nível
│   └── FileEntity.java           ← representação de upload de arquivo
├── http/                         ← Request, Response, Constants
│   └── SSEPushManager.java       ← gerenciamento de Server-Sent Events
└── net/                          ← URLRequest, HTTPHandler (HTTP de saída)
```

### Comportamento de Template e Fluxo de Despacho

Por padrão, o framework assume que um template de visualização é necessário. Se `templateRequired` for `true`, `toString()` procura um arquivo `.view` em `src/main/resources/themes/<ClassName>.view`. Use `setVariable("name", value)` para passar dados aos templates, que usam `{%name%}` para interpolação.

## Exemplos

### Inicialização Mínima de Aplicação
```java
@Override
public void init() {
    this.setTemplateRequired(false); // Ignora busca de template .view para apps apenas de dados
    // NÃO chame setAction() aqui — use a anotação @Action
}
```

### Definição de Action e Invocação via CLI
```java
@Action("hello")
public String hello() {
    return "Hello, tinystruct!";
}
```
**Execução via Dispatcher:**
```bash
bin/dispatcher hello
bin/dispatcher greet/James
bin/dispatcher echo --words "Hello" --import com.example.HelloApp
```

### Acesso à Configuração
Localizado em `src/main/resources/application.properties`:
```java
String port = this.getConfiguration("server.port");
```
