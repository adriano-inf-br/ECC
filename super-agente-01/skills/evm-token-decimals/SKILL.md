---
name: evm-token-decimals
description: Previne bugs silenciosos de incompatibilidade de casas decimais entre chains EVM. Cobre a consulta de decimais em tempo de execução, cache por chain, deriva de precisão de tokens em bridge e normalização segura para bots, dashboards e ferramentas DeFi.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# EVM Token Decimals

Incompatibilidades silenciosas de casas decimais são uma das formas mais fáceis de entregar saldos ou valores em USD errados por ordens de magnitude sem disparar nenhum erro.

## When to Use

- Ler saldos ERC-20 em Python, TypeScript ou Solidity
- Calcular valores em moeda fiduciária a partir de saldos on-chain
- Comparar quantidades de tokens em múltiplas chains EVM
- Lidar com ativos transferidos por bridge
- Construir rastreadores de portfólio, bots ou agregadores

## How It Works

Nunca assuma que stablecoins usam as mesmas casas decimais em todos os lugares. Consulte `decimals()` em tempo de execução, faça cache por `(chain_id, token_address)` e use matemática segura para decimais nos cálculos de valor.

## Examples

### Consultar decimais em tempo de execução

```python
from decimal import Decimal
from web3 import Web3

ERC20_ABI = [
    {"name": "decimals", "type": "function", "inputs": [],
     "outputs": [{"type": "uint8"}], "stateMutability": "view"},
    {"name": "balanceOf", "type": "function",
     "inputs": [{"name": "account", "type": "address"}],
     "outputs": [{"type": "uint256"}], "stateMutability": "view"},
]

def get_token_balance(w3: Web3, token_address: str, wallet: str) -> Decimal:
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    decimals = contract.functions.decimals().call()
    raw = contract.functions.balanceOf(Web3.to_checksum_address(wallet)).call()
    return Decimal(raw) / Decimal(10 ** decimals)
```

Não cravar `1_000_000` só porque um símbolo normalmente tem 6 casas decimais em algum outro lugar.

### Fazer cache por chain e token

```python
from functools import lru_cache

@lru_cache(maxsize=512)
def get_decimals(chain_id: int, token_address: str) -> int:
    w3 = get_web3_for_chain(chain_id)
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(token_address),
        abi=ERC20_ABI,
    )
    return contract.functions.decimals().call()
```

### Lidar com tokens atípicos de forma defensiva

```python
try:
    decimals = contract.functions.decimals().call()
except Exception:
    logging.warning(
        "decimals() reverted on %s (chain %s), defaulting to 18",
        token_address,
        chain_id,
    )
    decimals = 18
```

Registre o fallback e mantenha-o visível. Tokens antigos ou fora do padrão ainda existem.

### Normalizar para WAD de 18 casas decimais em Solidity

```solidity
interface IERC20Metadata {
    function decimals() external view returns (uint8);
}

function normalizeToWad(address token, uint256 amount) internal view returns (uint256) {
    uint8 d = IERC20Metadata(token).decimals();
    if (d == 18) return amount;
    if (d < 18) return amount * 10 ** (18 - d);
    return amount / 10 ** (d - 18);
}
```

### TypeScript com ethers

```typescript
import { Contract, formatUnits } from 'ethers';

const ERC20_ABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
];

async function getBalance(provider: any, tokenAddress: string, wallet: string): Promise<string> {
  const token = new Contract(tokenAddress, ERC20_ABI, provider);
  const [decimals, raw] = await Promise.all([
    token.decimals(),
    token.balanceOf(wallet),
  ]);
  return formatUnits(raw, decimals);
}
```

### Verificação rápida on-chain

```bash
cast call <token_address> "decimals()(uint8)" --rpc-url <rpc>
```

## Rules

- Sempre consulte `decimals()` em tempo de execução
- Faça cache por chain mais endereço do token, não por símbolo
- Use `Decimal`, `BigInt` ou matemática exata equivalente, não float
- Reconsulte os decimais após bridging ou alterações de wrapper
- Normalize a contabilidade interna de forma consistente antes de comparar ou precificar
