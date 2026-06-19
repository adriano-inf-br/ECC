---
name: agent-payment-x402
description: Adicione execução de pagamentos x402 a agents de IA com orçamentos por tarefa, controles de gastos e carteiras não custodiais. Suporta Base via agentwallet-sdk e X Layer via OKX Payments / OKX Agent Payments Protocol.
metadata:
  origin: community
---

# Execução de Pagamentos de Agent (x402)

Permita que agents de IA façam pagamentos controlados por política com controles de gastos embutidos. Usa o protocolo de pagamento HTTP x402 e tools MCP para que agents possam pagar por serviços externos, APIs ou outros agents sem risco custodial.

## When to Use

Use quando: seu agent precisa pagar por uma chamada de API, comprar um serviço, acertar contas com outro agent, impor limites de gasto por tarefa ou gerenciar uma carteira não custodial. Combina naturalmente com as skills cost-aware-llm-pipeline e security-review.

## Árvore de Decisão

Escolha o caminho de integração com base em se seu agent está comprando acesso a uma API paga ou cobrando outros por uma:

| Necessidade | Caminho recomendado |
|------|------------------|
| Agent paga uma API protegida por 402 na Base ou em outra chain suportada pela agentwallet | Use `agentwallet-sdk` como servidor de pagamento MCP com política de gastos estrita |
| Agent paga uma API protegida por 402 na X Layer | Use o OKX Agent Payments Protocol de `okx/onchainos-skills`; `okx-x402-payment` é um alias legado depreciado |
| API TypeScript cobra agents | Use a documentação do SDK vendedor OKX Payments para TypeScript com Express, Hono, Fastify ou Next.js |
| API Go cobra agents | Use a documentação do SDK vendedor OKX Payments para Go com Gin, Echo ou `net/http` |
| API Rust cobra agents | Use a documentação do SDK vendedor OKX Payments para Rust com Axum |
| API Java cobra agents | Use a documentação do SDK vendedor OKX Payments para Java com Spring Boot 2/3, Java EE ou Jakarta |
| API Python cobra agents | Verifique o repositório OKX Payments atual antes da implementação; um guia de vendedor Python pode não estar disponível |

## Redes Suportadas

- `agentwallet-sdk`: use a documentação do pacote para confirmar a cobertura de rede atual antes de produção. Base Sepolia é o padrão de desenvolvimento mais seguro; a Base mainnet é o caminho de produção apontado pela skill original.
- OKX Payments / X Layer: a documentação atual de vendedor mira a X Layer (`eip155:196`) e a liquidação em USDT0. Busque a documentação atual do SDK antes de gerar código de produção, porque pacotes de pagamento e o comportamento do facilitador podem mudar rapidamente.

## How It Works

### Protocolo x402
O x402 estende o HTTP 402 (Payment Required) em um fluxo negociável por máquina. Quando um servidor retorna `402`, a tool de pagamento do agent negocia o preço, verifica o orçamento, assina uma transação e tenta novamente apenas dentro da fronteira de política e confirmação definida pelo orquestrador.

### Controles de Gastos
Toda chamada de tool de pagamento impõe uma `SpendingPolicy`:
- **Orçamento por tarefa** — gasto máximo para uma única ação de agent
- **Orçamento por sessão** — limite cumulativo ao longo de uma sessão inteira
- **Destinatários na allowlist** — restringe quais endereços/serviços o agent pode pagar
- **Limites de taxa (rate limits)** — máximo de transações por minuto/hora

### Carteiras Não Custodiais
Os agents detêm suas próprias chaves via smart accounts ERC-4337. O orquestrador define a política antes da delegação; o agent só pode gastar dentro dos limites. Sem fundos agrupados, sem risco custodial.

## Integração MCP

A camada de pagamento expõe tools MCP padrão que se encaixam em qualquer configuração de Claude Code ou harness de agent.

> **Nota de segurança**: Sempre fixe a versão do pacote. Esta tool gerencia chaves privadas — instalações `npx` sem versão fixa introduzem risco de supply chain.

### Opção A: agentwallet-sdk (Base / multi-chain)

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "npx",
      "args": ["agentwallet-sdk@6.0.0"]
    }
  }
}
```

### Tools Disponíveis (chamáveis pelo agent)

| Tool | Propósito |
|------|---------|
| `get_balance` | Verificar o saldo da carteira do agent |
| `send_payment` | Enviar pagamento para um endereço ou ENS |
| `check_spending` | Consultar o orçamento restante |
| `list_transactions` | Trilha de auditoria de todos os pagamentos |

> **Nota**: A política de gastos é definida pelo **orquestrador** antes de delegar ao agent — não pelo próprio agent. Isso impede que agents escalem seus próprios limites de gasto. Configure a política via `set_policy` na sua camada de orquestração ou hook de pré-tarefa, nunca como uma tool chamável pelo agent.

### Opção B: OKX Agent Payments Protocol (X Layer)

Use este caminho para os fluxos de x402 na X Layer, Multi-Party Payment (MPP), pagamento por sessão, cobrança (charge) e cobrança A2A.

Para fluxos de agent do lado comprador:

1. Instale ou referencie o repositório atual `okx/onchainos-skills`.
2. Use `skills/okx-agent-payments-protocol/SKILL.md` como o dispatcher.
3. Trate `skills/okx-x402-payment/SKILL.md` como um alias de compatibilidade depreciado, não como a skill canônica.
4. Exija confirmação explícita do usuário antes de verificações de status da carteira ou ações de pagamento. Não esconda a execução de pagamento atrás de uma chamada de tool genérica.

Para fluxos de API do lado vendedor, busque o guia mais recente específico da linguagem antes de gerar código:

| Runtime | Guia atual |
|---------|---------------|
| TypeScript | `https://raw.githubusercontent.com/okx/payments/main/typescript/SELLER.md` |
| Go | `https://raw.githubusercontent.com/okx/payments/main/go/x402/SELLER.md` |
| Rust | `https://raw.githubusercontent.com/okx/payments/main/rust/x402/SELLER.md` |
| Java | `https://raw.githubusercontent.com/okx/payments/main/java/SELLER.md` |

Não copie exemplos de documentações mais antigas sem verificar o repositório OKX atual. A orientação atual da OKX usa `okx-agent-payments-protocol` como o dispatcher, e a documentação de vendedor Java agora está disponível.

## Examples

### Imposição de orçamento em um cliente MCP

Ao construir um orquestrador que chama o servidor MCP agentpay, imponha orçamentos antes de despachar chamadas de tool pagas.

> **Pré-requisitos**: Instale o pacote antes de adicionar a config MCP — `npx` sem `-y` solicitará confirmação em ambientes não interativos, fazendo o servidor travar: `npm install -g agentwallet-sdk@6.0.0`

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // 1. Valide as credenciais antes de construir o transport.
  //    Uma chave ausente deve falhar imediatamente — nunca deixe o subprocesso iniciar sem auth.
  const walletKey = process.env.WALLET_PRIVATE_KEY;
  if (!walletKey) {
    throw new Error("WALLET_PRIVATE_KEY is not set — refusing to start payment server");
  }

  // Conecte-se ao servidor MCP agentpay via stdio transport.
  // Passe apenas as variáveis de ambiente que o servidor precisa — nunca encaminhe todo o process.env
  // para um subprocesso de terceiros que gerencia chaves privadas.
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["agentwallet-sdk@6.0.0"],
    env: {
      PATH: process.env.PATH ?? "",
      NODE_ENV: process.env.NODE_ENV ?? "production",
      WALLET_PRIVATE_KEY: walletKey,
    },
  });
  const agentpay = new Client({ name: "orchestrator", version: "1.0.0" });
  await agentpay.connect(transport);

  // 2. Defina a política de gastos antes de delegar ao agent.
  //    Sempre verifique o sucesso — uma falha silenciosa significa que nenhum controle está ativo.
  const policyResult = await agentpay.callTool({
    name: "set_policy",
    arguments: {
      per_task_budget: 0.50,
      per_session_budget: 5.00,
      allowlisted_recipients: ["api.example.com"],
    },
  });
  if (policyResult.isError) {
    throw new Error(
      `Failed to set spending policy — do not delegate: ${JSON.stringify(policyResult.content)}`
    );
  }

  // 3. Use preToolCheck antes de qualquer ação paga
  await preToolCheck(agentpay, 0.01);
}

// Hook de pré-tool: imposição de orçamento fail-closed com quatro caminhos de erro distintos.
async function preToolCheck(agentpay: Client, apiCost: number): Promise<void> {
  // Caminho 1: Rejeite entrada inválida (NaN/Infinity contornam a comparação <)
  if (!Number.isFinite(apiCost) || apiCost < 0) {
    throw new Error(`Invalid apiCost: ${apiCost} — action blocked`);
  }

  // Caminho 2: Falha de transport/conectividade
  let result;
  try {
    result = await agentpay.callTool({ name: "check_spending" });
  } catch (err) {
    throw new Error(`Payment service unreachable — action blocked: ${err}`);
  }

  // Caminho 3: A tool retornou um erro (ex.: falha de auth, carteira não inicializada)
  if (result.isError) {
    throw new Error(
      `check_spending failed — action blocked: ${JSON.stringify(result.content)}`
    );
  }

  // Caminho 4: Faça parse e valide o formato da resposta
  let remaining: number;
  try {
    const parsed = JSON.parse(
      (result.content as Array<{ text: string }>)[0].text
    );
    if (!Number.isFinite(parsed?.remaining)) {
      throw new TypeError("missing or non-finite 'remaining' field");
    }
    remaining = parsed.remaining;
  } catch (err) {
    throw new Error(
      `check_spending returned unexpected format — action blocked: ${err}`
    );
  }

  // Caminho 5: Orçamento excedido
  if (remaining < apiCost) {
    throw new Error(
      `Budget exceeded: need $${apiCost} but only $${remaining} remaining`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
```

## Boas Práticas

- **Defina orçamentos antes da delegação**: Ao gerar sub-agents, anexe uma SpendingPolicy via sua camada de orquestração. Nunca dê a um agent gasto ilimitado.
- **Fixe suas dependências**: Sempre especifique uma versão exata na sua config MCP (ex.: `agentwallet-sdk@6.0.0`). Verifique a integridade do pacote antes de fazer deploy em produção.
- **Trilhas de auditoria**: Use `list_transactions` em hooks de pós-tarefa para registrar o que foi gasto e por quê.
- **Falhe fechado (fail closed)**: Se a tool de pagamento estiver inacessível, bloqueie a ação paga — não recorra a acesso não medido.
- **Combine com security-review**: Tools de pagamento são de alto privilégio. Aplique o mesmo escrutínio que ao acesso ao shell.
- **Teste primeiro com testnets**: Use a Base Sepolia para desenvolvimento; troque para a Base mainnet para produção.

## Referência de Produção

- **npm**: [`agentwallet-sdk`](https://www.npmjs.com/package/agentwallet-sdk)
- **Incorporado ao NVIDIA NeMo Agent Toolkit**: [PR #17](https://github.com/NVIDIA/NeMo-Agent-Toolkit-Examples/pull/17) — tool de pagamento x402 para os exemplos de agent da NVIDIA
- **Especificação do protocolo**: [x402.org](https://x402.org)
- **SDKs OKX Payments**: [`okx/payments`](https://github.com/okx/payments) — integrações de vendedor em TypeScript, Go, Rust e Java para x402 na X Layer
- **Skill OKX Agent Payments Protocol**: [`okx/onchainos-skills`](https://github.com/okx/onchainos-skills/tree/main/skills/okx-agent-payments-protocol)
- **Visão geral do OKX Payments**: [web3.okx.com/onchainos/dev-docs/payments/overview](https://web3.okx.com/onchainos/dev-docs/payments/overview)
