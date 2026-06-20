---
description: Orquestra a alteração de uma feature existente e funcional para um novo comportamento desejado — atualiza os testes para a nova spec, muda a implementação, revisa, commit com portão. Wrapper para a skill orch-change-feature.
---

# /orch-change-feature

Inicia manualmente o orquestrador **orch-change-feature**: muda um comportamento que
já funciona para uma nova spec desejada, com testes primeiro.

## Uso

```
/orch-change-feature <the new desired behavior>
```

Exemplos:

```
/orch-change-feature make nws-poller alert at 2 warnings instead of 3
/orch-change-feature instead of sorting by date, sort by priority
```

## O Que Faz

Invoca a skill `orch-change-feature` com `$ARGUMENTS` como a requisição. A skill
(via o engine compartilhado `orch-pipeline`) irá:

1. Classificar o tamanho (piso padrão: pequeno) e declarar o nível.
2. Plano leve apenas se o novo comportamento exigir pesquisa. → **PORTÃO 1** (aprovar o plano de testes alterados).
3. **Atualizar os testes existentes** para expressar o novo comportamento, depois mudar a
   implementação até ficar verde. (Mudar os testes primeiro é o que torna isto um
   ajuste, não uma correção.)
4. `code-reviewer` (+ `security-reviewer` em um gatilho de segurança), depois fazer commit. → **PORTÃO 2**.

Use isto apenas quando a feature **funciona**, mas deve se comportar de forma diferente — não para
bugs (`/orch-fix-defect`) ou capacidade totalmente nova (`/orch-add-feature`).

Se `$ARGUMENTS` estiver vazio, pergunte ao usuário qual comportamento deve mudar.
