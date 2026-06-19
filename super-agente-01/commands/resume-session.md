---
description: Carrega o arquivo de sessão mais recente de ~/.claude/session-data/ e retoma o trabalho com contexto completo de onde a última sessão terminou.
---

# Comando Resume Session

Carregue o último estado de sessão salvo e oriente-se totalmente antes de fazer qualquer trabalho.
Este comando é a contraparte de `/save-session`.

## Quando Usar

- Ao iniciar uma nova sessão para continuar o trabalho de um dia anterior
- Após iniciar uma sessão nova devido a limites de contexto
- Ao receber um arquivo de sessão de outra fonte (basta fornecer o caminho do arquivo)
- Sempre que você tiver um arquivo de sessão e quiser que o Claude o absorva completamente antes de prosseguir

## Uso

```
/resume-session                                                      # loads most recent file in ~/.claude/session-data/
/resume-session 2024-01-15                                           # loads most recent session for that date
/resume-session ~/.claude/session-data/2024-01-15-abc123de-session.tmp  # loads a current short-id session file
/resume-session ~/.claude/sessions/2024-01-15-session.tmp               # loads a specific legacy-format file
```

## Processo

### Etapa 1: Encontrar o arquivo de sessão

Se nenhum argumento for fornecido:

1. Verifique `~/.claude/session-data/`
2. Escolha o arquivo `*-session.tmp` modificado mais recentemente
3. Se a pasta não existir ou não houver arquivos correspondentes, informe o usuário:
   ```
   No session files found in ~/.claude/session-data/
   Run /save-session at the end of a session to create one.
   ```
   Em seguida, pare.

Se um argumento for fornecido:

- Se parecer uma data (`YYYY-MM-DD`), procure primeiro em `~/.claude/session-data/`, depois no legado
  `~/.claude/sessions/`, por arquivos que correspondam a `YYYY-MM-DD-session.tmp` (formato legado) ou
  `YYYY-MM-DD-<shortid>-session.tmp` (formato atual)
  e carregue a variante modificada mais recentemente para essa data
- Se parecer um caminho de arquivo, leia esse arquivo diretamente
- Se não for encontrado, reporte com clareza e pare

### Etapa 2: Ler o arquivo de sessão inteiro

Leia o arquivo completo. Ainda não resuma.

### Etapa 3: Confirmar o entendimento

Responda com um briefing estruturado exatamente neste formato:

```
SESSION LOADED: [actual resolved path to the file]
════════════════════════════════════════════════

PROJECT: [project name / topic from file]

WHAT WE'RE BUILDING:
[2-3 sentence summary in your own words]

CURRENT STATE:
PASS: Working: [count] items confirmed
 In Progress: [list files that are in progress]
 Not Started: [list planned but untouched]

WHAT NOT TO RETRY:
[list every failed approach with its reason — this is critical]

OPEN QUESTIONS / BLOCKERS:
[list any blockers or unanswered questions]

NEXT STEP:
[exact next step if defined in the file]
[if not defined: "No next step defined — recommend reviewing 'What Has NOT Been Tried Yet' together before starting"]

════════════════════════════════════════════════
Ready to continue. What would you like to do?
```

### Etapa 4: Aguardar o usuário

NÃO comece a trabalhar automaticamente. NÃO toque em nenhum arquivo. Aguarde o usuário dizer o que fazer em seguida.

Se o próximo passo estiver claramente definido no arquivo de sessão e o usuário disser "continue", "sim" ou similar — prossiga exatamente com esse próximo passo.

Se nenhum próximo passo estiver definido — pergunte ao usuário por onde começar e, opcionalmente, sugira uma abordagem da seção "What Has NOT Been Tried Yet".

---

## Casos Especiais

**Múltiplas sessões para a mesma data** (`2024-01-15-session.tmp`, `2024-01-15-abc123de-session.tmp`):
Carregue o arquivo correspondente modificado mais recentemente para essa data, independentemente de usar o formato legado sem id ou o formato atual de id curto.

**O arquivo de sessão referencia arquivos que não existem mais:**
Anote isso durante o briefing — "WARNING: `path/to/file.ts` referenced in session but not found on disk."

**O arquivo de sessão é de mais de 7 dias atrás:**
Anote a defasagem — "WARNING: This session is from N days ago (threshold: 7 days). Things may have changed." — e então prossiga normalmente.

**O usuário fornece um caminho de arquivo diretamente (ex.: encaminhado por um colega de equipe):**
Leia-o e siga o mesmo processo de briefing — o formato é o mesmo independentemente da fonte.

**O arquivo de sessão está vazio ou malformado:**
Reporte: "Session file found but appears empty or unreadable. You may need to create a new one with /save-session."

---

## Exemplo de Saída

```
SESSION LOADED: /Users/you/.claude/session-data/2024-01-15-abc123de-session.tmp
════════════════════════════════════════════════

PROJECT: my-app — JWT Authentication

WHAT WE'RE BUILDING:
User authentication with JWT tokens stored in httpOnly cookies.
Register and login endpoints are partially done. Route protection
via middleware hasn't been started yet.

CURRENT STATE:
PASS: Working: 3 items (register endpoint, JWT generation, password hashing)
 In Progress: app/api/auth/login/route.ts (token works, cookie not set yet)
 Not Started: middleware.ts, app/login/page.tsx

WHAT NOT TO RETRY:
FAIL: Next-Auth — conflicts with custom Prisma adapter, threw adapter error on every request
FAIL: localStorage for JWT — causes SSR hydration mismatch, incompatible with Next.js

OPEN QUESTIONS / BLOCKERS:
- Does cookies().set() work inside a Route Handler or only Server Actions?

NEXT STEP:
In app/api/auth/login/route.ts — set the JWT as an httpOnly cookie using
cookies().set('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' })
then test with Postman for a Set-Cookie header in the response.

════════════════════════════════════════════════
Ready to continue. What would you like to do?
```

---

## Notas

- Nunca modifique o arquivo de sessão ao carregá-lo — é um registro histórico somente leitura
- O formato do briefing é fixo — não pule seções, mesmo que estejam vazias
- "What Not To Retry" deve sempre ser exibido, mesmo que apenas diga "None" — é importante demais para ser omitido
- Após retomar, o usuário pode querer executar `/save-session` novamente ao fim da nova sessão para criar um novo arquivo datado
