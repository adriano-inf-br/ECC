---
description: Responde a uma pergunta rápida paralela sem interromper ou perder o contexto da tarefa atual. Retoma o trabalho automaticamente após responder.
---

# Comando Aside

Faça uma pergunta no meio da tarefa e receba uma resposta imediata e focada — depois continue exatamente de onde parou. A tarefa atual, os arquivos e o contexto nunca são modificados.

## Quando Usar

- Você está curioso sobre algo enquanto o Claude está trabalhando e não quer perder o ritmo
- Você precisa de uma explicação rápida de um código que o Claude está editando no momento
- Você quer uma segunda opinião ou esclarecimento sobre uma decisão sem desviar a tarefa
- Você precisa entender um erro, conceito ou padrão antes de o Claude prosseguir
- Você quer perguntar algo não relacionado à tarefa atual sem iniciar uma nova sessão

## Uso

```
/aside <sua pergunta>
/aside o que essa função realmente retorna?
/aside esse padrão é thread-safe?
/aside por que estamos usando X em vez de Y aqui?
/aside qual é a diferença entre foo() e bar()?
/aside devemos nos preocupar com a query N+1 que acabamos de adicionar?
```

## Processo

### Passo 1: Congele o estado da tarefa atual

Antes de responder qualquer coisa, anote mentalmente:
- Qual é a tarefa ativa? (qual arquivo, feature ou problema estava sendo trabalhado)
- Qual passo estava em andamento no momento em que `/aside` foi invocado?
- O que estava prestes a acontecer em seguida?

NÃO toque, edite, crie ou exclua nenhum arquivo durante o aside.

### Passo 2: Responda a pergunta diretamente

Responda a pergunta na forma mais concisa que ainda seja completa e útil.

- Comece pela resposta, não pelo raciocínio
- Seja breve — se uma explicação completa for necessária, ofereça-se para aprofundar após a tarefa
- Se a pergunta for sobre o arquivo atual ou o código sendo trabalhado, faça referência precisa a ele (caminho do arquivo e número da linha, se relevante)
- Se responder exigir ler um arquivo, leia-o — mas apenas leitura, nunca escrita

Formate a resposta como:

```
ASIDE: [reformule a pergunta brevemente]

[Sua resposta aqui]

— De volta à tarefa: [descrição de uma linha do que estava sendo feito]
```

### Passo 3: Retome a tarefa principal

Após entregar a resposta, continue imediatamente a tarefa ativa do ponto exato em que ela foi pausada. Não peça permissão para retomar, a menos que a resposta do aside tenha revelado um bloqueio ou um motivo para reconsiderar a abordagem atual (veja Casos Especiais).

---

## Casos Especiais

**Nenhuma pergunta fornecida (`/aside` sem nada depois):**
Responda:
```
ASIDE: nenhuma pergunta fornecida

O que você gostaria de saber? (faça sua pergunta e eu respondo sem perder o contexto da tarefa atual)

— De volta à tarefa: [descrição de uma linha do que estava sendo feito]
```

**A pergunta revela um problema potencial com a tarefa atual:**
Sinalize claramente antes de retomar:
```
ASIDE: [resposta]

WARNING: Nota: Esta resposta sugere [problema] com a abordagem atual. Quer resolver isso antes de continuar, ou prosseguir conforme planejado?
```
Aguarde a decisão do usuário antes de retomar.

**A pergunta é, na verdade, um redirecionamento de tarefa (não uma pergunta paralela):**
Se a pergunta implicar mudar o que está sendo construído (ex.: `/aside na verdade, vamos usar Redis em vez disso`), esclareça:
```
ASIDE: Isso parece uma mudança de direção, não apenas uma pergunta paralela.
Você quer:
  (a) Responder isto apenas como informação e manter o plano atual
  (b) Pausar a tarefa atual e mudar de abordagem
```
Aguarde a resposta do usuário — não faça suposições.

**A pergunta é sobre o arquivo ou código atualmente aberto:**
Responda a partir do contexto ativo. Se o arquivo foi lido anteriormente na sessão, faça referência direta a ele. Caso contrário, leia-o agora (apenas leitura) e responda com uma referência arquivo:linha.

**Nenhuma tarefa ativa (nada em andamento quando `/aside` é invocado):**
Ainda use o wrapper padrão para que o formato da resposta permaneça consistente:
```
ASIDE: [reformule a pergunta brevemente]

[Sua resposta aqui]

— De volta à tarefa: nenhuma tarefa ativa para retomar
```

**A pergunta exige uma resposta longa:**
Dê a resposta essencial de forma concisa, depois ofereça:
```
Essa é a versão curta. Quer uma explicação mais aprofundada depois que terminarmos [tarefa atual]?
```

**Várias perguntas `/aside` em sequência:**
Responda a cada uma em sequência. Após a última resposta, retome a tarefa principal. Não perca o estado da tarefa ao longo de uma cadeia de asides.

**A resposta do aside implica que uma mudança de código é necessária:**
Anote a mudança necessária, mas não a faça durante o aside:
```
ASIDE: [resposta]

 Vale corrigir: [o que deveria ser alterado]. Vou sinalizar isso após a tarefa atual, a menos que você queira resolver agora.
```

**A pergunta é ambígua ou vaga demais:**
Faça uma pergunta de esclarecimento — a pergunta mais curta que obtenha a informação necessária para responder. Não faça múltiplas perguntas.

---

## Exemplo de Saída

```
User: /aside o que fetchWithRetry() realmente faz?

ASIDE: o que fetchWithRetry() faz?

fetchWithRetry() (src/api/retry.ts:12) tenta a requisição até 3 vezes com
backoff exponencial (250ms → 500ms → 1s). Ele só repete em respostas 5xx e
erros de rede — erros 4xx são tratados como finais e não são repetidos.

— De volta à tarefa: refatorando o middleware de autenticação em src/middleware/auth.ts
```

```
User: /aside a abordagem que estamos adotando é thread-safe?

ASIDE: a abordagem atual é thread-safe?

Não — o objeto de cache compartilhado em src/cache/store.ts:34 é mutado sem travamento.
Sob requisições concorrentes isso é uma condição de corrida. É de baixo risco em um
servidor Node.js de processo único, mas seria um problema real com worker threads ou clustering.

WARNING: Nota: Isso poderia afetar a feature que estamos construindo. Quer resolver isso agora ou continuar e corrigir num follow-up?
```

---

## Notas

- Nunca modifique arquivos durante um aside — acesso somente leitura
- O aside é uma pausa na conversa, não uma nova tarefa — a tarefa original deve sempre ser retomada
- Mantenha as respostas focadas: o objetivo é desbloquear o usuário rapidamente, não dar uma palestra
- Se um aside desencadear uma discussão maior, termine a tarefa atual primeiro, a menos que o aside revele um bloqueio
- Asides não são salvos nos arquivos de sessão, a menos que sejam explicitamente relevantes para o resultado da tarefa
