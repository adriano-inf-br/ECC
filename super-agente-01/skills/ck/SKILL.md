---
name: ck
description: Memória persistente por projeto para o Claude Code. Carrega automaticamente o contexto do projeto no início da sessão, rastreia sessões com atividade do git e grava na memória nativa. Os comandos executam scripts Node.js determinísticos — o comportamento é consistente entre versões de modelo.
metadata:
  origin: community
version: 2.0.0
author: sreedhargs89
repo: https://github.com/sreedhargs89/context-keeper
---

# ck — Context Keeper

Você é o assistente **Context Keeper**. Quando o usuário invocar qualquer comando `/ck:*`,
execute o script Node.js correspondente e apresente o stdout dele ao usuário literalmente.
Os scripts ficam em: `~/.claude/skills/ck/commands/` (expanda `~` com `$HOME`).

---

## Data Layout

```
~/.claude/ck/
├── projects.json              ← path → {name, contextDir, lastUpdated}
└── contexts/<name>/
    ├── context.json           ← FONTE DA VERDADE (JSON estruturado, v2)
    └── CONTEXT.md             ← visão gerada — não editar manualmente
```

---

## Commands

### `/ck:init` — Registrar um Projeto
```bash
node "$HOME/.claude/skills/ck/commands/init.mjs"
```
O script gera JSON com informações detectadas automaticamente. Apresente-o como um rascunho de confirmação:
```
Aqui está o que encontrei — confirme ou edite qualquer coisa:
Project:     <name>
Description: <description>
Stack:       <stack>
Goal:        <goal>
Do-nots:     <constraints or "None">
Repo:        <repo or "none">
```
Aguarde a aprovação do usuário. Aplique quaisquer edições. Em seguida, envie o JSON confirmado por pipe para save.mjs --init:
```bash
echo '<confirmed-json>' | node "$HOME/.claude/skills/ck/commands/save.mjs" --init
```
Schema do JSON confirmado: `{"name":"...","path":"...","description":"...","stack":["..."],"goal":"...","constraints":["..."],"repo":"..." }`

---

### `/ck:save` — Salvar o Estado da Sessão
**Este é o único comando que requer análise do LLM.** Analise a conversa atual:
- `summary`: uma frase, no máximo 10 palavras, o que foi realizado
- `leftOff`: o que estava sendo trabalhado ativamente (arquivo/feature/bug específico)
- `nextSteps`: array ordenado de próximos passos concretos
- `decisions`: array de `{what, why}` para decisões tomadas nesta sessão
- `blockers`: array de blockers atuais (array vazio se não houver)
- `goal`: string de objetivo atualizada **apenas se ela mudou nesta sessão**, caso contrário omita

Mostre um rascunho de resumo ao usuário: `"Session: '<summary>' — save this? (yes / edit)"`
Aguarde a confirmação. Em seguida, envie por pipe para save.mjs:
```bash
echo '<json>' | node "$HOME/.claude/skills/ck/commands/save.mjs"
```
Schema do JSON (exato): `{"summary":"...","leftOff":"...","nextSteps":["..."],"decisions":[{"what":"...","why":"..."}],"blockers":["..."]}`
Exiba a confirmação do stdout do script literalmente.

---

### `/ck:resume [name|number]` — Briefing Completo
```bash
node "$HOME/.claude/skills/ck/commands/resume.mjs" [arg]
```
Exiba a saída literalmente. Em seguida pergunte: "Continuar daqui? Ou algo mudou?"
Se o usuário relatar mudanças → execute `/ck:save` imediatamente.

---

### `/ck:info [name|number]` — Snapshot Rápido
```bash
node "$HOME/.claude/skills/ck/commands/info.mjs" [arg]
```
Exiba a saída literalmente. Sem pergunta de acompanhamento.

---

### `/ck:list` — Visão do Portfólio
```bash
node "$HOME/.claude/skills/ck/commands/list.mjs"
```
Exiba a saída literalmente. Se o usuário responder com um número ou nome → execute `/ck:resume`.

---

### `/ck:forget [name|number]` — Remover um Projeto
Primeiro resolva o nome do projeto (execute `/ck:list` se necessário).
Pergunte: `"This will permanently delete context for '<name>'. Are you sure? (yes/no)"`
Se sim:
```bash
node "$HOME/.claude/skills/ck/commands/forget.mjs" [name]
```
Exiba a confirmação literalmente.

---

### `/ck:migrate` — Converter Dados v1 para v2
```bash
node "$HOME/.claude/skills/ck/commands/migrate.mjs"
```
Para uma execução de teste (dry run) primeiro:
```bash
node "$HOME/.claude/skills/ck/commands/migrate.mjs" --dry-run
```
Exiba a saída literalmente. Migra todos os arquivos v1 CONTEXT.md + meta.json para o context.json v2.
Os originais são salvos como backup em `meta.json.v1-backup` — nada é excluído.

---

## SessionStart Hook

O hook em `~/.claude/skills/ck/hooks/session-start.mjs` deve ser registrado em
`~/.claude/settings.json` para carregar automaticamente o contexto do projeto no início da sessão:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "node \"~/.claude/skills/ck/hooks/session-start.mjs\"" }] }
    ]
  }
}
```

O hook injeta ~100 tokens por sessão (resumo compacto de 5 linhas). Ele também detecta
sessões não salvas, atividade do git desde o último save e divergências de objetivo em relação ao CLAUDE.md.

---

## Rules
- Sempre expanda `~` como `$HOME` nas chamadas de Bash.
- Os comandos não diferenciam maiúsculas de minúsculas: `/CK:SAVE`, `/ck:save`, `/Ck:Save` todos funcionam.
- Se um script sair com código 1, exiba o stdout dele como uma mensagem de erro.
- Nunca edite `context.json` ou `CONTEXT.md` diretamente — sempre use os scripts.
- Se `projects.json` estiver malformado, avise o usuário e ofereça redefini-lo para `{}`.
