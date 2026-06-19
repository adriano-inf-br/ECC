---
name: homelab-wireguard-vpn
description: Configuração de servidor WireGuard VPN, configuração de peers, geração de chaves, roteamento split tunneling vs full tunnel, e acesso remoto a uma rede doméstica a partir de clientes móveis e laptops.
metadata:
  origin: community
---

# Homelab WireGuard VPN

WireGuard é um protocolo VPN rápido e moderno. É a escolha certa para acesso remoto a uma
rede doméstica — mais simples de configurar que OpenVPN e mais rápido que a maioria das alternativas.

Todos os exemplos de configuração mostram setups comuns. Revise cada comando — especialmente as
regras de forwarding do iptables e as permissões dos arquivos de chave — antes de aplicá-los ao seu
sistema, e faça as alterações em uma janela de manutenção.

## Quando Usar

- Configurar um servidor WireGuard em um Raspberry Pi, host Linux, pfSense ou roteador
- Gerar pares de chaves WireGuard e escrever arquivos de configuração de peers
- Configurar acesso remoto de um celular ou laptop a uma rede doméstica
- Explicar split tunneling (rotear apenas o tráfego doméstico) vs full tunnel (rotear todo o tráfego)
- Solucionar problemas de conexões WireGuard que não sobem
- Automatizar a geração de configuração de peers para múltiplos clientes

## Como o WireGuard Funciona

```
Seu celular (cliente WireGuard)
    │
    │  Túnel UDP criptografado (porta 51820)
    │
Seu roteador doméstico (servidor WireGuard — precisa de um IP público ou DDNS)
    │
    Sua rede doméstica (192.168.1.0/24, NAS, Pi, etc.)

Cada dispositivo tem um par de chaves (chave pública + privada).
O servidor conhece a chave pública de cada cliente.
O cliente conhece a chave pública do servidor + endpoint (IP:porta).
O tráfego é criptografado de ponta a ponta sem servidor central nem autoridade certificadora.
```

## Configuração do Servidor (Linux)

```bash
# Instalar o WireGuard
sudo apt update && sudo apt install wireguard -y

# Gerar o par de chaves do servidor — crie os arquivos com permissões privadas desde o início
sudo mkdir -p /etc/wireguard
sudo sh -c 'umask 077; wg genkey > /etc/wireguard/server_private.key'
sudo sh -c 'wg pubkey < /etc/wireguard/server_private.key > /etc/wireguard/server_public.key'

# Escrever a configuração do servidor — substitua pelo valor real da chave privada
# Não armazene chaves privadas em controle de versão nem as compartilhe
sudo tee /etc/wireguard/wg0.conf << 'EOF'
[Interface]
Address = 10.8.0.1/24              # Sub-rede da VPN — o servidor recebe o .1
ListenPort = 51820
PrivateKey = <paste_server_private_key_here>

# Regras de forwarding restritas: permite tráfego da VPN entrando/saindo, não um FORWARD ACCEPT amplo
PostUp   = iptables -A FORWARD -i wg0 -o eth0 -j ACCEPT
PostUp   = iptables -A FORWARD -i eth0 -o wg0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
PostUp   = iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i wg0 -o eth0 -j ACCEPT
PostDown = iptables -D FORWARD -i eth0 -o wg0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
# Celular — substitua pela chave pública real do celular
PublicKey = <phone_public_key>
AllowedIPs = 10.8.0.2/32

[Peer]
# Laptop — substitua pela chave pública real do laptop
PublicKey = <laptop_public_key>
AllowedIPs = 10.8.0.3/32
EOF
sudo chmod 600 /etc/wireguard/wg0.conf

# Substitua eth0 pelo nome real da sua interface de saída
# Verifique com: ip route show default

# Habilitar IP forwarding (necessário para rotear tráfego através do servidor)
echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/99-wireguard.conf
sudo sysctl --system

# Iniciar o WireGuard e habilitar no boot
sudo wg-quick up wg0
sudo systemctl enable wg-quick@wg0
```

## Configuração do Cliente

```bash
# Gerar um par de chaves único para cada dispositivo cliente
# Execute no cliente, ou no servidor e transfira a chave privada com segurança — nunca em texto puro
umask 077
wg genkey | tee phone_private.key | wg pubkey > phone_public.key

# Arquivo de configuração do cliente (phone_wg0.conf):
[Interface]
PrivateKey = <phone_private_key>
Address = 10.8.0.2/32
DNS = 192.168.1.2                  # Opcional: use o Pi-hole para DNS através do túnel

[Peer]
PublicKey = <server_public_key>
Endpoint = your-home-ip.ddns.net:51820  # Seu IP público ou hostname DDNS
AllowedIPs = 192.168.1.0/24            # Split tunnel: apenas tráfego da rede doméstica
# AllowedIPs = 0.0.0.0/0, ::/0        # Full tunnel: todo o tráfego através da VPN

PersistentKeepalive = 25              # Mantém o buraco no NAT aberto (necessário para clientes móveis)
```

## Split Tunnel vs Full Tunnel

```
# Split tunnel: AllowedIPs = 192.168.1.0/24
  Apenas o tráfego destinado à sua rede doméstica passa pela VPN.
  O tráfego de internet (YouTube, Spotify) vai direto — melhor desempenho no celular.
  Melhor para: "Só quero alcançar meu NAS e Pi de qualquer lugar."

# Full tunnel: AllowedIPs = 0.0.0.0/0, ::/0
  TODO o tráfego passa pela sua conexão de internet doméstica.
  Útil para: aproveitar o bloqueio de anúncios via DNS/Pi-hole de casa.
  Desvantagem: a velocidade de upload doméstica vira seu gargalo em todo lugar.

# Split tunnel multi-sub-rede (caso de uso mais comum em homelab):
  AllowedIPs = 192.168.10.0/24, 192.168.20.0/24, 192.168.30.0/24, 10.8.0.0/24
  Roteia todas as suas VLANs através do túnel; a internet permanece direta.
```

## Geração de Chaves e Gerenciamento de Peers

```python
import subprocess

def generate_keypair() -> tuple[str, str]:
    """Gera um par de chaves WireGuard. Retorna (private_key, public_key)."""
    private = subprocess.check_output(["wg", "genkey"]).decode().strip()
    public = subprocess.run(
        ["wg", "pubkey"], input=private.encode(), capture_output=True
    ).stdout.decode().strip()
    return private, public

def generate_preshared_key() -> str:
    return subprocess.check_output(["wg", "genpsk"]).decode().strip()

def build_client_config(
    client_private_key: str,
    client_vpn_ip: str,       # ex. "10.8.0.3"
    server_public_key: str,
    server_endpoint: str,     # ex. "home.example.com:51820"
    allowed_ips: str = "192.168.1.0/24",
    dns: str = "",
) -> str:
    dns_line = f"DNS = {dns}\n" if dns else ""
    return f"""[Interface]
PrivateKey = {client_private_key}
Address = {client_vpn_ip}/32
{dns_line}
[Peer]
PublicKey = {server_public_key}
Endpoint = {server_endpoint}
AllowedIPs = {allowed_ips}
PersistentKeepalive = 25
"""

def build_server_peer_block(
    client_public_key: str,
    client_vpn_ip: str,
    comment: str = "",
) -> str:
    comment_line = f"# {comment}\n" if comment else ""
    return f"""
{comment_line}[Peer]
PublicKey = {client_public_key}
AllowedIPs = {client_vpn_ip}/32
"""
```

Mantenha as chaves privadas fora do controle de versão. Se usar este script, grave o material de chave
em arquivos com modo 600 e nunca o registre em log nem o imprima.

## pfSense / OPNsense WireGuard

```
# pfSense: VPN → WireGuard → Add Tunnel
  Interface Keys: Generate (cria o par de chaves automaticamente)
  Listen Port: 51820
  Interface Address: 10.8.0.1/24

# Adicionar Peer (um por cliente):
  Public Key: <chave pública do cliente>
  Allowed IPs: 10.8.0.2/32

# Atribuir a interface do WireGuard:
  Interfaces → Assignments → Add (selecione wg0)
  Habilite a interface, sem IP necessário (ele é definido na configuração do túnel)

# Regras de firewall:
  WAN → Permitir a porta UDP 51820 de entrada (para que os clientes alcancem o servidor)
  Interface WireGuard → Permitir tráfego para as redes LAN que você quer alcançáveis
```

## DDNS (Dynamic DNS) para Servidores Domésticos

A maioria das conexões de internet doméstica tem IP dinâmico. Use DDNS para que o endpoint da sua VPN
permaneça alcançável após uma mudança de IP.

```bash
# Opção 1: Cloudflare DDNS — armazene as credenciais em um arquivo de segredos, não inline
# entrada do docker-compose usando um env file:
  ddns-updater:
    image: qmcgaw/ddns-updater
    env_file: ./ddns.env   # armazene aqui o zone_id e o token, não no compose
    restart: unless-stopped

# ddns.env (chmod 600, não commitado no git):
# SETTINGS_CLOUDFLARE_ZONE_ID=your_zone_id
# SETTINGS_CLOUDFLARE_TOKEN=your_api_token

# Opção 2: DuckDNS (gratuito, simples)
  Cadastre-se em duckdns.org → obtenha um token e subdomínio (myhome.duckdns.org)
  Armazene o token em /etc/ddns.env (modo 600), depois use um pequeno script de propriedade do root:

  # /usr/local/bin/update-duckdns
  #!/bin/sh
  set -eu
  . /etc/ddns.env
  curl --fail --silent --show-error --max-time 10 \
    --get "https://www.duckdns.org/update" \
    --data-urlencode "domains=myhome" \
    --data-urlencode "token=${DUCKDNS_TOKEN}" \
    --data-urlencode "ip="

  # Cron job:
  */5 * * * * /usr/local/bin/update-duckdns >/dev/null 2>&1
```

## Solução de Problemas

```bash
# Verificar o status do WireGuard e o último handshake
sudo wg show

# Se "latest handshake" for "never" ou muito antigo, o túnel não está conectado.
# Verifique:
# 1. A porta UDP 51820 está aberta no roteador/firewall?
sudo ufw status  # ou verifique as regras de firewall do pfSense/UniFi

# 2. A chave pública do servidor na configuração do cliente está correta?
sudo wg show wg0 public-key   # Compare com o que está na configuração do cliente

# 3. O IP forwarding está habilitado no servidor?
cat /proc/sys/net/ipv4/ip_forward  # Deve ser 1

# 4. O AllowedIPs do cliente cobre o IP que você está tentando alcançar?
# Se AllowedIPs = 192.168.1.0/24 e você tenta alcançar 192.168.3.5, não haverá rota.

# Verificar os logs do kernel em busca de erros do WireGuard
dmesg | grep wireguard

# Reiniciar o WireGuard
sudo wg-quick down wg0 && sudo wg-quick up wg0
```

## Anti-Padrões

```
# RUIM: Armazenar chaves privadas em controle de versão ou compartilhá-las
# Chaves privadas equivalem a senhas — nunca as commite no git

# RUIM: Usar AllowedIPs = 0.0.0.0/0 no celular sem considerar o impacto
# Full tunnel roteia todo o tráfego móvel pelo seu upload doméstico — geralmente lento

# RUIM: Não definir PersistentKeepalive em clientes móveis
# Clientes móveis atrás de NAT derrubam túneis ociosos sem isso

# RUIM: Abrir a porta 51820 no firewall mas esquecer o IP forwarding no servidor
# O túnel conecta mas nenhum tráfego é roteado — confuso de depurar

# RUIM: Compartilhar um par de chaves entre múltiplos dispositivos cliente
# Cada dispositivo deve ter seu próprio par de chaves único — chaves compartilhadas quebram o modelo de segurança

# RUIM: Usar uma regra ampla "FORWARD ACCEPT" no iptables
# Restrinja as regras de forwarding apenas à interface wg0 e à direção
```

## Boas Práticas

- Gere um par de chaves único por dispositivo cliente — nunca reutilize chaves
- Use split tunneling (`AllowedIPs = <sub-redes domésticas>`) para celular
- Defina `PersistentKeepalive = 25` em todos os clientes móveis
- Use DDNS se o seu provedor atribuir um IP dinâmico; armazene as credenciais em env files, não inline
- Use regras de forwarding do iptables restritas (entrada apenas em wg0) em vez de um FORWARD ACCEPT amplo
- Adicione o IP do Pi-hole como `DNS =` nas configurações do cliente para ter bloqueio de anúncios via VPN
- Rotacione o par de chaves do servidor periodicamente e atualize todas as configurações dos clientes

## Skills Relacionadas

- homelab-network-setup
- homelab-vlan-segmentation
- homelab-pihole-dns
