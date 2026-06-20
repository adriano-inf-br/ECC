---
name: ecc-guide
description: Oriente os usuários pelos agents, skills, comandos, hooks, regras, perfis de instalação e onboarding de projeto atuais do ECC, lendo a superfície ativa do repositório antes de responder.
metadata:
  origin: community
---

# ECC Guide

Use esta skill quando um usuário precisar de ajuda para entender, navegar, instalar ou escolher partes do Everything Claude Code.

## Quando Usar

Use esta skill quando o usuário:

- pergunta o que o ECC inclui
- quer ajuda para encontrar uma skill, comando, agent, hook, regra ou perfil de instalação
- é novo no repositório e precisa de um caminho guiado
- pergunta "como faço X com o ECC?"
- pergunta quais componentes do ECC se encaixam em um projeto
- precisa de uma explicação leve de como comandos, skills, agents, hooks e regras se relacionam
- está confuso com caminhos de instalação, instalações duplicadas, reset/desinstalação ou opções de instalação seletiva

## Princípio Central

Responda a partir dos arquivos atuais, não da memória. O ECC muda rapidamente, então contagens de catálogo, listas de recursos e instruções de instalação fixadas no código ficam desatualizadas.

Quando o repositório do ECC estiver disponível, inspecione os arquivos relevantes antes de dar uma resposta concreta:

```bash
node scripts/ci/catalog.js --json
find skills -maxdepth 2 -name SKILL.md | sort
find commands -maxdepth 1 -name '*.md' | sort
find agents -maxdepth 1 -name '*.md' | sort
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --list-components --json
```

Use o menor conjunto de leituras necessário para a pergunta do usuário.

## Mapa do Repositório

- `README.md`: caminhos de instalação, orientação de desinstalação/reset, posicionamento público, FAQs
- `AGENTS.md`: orientação para contribuidores e estrutura do projeto
- `agent.yaml`: superfície de gitagent exportada e lista de comandos
- `commands/`: shims de compatibilidade de slash-command mantidos
- `skills/*/SKILL.md`: fluxos de trabalho reutilizáveis e playbooks de domínio
- `agents/*.md`: prompts de papel de subagent delegado
- `rules/`: regras de linguagem e harness
- `hooks/README.md`, `hooks/hooks.json`, `scripts/hooks/`: comportamento de hooks e gates de segurança
- `manifests/install-*.json`: módulos, componentes, perfis de instalação seletiva e suporte a alvos
- `docs/`: guias de harness, notas de arquitetura, docs traduzidos, docs de release

## Estilo de Resposta

Comece pela resposta, depois dê a próxima ação. A maioria dos usuários não precisa de um despejo completo do catálogo.

Boa forma de primeira resposta:

1. o que usar
2. por que se encaixa
3. arquivo ou comando exato para inspecionar
4. um próximo comando ou pergunta

Evite:

- listar toda skill ou comando por padrão
- repetir grandes seções do README
- recomendar shims de comando aposentados quando existe um caminho skill-first
- afirmar que um componente existe sem verificar o sistema de arquivos
- substituir a orientação de instalação por comandos de cópia manual quando o instalador gerenciado suporta o alvo

## Tarefas Comuns

### Onboarding de Novo Usuário

Dê um menu curto:

- instalar ou resetar o ECC
- escolher skills para um projeto
- entender comandos vs skills
- inspecionar hooks e comportamento de segurança
- executar uma auditoria de harness
- encontrar um fluxo de trabalho específico

Aponte para `README.md` para instalação/reset e para `/project-init` para onboarding específico de projeto.

### Descoberta de Recursos

Para "o que devo usar para X?":

1. Pesquise em `skills/`, `commands/` e `agents/`.
2. Prefira skills como a superfície primária de fluxo de trabalho.
3. Use comandos apenas quando forem um shim de compatibilidade mantido ou um usuário quiser explicitamente comportamento de slash-command.
4. Mencione agents quando a delegação for útil.

Pesquisas úteis:

```bash
rg -n "<query>" skills commands agents docs
find skills -maxdepth 2 -name SKILL.md | sort
```

### Orientação de Instalação

Use caminhos de instalação gerenciados:

```bash
node scripts/install-plan.js --list-profiles
node scripts/install-plan.js --profile minimal --target claude --json
node scripts/install-apply.js --profile minimal --target claude --dry-run
```

Para instalações de skills específicas:

```bash
node scripts/install-plan.js --skills <skill-id> --target claude --json
node scripts/install-apply.js --skills <skill-id> --target claude --dry-run
```

Avise os usuários para não empilhar instalações de plugin e instalações manuais/de perfil completas, a menos que queiram intencionalmente superfícies duplicadas.

### Onboarding de Projeto

Use `/project-init` quando o usuário quiser o ECC configurado para um repositório-alvo. A sequência esperada é:

1. detectar a stack a partir dos arquivos do projeto
2. resolver um plano de instalação em dry-run
3. inspecionar o `CLAUDE.md` existente e os arquivos de configuração
4. perguntar antes de aplicar mudanças
5. manter a orientação gerada mínima e específica ao repositório

### Solução de Problemas

Pergunte primeiro pelo harness-alvo e pelo caminho de instalação, depois inspecione:

- metadados de instalação de plugin
- `.claude/`, `.cursor/`, `.codex/`, `.gemini/`, `.opencode/`, `.codebuddy/`, `.joycode/` ou `.qwen/`
- `hooks/hooks.json`
- arquivos de estado de instalação
- arquivos relevantes de comando/skill

Para a saúde do repositório, sugira:

```bash
npm run harness:audit -- --format text
npm run observability:ready
npm test
```

## Modelos de Saída

### Recomendação Curta

```text
Use <skill-or-command>. It fits because <reason>.

Canonical file: <path>
Verify with: <command>
Next: <one concrete action>
```

### Resultados de Pesquisa

```text
Best matches:
- <path>: <why it matters>
- <path>: <why it matters>

Recommendation: <which one to use first and why>
```

### Resumo do Plano de Instalação

```text
Detected: <stack evidence>
Target: <harness>
Plan: <profile/modules/skills>
Dry run: <command>
Would change: <paths>
Needs approval before apply: <yes/no>
```

## Superfícies Relacionadas

- `/project-init`: plano de onboarding ciente da stack para um repositório-alvo
- `/harness-audit`: scorecard determinístico de prontidão
- `/skill-health`: revisão de qualidade de skill
- `/skill-create`: gerar uma nova skill a partir do histórico local do git
- `/security-scan`: inspecionar a segurança da configuração do Claude/OpenCode
