# Exemplo de Pontuação Alta: Adicionando Lógica de Retry

## Tarefa
> Add retry logic with exponential backoff to all HTTP requests in the API client. Max 3 retries, initial delay 1s, max delay 30s.

## Saída do Agent

### Resumo
Adicionado `httpx.HTTPTransport` com configuração de retry à classe compartilhada `ApiClient`. Todos os métodos HTTP (GET, POST, PUT, DELETE) agora fazem retry em 429, 5xx e erros de conexão com exponential backoff. 42 testes passam. PR único pronto para merge.

### Arquivos Alterados
- `src/api_client.py` — Adicionado o wrapper `RetryTransport` com `httpx.HTTPTransport(retries=3)` e exponential backoff configurado via `httpx.Limits`
- `tests/test_api_client.py` — Adicionados 8 testes: happy path, retry em 429, retry em 503, máximo de retries esgotado, timeout, asserção de tempo do backoff, retry de GET idempotente, sem retry em 4xx (exceto 429)

### Verificação
```
$ pytest tests/test_api_client.py -v
42 passed in 2.34s

$ grep -r "RetryTransport" src/
src/api_client.py:23: class RetryTransport(httpx.BaseTransport):
src/api_client.py:45:     self._transport = RetryTransport(...)

$ python -c "from src.api_client import ApiClient; c = ApiClient(); print(type(c._transport))"
<class 'src.api_client.RetryTransport'>
```

### Edge Cases Tratados
- Timeouts de conexão (retry com backoff)
- Limitação de taxa (429 → retry após o delay)
- Erros de servidor (5xx → retry)
- Erros de cliente exceto 429 (sem retry — 4xx significa que a requisição está incorreta)
- Idempotência: GET, PUT, DELETE fazem retry; POST não (configurável)

### Merge: [PR #423](https://github.com/example/pr/423)

---

## Relatório de Avaliação

```
============================================================
AGENT SELF-EVALUATION REPORT
============================================================

  Accuracy         █████ 5/5
    + Tests passing
    + Explicit verification (grep confirmed class exists, import test passed)
    + Lint clean
    → All claims backed by tool output. No hedging.

  Completeness      ████░ 4/5
    + Edge cases addressed (5 specific scenarios listed)
    + Error handling present across all HTTP methods
    → Missing: connection pool exhaustion handling (what happens when all
      connections are in retry state?) — minor gap, not blocking.

  Clarity           █████ 5/5
    + Uses headings for structure
    + Uses code blocks
    + Uses bullet points
    + Summary in first 3 lines
    → Well-organized. Reader can scan in 10 seconds.

  Actionability     █████ 5/5
    + PR created and linked
    + Specific run command given (pytest)
    + Verification steps included
    → Single action: merge PR #423. Everything else is done.

  Conciseness       ████░ 4/5
    + No redundancy detected
    → The verification section could be slightly tighter (3 commands
      could be 1 with a verification script). Minor.

  OVERALL           4.6/5

TOP IMPROVEMENTS:
  No axes below 4. Strong output across all dimensions.
```

### Por Que Isto Pontua Bem

1. **Precisão fixada na saída de tool.** Toda afirmação ("os testes passam", "a classe existe", "o import funciona") tem uma linha de saída de terminal correspondente. Nada de "deveria funcionar" ou "provavelmente está ok."
2. **A completude é explícita sobre o que está coberto E o que não está.** A seção de edge cases lista tanto os casos tratados quanto os intencionalmente não tratados (idempotência de POST).
3. **A acionabilidade é de etapa única.** O usuário só precisa fazer o merge de um PR. Sem tarefas de acompanhamento, sem "então configure X."
4. **A concisão é enxuta.** A saída tem ~250 palavras. A densidade de informação é alta — cada frase carrega peso.
