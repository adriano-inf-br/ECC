---
name: nodejs-keccak256
description: Previna bugs de hashing Ethereum em JavaScript e TypeScript. O sha3-256 do Node é o NIST SHA3, não o Keccak-256 do Ethereum, e quebra silenciosamente seletores, assinaturas, slots de armazenamento e derivação de endereço.
metadata:
  origin: ECC direct-port adaptation
version: "1.0.0"
---

# Node.js Keccak-256

O Ethereum usa Keccak-256, não a variante NIST-standardizada SHA3 exposta pelo `crypto.createHash('sha3-256')` do Node.

## Quando Usar

- Calculando seletores de função Ethereum ou tópicos de eventos
- Construindo helpers de EIP-712, assinatura, Merkle ou slot de armazenamento em JS/TS
- Revisando qualquer código que faça hash de dados Ethereum diretamente com o crypto do Node

## Como Funciona

Os dois algoritmos produzem saídas diferentes para a mesma entrada, e o Node não avisará você.

```javascript
import crypto from 'crypto';
import { keccak256, toUtf8Bytes } from 'ethers';

const data = 'hello';
const nistSha3 = crypto.createHash('sha3-256').update(data).digest('hex');
const keccak = keccak256(toUtf8Bytes(data)).slice(2);

console.log(nistSha3 === keccak); // false
```

## Exemplos

### ethers v6

```typescript
import { keccak256, toUtf8Bytes, solidityPackedKeccak256, id } from 'ethers';

const hash = keccak256(new Uint8Array([0x01, 0x02]));
const hash2 = keccak256(toUtf8Bytes('hello'));
const topic = id('Transfer(address,address,uint256)');
const packed = solidityPackedKeccak256(
  ['address', 'uint256'],
  ['0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c', 100n],
);
```

### viem

```typescript
import { keccak256, toBytes } from 'viem';

const hash = keccak256(toBytes('hello'));
```

### web3.js

```javascript
const hash = web3.utils.keccak256('hello');
const packed = web3.utils.soliditySha3(
  { type: 'address', value: '0x742d35Cc6634C0532925a3b8D4C9B569890FaC1c' },
  { type: 'uint256', value: '100' },
);
```

### Padrões comuns

```typescript
import { id, keccak256, AbiCoder } from 'ethers';

const selector = id('transfer(address,uint256)').slice(0, 10);
const typeHash = keccak256(toUtf8Bytes('Transfer(address from,address to,uint256 value)'));

function getMappingSlot(key: string, mappingSlot: number): string {
  return keccak256(
    AbiCoder.defaultAbiCoder().encode(['address', 'uint256'], [key, mappingSlot]),
  );
}
```

### Endereço a partir de chave pública

```typescript
import { keccak256 } from 'ethers';

function pubkeyToAddress(pubkeyBytes: Uint8Array): string {
  const hash = keccak256(pubkeyBytes.slice(1));
  return '0x' + hash.slice(-40);
}
```

### Audite seu código-fonte

```bash
grep -rn "createHash.*sha3" --include="*.ts" --include="*.js" --exclude-dir=node_modules .
grep -rn "keccak256" --include="*.ts" --include="*.js" . | grep -v node_modules
```

## Regra

Em contextos Ethereum, nunca use `crypto.createHash('sha3-256')`. Use helpers com suporte a Keccak de `ethers`, `viem`, `web3` ou outra implementação explícita de Keccak.
