---
description: Salva o estado da sessão atual em um arquivo datado em ~/.claude/session-data/ para que o trabalho possa ser retomado em uma sessão futura com contexto completo.
---

# Save Session Command

Capture tudo o que aconteceu nesta sessão — o que foi construído, o que funcionou, o que falhou, o que resta — e escreva em um arquivo datado para que a próxima sessão possa retomar exatamente de onde esta parou.

## Quando usar

- Fim de uma sessão de trabalho antes de fechar o Claude Code
- Antes de atingir os limites de contexto (execute isto primeiro, depois inicie uma sessão nova)
- Após resolver um problema complexo que você quer lembrar
- Sempre que precisar passar contexto para uma sessão futura

## Processo

### Passo 1: Reúna o contexto

Antes de escrever o arquivo, colete:

- Leia todos os arquivos modificados durante esta sessão (use git diff ou recupere da conversa)
- Revise o que foi discutido, tentado e decidido
- Anote quaisquer erros encontrados e como foram resolvidos (ou não)
- Verifique o status atual de testes/build se relevante

### Passo 2: Crie a pasta de sessões se ela não existir

Crie a pasta canônica de sessões no diretório home do Claude do usuário:

```bash
mkdir -p ~/.claude/session-data
```

### Passo 3: Escreva o arquivo de sessão

Crie `~/.claude/session-data/YYYY-MM-DD-<short-id>-session.tmp`, usando a data real de hoje e um short-id que satisfaça as regras impostas por `SESSION_FILENAME_REGEX` em `session-manager.js`:

- Caracteres compatíveis: letras `a-z` / `A-Z`, dígitos `0-9`, hífens `-`, underscores `_`
- Comprimento mínimo de compatibilidade: 1 caractere
- Estilo recomendado para novos arquivos: letras minúsculas, dígitos e hífens com 8+ caracteres para evitar colisões

Exemplos válidos: `abc123de`, `a1b2c3d4`, `frontend-worktree-1`, `ChezMoi_2`
Evite para novos arquivos: `A`, `test_id1`, `ABC123de`

Exemplo completo de nome de arquivo válido: `2024-01-15-abc123de-session.tmp`

O nome de arquivo legado `YYYY-MM-DD-session.tmp` ainda é válido, mas novos arquivos de sessão devem preferir o formato com short-id para evitar colisões no mesmo dia.

### Passo 4: Preencha o arquivo com todas as seções abaixo

Escreva cada seção honestamente. Não pule seções — escreva "Nothing yet" ou "N/A" se uma seção genuinamente não tiver conteúdo. Um arquivo incompleto é pior do que uma seção honestamente vazia.

### Passo 5: Mostre o arquivo ao usuário

Após escrever, exiba o conteúdo completo e pergunte:

```
Session saved to [actual resolved path to the session file]

Does this look accurate? Anything to correct or add before we close?
```

Aguarde a confirmação. Faça edições se solicitado.

---

## Formato do arquivo de sessão

```markdown
# Session: YYYY-MM-DD

**Started:** [approximate time if known]
**Last Updated:** [current time]
**Project:** [project name or path]
**Topic:** [one-line summary of what this session was about]

---

## What We Are Building

[1-3 paragraphs describing the feature, bug fix, or task. Include enough
context that someone with zero memory of this session can understand the goal.
Include: what it does, why it's needed, how it fits into the larger system.]

---

## What WORKED (with evidence)

[List only things that are confirmed working. For each item include WHY you
know it works — test passed, ran in browser, Postman returned 200, etc.
Without evidence, move it to "Not Tried Yet" instead.]

- **[thing that works]** — confirmed by: [specific evidence]
- **[thing that works]** — confirmed by: [specific evidence]

If nothing is confirmed working yet: "Nothing confirmed working yet — all approaches still in progress or untested."

---

## What Did NOT Work (and why)

[This is the most important section. List every approach tried that failed.
For each failure write the EXACT reason so the next session doesn't retry it.
Be specific: "threw X error because Y" is useful. "didn't work" is not.]

- **[approach tried]** — failed because: [exact reason / error message]
- **[approach tried]** — failed because: [exact reason / error message]

If nothing failed: "No failed approaches yet."

---

## What Has NOT Been Tried Yet

[Approaches that seem promising but haven't been attempted. Ideas from the
conversation. Alternative solutions worth exploring. Be specific enough that
the next session knows exactly what to try.]

- [approach / idea]
- [approach / idea]

If nothing is queued: "No specific untried approaches identified."

---

## Current State of Files

[Every file touched this session. Be precise about what state each file is in.]

| File              | Status         | Notes                      |
| ----------------- | -------------- | -------------------------- |
| `path/to/file.ts` | PASS: Complete    | [what it does]             |
| `path/to/file.ts` |  In Progress | [what's done, what's left] |
| `path/to/file.ts` | FAIL: Broken      | [what's wrong]             |
| `path/to/file.ts` |  Not Started | [planned but not touched]  |

If no files were touched: "No files modified this session."

---

## Decisions Made

[Architecture choices, tradeoffs accepted, approaches chosen and why.
These prevent the next session from relitigating settled decisions.]

- **[decision]** — reason: [why this was chosen over alternatives]

If no significant decisions: "No major decisions made this session."

---

## Blockers & Open Questions

[Anything unresolved that the next session needs to address or investigate.
Questions that came up but weren't answered. External dependencies waiting on.]

- [blocker / open question]

If none: "No active blockers."

---

## Exact Next Step

[If known: The single most important thing to do when resuming. Be precise
enough that resuming requires zero thinking about where to start.]

[If not known: "Next step not determined — review 'What Has NOT Been Tried Yet'
and 'Blockers' sections to decide on direction before starting."]

---

## Environment & Setup Notes

[Only fill this if relevant — commands needed to run the project, env vars
required, services that need to be running, etc. Skip if standard setup.]

[If none: omit this section entirely.]
```

---

## Exemplo de saída

```markdown
# Session: 2024-01-15

**Started:** ~2pm
**Last Updated:** 5:30pm
**Project:** my-app
**Topic:** Building JWT authentication with httpOnly cookies

---

## What We Are Building

User authentication system for the Next.js app. Users register with email/password,
receive a JWT stored in an httpOnly cookie (not localStorage), and protected routes
check for a valid token via middleware. The goal is session persistence across browser
refreshes without exposing the token to JavaScript.

---

## What WORKED (with evidence)

- **`/api/auth/register` endpoint** — confirmed by: Postman POST returns 200 with user
  object, row visible in Supabase dashboard, bcrypt hash stored correctly
- **JWT generation in `lib/auth.ts`** — confirmed by: unit test passes
  (`npm test -- auth.test.ts`), decoded token at jwt.io shows correct payload
- **Password hashing** — confirmed by: `bcrypt.compare()` returns true in test

---

## What Did NOT Work (and why)

- **Next-Auth library** — failed because: conflicts with our custom Prisma adapter,
  threw "Cannot use adapter with credentials provider in this configuration" on every
  request. Not worth debugging — too opinionated for our setup.
- **Storing JWT in localStorage** — failed because: SSR renders happen before
  localStorage is available, caused React hydration mismatch error on every page load.
  This approach is fundamentally incompatible with Next.js SSR.

---

## What Has NOT Been Tried Yet

- Store JWT as httpOnly cookie in the login route response (most likely solution)
- Use `cookies()` from `next/headers` to read token in server components
- Write middleware.ts to protect routes by checking cookie existence

---

## Current State of Files

| File                             | Status         | Notes                                           |
| -------------------------------- | -------------- | ----------------------------------------------- |
| `app/api/auth/register/route.ts` | PASS: Complete    | Works, tested                                   |
| `app/api/auth/login/route.ts`    |  In Progress | Token generates but not setting cookie yet      |
| `lib/auth.ts`                    | PASS: Complete    | JWT helpers, all tested                         |
| `middleware.ts`                  |  Not Started | Route protection, needs cookie read logic first |
| `app/login/page.tsx`             |  Not Started | UI not started                                  |

---

## Decisions Made

- **httpOnly cookie over localStorage** — reason: prevents XSS token theft, works with SSR
- **Custom auth over Next-Auth** — reason: Next-Auth conflicts with our Prisma setup, not worth the fight

---

## Blockers & Open Questions

- Does `cookies().set()` work inside a Route Handler or only in Server Actions? Need to verify.

---

## Exact Next Step

In `app/api/auth/login/route.ts`, after generating the JWT, set it as an httpOnly
cookie using `cookies().set('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' })`.
Then test with Postman — the response should include a `Set-Cookie` header.
```

---

## Notas

- Cada sessão recebe seu próprio arquivo — nunca anexe ao arquivo de uma sessão anterior
- A seção "What Did NOT Work" é a mais crítica — sessões futuras vão cegamente repetir abordagens que falharam sem ela
- Se o usuário pedir para salvar no meio da sessão (não apenas no final), salve o que se sabe até o momento e marque claramente os itens em andamento
- O arquivo se destina a ser lido pelo Claude no início da próxima sessão via `/resume-session`
- Use o armazenamento global canônico de sessões: `~/.claude/session-data/`
- Prefira o formato de nome de arquivo com short-id (`YYYY-MM-DD-<short-id>-session.tmp`) para qualquer novo arquivo de sessão
