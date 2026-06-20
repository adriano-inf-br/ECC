---
description: Orquestra uma refatoração que preserva o comportamento — confirma testes verdes, reestrutura sem alterar o comportamento, mantém verde, revisa, commit com portão. Wrapper para a skill orch-refine-code.
---

# /orch-refine-code

Inicia manualmente o orquestrador **orch-refine-code**: melhora a estrutura enquanto
o comportamento permanece idêntico, com a suíte de testes existente como rede de segurança.

## Uso

```
/orch-refine-code <what to restructure>
```

Exemplos:

```
/orch-refine-code extract the NWS HTTP client out of poller.py
/orch-refine-code remove dead code and duplication in the dashboard module
```

## O Que Faz

Invoca a skill `orch-refine-code` com `$ARGUMENTS` como a requisição. A skill
(via o engine compartilhado `orch-pipeline`) irá:

1. Classificar o tamanho (piso padrão: standard — reestruturações tocam múltiplos arquivos).
2. Confirmar que os testes relevantes existem e estão **verdes antes** de tocar no código; adicionar
   testes de caracterização primeiro se a cobertura estiver rala. Planejar a reestruturação. → **PORTÃO 1**.
3. Reestruturar em passos pequenos, reexecutando os testes após cada um (sem novos testes de
   comportamento — a suíte existente prova que o comportamento está inalterado). Varreduras de código
   morto/duplicação delegam para o `refactor-cleaner`.
4. `code-reviewer`, depois fazer commit como `refactor:` (o diff deve ser neutro em comportamento). → **PORTÃO 2**.

Use isto apenas quando o comportamento **não** deve mudar. Se o comportamento deve mudar de alguma
forma, use `/orch-change-feature` ou `/orch-fix-defect`.

Se `$ARGUMENTS` estiver vazio, pergunte ao usuário o que refinar.
