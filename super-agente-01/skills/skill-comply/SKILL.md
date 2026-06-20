---
name: skill-comply
description: Visualize se skills, regras e definições de agentes são realmente seguidas — gera automaticamente cenários em 3 níveis de rigor de Prompt, executa agentes, classifica sequências de comportamento e reporta taxas de conformidade com timelines completas de chamadas de tools
metadata:
  origin: ECC
tools: Read, Bash
---

# skill-comply: Medição Automatizada de Conformidade

Mede se agentes de codificação realmente seguem skills, regras ou definições de agentes ao:
1. Gerar automaticamente sequências comportamentais esperadas (specs) a partir de qualquer arquivo .md
2. Gerar automaticamente cenários com rigor decrescente de Prompt (suportivo → neutro → concorrente)
3. Executar `claude -p` e capturar rastros de chamadas de tools via stream-json
4. Classificar chamadas de tools em relação aos passos da spec usando LLM (não regex)
5. Verificar ordenação temporal de forma determinística
6. Gerar relatórios autocontidos com spec, prompts e timelines

## Alvos Suportados

- **Skills** (`skills/*/SKILL.md`): Skills de fluxo de trabalho como search-first, guias TDD
- **Regras** (`rules/common/*.md`): Regras obrigatórias como testing.md, security.md, git-workflow.md
- **Definições de agentes** (`agents/*.md`): Se um agente é invocado quando esperado (verificação de fluxo de trabalho interno ainda não suportada)

## Quando Ativar

- Usuário executa `/skill-comply <caminho>`
- Usuário pergunta "esta regra está sendo realmente seguida?"
- Após adicionar novas regras/skills, para verificar a conformidade do agente
- Periodicamente como parte da manutenção de qualidade

## Uso

```bash
# Execução completa
uv run python -m scripts.run ~/.claude/rules/common/testing.md

# Execução seca (sem custo, apenas spec + cenários)
uv run python -m scripts.run --dry-run ~/.claude/skills/search-first/SKILL.md

# Modelos customizados
uv run python -m scripts.run --gen-model haiku --model sonnet <caminho>
```

## Conceito-Chave: Independência de Prompt

Mede se uma skill/regra é seguida mesmo quando o Prompt não a suporta explicitamente.

## Conteúdo do Relatório

Os relatórios são autocontidos e incluem:
1. Sequência comportamental esperada (spec gerada automaticamente)
2. Prompts de cenário (o que foi pedido em cada nível de rigor)
3. Pontuações de conformidade por cenário
4. Timelines de chamadas de tools com rótulos de classificação por LLM

### Avançado (opcional)

Para usuários familiarizados com hooks, os relatórios também incluem recomendações de promoção de Hook para passos com baixa conformidade. Isso é informativo — o valor principal é a própria visibilidade de conformidade.
