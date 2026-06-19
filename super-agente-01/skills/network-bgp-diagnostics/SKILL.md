---
name: network-bgp-diagnostics
description: Padrões de troubleshooting BGP somente de diagnóstico para estado de vizinho, troca de rotas, política de prefixos, inspeção de AS path e coleta segura de evidências.
metadata:
  origin: community
---

# Diagnóstico BGP de Rede

Use esta skill quando uma sessão BGP estiver caída, instável (flapping),
estabelecida mas com rotas faltando, ou anunciando prefixos inesperados. O fluxo
de trabalho padrão é a coleta de evidências somente leitura; ações de política e
reset pertencem a uma janela de mudança revisada.

## Quando Usar

- Vizinhos BGP estão presos em Idle, Connect, Active, OpenSent ou OpenConfirm.
- Uma sessão está Established mas os prefixos esperados estão faltando.
- Um route-map, prefix-list, limite max-prefix ou política de AS path pode estar
  filtrando rotas.
- Você precisa de evidências antes/depois para uma mudança BGP.
- Você está revisando automação que faz parsing da saída do BGP summary.

## Fluxo de Triagem Somente Leitura

1. Identifique o vizinho exato, a address family, a VRF e os ASNs local/remoto.
2. Capture o estado do summary e o motivo do último reset.
3. Prove a acessibilidade ao endereço de origem do peer.
4. Verifique as referências de política de rota antes de presumir falha de transporte.
5. Compare rotas anunciadas, recebidas e instaladas onde a plataforma
   suportar esses comandos.

```text
show bgp summary
show bgp neighbors <peer>
show ip route <peer>
show tcp brief | include <peer>|:179
show logging | include BGP|<peer>
show running-config | section router bgp
show ip prefix-list
show route-map
```

Use comandos de address-family específicos da plataforma quando o dispositivo usar VRFs, IPv6,
VPNv4 ou EVPN. Não presuma IPv4 unicast global.

## Interpretação de Estado

| Estado | Primeiras verificações |
| --- | --- |
| Established com contagem de prefixos | A troca de rotas está ativa; inspecione a política e a seleção de tabela |
| Established com zero prefixos | Verifique política de entrada, max-prefix, rotas anunciadas e AFI/SAFI |
| Active | A sessão TCP não está completando; verifique roteamento, origem, ACLs e acessibilidade do peer |
| Connect | A conexão TCP está em andamento; verifique o caminho e o listener remoto |
| OpenSent/OpenConfirm | O TCP funciona; verifique ASN, autenticação, timers, capabilities e logs |
| Idle | O vizinho pode estar desabilitado, sem config, bloqueado por política ou em timer de backoff |

## Verificações de Transporte

```text
ping <peer> source <local-source>
traceroute <peer> source <local-source>
show ip route <peer>
show bgp neighbors <peer> | include BGP state|Last reset|Local host|Foreign host
```

If the peer is sourced from a loopback, confirm both directions route to the
loopback addresses and that the neighbor config uses the expected update source.

Avoid disabling ACLs or firewall policy as a diagnostic shortcut. Read hit
counters, logs, and path state first.

## Route Policy Checks

```text
show bgp neighbors <peer> advertised-routes
show bgp neighbors <peer> routes
show ip prefix-list <name>
show route-map <name>
show bgp <prefix>
```

Some platforms require additional configuration before `received-routes` is
available. Do not add that configuration during incident triage unless the
operator approves the change.

## AS Path And Prefix Review

```text
show bgp regexp _65001_
show bgp regexp ^65001$
show bgp <prefix>
show bgp neighbors <peer> advertised-routes | include Network|Path|<prefix>
```

Use AS-path regex carefully. `_65001_` matches AS 65001 as a token. Plain
`65001` can match longer ASNs or unrelated text.

## Parser Pattern

```python
import re
from typing import Any

BGP_SUMMARY_RE = re.compile(
    r"^(?P<neighbor>\d{1,3}(?:\.\d{1,3}){3})\s+"
    r"(?P<version>\d+)\s+"
    r"(?P<remote_as>\d+)\s+"
    r"(?P<msg_rcvd>\d+)\s+"
    r"(?P<msg_sent>\d+)\s+"
    r"(?P<table_version>\d+)\s+"
    r"(?P<input_queue>\d+)\s+"
    r"(?P<output_queue>\d+)\s+"
    r"(?P<uptime>\S+)\s+"
    r"(?P<state_or_prefixes>\S+)$",
    re.M,
)

def parse_bgp_summary(raw: str) -> list[dict[str, Any]]:
    rows = []
    for match in BGP_SUMMARY_RE.finditer(raw):
        state_or_prefixes = match.group("state_or_prefixes")
        if state_or_prefixes.isdigit():
            state = "Established"
            prefixes_received = int(state_or_prefixes)
        else:
            state = state_or_prefixes
            prefixes_received = None
        rows.append({
            "neighbor": match.group("neighbor"),
            "remote_as": int(match.group("remote_as")),
            "state": state,
            "prefixes_received": prefixes_received,
            "uptime": match.group("uptime"),
        })
    return rows
```

Prefer structured parser output when available, but store raw output with the
incident record because BGP summary formats vary by platform and address family.

## Change-Window Only

These actions can affect routing and should not be suggested as automatic
diagnostics:

- Clearing a BGP session.
- Changing neighbor authentication, timers, update source, route-maps, or
  prefix-lists.
- Enabling additional received-route storage.
- Relaxing firewall, ACL, or control-plane policy.

If a reset is approved, prefer the least disruptive soft or route-refresh option
supported by the platform and document exactly why it is safe.

## Anti-Patterns

- Assuming `Active` always means the remote side is down.
- Ignoring VRF, address family, or update-source differences.
- Using broad AS-path regex without token boundaries.
- Hard-resetting a peer before reading last reset reason and logs.
- Treating missing `received-routes` output as proof that no routes arrived.

## See Also

- Skill: `cisco-ios-patterns`
- Skill: `network-config-validation`
- Skill: `network-interface-health`
