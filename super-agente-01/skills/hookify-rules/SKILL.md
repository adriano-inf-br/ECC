---
name: hookify-rules
description: Esta skill deve ser usada quando o usuário pedir para criar uma regra do hookify, escrever uma regra de hook, configurar o hookify, adicionar uma regra do hookify, ou precisar de orientação sobre a sintaxe e os padrões de regras do hookify.
---

# Escrevendo Regras do Hookify

## Visão Geral

Regras do hookify são arquivos markdown com frontmatter YAML que definem padrões a observar e mensagens a exibir quando esses padrões correspondem. As regras são armazenadas em arquivos `.claude/hookify.{rule-name}.local.md`.

## Formato do Arquivo de Regra

### Estrutura Básica

```markdown
---
name: rule-identifier
enabled: true
event: bash|file|stop|prompt|all
pattern: regex-pattern-here
---

Mensagem a exibir ao Claude quando esta regra é disparada.
Pode incluir formatação markdown, avisos, sugestões, etc.
```

### Campos do Frontmatter

| Campo | Obrigatório | Valores | Descrição |
|-------|----------|--------|-------------|
| name | Sim | string kebab-case | Identificador único (verbo primeiro: warn-*, block-*, require-*) |
| enabled | Sim | true/false | Alterna sem excluir |
| event | Sim | bash/file/stop/prompt/all | Qual evento de hook dispara esta regra |
| action | Não | warn/block | warn (padrão) exibe a mensagem; block impede a operação |
| pattern | Sim* | string regex | Padrão a corresponder (*ou use conditions para regras complexas) |

### Formato Avançado (Múltiplas Condições)

```markdown
---
name: warn-env-api-keys
enabled: true
event: file
conditions:
  - field: file_path
    operator: regex_match
    pattern: \.env$
  - field: new_text
    operator: contains
    pattern: API_KEY
---

Você está adicionando uma chave de API a um arquivo .env. Garanta que este arquivo esteja no .gitignore!
```

**Campos de condição por evento:**
- bash: `command`
- file: `file_path`, `new_text`, `old_text`, `content`
- prompt: `user_prompt`

**Operadores:** `regex_match`, `contains`, `equals`, `not_contains`, `starts_with`, `ends_with`

Todas as condições devem corresponder para a regra ser disparada.

## Guia de Tipos de Evento

### Eventos bash
Correspondem a padrões de comandos Bash:
- Comandos perigosos: `rm\s+-rf`, `dd\s+if=`, `mkfs`
- Escalonamento de privilégios: `sudo\s+`, `su\s+`
- Problemas de permissão: `chmod\s+777`

### Eventos file
Correspondem a operações de Edit/Write/MultiEdit:
- Código de debug: `console\.log\(`, `debugger`
- Riscos de segurança: `eval\(`, `innerHTML\s*=`
- Arquivos sensíveis: `\.env$`, `credentials`, `\.pem$`

### Eventos stop
Verificações de conclusão e lembretes. O padrão `.*` corresponde sempre.

### Eventos prompt
Correspondem ao conteúdo do prompt do usuário para imposição de fluxo de trabalho.

## Dicas para Escrever Padrões

### Noções de Regex
- Escape caracteres especiais: `.` para `\.`, `(` para `\(`
- `\s` espaço em branco, `\d` dígito, `\w` caractere de palavra
- `+` um ou mais, `*` zero ou mais, `?` opcional
- `|` operador OR

### Armadilhas Comuns
- **Amplo demais**: `log` corresponde a "login", "dialog" — use `console\.log\(`
- **Específico demais**: `rm -rf /tmp` — use `rm\s+-rf`
- **Escape em YAML**: Use padrões sem aspas; strings com aspas precisam de `\\s`

### Testes
```bash
python3 -c "import re; print(re.search(r'your_pattern', 'test text'))"
```

## Organização de Arquivos

- **Localização**: diretório `.claude/` na raiz do projeto
- **Nomenclatura**: `.claude/hookify.{descriptive-name}.local.md`
- **Gitignore**: Adicione `.claude/*.local.md` ao `.gitignore`

## Comandos

- `/hookify [description]` - Cria novas regras (analisa a conversa automaticamente se não houver args)
- `/hookify-list` - Exibe todas as regras em formato de tabela
- `/hookify-configure` - Alterna regras on/off interativamente
- `/hookify-help` - Documentação completa

## Referência Rápida

Regra mínima viável:
```markdown
---
name: my-rule
enabled: true
event: bash
pattern: dangerous_command
---
Mensagem de aviso aqui
```
