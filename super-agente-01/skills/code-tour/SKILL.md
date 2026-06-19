---
name: code-tour
description: Crie arquivos `.tour` do CodeTour — passo a passos direcionados a personas, com âncoras reais de arquivo e linha. Use para tours de onboarding, walkthroughs de arquitetura, tours de PR, tours de RCA e pedidos estruturados de "explique como isto funciona".
metadata:
  origin: ECC
---

# Code Tour

Crie arquivos `.tour` do **CodeTour** para walkthroughs de código que abrem diretamente em arquivos e intervalos de linha reais. Os tours ficam em `.tours/` e são destinados ao formato CodeTour, não a notas Markdown ad hoc.

Um bom tour é uma narrativa para um leitor específico:
- o que ele está vendo
- por que isso importa
- qual caminho ele deve seguir em seguida

Crie apenas arquivos JSON `.tour`. Não modifique o código-fonte como parte desta skill.

## When to Use

Use esta skill quando:
- o usuário pede um code tour, tour de onboarding, walkthrough de arquitetura ou tour de PR
- o usuário diz "explique como X funciona" e quer um artefato guiado reutilizável
- o usuário quer um caminho de ramp-up para um novo engenheiro ou revisor
- a tarefa é melhor atendida por uma sequência guiada do que por um resumo plano

Exemplos:
- onboarding de um novo mantenedor
- tour de arquitetura para um serviço ou pacote
- walkthrough de revisão de PR ancorado nos arquivos alterados
- tour de RCA mostrando o caminho da falha
- tour de revisão de segurança das fronteiras de confiança e verificações-chave

## When NOT to Use

| Em vez de code-tour | Use |
| --- | --- |
| Uma explicação pontual no chat é suficiente | responda diretamente |
| O usuário quer documentação em prosa, não um artefato `.tour` | `documentation-lookup` ou edição de docs do repositório |
| A tarefa é implementação ou refatoração | faça o trabalho de implementação |
| A tarefa é onboarding amplo do código sem um artefato de tour | `codebase-onboarding` |

## Fluxo de trabalho

### 1. Descobrir

Explore o repositório antes de escrever qualquer coisa:
- README e pontos de entrada de pacote/app
- estrutura de pastas
- arquivos de configuração relevantes
- os arquivos alterados, se o tour é focado em PR

Não comece a escrever passos antes de entender o formato do código.

### 2. Inferir o leitor

Decida a persona e a profundidade a partir do pedido.

| Formato do pedido | Persona | Profundidade sugerida |
| --- | --- | --- |
| "onboarding", "new joiner" | `new-joiner` | 9-13 passos |
| "quick tour", "vibe check" | `vibecoder` | 5-8 passos |
| "architecture" | `architect` | 14-18 passos |
| "tour this PR" | `pr-reviewer` | 7-11 passos |
| "why did this break" | `rca-investigator` | 7-11 passos |
| "security review" | `security-reviewer` | 7-11 passos |
| "explain how this feature works" | `feature-explainer` | 7-11 passos |
| "debug this path" | `bug-fixer` | 7-11 passos |

### 3. Ler e verificar âncoras

Todo caminho de arquivo e âncora de linha deve ser real:
- confirme que o arquivo existe
- confirme que os números de linha estão no intervalo
- se usar uma seleção, verifique o bloco exato
- se o arquivo é volátil, prefira uma âncora baseada em padrão

Nunca adivinhe números de linha.

### 4. Escrever o `.tour`

Escreva em:

```text
.tours/<persona>-<focus>.tour
```

Mantenha o caminho determinístico e legível.

### 5. Validar

Antes de finalizar:
- todo caminho referenciado existe
- toda linha ou seleção é válida
- o primeiro passo está ancorado em um arquivo ou diretório real
- o tour conta uma história coerente em vez de listar arquivos

## Tipos de Passo

### Content

Use com moderação, geralmente apenas para um passo de encerramento:

```json
{ "title": "Next Steps", "description": "You can now trace the request path end to end." }
```

Não faça o primeiro passo ser somente conteúdo.

### Directory

Use para orientar o leitor sobre um módulo:

```json
{ "directory": "src/services", "title": "Service Layer", "description": "The core orchestration logic lives here." }
```

### File + line

Este é o tipo de passo padrão:

```json
{ "file": "src/auth/middleware.ts", "line": 42, "title": "Auth Gate", "description": "Every protected request passes here first." }
```

### Selection

Use quando um bloco de código importa mais do que o arquivo inteiro:

```json
{
  "file": "src/core/pipeline.ts",
  "selection": {
    "start": { "line": 15, "character": 0 },
    "end": { "line": 34, "character": 0 }
  },
  "title": "Request Pipeline",
  "description": "This block wires validation, auth, and downstream execution."
}
```

### Pattern

Use quando as linhas exatas podem mudar de posição:

```json
{ "file": "src/app.ts", "pattern": "export default class App", "title": "Application Entry" }
```

### URI

Use para PRs, issues ou docs quando for útil:

```json
{ "uri": "https://github.com/org/repo/pull/456", "title": "The PR" }
```

## Regra de Escrita: SMIG

Cada descrição deve responder:
- **Situation**: o que o leitor está vendo
- **Mechanism**: como funciona
- **Implication**: por que importa para esta persona
- **Gotcha**: o que um leitor atento pode deixar passar

Mantenha as descrições compactas, específicas e fundamentadas no código real.

## Formato Narrativo

Use este arco, a menos que a tarefa claramente exija algo diferente:
1. orientação
2. mapa de módulos
3. caminho de execução principal
4. caso de borda ou gotcha
5. encerramento / próximo movimento

O tour deve parecer um caminho, não um inventário.

## Example

```json
{
  "$schema": "https://aka.ms/codetour-schema",
  "title": "API Service Tour",
  "description": "Walkthrough do caminho de requisição do serviço de pagamentos.",
  "ref": "main",
  "steps": [
    {
      "directory": "src",
      "title": "Source Root",
      "description": "Todo o código de runtime do serviço começa aqui."
    },
    {
      "file": "src/server.ts",
      "line": 12,
      "title": "Entry Point",
      "description": "O servidor inicializa aqui e conecta o middleware antes de qualquer rota ser alcançada."
    },
    {
      "file": "src/routes/payments.ts",
      "line": 8,
      "title": "Payment Routes",
      "description": "Toda requisição de pagamentos entra por este router antes de chegar à lógica do serviço."
    },
    {
      "title": "Next Steps",
      "description": "Você agora consegue seguir qualquer requisição de pagamento de ponta a ponta com as âncoras principais no lugar."
    }
  ]
}
```

## Anti-Patterns

| Anti-pattern | Correção |
| --- | --- |
| Listagem plana de arquivos | Conte uma história com dependência entre os passos |
| Descrições genéricas | Nomeie o caminho de código ou padrão concreto |
| Âncoras adivinhadas | Verifique cada arquivo e linha primeiro |
| Passos demais para um tour rápido | Corte agressivamente |
| O primeiro passo é somente conteúdo | Ancore o primeiro passo em um arquivo ou diretório real |
| Persona incompatível | Escreva para o leitor real, não para um engenheiro genérico |

## Best Practices

- mantenha a contagem de passos proporcional ao tamanho do repositório e à profundidade da persona
- use passos de diretório para orientação, passos de arquivo para substância
- para tours de PR, cubra primeiro os arquivos alterados
- para monorepos, restrinja o escopo aos pacotes relevantes em vez de percorrer tudo
- encerre com o que o leitor agora consegue fazer, não com uma recapitulação

## Related Skills

- `codebase-onboarding`
- `coding-standards`
- `council`
- formato oficial upstream: `microsoft/codetour`
