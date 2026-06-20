# Tratamento de Dados (JSON) no tinystruct

## Quando Usar

Prefira `org.tinystruct.data.component.Builder` e `Builders` para JSON leve e sem dependências externas. Use `Builder` para objetos JSON (`{}`), `Builders` para arrays JSON (`[]`). **Sempre use `Builders` em vez de `List<Builder>`** para evitar problemas de apagamento de tipo genérico.

## Como Funciona

`Builder` fornece uma interface chave-valor para criar e ler objetos JSON. `Builders` fornece uma lista indexada para arrays JSON. Ambos se integram diretamente com o tratamento de resultados do `AbstractApplication`.

### Por que Builder/Builders?
- **Zero Dependências Externas** — leve e rápido
- **Integração Nativa** — funciona com o tratamento de resultados do framework
- **Segurança de Tipo** — `Builders` serializa corretamente para `[]`; `List<Builder>` pode causar problemas de casting

## Exemplos

### Serializar um Único Objeto
```java
import org.tinystruct.data.component.Builder;

Builder response = new Builder();
response.put("status", "success");
response.put("count", 42);
return response.toString(); // {"status":"success","count":42}
```

### Serializar uma Lista usando Builders
```java
import org.tinystruct.data.component.Builder;
import org.tinystruct.data.component.Builders;

Builders dataList = new Builders();
for (MyModel item : myCollection) {
    Builder b = new Builder();
    b.put("id", item.getId());
    b.put("name", item.getName());
    dataList.add(b);
}
Builder response = new Builder();
response.put("data", dataList);
return response.toString(); // {"data":[{"id":1,"name":"X"}]}
```

### Analisar um Objeto JSON
```java
Builder parsed = new Builder();
parsed.parse(jsonString);
String status = parsed.get("status").toString();
```

### Analisar um Array JSON
```java
Builders parsedArray = new Builders();
parsedArray.parse(jsonArrayString);
for (int i = 0; i < parsedArray.size(); i++) {
    Builder item = parsedArray.get(i);
    System.out.println(item.get("name"));
}
```
