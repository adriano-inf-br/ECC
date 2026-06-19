---
paths:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/components/**/*.ts"
  - "**/components/**/*.js"
  - "**/app/**/*.tsx"
  - "**/pages/**/*.tsx"
---
# Padrões React

> Este arquivo estende [typescript/patterns.md](../typescript/patterns.md) e [common/patterns.md](../common/patterns.md) com conteúdo específico de React. Para regras específicas de hooks veja [hooks.md](./hooks.md).

## Divisão Container / Apresentação

Componentes container são donos do data fetching, do estado e dos efeitos colaterais. Componentes de apresentação recebem props e renderizam — sem chamadas de serviço, sem hooks além de estado local de UI.

```tsx
// Container — dono dos dados
export function UserPage({ userId }: { userId: string }) {
  const { data: user, isLoading } = useUser(userId);
  if (isLoading) return <Spinner />;
  if (!user) return <NotFound />;
  return <UserCard user={user} onSelect={handleSelect} />;
}

// Apresentação — puro
export function UserCard({ user, onSelect }: { user: User; onSelect: (id: string) => void }) {
  return <button onClick={() => onSelect(user.id)}>{user.name}</button>;
}
```

## Árvore de Decisão de Localização do Estado

1. Usado por um componente → `useState` dentro dele
2. Usado pelo pai + alguns filhos → eleve ao ancestral comum mais próximo, passe via props
3. Usado entre ramos distantes → React Context **apenas para leituras de baixa frequência** (tema, autenticação, locale)
4. Atualizações de alta frequência compartilhadas pela árvore → store externa (Zustand, Jotai, Redux Toolkit)
5. Dados derivados do servidor → biblioteca de estado de servidor (TanStack Query, SWR, fetch de RSC) — não estado de aplicação

Context usado indevidamente para valores que mudam com frequência faz com que todo consumidor re-renderize a cada atualização.

## Fronteira Server / Client Component (RSC, Next.js App Router)

- Server Components são o padrão — rodam no servidor, não são enviados ao cliente e podem usar `await` diretamente
- Client Components optam por entrar com `"use client"` no topo do arquivo
- Os dados fluem para baixo: um Server Component pode renderizar um Client Component e passar props serializáveis
- Um Client Component não pode importar um Server Component, mas pode recebê-lo via `children` ou slots nomeados

```tsx
// Server (padrão)
export default async function Page() {
  const user = await fetchUser();
  return <UserClient user={user} />;
}

// Client
"use client";
export function UserClient({ user }: { user: User }) {
  const [tab, setTab] = useState("profile");
  return <Tabs value={tab} onChange={setTab}>{user.name}</Tabs>;
}
```

- Nunca importe pacotes `"server-only"` (clientes de BD, segredos) de um arquivo de Client Component — encapsule-os em um Server Component ou Server Action
- Marque módulos sensíveis com `import "server-only"` para que o bundler gere erro se um arquivo de cliente os importar

## Suspense + Error Boundaries

Toda fronteira de Suspense precisa de um Error Boundary acima dela. O par lida com ambos os estados.

```tsx
<ErrorBoundary fallback={<ErrorView />}>
  <Suspense fallback={<Skeleton />}>
    <UserDetails id={id} />
  </Suspense>
</ErrorBoundary>
```

- Coloque fronteiras de Suspense próximas de onde os dados são necessários, não na raiz da rota
- Múltiplas fronteiras mais estreitas revelam o conteúdo carregado progressivamente
- O Error Boundary precisa ser um Componente de Classe (o React 19 ainda não tem equivalente funcional) OU use um wrapper de biblioteca como `react-error-boundary`

## Formulários

### Não controlados (React 19 + form actions)

Prefira inputs não controlados com form actions quando o formulário tem um passo de submissão claro. O navegador é dono do valor; o React o lê via `FormData` na submissão.

```tsx
async function action(formData: FormData) {
  "use server";
  await saveUser({ name: String(formData.get("name")) });
}

export function UserForm() {
  return (
    <form action={action}>
      <input name="name" required />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Controlados

Use inputs controlados quando o valor dirige outra parte da UI, requer validação em tempo real ou formatação.

```tsx
const [email, setEmail] = useState("");
return <input value={email} onChange={(e) => setEmail(e.target.value)} />;
```

### Bibliotecas de Formulário

Para formulários complexos (multi-etapa, arrays de campos dinâmicos, validação cruzada de campos), use uma biblioteca:

- React Hook Form — re-renderizações mínimas, prioriza inputs não controlados
- TanStack Form — tipado, agnóstico a framework
- Final Form — quando re-renderizações baseadas em assinatura importam

## Data Fetching

| Estratégia | Quando |
|---|---|
| fetch de RSC (`await` em Server Component) | Dados por requisição no Next.js App Router, sem necessidade de cache no lado do cliente |
| TanStack Query | Cache no lado do cliente, mutações, atualizações otimistas, polling |
| SWR | Cache leve + revalidação, mais simples que o TanStack Query |
| `fetch` em `useEffect` | Evite — condições de corrida, sem cache, sem retry. Aceitável apenas para um disparo único do tipo "atire e esqueça" |

Nunca faça fetch em um `useEffect` quando uma biblioteca de cache real estiver disponível — elas lidam com deduplicação, invalidação de cache, retry de erro e integração com Suspense.

## Listas e Keys

- A `key` deve ser estável entre renderizações — nunca `index` para qualquer lista que possa reordenar, inserir ou excluir
- A `key` deve ser única entre os irmãos, não globalmente
- Uma lista reordenada com keys de índice faz o estado dos componentes filhos se associar à linha errada

## Composição em vez de Herança

- Passe `children` para composição em estilo de slot
- Passe funções de render-prop para renderização parametrizada
- Passe tipos de componente para pontos de plug-in: `renderItem={UserRow}`
- Nunca estenda uma classe de componente para especializar o comportamento

## Componentes Compostos (Compound Components)

Para controles relacionados (Tabs, Accordion, Menu), use componentes compostos que compartilham estado via Context:

```tsx
<Tabs defaultValue="profile">
  <Tabs.List>
    <Tabs.Trigger value="profile">Profile</Tabs.Trigger>
    <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="profile"><ProfileForm /></Tabs.Panel>
  <Tabs.Panel value="settings"><SettingsForm /></Tabs.Panel>
</Tabs>
```

## Portals

Use `createPortal` para modais, tooltips, containers de toast — qualquer coisa que precise escapar do `overflow: hidden` ou do contexto de empilhamento `z-index` do pai. Renderize em um nó do DOM estável montado em `index.html`.

## Refs e Encaminhamento (React 19+)

O React 19 permite que componentes de função aceitem `ref` como uma prop comum — `forwardRef` não é mais necessário.

```tsx
export function Input({ ref, ...rest }: { ref?: React.Ref<HTMLInputElement> } & InputProps) {
  return <input ref={ref} {...rest} />;
}
```

Bases de código mais antigas no React 18 ainda precisam de `forwardRef`.

## Fora de Escopo (Seções de Apontamento)

### Next.js (App Router)

- Server Actions, Route Handlers, Middleware, Parallel/Intercepted Routes, Metadata em streaming
- Tratados como uma preocupação de framework separada — ao adicionar padrões profundos específicos do Next, proponha uma trilha dedicada `rules/nextjs/`
- Por ora, siga a documentação oficial do Next.js para detalhes do App Router

### React Native

- Imports específicos de plataforma (`Platform.OS`, `.ios.tsx` / `.android.tsx`), `StyleSheet`, bibliotecas de navegação (React Navigation, Expo Router)
- Tratados como uma trilha separada — `rules/react-native/` ainda não existe
- Os hooks/padrões centrais de React deste arquivo continuam valendo

## Referência de Skills

Para aprofundamentos específicos de React veja `skills/react-patterns/SKILL.md`. Para preocupações de frontend entre frameworks veja `skills/frontend-patterns/SKILL.md`. Para acessibilidade veja `skills/accessibility/SKILL.md`.
