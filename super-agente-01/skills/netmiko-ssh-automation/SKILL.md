---
name: netmiko-ssh-automation
description: Padrões seguros de Python Netmiko para coleta somente leitura, SSH em lote limitado, parsing com TextFSM, mudanças de config protegidas, timeouts e tratamento de erros de automação de rede.
metadata:
  origin: community
---

# Automação SSH com Netmiko

Use esta skill ao escrever ou revisar automação Python que se conecta a
dispositivos de rede com o Netmiko. Mantenha o caminho padrão somente leitura;
mudanças de config exigem uma janela de mudança separada, revisão por pares e
plano de rollback.

## Quando Usar

- Coletar a saída de comandos `show` em routers, switches ou firewalls.
- Construir um pequeno script de auditoria para evidências de interface, roteamento ou config.
- Adicionar timeouts e tratamento de exceções a scripts SSH de rede.
- Fazer parsing da saída de comandos com TextFSM quando existe um template.
- Revisar automação antes que ela toque dispositivos de produção.

## Padrões de Segurança

- Comece com coleta somente leitura via `send_command()`.
- Mantenha o inventário pequeno e explícito; não varra faixas inteiras de endereços.
- Use variáveis de ambiente, um vault ou `getpass`; nunca embuta credenciais no código.
- Defina timeouts de conexão e de leitura.
- Limite a concorrência para que dispositivos mais antigos não fiquem sobrecarregados.
- Exija uma flag explícita do operador antes de `send_config_set()`.
- Não chame `save_config()` até que a mudança tenha sido verificada e aprovada.

## Padrão de Conexão Somente Leitura

```python
import os
from getpass import getpass
from netmiko import ConnectHandler
from netmiko.exceptions import (
    NetmikoAuthenticationException,
    NetmikoTimeoutException,
    ReadTimeout,
)

device = {
    "device_type": "cisco_ios",
    "host": "192.0.2.10",
    "username": os.environ.get("NETMIKO_USERNAME") or input("Username: "),
    "password": os.environ.get("NETMIKO_PASSWORD") or getpass("Password: "),
    "secret": os.environ.get("NETMIKO_ENABLE_SECRET"),
    "conn_timeout": 10,
    "auth_timeout": 20,
    "banner_timeout": 15,
    "read_timeout_override": 30,
}

try:
    with ConnectHandler(**device) as conn:
        if device.get("secret") and not conn.check_enable_mode():
            conn.enable()
        output = conn.send_command("show ip interface brief", read_timeout=30)
        print(output)
except NetmikoAuthenticationException:
    print("Authentication failed")
except NetmikoTimeoutException:
    print("SSH connection timed out")
except ReadTimeout:
    print("Command read timed out")
```

Use endereços de placeholder de faixas de documentação nos exemplos. Mantenha o
inventário real em um arquivo local ignorado ou em um sistema gerenciado por segredos.

## Coleta em Lote

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

def collect_show(device: dict[str, Any], command: str) -> dict[str, Any]:
    host = device["host"]
    try:
        with ConnectHandler(**device) as conn:
            output = conn.send_command(command, read_timeout=45)
        return {"host": host, "ok": True, "output": output}
    except (NetmikoAuthenticationException, NetmikoTimeoutException, ReadTimeout) as exc:
        return {"host": host, "ok": False, "error": type(exc).__name__}

results = []
with ThreadPoolExecutor(max_workers=8) as pool:
    futures = [pool.submit(collect_show, device, "show version") for device in devices]
    for future in as_completed(futures):
        results.append(future.result())
```

Mantenha `max_workers` baixo, a menos que se saiba que o parque de dispositivos e
os sistemas AAA suportam um volume maior de conexões.

## Parsing Estruturado

O Netmiko pode pedir ao TextFSM, TTP ou Genie que façam o parsing da saída de
comandos suportados. Trate a saída do parser como uma otimização, não como o
único caminho de evidência.

```python
with ConnectHandler(**device) as conn:
    parsed = conn.send_command(
        "show ip interface brief",
        use_textfsm=True,
        raise_parsing_error=False,
        read_timeout=30,
    )

if isinstance(parsed, str):
    print("No parser template matched; store raw output for review")
else:
    for row in parsed:
        print(row)
```

Se o parsing orienta uma decisão bloqueante, mantenha a saída bruta do comando
junto ao resultado parseado para que um operador possa inspecionar divergências.

## Padrão de Config Protegida

```python
import os

commands = [
    "interface GigabitEthernet0/1",
    "description CHANGE-1234 UPLINK-TO-CORE",
]

apply_changes = os.environ.get("APPLY_NETWORK_CHANGES") == "1"

if not apply_changes:
    print("Dry run only. Candidate commands:")
    print("\n".join(commands))
else:
    with ConnectHandler(**device) as conn:
        conn.enable()
        before = conn.send_command("show running-config interface GigabitEthernet0/1")
        output = conn.send_config_set(commands)
        after = conn.send_command("show running-config interface GigabitEthernet0/1")
        print(before)
        print(output)
        print(after)
        print("Verify behavior before saving startup config.")
```

Salvar a config é uma etapa de aprovação separada. Em produção, inclua um trecho
de rollback e capture evidências antes/depois no registro da mudança.

## Checklist de Revisão

- O script identifica uma fonte de inventário explícita?
- As credenciais estão ausentes do código-fonte, logs e mensagens de exceção?
- `conn_timeout`, `auth_timeout` e o `read_timeout` do comando estão definidos?
- As falhas são reportadas por dispositivo sem parar o lote inteiro?
- O script evita varreduras amplas e concorrência ilimitada?
- As mudanças de config estão atrás de um dry-run ou de uma flag explícita do operador?
- O `save_config()` está separado do push inicial e atrelado à verificação?

## Anti-Padrões

- Embutir senhas, enable secrets ou chaves privadas no código-fonte.
- Enviar comandos de config como caminho de código padrão.
- Rodar automação contra uma faixa CIDR em vez de um inventário revisado.
- Registrar running configs completas em sistemas compartilhados sem sanitização.
- Tratar o sucesso do parser como prova de que o estado do dispositivo está correto.

## Veja Também

- Skill: `cisco-ios-patterns`
- Skill: `network-config-validation`
- Skill: `network-interface-health`
