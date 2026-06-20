---
name: agent-self-evaluation
description: Use após concluir qualquer tarefa não trivial. O agent autoavalia sua saída em 5 eixos — precisão, completude, clareza, acionabilidade, concisão — com evidências concretas por critério. Produz um scorecard estruturado de 1 a 5 com sugestões de melhoria específicas.
origin: ECC
---

# Autoavaliação de Agent

Após concluir uma tarefa complexa, o agent faz uma pausa para avaliar a própria saída em relação a uma rubrica estruturada de 5 eixos. Isto NÃO é um portão de aprovação/reprovação — é uma etapa deliberada de reflexão que captura omissões, sinaliza excesso de confiança e revela áreas de melhoria antes que o usuário tenha de fazê-lo.

## Quando Ativar

- Após escrever código que abrange 3+ arquivos ou 50+ linhas
- Após concluir um fluxo de trabalho multi-etapa (implementar → testar → revisar)
- Após uma sessão de depuração que envolveu 3+ tentativas
- Após produzir um documento de design, decisão de arquitetura ou análise escrita
- Quando o usuário pergunta "quão bom foi isso?" ou "avalie-se"
- Ao final de qualquer hook Stop de sessão (se configurado — veja `references/hook-integration.md`)

## Conceitos Centrais

### Os 5 Eixos de Avaliação

| Eixo | Pergunta | O que captura |
|---|---|---|
| **Precisão** | Os fatos, afirmações e saídas estão corretos? | Alucinações, nomes de API errados, sintaxe incorreta, afirmações falsas |
| **Completude** | Cobriu tudo o que o usuário pediu? | Edge cases perdidos, caminhos de erro não tratados, requisitos esquecidos, subtarefas puladas |
| **Clareza** | A explicação é compreensível e bem estruturada? | Explicações confusas, jargão sem definição, contexto ausente, prolixidade |
| **Acionabilidade** | O usuário pode agir sobre a saída imediatamente? | Sugestões vagas, passos ausentes, "você deveria X" sem mostrar como, sem caminho de verificação |
| **Concisão** | Usou o mínimo de palavras/tokens necessários? | Redundância, explicação excessiva, repetir a pergunta do usuário ao pé da letra, conteúdo de preenchimento |

### Escala de Pontuação

```
5 — Excepcional: nenhuma melhoria razoável é possível
4 — Bom: apenas detalhes menores, sem lacunas substantivas
3 — Adequado: atende ao pedido mas tem uma fraqueza notável em ao menos um eixo
2 — Fraco: tem uma lacuna clara que afeta a usabilidade ou a corretude
1 — Ruim: falha fundamentalmente o pedido ou contém erros significativos
```

### A Regra da Evidência

Toda pontuação abaixo de 5 DEVE citar evidência específica. Uma pontuação de 3 não pode apenas dizer "poderia ser melhor" — deve dizer exatamente o que está faltando ou errado. O mantra: **"Mostre a lacuna, não apenas a nomeie."**

## Fluxo de Trabalho

### Passo 1: Coletar o Material Bruto

Reúna o que você vai avaliar:

```
- O pedido original do usuário (lido de volta da conversa)
- Sua resposta/saída final (o entregável)
- Quaisquer saídas de tool que verifiquem a corretude (resultados de testes, exit codes, saída do lint)
- Qualquer feedback do usuário recebido durante a tarefa (correções, "tente de novo", "não é isso")
```

### Passo 2: Pontuar Cada Eixo de Forma Independente

Percorra os 5 eixos um de cada vez. Para cada um:

1. Leia a pergunta do eixo
2. Encontre evidência (ou ausência de evidência) na saída
3. Atribua uma pontuação de 1 a 5
4. Se a pontuação for < 5, escreva uma nota de melhoria de uma frase citando a lacuna

NÃO faça a média das pontuações de cabeça primeiro e depois trabalhe de trás para frente. Pontue cada eixo do zero.

### Passo 3: Produzir o Relatório de Avaliação

Use o template de `templates/evaluation-report.md`. O relatório deve incluir:

```
- Resumo de uma linha
- Scorecard de 5 eixos (pontuação + evidência por eixo)
- Pontuação geral (média simples, arredondada para 1 casa decimal)
- 1-3 melhorias específicas ordenadas por impacto
- Autoverificação: "O usuário concordaria com esta avaliação?"
```

### Passo 4: Aplicar a Melhoria

Se algum eixo pontuou 3 ou abaixo:

1. Declare o que você faria de diferente
2. Se a lacuna for corrigível em < 30 segundos (link ausente, frase pouco clara), corrija-a agora
3. Se a lacuna exigir retrabalho, sinalize-a explicitamente: "Este eixo pontuou [motivo] porque [evidência]. Re-executar com [correção específica] provavelmente o elevaria para [pontuação]."

## Exemplos de Código

### Exemplo: Boa Avaliação (Pontuação 4+)

```
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:    5 — All API calls correct. Verified: retries use
                  exponential backoff. No hallucinated methods.
  Completeness: 4 — Covered happy path + 3 error cases. Missing:
                  timeout handling for hung connections.
  Clarity:      5 — Code comments explain backoff formula.
                  PR description links to incident that motivated this.
  Actionability:5 — Single merge. No follow-up tasks. Tests pass.
  Conciseness:  4 — 47 lines total. The retry loop could be extracted
                  into a helper to drop ~8 lines.

Overall: 4.6 — One gap (timeout handling). Fix before merging.
```

### Exemplo: Avaliação Fraca (Pontuação 2-3)

```
Task: Add retry logic to HTTP client

Scorecard:
  Accuracy:    2 — Used urllib3 which doesn't match our
                  httpx-based codebase. Wrong library.
  Completeness: 3 — Works for GET. POST/PUT not handled (user
                  said "all HTTP requests").
  Clarity:      4 — Code is readable. Good variable names.
  Actionability:2 — "Add tests" mentioned but no test file created.
                  User has to write tests before merging.
  Conciseness:  3 — 120 lines. The retry config is duplicated in
                  3 places instead of one shared RetryConfig object.

Overall: 2.8 — Wrong library used. Needs httpx rewrite.
  Fix accuracy first (switch to httpx), then extend to all
  HTTP methods, then consolidate config.
```

## Anti-Padrões

### "Tudo é um 5"

```
FAIL: Accuracy:    5 — All good.
   Completeness: 5 — Everything covered.
   Clarity:      5 — Clear.
```

Nenhuma evidência citada. Isto é autoelogio, não avaliação. Um 5 real exige provar que não há nada a melhorar.

### Penalizar demais por scope creep

```
FAIL: Completeness: 2 — Didn't handle WebSocket connections or
   gRPC streaming (user didn't ask for these)
```

Avalie apenas em relação ao que o usuário de fato pediu, não ao que você poderia ter construído adicionalmente.

### Usar a avaliação para relitigar

```
FAIL: "As I said earlier, this approach is wrong. Score: 1"
```

A avaliação é sobre a saída entregue, não sobre rediscutir decisões de design que já foram tomadas. Se a abordagem estava errada, isso deveria ter sido capturado antes da entrega.

### Misturar preferência pessoal com lacunas objetivas

```
FAIL: "Score: 3. I don't like Python decorators."
```

"Não gosto" não é evidência. Cite uma preocupação concreta de legibilidade, testabilidade ou corretude, ou deixe a pontuação em 4+.

## Boas Práticas

- **Avalie a saída, não o processo.** O usuário se importa com o que você entregou, não com quantas iterações você levou.
- **Uma melhoria por eixo fraco.** Não liste 5 coisas para um eixo — escolha a lacuna de maior impacto.
- **Vincule melhorias ao impacto no usuário.** "Tratamento de erro ausente significa que a chamada de API do usuário vai falhar silenciosamente" supera "adicione tratamento de erro."
- **Seja específico sobre como é o 'corrigido'.** "Re-execute com o transport httpx configurado para retries" supera "corrija o problema da biblioteca."
- **Use saídas de tool como evidência.** Se os testes passaram, cite-os. Se o lint está limpo, cite-o. Não adivinhe — faça grep pela prova.
- **Se você não consegue achar nenhuma lacuna, esforce-se mais.** Uma pontuação perfeita em todos os 5 eixos é rara. Pergunte: "Se eu fosse o usuário, o que me incomodaria nesta saída?"

## Skills Relacionadas

- `agent-eval` — Comparação lado a lado de diferentes agents de programação em tarefas de benchmark
- `verification-loop` — Verificação sistemática de saídas em relação aos resultados esperados
- `security-review` — Checklist de revisão de código focado em segurança
