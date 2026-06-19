---
name: network-config-validation
description: Verificações pré-implantação para configuração de router e switch, incluindo comandos perigosos, endereços duplicados, sobreposições de sub-redes, referências obsoletas, risco do management-plane e higiene de segurança no estilo IOS.
metadata:
  origin: community
---

# Validação de Configuração de Rede

Use esta skill para revisar a configuração de rede antes de uma janela de mudança
ou antes que uma execução de automação toque dispositivos de produção.

## Quando Usar

- Revisar trechos no estilo Cisco IOS ou IOS-XE antes da implantação.
- Auditar config gerada por scripts ou templates.
- Procurar comandos perigosos, endereços IP duplicados ou sobreposições de sub-redes.
- Verificar se ACLs, route-maps, prefix-lists ou políticas de linha são referenciados
  mas não definidos.
- Construir scripts leves de pré-checagem (pre-flight) para automação de rede.

## Como Funciona

Trate a validação de config como evidência em camadas, não como um parser
completo. As verificações por regex são úteis para avisos de pré-checagem, mas a
aprovação final ainda precisa de um engenheiro de rede para revisar a intenção, a
sintaxe da plataforma e as etapas de rollback.

Valide nesta ordem:

1. Comandos destrutivos.
2. Exposição de credenciais e do management-plane.
3. Endereços duplicados e sub-redes sobrepostas.
4. Referências obsoletas a ACLs, route-maps, prefix-lists e interfaces.
5. Higiene operacional como NTP, timestamps, logging remoto e banners.

## Detecção de Comandos Perigosos

```python
import re

DANGEROUS_PATTERNS: list[tuple[re.Pattern[str], str]] = [
    (re.compile(r"\breload\b", re.I), "reload causes downtime"),
    (re.compile(r"\berase\s+(startup|nvram|flash)", re.I), "erases persistent storage"),
    (re.compile(r"\bformat\b", re.I), "formats a device filesystem"),
    (re.compile(r"\bno\s+router\s+(bgp|ospf|eigrp)\b", re.I), "removes a routing process"),
    (re.compile(r"\bno\s+interface\s+\S+", re.I), "removes interface configuration"),
    (re.compile(r"\baaa\s+new-model\b", re.I), "changes authentication behavior"),
    (re.compile(r"\bcrypto\s+key\s+(zeroize|generate)\b", re.I), "changes device SSH keys"),
]

def find_dangerous_commands(lines: list[str]) -> list[dict[str, str | int]]:
    findings = []
    for line_number, line in enumerate(lines, start=1):
        stripped = line.strip()
        for pattern, reason in DANGEROUS_PATTERNS:
            if pattern.search(stripped):
                findings.append({
                    "line": line_number,
                    "command": stripped,
                    "reason": reason,
                })
    return findings
```

## IPs Duplicados e Sobreposições de Sub-redes

```python
import ipaddress
import re
from collections import Counter

IP_ADDRESS_RE = re.compile(
    r"^\s*ip address\s+"
    r"(?P<ip>\d{1,3}(?:\.\d{1,3}){3})\s+"
    r"(?P<mask>\d{1,3}(?:\.\d{1,3}){3})\b",
    re.I | re.M,
)

def extract_interfaces(config: str) -> list[dict[str, str]]:
    results = []
    current = None
    for line in config.splitlines():
        if line.startswith("interface "):
            current = line.split(maxsplit=1)[1]
            continue
        match = IP_ADDRESS_RE.match(line)
        if current and match:
            ip = match.group("ip")
            mask = match.group("mask")
            network = ipaddress.ip_interface(f"{ip}/{mask}").network
            results.append({"interface": current, "ip": ip, "network": str(network)})
    return results

def find_duplicate_ips(config: str) -> list[str]:
    ips = [entry["ip"] for entry in extract_interfaces(config)]
    counts = Counter(ips)
    return sorted(ip for ip, count in counts.items() if count > 1)

def find_subnet_overlaps(config: str) -> list[tuple[str, str]]:
    networks = [ipaddress.ip_network(entry["network"]) for entry in extract_interfaces(config)]
    overlaps = []
    for index, left in enumerate(networks):
        for right in networks[index + 1:]:
            if left.overlaps(right):
                overlaps.append((str(left), str(right)))
    return overlaps
```

## Verificações do Management-Plane

Faça o parsing dos blocos VTY por seção para que as verificações de access-class
não transbordem para linhas não relacionadas.

```python
import re

def iter_blocks(config: str, starts_with: str) -> list[str]:
    blocks = []
    current: list[str] = []
    for line in config.splitlines():
        if line.startswith(starts_with):
            if current:
                blocks.append("\n".join(current))
            current = [line]
            continue
        if current:
            if line and not line.startswith(" "):
                blocks.append("\n".join(current))
                current = []
            else:
                current.append(line)
    if current:
        blocks.append("\n".join(current))
    return blocks

def check_vty_blocks(config: str) -> list[str]:
    issues = []
    for block in iter_blocks(config, "line vty"):
        if re.search(r"transport\s+input\s+.*telnet", block, re.I):
            issues.append("VTY allows Telnet; require SSH only.")
        if not re.search(r"\baccess-class\s+\S+\s+in\b", block, re.I):
            issues.append("VTY block has no inbound access-class source restriction.")
        if not re.search(r"\bexec-timeout\s+\d+\s+\d+\b", block, re.I):
            issues.append("VTY block has no explicit exec-timeout.")
    return issues
```

## Verificações de Higiene de Segurança

```python
SECURITY_PATTERNS = [
    (re.compile(r"\bsnmp-server community\s+(public|private)\b", re.I),
     "default SNMP community configured"),
    (re.compile(r"\bsnmp-server community\s+\S+", re.I),
     "SNMPv2 community string configured; prefer SNMPv3 authPriv"),
    (re.compile(r"\bip ssh version 1\b", re.I),
     "SSH version 1 enabled"),
    (re.compile(r"\benable password\b", re.I),
     "enable password is present; use enable secret"),
    (re.compile(r"\busername\s+\S+\s+password\b", re.I),
     "local username uses password instead of secret"),
]

BEST_PRACTICE_PATTERNS = [
    (re.compile(r"\bntp server\b", re.I), "NTP server"),
    (re.compile(r"\bservice timestamps\b", re.I), "log timestamps"),
    (re.compile(r"\blogging\s+\S+", re.I), "logging destination or buffer"),
    (re.compile(r"\bsnmp-server group\s+\S+\s+v3\s+priv\b", re.I), "SNMPv3 authPriv group"),
    (re.compile(r"\bbanner\s+(login|motd)\b", re.I), "login banner"),
]

def check_security(config: str) -> list[str]:
    return [message for pattern, message in SECURITY_PATTERNS if pattern.search(config)]

def check_missing_hygiene(config: str) -> list[str]:
    return [
        f"Missing {description}"
        for pattern, description in BEST_PRACTICE_PATTERNS
        if not pattern.search(config)
    ]
```

## Exemplos

### Pré-checagem de Janela de Mudança

1. Execute as verificações de comandos perigosos no trecho exato a ser colado.
2. Execute as verificações de IP duplicado e sobreposição de sub-rede na config candidata completa.
3. Confirme que cada ACL, route-map e prefix-list referenciado existe.
4. Confirme comandos de rollback e acesso fora de banda antes de qualquer mudança no management-plane.

### Pré-checagem de Automação

Use a validação como uma porta de bloqueio antes que Netmiko, NAPALM, Ansible ou automação via API do fornecedor empurre uma config gerada. Falhe de forma segura em comandos perigosos e credenciais. Avise sobre lacunas de boas práticas que estão fora do escopo da mudança.

## Anti-Padrões

- Tratar validação por regex como um parser de dispositivo.
- Aplicar config gerada sem um diff de dry-run.
- Recomendar strings de comunidade SNMPv2 como requisito de monitoramento.
- Verificar blocos VTY com regex que pode acidentalmente abranger seções não relacionadas.
- Testar comportamento de firewall desabilitando ACLs em vez de ler contadores/logs.

## Veja Também

- Agent: `network-config-reviewer`
- Agent: `network-troubleshooter`
- Skill: `network-interface-health`
