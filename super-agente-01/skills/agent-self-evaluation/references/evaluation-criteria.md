# Critérios de Avaliação — Guia Detalhado de Pontuação

Esta referência fornece âncoras concretas de pontuação para cada eixo. Use-a quando estiver em dúvida se uma lacuna merece um 4 vs um 3, ou um 2 vs um 1.

## Precisão

| Pontuação | Âncora | Exemplo |
|---|---|---|
| 5 | Todos os fatos verificados contra saída de tool, docs ou fontes autoritativas. Sem erros. | Retry configurado via transport httpx — confirmado nas docs do httpx. Todos os nomes de método verificados com grep contra a base de código. |
| 4 | Uma imprecisão menor que não afeta a corretude. | Biblioteca correta, valor padrão errado para um parâmetro (afirmou 0.5s, as docs dizem 1.0s). |
| 3 | Um erro factual significativo, ou 3+ imprecisões menores. | Usou `urllib3.Retry` em uma base de código httpx. Funciona neste caso, mas é a biblioteca errada. |
| 2 | Múltiplos erros significativos. A saída falharia se seguida. | Afirmou "adicione isto ao package.json" mas o projeto usa pyproject.toml. Duas outras afirmações de config também erradas. |
| 1 | Fundamentalmente incorreto. A saída se contradiz ou contradiz fatos conhecidos. | O código tem erros de sintaxe. O endpoint de API não existe. Afirma uma assinatura de função que o grep refuta. |

## Completude

| Pontuação | Âncora | Exemplo |
|---|---|---|
| 5 | Todos os requisitos explícitos e implícitos cobertos. Edge cases tratados. Caminhos de erro endereçados. | O usuário disse "adicione retry a todas as requisições HTTP." GET, POST, PUT, DELETE todos cobertos. Timeout, 429, 5xx todos tratados. |
| 4 | Todos os requisitos explícitos cobertos. Um requisito implícito perdido. | Todos os métodos HTTP cobertos. Esqueceu de tratar timeouts de conexão (não mencionado mas esperado). |
| 3 | Um requisito explícito perdido, ou 2+ lacunas implícitas. | O usuário disse "adicione logging também." Lógica de retry adicionada mas sem logging. |
| 2 | Múltiplos requisitos explícitos perdidos. A saída é uma solução parcial. | Pediu retry + circuit breaker. Apenas retry implementado. |
| 1 | Erra o pedido central. Entrega algo adjacente ao que foi pedido. | Pediu lógica de retry. Escreveu um endpoint de health check em vez disso. |

## Clareza

| Pontuação | Âncora | Exemplo |
|---|---|---|
| 5 | Perfeitamente estruturado. Jargão explicado ou evitado. A hierarquia visual ajuda a escanear. Sem ambiguidade. | README com seções claras, blocos de código e um resumo de 10 segundos no topo. |
| 4 | Geralmente claro. Uma seção poderia ser melhor organizada ou um termo está indefinido. | Boa estrutura mas `exponential backoff` usado sem explicação — assume que o leitor o conhece. |
| 3 | Compreensível após reler. Múltiplos problemas de organização ou termos indefinidos. | A explicação rodeia o ponto antes de chegar a ele. Vários termos usados antes de definidos. |
| 2 | Confuso em alguns pontos. O leitor precisaria fazer perguntas de acompanhamento. | O código funciona mas a descrição do PR não explica por que o retry era necessário ou o que ele corrige. |
| 1 | Ininteligível ou contraditório. O leitor não consegue determinar o que foi feito ou por quê. | A saída é uma parede de texto sem estrutura. As conclusões contradizem afirmações anteriores. |

## Acionabilidade

| Pontuação | Âncora | Exemplo |
|---|---|---|
| 5 | Ação única necessária. Caminho de verificação incluído. Sem passos implícitos. | "Faça merge deste PR. Os testes passam: `42 passed`. Faça deploy com `./deploy.sh`." |
| 4 | Ação única necessária mas o caminho de verificação é implícito, não explícito. | "Faça merge deste PR." (Os testes existem mas não foram citados. O usuário tem de verificar por conta própria.) |
| 3 | Múltiplas ações necessárias, ou uma ação com próximo passo pouco claro. | "Revise e faça merge. Depois atualize a config." (Qual config? Onde? Sem link ou caminho.) |
| 2 | O usuário precisa descobrir como usar a saída. Faltam instruções críticas. | Código escrito mas sem arquivo de teste, sem instruções de execução, sem PR criado. O usuário tem de montar tudo. |
| 1 | A saída não pode ser executada sem retrabalho ou esclarecimento significativo. | "Aqui está uma ideia de design." (Sem código, sem arquivo, sem PR. O usuário tem de começar do zero.) |

## Concisão

| Pontuação | Âncora | Exemplo |
|---|---|---|
| 5 | Cada frase merece seu lugar. Sem redundância. A densidade de informação é alta. | 30 linhas que dizem o que 60 linhas diriam. Sem pontos repetidos. Sem preenchimento. |
| 4 | Redundância menor. Um parágrafo poderia ser apertado. | Bom no geral mas repete a motivação tanto na descrição do PR quanto nos comentários do código. |
| 3 | Redundância perceptível. 20%+ do conteúdo poderia ser removido sem perda. | Explica o mesmo conceito três vezes (no resumo, no corpo e na conclusão). Exemplos prolixos. |
| 2 | Significativamente inchado. 40%+ do conteúdo é preenchimento ou repetição. | 200 linhas para uma tarefa que precisava de 60. Repete a pergunta do usuário. Inclui contexto irrelevante. |
| 1 | A razão ruído-sinal está invertida. Mais preenchimento que substância. | Resposta de 500 linhas para uma pergunta de 2 linhas. A maior parte é boilerplate, repetição ou contexto irrelevante. |

## Edge Cases

### Quando o usuário deu instruções pouco claras

Se o pedido do usuário foi ambíguo, NÃO penalize a completude por não ler mentes. Em vez disso, anote na avaliação: "O pedido do usuário foi ambíguo quanto a [escopo]. Escolhi a interpretação [interpretação escolhida]. Se eles quisessem dizer [interpretação alternativa], esta pontuação cairia para [pontuação]."

### Quando a tarefa é inerentemente simples

Uma correção de bug de 3 linhas pode legitimamente pontuar 5/5/5/5/5. A rubrica escala com a complexidade — uma tarefa simples feita perfeitamente É um 5.0. Não invente lacunas para justificar pontuações mais baixas.

### Quando você capturou seu próprio erro no meio da tarefa

Se você cometeu um erro, o capturou e o corrigiu antes de entregar — isso é um 5 em Precisão para a saída final. A avaliação é sobre o que o usuário recebeu, não sobre seu processo interno. Anote a autocorreção como evidência de minúcia, não como penalidade.

### Quando a saída de tool contradiz sua afirmação

Se você afirmou "os testes passam" mas a saída do terminal mostra uma falha — isso é um Precisão ≤ 2 automático. A saída de tool é a verdade fundamental. Afirmações sem verificação são a fonte mais comum de pontuações de precisão baixas.
