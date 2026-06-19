---
name: mcp-server-patterns
description: Construa servidores MCP com o SDK Node/TypeScript — tools, resources, prompts, validação Zod, stdio vs Streamable HTTP. Use o Context7 ou a documentação oficial do MCP para a API mais recente.
metadata:
  origin: ECC
---

# Padrões de Servidor MCP

O Model Context Protocol (MCP) permite que assistentes de IA chamem tools, leiam resources e usem prompts do seu servidor. Use esta skill ao construir ou manter servidores MCP. A API do SDK evolui; consulte o Context7 (query-docs para "MCP") ou a documentação oficial do MCP para os nomes e assinaturas de métodos atuais.

Para a decisão mais ampla de roteamento sobre quando uma capacidade deve ser uma regra, uma skill, MCP ou um fluxo de trabalho simples de CLI/API, veja [docs/capability-surface-selection.md](../../docs/capability-surface-selection.md).

## Quando Usar

Use quando: implementar um novo servidor MCP, adicionar tools ou resources, escolher entre stdio e HTTP, atualizar o SDK ou depurar problemas de registro e transporte do MCP.

## Como Funciona

### Conceitos Fundamentais

- **Tools**: Ações que o modelo pode invocar (ex.: buscar, executar um comando). Registre com `registerTool()` ou `tool()` dependendo da versão do SDK.
- **Resources**: Dados somente leitura que o modelo pode obter (ex.: conteúdo de arquivos, respostas de API). Registre com `registerResource()` ou `resource()`. Os handlers normalmente recebem um argumento `uri`.
- **Prompts**: Templates de Prompt reutilizáveis e parametrizados que o cliente pode exibir (ex.: no Claude Desktop). Registre com `registerPrompt()` ou equivalente.
- **Transport**: stdio para clientes locais (ex.: Claude Desktop); Streamable HTTP é preferido para acesso remoto (Cursor, nuvem). O HTTP/SSE legado é para compatibilidade retroativa.

O SDK Node/TypeScript pode expor `tool()` / `resource()` ou `registerTool()` / `registerResource()`; o SDK oficial mudou ao longo do tempo. Sempre verifique na [documentação atual do MCP](https://modelcontextprotocol.io) ou no Context7.

### Conectando com stdio

Para clientes locais, crie um transporte stdio e passe-o ao método connect do seu servidor. A API exata varia conforme a versão do SDK (ex.: construtor vs factory). Veja a documentação oficial do MCP ou consulte o Context7 por "MCP stdio server" para o padrão atual.

Mantenha a lógica do servidor (tools + resources) independente do transporte para que você possa plugar stdio ou HTTP no entrypoint.

### Remoto (Streamable HTTP)

Para Cursor, nuvem ou outros clientes remotos, use **Streamable HTTP** (um único endpoint MCP HTTP conforme a spec atual). Suporte o HTTP/SSE legado apenas quando a compatibilidade retroativa for necessária.

## Exemplos

### Instalação e configuração do servidor

```bash
npm install @modelcontextprotocol/sdk zod
```

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({ name: "my-server", version: "1.0.0" });
```

Registre tools e resources usando a API que sua versão do SDK fornece: algumas versões usam `server.tool(name, description, schema, handler)` (args posicionais), outras usam `server.tool({ name, description, inputSchema }, handler)` ou `registerTool()`. O mesmo vale para resources — inclua um `uri` no handler quando a API o fornecer. Consulte a documentação oficial do MCP ou o Context7 para as assinaturas atuais do `@modelcontextprotocol/sdk` e evite erros de copiar e colar.

Use **Zod** (ou o formato de schema preferido do SDK) para validação de entrada.

## Boas Práticas

- **Schema primeiro**: Defina schemas de entrada para cada tool; documente os parâmetros e o formato de retorno.
- **Erros**: Retorne erros ou mensagens estruturados que o modelo possa interpretar; evite stack traces brutas.
- **Idempotência**: Prefira tools idempotentes sempre que possível para que retentativas sejam seguras.
- **Taxa e custo**: Para tools que chamam APIs externas, considere limites de taxa e custo; documente na descrição da tool.
- **Versionamento**: Fixe a versão do SDK no package.json; verifique as notas de versão ao atualizar.

## SDKs e Documentação Oficiais

- **JavaScript/TypeScript**: `@modelcontextprotocol/sdk` (npm). Use o Context7 com o nome de biblioteca "MCP" para os padrões atuais de registro e transporte.
- **Go**: SDK Go oficial no GitHub (`modelcontextprotocol/go-sdk`).
- **C#**: SDK C# oficial para .NET.
