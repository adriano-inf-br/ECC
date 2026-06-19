---
name: plankton-code-quality
description: "Aplicação de qualidade de código em tempo de escrita usando Plankton — formatação automática, linting e correções via Claude em cada edição de arquivo através de hooks."
metadata:
  origin: community
---

# Skill de Qualidade de Código Plankton

Referência de integração para o Plankton (crédito: @alxfazio), um sistema de aplicação de qualidade de código em tempo de escrita para o Claude Code. O Plankton executa formatadores e linters em cada edição de arquivo via hooks PostToolUse, em seguida gera subprocessos Claude para corrigir violações que o agent não capturou.

## Quando Usar

- Você quer formatação e linting automáticos em cada edição de arquivo (não apenas no momento do commit)
- Você precisa de defesa contra agents que modificam configurações do linter para passar em vez de corrigir o código
- Você quer roteamento de modelo em camadas para correções (Haiku para estilo simples, Sonnet para lógica, Opus para tipos)
- Você trabalha com múltiplas linguagens (Python, TypeScript, Shell, YAML, JSON, TOML, Markdown, Dockerfile)

## Como Funciona

### Arquitetura em Três Fases

Toda vez que o Claude Code edita ou escreve um arquivo, o hook PostToolUse `multi_linter.sh` do Plankton é executado:

```
Fase 1: Auto-Formatação (Silenciosa)
├─ Executa formatadores (ruff format, biome, shfmt, taplo, markdownlint)
├─ Corrige 40-50% dos problemas silenciosamente
└─ Sem saída para o agent principal

Fase 2: Coletar Violações (JSON)
├─ Executa linters e coleta violações não corrigíveis
├─ Retorna JSON estruturado: {line, column, code, message, linter}
└─ Ainda sem saída para o agent principal

Fase 3: Delegar + Verificar
├─ Gera subprocesso claude -p com JSON de violações
├─ Roteia para camada de modelo com base na complexidade da violação:
│   ├─ Haiku: formatação, imports, estilo (códigos E/W/F) — timeout 120s
│   ├─ Sonnet: complexidade, refatoração (códigos C901, PLR) — timeout 300s
│   └─ Opus: sistema de tipos, raciocínio profundo (unresolved-attribute) — timeout 600s
├─ Re-executa Fases 1+2 para verificar as correções
└─ Exit 0 se limpo, Exit 2 se violações permanecerem (reportado ao agent principal)
```

### O que o Agent Principal Vê

| Cenário | Agent vê | Exit do hook |
|----------|-----------|-----------|
| Sem violações | Nada | 0 |
| Tudo corrigido pelo subprocesso | Nada | 0 |
| Violações permanecem após o subprocesso | `[hook] N violation(s) remain` | 2 |
| Aviso (duplicatas, ferramentas antigas) | `[hook:advisory] ...` | 0 |

O agent principal só vê problemas que o subprocesso não conseguiu corrigir. A maioria dos problemas de qualidade é resolvida de forma transparente.

### Proteção de Configuração (Defesa Contra Manipulação de Regras)

LLMs modificarão `.ruff.toml` ou `biome.json` para desabilitar regras em vez de corrigir o código. O Plankton bloqueia isso com três camadas:

1. **Hook PreToolUse** — `protect_linter_configs.sh` bloqueia edições em todas as configurações de linter antes que aconteçam
2. **Hook Stop** — `stop_config_guardian.sh` detecta alterações de configuração via `git diff` no final da sessão
3. **Lista de arquivos protegidos** — `.ruff.toml`, `biome.json`, `.shellcheckrc`, `.yamllint`, `.hadolint.yaml`, e outros

### Aplicação do Gerenciador de Pacotes

Um hook PreToolUse em Bash bloqueia gerenciadores de pacotes legados:
- `pip`, `pip3`, `poetry`, `pipenv` → Bloqueados (use `uv`)
- `npm`, `yarn`, `pnpm` → Bloqueados (use `bun`)
- Exceções permitidas: `npm audit`, `npm view`, `npm publish`

## Configuração

### Início Rápido

> **Nota:** O Plankton requer instalação manual a partir do seu repositório. Revise o código antes de instalar.

```bash
# Instalar dependências principais
brew install jaq ruff uv

# Instalar linters Python
uv sync --all-extras

# Iniciar o Claude Code — os hooks são ativados automaticamente
claude
```

Sem comando de instalação, sem configuração de plugin. Os hooks em `.claude/settings.json` são capturados automaticamente quando você executa o Claude Code no diretório do Plankton.

### Integração por Projeto

Para usar os hooks do Plankton em seu próprio projeto:

1. Copie o diretório `.claude/hooks/` para o seu projeto
2. Copie a configuração de hooks `.claude/settings.json`
3. Copie os arquivos de configuração do linter (`.ruff.toml`, `biome.json`, etc.)
4. Instale os linters para as suas linguagens

### Dependências Específicas por Linguagem

| Linguagem | Obrigatório | Opcional |
|----------|----------|----------|
| Python | `ruff`, `uv` | `ty` (tipos), `vulture` (código morto), `bandit` (segurança) |
| TypeScript/JS | `biome` | `oxlint`, `semgrep`, `knip` (exports mortos) |
| Shell | `shellcheck`, `shfmt` | — |
| YAML | `yamllint` | — |
| Markdown | `markdownlint-cli2` | — |
| Dockerfile | `hadolint` (>= 2.12.0) | — |
| TOML | `taplo` | — |
| JSON | `jaq` | — |

## Combinação com ECC

### Complementar, Não Sobreposto

| Preocupação | ECC | Plankton |
|---------|-----|----------|
| Aplicação de qualidade de código | Hooks PostToolUse (Prettier, tsc) | Hooks PostToolUse (20+ linters + correções por subprocesso) |
| Varredura de segurança | AgentShield, agent security-reviewer | Bandit (Python), Semgrep (TypeScript) |
| Proteção de configuração | — | Bloqueios PreToolUse + detecção por hook Stop |
| Gerenciador de pacotes | Detecção + configuração | Aplicação (bloqueia gerenciadores legados) |
| Integração CI | — | Hooks de pre-commit para git |
| Roteamento de modelo | Manual (`/model opus`) | Automático (complexidade da violação → camada) |

### Combinação Recomendada

1. Instale o ECC como seu plugin (agents, skills, commands, rules)
2. Adicione os hooks do Plankton para aplicação de qualidade em tempo de escrita
3. Use o AgentShield para auditorias de segurança
4. Use o loop de verificação do ECC como portão final antes de PRs

### Evitando Conflitos de Hook

Se estiver executando tanto os hooks do ECC quanto os do Plankton:
- O hook Prettier do ECC e o formatador biome do Plankton podem conflitar em arquivos JS/TS
- Resolução: desabilite o hook PostToolUse do Prettier do ECC ao usar o Plankton (o biome do Plankton é mais abrangente)
- Ambos podem coexistir em diferentes tipos de arquivo (o ECC cuida do que o Plankton não cobre)

## Referência de Configuração

O `.claude/hooks/config.json` do Plankton controla todo o comportamento:

```json
{
  "languages": {
    "python": true,
    "shell": true,
    "yaml": true,
    "json": true,
    "toml": true,
    "dockerfile": true,
    "markdown": true,
    "typescript": {
      "enabled": true,
      "js_runtime": "auto",
      "biome_nursery": "warn",
      "semgrep": true
    }
  },
  "phases": {
    "auto_format": true,
    "subprocess_delegation": true
  },
  "subprocess": {
    "tiers": {
      "haiku":  { "timeout": 120, "max_turns": 10 },
      "sonnet": { "timeout": 300, "max_turns": 10 },
      "opus":   { "timeout": 600, "max_turns": 15 }
    },
    "volume_threshold": 5
  }
}
```

**Configurações chave:**
- Desabilite linguagens que você não usa para acelerar os hooks
- `volume_threshold` — violações acima desta contagem escalam automaticamente para uma camada de modelo superior
- `subprocess_delegation: false` — ignora a Fase 3 completamente (apenas reporta violações)

## Substituições de Ambiente

| Variável | Finalidade |
|----------|---------|
| `HOOK_SKIP_SUBPROCESS=1` | Ignorar Fase 3, reportar violações diretamente |
| `HOOK_SUBPROCESS_TIMEOUT=N` | Substituir timeout da camada |
| `HOOK_DEBUG_MODEL=1` | Registrar decisões de seleção de modelo |
| `HOOK_SKIP_PM=1` | Ignorar aplicação do gerenciador de pacotes |

## Referências

- Plankton (crédito: @alxfazio)
- Plankton REFERENCE.md — Documentação completa da arquitetura (crédito: @alxfazio)
- Plankton SETUP.md — Guia de instalação detalhado (crédito: @alxfazio)

## Adições do ECC v1.8

### Perfil de Hook Copiável

Definir comportamento de qualidade rigoroso:

```bash
export ECC_HOOK_PROFILE=strict
export ECC_QUALITY_GATE_FIX=true
export ECC_QUALITY_GATE_STRICT=true
```

### Tabela de Portão de Linguagem

- TypeScript/JavaScript: Biome preferido, Prettier como fallback
- Python: Ruff format/check
- Go: gofmt

### Guarda de Adulteração de Configuração

Durante a aplicação de qualidade, sinalize alterações nos arquivos de configuração na mesma iteração:

- `biome.json`, `.eslintrc*`, `prettier.config*`, `tsconfig.json`, `pyproject.toml`

Se a configuração for alterada para suprimir violações, exija revisão explícita antes do merge.

### Padrão de Integração CI

Use os mesmos comandos no CI que nos hooks locais:

1. executar verificações do formatador
2. executar verificações de lint/tipo
3. falhar rapidamente no modo strict
4. publicar resumo de remediação

### Métricas de Saúde

Acompanhe:
- edições sinalizadas pelos portões
- tempo médio de remediação
- violações repetidas por categoria
- bloqueios de merge por falhas de portão
