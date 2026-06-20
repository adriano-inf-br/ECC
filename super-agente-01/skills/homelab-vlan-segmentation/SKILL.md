---
name: homelab-vlan-segmentation
description: Segmentação de redes domésticas em VLANs para tráfego de IoT, convidados, confiáveis e servidores usando UniFi, pfSense/OPNsense e MikroTik — incluindo configuração de trunk de switch, regras de firewall e mapeamento de SSID sem fio.
metadata:
  origin: community
---

# Homelab VLAN Segmentation

Como dividir uma rede doméstica em VLANs isoladas para que dispositivos IoT, convidados e seus
PCs principais não consigam se comunicar entre si. O upgrade de segurança mais impactante para uma rede doméstica.

Todas as regras de firewall mostradas aqui adicionam isolamento entre segmentos — elas não removem
proteções existentes. Aplique as mudanças em uma janela de manutenção e verifique a conectividade
entre segmentos após cada passo antes de prosseguir.

## Quando Usar

- Configurar VLANs em uma rede doméstica pela primeira vez
- Isolar dispositivos IoT (lâmpadas inteligentes, câmeras, TVs) dos dispositivos confiáveis
- Criar uma rede Wi-Fi de convidados que não consiga alcançar os dispositivos domésticos
- Explicar como as VLANs funcionam para alguém não familiarizado com o conceito
- Configurar portas trunk, portas de acesso e mapeamento de SSID para VLAN
- Solucionar problemas de roteamento entre VLANs ou de regras de firewall no pfSense/OPNsense/UniFi

## Como Funciona

```
Sem VLANs — rede plana:
  Todos os dispositivos em 192.168.1.0/24
  Smart TV (potencial malware) → consegue alcançar seu NAS, PCs, tudo

Com VLANs:
  VLAN 10 — Confiável   192.168.10.0/24  (PCs, celulares, laptops)
  VLAN 20 — IoT         192.168.20.0/24  (smart TV, lâmpadas, câmeras)
  VLAN 30 — Servidores  192.168.30.0/24  (NAS, Pi, VMs)
  VLAN 40 — Convidados  192.168.40.0/24  (Wi-Fi de visitantes)
  VLAN 99 — Gerência    192.168.99.0/24  (UIs web de switch/AP)

  Smart TV → bloqueada de alcançar 192.168.10.0/24 e 192.168.30.0/24
  Convidados → apenas internet, não conseguem ver nenhum dispositivo doméstico
```

## Modelo de Design de VLAN

```
VLAN  Nome        Subnet              Gateway         Finalidade
10    trusted     192.168.10.0/24     192.168.10.1    PCs, celulares, laptops
20    iot         192.168.20.0/24     192.168.20.1    Dispositivos de casa inteligente
30    servers     192.168.30.0/24     192.168.30.1    NAS, Pi, auto-hospedados
40    guest       192.168.40.0/24     192.168.40.1    Wi-Fi de visitantes
99    management  192.168.99.0/24     192.168.99.1    UIs web de equipamentos de rede
```

## Exemplos

**Homelab típico com AP UniFi e switch gerenciável:**

```
Cenário: casa de 3 quartos, UniFi Dream Machine + switch UniFi de 8 portas + 2 APs

VLAN 10 — Confiável  192.168.10.0/24   MacBook, iPhones, iPad
VLAN 20 — IoT        192.168.20.0/24   termostato Nest, Philips Hue, campainha Ring, smart TVs
VLAN 30 — Servidores 192.168.30.0/24   Synology NAS (192.168.30.10), Pi-hole (192.168.30.2)
VLAN 40 — Convidados 192.168.40.0/24   Wi-Fi de visitantes — apenas internet

Mapeamento SSID → VLAN:
  "Home"      → VLAN 10 (WPA2, senha forte, apenas dispositivos confiáveis)
  "IoT"       → VLAN 20 (WPA2, senha separada, impressa no roteador para configuração)
  "Guest"     → VLAN 40 (WPA2, senha simples que você pode compartilhar livremente)

Comportamento das portas do switch:
  Porta 1  → trunk para o roteador (VLANs tagged 10,20,30,40,99)
  Porta 2  → trunk para os APs (VLANs tagged 10,20,40; o AP faz o tagging por SSID)
  Porta 3  → acesso VLAN 30 (NAS — untagged, não precisa de consciência de VLAN)
  Porta 4  → acesso VLAN 30 (Pi-hole — untagged)
  Porta 5–8 → acesso VLAN 10 (estações de trabalho cabeadas)

Regras de firewall aplicadas (todas as regras adicionam isolamento, nenhuma remove proteções existentes):
  IoT → Confiável: BLOCK
  IoT → Servidores: BLOCK exceto 192.168.30.2:53 (DNS do Pi-hole permitido)
  IoT → Internet: ALLOW
  Convidados → Redes locais: BLOCK
  Convidados → Internet: ALLOW
  Confiável → tudo: ALLOW
```

## Configuração do UniFi

### Criar Redes no UniFi Controller

```
Settings → Networks → Create New Network

Para cada VLAN:
  Name: IoT
  Purpose: Corporate  (fornece DHCP + roteamento)
  VLAN ID: 20
  Network: 192.168.20.0/24
  Gateway IP: 192.168.20.1
  DHCP: Enable
  DHCP Range: 192.168.20.100 – 192.168.20.254
```

### Mapear SSIDs para VLANs (UniFi)

```
Settings → WiFi → Create New WiFi

  Name: IoT-Network
  Password: <senha separada>
  Network: IoT  ← selecione sua VLAN aqui
  # Todos os dispositivos que se conectam a este SSID caem na VLAN 20

  Name: Guest
  Password: <senha de convidado>
  Network: Guest
  Guest Policy: Enable  ← isola os convidados entre si também
```

### Regras de Firewall do UniFi (Traffic Rules)

```
Settings → Traffic & Security → Traffic Rules

# Bloqueia IoT de alcançar a VLAN Confiável
  Action: Block
  Category: Local Network
  Source: IoT (192.168.20.0/24)
  Destination: Trusted (192.168.10.0/24)

# Permite IoT alcançar apenas a internet
  Action: Allow
  Source: IoT
  Destination: Internet

# Bloqueia Convidados de todas as redes locais
  Action: Block
  Source: Guest
  Destination: Local Networks
```

## Configuração pfSense / OPNsense

### Criar VLANs

```
Interfaces → Assignments → VLANs → Add

  Parent Interface: em1  (sua NIC de LAN)
  VLAN Tag: 20
  Description: IoT

# Repita para cada VLAN, depois atribua cada VLAN a uma interface:
Interfaces → Assignments → Add
  Selecione a VLAN que você criou → clique em Add
  Habilite a interface, defina o IP como endereço de gateway (192.168.20.1/24)
```

### DHCP para Cada VLAN

```
Services → DHCP Server → Selecione a interface da sua VLAN

  Enable DHCP
  Range: 192.168.20.100 to 192.168.20.254
  DNS Servers: 192.168.30.2  ← IP do Pi-hole, se você tiver um
```

### Regras de Firewall (pfSense/OPNsense)

```
# As regras são processadas de cima para baixo, a primeira correspondência vence.

# Na interface IoT (VLAN 20):
  Regra 1: Permitir IoT → DNS do Pi-hole  ← DEVE vir antes da regra de bloqueio RFC1918
    Protocol: UDP/TCP
    Source: IoT net
    Destination: 192.168.30.2 port 53
    Action: Allow

  Regra 2: Bloquear IoT → RFC1918 (todas as faixas de IP privadas)
    Protocol: any
    Source: IoT net
    Destination: RFC1918  (192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12)
    Action: Block

  Regra 3: Permitir IoT → internet
    Protocol: any
    Source: IoT net
    Destination: any
    Action: Allow

# Na interface Confiável (VLAN 10):
  Permitir tudo (dispositivos confiáveis podem alcançar tudo)
    Source: Trusted net
    Destination: any
    Action: Allow

# Exceções adicionais para dispositivos IoT que precisam de serviços locais específicos:
  Insira antes da Regra 2 (o bloqueio RFC1918):
    Protocol: TCP
    Source: IoT net
    Destination: 192.168.30.x port 8123  ← Home Assistant
    Action: Allow
```

## Configuração MikroTik

```
# Passo 1: Crie uma bridge com filtragem de VLAN habilitada
/interface bridge
add name=bridge vlan-filtering=yes

# Passo 2: Adicione as portas físicas à bridge
# Porta trunk para roteador/uplink (tagged para todas as VLANs)
/interface bridge port
add bridge=bridge interface=ether1 frame-types=admit-only-vlan-tagged

# Porta de acesso para dispositivos confiáveis (VLAN 10 untagged)
/interface bridge port
add bridge=bridge interface=ether2 pvid=10 frame-types=admit-only-untagged-and-priority-tagged

# Porta de acesso para dispositivos IoT (VLAN 20 untagged)
/interface bridge port
add bridge=bridge interface=ether3 pvid=20 frame-types=admit-only-untagged-and-priority-tagged

# Passo 3: Defina quais VLANs são permitidas em quais portas
/interface bridge vlan
add bridge=bridge tagged=ether1 untagged=ether2 vlan-ids=10
add bridge=bridge tagged=ether1 untagged=ether3 vlan-ids=20

# Passo 4: Crie as interfaces de VLAN na bridge (IPs de gateway)
/interface vlan
add interface=bridge name=vlan10 vlan-id=10
add interface=bridge name=vlan20 vlan-id=20

# Passo 5: Atribua os IPs de gateway
/ip address
add interface=vlan10 address=192.168.10.1/24
add interface=vlan20 address=192.168.20.1/24

# Passo 6: Pools e servidores DHCP
/ip pool
add name=pool-trusted ranges=192.168.10.100-192.168.10.254
add name=pool-iot ranges=192.168.20.100-192.168.20.254

/ip dhcp-server
add interface=vlan10 address-pool=pool-trusted name=dhcp-trusted
add interface=vlan20 address-pool=pool-iot name=dhcp-iot

/ip dhcp-server network
add address=192.168.10.0/24 gateway=192.168.10.1
add address=192.168.20.0/24 gateway=192.168.20.1

# Passo 7: Firewall — bloqueia IoT de alcançar a VLAN confiável
/ip firewall filter
add chain=forward src-address=192.168.20.0/24 dst-address=192.168.10.0/24 \
    action=drop comment="Block IoT to Trusted"
```

## Portas Trunk vs Acesso no Switch

```
# Porta trunk: carrega múltiplas VLANs (tagged) — conecta switch-a-switch, switch-a-roteador, switch-a-AP
# Porta de acesso: carrega uma VLAN (untagged) — conecta a dispositivos finais (PC, câmera, NAS)

# Uma porta de switch gerenciável conectada ao seu roteador deve ser um trunk:
  VLANs permitidas: 10, 20, 30, 40, 99

# Uma porta conectando a um PC deve ser uma porta de acesso:
  VLAN: 10 (confiável)
  Sem tagging — o PC não sabe nem se importa com VLANs

# Uma porta conectando a um AP deve ser um trunk:
  O AP marca (tag) o tráfego de cada SSID com o VLAN ID correto
  VLANs permitidas: 10, 20, 40  (quaisquer SSIDs que o AP atenda)
```

## Anti-Padrões

```
# RUIM: Criar VLANs sem adicionar regras de firewall
# VLANs sem regras de firewall não fornecem segurança — o roteamento entre VLANs é aberto por padrão
# BOM: Adicione regras de bloqueio explícitas imediatamente após criar as VLANs

# RUIM: Colocar o Pi-hole na VLAN IoT
# Dispositivos IoT conseguem alcançá-lo, mas dispositivos confiáveis não (sem regras extras)
# BOM: Pi-hole na VLAN de Servidores com uma regra permitindo que todas as VLANs alcancem a porta 53

# RUIM: VLAN nativa igual à VLAN de gerência
# Tráfego untagged caindo na sua VLAN de gerência habilita ataques de VLAN hopping
# BOM: Use uma VLAN dedicada e não utilizada como nativa (ex.: VLAN 999), mantenha o tráfego de gerência tagged

# RUIM: Mesma senha de Wi-Fi para o SSID IoT e o SSID confiável
# Qualquer um que descubra a senha pode conectar dispositivos IoT ao segmento errado
```

## Boas Práticas

- Comece com 4 VLANs: Confiável, IoT, Servidores, Convidados — adicione mais conforme necessário
- Coloque o Pi-hole na VLAN de Servidores (192.168.30.x)
- Adicione uma regra de firewall permitindo DNS (porta 53) de todas as VLANs para o IP do Pi-hole — antes de qualquer regra de bloqueio RFC1918
- Teste o isolamento após cada mudança de regra: a partir da VLAN IoT, tente fazer ping em um dispositivo confiável — deve falhar
- Use uma VLAN de gerência para as UIs web do switch e do AP e restrinja o acesso apenas à VLAN Confiável
- Documente o design das suas VLANs em uma tabela (VLAN ID, nome, subnet, finalidade)

## Skills Relacionadas

- homelab-network-setup
- homelab-pihole-dns
- homelab-wireguard-vpn
