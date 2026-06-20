---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# Estilo de Código TypeScript/JavaScript

> Este arquivo estende [common/coding-style.md](../common/coding-style.md) com conteúdo específico de TypeScript/JavaScript.

## Tipos e Interfaces

Use tipos para tornar APIs públicas, modelos compartilhados e props de componentes explícitos, legíveis e reutilizáveis.

### APIs Públicas

- Adicione tipos de parâmetro e de retorno a funções exportadas, utilitários compartilhados e métodos públicos de classe
- Deixe o TypeScript inferir tipos óbvios de variáveis locais
- Extraia formatos de objeto inline repetidos para tipos ou interfaces nomeados

```typescript
// ERRADO: Função exportada sem tipos explícitos
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}

// CORRETO: Tipos explícitos em APIs públicas
interface User {
  firstName: string
  lastName: string
}

export function formatUser(user: User): string {
  return `${user.firstName} ${user.lastName}`
}
```

### Interfaces vs. Aliases de Tipo

- Use `interface` para formatos de objeto que podem ser estendidos ou implementados
- Use `type` para uniões, interseções, tuplas, mapped types e utility types
- Prefira uniões de literais de string em vez de `enum`, a menos que um `enum` seja exigido para interoperabilidade

```typescript
interface User {
  id: string
  email: string
}

type UserRole = 'admin' | 'member'
type UserWithRole = User & {
  role: UserRole
}
```

### Evite `any`

- Evite `any` no código da aplicação
- Use `unknown` para entrada externa ou não confiável, depois faça a narrowing dela com segurança
- Use generics quando o tipo de um valor depende de quem chama

```typescript
// ERRADO: any remove a segurança de tipos
function getErrorMessage(error: any) {
  return error.message
}

// CORRETO: unknown força a narrowing segura
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}
```

### Props do React

- Defina props de componentes com uma `interface` ou `type` nomeado
- Tipe props de callback explicitamente
- Não use `React.FC` a menos que haja um motivo específico para isso

```typescript
interface User {
  id: string
  email: string
}

interface UserCardProps {
  user: User
  onSelect: (id: string) => void
}

function UserCard({ user, onSelect }: UserCardProps) {
  return <button onClick={() => onSelect(user.id)}>{user.email}</button>
}
```

### Arquivos JavaScript

- Em arquivos `.js` e `.jsx`, use JSDoc quando os tipos melhoram a clareza e uma migração para TypeScript não é prática
- Mantenha o JSDoc alinhado com o comportamento em tempo de execução

```javascript
/**
 * @param {{ firstName: string, lastName: string }} user
 * @returns {string}
 */
export function formatUser(user) {
  return `${user.firstName} ${user.lastName}`
}
```

## Imutabilidade

Use o operador spread para atualizações imutáveis:

```typescript
interface User {
  id: string
  name: string
}

// ERRADO: Mutação
function updateUser(user: User, name: string): User {
  user.name = name // MUTAÇÃO!
  return user
}

// CORRETO: Imutabilidade
function updateUser(user: Readonly<User>, name: string): User {
  return {
    ...user,
    name
  }
}
```

## Tratamento de Erros

Use async/await com try-catch e faça a narrowing de erros unknown com segurança:

```typescript
interface User {
  id: string
  email: string
}

declare function riskyOperation(userId: string): Promise<User>

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'Unexpected error'
}

const logger = {
  error: (message: string, error: unknown) => {
    // Substitua pelo seu logger de produção (por exemplo, pino ou winston).
  }
}

async function loadUser(userId: string): Promise<User> {
  try {
    const result = await riskyOperation(userId)
    return result
  } catch (error: unknown) {
    logger.error('Operation failed', error)
    throw new Error(getErrorMessage(error))
  }
}
```

## Validação de Entrada

Use Zod para validação baseada em schema e infira tipos a partir do schema:

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0).max(150)
})

type UserInput = z.infer<typeof userSchema>

const validated: UserInput = userSchema.parse(input)
```

## Console.log

- Sem instruções `console.log` em código de produção
- Use bibliotecas de logging adequadas em vez disso
- Veja os hooks para detecção automática
