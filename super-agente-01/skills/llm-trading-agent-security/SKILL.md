---
name: llm-trading-agent-security
description: Padrões de segurança para agentes de trading autônomos com autoridade sobre carteiras ou transações. Cobre prompt injection, limites de gasto, simulação pré-envio, circuit breakers, proteção contra MEV e manuseio de chaves.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# LLM Trading Agent Security

Agentes de trading autônomos têm um modelo de ameaça mais severo do que aplicações de LLM normais: uma injection ou um caminho de ferramenta ruim pode se converter diretamente em perda de ativos.

## Quando Usar

- Construir um agente de IA que assina e envia transações
- Auditar um bot de trading ou um assistente de execução on-chain
- Projetar o gerenciamento de chaves de carteira para um agente
- Dar a um LLM acesso a colocação de ordens, swaps ou operações de tesouraria

## Como Funciona

Empilhe as defesas. Nenhuma verificação isolada é suficiente. Trate higiene de prompt, política de gasto, simulação, limites de execução e isolamento de carteira como controles independentes.

## Exemplos

### Trate prompt injection como um ataque financeiro

```python
import re

INJECTION_PATTERNS = [
    r'ignore (previous|all) instructions',
    r'new (task|directive|instruction)',
    r'system prompt',
    r'send .{0,50} to 0x[0-9a-fA-F]{40}',
    r'transfer .{0,50} to',
    r'approve .{0,50} for',
]

def sanitize_onchain_data(text: str) -> str:
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            raise ValueError(f"Potential prompt injection: {text[:100]}")
    return text
```

Não injete cegamente nomes de tokens, rótulos de pares, webhooks ou feeds sociais em um prompt com capacidade de execução.

### Limites rígidos de gasto

```python
from decimal import Decimal

MAX_SINGLE_TX_USD = Decimal("500")
MAX_DAILY_SPEND_USD = Decimal("2000")

class SpendLimitError(Exception):
    pass

class SpendLimitGuard:
    def check_and_record(self, usd_amount: Decimal) -> None:
        if usd_amount > MAX_SINGLE_TX_USD:
            raise SpendLimitError(f"Single tx ${usd_amount} exceeds max ${MAX_SINGLE_TX_USD}")

        daily = self._get_24h_spend()
        if daily + usd_amount > MAX_DAILY_SPEND_USD:
            raise SpendLimitError(f"Daily limit: ${daily} + ${usd_amount} > ${MAX_DAILY_SPEND_USD}")

        self._record_spend(usd_amount)
```

### Simule antes de enviar

```python
class SlippageError(Exception):
    pass

async def safe_execute(self, tx: dict, expected_min_out: int | None = None) -> str:
    sim_result = await self.w3.eth.call(tx)

    if expected_min_out is None:
        raise ValueError("min_amount_out is required before send")

    actual_out = decode_uint256(sim_result)
    if actual_out < expected_min_out:
        raise SlippageError(f"Simulation: {actual_out} < {expected_min_out}")

    signed = self.account.sign_transaction(tx)
    return await self.w3.eth.send_raw_transaction(signed.raw_transaction)
```

### Circuit breaker

```python
class TradingCircuitBreaker:
    MAX_CONSECUTIVE_LOSSES = 3
    MAX_HOURLY_LOSS_PCT = 0.05

    def check(self, portfolio_value: float) -> None:
        if self.consecutive_losses >= self.MAX_CONSECUTIVE_LOSSES:
            self.halt("Too many consecutive losses")

        if self.hour_start_value <= 0:
            self.halt("Invalid hour_start_value")
            return

        hourly_pnl = (portfolio_value - self.hour_start_value) / self.hour_start_value
        if hourly_pnl < -self.MAX_HOURLY_LOSS_PCT:
            self.halt(f"Hourly PnL {hourly_pnl:.1%} below threshold")
```

### Isolamento de carteira

```python
import os
from eth_account import Account

private_key = os.environ.get("TRADING_WALLET_PRIVATE_KEY")
if not private_key:
    raise EnvironmentError("TRADING_WALLET_PRIVATE_KEY not set")

account = Account.from_key(private_key)
```

Use uma hot wallet dedicada apenas com os fundos de sessão necessários. Nunca aponte o agente para uma carteira de tesouraria principal.

### Proteção contra MEV e deadline

```python
import time

PRIVATE_RPC = "https://rpc.flashbots.net"
MAX_SLIPPAGE_BPS = {"stable": 10, "volatile": 50}
deadline = int(time.time()) + 60
```

## Pre-Deploy Checklist

- Dados externos são sanitizados antes de entrar no contexto do LLM
- Limites de gasto são impostos de forma independente da saída do modelo
- Transações são simuladas antes do envio
- `min_amount_out` é obrigatório
- Circuit breakers interrompem em caso de drawdown ou estado inválido
- Chaves vêm de variáveis de ambiente ou de um secret manager, nunca de código ou logs
- Mempool privado ou roteamento protegido é usado quando apropriado
- Slippage e deadlines são definidos por estratégia
- Todas as decisões do agente são registradas em log de auditoria, não apenas os envios bem-sucedidos
