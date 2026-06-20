# Guia de Configuração e Uso do Antigravity

O [Antigravity](https://antigravity.dev) da Google é uma IDE de codificação com IA que usa a convenção de diretório `.agent/` para configuração. O ECC oferece suporte de primeira classe ao Antigravity por meio de seu sistema de instalação seletiva.

## Início Rápido

```bash
# Instalar ECC com target Antigravity
./install.sh --target antigravity typescript

# Ou com múltiplos módulos de linguagem
./install.sh --target antigravity typescript python go
```

Isso instala os componentes do ECC no diretório `.agent/` do seu projeto, pronto para o Antigravity utilizar.

## Como o Mapeamento de Instalação Funciona

O ECC remapeia sua estrutura de componentes para corresponder ao layout esperado pelo Antigravity:

| Origem ECC | Destino Antigravity | O que Contém |
|------------|------------------------|------------------|
| `rules/` | `.agent/rules/` | Regras de linguagem e padrões de código (niveladas) |
| `commands/` | `.agent/workflows/` | Comandos de barra se tornam workflows do Antigravity |
| `agents/` | `.agent/skills/` | Definições de agent se tornam skills do Antigravity |

> **Nota sobre `.agents/` vs `.agent/` vs `agents/`**: O instalador lida explicitamente com apenas três caminhos de origem: `rules` → `.agent/rules/`, `commands` → `.agent/workflows/`, e `agents` (sem prefixo de ponto) → `.agent/skills/`. O diretório `.agents/` (com prefixo de ponto) no repositório ECC é um **layout estático** para definições de skills do Codex/Antigravity e configs `openai.yaml` — ele não é mapeado diretamente pelo instalador. Qualquer caminho `.agents/` passa para a operação padrão de scaffold. Se você quiser que o conteúdo de `.agents/skills/` esteja disponível no runtime do Antigravity, você deve copiá-lo manualmente para `.agent/skills/`.

### Principais Diferenças em Relação ao Claude Code

- **As regras são niveladas**: o Claude Code aninha as regras em subdiretórios (`rules/common/`, `rules/typescript/`). O Antigravity espera um diretório `rules/` plano — o instalador cuida disso automaticamente.
- **Comandos se tornam workflows**: os arquivos `/command` do ECC vão para `.agent/workflows/`, que é o equivalente do Antigravity aos comandos de barra.
- **Agents se tornam skills**: as definições de agent do ECC mapeiam para `.agent/skills/`, onde o Antigravity busca configurações de skills.

## Estrutura de Diretórios Após a Instalação

```
seu-projeto/
├── .agent/
│   ├── rules/
│   │   ├── coding-standards.md
│   │   ├── testing.md
│   │   ├── security.md
│   │   └── typescript.md          # regras específicas de linguagem
│   ├── workflows/
│   │   ├── plan.md
│   │   ├── code-review.md
│   │   ├── tdd.md
│   │   └── ...
│   ├── skills/
│   │   ├── planner.md
│   │   ├── code-reviewer.md
│   │   ├── tdd-guide.md
│   │   └── ...
│   └── ecc-install-state.json     # rastreia o que o ECC instalou
```

## A Config de Agent `openai.yaml`

Cada diretório de skill em `.agents/skills/` contém um arquivo `agents/openai.yaml` no caminho `.agents/skills/<nome-da-skill>/agents/openai.yaml` que configura a skill para o Antigravity:

```yaml
interface:
  display_name: "API Design"
  short_description: "REST API design patterns and best practices"
  brand_color: "#F97316"
  default_prompt: "Design REST API: resources, status codes, pagination"
policy:
  allow_implicit_invocation: true
```

| Campo | Propósito |
|-------|---------|
| `display_name` | Nome legível por humanos exibido na UI do Antigravity |
| `short_description` | Breve descrição do que a skill faz |
| `brand_color` | Cor hexadecimal para o emblema visual da skill |
| `default_prompt` | Prompt sugerido quando a skill é invocada manualmente |
| `allow_implicit_invocation` | Quando `true`, o Antigravity pode ativar a skill automaticamente com base no contexto |

## Gerenciando Sua Instalação

### Verificar o que Está Instalado

```bash
node scripts/list-installed.js --target antigravity
```

### Reparar uma Instalação com Problemas

```bash
# Primeiro, diagnosticar o que está errado
node scripts/doctor.js --target antigravity

# Em seguida, restaurar arquivos ausentes ou desviados
node scripts/repair.js --target antigravity
```

### Desinstalar

```bash
node scripts/uninstall.js --target antigravity
```

### Estado da Instalação

O instalador grava `.agent/ecc-install-state.json` para rastrear quais arquivos o ECC é proprietário. Isso permite desinstalação e reparo seguros — o ECC nunca tocará em arquivos que não criou.

## Adicionando Skills Personalizadas para o Antigravity

Se você está contribuindo com uma nova skill e quer que ela esteja disponível no Antigravity:

1. Crie a skill em `skills/nome-da-sua-skill/SKILL.md` normalmente
2. Adicione uma definição de agent em `agents/nome-da-sua-skill.md` — este é o caminho que o instalador mapeia para `.agent/skills/` em runtime, tornando sua skill disponível no harness do Antigravity
3. Adicione a config de agent do Antigravity em `.agents/skills/nome-da-sua-skill/agents/openai.yaml` — este é um layout estático de repositório consumido pelo Codex para metadados de invocação implícita
4. Espelhe o conteúdo do `SKILL.md` para `.agents/skills/nome-da-sua-skill/SKILL.md` — esta cópia estática é usada pelo Codex e serve como referência para o Antigravity
5. Mencione no seu PR que você adicionou suporte ao Antigravity

> **Distinção importante**: O instalador implanta `agents/` (sem ponto) → `.agent/skills/` — isso é o que torna as skills disponíveis em runtime. O diretório `.agents/` (com prefixo de ponto) é um layout estático separado para configs `openai.yaml` do Codex e não é implantado automaticamente pelo instalador.

Veja [CONTRIBUTING.md](../CONTRIBUTING.md) para o guia completo de contribuição.

## Comparação com Outros Targets

| Funcionalidade | Claude Code | Cursor | Codex | Antigravity |
|---------|-------------|--------|-------|-------------|
| Target de instalação | `claude-home` | `cursor-project` | `codex-home` | `antigravity` |
| Raiz da config | `~/.claude/` | `.cursor/` | `~/.codex/` | `.agent/` |
| Escopo | Nível de usuário | Nível de projeto | Nível de usuário | Nível de projeto |
| Formato de regras | Diretórios aninhados | Plano | Plano | Plano |
| Comandos | `commands/` | N/A | N/A | `workflows/` |
| Agents/Skills | `agents/` | N/A | N/A | `skills/` |
| Estado de instalação | `ecc-install-state.json` | `ecc-install-state.json` | `ecc-install-state.json` | `ecc-install-state.json` |

## Solução de Problemas

### Skills não carregando no Antigravity

- Verifique se o diretório `.agent/` existe na raiz do seu projeto (não no diretório home)
- Verifique se `ecc-install-state.json` foi criado — se estiver ausente, execute o instalador novamente
- Certifique-se de que os arquivos têm extensão `.md` e frontmatter válido

### Regras não sendo aplicadas

- As regras devem estar em `.agent/rules/`, não aninhadas em subdiretórios
- Execute `node scripts/doctor.js --target antigravity` para verificar a instalação

### Workflows não disponíveis

- O Antigravity busca workflows em `.agent/workflows/`, não em `commands/`
- Se você copiou comandos do ECC manualmente, renomeie o diretório

## Recursos Relacionados

- [Arquitetura de Instalação Seletiva](./SELECTIVE-INSTALL-ARCHITECTURE.md) — como o sistema de instalação funciona internamente
- [Design de Instalação Seletiva](./SELECTIVE-INSTALL-DESIGN.md) — decisões de design e contratos de adaptadores de target
- [CONTRIBUTING.md](../CONTRIBUTING.md) — como contribuir com skills, agents e comandos
