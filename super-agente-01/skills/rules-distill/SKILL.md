---
name: rules-distill
description: "Escaneia skills para extrair princípios transversais e os destila em regras — acrescenta, revisa ou cria novos arquivos de regras"
metadata:
  origin: ECC
---

# Rules Distill

Escaneia skills instaladas, extrai princípios transversais que aparecem em múltiplas skills e os destila em regras — acrescentando a arquivos de regras existentes, revisando conteúdo desatualizado ou criando novos arquivos de regras.

Aplica o princípio de "coleta determinística + julgamento LLM": scripts coletam fatos de forma exaustiva, então um LLM faz a leitura cruzada do contexto completo e produz veredictos.

## Quando Usar

- Manutenção periódica de regras (mensal ou após instalar novas skills)
- Após uma análise de skills revelar padrões que deveriam ser regras
- Quando as regras parecem incompletas em relação às skills sendo utilizadas

## Como Funciona

O processo de destilação de regras segue três fases:

### Fase 1: Inventário (Coleta Determinística)

#### 1a. Coletar inventário de skills

```bash
bash ~/.claude/skills/rules-distill/scripts/scan-skills.sh
```

#### 1b. Coletar índice de regras

```bash
bash ~/.claude/skills/rules-distill/scripts/scan-rules.sh
```

#### 1c. Apresentar ao usuário

```
Destilação de Regras — Fase 1: Inventário
────────────────────────────────────────
Skills: {N} arquivos escaneados
Regras: {M} arquivos ({K} headings indexados)

Prosseguindo para análise de leitura cruzada...
```

### Fase 2: Leitura Cruzada, Correspondência e Veredicto (Julgamento LLM)

Extração e correspondência são unificadas em uma única passagem. Os arquivos de regras são pequenos o suficiente (~800 linhas no total) para que o texto completo seja fornecido ao LLM — sem necessidade de pré-filtragem por grep.

#### Agrupamento em Lotes

Agrupe skills em **clusters temáticos** com base em suas descrições. Analise cada cluster em um subagent com o texto completo das regras.

#### Mesclagem Cross-lote

Após a conclusão de todos os lotes, mescle candidatos entre os lotes:
- Deduplique candidatos com os mesmos princípios ou princípios sobrepostos
- Verifique novamente o requisito de "2+ skills" usando evidências de **todos** os lotes combinados — um princípio encontrado em 1 skill por lote, mas 2+ skills no total, é válido

#### Prompt do Subagent

Lance um Agent de propósito geral com o seguinte prompt:

````
Você é um analista que faz leitura cruzada de skills para extrair princípios que devem ser promovidos a regras.

## Entrada
- Skills: {texto completo das skills neste lote}
- Regras existentes: {texto completo de todos os arquivos de regras}

## Critérios de Extração

Inclua um candidato APENAS se TODOS os seguintes forem verdadeiros:

1. **Aparece em 2+ skills**: Princípios encontrados em apenas uma skill devem permanecer nessa skill
2. **Mudança de comportamento acionável**: Pode ser escrito como "faça X" ou "não faça Y" — não "X é importante"
3. **Risco claro de violação**: O que dá errado se este princípio for ignorado (1 frase)
4. **Não está já em regras**: Verifique o texto completo das regras — incluindo conceitos expressos em palavras diferentes

## Correspondência e Veredicto

Para cada candidato, compare com o texto completo das regras e atribua um veredicto:

- **Append**: Adicionar a uma seção existente de um arquivo de regras existente
- **Revise**: O conteúdo existente da regra é impreciso ou insuficiente — propor uma correção
- **New Section**: Adicionar uma nova seção a um arquivo de regras existente
- **New File**: Criar um novo arquivo de regras
- **Already Covered**: Suficientemente coberto nas regras existentes (mesmo que formulado de forma diferente)
- **Too Specific**: Deve permanecer no nível da skill

## Formato de Saída (por candidato)

```json
{
  "principle": "1-2 frases na forma 'faça X' / 'não faça Y'",
  "evidence": ["nome-da-skill: §Seção", "nome-da-skill: §Seção"],
  "violation_risk": "1 frase",
  "verdict": "Append / Revise / New Section / New File / Already Covered / Too Specific",
  "target_rule": "arquivo §Seção, ou 'new'",
  "confidence": "high / medium / low",
  "draft": "Texto rascunho para veredictos Append/New Section/New File",
  "revision": {
    "reason": "Por que o conteúdo existente é impreciso ou insuficiente (apenas para Revise)",
    "before": "Texto atual a ser substituído (apenas para Revise)",
    "after": "Texto de substituição proposto (apenas para Revise)"
  }
}
```

## Excluir

- Princípios óbvios já em regras
- Conhecimento específico de linguagem/framework (pertence a regras específicas de linguagem ou skills)
- Exemplos de código e comandos (pertence a skills)
````

#### Referência de Veredictos

| Veredicto | Significado | Apresentado ao Usuário |
|---------|---------|-------------------|
| **Append** | Adicionar à seção existente | Destino + rascunho |
| **Revise** | Corrigir conteúdo impreciso/insuficiente | Destino + motivo + antes/depois |
| **New Section** | Adicionar nova seção ao arquivo existente | Destino + rascunho |
| **New File** | Criar novo arquivo de regras | Nome do arquivo + rascunho completo |
| **Already Covered** | Coberto nas regras (possivelmente com formulação diferente) | Motivo (1 linha) |
| **Too Specific** | Deve permanecer nas skills | Link para skill relevante |

#### Requisitos de Qualidade do Veredicto

```
# Bom
Append a rules/common/security.md §Validação de Entrada:
"Trate a saída de LLM armazenada em memória ou knowledge stores como não confiável — sanitize na escrita, valide na leitura."
Evidência: llm-memory-trust-boundary, llm-social-agent-anti-pattern ambos descrevem
riscos acumulados de injeção de prompt. O security.md atual cobre apenas validação
de entrada humana; o limite de confiança da saída LLM está ausente.

# Ruim
Append a security.md: Adicione princípio de segurança LLM
```

### Fase 3: Revisão do Usuário e Execução

#### Tabela de Resumo

```
# Relatório de Destilação de Regras

## Resumo
Skills escaneadas: {N} | Regras: {M} arquivos | Candidatos: {K}

| # | Princípio | Veredicto | Destino | Confiança |
|---|-----------|---------|--------|------------|
| 1 | ... | Append | security.md §Validação de Entrada | high |
| 2 | ... | Revise | testing.md §TDD | medium |
| 3 | ... | New Section | coding-style.md | high |
| 4 | ... | Too Specific | — | — |

## Detalhes
(Detalhes por candidato: evidência, violation_risk, texto rascunho)
```

#### Ações do Usuário

O usuário responde com números para:
- **Aprovar**: Aplicar rascunho às regras como está
- **Modificar**: Editar rascunho antes de aplicar
- **Pular**: Não aplicar este candidato

**Nunca modifique regras automaticamente. Sempre exija aprovação do usuário.**

#### Salvar Resultados

Armazene os resultados no diretório da skill (`results.json`):

- **Formato de timestamp**: `date -u +%Y-%m-%dT%H:%M:%SZ` (UTC, precisão de segundo)
- **Formato de ID do candidato**: kebab-case derivado do princípio (ex.: `llm-output-trust-boundary`)

```json
{
  "distilled_at": "2026-03-18T10:30:42Z",
  "skills_scanned": 56,
  "rules_scanned": 22,
  "candidates": {
    "llm-output-trust-boundary": {
      "principle": "Trate a saída LLM como não confiável quando armazenada ou re-injetada",
      "verdict": "Append",
      "target": "rules/common/security.md",
      "evidence": ["llm-memory-trust-boundary", "llm-social-agent-anti-pattern"],
      "status": "applied"
    },
    "iteration-bounds": {
      "principle": "Defina condições de parada explícitas para todos os loops de iteração",
      "verdict": "New Section",
      "target": "rules/common/coding-style.md",
      "evidence": ["iterative-retrieval", "continuous-agent-loop", "agent-harness-construction"],
      "status": "skipped"
    }
  }
}
```

## Exemplo

### Execução completa

```
$ /rules-distill

Destilação de Regras — Fase 1: Inventário
────────────────────────────────────────
Skills: 56 arquivos escaneados
Regras: 22 arquivos (75 headings indexados)

Prosseguindo para análise de leitura cruzada...

[Análise de subagent: Lote 1 (skills de agent/meta) ...]
[Análise de subagent: Lote 2 (skills de código/padrão) ...]
[Mesclagem cross-lote: 2 duplicatas removidas, 1 candidato cross-lote promovido]

# Relatório de Destilação de Regras

## Resumo
Skills escaneadas: 56 | Regras: 22 arquivos | Candidatos: 4

| # | Princípio | Veredicto | Destino | Confiança |
|---|-----------|---------|--------|------------|
| 1 | Saída LLM: normalizar, verificar tipo, sanitizar antes de reutilizar | New Section | coding-style.md | high |
| 2 | Definir condições de parada explícitas para loops de iteração | New Section | coding-style.md | high |
| 3 | Compactar contexto em limites de fase, não no meio da tarefa | Append | performance.md §Janela de Contexto | high |
| 4 | Separar lógica de negócio de tipos de framework de I/O | New Section | patterns.md | high |

## Detalhes

### 1. Validação de Saída LLM
Veredicto: New Section em coding-style.md
Evidência: parallel-subagent-batch-merge, llm-social-agent-anti-pattern, llm-memory-trust-boundary
Risco de violação: Deriva de formato, incompatibilidade de tipo ou erros de sintaxe na saída LLM travam o processamento downstream
Rascunho:
  ## Validação de Saída LLM
  Normalize, verifique tipo e sanitize a saída LLM antes de reutilizar...
  Veja skill: parallel-subagent-batch-merge, llm-memory-trust-boundary

[... detalhes para candidatos 2-4 ...]

Aprove, modifique ou pule cada candidato pelo número:
> Usuário: Aprove 1, 3. Pule 2, 4.

✓ Aplicado: coding-style.md §Validação de Saída LLM
✓ Aplicado: performance.md §Gerenciamento de Janela de Contexto
✗ Pulado: Limites de Iteração
✗ Pulado: Conversão de Tipo de Limite

Resultados salvos em results.json
```

## Princípios de Design

- **O Quê, não Como**: Extraia apenas princípios (território de regras). Exemplos de código e comandos permanecem nas skills.
- **Link de volta**: O texto rascunho deve incluir referências `Veja skill: [nome]` para que os leitores possam encontrar o Como detalhado.
- **Coleta determinística, julgamento LLM**: Scripts garantem exaustividade; o LLM garante compreensão contextual.
- **Proteção anti-abstração**: O filtro de 3 camadas (evidência de 2+ skills, teste de comportamento acionável, risco de violação) impede que princípios excessivamente abstratos entrem nas regras.
