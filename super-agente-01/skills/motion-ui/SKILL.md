---
name: motion-ui
description: "Sistema de motion de UI pronto para produção para React/Next.js. Use ao implementar animações, transições ou padrões de motion."
metadata:
  origin: ECC
---

# Sistema de Motion v4.2

Sistema de motion de UI pronto para produção para React / Next.js.

Focado em **desempenho, acessibilidade e usabilidade** — não em decoração.

## Quando Usar

Use este sistema de motion quando o movimento:

* Guia a atenção (ex.: onboarding, ações importantes)
* Comunica estado (carregando, sucesso, erro, transições)
* Preserva a continuidade espacial (mudanças de layout, navegação)

### Cenários Adequados

* Componentes interativos (botões, modais, menus)
* Transições de estado (carregando → carregado, aberto → fechado)
* Navegação e continuidade de layout (elementos compartilhados, crossfade)

### Considerações

* **Acessibilidade**: sempre dê suporte a movimento reduzido
* **Adaptação ao dispositivo**: ajuste para dispositivos de baixo desempenho
* **Compensações de desempenho**: prefira responsividade a suavidade visual

### Evite Usar Motion Quando

* É puramente decorativo
* Reduz a usabilidade ou a clareza
* Impacta negativamente o desempenho

---

## Como Funciona

### Princípio Central

O movimento deve:

* Guiar a atenção
* Comunicar estado
* Preservar a continuidade espacial

Se não fizer nenhuma dessas coisas → remova-o.

---

### Instalação

```bash
npm install motion
```

---

### Versão

* `motion/react` - padrão para projetos atuais de Motion for React (pacote: `motion`)
* `framer-motion` - caminho de import legado para projetos que ainda dependem do Framer Motion

**Não misture.** Misturar causa schedulers internos conflitantes e contextos de `AnimatePresence` quebrados — componentes de um pacote não coordenarão animações de saída com componentes do outro.

Para verificar qual versão seu projeto usa:

```bash
cat package.json | grep -E '"motion"|"framer-motion"'
```

Sempre importe de uma única fonte de forma consistente:

```ts
// Correto (moderno)
import { motion, AnimatePresence } from "motion/react"

// Correto (legado)
import { motion, AnimatePresence } from "framer-motion"

// Nunca misture os dois no mesmo projeto
```

---

### Tokens de Motion

```ts
// motionTokens.ts
export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6
  },
  // Use estes como o valor de `ease` dentro de um objeto `transition`:
  // transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
  easing: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    sharp:  [0.4,  0, 0.2, 1] as [number, number, number, number]
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24
  }
}
```

Exemplo de uso:

```tsx
import { motionTokens } from "@/lib/motionTokens"

<motion.div
  initial={{ opacity: 0, y: motionTokens.distance.md }}
  animate={{ opacity: 1, y: 0 }}
  transition={{
    duration: motionTokens.duration.normal,
    ease: motionTokens.easing.smooth
  }}
/>
```

---

### Regras de Desempenho

**Seguro**

* transform
* opacity

**Evite**

* width / height
* top / left

Regra: responsividade > suavidade

---

### Adaptação ao Dispositivo

A heurística combina contagem de núcleos de CPU **e** memória disponível para um sinal mais confiável. `deviceMemory` está disponível no Chrome/Android; o fallback cobre Safari e Firefox.

```ts
const isLowEnd =
  typeof navigator !== "undefined" && (
    // Pouca memória (apenas Chrome/Android; indefinido nos demais → tratar como capaz)
    (navigator.deviceMemory !== undefined && navigator.deviceMemory <= 2) ||
    // Poucos núcleos E sem API de memória (cobre Safari/Firefox em hardware fraco)
    (navigator.deviceMemory === undefined && navigator.hardwareConcurrency <= 4)
  )

const duration = isLowEnd ? 0.2 : 0.4
```

---

### Acessibilidade

#### JS (useReducedMotion)

```tsx
import { motion, useReducedMotion } from "motion/react"

export function FadeIn() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
    />
  )
}
```

#### CSS

```css
@media (prefers-reduced-motion: reduce) {
  .motion-safe-transition {
    transition: opacity 0.2s;
  }

  .motion-reduce-transform {
    transform: none !important;
  }
}
```

#### Tailwind

```html
<div class="motion-safe:animate-fade motion-reduce:opacity-100"></div>
```

---

### Arquitetura e Padrões

#### Padrões Fundamentais

| Cenário | Padrão |
|---|---|
| Feedback de hover | `whileHover` |
| Feedback de toque / pressionar | `whileTap` |
| Revelar ao rolar | `whileInView` |
| Valor vinculado ao scroll | `useScroll` + `useTransform` |
| Montagem/desmontagem condicional | `AnimatePresence` |
| Pequenos deslocamentos de layout (elemento único, mudança < ~300px) | prop `layout` |
| Grandes deslocamentos de layout ou reflows de página inteira | Evite `layout`; use transições CSS ou roteamento no nível da página |
| Sequências complexas e imperativas | `useAnimate` |

> **Por que evitar `layout` em containers grandes?** A animação de layout do Framer usa `transform` para reconciliar posições, mas em elementos que ocupam toda a viewport ou disparam reflow profundo, o custo de medição causa jank visível e CLS. Prefira transições de CSS Grid/Flexbox ou coordene com `layoutId` apenas em elementos filhos específicos.

#### Layout e Transições

* Transições de elemento compartilhado → `layoutId` (deve ser único por instância montada)
* Transições de entrada / saída → `AnimatePresence` (veja a orientação de `mode` abaixo)

#### `mode` do AnimatePresence

Sempre especifique `mode` explicitamente — o padrão (`"sync"`) executa entrada e saída simultaneamente, o que causa sobreposição visual na maioria dos padrões de UI.

| `mode` | Quando usar |
|---|---|
| `"wait"` | A saída termina antes de a entrada começar. Use para **modais, toasts, transições de página**. |
| `"sync"` (padrão) | Entrada e saída se sobrepõem. Use apenas quando a sobreposição for intencional (ex.: carrosséis em crossfade). |
| `"popLayout"` | O elemento que sai é removido do fluxo imediatamente; os itens restantes animam para preencher. Use para **listas, abas, cards dispensáveis**. |

```tsx
// Modal — sempre use "wait"
<AnimatePresence mode="wait">
  {open && <Modal key="modal" />}
</AnimatePresence>

// Item de lista dispensável — use "popLayout"
<AnimatePresence mode="popLayout">
  {items.map(item => <Card key={item.id} />)}
</AnimatePresence>
```

---

### Padrões Avançados (Conceitos)

* Parallax (transforms vinculados ao scroll)
* Storytelling de scroll (seções fixas)
* Tilt 3D (transforms baseados no ponteiro)
* Crossfade (`layoutId` compartilhado)
* Revelação progressiva (clip-path)
* Carregamento com skeleton (opacity em loop)
* Microinterações (feedback de hover/tap)
* Sistema de springs (movimento baseado em física)

---

### Essenciais de Modal

* Focus trap
* Fechamento com Escape
* Bloqueio de scroll
* Roles ARIA
* Use `AnimatePresence mode="wait"` para que a animação de saída termine antes de o próximo modal entrar

#### Exemplo Completo

```tsx
import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

function useFocusTrap(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last  = focusable[focusable.length - 1]

    function handleKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    el.addEventListener("keydown", handleKey)
    first?.focus()
    return () => el.removeEventListener("keydown", handleKey)
  }, [active, ref])
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [active])
}

function Modal({ open, closeModal }: { open: boolean; closeModal: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useFocusTrap(ref, open)
  useScrollLock(open)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal()
    }
    if (open) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, closeModal])

  return (
    // mode="wait" garante que a animação de saída termine antes de qualquer novo modal entrar
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/40"
        >
          <motion.div
            ref={ref}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1,    opacity: 1 }}
            exit={{    scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white p-6 rounded"
          >
            <h2 id="modal-title">Dialog Title</h2>
            <button onClick={closeModal}>Close</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Example() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} closeModal={() => setOpen(false)} />
    </>
  )
}
```

---

### Segurança com SSR

* Faça os estados iniciais coincidirem entre as renderizações do servidor e do cliente
* Evite origens de animação implícitas (sempre defina `initial` explicitamente)
* Envolva os componentes de motion em `"use client"` no Next.js App Router

---

### Depuração

Verifique:

* Import errado (misturar `motion/react` e `framer-motion`)
* Diretiva `"use client"` ausente no Next.js App Router
* Prop `key` ausente nos filhos de `AnimatePresence`
* Incompatibilidade de hidratação (estado inicial difere entre SSR e cliente)
* Uso indevido da prop `layout` em containers grandes, causando jank de reflow
* Animação dirigida por estado não disparando (verifique os arrays de dependência)

---

### QA

* Sem CLS
* Teclado funciona
* Foco preso (trapped) em modais
* Roles ARIA corretos (`role="dialog"`, `aria-modal="true"`)
* Movimento reduzido respeitado (`useReducedMotion` + media query CSS)
* Sem avisos de hidratação no Next.js
* Animações param de forma limpa ao desmontar (sem vazamentos de memória)
* `AnimatePresence mode` definido explicitamente em todos os pontos de uso

---

### Anti-Padrões

* Animar propriedades de layout (`width`, `height`, `top`, `left`)
* Animações infinitas sem propósito (sempre pergunte: que estado isso comunica?)
* Stagger excessivo em listas (mantenha `staggerChildren` ≤ 0.1s; além disso parece lento)
* Ignorar preferências de movimento reduzido
* Usar `layout` em containers grandes ou de viewport inteira
* Omitir `mode` em `AnimatePresence` (o padrão `"sync"` causa sobreposição visual)
* Usar motion puramente para decoração

---

### Filosofia

Motion é design de interação.

---

### Regra Final

> Se o motion não melhora a UX → remova-o.

---

## Exemplos

### Interação de Botão

```tsx
import { motion } from "motion/react"

export function Button() {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
    >
      Click me
    </motion.button>
  )
}
```

---

### Exemplo de Movimento Reduzido

```tsx
import { motion, useReducedMotion } from "motion/react"

export function FadeIn() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0.1 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    />
  )
}
```

---

### Lista com Stagger

```tsx
import { motion } from "motion/react"

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 } // mantenha ≤ 0.1s para evitar lentidão
  }
}

const item = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } }
}

export function List() {
  return (
    <motion.ul variants={container} initial="hidden" animate="visible">
      {[1, 2, 3].map(i => (
        <motion.li key={i} variants={item}>Item {i}</motion.li>
      ))}
    </motion.ul>
  )
}
```

---

### Modal com AnimatePresence

```tsx
import { motion, AnimatePresence } from "motion/react"

export function Modal({ open }: { open: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1    }}
          exit={{    opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  )
}
```

---

### Parallax com Scroll

```tsx
import { useScroll, useTransform, motion } from "motion/react"

export function Parallax() {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  return <motion.div style={{ y }} />
}
```

---

### Skeleton de Carregamento

```tsx
import { motion } from "motion/react"

export function Skeleton() {
  return (
    <motion.div
      className="bg-gray-200 h-6 w-full rounded"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{
        duration: 1.5,       // pulso confortável — estava ausente, causava flash rápido
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}
```

---

### Layout Compartilhado (Crossfade)

```tsx
import { motion } from "motion/react"

// layoutId deve ser único por instância montada.
// Se múltiplas instâncias podem existir simultaneamente, acrescente um id único:
// layoutId={`shared-${item.id}`}
export function Shared() {
  return <motion.div layoutId="shared" />
}
```
