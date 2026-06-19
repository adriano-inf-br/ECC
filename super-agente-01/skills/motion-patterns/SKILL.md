---
name: motion-patterns
description: Padrões de animação prontos para produção para React / Next.js — botão, modal, toast, stagger, transições de página, animações de saída, scroll e layout — construídos sobre os tokens e springs do motion-foundations.
version: 1.0
tags: [motion, animation, ui-patterns]
category: frontend
author: jeff
---

# Motion Patterns

Padrões de copiar e colar para as necessidades mais comuns de animação de UI.
Todo padrão aqui é construído sobre os tokens e springs do `motion-foundations`.
Não defina novos valores de duração ou easing aqui — importe-os.

## When to Activate

- Animar um botão, card, modal ou notificação toast
- Construir entradas de listas com stagger
- Configurar transições de página no Next.js App Router
- Adicionar animações de entrada ou saída a conteúdo condicional
- Implementar scroll-reveal, progresso vinculado ao scroll ou seções de história fixas (sticky)
- Construir cards expansíveis, accordions ou transições de elemento compartilhado

## Outputs

Esta skill produz:

- Animação acessível e segura para SSR para todos os componentes de UI padrão
- Renderizações condicionais envolvidas por `AnimatePresence` com comportamento de saída correto
- Componente wrapper de transição de página para o Next.js App Router
- Padrões de scroll-reveal e vinculados ao scroll usando `useScroll` + `useTransform`
- Padrões de animação de layout (`layout`, `layoutId`) para elementos expansíveis e em crossfade

## Principles

- Todo padrão importa do `motion-foundations`. Nada de números soltos.
- Toda renderização condicional é envolvida em `AnimatePresence` com uma `key`.
- Animações de saída são sempre definidas junto com as de entrada — nunca como algo secundário.
- `layout` é usado apenas para deslocamentos pequenos e isolados. Subárvores grandes recebem transforms explícitos.

## Rules

1. **Sempre envolva renderizações condicionais em `AnimatePresence` com uma `key`** no filho direto. Sem uma key, as animações de saída nunca disparam.
2. **Sempre defina `exit` ao definir `initial` + `animate`.** Uma animação sem saída está incompleta.
3. **Use `mode="wait"` em transições de página.** A entrada não deve começar antes que a saída termine.
4. **Nunca use `layout` em subárvores com mais de ~5 filhos ou DOM profundamente aninhado.** Use transforms explícitos de `x`/`y` em vez disso.
5. **O intervalo de stagger deve ficar entre `0.05s` e `0.10s`.** Abaixo disso parece mecânico; acima parece lento.
6. **Modais devem sempre incluir:** focus trap, fechamento com tecla Escape, bloqueio de scroll, `role="dialog"`, `aria-modal="true"`.
7. **Scroll reveals usam `viewport={{ once: true }}`.** Repetir ao sair da tela distrai, em vez de informar.
8. **Todos os valores de token são importados do `motion-foundations`.** Nada de números inline.

## Decision Guidance

### Choosing the right pattern

| Situação | Padrão |
| ---------------------------------------- | ---------------------- |
| Elemento aparece / desaparece            | `AnimatePresence`      |
| Lista de itens carregando em sequência   | Variantes de stagger   |
| Navegar entre rotas                      | Wrapper de transição de página|
| Elemento muda de tamanho no lugar        | prop `layout`          |
| Mesmo elemento se move entre contextos da página | `layoutId`        |
| Elemento entra ao ser rolado para a visão | `whileInView`         |
| Valor atrelado à posição do scroll       | `useScroll` + `useTransform` |

### When to use `mode="wait"` vs `mode="sync"`

| Modo | Use quando |
| ------- | --------------------------------------- |
| `wait` | Transições de página, troca de conteúdo (um de cada vez) |
| `sync` | Notificações empilhadas, itens de lista (sobreposição é aceitável) |
| `popLayout` | Itens removidos de uma lista que faz reflow |

## Core Concepts

### AnimatePresence contract

Três coisas devem ser sempre verdadeiras:

1. `AnimatePresence` envolve o condicional
2. O filho direto tem uma `key`
3. O filho tem uma prop `exit`

Se faltar qualquer uma delas, a animação de saída falha silenciosamente.

### layout vs layoutId

- `layout` — anima a própria mudança de tamanho/posição do elemento no lugar
- `layoutId` — vincula dois elementos separados, fazendo crossfade entre eles ao longo das renderizações

Use `layout="position"` em texto dentro de um container que expande para evitar que o reflow do texto seja animado.

## Code Examples

### Button feedback

```tsx
"use client"
import { motion } from "motion/react"
import { springs, motionTokens } from "@/lib/motion-tokens"

<motion.button
  whileHover={{ scale: motionTokens.scale.pop }}
  whileTap={{ scale: motionTokens.scale.press }}
  transition={springs.snappy}
/>
```

### Stagger list

```tsx
"use client"
import { motion } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,   // dentro da regra 0.05–0.10
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden:  { opacity: 0, y: motionTokens.distance.md },
  visible: { opacity: 1, y: 0, transition: springs.gentle },
}

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map((i) => (
    <motion.li key={i.id} variants={item} />
  ))}
</motion.ul>
```

### Modal

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

// Envolva no ponto de chamada:
// <AnimatePresence>{isOpen && <Modal key="modal" />}</AnimatePresence>

export function Modal({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Painel — requisitos de acessibilidade: focus trap, fechamento com Escape,
          bloqueio de scroll, role="dialog", aria-modal="true" */}
      <motion.div
        role="dialog"
        aria-modal="true"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 rounded-xl bg-white p-6"
        initial={{
          opacity: 0,
          scale: motionTokens.scale.press,
          y: motionTokens.distance.sm,
        }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{
          opacity: 0,
          scale: motionTokens.scale.press,
          y: motionTokens.distance.sm,
        }}
        transition={springs.gentle}
      />
    </>
  )
}
```

### Toast stack

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

<AnimatePresence mode="sync">
  {toasts.map((t) => (
    <motion.div
      key={t.id}
      layout
      initial={{
        opacity: 0,
        x: motionTokens.distance.xl,
        scale: motionTokens.scale.subtle,
      }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{
        opacity: 0,
        x: motionTokens.distance.xl,
        scale: motionTokens.scale.subtle,
      }}
      transition={springs.snappy}
    />
  ))}
</AnimatePresence>
```

### Page transition (Next.js App Router)

```tsx
// components/page-transition.tsx
"use client"
import { motion, AnimatePresence } from "motion/react"
import { usePathname } from "next/navigation"
import { motionTokens } from "@/lib/motion-tokens"

const variants = {
  initial: { opacity: 0, y: motionTokens.distance.sm },
  enter:   { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -motionTokens.distance.sm },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={{
          duration: motionTokens.duration.normal,
          ease: motionTokens.easing.smooth,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### Scroll reveal

```tsx
"use client"
import { motion } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"

<motion.div
  initial={{ opacity: 0, y: motionTokens.distance.lg }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-80px" }}   // once: true — regra 7
  transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
/>
```

### Scroll progress bar

```tsx
"use client"
import { motion, useScroll } from "motion/react"

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      className="fixed top-0 left-0 h-1 bg-indigo-500 origin-left w-full"
      style={{ scaleX: scrollYProgress }}
    />
  )
}
```

### Expanding card

```tsx
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { springs, motionTokens } from "@/lib/motion-tokens"

export function ExpandingCard({ title, body }: { title: string; body: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div layout onClick={() => setExpanded(!expanded)} className="cursor-pointer">
      {/* layout="position" evita que o reflow do texto seja animado */}
      <motion.h2 layout="position" className="font-semibold">
        {title}
      </motion.h2>

      <AnimatePresence>
        {expanded && (
          <motion.p
            key="body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionTokens.duration.fast }}
          >
            {body}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### Shared-element crossfade

```tsx
// Contexto de origem
<motion.img layoutId="hero-image" src={src} className="w-16 h-16 rounded" />

// Contexto de destino (mesmo layoutId — o motion cuida da transição)
<motion.img layoutId="hero-image" src={src} className="w-full rounded-xl" />
```

### Accordion

```tsx
<motion.div
  initial={false}
  animate={{ opacity: open ? 1 : 0, scaleY: open ? 1 : 0 }}
  style={{ transformOrigin: "top", overflow: "hidden" }}
  transition={{
    duration: motionTokens.duration.normal,
    ease: motionTokens.easing.smooth,
  }}
> {children}
</motion.div>
```

## End-to-End Example

Uma lista com stagger que entra ao montar, lida com presença condicional e
respeita movimento reduzido — combinando tokens, springs, AnimatePresence e
o hook de acessibilidade do `motion-foundations`:

```tsx
"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { motionTokens, springs } from "@/lib/motion-tokens"
import { useSafeMotion } from "@/hooks/use-reduced-motion"

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

function ListItem({ label, onRemove }: { label: string; onRemove: () => void }) {
  const safe = useSafeMotion(motionTokens.distance.sm)
  return (
    <motion.li
      variants={{
        hidden:  safe.initial,
        visible: safe.animate,
      }}
      exit={safe.exit}
      transition={springs.gentle}
      className="flex items-center justify-between p-3 rounded-lg bg-white shadow-sm"
    >
      <span>{label}</span>
      <button onClick={onRemove}>Remove</button>
    </motion.li>
  )
}

export function AnimatedList({ items, onRemove }: {
  items: { id: string; label: string }[]
  onRemove: (id: string) => void
}) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-2"
    >
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ListItem
            key={item.id}
            label={item.label}
            onRemove={() => onRemove(item.id)}
          />
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
```

## Constraints / Non-Goals

Esta skill **não** cobre:

- Definições de tokens e springs → veja `motion-foundations`
- Interações de arrastar (drag), gestos de swipe, listas reordenáveis → veja `motion-advanced`
- Animações de texto (revelação de palavra/caractere, contadores) → veja `motion-advanced`
- Desenho ou morphing de paths SVG → veja `motion-advanced`
- Hooks de animação customizados → veja `motion-advanced`
- Transições somente em CSS que não usam `motion/react`

## Anti-Patterns

| Antipadrão | Regra violada | Correção |
| -------------------------------------------- | ------- | ------------------------------------------ |
| Filho de `AnimatePresence` sem `key` | Regra 1 | Adicione uma `key` estável ao filho direto |
| `initial` + `animate` sem `exit` | Regra 2 | Sempre defina os três juntos |
| Transição de página sem `mode="wait"` | Regra 3 | Adicione `mode="wait"` ao `AnimatePresence` |
| `layout` em uma lista de 50 itens | Regra 4 | Use `mode="popLayout"` ou transforms explícitos |
| `staggerChildren: 0.2` em uma lista de 10 itens | Regra 5 | Limite a `0.08–0.10` |
| Modal sem focus trap | Regra 6 | Adicione `focus-trap-react` ou Radix Dialog |
| `whileInView` sem `viewport={{ once: true }}` | Regra 7 | Entradas repetidas distraem, não informam |
| `transition={{ duration: 0.3 }}` inline | Regra 8 | Use `motionTokens.duration.normal` |

## Related Skills

- **`motion-foundations`** — define todos os tokens, springs, o hook `useSafeMotion` e os guards de SSR que todo padrão aqui importa. Deve ser configurada primeiro.
- **`motion-advanced`** — estende esses padrões com drag, gestos, SVG, texto, hooks customizados e sequenciamento imperativo. Não redefine nenhum padrão desta skill.
