---
name: defi-amm-security
description: Checklist de segurança para contratos AMM em Solidity, pools de liquidez e fluxos de swap. Cobre reentrância, ordenação CEI, ataques de doação ou inflação, manipulação de oráculo, slippage, controles de admin e aritmética de inteiros.
metadata:
  origin: adaptação de port direto da ECC
version: "1.0.0"
---

# DeFi AMM Security

Padrões críticos de vulnerabilidade e implementações endurecidas para contratos AMM em Solidity, cofres de LP e funções de swap.

## When to Use

- Escrever ou auditar um contrato AMM ou de pool de liquidez em Solidity
- Implementar fluxos de swap, depósito, saque, mint ou burn que mantêm saldos de token
- Revisar qualquer contrato que usa `token.balanceOf(address(this))` em aritmética de share ou de reserva
- Adicionar setters de fee, pausers, atualizações de oráculo ou outras funções de admin a um protocolo DeFi

## How It Works

Use isto como uma biblioteca de checklist mais padrões. Revise cada ponto de entrada de usuário em relação às categorias abaixo e prefira os exemplos endurecidos em vez de variantes feitas à mão.

## Segurança de Execução

Os comandos de shell nesta skill são exemplos de auditoria local. Execute-os apenas em um checkout confiável ou sandbox descartável, e não insira nomes de contrato, paths, URLs de RPC, chaves privadas ou flags fornecidas pelo usuário não confiáveis em comandos de shell. Pergunte antes de instalar ferramentas ou executar jobs longos de fuzzing/análise estática que possam consumir recursos locais ou pagos significativos.

Nunca inclua segredos, chaves privadas, seed phrases, tokens de API ou credenciais de assinatura de mainnet em exemplos de comando, logs ou relatórios.

## Examples

### Reentrância: imponha a ordem CEI

Vulnerável:

```solidity
function withdraw(uint256 amount) external {
    require(balances[msg.sender] >= amount);
    token.transfer(msg.sender, amount);
    balances[msg.sender] -= amount;
}
```

Seguro:

```solidity
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

using SafeERC20 for IERC20;

function withdraw(uint256 amount) external nonReentrant {
    require(balances[msg.sender] >= amount, "Insufficient");
    balances[msg.sender] -= amount;
    token.safeTransfer(msg.sender, amount);
}
```

Não escreva seu próprio guard quando existe uma biblioteca endurecida.

### Ataques de doação ou inflação

Usar `token.balanceOf(address(this))` diretamente para aritmética de share permite que atacantes manipulem o denominador enviando tokens ao contrato fora do caminho pretendido.

```solidity
// Vulnerável
function deposit(uint256 assets) external returns (uint256 shares) {
    shares = (assets * totalShares) / token.balanceOf(address(this));
}
```

```solidity
// Seguro
uint256 private _totalAssets;

function deposit(uint256 assets) external nonReentrant returns (uint256 shares) {
    uint256 balBefore = token.balanceOf(address(this));
    token.safeTransferFrom(msg.sender, address(this), assets);
    uint256 received = token.balanceOf(address(this)) - balBefore;

    shares = totalShares == 0 ? received : (received * totalShares) / _totalAssets;
    _totalAssets += received;
    totalShares += shares;
}
```

Rastreie a contabilidade interna e meça os tokens realmente recebidos.

### Manipulação de oráculo

Preços spot são manipuláveis por flash loan. Prefira TWAP.

```solidity
uint32[] memory secondsAgos = new uint32[](2);
secondsAgos[0] = 1800;
secondsAgos[1] = 0;
(int56[] memory tickCumulatives,) = IUniswapV3Pool(pool).observe(secondsAgos);
int24 twapTick = int24(
    (tickCumulatives[1] - tickCumulatives[0]) / int56(uint56(30 minutes))
);
uint160 sqrtPriceX96 = TickMath.getSqrtRatioAtTick(twapTick);
```

### Proteção de slippage

Todo caminho de swap precisa de slippage fornecido pelo chamador e de um deadline.

```solidity
function swap(
    uint256 amountIn,
    uint256 amountOutMin,
    uint256 deadline
) external returns (uint256 amountOut) {
    require(block.timestamp <= deadline, "Expired");
    amountOut = _calculateOut(amountIn);
    require(amountOut >= amountOutMin, "Slippage exceeded");
    _executeSwap(amountIn, amountOut);
}
```

### Aritmética de reserva segura

```solidity
import {FullMath} from "@uniswap/v3-core/contracts/libraries/FullMath.sol";

uint256 result = FullMath.mulDiv(a, b, c);
```

Para aritmética de reserva grande, evite o ingênuo `a * b / c` quando houver risco de overflow.

### Controles de admin

```solidity
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";

contract MyAMM is Ownable2Step {
    function setFee(uint256 fee) external onlyOwner { ... }
    function pause() external onlyOwner { ... }
}
```

Prefira aceitação explícita para transferência de propriedade e proteja todo caminho privilegiado.

## Checklist de Segurança

- Pontos de entrada expostos a reentrância usam `nonReentrant`
- A ordenação CEI é respeitada
- A aritmética de share não depende de `balanceOf(address(this))` bruto
- Transferências de ERC-20 usam `SafeERC20`
- Depósitos medem os tokens realmente recebidos
- Leituras de oráculo usam TWAP ou outra fonte resistente a manipulação
- Swaps exigem `amountOutMin` e `deadline`
- Aritmética de reserva sensível a overflow usa primitivas seguras como `mulDiv`
- Funções de admin têm controle de acesso
- Existe um pause de emergência e ele é testado
- Análise estática e fuzzing são executados antes da produção

## Ferramentas de Auditoria

```bash
pip install slither-analyzer
slither . --exclude-dependencies

echidna-test . --contract YourAMM --config echidna.yaml

forge test --fuzz-runs 10000
```
