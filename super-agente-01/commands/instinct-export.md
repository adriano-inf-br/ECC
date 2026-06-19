---
name: instinct-export
description: Export instincts from project/global scope to a file
command: /instinct-export
---

# Comando de Exportação de Instincts

Exporta instincts para um formato compartilhável. Perfeito para:
- Compartilhar com colegas de equipe
- Transferir para uma nova máquina
- Contribuir com convenções de projeto

## Uso

```
/instinct-export                           # Export all personal instincts
/instinct-export --domain testing          # Export only testing instincts
/instinct-export --min-confidence 0.7      # Only export high-confidence instincts
/instinct-export --output team-instincts.yaml
/instinct-export --scope project --output project-instincts.yaml
```

## O Que Fazer

1. Detecte o contexto do projeto atual
2. Carregue os instincts pelo escopo selecionado:
   - `project`: apenas o projeto atual
   - `global`: apenas global
   - `all`: projeto + global mesclados (padrão)
3. Aplique os filtros (`--domain`, `--min-confidence`)
4. Escreva a exportação no estilo YAML em um arquivo (ou em stdout se nenhum caminho de saída for fornecido)

## Formato de Saída

Cria um arquivo YAML:

```yaml
# Instincts Export
# Generated: 2025-01-22
# Source: personal
# Count: 12 instincts

---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.8
domain: code-style
source: session-observation
scope: project
project_id: a1b2c3d4e5f6
project_name: my-app
---

# Prefer Functional Style

## Action
Use functional patterns over classes.
```

## Flags

- `--domain <name>`: Exporta apenas o domínio especificado
- `--min-confidence <n>`: Limite mínimo de confiança
- `--output <file>`: Caminho do arquivo de saída (imprime em stdout quando omitido)
- `--scope <project|global|all>`: Escopo de exportação (padrão: `all`)
