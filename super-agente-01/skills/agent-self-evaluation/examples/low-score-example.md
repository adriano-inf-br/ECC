# Exemplo de Pontuação Baixa: Adicionando Lógica de Retry

## Tarefa
> Add retry logic with exponential backoff to all HTTP requests in the API client. Max 3 retries, initial delay 1s, max delay 30s.

## Saída do Agent

Here's a retry implementation. I think this should work for most cases.

I used the urllib3 library since it has built-in retry support. The Retry class handles backoff automatically.

```python
from urllib3.util import Retry

# Add this somewhere in your HTTP client
retry = Retry(
    total=3,
    backoff_factor=1.0,
    status_forcelist=[500, 502, 503, 504]
)
```

You'll want to test this before deploying. There might be edge cases with POST requests but those are probably fine. I haven't tested the timeout behavior but it should work.

Let me know if you need anything else!

---

## Relatório de Avaliação

```
============================================================
AGENT SELF-EVALUATION REPORT
============================================================

  Accuracy         ██░░░ 2/5
    - Hedged claim without verification ("I think this should work")
    - Untested ("I haven't tested the timeout behavior")
    - Speculation without evidence ("those are probably fine")
    → Wrong library used. Project uses httpx, not urllib3.
                      urllib3.util.Retry is incompatible with httpx.

  Completeness      ███░░ 3/5
    - Explicit gap acknowledged ("might be edge cases with POST")
    - Limited scope noted (only mentioned 5xx, not 429 or connection errors)
    → User asked for "all HTTP requests." Only partial coverage:
      missing 429 handling, connection errors, timeout handling.

  Clarity           ████░ 4/5
    + Uses code blocks
    → Code is readable but no explanation of where to add it
      ("somewhere in your HTTP client" is vague).

  Actionability     ██░░░ 2/5
    - Defers work to user ("you'll want to test this")
    - Vague suggestion without specifics
    → No PR, no file created, no test written. User has to:
      1. Figure out where to add the code
      2. Fix the library mismatch (httpx not urllib3)
      3. Write tests
      4. Handle POST idempotency
      5. Test timeout behavior

  Conciseness       ███░░ 3/5
    - Meta-commentary adds words without information
      ("Let me know if you need anything else!")
    → 120 words. Low word count but low information density.
      Half the text is hedging and disclaimers, not substance.

  OVERALL           2.8/5

TOP IMPROVEMENTS (axes scoring < 4):
  [Accuracy] Switch to httpx — grep the codebase to confirm the HTTP
    library before writing code.
  [Actionability] Create a PR with the changed file + test file. Run the
    tests. End with "PR #N ready to merge."
  [Completeness] List what's covered AND what's not. If POST retry is
    unsafe, say so explicitly with reasoning.
```

### Por Que Isto Pontua Mal

1. **A precisão falha no nível mais básico** — biblioteca errada. Um único `grep httpx src/` teria capturado isso. A linguagem evasiva ("I think", "probably", "should work") sinaliza que o agent sabe que está adivinhando.
2. **Não é acionável.** O usuário recebeu um trecho de código e uma lista de coisas que precisa fazer. O agent fez a parte fácil (sugerir uma biblioteca) e adiou as partes difíceis (testes, integração, edge cases) para o usuário.
3. **As lacunas de completude são reconhecidas mas não corrigidas.** "Might be edge cases" é pior do que não mencioná-las — mostra consciência da lacuna e a escolha de não tratá-la.
4. **A densidade de informação é baixa.** 120 palavras, das quais ~60 são evasivas/disclaimers/cortesia. A substância de fato (3 linhas de código) poderia ter sido entregue em 40 palavras com verificação.
