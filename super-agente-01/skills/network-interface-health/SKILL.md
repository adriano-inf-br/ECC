---
name: network-interface-health
description: Diagnostique erros de interface, drops, CRCs, incompatibilidades de duplex, flapping, problemas de negociação de velocidade e tendências de contadores em roteadores, switches e hosts Linux.
metadata:
  origin: community
---

# Saúde de Interface de Rede

Use esta skill quando um sintoma de rede puder ser causado por um link físico, porta de
switch, cabo, transceiver, configuração de duplex ou interface congestionada.

## Quando Usar

- Um host ou VLAN apresenta perda de pacotes, picos de latência ou alcançabilidade intermitente.
- Uma interface de switch ou roteador mostra CRCs, runts, giants, drops, resets ou flaps.
- Você precisa comparar ambos os lados de um link antes de substituir hardware.
- Uma janela de mudança precisa de evidências de contadores de interface antes/depois.
- O monitoramento reporta aumento de `ifInErrors`, `ifOutErrors` ou `ifOutDiscards`.

## Como Funciona

Contadores de interface são evidências, mas a tendência importa mais do que o número
absoluto. Capture uma linha de base, aguarde um intervalo de medição, capture novamente e
compare os incrementos.

```text
show interfaces <interface>
show interfaces <interface> status
show logging | include <interface>|changed state|line protocol
```

Em hosts Linux:

```text
ip -s link show <interface>
ethtool <interface>
ethtool -S <interface>
```

## Referência de Contadores

| Contador | Significado | Causa comum |
| --- | --- | --- |
| CRC | Checksum de frame recebido falhou | Cabo ruim, fibra suja, óptica ruim, incompatibilidade de duplex |
| input errors | Erros agregados no lado de recepção | Verifique sub-contadores antes de concluir |
| runts | Frames abaixo do tamanho mínimo Ethernet | Incompatibilidade de duplex, domínio de colisão, NIC com falha |
| giants | Frames maiores que o MTU esperado | Incompatibilidade de MTU ou limite de jumbo-frame |
| input drops | Dispositivo não conseguiu aceitar pacotes de entrada | Burst, superassinatura, caminho de CPU, pressão de fila |
| output drops | Fila de saída descartou pacotes | Congestionamento, política QoS, uplink subdimensionado |
| resets | Reset de hardware de interface | Flapping, keepalive, driver, óptica, alimentação |
| collisions | Contador de colisão Ethernet | Half duplex ou incompatibilidade de negociação |

## Fluxo de Diagnóstico

### CRCs ou Erros de Entrada

1. Confirme que os contadores estão incrementando, não apenas históricos.
2. Verifique ambos os lados do link. Erros no lado de recepção geralmente apontam para o sinal
   chegando naquele lado, não necessariamente para a porta que reporta o erro.
3. Substitua o cabo de patch ou limpe/substitua a fibra e as ópticas.
4. Confirme que as configurações de velocidade/duplex coincidem em ambos os lados.
5. Verifique os logs por eventos de flap em torno do mesmo timestamp.

### Drops

1. Separe drops de entrada dos drops de saída.
2. Compare a taxa da interface com a capacidade.
3. Verifique a política QoS, contadores de fila e se o link é um
   uplink supersaturado.
4. Trate o ajuste de fila como secundário. Primeiro prove se o link está congestionado.

### Duplex e Velocidade

Prefira auto-negociação em links Ethernet modernos quando ambos os lados suportam. Se
um lado deve ser fixo, configure ambos os lados explicitamente e documente o motivo. Nunca
misture velocidade/duplex fixo em um lado com auto no outro.

```text
show interfaces <interface> | include duplex|speed
```

## Exemplo de Parser Seguro

Fatie cada bloco de interface de um cabeçalho ao próximo. Não use uma janela de
caracteres arbitrária; blocos de interface grandes podem fazer com que contadores sejam ignorados ou
atribuídos à porta errada.

```python
import re
from typing import Any

HEADER_RE = re.compile(
    r"^(?P<name>\S+) is (?P<status>(?:administratively )?down|up), "
    r"line protocol is (?P<protocol>up|down)",
    re.I | re.M,
)
ERROR_RE = re.compile(r"(?P<input>\d+) input errors, (?P<crc>\d+) CRC", re.I)
DROP_RE = re.compile(r"(?P<output>\d+) output errors", re.I)
DUPLEX_RE = re.compile(r"(?P<duplex>Full|Half|Auto)-duplex,\s+(?P<speed>[^,]+)", re.I)

def parse_show_interfaces(raw: str) -> list[dict[str, Any]]:
    headers = list(HEADER_RE.finditer(raw))
    interfaces = []
    for index, header in enumerate(headers):
        end = headers[index + 1].start() if index + 1 < len(headers) else len(raw)
        block = raw[header.start():end]
        errors = ERROR_RE.search(block)
        drops = DROP_RE.search(block)
        duplex = DUPLEX_RE.search(block)
        interfaces.append({
            "name": header.group("name"),
            "status": header.group("status"),
            "protocol": header.group("protocol"),
            "duplex": duplex.group("duplex") if duplex else "unknown",
            "speed": duplex.group("speed").strip() if duplex else "unknown",
            "input_errors": int(errors.group("input")) if errors else 0,
            "crc_errors": int(errors.group("crc")) if errors else 0,
            "output_errors": int(drops.group("output")) if drops else 0,
        })
    return interfaces
```

## Exemplos

### CRCs em uma Porta de Switch

1. Capture contadores na porta local.
2. Capture contadores na porta remota conectada.
3. Substitua o cabo ou a óptica antes de alterar regras de roteamento ou firewall.
4. Limpe os contadores apenas após registrar a linha de base.
5. Verifique novamente após um intervalo fixo.

### Internet Lenta mas LAN Está Bem

1. Verifique drops/erros da interface WAN.
2. Verifique utilização do uplink LAN e drops de saída.
3. Verifique a CPU do gateway se o link WAN estiver limpo mas o throughput ainda estiver baixo.
4. Compare testes com fio e sem fio antes de culpar o serviço upstream.

## Anti-Padrões

- Limpar contadores antes de salvar uma linha de base.
- Olhar apenas para um lado de um link.
- Assumir que todos os CRCs históricos são problemas ativos sem uma janela de tempo.
- Misturar auto-negociação em um lado com velocidade/duplex fixo no outro.
- Tratar drops de saída como um problema de cabo antes de verificar o congestionamento.

## Veja Também

- Agent: `network-troubleshooter`
- Skill: `network-config-validation`
- Skill: `homelab-network-setup`
