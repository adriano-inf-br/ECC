---
description: Orquestra a correção de um bug — reproduz como um teste de regressão falhando, corrige até ficar verde, revisa, commit com portão. Wrapper para a skill orch-fix-defect.
---

# /orch-fix-defect

Inicia manualmente o orquestrador **orch-fix-defect**: prova o bug com um teste
vermelho, depois corrige até ficar verde.

## Uso

```
/orch-fix-defect <what is broken>
```

Exemplos:

```
/orch-fix-defect poller crashes on empty NWS response
/orch-fix-defect login returns 500 when email has a plus sign
```

## O Que Faz

Invoca a skill `orch-fix-defect` com `$ARGUMENTS` como a requisição. A skill
(via o engine compartilhado `orch-pipeline`) irá:

1. Classificar o tamanho (piso padrão: pequeno, geralmente trivial); delimitar a causa raiz com
   `code-explorer` se não estiver claro.
2. **Escrever um novo teste de regressão falhando** que reproduz o bug, depois corrigir até
   ficar verde. (Provar o bug primeiro é o que torna isto uma correção, não um ajuste.)
3. `code-reviewer` (+ `security-reviewer` se o defeito estiver em um caminho sensível).
4. Fazer commit como um commit convencional `fix:`. → **PORTÃO 2** (confirmar antes do commit).

Use isto apenas quando o comportamento estiver **quebrado/errado** — não para mudanças intencionais
(`/orch-change-feature`) ou nova capacidade (`/orch-add-feature`).

Se `$ARGUMENTS` estiver vazio, peça ao usuário para descrever o defeito.
