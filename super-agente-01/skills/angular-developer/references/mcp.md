# Servidor MCP do Angular CLI

O Angular CLI inclui um servidor MCP (Model Context Protocol) que permite que assistentes de IA (como Cursor, Gemini CLI, JetBrains AI, etc.) interajam diretamente com o Angular CLI. Ele fornece ferramentas para geração de código, modernização de código, busca de exemplos e execução de builds/testes.

## Ferramentas Disponíveis (Padrão)

Quando o servidor MCP está habilitado, os agents de IA têm acesso às seguintes ferramentas:

| Nome                        | Descrição                                                                                               |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `ai_tutor`                  | Inicia um tutor de Angular interativo baseado em IA.                                                       |
| `find_examples`             | Encontra exemplos de código autoritativos e de boas práticas para funcionalidades modernas do Angular.    |
| `get_best_practices`        | Recupera o Guia de Boas Práticas do Angular (crucial para componentes standalone, formulários tipados, etc.). |
| `list_projects`             | Lista todas as aplicações e bibliotecas do workspace lendo `angular.json`.                                |
| `onpush_zoneless_migration` | Analisa o código e fornece um plano para migrá-lo para a detecção de mudanças `OnPush` (pré-requisito para zoneless). |
| `search_documentation`      | Busca na documentação oficial em `https://angular.dev`.                                                   |

## Ferramentas Experimentais

Algumas ferramentas devem ser habilitadas explicitamente usando a flag `--experimental-tool` (ou `-E`).

| Nome                       | Descrição                                                              |
| :------------------------- | :----------------------------------------------------------------------- |
| `build`                    | Realiza um build avulso usando `ng build`.                               |
| `devserver.start`          | Inicia um servidor de desenvolvimento de forma assíncrona (`ng serve`). Retorna imediatamente. |
| `devserver.stop`           | Para o servidor de desenvolvimento.                                      |
| `devserver.wait_for_build` | Retorna os logs do build mais recente em um servidor de desenvolvimento em execução. |
| `e2e`                      | Executa testes de ponta a ponta.                                         |
| `modernize`                | Realiza migrações de código para alinhá-lo às boas práticas e à sintaxe mais recentes. |
| `test`                     | Executa os testes unitários do projeto.                                  |

## Configuração

Para usar o servidor MCP, você configura seu ambiente host (IDE ou CLI) para executar `npx @angular/cli mcp`.

### Antigravity IDE

Crie um arquivo chamado `.antigravity/mcp.json` na raiz do seu projeto:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

### Gemini CLI

Crie `.gemini/settings.json` na raiz do projeto:

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

### Cursor

Crie `.cursor/mcp.json` na raiz do projeto (ou globalmente em `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

### VS Code

Crie `.vscode/mcp.json`:

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp"]
    }
  }
}
```

## Opções de Comando

Você pode passar argumentos ao servidor MCP no array `args` da sua configuração:

- `--read-only`: registra apenas ferramentas que não modificam o projeto.
- `--local-only`: registra apenas ferramentas que não requerem conexão com a internet.
- `--experimental-tool` (`-E`): habilita ferramentas experimentais específicas (ex.: `-E build`, `-E devserver`).

Exemplo para modo somente leitura com ferramentas experimentais habilitadas:

```json
"args": ["-y", "@angular/cli", "mcp", "--read-only", "-E", "build", "-E", "modernize"]
```
