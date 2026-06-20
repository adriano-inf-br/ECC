---
name: search-first
description: Fluxo de trabalho de pesquisa antes de codificar. Busca ferramentas, bibliotecas e padrões existentes antes de escrever código personalizado. Invoca o agente pesquisador.
metadata:
  origin: ECC
---

# /search-first — Pesquise Antes de Codificar

Sistematiza o fluxo de trabalho "buscar soluções existentes antes de implementar".

## Gatilho

Use esta skill quando:
- Iniciar um novo recurso que provavelmente já tem soluções existentes
- Adicionar uma dependência ou integração
- O usuário pede "adicionar funcionalidade X" e você está prestes a escrever código
- Antes de criar um novo utilitário, helper ou abstração

## Fluxo de Trabalho

```
┌─────────────────────────────────────────────┐
│  0. VERIFICAÇÃO DE DISPONIBILIDADE DE TOOLS │
│     Verifique os canais de busca antes de   │
│     depender deles; reporte canais pulados  │
├─────────────────────────────────────────────┤
│  1. ANÁLISE DE NECESSIDADE                  │
│     Defina qual funcionalidade é necessária │
│     Identifique restrições de linguagem/    │
│     framework                               │
├─────────────────────────────────────────────┤
│  2. BUSCA PARALELA (agente pesquisador)     │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│     │  npm /   │ │  MCP /   │ │  GitHub / │  │
│     │  PyPI    │ │  Skills  │ │  Web      │  │
│     └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────┤
│  3. AVALIAR                                 │
│     Pontuar candidatos (funcionalidade,     │
│     manutenção, comunidade, docs, licença,  │
│     dependências)                           │
├─────────────────────────────────────────────┤
│  4. DECIDIR                                 │
│     ┌─────────┐  ┌──────────┐  ┌─────────┐  │
│     │ Adotar  │  │ Estender │  │Construir │  │
│     │ como é  │  │ /Envolver│  │Customiz. │  │
│     └─────────┘  └──────────┘  └─────────┘  │
├─────────────────────────────────────────────┤
│  5. IMPLEMENTAR                             │
│     Instalar pacote / Configurar MCP /      │
│     Escrever código customizado mínimo      │
└─────────────────────────────────────────────┘
```

## Matriz de Decisão

| Sinal | Ação |
|--------|--------|
| Correspondência exata, bem mantido, MIT/Apache | **Adotar** — instalar e usar diretamente |
| Correspondência parcial, boa base | **Estender** — instalar + escrever wrapper fino |
| Múltiplas correspondências fracas | **Compor** — combinar 2-3 pacotes pequenos |
| Nada adequado encontrado | **Construir** — escrever customizado, mas informado pela pesquisa |

## Como Usar

### Passo 0: Verificação de Disponibilidade de Tools

Esta é uma orientação para o agente, não um script executável de configuração. Verifique apenas os
canais relevantes para a tarefa e o projeto em questão.

| Canal | Verificar | Se ausente |
|---------|-------|------------|
| Busca no repositório | `rg --files` e consultas `rg` direcionadas | Informe que apenas os arquivos visíveis foram inspecionados |
| Registro de pacotes | `npm --version`, `python -m pip --version` ou gerenciador de pacotes do projeto | Use busca na web/documentação e evite afirmar cobertura do registro |
| GitHub CLI | `gh auth status` | Use apenas a web pública ou o histórico git local |
| Tools MCP/docs | Lista de tools disponíveis ou config MCP local | Use busca na documentação oficial/web como fallback |
| Diretório de Skills | `ls ~/.claude/skills ~/.codex/skills` quando aplicável | Diga que nenhum catálogo local de skills estava disponível |

### Modo Rápido (inline)

Antes de escrever um utilitário ou adicionar funcionalidade, passe mentalmente por:

0. Isso já existe no repositório? → `rg` pelos módulos/testes relevantes primeiro
1. É um problema comum? → Pesquise npm/PyPI
2. Existe um MCP para isso? → Verifique `~/.claude/settings.json` e pesquise
3. Existe uma skill para isso? → Verifique `~/.claude/skills/`
4. Existe uma implementação/template no GitHub? → Execute busca de código no GitHub por OSS mantido antes de escrever código novo

### Modo Completo (agente)

Para funcionalidades não triviais, lance o agente pesquisador:

```
Agent(subagent_type="general-purpose", prompt="
  Pesquise ferramentas existentes para: [DESCRIÇÃO]
  Linguagem/framework: [LANG]
  Restrições: [QUAISQUER]

  Buscar: npm/PyPI, servidores MCP, skills do Claude Code, GitHub
  Retornar: Comparação estruturada com recomendação
")
```

Documentações mais antigas do Claude Code podem chamar isso de `Task(...)`; use o nome
atual da tool de agente/subagente exposta pelo harness ativo.

## Atalhos de Busca por Categoria

### Tooling de Desenvolvimento
- Linting → `eslint`, `ruff`, `textlint`, `markdownlint`
- Formatação → `prettier`, `black`, `gofmt`
- Testes → `jest`, `pytest`, `go test`
- Pre-commit → `husky`, `lint-staged`, `pre-commit`

### Integração com AI/LLM
- Claude SDK → Context7 para documentação mais recente
- Gerenciamento de Prompt → Verificar servidores MCP
- Processamento de documentos → `unstructured`, `pdfplumber`, `mammoth`

### Dados e APIs
- Clientes HTTP → `httpx` (Python), `ky`/`undici` (Node)
- Validação → `zod` (TS), `pydantic` (Python)
- Banco de dados → Verificar servidores MCP primeiro

### Conteúdo e Publicação
- Processamento de Markdown → `remark`, `unified`, `markdown-it`
- Otimização de imagens → `sharp`, `imagemin`

## Pontos de Integração

### Com o agente planner
O planner deve invocar o pesquisador antes da Fase 1 (Revisão de Arquitetura):
- O pesquisador identifica ferramentas disponíveis
- O planner as incorpora no plano de implementação
- Evita "reinventar a roda" no plano

### Com o agente architect
O architect deve consultar o pesquisador para:
- Decisões de stack tecnológica
- Descoberta de padrões de integração
- Arquiteturas de referência existentes

### Com a skill iterative-retrieval
Combine para descoberta progressiva:
- Ciclo 1: Busca ampla (npm, PyPI, MCP)
- Ciclo 2: Avaliar os principais candidatos em detalhes
- Ciclo 3: Testar compatibilidade com as restrições do projeto

## Exemplos

### Exemplo 1: "Adicionar verificação de links quebrados"
```
Necessidade: Verificar arquivos markdown em busca de links quebrados
Busca: npm "markdown dead link checker"
Encontrado: textlint-rule-no-dead-link (pontuação: 9/10)
Ação: ADOTAR — npm install textlint-rule-no-dead-link
Resultado: Zero código customizado, solução testada em campo
```

### Exemplo 2: "Adicionar wrapper de cliente HTTP"
```
Necessidade: Cliente HTTP resiliente com retentativas e tratamento de timeout
Busca: npm "http client retry", PyPI "httpx retry"
Encontrado: got (Node) com plugin de retry, httpx (Python) com retry integrado
Ação: ADOTAR — usar got/httpx diretamente com config de retry
Resultado: Zero código customizado, bibliotecas testadas em produção
```

### Exemplo 3: "Adicionar linter de arquivo de configuração"
```
Necessidade: Validar arquivos de configuração do projeto contra um schema
Busca: npm "config linter schema", "json schema validator cli"
Encontrado: ajv-cli (pontuação: 8/10)
Ação: ADOTAR + ESTENDER — instalar ajv-cli, escrever schema específico do projeto
Resultado: 1 pacote + 1 arquivo de schema, sem lógica de validação customizada
```

## Anti-Padrões

- **Pular direto para o código**: escrever um utilitário sem verificar se já existe
- **Ignorar MCP**: não verificar se um servidor MCP já fornece a capacidade
- **Pular silenciosamente**: reportar "nada encontrado" quando um canal de busca estava indisponível
- **Excesso de customização**: envolver uma biblioteca tão fortemente que ela perde seus benefícios
- **Inchaço de dependências**: instalar um pacote enorme para um recurso pequeno
