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

Se o peer tem origem em uma loopback, confirme que ambas as direções roteiam para
os endereços de loopback e que a config do vizinho usa o update source esperado.

Evite desabilitar ACLs ou política de firewall como atalho de diagnóstico. Leia
primeiro os contadores de hit, os logs e o estado do caminho.

## Verificações de Política de Rota

```text
show bgp neighbors <peer> advertised-routes
show bgp neighbors <peer> routes
show ip prefix-list <name>
show route-map <name>
show bgp <prefix>
```

Algumas plataformas exigem configuração adicional antes que `received-routes`
fique disponível. Não adicione essa configuração durante a triagem de incidente,
a menos que o operador aprove a mudança.

## Revisão de AS Path e Prefixos

```text
show bgp regexp _65001_
show bgp regexp ^65001$
show bgp <prefix>
show bgp neighbors <peer> advertised-routes | include Network|Path|<prefix>
```

Use regex de AS-path com cuidado. `_65001_` casa com o AS 65001 como um token. Um
`65001` simples pode casar com ASNs mais longos ou texto não relacionado.

## Padrão de Parser

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

Prefira a saída estruturada do parser quando disponível, mas armazene a saída
bruta junto ao registro do incidente, pois os formatos do BGP summary variam por
plataforma e address family.

## Apenas em Janela de Mudança

Estas ações podem afetar o roteamento e não devem ser sugeridas como
diagnósticos automáticos:

- Limpar uma sessão BGP.
- Alterar autenticação do vizinho, timers, update source, route-maps ou
  prefix-lists.
- Habilitar armazenamento adicional de rotas recebidas.
- Afrouxar política de firewall, ACL ou do control-plane.

Se um reset for aprovado, prefira a opção soft ou de route-refresh menos
disruptiva suportada pela plataforma e documente exatamente por que ela é segura.

## Anti-Padrões

- Presumir que `Active` sempre significa que o lado remoto está caído.
- Ignorar diferenças de VRF, address family ou update-source.
- Usar regex de AS-path ampla sem limites de token.
- Fazer hard-reset de um peer antes de ler o motivo do último reset e os logs.
- Tratar a ausência da saída `received-routes` como prova de que nenhuma rota chegou.

## Veja Também

- Skill: `cisco-ios-patterns`
- Skill: `network-config-validation`
- Skill: `network-interface-health`
