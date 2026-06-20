---
name: skill-create
description: Analisa o histórico local do git para extrair padrões de código e gerar arquivos SKILL.md. Versão local do Skill Creator GitHub App.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /skill-create - Geração local de skills

Analise o histórico do git do seu repositório para extrair padrões de código e gerar arquivos SKILL.md que ensinam ao Claude as práticas da sua equipe.

## Uso

```bash
/skill-create                    # Analyze current repo
/skill-create --commits 100      # Analyze last 100 commits
/skill-create --output ./skills  # Custom output directory
/skill-create --instincts        # Also generate instincts for continuous-learning-v2
```

## O que ele faz

1. **Analisa o histórico do Git** - Analisa commits, mudanças de arquivos e padrões
2. **Detecta padrões** - Identifica fluxos de trabalho e convenções recorrentes
3. **Gera SKILL.md** - Cria arquivos de skill válidos do Claude Code
4. **Opcionalmente cria instincts** - Para o sistema continuous-learning-v2

## Passos de análise

### Passo 1: Reúna os dados do Git

```bash
# Get recent commits with file changes
git log --oneline -n ${COMMITS:-200} --name-only --pretty=format:"%H|%s|%ad" --date=short

# Get commit frequency by file
git log --oneline -n 200 --name-only | grep -v "^$" | grep -v "^[a-f0-9]" | sort | uniq -c | sort -rn | head -20

# Get commit message patterns
git log --oneline -n 200 | cut -d' ' -f2- | head -50
```

### Passo 2: Detecte padrões

Procure por estes tipos de padrão:

| Padrão | Método de detecção |
|---------|-----------------|
| **Convenções de commit** | Regex nas mensagens de commit (feat:, fix:, chore:) |
| **Co-mudanças de arquivos** | Arquivos que sempre mudam juntos |
| **Sequências de fluxo de trabalho** | Padrões repetidos de mudança de arquivos |
| **Arquitetura** | Estrutura de pastas e convenções de nomenclatura |
| **Padrões de teste** | Localização, nomenclatura e cobertura de arquivos de teste |

### Passo 3: Gere o SKILL.md

Formato de saída:

```markdown
---
name: {repo-name}-patterns
description: Coding patterns extracted from {repo-name}
version: 1.0.0
source: local-git-analysis
analyzed_commits: {count}
---

# {Repo Name} Patterns

## Commit Conventions
{detected commit message patterns}

## Code Architecture
{detected folder structure and organization}

## Workflows
{detected repeating file change patterns}

## Testing Patterns
{detected test conventions}
```

### Passo 4: Gere instincts (se --instincts)

Para integração com continuous-learning-v2:

```yaml
---
id: {repo}-commit-convention
trigger: "when writing a commit message"
confidence: 0.8
domain: git
source: local-repo-analysis
---

# Use Conventional Commits

## Action
Prefix commits with: feat:, fix:, chore:, docs:, test:, refactor:

## Evidence
- Analyzed {n} commits
- {percentage}% follow conventional commit format
```

## Exemplo de saída

Executar `/skill-create` em um projeto TypeScript pode produzir:

```markdown
---
name: my-app-patterns
description: Coding patterns from my-app repository
version: 1.0.0
source: local-git-analysis
analyzed_commits: 150
---

# My App Patterns

## Commit Conventions

This project uses **conventional commits**:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates

## Code Architecture

```
src/
├── components/     # React components (PascalCase.tsx)
├── hooks/          # Custom hooks (use*.ts)
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── services/       # API and external services
```

## Workflows

### Adding a New Component
1. Create `src/components/ComponentName.tsx`
2. Add tests in `src/components/__tests__/ComponentName.test.tsx`
3. Export from `src/components/index.ts`

### Database Migration
1. Modify `src/db/schema.ts`
2. Run `pnpm db:generate`
3. Run `pnpm db:migrate`

## Testing Patterns

- Test files: `__tests__/` directories or `.test.ts` suffix
- Coverage target: 80%+
- Framework: Vitest
```

## Integração com o GitHub App

Para recursos avançados (10k+ commits, compartilhamento em equipe, auto-PRs), use o [Skill Creator GitHub App](https://github.com/apps/skill-creator):

- Instale: [github.com/apps/skill-creator](https://github.com/apps/skill-creator)
- Comente `/skill-creator analyze` em qualquer issue
- Recebe um PR com as skills geradas

## Comandos relacionados

- `/instinct-import` - Importa instincts gerados
- `/instinct-status` - Visualiza instincts aprendidos
- `/evolve` - Agrupa instincts em skills/agents

---

*Parte do [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)*
