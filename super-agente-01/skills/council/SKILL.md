---
name: council
description: Convoque um conselho de quatro vozes para decisões ambíguas, trade-offs e chamadas de go/no-go. Use quando existirem múltiplos caminhos válidos e você precisar de discordância estruturada antes de escolher.
metadata:
  origin: ECC
---

# Council

Convoque quatro conselheiros para decisões ambíguas:
- a voz do Claude em contexto
- um subagent Cético (Skeptic)
- um subagent Pragmático (Pragmatist)
- um subagent Crítico (Critic)

Isto é para **tomada de decisão sob ambiguidade**, não para revisão de código, planejamento de implementação ou design de arquitetura.

## Quando Usar

Use o council quando:
- uma decisão tem múltiplos caminhos credíveis e nenhum vencedor óbvio
- você precisa expor trade-offs explicitamente
- o usuário pede segundas opiniões, dissidência ou múltiplas perspectivas
- a ancoragem conversacional é um risco real
- uma chamada de go / no-go se beneficiaria de um desafio adversarial

Exemplos:
- monorepo vs polyrepo
- lançar agora vs aguardar polimento
- feature flag vs rollout completo
- simplificar o escopo vs manter a amplitude estratégica

## Quando NÃO Usar

| Em vez do council | Use |
| --- | --- |
| Verificar se a saída está correta | `santa-method` |
| Quebrar um recurso em passos de implementação | `planner` |
| Projetar a arquitetura do sistema | `architect` |
| Revisar código em busca de bugs ou segurança | `code-reviewer` ou `santa-method` |
| Perguntas factuais diretas | apenas responda diretamente |
| Tarefas óbvias de execução | apenas faça a tarefa |

## Papéis

| Voz | Lente |
| --- | --- |
| Architect | correção, manutenibilidade, implicações de longo prazo |
| Skeptic | desafio de premissa, simplificação, quebra de pressupostos |
| Pragmatist | velocidade de entrega, impacto no usuário, realidade operacional |
| Critic | casos extremos, risco de downside, modos de falha |

As três vozes externas devem ser lançadas como subagents novos com **apenas a pergunta e o contexto relevante**, não a conversa em andamento completa. Esse é o mecanismo anti-ancoragem.

## Fluxo de Trabalho

### 1. Extraia a pergunta real

Reduza a decisão a um único prompt explícito:
- o que estamos decidindo?
- quais restrições importam?
- o que conta como sucesso?

Se a pergunta for vaga, faça uma pergunta esclarecedora antes de convocar o council.

### 2. Reúna apenas o contexto necessário

Se a decisão for específica do código:
- colete os arquivos, trechos, texto de issue ou métricas relevantes
- mantenha compacto
- inclua apenas o contexto necessário para tomar a decisão

Se a decisão for estratégica/geral:
- pule trechos do repo a menos que mudem materialmente a resposta

### 3. Forme primeiro a posição do Architect

Antes de ler as outras vozes, anote:
- sua posição inicial
- as três razões mais fortes a favor dela
- o principal risco no seu caminho preferido

Faça isso primeiro para que a síntese não apenas espelhe as vozes externas.

### 4. Lance três vozes independentes em paralelo

Cada subagent recebe:
- a pergunta de decisão
- contexto compacto se necessário
- um papel estrito
- nenhum histórico desnecessário de conversa

Formato do prompt:

```text
Você é o [ROLE] em um conselho de decisão de quatro vozes.

Pergunta:
[pergunta de decisão]

Contexto:
[apenas os trechos ou restrições relevantes]

Responda com:
1. Posição — 1-2 frases
2. Raciocínio — 3 bullets concisos
3. Risco — o maior risco da sua recomendação
4. Surpresa — uma coisa que as outras vozes podem deixar passar

Seja direto. Sem rodeios. Mantenha abaixo de 300 palavras.
```

Ênfase de papel:
- Skeptic: desafie o enquadramento, questione pressupostos, proponha a alternativa credível mais simples
- Pragmatist: otimize para velocidade, simplicidade e execução no mundo real
- Critic: exponha risco de downside, casos extremos e razões pelas quais o plano pode falhar

### 5. Sintetize com proteções contra viés

Você é simultaneamente participante e sintetizador, então use estas regras:
- não descarte uma visão externa sem explicar o porquê
- se uma voz externa mudou sua recomendação, diga isso explicitamente
- sempre inclua a dissidência mais forte, mesmo que você a rejeite
- se duas vozes se alinham contra sua posição inicial, trate isso como um sinal real
- mantenha as posições brutas visíveis antes do veredito

### 6. Apresente um veredito compacto

Use este formato de saída:

```markdown
## Council: [título curto da decisão]

**Architect:** [posição em 1-2 frases]
[1 linha sobre o porquê]

**Skeptic:** [posição em 1-2 frases]
[1 linha sobre o porquê]

**Pragmatist:** [posição em 1-2 frases]
[1 linha sobre o porquê]

**Critic:** [posição em 1-2 frases]
[1 linha sobre o porquê]

### Veredito
- **Consenso:** [onde se alinham]
- **Dissidência mais forte:** [a discordância mais importante]
- **Checagem de premissa:** [o Skeptic desafiou a própria pergunta?]
- **Recomendação:** [o caminho sintetizado]
```

Mantenha legível na tela de um celular.

## Regra de Persistência

**Não** escreva notas ad-hoc em `~/.claude/notes` ou outros caminhos paralelos a partir desta skill.

Se o council mudar materialmente a recomendação:
- use `knowledge-ops` para armazenar a lição no local durável correto
- ou use `/save-session` se o resultado pertence à memória de sessão
- ou atualize diretamente a issue relevante no GitHub / Linear se a decisão muda a verdade de execução ativa

Só persista uma decisão quando ela mudar algo real.

## Acompanhamento Multi-Rodada

O padrão é uma rodada.

Se o usuário quiser outra rodada:
- mantenha a nova pergunta focada
- inclua o veredito anterior apenas se for necessário
- mantenha o Skeptic o mais limpo possível para preservar o valor anti-ancoragem

## Anti-Padrões

- usar o council para revisão de código
- usar o council quando a tarefa é apenas trabalho de implementação
- alimentar os subagents com toda a transcrição da conversa
- esconder discordância no veredito final
- persistir toda decisão como uma nota independentemente da importância

## Skills Relacionadas

- `santa-method` — verificação adversarial
- `knowledge-ops` — persista deltas de decisão duráveis corretamente
- `search-first` — reúna material de referência externo antes do council, se necessário
- `architecture-decision-records` — formalize o resultado quando a decisão se torna política de sistema de longa duração

## Exemplo

Pergunta:

```text
Devemos lançar o ECC 2.0 como alpha agora, ou aguardar até que a UI do plano de controle esteja mais completa?
```

Provável formato do council:
- Architect defende a integridade estrutural e evitar uma superfície confusa
- Skeptic questiona se a UI é realmente o fator limitante
- Pragmatist pergunta o que pode ser lançado agora sem prejudicar a confiança
- Critic foca na carga de suporte, na dívida de expectativa e na confusão do rollout

O valor não é a unanimidade. O valor é tornar a discordância legível antes de escolher.
