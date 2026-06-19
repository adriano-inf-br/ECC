# Contribuindo para o Everything Claude Code

Obrigado por querer contribuir! Este repositório é um recurso comunitário para usuários do Claude Code.

## Índice

- [What We're Looking For](#what-were-looking-for)
- [Quick Start](#quick-start)
- [Contributing Skills](#contributing-skills)
- [Skill Adaptation Policy](#skill-adaptation-policy)
- [Contributing Agents](#contributing-agents)
- [Contributing Hooks](#contributing-hooks)
- [Contributing Commands](#contributing-commands)
- [MCP and documentation (e.g. Context7)](#mcp-and-documentation-eg-context7)
- [Cross-Harness and Translations](#cross-harness-and-translations)
- [Pull Request Process](#pull-request-process)

---

## O Que Procuramos

### Agents
Novos agents que lidam bem com tarefas específicas:
- Reviewers específicos de linguagem (Python, Go, Rust)
- Especialistas em frameworks (Django, Rails, Laravel, Spring)
- Especialistas em DevOps (Kubernetes, Terraform, CI/CD)
- Especialistas de domínio (pipelines de ML, engenharia de dados, mobile)

### Skills
Definições de fluxo de trabalho e conhecimento de domínio:
- Boas práticas de linguagem
- Padrões de framework
- Estratégias de teste
- Guias de arquitetura

### Hooks
Automações úteis:
- Hooks de linting/formatação
- Verificações de segurança
- Hooks de validação
- Hooks de notificação

### Comandos
Comandos de barra que invocam fluxos de trabalho úteis:
- Comandos de deploy
- Comandos de teste
- Comandos de geração de código

---

## Quick Start

```bash
# 1. Fork and clone
gh repo fork affaan-m/ECC --clone
cd ECC

# 2. Create a branch
git checkout -b feat/my-contribution

# 3. Add your contribution (see sections below)

# 4. Test locally
cp -r skills/my-skill ~/.claude/skills/  # for skills
# Then test with Claude Code

# 5. Submit PR
git add . && git commit -m "feat: add my-skill" && git push -u origin feat/my-contribution
```

---

## Contribuindo com Skills

Skills são módulos de conhecimento que o Claude Code carrega com base no contexto.

> **Guia Abrangente:** Para orientação detalhada sobre como criar skills eficazes, veja o [Guia de Desenvolvimento de Skills](docs/SKILL-DEVELOPMENT-GUIDE.md). Ele cobre:
> - Arquitetura e categorias de skills
> - Escrita de conteúdo eficaz com exemplos
> - Boas práticas e padrões comuns
> - Teste e validação
> - Galeria completa de exemplos

### Estrutura de Diretórios

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### Template de SKILL.md

```markdown
---
name: your-skill-name
description: Brief description shown in skill list and used for auto-activation
origin: ECC
---

# Your Skill Title

Brief overview of what this skill covers.

## When to Activate

Describe scenarios where Claude should use this skill. This is critical for auto-activation.

## Core Concepts

Explain key patterns and guidelines.

## Code Examples

\`\`\`typescript
// Include practical, tested examples
function example() {
  // Well-commented code
}
\`\`\`

## Anti-Patterns

Show what NOT to do with examples.

## Best Practices

- Actionable guidelines
- Do's and don'ts
- Common pitfalls to avoid

## Related Skills

Link to complementary skills (e.g., `related-skill-1`, `related-skill-2`).
```

### Categorias de Skills

| Categoria | Propósito | Exemplos |
|----------|---------|----------|
| **Language Standards** | Idiomas, convenções, boas práticas | `python-patterns`, `golang-patterns` |
| **Framework Patterns** | Orientação específica de framework | `django-patterns`, `nextjs-patterns` |
| **Workflow** | Processos passo a passo | `tdd-workflow`, `refactoring-workflow` |
| **Domain Knowledge** | Domínios especializados | `security-review`, `api-design` |
| **Tool Integration** | Uso de ferramenta/biblioteca | `docker-patterns`, `supabase-patterns` |
| **Template** | Templates de skill específicos de projeto | `docs/examples/project-guidelines-template.md` |

### Política de Adaptação de Skills

Se você está portando uma ideia de outro repositório, plugin, harness ou pacote pessoal de prompts, leia a [Política de Adaptação de Skills](docs/skill-adaptation-policy.md) antes de abrir o PR.

Versão curta:

- copie a ideia subjacente, não a identidade do produto externo
- renomeie a skill quando o ECC mudar ou expandir materialmente a superfície
- prefira regras, skills, scripts e MCPs nativos do ECC em vez de novas dependências de terceiros padrão
- não entregue uma skill cujo principal valor seja dizer aos usuários para instalar um pacote não verificado

### Checklist de Skill

- [ ] Focada em um domínio/tecnologia (não muito ampla)
- [ ] Inclui a seção "When to Activate" para auto-ativação
- [ ] Inclui exemplos de código práticos e prontos para copiar e colar
- [ ] Mostra anti-padrões (o que NÃO fazer)
- [ ] Abaixo de 500 linhas (800 máximo)
- [ ] Usa cabeçalhos de seção claros
- [ ] Testada com o Claude Code
- [ ] Links para skills relacionadas
- [ ] Nenhum dado sensível (chaves de API, tokens, caminhos)
- [ ] O frontmatter declara `name:` correspondendo ao nome do diretório
- [ ] O `description:` do frontmatter é uma string inline ou escalar dobrado (`>`) — não um bloco literal (`|`, `|-` ou `|+`), que preserva quebras de linha internas e quebra os renderizadores de tabela plana

### Skills de Exemplo

| Skill | Categoria | Propósito |
|-------|----------|---------|
| `coding-standards/` | Language Standards | Padrões TypeScript/JavaScript |
| `frontend-patterns/` | Framework Patterns | Boas práticas de React e Next.js |
| `backend-patterns/` | Framework Patterns | Padrões de API e banco de dados |
| `security-review/` | Domain Knowledge | Checklist de segurança |
| `tdd-workflow/` | Workflow | Processo de desenvolvimento orientado a testes |
| `docs/examples/project-guidelines-template.md` | Template | Template de skill específico de projeto |

---

## Contribuindo com Agents

Agents são assistentes especializados invocados via a ferramenta Task.

### Localização do Arquivo

```
agents/your-agent-name.md
```

### Template de Agent

```markdown
---
name: your-agent-name
description: What this agent does and when Claude should invoke it. Be specific!
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]
model: sonnet
---

You are a [role] specialist.

## Your Role

- Primary responsibility
- Secondary responsibility
- What you DO NOT do (boundaries)

## Workflow

### Step 1: Understand
How you approach the task.

### Step 2: Execute
How you perform the work.

### Step 3: Verify
How you validate results.

## Output Format

What you return to the user.

## Examples

### Example: [Scenario]
Input: [what user provides]
Action: [what you do]
Output: [what you return]
```

### Campos do Agent

| Campo | Descrição | Opções |
|-------|-------------|---------|
| `name` | Minúsculo, com hífens | `code-reviewer` |
| `description` | Usado para decidir quando invocar | Seja específico! |
| `tools` | Apenas o que for necessário | `Read, Write, Edit, Bash, Grep, Glob, WebFetch, Task`, ou nomes de ferramentas MCP (ex.: `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`) quando o agent usa MCP |
| `model` | Nível de complexidade | `haiku` (simples), `sonnet` (codificação), `opus` (complexo) |

### Agents de Exemplo

| Agent | Propósito |
|-------|---------|
| `tdd-guide.md` | Desenvolvimento orientado a testes |
| `code-reviewer.md` | Revisão de código |
| `security-reviewer.md` | Varredura de segurança |
| `build-error-resolver.md` | Corrigir erros de build |

---

## Contribuindo com Hooks

Hooks são comportamentos automáticos acionados por eventos do Claude Code.

### Localização do Arquivo

```
hooks/hooks.json
```

### Tipos de Hook

| Tipo | Gatilho | Caso de Uso |
|------|---------|----------|
| `PreToolUse` | Antes de a ferramenta rodar | Validar, avisar, bloquear |
| `PostToolUse` | Depois de a ferramenta rodar | Formatar, verificar, notificar |
| `SessionStart` | Início da sessão | Carregar contexto |
| `Stop` | Fim da sessão | Limpeza, auditoria |

### Formato de Hook

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "tool == \"Bash\" && tool_input.command matches \"rm -rf /\"",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Hook] BLOCKED: Dangerous command' && exit 1"
          }
        ],
        "description": "Block dangerous rm commands"
      }
    ]
  }
}
```

### Sintaxe de Matcher

```javascript
// Match specific tools
tool == "Bash"
tool == "Edit"
tool == "Write"

// Match input patterns
tool_input.command matches "npm install"
tool_input.file_path matches "\\.tsx?$"

// Combine conditions
tool == "Bash" && tool_input.command matches "git push"
```

### Exemplos de Hook

```json
// Block dev servers outside tmux
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"npm run dev\"",
  "hooks": [{"type": "command", "command": "echo 'Use tmux for dev servers' && exit 1"}],
  "description": "Ensure dev servers run in tmux"
}

// Auto-format after editing TypeScript
{
  "matcher": "tool == \"Edit\" && tool_input.file_path matches \"\\.tsx?$\"",
  "hooks": [{"type": "command", "command": "npx prettier --write \"$file_path\""}],
  "description": "Format TypeScript files after edit"
}

// Warn before git push
{
  "matcher": "tool == \"Bash\" && tool_input.command matches \"git push\"",
  "hooks": [{"type": "command", "command": "echo '[Hook] Review changes before pushing'"}],
  "description": "Reminder to review before push"
}
```

### Checklist de Hook

- [ ] O matcher é específico (não excessivamente amplo)
- [ ] Inclui mensagens claras de erro/informação
- [ ] Usa códigos de saída corretos (`exit 1` bloqueia, `exit 0` permite)
- [ ] Testado minuciosamente
- [ ] Possui descrição

---

## Contribuindo com Comandos

Comandos são ações invocadas pelo usuário com `/command-name`.

### Localização do Arquivo

```
commands/your-command.md
```

### Template de Comando

```markdown
---
description: Brief description shown in /help
---

# Command Name

## Purpose

What this command does.

## Usage

\`\`\`
/your-command [args]
\`\`\`

## Workflow

1. First step
2. Second step
3. Final step

## Output

What the user receives.
```

### Comandos de Exemplo

| Comando | Propósito |
|---------|---------|
| `commit.md` | Criar commits do git |
| `code-review.md` | Revisar alterações de código |
| `tdd.md` | Fluxo de trabalho de TDD |
| `e2e.md` | Testes E2E |

---

## MCP e documentação (ex.: Context7)

Skills e agents podem usar ferramentas de **MCP (Model Context Protocol)** para trazer dados atualizados em vez de depender apenas dos dados de treinamento. Isso é especialmente útil para documentação.

- **Context7** é um servidor MCP que expõe `resolve-library-id` e `query-docs`. Use-o quando o usuário perguntar sobre bibliotecas, frameworks ou APIs para que as respostas reflitam a documentação e os exemplos de código atuais.
- Ao contribuir com **skills** que dependem de documentação ao vivo (ex.: configuração, uso de API), descreva como usar as ferramentas MCP relevantes (ex.: resolver o ID da biblioteca, depois consultar a documentação) e aponte para a skill `documentation-lookup` ou o Context7 como o padrão.
- Ao contribuir com **agents** que respondem perguntas sobre documentação/API, inclua os nomes das ferramentas MCP do Context7 (ex.: `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`) nas tools do agent e documente o fluxo de trabalho resolver → consultar.
- **mcp-configs/mcp-servers.json** inclui uma entrada de Context7; os usuários a habilitam em seu harness (ex.: Claude Code, Cursor) para usar a skill documentation-lookup (em `skills/documentation-lookup/`) e o comando `/docs`.

---

## Cross-Harness e Traduções

### Subconjuntos de skills (Codex e Cursor)

O ECC entrega subconjuntos de skills para outros harnesses:

- **Codex:** `.agents/skills/` — as skills listadas em `agents/openai.yaml` são carregadas pelo Codex.
- **Cursor:** `.cursor/skills/` — um subconjunto de skills é empacotado para o Cursor.

Quando você **adiciona uma nova skill** que deve estar disponível no Codex ou Cursor:

1. Adicione a skill em `skills/your-skill-name/` como de costume.
2. Se ela deve estar disponível no **Codex**, adicione-a em `.agents/skills/` (copie o diretório da skill ou adicione uma referência) e garanta que ela esteja referenciada em `agents/openai.yaml` se necessário.
3. Se ela deve estar disponível no **Cursor**, adicione-a em `.cursor/skills/` conforme o layout do Cursor.

Verifique as skills existentes nesses diretórios para a estrutura esperada. Manter esses subconjuntos sincronizados é manual; mencione no seu PR se você os atualizou.

### Traduções

As traduções ficam em `docs/` (ex.: `docs/zh-CN`, `docs/zh-TW`, `docs/ja-JP`). Se você alterar agents, comandos ou skills que são traduzidos, considere atualizar os arquivos de tradução correspondentes ou abrir uma issue para que os mantenedores ou tradutores possam atualizá-los.

---

## Processo de Pull Request

### 1. Formato do Título do PR

```
feat(skills): add rust-patterns skill
feat(agents): add api-designer agent
feat(hooks): add auto-format hook
fix(skills): update React patterns
docs: improve contributing guide
```

### 2. Descrição do PR

```markdown
## Summary
What you're adding and why.

## Type
- [ ] Skill
- [ ] Agent
- [ ] Hook
- [ ] Command

## Testing
How you tested this.

## Checklist
- [ ] Follows format guidelines
- [ ] Tested with Claude Code
- [ ] No sensitive info (API keys, paths)
- [ ] Clear descriptions
```

### 3. Processo de Revisão

1. Os mantenedores revisam em até 48 horas
2. Trate o feedback se solicitado
3. Uma vez aprovado, é mesclado na main

---

## Diretrizes

### Faça
- Mantenha as contribuições focadas e modulares
- Inclua descrições claras
- Teste antes de submeter
- Siga os padrões existentes
- Documente dependências

### Não Faça
- Incluir dados sensíveis (chaves de API, tokens, caminhos)
- Adicionar configurações excessivamente complexas ou de nicho
- Submeter contribuições não testadas
- Criar duplicatas de funcionalidade existente

---

## Nomenclatura de Arquivos

- Use minúsculas com hífens: `python-reviewer.md`
- Seja descritivo: `tdd-workflow.md` em vez de `workflow.md`
- Corresponda o nome ao nome do arquivo

---

## Dúvidas?

- **Issues:** [github.com/affaan-m/ECC/issues](https://github.com/affaan-m/ECC/issues)
- **X/Twitter:** [@affaanmustafa](https://x.com/affaanmustafa)

---

Obrigado por contribuir! Vamos construir juntos um ótimo recurso.
