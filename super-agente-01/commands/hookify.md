---
description: Create hooks to prevent unwanted behaviors from conversation analysis or explicit instructions
---

Crie regras de hook para prevenir comportamentos indesejados do Claude Code analisando padrões de conversa ou instruções explícitas do usuário.

## Uso

`/hookify [description of behavior to prevent]`

Se nenhum argumento for fornecido, analise a conversa atual para encontrar comportamentos que valem a pena prevenir.

## Fluxo de Trabalho

### Passo 1: Reunir Informações de Comportamento

- Com argumentos: faça o parse da descrição do usuário sobre o comportamento indesejado
- Sem argumentos: use o agent `conversation-analyzer` para encontrar:
  - correções explícitas
  - reações de frustração a erros repetidos
  - mudanças revertidas
  - problemas semelhantes repetidos

### Passo 2: Apresentar as Descobertas

Mostre ao usuário:

- descrição do comportamento
- tipo de evento proposto
- padrão ou matcher proposto
- ação proposta

### Passo 3: Gerar os Arquivos de Regra

Para cada regra aprovada, crie um arquivo em `.claude/hookify.{name}.local.md`:

```yaml
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
action: block|warn
pattern: "regex pattern"
---
Message shown when rule triggers.
```

### Passo 4: Confirmar

Reporte as regras criadas e como gerenciá-las com `/hookify-list` e `/hookify-configure`.
