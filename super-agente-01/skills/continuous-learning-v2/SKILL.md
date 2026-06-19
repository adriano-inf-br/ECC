---
name: continuous-learning-v2
description: Sistema de aprendizado baseado em instintos que observa sessões via hooks, cria instintos atômicos com pontuação de confiança e os evolui para skills/comandos/agents. A v2.1 adiciona instintos com escopo de projeto para evitar contaminação entre projetos.
metadata:
  origin: ECC
version: 2.1.0
---

# Continuous Learning v2.1 - Arquitetura Baseada
-em Instintos

Um sistema de aprendizado avançado que transforma suas sessões do Claude Code em conhecimento reutilizável por meio de "instintos" atômicos — pequenos comportamentos aprendidos com pontuação de confiança.

**v2.1** adiciona **instintos com escopo de projeto** — padrões de React ficam no seu projeto React, convenções de Python ficam no seu projeto Python, e padrões universais (como "sempre validar entrada") são compartilhados globalmente.

## Quando Ativar

- Configurar o aprendizado automático a partir de sessões do Claude Code
- Configurar a extração de comportamentos baseada em instintos via hooks
- Ajustar limiares de confiança para comportamentos aprendidos
- Revisar, exportar ou importar bibliotecas de instintos
- Evoluir instintos para skills, comandos ou agents completos
- Gerenciar instintos com escopo de projeto vs globais
- Promover instintos do escopo de projeto para o escopo global

## Novidades na v2.1

| Recurso | v2.0 | v2.1 |
|---------|------|------|
| Armazenamento | Global (`~/.claude/homunculus/`) | Escopo de projeto (`${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects/<hash>/`) |
| Escopo | Todos os instintos se aplicam em todo lugar | Escopo de projeto + global |
| Detecção | Nenhuma | URL do remote git / caminho do repo |
| Promoção | N/A | Projeto → global quando visto em 2+ projetos |
| Comandos | 4 (status/evolve/export/import) | 6 (+promote/projects) |
| Entre projetos | Risco de contaminação | Isolado por padrão |

## Novidades na v2 (vs v1)

| Recurso | v1 | v2 |
|---------|----|----|
| Observação | Hook Stop (fim de sessão) | PreToolUse/PostToolUse (100% confiável) |
| Análise | Contexto principal | Agent em segundo plano (Haiku) |
| Granularidade | Skills completas | "Instintos" atômicos |
| Confiança | Nenhuma | Ponderada de 0.3 a 0.9 |
| Evolução | Direto para skill | Instintos -> cluster -> skill/comando/agent |
| Compartilhamento | Nenhum | Exportar/importar instintos |

## O Modelo de Instinto

Um instinto é um pequeno comportamento aprendido:

```yaml
---
id: prefer-functional-style
trigger: "when writing new functions"
confidence: 0.7
domain: "code-style"
source: "session-observation"
scope: project
project_id: "a1b2c3d4e5f6"
project_name: "my-react-app"
---

# Prefer Functional Style

## Action
Use functional patterns over classes when appropriate.

## Evidence
- Observed 5 instances of functional pattern preference
- User corrected class-based approach to functional on 2025-01-15
```

**Propriedades:**
- **Atômico** -- um gatilho, uma ação
- **Ponderado por confiança** -- 0.3 = tentativo, 0.9 = quase certo
- **Marcado por domínio** -- code-style, testing, git, debugging, workflow, etc.
- **Lastreado em evidências** -- rastreia quais observações o criaram
- **Ciente de escopo** -- `project` (padrão) ou `global`

## Como Funciona

```
Atividade de Sessão (em um repositório git)
      |
      | Hooks capturam prompts + uso de tools (100% confiável)
      | + detectam o contexto do projeto (remote git / caminho do repo)
      v
+---------------------------------------------+
|  projects/<project-hash>/observations.jsonl  |
|   (prompts, chamadas de tool, resultados, projeto)   |
+---------------------------------------------+
      |
      | O agent observer lê (em segundo plano, Haiku)
      v
+---------------------------------------------+
|          DETECÇÃO DE PADRÕES                 |
|   * Correções do usuário -> instinto         |
|   * Resoluções de erro -> instinto           |
|   * Fluxos de trabalho repetidos -> instinto |
|   * Decisão de escopo: projeto ou global?    |
+---------------------------------------------+
      |
      | Cria/atualiza
      v
+---------------------------------------------+
|  projects/<project-hash>/instincts/personal/ |
|   * prefer-functional.yaml (0.7) [project]   |
|   * use-react-hooks.yaml (0.9) [project]     |
+---------------------------------------------+
|  instincts/personal/  (GLOBAL)               |
|   * always-validate-input.yaml (0.85) [global]|
|   * grep-before-edit.yaml (0.6) [global]     |
+---------------------------------------------+
      |
      | /evolve agrupa em clusters + /promote
      v
+---------------------------------------------+
|  projects/<hash>/evolved/ (escopo de projeto)   |
|  evolved/ (global)                           |
|   * commands/new-feature.md                  |
|   * skills/testing-workflow.md               |
|   * agents/refactor-specialist.md            |
+---------------------------------------------+
```

## Detecção de Projeto

O sistema detecta automaticamente seu projeto atual:

1. **Variável de ambiente `CLAUDE_PROJECT_DIR`** (prioridade máxima)
2. **`git remote get-url origin`** -- transformado em hash para criar um ID de projeto portável (o mesmo repo em máquinas diferentes recebe o mesmo ID)
3. **`git rev-parse --show-toplevel`** -- fallback usando o caminho do repo (específico da máquina)
4. **Fallback global** -- se nenhum projeto for detectado, os instintos vão para o escopo global

Cada projeto recebe um ID de hash de 12 caracteres (ex.: `a1b2c3d4e5f6`). Um arquivo de registro em `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/projects.json` mapeia IDs para nomes legíveis.

### Diretório de Dados

O continuous-learning-v2 armazena os dados do observer fora de `~/.claude` para que o guarda de caminhos sensíveis do Claude Code não bloqueie gravações de instintos em segundo plano:

1. `CLV2_HOMUNCULUS_DIR` quando definido como um caminho absoluto
2. `$XDG_DATA_HOME/ecc-homunculus`
3. `$HOME/.local/share/ecc-homunculus`

Usuários existentes com dados em `~/.claude/homunculus` podem migrar uma vez:

```bash
bash skills/continuous-learning-v2/scripts/migrate-homunculus.sh
```

## Início Rápido

### 1. Habilite os Hooks de Observação

**Se instalado como um plugin** (recomendado):

Nenhum bloco de hook extra em `settings.json` é necessário. O Claude Code v2.1+ carrega automaticamente o `hooks/hooks.json` do plugin, e o `observe.sh` já está registrado ali.

Se você copiou anteriormente o `observe.sh` para `~/.claude/settings.json`, remova esse bloco `PreToolUse` / `PostToolUse` duplicado. Duplicar o hook do plugin causa execução dupla e erros de resolução de `${CLAUDE_PLUGIN_ROOT}`, pois essa variável só está disponível dentro de entradas de `hooks/hooks.json` gerenciadas pelo plugin.

**Se instalado manualmente** em `~/.claude/skills`, adicione isto ao seu `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning-v2/hooks/observe.sh"
      }]
    }]
  }
}
```

### 2. Inicialize a Estrutura de Diretórios

O sistema cria os diretórios automaticamente no primeiro uso, mas você também pode criá-los manualmente:

```bash
# Global directories
mkdir -p "${XDG_DATA_HOME:-$HOME/.local/share}/ecc-homunculus"/{instincts/{personal,inherited},evolved/{agents,skills,commands},projects}

# Project directories are auto-created when the hook first runs in a git repo
```

### 3. Use os Comandos de Instinto

```bash
/instinct-status     # Mostra os instintos aprendidos (projeto + global)
/evolve              # Agrupa instintos relacionados em skills/comandos
/instinct-export     # Exporta instintos para arquivo
/instinct-import     # Importa instintos de outras pessoas
/promote             # Promove instintos do projeto para o escopo global
/projects            # Lista todos os projetos conhecidos e suas contagens de instintos
```

## Comandos

| Comando | Descrição |
|---------|-------------|
| `/instinct-status` | Mostra todos os instintos (escopo de projeto + global) com confiança |
| `/evolve` | Agrupa instintos relacionados em skills/comandos, sugere promoções |
| `/instinct-export` | Exporta instintos (filtráveis por escopo/domínio) |
| `/instinct-import <file>` | Importa instintos com controle de escopo |
| `/promote [id]` | Promove instintos do projeto para o escopo global |
| `/projects` | Lista todos os projetos conhecidos e suas contagens de instintos |

## Configuração

Edite `config.json` para controlar o observer em segundo plano:

```json
{
  "version": "2.1",
  "observer": {
    "enabled": false,
    "run_interval_minutes": 5,
    "min_observations_to_analyze": 20
  }
}
```

| Chave | Padrão | Descrição |
|-----|---------|-------------|
| `observer.enabled` | `false` | Habilita o agent observer em segundo plano |
| `observer.run_interval_minutes` | `5` | Com que frequência o observer analisa as observações |
| `observer.min_observations_to_analyze` | `20` | Observações mínimas antes de a análise rodar |

Outros comportamentos (captura de observações, limiares de instinto, escopo de projeto, critérios de promoção) são configurados por padrões de código em `instinct-cli.py` e `observe.sh`.

## Estrutura de Arquivos

```
${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus/
+-- identity.json           # Seu perfil, nível técnico
+-- projects.json           # Registro: hash do projeto -> nome/caminho/remote
+-- observations.jsonl      # Observações globais (fallback)
+-- instincts/
|   +-- personal/           # Instintos globais aprendidos automaticamente
|   +-- inherited/          # Instintos globais importados
+-- evolved/
|   +-- agents/             # Agents globais gerados
|   +-- skills/             # Skills globais geradas
|   +-- commands/           # Comandos globais gerados
+-- projects/
    +-- a1b2c3d4e5f6/       # Hash do projeto (a partir da URL do remote git)
    |   +-- project.json    # Espelho de metadados por projeto (id/name/root/remote)
    |   +-- observations.jsonl
    |   +-- observations.archive/
    |   +-- instincts/
    |   |   +-- personal/   # Aprendidos automaticamente, específicos do projeto
    |   |   +-- inherited/  # Importados, específicos do projeto
    |   +-- evolved/
    |       +-- skills/
    |       +-- commands/
    |       +-- agents/
    +-- f6e5d4c3b2a1/       # Outro projeto
        +-- ...
```

## Guia de Decisão de Escopo

| Tipo de Padrão | Escopo | Exemplos |
|-------------|-------|---------|
| Convenções de linguagem/framework | **project** | "Use React hooks", "Follow Django REST patterns" |
| Preferências de estrutura de arquivos | **project** | "Tests in `__tests__`/", "Components in src/components/" |
| Estilo de código | **project** | "Use functional style", "Prefer dataclasses" |
| Estratégias de tratamento de erros | **project** | "Use Result type for errors" |
| Práticas de segurança | **global** | "Validate user input", "Sanitize SQL" |
| Boas práticas gerais | **global** | "Write tests first", "Always handle errors" |
| Preferências de fluxo de trabalho de tools | **global** | "Grep before Edit", "Read before Write" |
| Práticas de git | **global** | "Conventional commits", "Small focused commits" |

## Promoção de Instinto (Projeto -> Global)

Quando o mesmo instinto aparece em múltiplos projetos com alta confiança, ele é um candidato à promoção para o escopo global.

**Critérios de promoção automática:**
- Mesmo ID de instinto em 2+ projetos
- Confiança média >= 0.8

**Como promover:**

```bash
# Promove um instinto específico
python3 instinct-cli.py promote prefer-explicit-errors

# Promove automaticamente todos os instintos qualificados
python3 instinct-cli.py promote

# Pré-visualiza sem alterações
python3 instinct-cli.py promote --dry-run
```

O comando `/evolve` também sugere candidatos à promoção.

## Pontuação de Confiança

A confiança evolui ao longo do tempo:

| Pontuação | Significado | Comportamento |
|-------|---------|----------|
| 0.3 | Tentativo | Sugerido mas não imposto |
| 0.5 | Moderado | Aplicado quando relevante |
| 0.7 | Forte | Aprovado automaticamente para aplicação |
| 0.9 | Quase certo | Comportamento central |

**A confiança aumenta** quando:
- O padrão é observado repetidamente
- O usuário não corrige o comportamento sugerido
- Instintos semelhantes de outras fontes concordam

**A confiança diminui** quando:
- O usuário corrige explicitamente o comportamento
- O padrão não é observado por períodos prolongados
- Surgem evidências contraditórias

## Por Que Hooks vs Skills para Observação?

> "A v1 dependia de skills para observar. Skills são probabilísticas -- elas disparam ~50-80% das vezes com base no julgamento do Claude."

Hooks disparam **100% das vezes**, de forma determinística. Isso significa:
- Toda chamada de tool é observada
- Nenhum padrão é perdido
- O aprendizado é abrangente

## Compatibilidade Retroativa

A v2.1 é totalmente compatível com a v2.0 e a v1:
- Instintos globais existentes podem ser migrados de `~/.claude/homunculus/instincts/` com `scripts/migrate-homunculus.sh`
- Skills existentes em `~/.claude/skills/learned/` da v1 continuam funcionando
- O hook Stop ainda roda (mas agora também alimenta a v2)
- Migração gradual: rode ambos em paralelo

## Privacidade

- As observações permanecem **locais** na sua máquina
- Instintos com escopo de projeto são isolados por projeto
- Apenas **instintos** (padrões) podem ser exportados — não observações brutas
- Nenhum código real ou conteúdo de conversa é compartilhado
- Você controla o que é exportado e promovido

## Relacionados

- [ECC-Tools GitHub App](https://github.com/apps/ecc-tools) - Gere instintos a partir do histórico do repo
- Homunculus - Projeto da comunidade que inspirou a arquitetura baseada em instintos da v2 (observações atômicas, pontuação de confiança, pipeline de evolução de instintos)
- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Seção de aprendizado contínuo

---

*Aprendizado baseado em instintos: ensinando ao Claude os seus padrões, um projeto de cada vez.*
