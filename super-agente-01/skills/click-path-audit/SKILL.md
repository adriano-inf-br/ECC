---
name: click-path-audit
description: "Rastreie cada botão/ponto de contato voltado ao usuário através de toda a sua sequência de mudança de estado para encontrar bugs em que funções funcionam individualmente, mas se cancelam mutuamente, produzem um estado final errado ou deixam a UI em um estado inconsistente. Use quando: o debugging sistemático não encontrou bugs, mas os usuários relatam botões quebrados, ou após qualquer refatoração grande que toque stores de estado compartilhado."
metadata:
  origin: community
---

# /click-path-audit — Auditoria de Fluxo Comportamental

Encontre bugs que a leitura estática do código não detecta: efeitos colaterais de interação de estado, condições de corrida entre chamadas sequenciais e handlers que silenciosamente desfazem uns aos outros.

## O Problema Que Isto Resolve

O debugging tradicional verifica:
- A função existe? (ligação ausente)
- Ela quebra? (erros em tempo de execução)
- Ela retorna o tipo correto? (fluxo de dados)

Mas ele NÃO verifica:
- **O estado final da UI corresponde ao que o rótulo do botão promete?**
- **A função B silenciosamente desfaz o que a função A acabou de fazer?**
- **O estado compartilhado (Zustand/Redux/context) tem efeitos colaterais que cancelam a ação pretendida?**

Exemplo real: um botão "New Email" chamava `setComposeMode(true)` e depois `selectThread(null)`. Ambos funcionavam individualmente. Mas `selectThread` tinha um efeito colateral que redefinia `composeMode: false`. O botão não fazia nada. 54 bugs foram encontrados por debugging sistemático — este passou despercebido.

---

## How It Works

Para CADA ponto de contato interativo na área-alvo:

```
1. IDENTIFIQUE o handler (onClick, onSubmit, onChange, etc.)
2. RASTREIE cada chamada de função no handler, EM ORDEM
3. Para CADA chamada de função:
   a. Qual estado ela LÊ?
   b. Qual estado ela ESCREVE?
   c. Ela tem EFEITOS COLATERAIS no estado compartilhado?
   d. Ela redefine/limpa algum estado como efeito colateral?
4. VERIFIQUE: Alguma chamada posterior DESFAZ uma mudança de estado de uma chamada anterior?
5. VERIFIQUE: O estado FINAL é o que o usuário espera a partir do rótulo do botão?
6. VERIFIQUE: Há condições de corrida (chamadas assíncronas que resolvem na ordem errada)?
```

---

## Passos de Execução

### Step 1: Mapear os State Stores

Antes de auditar qualquer ponto de contato, construa um mapa de efeitos colaterais de cada action de state store:

```
Para cada Zustand store / React context no escopo:
  Para cada action/setter:
    - Quais campos ela define?
    - Ela REDEFINE outros campos como efeito colateral?
    - Documente: actionName → {sets: [...], resets: [...]}
```

Esta é a referência crítica. O bug do "New Email" era invisível sem saber que `selectThread` redefine `composeMode`.

**Formato de saída:**
```
STORE: emailStore
  setComposeMode(bool) → sets: {composeMode}
  selectThread(thread|null) → sets: {selectedThread, selectedThreadId, messages, drafts, selectedDraft, summary} RESETS: {composeMode: false, composeData: null, redraftOpen: false}
  setDraftGenerating(bool) → sets: {draftGenerating}
  ...

RESETS PERIGOSOS (actions que limpam estado que não lhes pertence):
  selectThread → redefine composeMode (pertencente a setComposeMode)
  reset → redefine tudo
```

### Step 2: Auditar Cada Ponto de Contato

Para cada botão/toggle/submit de formulário na área-alvo:

```
TOUCHPOINT: [rótulo do botão] em [Component:line]
  HANDLER: onClick → {
    call 1: functionA() → sets {X: true}
    call 2: functionB() → sets {Y: null} RESETS {X: false}  ← CONFLITO
  }
  EXPECTED: O usuário vê [descrição do que o rótulo do botão promete]
  ACTUAL: X é false porque functionB o redefiniu
  VERDICT: BUG — [descrição]
```

**Verifique cada um destes padrões de bug:**

#### Padrão 1: Desfazer Sequencial
```
handler() {
  setState_A(true)     // define X = true
  setState_B(null)     // efeito colateral: redefine X = false
}
// Resultado: X é false. A primeira chamada foi inútil.
```

#### Padrão 2: Corrida Assíncrona
```
handler() {
  fetchA().then(() => setState({ loading: false }))
  fetchB().then(() => setState({ loading: true }))
}
// Resultado: o estado final de loading depende de qual resolve primeiro
```

#### Padrão 3: Closure Obsoleta (Stale Closure)
```
const [count, setCount] = useState(0)
const handler = useCallback(() => {
  setCount(count + 1)  // captura count obsoleto
  setCount(count + 1)  // mesmo count obsoleto — incrementa em 1, não em 2
}, [count])
```

#### Padrão 4: Transição de Estado Ausente
```
// O botão diz "Save" mas o handler apenas valida, nunca salva de fato
// O botão diz "Delete" mas o handler define uma flag sem chamar a API
// O botão diz "Send" mas o endpoint da API foi removido/está quebrado
```

#### Padrão 5: Caminho Condicional Morto
```
handler() {
  if (someState) {        // someState é SEMPRE false neste ponto
    doTheActualThing()    // nunca alcançado
  }
}
```

#### Padrão 6: Interferência de useEffect
```
// O botão define stateX = true
// Um useEffect observa stateX e o redefine para false
// O usuário não vê nada acontecer
```

### Step 3: Reportar

Para cada bug encontrado:

```
CLICK-PATH-NNN: [severidade: CRITICAL/HIGH/MEDIUM/LOW]
  Touchpoint: [rótulo do botão] em [file:line]
  Pattern: [Desfazer Sequencial / Corrida Assíncrona / Closure Obsoleta / Transição Ausente / Caminho Morto / Interferência de useEffect]
  Handler: [nome da função ou inline]
  Trace:
    1. [chamada] → sets {field: value}
    2. [chamada] → RESETS {field: value}  ← CONFLITO
  Expected: [o que o usuário espera]
  Actual: [o que realmente acontece]
  Fix: [correção específica]
```

---

## Controle de Escopo

Esta auditoria é cara. Defina o escopo adequadamente:

- **Auditoria de app completo:** Use ao lançar ou após uma refatoração grande. Lance agents paralelos por página.
- **Auditoria de página única:** Use após construir uma nova página ou após um usuário relatar um botão quebrado.
- **Auditoria focada em store:** Use após modificar um Zustand store — audite todos os consumidores das actions alteradas.

### Divisão de agents recomendada para o app completo:

```
Agent 1: Map ALL state stores (Step 1) — this is shared context for all other agents
Agent 2: Dashboard (Tasks, Notes, Journal, Ideas)
Agent 3: Chat (DanteChatColumn, JustChatPage)
Agent 4: Emails (ThreadList, DraftArea, EmailsPage)
Agent 5: Projects (ProjectsPage, ProjectOverviewTab, NewProjectWizard)
Agent 6: CRM (all sub-tabs)
Agent 7: Profile, Settings, Vault, Notifications
Agent 8: Management Suite (all pages)
```

Agent 1 MUST complete first. Its output is input for all other agents.

---

## When to Use

- After systematic debugging finds "no bugs" but users report broken UI
- After modifying any Zustand store action (check all callers)
- After any refactor that touches shared state
- Before release, on critical user flows
- When a button "does nothing" — this is THE tool for that

## When NOT to Use

- For API-level bugs (wrong response shape, missing endpoint) — use systematic-debugging
- For styling/layout issues — visual inspection
- For performance issues — profiling tools

---

## Integration with Other Skills

- Run AFTER `/superpowers:systematic-debugging` (which finds the other 54 bug types)
- Run BEFORE `/superpowers:verification-before-completion` (which verifies fixes work)
- Feeds into `/superpowers:test-driven-development` — every bug found here should get a test

---

## Example: The Bug That Inspired This Skill

**ThreadList.tsx "New Email" button:**
```
onClick={() => {
  useEmailStore.getState().setComposeMode(true)   // ✓ sets composeMode = true
  useEmailStore.getState().selectThread(null)      // ✗ RESETS composeMode = false
}}
```

Store definition:
```
selectThread: (thread) => set({
  selectedThread: thread,
  selectedThreadId: thread?.id ?? null,
  messages: [],
  drafts: [],
  selectedDraft: null,
  summary: null,
  composeMode: false,     // ← THIS silent reset killed the button
  composeData: null,
  redraftOpen: false,
})
```

**Systematic debugging missed it** because:
- The button has an onClick handler (not dead)
- Both functions exist (no missing wiring)
- Neither function crashes (no runtime error)
- The data types are correct (no type mismatch)

**Click-path audit catches it** because:
- Step 1 maps `selectThread` resets `composeMode`
- Step 2 traces the handler: call 1 sets true, call 2 resets false
- Verdict: Sequential Undo — final state contradicts button intent
