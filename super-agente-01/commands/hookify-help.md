---
description: Get help with the hookify system
---

Exibe a documentação completa do hookify.

## Visão Geral do Sistema de Hooks

O hookify cria arquivos de regra que se integram ao sistema de hooks do Claude Code para prevenir comportamentos indesejados.

### Tipos de Evento

- `bash`: dispara no uso da tool Bash e casa com padrões de comando
- `file`: dispara no uso das tools Write/Edit e casa com caminhos de arquivo
- `stop`: dispara quando uma sessão termina
- `prompt`: dispara no envio de mensagem do usuário e casa com padrões de entrada
- `all`: dispara em todos os eventos

### Formato do Arquivo de Regra

Os arquivos são armazenados como `.claude/hookify.{name}.local.md`:

```yaml
---
name: descriptive-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern to match"
---
Message to display when rule triggers.
Supports multiple lines.
```

### Comandos

- `/hookify [description]` cria novas regras e analisa automaticamente a conversa quando nenhuma descrição é fornecida
- `/hookify-list` lista as regras configuradas
- `/hookify-configure` alterna regras entre ligado e desligado

### Dicas de Padrão

- use sintaxe regex
- para `bash`, case contra a string completa do comando
- para `file`, case contra o caminho do arquivo
- teste os padrões antes de implantar
