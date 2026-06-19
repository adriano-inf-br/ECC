---
name: token-budget-advisor
description: >-
  Oferece ao usuário uma escolha informada sobre quanta profundidade de resposta
  consumir antes de responder. Use esta skill quando o usuário quiser
  controlar explicitamente o comprimento, profundidade ou orçamento de tokens da resposta.
  ACIONAR quando: "token budget", "token count", "token usage", "token limit",
  "response length", "answer depth", "short version", "brief answer",
  "detailed answer", "exhaustive answer", "resposta corta vs larga",
  "cuántos tokens", "ahorrar tokens", "responde al 50%", "dame la versión
  corta", "quiero controlar cuánto usas", ou variantes claras onde o
  usuário está explicitamente pedindo para controlar o tamanho ou profundidade da resposta.
  NÃO ACIONAR quando: o usuário já especificou um nível na sessão atual
  (mantenha-o), a requisição é claramente uma resposta de uma palavra, ou
  "token" se refere a tokens de autenticação/sessão/pagamento em vez de tamanho de resposta.
metadata:
  origin: community
---

# Token Budget Advisor (TBA)

Intercepte o fluxo de resposta para oferecer ao usuário uma escolha sobre profundidade de resposta **antes** de o Claude responder.

## Quando Usar

- Usuário quer controlar o comprimento ou nível de detalhe de uma resposta
- Usuário menciona tokens, orçamento, profundidade ou comprimento de resposta
- Usuário diz "short version", "tldr", "brief", "al 25%", "exhaustive", etc.
- Qualquer vez que o usuário queira escolher o nível de profundidade/detalhe antecipadamente

**Não acionar** quando: o usuário já definiu um nível nesta sessão (mantenha-o silenciosamente), ou a resposta é trivialmente de uma linha.

## Como Funciona

### Passo 1 — Estimar tokens de entrada

Use a heurística canônica de orçamento de contexto do repositório para estimar mentalmente a contagem de tokens do Prompt.

Use a mesma orientação de calibração de [context-budget](../context-budget/SKILL.md):

- prosa: `palavras × 1,3`
- blocos de código pesado ou conteúdo misto/código: `chars / 4`

Para conteúdo misto, use o tipo de conteúdo dominante e mantenha a heurística de estimativa.

### Passo 2 — Estimar tamanho de resposta por complexidade

Classifique o Prompt e aplique o intervalo multiplicador para obter a janela completa de resposta:

| Complexidade   | Intervalo multiplicador | Exemplos de Prompt                                      |
|--------------|------------------|------------------------------------------------------|
| Simples       | 3× – 8×          | "O que é X?", sim/não, fato único                   |
| Médio       | 8× – 20×         | "Como funciona X?"                                  |
| Médio-Alto  | 10× – 25×        | Requisição de código com contexto                           |
| Complexo      | 15× – 40×        | Análise multiparte, comparações, arquitetura      |
| Criativo     | 10× – 30×        | Histórias, ensaios, escrita narrativa                  |

Janela de resposta = `input_tokens × mult_min` a `input_tokens × mult_max` (mas não exceda o limite de tokens de saída configurado do seu modelo).

### Passo 3 — Apresentar opções de profundidade

Apresente este bloco **antes** de responder, usando os números estimados reais:

```
Analisando seu Prompt...

Entrada: ~[N] tokens  |  Tipo: [tipo]  |  Complexidade: [nível]  |  Idioma: [idioma]

Escolha seu nível de profundidade:

[1] Essencial   (25%)  ->  ~[tokens]   Resposta direta apenas, sem preâmbulo
[2] Moderado    (50%)  ->  ~[tokens]   Resposta + contexto + 1 exemplo
[3] Detalhado   (75%)  ->  ~[tokens]   Resposta completa com alternativas
[4] Exaustivo  (100%)  ->  ~[tokens]   Tudo, sem limites

Qual nível? (1-4 ou diga "25% depth", "50% depth", "75% depth", "100% depth")

Precisão: estimativa heurística ~85-90% de acurácia (±15%).
```

Estimativas de tokens por nível (dentro da janela de resposta):
- 25%  → `min + (max - min) × 0,25`
- 50%  → `min + (max - min) × 0,50`
- 75%  → `min + (max - min) × 0,75`
- 100% → `max`

### Passo 4 — Responder no nível escolhido

| Nível            | Comprimento alvo       | Incluir                                             | Omitir                                              |
|------------------|---------------------|-----------------------------------------------------|---------------------------------------------------|
| 25% Essencial    | Máx. 2-4 frases   | Resposta direta, conclusão principal                       | Contexto, exemplos, nuance, alternativas           |
| 50% Moderado     | 1-3 parágrafos      | Resposta + contexto necessário + 1 exemplo              | Análise profunda, casos extremos, referências             |
| 75% Detalhado    | Resposta estruturada | Múltiplos exemplos, prós/contras, alternativas          | Casos extremos raros, referências exaustivas         |
| 100% Exaustivo  | Sem restrição      | Tudo — análise completa, todo código, todas as perspectivas | Nada                                        |

## Atalhos — ignore a pergunta

Se o usuário já sinaliza um nível, responda naquele nível imediatamente sem perguntar:

| O que eles dizem                                      | Nível |
|----------------------------------------------------|-------|
| "1" / "25% depth" / "short version" / "brief answer" / "tldr"  | 25%   |
| "2" / "50% depth" / "moderate depth" / "balanced answer"        | 50%   |
| "3" / "75% depth" / "detailed answer" / "thorough answer"       | 75%   |
| "4" / "100% depth" / "exhaustive answer" / "full deep dive"     | 100%  |

Se o usuário definiu um nível anteriormente na sessão, **mantenha-o silenciosamente** para respostas subsequentes a menos que ele o mude.

## Nota de precisão

Esta skill usa estimativa heurística — sem tokenizador real. Acurácia ~85-90%, variância ±15%. Sempre mostre o aviso.

## Exemplos

### Acionadores

- "Primeiro me dê a versão curta."
- "Quantos tokens sua resposta vai usar?"
- "Responda com 50% de profundidade."
- "Quero a resposta exaustiva, não o resumo."
- "Dame la version corta y luego la detallada."

### Não Aciona

- "O que é um token JWT?"
- "O fluxo de checkout usa um token de pagamento."
- "Isso é normal?"
- "Complete a refatoração."
- Perguntas de acompanhamento após o usuário já ter escolhido uma profundidade para a sessão

## Fonte

Skill independente de [TBA — Token Budget Advisor for Claude Code](https://github.com/Xabilimon1/Token-Budget-Advisor-Claude-Code-).
O projeto original também inclui um script estimador Python, mas este repositório mantém a skill autocontida e apenas com heurísticas.
