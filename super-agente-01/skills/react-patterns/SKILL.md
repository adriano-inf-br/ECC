---
name: react-patterns
description: Padrões React 18/19 incluindo disciplina de hooks, limites de componentes servidor/cliente, Suspense + error boundaries, ações de formulário, busca de dados, árvores de decisão de gerenciamento de estado e composição com acessibilidade em primeiro lugar. Use ao escrever ou revisar componentes React.
metadata:
  origin: ECC
---

# Padrões React

Padrões React 18/19 idiomáticos para construir árvores de componentes robustas, acessíveis e de alto desempenho.

## Quando Ativar

- Escrevendo ou modificando componentes de função React, hooks customizados ou árvores de componentes
- Revisando arquivos JSX/TSX
- Projetando formato de estado ou composição de componentes
- Migrando componentes de classe ou código legado com `forwardRef`/`useEffect` excessivos
- Escolhendo entre estado local, estado elevado, contexto e stores externas
- Trabalhando com Server Components / Client Components (Next.js App Router, RSC)
- Implementando formulários com ações React 19 ou inputs controlados
- Conectando busca de dados com TanStack Query / SWR / RSC

## Princípios Fundamentais

### 1. Render é uma Função Pura de Props e Estado

```tsx
// Bom: derivar durante o render
function Cart({ items }: { items: CartItem[] }) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return <span>{formatMoney(total)}</span>;
}

// Ruim: estado derivado armazenado separadamente
function Cart({ items }: { items: CartItem[] }) {
  const [total, setTotal] = useState(0);
  useEffect(() => {
    setTotal(items.reduce((sum, i) => sum + i.price * i.qty, 0));
  }, [items]);
  return <span>{formatMoney(total)}</span>;
}
```

Estado derivado em `useEffect` adiciona um ciclo de render, pode ficar dessincronizado e obscurece o fluxo de dados.

### 2. Efeitos Colaterais Fora do Render

Efeitos, mutações, chamadas de rede e assinaturas ficam em handlers de eventos ou `useEffect` — nunca no corpo do render.

### 3. Composição Sobre Herança

React não tem modelo de herança para componentes. Componha com `children`, render props ou props de componente.

## Disciplina de Hooks

Veja [rules/react/hooks.md](../../rules/react/hooks.md) para o conjunto completo de regras. Destaques:

- Apenas no nível superior, nunca condicional
- Limpe toda assinatura, intervalo, listener
- Updater funcional (`setX(prev => prev + 1)`) quando o novo estado depende do anterior
- Posição padrão: não memorize — adicione `useMemo`/`useCallback` apenas quando um profiler ou uma cadeia de dependências provar que importa
- Extraia um hook customizado apenas quando a mesma sequência de hooks aparece em 2+ componentes

## Árvore de Decisão de Localização de Estado

```
Usado por apenas um componente?
  -> useState dentro dele

Usado pelo pai + alguns descendentes?
  -> eleve para o ancestral comum mais próximo

Usado em ramos distantes E leituras de baixa frequência (tema, auth, locale)?
  -> React Context

Atualizações de alta frequência compartilhadas pela árvore?
  -> store externa (Zustand, Jotai, Redux Toolkit)

Derivado de um servidor?
  -> biblioteca de estado de servidor (TanStack Query, SWR, RSC fetch)
```

A maioria das páginas não precisa de contexto ou store global. Resista à abstração até que a elevação duplicada se torne dolorosa.

## Server / Client Components (RSC)

```tsx
// Server Component - padrão, assíncrono, nunca envia JS por si mesmo
export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.product.findUnique({ where: { id: params.id } });
  if (!product) notFound();
  return <ProductView product={product} />;
}

// Client Component - opte com "use client"
"use client";
export function AddToCartButton({ productId }: { productId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => addToCart(productId))}
    >
      {pending ? "Adicionando..." : "Adicionar ao carrinho"}
    </button>
  );
}
```

Limites:

- Server -> Client: passe props serializáveis ou `children`
- Client -> Server: invoque Server Actions via `<form action={...}>` ou imperativamente a partir de handlers de eventos
- Nunca `import` um Server Component de um arquivo de Client Component — componha-os via `children`

## Suspense + Error Boundaries

```tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<UserSkeleton />}>
    <UserDetail id={id} />
  </Suspense>
</ErrorBoundary>
```

- Coloque os limites de Suspense próximos aos dados, não na raiz da rota — revele o conteúdo progressivamente
- Error Boundary permanece uma API de classe; use `react-error-boundary` para um wrapper compatível com hooks
- Um limite captura erros lançados durante render, lifecycle e construtores de seus filhos — NÃO em handlers de eventos ou código assíncrono

## Formulários

### Ações de formulário React 19 (preferido para novo código)

```tsx
"use client";
import { useActionState } from "react";

const initial = { error: null as string | null };

async function updateUserAction(_prev: typeof initial, formData: FormData) {
  "use server";
  const parsed = UserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Entrada inválida" };
  await db.user.update({ where: { id: parsed.data.id }, data: parsed.data });
  return { error: null };
}

export function UserForm() {
  const [state, formAction, pending] = useActionState(updateUserAction, initial);
  return (
    <form action={formAction}>
      <input name="name" required />
      <button type="submit" disabled={pending}>Salvar</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

### Inputs controlados

Use controlado quando o valor dirige outra UI, formata a cada tecla pressionada ou implementa validação em tempo real.

### Formulários complexos

Para formulários de múltiplos passos, arrays de campos dinâmicos ou validação cruzada de campos: use uma biblioteca (React Hook Form, TanStack Form). Gerenciar o estado de formulários além da complexidade trivial por conta própria é uma armadilha de manutenção.

## Matriz de Decisão de Busca de Dados

| Necessidade | Ferramenta |
|---|---|
| Dados por requisição no Next.js App Router | RSC `await fetch()` |
| Cache do lado do cliente + mutações + invalidação | TanStack Query |
| Cache leve do cliente + revalidação | SWR |
| Assinaturas em tempo real | Server-Sent Events, WebSockets ou a API de assinatura da lib |
| Fire-and-forget avulso | `fetch()` em um handler de evento |

Evite `useEffect` + `fetch` para dados de aplicação — condições de corrida, sem cache, sem retry, sem integração com Suspense.

## Receitas de Composição

### Slot via `children`

```tsx
<Layout>
  <Header />
  <Main>{content}</Main>
</Layout>
```

### Slots nomeados

```tsx
<Page header={<Nav />} sidebar={<Filters />}>
  <Results />
</Page>
```

### Componentes compostos (estado compartilhado via Context)

```tsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Perfil</Tabs.Trigger>
    <Tabs.Trigger value="settings">Configurações</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="profile"><Profile /></Tabs.Panel>
  <Tabs.Panel value="settings"><Settings /></Tabs.Panel>
</Tabs>
```

### Render prop / function-as-child

Útil quando o pai precisa passar parâmetros para a saída renderizada:

```tsx
<DataLoader id={id}>
  {({ data, isLoading }) => isLoading ? <Spinner /> : <UserCard user={data} />}
</DataLoader>
```

Alternativa moderna: um hook (`useData(id)`) retornando o mesmo formato — geralmente mais limpo.

## Desempenho

### Quando `React.memo` Realmente Ajuda

Envolva um componente em `React.memo` apenas quando:

1. Ele re-renderiza frequentemente
2. Suas props geralmente são as mesmas entre renders
3. Seu render é visivelmente custoso

`React.memo` adiciona uma verificação de igualdade em cada render. Se as props diferem na maioria dos renders, a verificação é sobrecarga pura.

### Evitando Cascatas de Render

- Abaixe o estado em vez de elevá-lo onde possível
- Divida o contexto: um contexto por preocupação, para que uma mudança em `themeContext` não re-renderize consumidores de auth
- Use `useSyncExternalStore` para bibliotecas de estado externas — necessário para renderização concorrente segura

### Listas

- Forneça props `key` estáveis (id do banco de dados, não índice do array)
- Virtualize listas longas com `@tanstack/react-virtual` ou `react-window` quando a contagem de itens visíveis ultrapassar ~50 com linhas não triviais

## Composição com Acessibilidade em Primeiro Lugar

- Sempre renderize HTML semântico (`<button>`, `<a>`, `<nav>`, `<main>`) antes de recorrer a atributos `role`
- Todo elemento interativo deve ser acessível pelo teclado
- Inputs de formulário precisam de labels — `<label htmlFor>` ou `aria-label` se rotulado visualmente por um ícone
- Gerencie o foco em mudanças de rota e abertura/fechamento de modais
- Execute `axe` em testes de componentes (veja [skills/react-testing](../react-testing/SKILL.md))
- Link cruzado: [skills/accessibility/SKILL.md](../accessibility/SKILL.md) abrange critérios WCAG e bibliotecas de padrões

## Roteamento

Esta skill é agnóstica em relação ao roteador. Os padrões acima funcionam com React Router, TanStack Router, Next.js App Router, Remix Router. Padrões específicos de roteador (loaders, actions, layouts aninhados) seguem a documentação do roteador — são preocupações de framework sobre o núcleo do React.

## Fora do Escopo (Seções de Referência)

- **Especificidades do Next.js**: carregamento de dados do App Router, Route Handlers, Middleware, Parallel Routes — preocupação separada, use a documentação do Next.js
- **React Native**: padrões específicos de plataforma diferem o suficiente para justificar uma skill `react-native-patterns` separada (ainda não presente)
- **Remix**: convenções de loader/action se sobrepõem com RSC, mas seguem a documentação do Remix

## Relacionados

- Rules: [rules/react/](../../rules/react/) — estilo de código, hooks, padrões, segurança, testes
- Skills: [react-performance](../react-performance/SKILL.md) para o conjunto de regras de desempenho derivado da Vercel, [frontend-patterns](../frontend-patterns/SKILL.md) para preocupações de UI cross-framework, [accessibility](../accessibility/SKILL.md), [angular-developer](../angular-developer/SKILL.md) para comparação de frameworks
- Agents: `react-reviewer` para revisão de código, `react-build-resolver` para erros de build/bundler
- Commands: `/react-review`, `/react-build`, `/react-test`

## Exemplos

### Hook customizado para busca com debounce

```tsx
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function SearchBox() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 300);
  const { data } = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchApi(debounced),
    enabled: debounced.length > 0,
  });
  return (
    <>
      <input value={query} onChange={(e) => setQuery(e.target.value)} />
      <Results items={data ?? []} />
    </>
  );
}
```

### UI Otimista com `useOptimistic` do React 19

```tsx
"use client";
import { useOptimistic } from "react";

export function MessageList({ messages }: { messages: Message[] }) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage],
  );

  async function send(formData: FormData) {
    const text = String(formData.get("text"));
    addOptimistic({ id: "pending", text, sender: "me" });
    await saveMessage(text);
  }

  return (
    <>
      <ul>{optimistic.map((m) => <li key={m.id}>{m.text}</li>)}</ul>
      <form action={send}>
        <input name="text" />
        <button type="submit">Enviar</button>
      </form>
    </>
  );
}
```

### Dividindo contexto para evitar cascatas de render

```tsx
// Dois contextos: um raramente muda, outro frequentemente
const ThemeContext = createContext<Theme>("light");
const NotificationsContext = createContext<Notification[]>([]);

// Um componente que apenas consome ThemeContext NÃO re-renderiza quando notificações mudam
```
