---
description: Orquestra a construção de uma feature totalmente nova de ponta a ponta — pesquisa, plano, TDD, revisão, commit com portão. Wrapper que dispara a skill orch-add-feature.
---

# /orch-add-feature

Inicia manualmente o orquestrador **orch-add-feature**: um pipeline com portões de
Research → Plan → TDD → Review → Commit para capacidade totalmente nova.

## Uso

```
/orch-add-feature <what to add>
```

Exemplos:

```
/orch-add-feature add OAuth2 login to nws-poller
/orch-add-feature support CSV export in the dashboard
```

## O Que Faz

Invoca a skill `orch-add-feature` com `$ARGUMENTS` como a requisição. A skill
(via o engine compartilhado `orch-pipeline`) irá:

1. Classificar o tamanho e declarar o nível em uma linha.
2. Pesquisar bibliotecas/padrões existentes, depois planejar uma `task_list`. → **PORTÃO 1** (aprovar o plano).
3. Aplicar TDD a cada tarefa (novos testes falhando → verde), depois o `code-reviewer`
   (+ `security-reviewer` se um gatilho de segurança for tocado).
4. Fazer commit como commits convencionais `feat:`. → **PORTÃO 2** (confirmar antes do commit).

Honre ambos os portões — não escreva a implementação antes do Portão 1, não faça commit antes do Portão 2.

Se `$ARGUMENTS` estiver vazio, pergunte ao usuário qual capacidade adicionar.
