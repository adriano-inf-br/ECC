# Guia de Desenvolvimento de Skills

Um guia abrangente para criar skills eficazes para o Everything Claude Code (ECC).

## Sumário

- [O que são Skills?](#o-que-sao-skills)
- [Arquitetura de Skill](#arquitetura-de-skill)
- [Criando Sua Primeira Skill](#criando-sua-primeira-skill)
- [Categorias de Skill](#categorias-de-skill)
- [Escrevendo Conteúdo Eficaz para Skills](#escrevendo-conteudo-eficaz-para-skills)
- [Boas Práticas](#boas-praticas)
- [Padrões Comuns](#padroes-comuns)
- [Testando Sua Skill](#testando-sua-skill)
- [Submetendo Sua Skill](#submetendo-sua-skill)
- [Galeria de Exemplos](#galeria-de-exemplos)

---

## O que são Skills?

Skills são **módulos de conhecimento** que o Claude Code carrega com base no contexto. Eles fornecem:

- **Expertise de domínio**: Padrões de framework, idiomas de linguagem, boas práticas
- **Definições de fluxo de trabalho**: Processos passo a passo para tarefas comuns
- **Material de referência**: Trechos de código, checklists, árvores de decisão
- **Injeção de contexto**: Ativam quando condições específicas são atendidas

Ao contrário de **agents** (subassistentes especializados) ou **commands** (ações acionadas pelo usuário), as skills são conhecimento passivo que o Claude Code referencia quando relevante.

### Quando as Skills Ativam

As skills ativam quando:
- A tarefa do usuário corresponde ao domínio da skill
- O Claude Code detecta contexto relevante
- Um comando referencia uma skill
- Um agent precisa de conhecimento de domínio

### Skill vs Agent vs Command

| Componente | Objetivo | Ativação |
|-----------|---------|------------|
| **Skill** | Repositório de conhecimento | Baseado em contexto (automático) |
| **Agent** | Executor de tarefas | Delegação explícita |
| **Command** | Ação do usuário | Invocado pelo usuário (`/command`) |
| **Hook** | Automação | Acionado por evento |
| **Rule** | Diretrizes sempre ativas | Sempre ativo |

---

## Arquitetura de Skill

### Estrutura de Arquivo

```
skills/
└── your-skill-name/
    ├── SKILL.md           # Obrigatório: Definição principal da skill
    ├── examples/          # Opcional: Exemplos de código
    │   ├── basic.ts
    │   └── advanced.ts
    └── references/        # Opcional: Referências externas
        └── links.md
```

### Formato do SKILL.md

```markdown
---
name: skill-name
description: Brief description shown in skill list and used for auto-activation
origin: ECC
---

# Skill Title

Brief overview of what this skill covers.

## When to Activate

Describe scenarios where Claude should use this skill.

## Core Concepts

Main patterns and guidelines.

## Code Examples

\`\`\`typescript
// Practical, tested examples
\`\`\`

## Anti-Patterns

Show what NOT to do with concrete examples.

## Best Practices

- Actionable guidelines
- Do's and don'ts

## Related Skills

Link to complementary skills.
```

### Campos do Frontmatter YAML

| Campo | Obrigatório | Descrição |
|-------|----------|-------------|
| `name` | Sim | Identificador em minúsculas com hífens (ex.: `react-patterns`) |
| `description` | Sim | Descrição de uma linha para lista de skills e ativação automática |
| `origin` | Não | Identificador de origem (ex.: `ECC`, `community`, nome do projeto) |
| `tags` | Não | Array de tags para categorização |
| `version` | Não | Versão da skill para rastrear atualizações |

---

## Criando Sua Primeira Skill

### Passo 1: Escolher um Foco

Boas skills são **focadas e acionáveis**:

| APROVADO: Bom Foco | REPROVADO: Muito Amplo |
|---------------|--------------|
| `react-hook-patterns` | `react` |
| `postgresql-indexing` | `databases` |
| `pytest-fixtures` | `python-testing` |
| `nextjs-app-router` | `nextjs` |

### Passo 2: Criar o Diretório

```bash
mkdir -p skills/your-skill-name
```

### Passo 3: Escrever o SKILL.md

Aqui está um template mínimo:

```markdown
---
name: your-skill-name
description: Brief description of when to use this skill
---

# Your Skill Title

Brief overview (1-2 sentences).

## When to Activate

- Scenario 1
- Scenario 2
- Scenario 3

## Core Concepts

### Concept 1

Explanation with examples.

### Concept 2

Another pattern with code.

## Code Examples

\`\`\`typescript
// Practical example
\`\`\`

## Best Practices

- Do this
- Avoid that

## Related Skills

- `related-skill-1`
- `related-skill-2`
```

### Passo 4: Adicionar Conteúdo

Escreva conteúdo que o Claude possa **usar imediatamente**:

- APROVADO: Exemplos de código prontos para copiar e colar
- APROVADO: Árvores de decisão claras
- APROVADO: Checklists para verificação
- REPROVADO: Explicações vagas sem exemplos
- REPROVADO: Prosa longa sem orientação acionável

---

## Categorias de Skill

### Padrões de Linguagem

Foque em código idiomático, convenções de nomenclatura e padrões específicos da linguagem.

**Exemplos:** `python-patterns`, `golang-patterns`, `typescript-standards`

```markdown
---
name: python-patterns
description: Python idioms, best practices, and patterns for clean, idiomatic code.
---

# Python Patterns

## When to Activate

- Writing Python code
- Refactoring Python modules
- Python code review

## Core Concepts

### Context Managers

\`\`\`python
# Always use context managers for resources
with open('file.txt') as f:
    content = f.read()
\`\`\`
```

### Padrões de Framework

Foque em convenções específicas do framework, padrões comuns e anti-padrões.

**Exemplos:** `django-patterns`, `nextjs-patterns`, `springboot-patterns`

```markdown
---
name: django-patterns
description: Django best practices for models, views, URLs, and templates.
---

# Django Patterns

## When to Activate

- Building Django applications
- Creating models and views
- Django URL configuration
```

### Skills de Fluxo de Trabalho

Defina processos passo a passo para tarefas comuns de desenvolvimento.

**Exemplos:** `tdd-workflow`, `code-review-workflow`, `deployment-checklist`

```markdown
---
name: code-review-workflow
description: Systematic code review process for quality and security.
---

# Code Review Workflow

## Steps

1. **Understand Context** - Read PR description and linked issues
2. **Check Tests** - Verify test coverage and quality
3. **Review Logic** - Analyze implementation for correctness
4. **Check Security** - Look for vulnerabilities
5. **Verify Style** - Ensure code follows conventions
```

### Conhecimento de Domínio

Conhecimento especializado para domínios específicos (segurança, desempenho, etc.).

**Exemplos:** `security-review`, `performance-optimization`, `api-design`

```markdown
---
name: api-design
description: REST and GraphQL API design patterns, versioning, and best practices.
---

# API Design Patterns

## RESTful Conventions

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /resources | List all |
| GET | /resources/:id | Get one |
| POST | /resources | Create |
```

### Integração de Ferramentas

Orientação para uso de ferramentas, bibliotecas ou serviços específicos.

**Exemplos:** `supabase-patterns`, `docker-patterns`, `mcp-server-patterns`

---

## Escrevendo Conteúdo Eficaz para Skills

### 1. Comece com "When to Activate"

Esta seção é **crítica** para ativação automática. Seja específico:

```markdown
## When to Activate

- Creating new React components
- Refactoring existing components
- Debugging React state issues
- Reviewing React code for best practices
```

### 2. Use "Mostrar, não Dizer"

Ruim:
```markdown
## Error Handling

Always handle errors properly in async functions.
```

Bom:
```markdown
## Error Handling

\`\`\`typescript
async function fetchData(url: string) {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
    }

    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}
\`\`\`

### Key Points

- Check \`response.ok\` before parsing
- Log errors for debugging
- Re-throw with user-friendly message
```

### 3. Inclua Anti-Padrões

Mostre o que NÃO fazer:

```markdown
## Anti-Patterns

### REPROVADO: Mutação Direta de Estado

\`\`\`typescript
// NEVER do this
user.name = 'New Name'
items.push(newItem)
\`\`\`

### APROVADO: Atualizações Imutáveis

\`\`\`typescript
// ALWAYS do this
const updatedUser = { ...user, name: 'New Name' }
const updatedItems = [...items, newItem]
\`\`\`
```

### 4. Forneça Checklists

Checklists são acionáveis e fáceis de seguir:

```markdown
## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console.log in production code
- [ ] Environment variables documented
- [ ] Secrets not hardcoded
- [ ] Error handling complete
- [ ] Input validation in place
```

### 5. Use Árvores de Decisão

Para decisões complexas:

```markdown
## Choosing the Right Approach

\`\`\`
Need to fetch data?
├── Single request → use fetch directly
├── Multiple independent → Promise.all()
├── Multiple dependent → await sequentially
└── With caching → use SWR or React Query
\`\`\`
```

---

## Boas Práticas

### FAÇA

| Prática | Exemplo |
|----------|---------|
| **Seja específico** | "Use \`useCallback\` para manipuladores de eventos passados para componentes filhos" |
| **Mostre exemplos** | Inclua código pronto para copiar e colar |
| **Explique o PORQUÊ** | "Imutabilidade previne efeitos colaterais inesperados no estado React" |
| **Vincule skills relacionadas** | "Veja também: \`react-performance\`" |
| **Mantenha o foco** | Uma skill = um domínio/conceito |
| **Use seções** | Cabeçalhos claros para fácil escaneamento |

### NÃO FAÇA

| Prática | Por que é Ruim |
|----------|--------------|
| **Seja vago** | "Escreva bom código" - não é acionável |
| **Prosa longa** | Difícil de analisar, melhor como código |
| **Cubra demais** | "Padrões de Python, Django e Flask" - muito amplo |
| **Pule exemplos** | Teoria sem prática é menos útil |
| **Ignore anti-padrões** | Aprender o que NÃO fazer é valioso |

### Diretrizes de Conteúdo

1. **Comprimento**: 200-500 linhas típico, máximo 800 linhas
2. **Blocos de código**: Inclua identificador de linguagem
3. **Cabeçalhos**: Use hierarquia `##` e `###`
4. **Listas**: Use `-` para desordenadas, `1.` para ordenadas
5. **Tabelas**: Para comparações e referências

---

## Padrões Comuns

### Padrão 1: Skill de Padrões

```markdown
---
name: language-standards
description: Coding standards and best practices for [language].
---

# [Language] Coding Standards

## When to Activate

- Writing [language] code
- Code review
- Setting up linting

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Variables | camelCase | userName |
| Constants | SCREAMING_SNAKE | MAX_RETRY |
| Functions | camelCase | fetchUser |
| Classes | PascalCase | UserService |

## Code Examples

[Include practical examples]

## Linting Setup

[Include configuration]

## Related Skills

- `language-testing`
- `language-security`
```

### Padrão 2: Skill de Fluxo de Trabalho

```markdown
---
name: task-workflow
description: Step-by-step workflow for [task].
---

# [Task] Workflow

## When to Activate

- [Trigger 1]
- [Trigger 2]

## Prerequisites

- [Requirement 1]
- [Requirement 2]

## Steps

### Step 1: [Name]

[Description]

\`\`\`bash
[Commands]
\`\`\`

### Step 2: [Name]

[Description]

## Verification

- [ ] [Check 1]
- [ ] [Check 2]

## Troubleshooting

| Problem | Solution |
|---------|----------|
| [Issue] | [Fix] |
```

### Padrão 3: Skill de Referência

```markdown
---
name: api-reference
description: Quick reference for [API/Library].
---

# [API/Library] Reference

## When to Activate

- Using [API/Library]
- Looking up [API/Library] syntax

## Common Operations

### Operation 1

\`\`\`typescript
// Basic usage
\`\`\`

### Operation 2

\`\`\`typescript
// Advanced usage
\`\`\`

## Configuration

[Include config examples]

## Error Handling

[Include error patterns]
```

---

## Testando Sua Skill

### Teste Local

1. **Copie para o diretório de skills do Claude Code**:
   ```bash
   cp -r skills/your-skill-name ~/.claude/skills/
   ```

2. **Teste com o Claude Code**:
   ```
   Você: "Preciso [tarefa que deve acionar sua skill]"

   O Claude deve referenciar os padrões da sua skill.
   ```

3. **Verifique a ativação**:
   - Peça ao Claude para explicar um conceito da sua skill
   - Verifique se ele usa seus exemplos e padrões
   - Certifique-se de que segue suas diretrizes

### Checklist de Validação

- [ ] **Frontmatter YAML válido** - Sem erros de sintaxe
- [ ] **Nome segue a convenção** - minúsculas-com-hífens
- [ ] **Descrição está clara** - Informa quando usar
- [ ] **Exemplos funcionam** - Código compila e executa
- [ ] **Links válidos** - Skills relacionadas existem
- [ ] **Sem dados sensíveis** - Sem chaves de API, tokens, caminhos

### Teste de Exemplos de Código

Teste todos os exemplos de código:

```bash
# From the repo root
npx tsc --noEmit skills/your-skill-name/examples/*.ts

# Or from inside the skill directory
npx tsc --noEmit examples/*.ts

# From the repo root
python -m py_compile skills/your-skill-name/examples/*.py

# Or from inside the skill directory
python -m py_compile examples/*.py

# From the repo root
go build ./skills/your-skill-name/examples/...

# Or from inside the skill directory
go build ./examples/...
```

---

## Submetendo Sua Skill

### 1. Fork e Clone

```bash
gh repo fork affaan-m/everything-claude-code --clone
cd everything-claude-code
```

### 2. Criar Branch

```bash
git checkout -b feat/skill-your-skill-name
```

### 3. Adicionar Sua Skill

```bash
mkdir -p skills/your-skill-name
# Create SKILL.md
```

### 4. Validar

```bash
# Check YAML frontmatter
head -10 skills/your-skill-name/SKILL.md

# Verify structure
ls -la skills/your-skill-name/

# Run tests if available
npm test
```

### 5. Commit e Push

```bash
git add skills/your-skill-name/
git commit -m "feat(skills): add your-skill-name skill"
git push -u origin feat/skill-your-skill-name
```

### 6. Criar Pull Request

Use este template de PR:

```markdown
## Summary

Brief description of the skill and why it's valuable.

## Skill Type

- [ ] Language standards
- [ ] Framework patterns
- [ ] Workflow
- [ ] Domain knowledge
- [ ] Tool integration

## Testing

How I tested this skill locally.

## Checklist

- [ ] YAML frontmatter valid
- [ ] Code examples tested
- [ ] Follows skill guidelines
- [ ] No sensitive data
- [ ] Clear activation triggers
```

---

## Galeria de Exemplos

### Exemplo 1: Padrões de Linguagem

**Arquivo:** `skills/rust-patterns/SKILL.md`

```markdown
---
name: rust-patterns
description: Rust idioms, ownership patterns, and best practices for safe, idiomatic code.
origin: ECC
---

# Rust Patterns

## When to Activate

- Writing Rust code
- Handling ownership and borrowing
- Error handling with Result/Option
- Implementing traits

## Ownership Patterns

### Borrowing Rules

\`\`\`rust
// PASS: CORRECT: Borrow when you don't need ownership
fn process_data(data: &str) -> usize {
    data.len()
}

// PASS: CORRECT: Take ownership when you need to modify or consume
fn consume_data(data: Vec<u8>) -> String {
    String::from_utf8(data).unwrap()
}
\`\`\`

## Error Handling

### Result Pattern

\`\`\`rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Parse error: {0}")]
    Parse(#[from] std::num::ParseIntError),
}

pub type AppResult<T> = Result<T, AppError>;
\`\`\`

## Related Skills

- `rust-testing`
- `rust-security`
```

### Exemplo 2: Padrões de Framework

**Arquivo:** `skills/fastapi-patterns/SKILL.md`

```markdown
---
name: fastapi-patterns
description: FastAPI patterns for routing, dependency injection, validation, and async operations.
origin: ECC
---

# FastAPI Patterns

## When to Activate

- Building FastAPI applications
- Creating API endpoints
- Implementing dependency injection
- Handling async database operations

## Project Structure

\`\`\`
app/
├── main.py              # FastAPI app entry point
├── routers/             # Route handlers
│   ├── users.py
│   └── items.py
├── models/              # Pydantic models
│   ├── user.py
│   └── item.py
├── services/            # Business logic
│   └── user_service.py
└── dependencies.py      # Shared dependencies
\`\`\`

## Dependency Injection

\`\`\`python
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db)
):
    # Use db session
    pass
\`\`\`

## Related Skills

- `python-patterns`
- `pydantic-validation`
```

### Exemplo 3: Skill de Fluxo de Trabalho

**Arquivo:** `skills/refactoring-workflow/SKILL.md`

```markdown
---
name: refactoring-workflow
description: Systematic refactoring workflow for improving code quality without changing behavior.
origin: ECC
---

# Refactoring Workflow

## When to Activate

- Improving code structure
- Reducing technical debt
- Simplifying complex code
- Extracting reusable components

## Prerequisites

- All tests passing
- Git working directory clean
- Feature branch created

## Workflow Steps

### Step 1: Identify Refactoring Target

- Look for code smells (long methods, duplicate code, large classes)
- Check test coverage for target area
- Document current behavior

### Step 2: Ensure Tests Exist

\`\`\`bash
# Run tests to verify current behavior
npm test

# Check coverage for target files
npm run test:coverage
\`\`\`

### Step 3: Make Small Changes

- One refactoring at a time
- Run tests after each change
- Commit frequently

### Step 4: Verify Behavior Unchanged

\`\`\`bash
# Run full test suite
npm test

# Run E2E tests
npm run test:e2e
\`\`\`

## Common Refactorings

| Smell | Refactoring |
|-------|-------------|
| Long method | Extract method |
| Duplicate code | Extract to shared function |
| Large class | Extract class |
| Long parameter list | Introduce parameter object |

## Checklist

- [ ] Tests exist for target code
- [ ] Made small, focused changes
- [ ] Tests pass after each change
- [ ] Behavior unchanged
- [ ] Committed with clear message
```

---

## Recursos Adicionais

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Diretrizes gerais de contribuição
- [project-guidelines-template](./examples/project-guidelines-template.md) - Template de skill específico do projeto
- [coding-standards](../skills/coding-standards/SKILL.md) - Exemplo de skill de padrões
- [tdd-workflow](../skills/tdd-workflow/SKILL.md) - Exemplo de skill de fluxo de trabalho
- [security-review](../skills/security-review/SKILL.md) - Exemplo de skill de conhecimento de domínio

---

**Lembre-se**: Uma boa skill é focada, acionável e imediatamente útil. Escreva skills que você mesmo gostaria de usar.
