---
description: "Extrai padrões reutilizáveis da sessão, autoavalia a qualidade antes de salvar e determina o local de salvamento correto (Global vs Projeto)."
---

# /learn-eval - Extrair, Avaliar e então Salvar

Estende `/learn` com um quality gate, decisão de local de salvamento e consciência de posicionamento de conhecimento antes de escrever qualquer arquivo de skill.

## O Que Extrair

Procure por:

1. **Padrões de Resolução de Erros** — causa raiz + correção + reutilização
2. **Técnicas de Depuração** — passos não óbvios, combinações de ferramentas
3. **Workarounds** — peculiaridades de bibliotecas, limitações de API, correções específicas de versão
4. **Padrões Específicos do Projeto** — convenções, decisões de arquitetura, padrões de integração

## Processo

1. Revisar a sessão em busca de padrões extraíveis
2. Identificar o insight mais valioso/reutilizável

3. **Determinar o local de salvamento:**
   - Pergunte: "Este padrão seria útil em um projeto diferente?"
   - **Global** (`~/.claude/skills/learned/`): Padrões genéricos usáveis em 2 ou mais projetos (compatibilidade de bash, comportamento de API de LLM, técnicas de depuração, etc.)
   - **Projeto** (`.claude/skills/learned/` no projeto atual): Conhecimento específico do projeto (peculiaridades de um arquivo de configuração específico, decisões de arquitetura específicas do projeto, etc.)
   - Na dúvida, escolha Global (mover de Global → Projeto é mais fácil que o inverso)

4. Esboçar o arquivo de skill usando este formato:

```markdown
---
name: pattern-name
description: "Under 130 characters"
user-invocable: false
origin: auto-extracted
---

# [Descriptive Pattern Name]

**Extracted:** [Date]
**Context:** [Brief description of when this applies]

## Problem
[What problem this solves - be specific]

## Solution
[The pattern/technique/workaround - with code examples]

## When to Use
[Trigger conditions]
```

5. **Quality gate — Checklist + Veredito holístico**

   ### 5a. Checklist obrigatório (verifique lendo os arquivos de fato)

   Execute **todos** os itens a seguir antes de avaliar o rascunho:

   - [ ] Fazer grep em `~/.claude/skills/` e nos arquivos relevantes de `.claude/skills/` do projeto por palavra-chave para verificar sobreposição de conteúdo
   - [ ] Verificar o MEMORY.md (tanto do projeto quanto global) em busca de sobreposição
   - [ ] Considerar se acrescentar a uma skill existente seria suficiente
   - [ ] Confirmar que é um padrão reutilizável, não uma correção pontual

   ### 5b. Veredito holístico

   Sintetize os resultados do checklist e a qualidade do rascunho, depois escolha **um** dos seguintes:

   | Veredito | Significado | Próxima Ação |
   |---------|---------|-------------|
   | **Save** | Único, específico, bem delimitado | Avançar para o Passo 6 |
   | **Improve then Save** | Valioso, mas precisa de refinamento | Listar melhorias → revisar → reavaliar (uma vez) |
   | **Absorb into [X]** | Deve ser acrescentado a uma skill existente | Mostrar a skill alvo e as adições → Passo 6 |
   | **Drop** | Trivial, redundante ou abstrato demais | Explicar o raciocínio e parar |

**Dimensões de orientação** (que informam o veredito, sem pontuação):

- **Especificidade e Acionabilidade**: Contém exemplos de código ou comandos imediatamente usáveis
- **Adequação de Escopo**: Nome, condições de gatilho e conteúdo estão alinhados e focados em um único padrão
- **Unicidade**: Oferece valor não coberto pelas skills existentes (informado pelos resultados do checklist)
- **Reutilização**: Existem cenários de gatilho realistas em sessões futuras

6. **Fluxo de confirmação específico por veredito**

- **Improve then Save**: Apresente as melhorias necessárias + rascunho revisado + checklist/veredito atualizados após uma reavaliação; se o veredito revisado for **Save**, salve após a confirmação do usuário, caso contrário siga o novo veredito
- **Save**: Apresente o caminho de salvamento + resultados do checklist + justificativa do veredito em 1 linha + rascunho completo → salve após a confirmação do usuário
- **Absorb into [X]**: Apresente o caminho alvo + adições (formato diff) + resultados do checklist + justificativa do veredito → acrescente após a confirmação do usuário
- **Drop**: Mostre apenas os resultados do checklist + raciocínio (não é necessária confirmação)

7. Salvar / Absorver no local determinado

## Formato de Saída para o Passo 5

```
### Checklist
- [x] grep em skills/: sem sobreposição (ou: sobreposição encontrada → detalhes)
- [x] MEMORY.md: sem sobreposição (ou: sobreposição encontrada → detalhes)
- [x] Acréscimo a skill existente: novo arquivo apropriado (ou: deve acrescentar a [X])
- [x] Reutilização: confirmada (ou: pontual → Drop)

### Veredito: Save / Improve then Save / Absorb into [X] / Drop

**Justificativa:** (1-2 frases explicando o veredito)
```

## Justificativa de Design

Esta versão substitui a rubrica anterior de pontuação numérica de 5 dimensões (Especificidade, Acionabilidade, Adequação de Escopo, Não-redundância, Cobertura pontuadas de 1 a 5) por um sistema de veredito holístico baseado em checklist. Modelos frontier modernos (Opus 4.6+) têm forte julgamento contextual — forçar sinais qualitativos ricos em pontuações numéricas perde nuance e pode produzir totais enganosos. A abordagem holística permite que o modelo pondere todos os fatores naturalmente, produzindo decisões de salvar/descartar mais precisas, enquanto o checklist explícito garante que nenhuma verificação crítica seja pulada.

## Notas

- Não extraia correções triviais (erros de digitação, erros simples de sintaxe)
- Não extraia problemas pontuais (quedas específicas de API, etc.)
- Concentre-se em padrões que vão economizar tempo em sessões futuras
- Mantenha as skills focadas — um padrão por skill
- Quando o veredito for Absorb, acrescente à skill existente em vez de criar um novo arquivo
