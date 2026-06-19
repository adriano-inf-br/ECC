---
name: ai-regression-testing
description: Estratégias de teste de regressão para desenvolvimento assistido por IA. Testes de API em modo sandbox sem dependências de banco de dados, fluxos de trabalho automatizados de verificação de bugs e padrões para detectar pontos cegos da IA, onde o mesmo modelo escreve e revisa o código.
metadata:
  origin: ECC
---

# Testes de Regressão com IA

Padrões de teste projetados especificamente para o desenvolvimento assistido por IA, onde o mesmo modelo escreve o código e o revisa — criando pontos cegos sistemáticos que somente testes automatizados conseguem detectar.

## Quando Ativar

- Um agent de IA (Claude Code, Cursor, Codex) modificou rotas de API ou lógica de backend
- Um bug foi encontrado e corrigido — é preciso evitar a reintrodução
- O projeto tem um modo sandbox/mock que pode ser aproveitado para testes sem banco de dados
- Ao executar `/bug-check` ou comandos de revisão semelhantes após mudanças de código
- Existem múltiplos caminhos de código (sandbox vs. produção, feature flags, etc.)

## O Problema Central

Quando uma IA escreve código e depois revisa o próprio trabalho, ela carrega as mesmas premissas para ambas as etapas. Isso cria um padrão de falha previsível:

```
IA escreve a correção → IA revisa a correção → IA diz "parece correto" → O bug ainda existe
```

**Exemplo do mundo real** (observado em produção):

```
Correção 1: Adicionado notification_settings à resposta da API
  → Esqueceu de adicioná-lo à query SELECT
  → IA revisou e não percebeu (mesmo ponto cego)

Correção 2: Adicionado à query SELECT
  → Erro de build do TypeScript (coluna ausente nos tipos gerados)
  → IA revisou a Correção 1 mas não detectou o problema do SELECT

Correção 3: Alterado para SELECT *
  → Corrigiu o caminho de produção, esqueceu o caminho sandbox
  → IA revisou e não percebeu DE NOVO (4ª ocorrência)

Correção 4: O teste detectou na hora, na primeira execução PASS:
```

O padrão: **inconsistência entre o caminho sandbox e o de produção** é a regressão introduzida por IA nº 1.

## Testes de API em Modo Sandbox

A maioria dos projetos com arquitetura amigável a IA tem um modo sandbox/mock. Essa é a chave para testes de API rápidos e sem banco de dados.

### Configuração (Vitest + Next.js App Router)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["__tests__/**/*.test.ts"],
    setupFiles: ["__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

```typescript
// __tests__/setup.ts
// Força o modo sandbox — nenhum banco de dados necessário
process.env.SANDBOX_MODE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
```

### Helper de Teste para Rotas de API do Next.js

```typescript
// __tests__/helpers.ts
import { NextRequest } from "next/server";

export function createTestRequest(
  url: string,
  options?: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    sandboxUserId?: string;
  },
): NextRequest {
  const { method = "GET", body, headers = {}, sandboxUserId } = options || {};
  const fullUrl = url.startsWith("http") ? url : `http://localhost:3000${url}`;
  const reqHeaders: Record<string, string> = { ...headers };

  if (sandboxUserId) {
    reqHeaders["x-sandbox-user-id"] = sandboxUserId;
  }

  const init: { method: string; headers: Record<string, string>; body?: string } = {
    method,
    headers: reqHeaders,
  };

  if (body) {
    init.body = JSON.stringify(body);
    reqHeaders["content-type"] = "application/json";
  }

  return new NextRequest(fullUrl, init);
}

export async function parseResponse(response: Response) {
  const json = await response.json();
  return { status: response.status, json };
}
```

### Escrevendo Testes de Regressão

O princípio-chave: **escreva testes para os bugs encontrados, não para o código que funciona**.

```typescript
// __tests__/api/user/profile.test.ts
import { describe, it, expect } from "vitest";
import { createTestRequest, parseResponse } from "../../helpers";
import { GET, PATCH } from "@/app/api/user/profile/route";

// Define o contrato — quais campos DEVEM estar na resposta
const REQUIRED_FIELDS = [
  "id",
  "email",
  "full_name",
  "phone",
  "role",
  "created_at",
  "avatar_url",
  "notification_settings",  // ← Adicionado depois que um bug o encontrou ausente
];

describe("GET /api/user/profile", () => {
  it("returns all required fields", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { status, json } = await parseResponse(res);

    expect(status).toBe(200);
    for (const field of REQUIRED_FIELDS) {
      expect(json.data).toHaveProperty(field);
    }
  });

  // Teste de regressão — este bug exato foi introduzido pela IA 4 vezes
  it("notification_settings is not undefined (BUG-R1 regression)", async () => {
    const req = createTestRequest("/api/user/profile");
    const res = await GET(req);
    const { json } = await parseResponse(res);

    expect("notification_settings" in json.data).toBe(true);
    const ns = json.data.notification_settings;
    expect(ns === null || typeof ns === "object").toBe(true);
  });
});
```

### Testando a Paridade entre Sandbox e Produção

A regressão de IA mais comum: corrigir o caminho de produção mas esquecer o caminho sandbox (ou vice-versa).

```typescript
// Testa que as respostas do sandbox correspondem ao contrato esperado
describe("GET /api/user/messages (conversation list)", () => {
  it("includes partner_name in sandbox mode", async () => {
    const req = createTestRequest("/api/user/messages", {
      sandboxUserId: "user-001",
    });
    const res = await GET(req);
    const { json } = await parseResponse(res);

    // Isto detectou um bug em que partner_name foi adicionado
    // ao caminho de produção mas não ao caminho sandbox
    if (json.data.length > 0) {
      for (const conv of json.data) {
        expect("partner_name" in conv).toBe(true);
      }
    }
  });
});
```

## Integrando os Testes ao Fluxo de Trabalho de Verificação de Bugs

### Definição de Comando Customizado

```markdown
<!-- .claude/commands/bug-check.md -->
# Bug Check

## Step 1: Automated Tests (mandatory, cannot skip)

Run these commands FIRST before any code review:

    npm run test       # Vitest test suite
    npm run build      # TypeScript type check + build

- If tests fail → report as highest priority bug
- If build fails → report type errors as highest priority
- Only proceed to Step 2 if both pass

## Step 2: Code Review (AI review)

1. Sandbox / production path consistency
2. API response shape matches frontend expectations
3. SELECT clause completeness
4. Error handling with rollback
5. Optimistic update race conditions

## Step 3: For each bug fixed, propose a regression test
```

### O Fluxo de Trabalho

```
Usuário: "バグチェックして" (ou "/bug-check")
  │
  ├─ Etapa 1: npm run test
  │   ├─ FAIL → Bug encontrado mecanicamente (sem julgamento de IA necessário)
  │   └─ PASS → Continuar
  │
  ├─ Etapa 2: npm run build
  │   ├─ FAIL → Erro de tipo encontrado mecanicamente
  │   └─ PASS → Continuar
  │
  ├─ Etapa 3: Revisão de código por IA (com os pontos cegos conhecidos em mente)
  │   └─ Achados reportados
  │
  └─ Etapa 4: Para cada correção, escrever um teste de regressão
      └─ A próxima bug-check detecta se a correção quebrar
```

## Padrões Comuns de Regressão de IA

### Padrão 1: Divergência entre Caminho Sandbox e Produção

**Frequência**: Mais comum (observado em 3 de 4 regressões)

```typescript
// FAIL: A IA adiciona o campo somente ao caminho de produção
if (isSandboxMode()) {
  return { data: { id, email, name } };  // Falta o novo campo
}
// Caminho de produção
return { data: { id, email, name, notification_settings } };

// PASS: Ambos os caminhos devem retornar o mesmo formato
if (isSandboxMode()) {
  return { data: { id, email, name, notification_settings: null } };
}
return { data: { id, email, name, notification_settings } };
```

**Teste para detectá-lo**:

```typescript
it("sandbox and production return same fields", async () => {
  // No ambiente de teste, o modo sandbox é forçado a ON
  const res = await GET(createTestRequest("/api/user/profile"));
  const { json } = await parseResponse(res);

  for (const field of REQUIRED_FIELDS) {
    expect(json.data).toHaveProperty(field);
  }
});
```

### Padrão 2: Omissão da Cláusula SELECT

**Frequência**: Comum com Supabase/Prisma ao adicionar novas colunas

```typescript
// FAIL: Nova coluna adicionada à resposta mas não ao SELECT
const { data } = await supabase
  .from("users")
  .select("id, email, name")  // notification_settings não está aqui
  .single();

return { data: { ...data, notification_settings: data.notification_settings } };
// → notification_settings é sempre undefined

// PASS: Use SELECT * ou inclua explicitamente as novas colunas
const { data } = await supabase
  .from("users")
  .select("*")
  .single();
```

### Padrão 3: Vazamento de Estado de Erro

**Frequência**: Moderada — ao adicionar tratamento de erro a componentes existentes

```typescript
// FAIL: Estado de erro definido mas os dados antigos não limpos
catch (err) {
  setError("Failed to load");
  // reservations ainda mostra dados da aba anterior!
}

// PASS: Limpe o estado relacionado em caso de erro
catch (err) {
  setReservations([]);  // Limpa dados obsoletos
  setError("Failed to load");
}
```

### Padrão 4: Atualização Otimista sem Rollback Adequado

```typescript
// FAIL: Sem rollback em caso de falha
const handleRemove = async (id: string) => {
  setItems(prev => prev.filter(i => i.id !== id));
  await fetch(`/api/items/${id}`, { method: "DELETE" });
  // Se a API falhar, o item some da UI mas continua no DB
};

// PASS: Capture o estado anterior e faça rollback em caso de falha
const handleRemove = async (id: string) => {
  const prevItems = [...items];
  setItems(prev => prev.filter(i => i.id !== id));
  try {
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("API error");
  } catch {
    setItems(prevItems);  // Rollback
    alert("削除に失敗しました");
  }
};
```

## Estratégia: Teste Onde os Bugs Foram Encontrados

Não busque 100% de cobertura. Em vez disso:

```
Bug encontrado em /api/user/profile     → Escreva teste para a API de profile
Bug encontrado em /api/user/messages    → Escreva teste para a API de messages
Bug encontrado em /api/user/favorites   → Escreva teste para a API de favorites
Nenhum bug em /api/user/notifications   → Não escreva teste (ainda)
```

**Por que isso funciona no desenvolvimento com IA:**

1. A IA tende a cometer a **mesma categoria de erro** repetidamente
2. Os bugs se concentram em áreas complexas (autenticação, lógica de múltiplos caminhos, gerenciamento de estado)
3. Uma vez testada, aquela regressão exata **não pode acontecer de novo**
4. A quantidade de testes cresce organicamente com as correções de bugs — sem esforço desperdiçado

## Referência Rápida

| Padrão de Regressão de IA | Estratégia de Teste | Prioridade |
|---|---|---|
| Divergência sandbox/produção | Verifique o mesmo formato de resposta no modo sandbox |  Alta |
| Omissão da cláusula SELECT | Verifique todos os campos obrigatórios na resposta |  Alta |
| Vazamento de estado de erro | Verifique a limpeza de estado em caso de erro |  Média |
| Rollback ausente | Verifique se o estado é restaurado em falha de API |  Média |
| Type cast mascarando null | Verifique que o campo não é undefined |  Média |

## DO / DON'T

**DO:**
- Escreva testes imediatamente após encontrar um bug (antes de corrigi-lo, se possível)
- Teste o formato da resposta da API, não a implementação
- Execute os testes como primeiro passo de toda verificação de bugs
- Mantenha os testes rápidos (< 1 segundo no total com o modo sandbox)
- Nomeie os testes pelo bug que previnem (ex.: "BUG-R1 regression")

**DON'T:**
- Escrever testes para código que nunca teve um bug
- Confiar na autorrevisão da IA como substituta de testes automatizados
- Pular o teste do caminho sandbox porque "são só dados mock"
- Escrever testes de integração quando testes unitários bastam
- Mirar em porcentagem de cobertura — mire na prevenção de regressões
