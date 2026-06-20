---
name: security-scan
description: Escaneia sua configuração do Claude Code (diretório .claude/) em busca de vulnerabilidades de segurança, configurações incorretas e riscos de injeção usando o AgentShield. Verifica CLAUDE.md, settings.json, servidores MCP, hooks e definições de agentes.
metadata:
  origin: ECC
---

# Skill de Varredura de Segurança

Audite sua configuração do Claude Code em busca de problemas de segurança usando o [AgentShield](https://github.com/affaan-m/agentshield).

## Quando Ativar

- Ao configurar um novo projeto do Claude Code
- Após modificar `.claude/settings.json`, `CLAUDE.md` ou configs MCP
- Antes de versionar mudanças de configuração
- Ao integrar um novo repositório com configs existentes do Claude Code
- Verificações periódicas de higiene de segurança

## O Que É Verificado

| Arquivo | Verificações |
|------|--------|
| `CLAUDE.md` | Segredos hardcoded, instruções de execução automática, padrões de injeção de Prompt |
| `settings.json` | Listas de permissão excessivamente permissivas, listas de negação ausentes, flags de bypass perigosas |
| `mcp.json` | Servidores MCP arriscados, segredos de env hardcoded, riscos de supply chain com npx |
| `hooks/` | Command injection via interpolação, exfiltração de dados, supressão silenciosa de erros |
| `agents/*.md` | Acesso irrestrito a tools, superfície de injeção de Prompt, specs de modelo ausentes |

## Pré-requisitos

O AgentShield deve estar instalado. Verifique e instale se necessário:

```bash
# Verificar se está instalado
npx ecc-agentshield --version

# Instalar globalmente (recomendado)
npm install -g ecc-agentshield

# Ou executar diretamente via npx (sem instalação)
npx ecc-agentshield scan .
```

## Uso

### Varredura Básica

Execute no diretório `.claude/` do projeto atual:

```bash
# Escanear projeto atual
npx ecc-agentshield scan

# Escanear um caminho específico
npx ecc-agentshield scan --path /path/to/.claude

# Escanear com filtro de severidade mínima
npx ecc-agentshield scan --min-severity medium
```

### Formatos de Saída

```bash
# Saída no terminal (padrão) — relatório colorido com nota
npx ecc-agentshield scan

# JSON — para integração com CI/CD
npx ecc-agentshield scan --format json

# Markdown — para documentação
npx ecc-agentshield scan --format markdown

# HTML — relatório de tema escuro autocontido
npx ecc-agentshield scan --format html > security-report.html
```

### Correção Automática

Aplicar correções seguras automaticamente (apenas correções marcadas como auto-corrigíveis):

```bash
npx ecc-agentshield scan --fix
```

Isso irá:
- Substituir segredos hardcoded por referências a variáveis de ambiente
- Restringir permissões de wildcard para alternativas com escopo
- Nunca modificar sugestões apenas manuais

### Análise Profunda com Opus 4.6

Execute o pipeline adversarial de três agentes para análise mais profunda:

```bash
# Requer ANTHROPIC_API_KEY
export ANTHROPIC_API_KEY=your-key
npx ecc-agentshield scan --opus --stream
```

Isso executa:
1. **Atacante (Red Team)** — encontra vetores de ataque
2. **Defensor (Blue Team)** — recomenda hardening
3. **Auditor (Veredicto Final)** — sintetiza ambas as perspectivas

### Inicializar Configuração Segura

Criar um novo `.claude/` de configuração segura do zero:

```bash
npx ecc-agentshield init
```

Cria:
- `settings.json` com permissões com escopo e lista de negação
- `CLAUDE.md` com boas práticas de segurança
- placeholder `mcp.json`

### GitHub Action

Adicionar ao seu pipeline de CI:

```yaml
- uses: affaan-m/agentshield@v1
  with:
    path: '.'
    min-severity: 'medium'
    fail-on-findings: true
```

## Níveis de Severidade

| Nota | Pontuação | Significado |
|-------|-------|---------|
| A | 90-100 | Configuração segura |
| B | 75-89 | Problemas menores |
| C | 60-74 | Requer atenção |
| D | 40-59 | Riscos significativos |
| F | 0-39 | Vulnerabilidades críticas |

## Interpretando os Resultados

### Achados Críticos (corrigir imediatamente)
- Chaves de API ou tokens hardcoded em arquivos de configuração
- `Bash(*)` na lista de permissão (acesso irrestrito ao shell)
- Command injection em hooks via interpolação `${file}`
- Servidores MCP que executam shell

### Achados Altos (corrigir antes de produção)
- Instruções de execução automática no CLAUDE.md (vetor de injeção de Prompt)
- Listas de negação ausentes nas permissões
- Agentes com acesso desnecessário ao Bash

### Achados Médios (recomendado)
- Supressão silenciosa de erros em hooks (`2>/dev/null`, `|| true`)
- Hooks de segurança PreToolUse ausentes
- `npx -y` com auto-install em configs de servidor MCP

### Achados Informativos (conscientização)
- Descrições ausentes em servidores MCP
- Instruções proibitivas corretamente sinalizadas como boa prática

## Links

- **GitHub**: [github.com/affaan-m/agentshield](https://github.com/affaan-m/agentshield)
- **npm**: [npmjs.com/package/ecc-agentshield](https://www.npmjs.com/package/ecc-agentshield)
