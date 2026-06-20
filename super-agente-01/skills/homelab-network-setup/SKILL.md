---
name: homelab-network-setup
description: Planejamento prático de rede doméstica e homelab para gateways, switches, pontos de acesso, intervalos de IP, reservas DHCP, DNS, cabeamento e erros comuns de iniciantes.
metadata:
  origin: community
---

# Configuração de Rede em Homelab

Use esta skill para projetar uma rede doméstica ou de pequeno laboratório que possa crescer sem
precisar de uma reconstrução completa.

## Quando Usar

- Planejando uma nova rede doméstica ou redesenhando uma configuração somente com roteador do ISP.
- Escolhendo papéis de gateway, switch e ponto de acesso.
- Projetando intervalos de IP, escopos DHCP, reservas estáticas e DNS.
- Preparando-se para futuras VLANs, Pi-hole, NAS, servidores de laboratório ou acesso VPN.
- Solucionando problemas em uma nova rede com NAT duplo, Wi-Fi instável ou endereços de
  servidor em mudança.

## Como Funciona

Comece separando os papéis dos dispositivos:

```text
Internet
  |
Modem ou ONT
  |
Gateway ou roteador      NAT, firewall, DHCP, DNS, roteamento inter-VLAN
  |
Switch gerenciado        clientes com fio, uplinks de AP, trunks VLAN opcionais
  |
Pontos de acesso         somente Wi-Fi; preferencialmente backhaul com fio
Servidores e NAS         endereços estáveis, nomes DNS, monitoramento
Clientes e IoT           pools DHCP, isolados depois se VLANs disponíveis
```

Escolha um gateway que corresponda ao operador, não apenas à lista de funcionalidades:

| Opção | Melhor para | Notas |
| --- | --- | --- |
| Roteador do ISP | Somente internet básica | Controle limitado e geralmente suporte VLAN ruim |
| Gateway UniFi | Rede doméstica gerenciada | Boa UI, lock-in de ecossistema |
| OPNsense ou pfSense | Homelab flexível | Forte controle de VLAN, firewall, VPN e DNS |
| MikroTik | Usuários avançados de rede | Poderoso, mas fácil de configurar erroneamente |
| Roteador Linux | Entusiastas | Documente o rollback antes de usar como gateway principal |

## Plano de IP

Evite o padrão mais comum, `192.168.1.0/24`, quando espera usar VPNs.
Frequentemente conflita com hotéis, escritórios e roteadores de ISP.

```text
Exemplo de plano para pequeno homelab:

192.168.10.0/24  clientes confiáveis
192.168.20.0/24  dispositivos IoT e de mídia
192.168.30.0/24  servidores e NAS
192.168.40.0/24  Wi-Fi guest
192.168.99.0/24  gerenciamento de rede

Convenção do gateway: .1
Reservas de infraestrutura: .2 a .49
Pool DHCP dinâmico: .50 a .240
Espaço de sobra: .241 a .254
```

Use `home.arpa` para nomes locais. É reservado para redes domésticas e evita os
problemas de vazamento/conflito de nomes ad hoc como `home.lan`.

```text
nas.home.arpa
pihole.home.arpa
gateway.home.arpa
switch-01.home.arpa
```

## DHCP e DNS

- Use reservas DHCP para qualquer coisa em que você faça SSH, marque como favorito, monitore ou exponha
  como serviço.
- Distribua o gateway como DNS até que um resolvedor local seja implantado intencionalmente.
- Se usar Pi-hole ou outro filtro DNS, dê-lhe uma reserva primeiro, depois aponte
  as opções DHCP DNS para esse endereço.
- Mantenha um pequeno intervalo estático/reservado por sub-rede para que substituições não colidam
  com leases dinâmicos.

## Cabeamento e Wi-Fi

- Prefira backhaul de AP com fio em vez de mesh quando puder instalar Ethernet.
- Use um switch PoE para APs e câmeras se o orçamento permitir.
- Rotule ambas as pontas de cada cabo e mantenha um mapa de portas simples.
- Coloque o gateway, switch, servidor DNS e NAS em energia UPS se quedas de energia forem comuns.

## Exemplos

### Atualização para Iniciantes

Objetivo: Manter o roteador do ISP mas estabilizar um pequeno laboratório.

1. Configure reservas DHCP para NAS, Pi e quaisquer hosts SSH.
2. Mova nomes locais para `home.arpa`.
3. Desative servidores DHCP duplicados em roteadores secundários ou APs.
4. Conecte o AP principal com fio em vez de depender de backhaul sem fio.

### Plano VLAN-Ready

Objetivo: Preparar para segmentação futura sem habilitá-la imediatamente.

1. Escolha intervalos /24 sem sobreposição para confiável, IoT, servidores, guest e
   gerenciamento.
2. Reserve .1 para o gateway e .2-.49 para infraestrutura em cada sub-rede.
3. Compre um gateway e switch que suportem VLANs e regras de firewall inter-VLAN.
4. Documente quais SSIDs e portas de switch eventualmente mapearão para cada rede.

## Anti-Padrões

- NAT duplo sem motivo ou documentação.
- Usar `192.168.1.0/24` quando acesso VPN está planejado.
- Endereços dinâmicos para NAS, Pi-hole, Home Assistant ou outros hosts de serviço.
- Roteadores de consumidor reutilizados como APs enquanto seus servidores DHCP ainda estão habilitados.
- Redes planas com câmeras, plugues inteligentes, laptops e servidores todos compartilhando a
  mesma fronteira de confiança.

## Veja Também

- Skill: `network-interface-health`
- Skill: `network-config-validation`
