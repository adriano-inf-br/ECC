---
name: homelab-pihole-dns
description: Instalação do Pi-hole, gerenciamento de blocklists, configuração de DNS-over-HTTPS, integração com DHCP, registros DNS locais e solução de problemas de resolução DNS quebrada em uma rede doméstica.
metadata:
  origin: community
---

# Homelab Pi-hole DNS

O Pi-hole é um bloqueador de anúncios via DNS para toda a rede que roda em um Raspberry Pi ou em qualquer host Linux.
Todo dispositivo na sua rede recebe automaticamente o bloqueio de domínios de anúncios e malware — sem necessidade de
extensão de navegador.

## Quando Usar

- Instalar o Pi-hole em um Raspberry Pi ou host Linux
- Configurar o Pi-hole como servidor DNS de uma rede doméstica
- Adicionar ou gerenciar blocklists
- Configurar resolvedores upstream com DNS-over-HTTPS (DoH)
- Criar registros DNS locais (ex.: `nas.home.lan`, `pi.home.lan`)
- Solucionar problemas de dispositivos que perdem acesso à internet após a instalação do Pi-hole
- Rodar o Pi-hole junto ou no lugar do DHCP

## Como o Pi-hole Funciona

```
Fluxo normal (sem Pi-hole):
  Dispositivo → solicita ads.tracker.com → DNS do provedor → IP real → anúncios carregam

Com Pi-hole:
  Dispositivo → solicita ads.tracker.com → DNS do Pi-hole → bloqueado (retorna 0.0.0.0) → sem anúncio

Todas as consultas DNS passam primeiro pelo Pi-hole.
O Pi-hole verifica contra as blocklists.
Domínios bloqueados retornam uma resposta nula — o anúncio/rastreador nunca carrega.
Domínios permitidos são encaminhados ao seu resolvedor upstream (Cloudflare, Google, etc.).
```

## Instalação

### Docker (Recomendado)

O Docker é a forma mais fácil de instalar o Pi-hole e torna atualizações e backups
mais simples.

```yaml
# docker-compose.yml
services:
  pihole:
    image: pihole/pihole:<pinned-release-tag>
    container_name: pihole
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "80:80/tcp"          # Admin web
    environment:
      TZ: "America/New_York"
      WEBPASSWORD: "${PIHOLE_WEBPASSWORD}"   # defina via arquivo .env ou secret
      PIHOLE_DNS_: "1.1.1.1;1.0.0.1"
      DNSMASQ_LISTENING: "all"
    volumes:
      - "./etc-pihole:/etc/pihole"
      - "./etc-dnsmasq.d:/etc/dnsmasq.d"
    restart: unless-stopped
    cap_add:
      - NET_ADMIN              # necessário apenas se o Pi-hole for servir DHCP
```

Substitua `<pinned-release-tag>` por uma tag de release atual do Pi-hole antes de implantar.
Evite `latest` para infraestrutura DNS de longa duração, para que as atualizações sejam deliberadas e
revisáveis.

Defina `PIHOLE_WEBPASSWORD` em um arquivo `.env` ao lado do `docker-compose.yml`, aplique chmod
`600` e mantenha-o fora do git — não coloque a senha diretamente no arquivo compose.

Acesse o admin web em: `http://<pi-ip>/admin`

### Instalação Bare-Metal (Raspberry Pi OS / Debian / Ubuntu)

O Pi-hole requer um IP estático antes da instalação.

```bash
# Passo 1: Atribua um IP estático (edite /etc/dhcpcd.conf no Pi OS)
sudo nano /etc/dhcpcd.conf
# Adicione no final:
interface eth0
static ip_address=192.168.3.2/24
static routers=192.168.3.1
static domain_name_servers=192.168.3.1

# Passo 2: Baixe e inspecione o instalador antes de executá-lo.
# Prefira o pacote ou o caminho de instalação documentado pelo Pi-hole para seu SO/versão.
curl -sSL https://install.pi-hole.net -o pi-hole-install.sh
less pi-hole-install.sh   # revise antes de prosseguir

# Passo 3: Execute
bash pi-hole-install.sh

# Siga o instalador interativo:
# 1. Selecione a interface de rede (eth0 para cabeada — recomendado)
# 2. Selecione o DNS upstream (Cloudflare ou deixe o padrão — pode mudar depois)
# 3. Confirme o IP estático
# 4. Instale a interface de admin web (recomendado)
# 5. Anote a senha de admin exibida no final
```

## Apontando Sua Rede para o Pi-hole

```
# Método 1: Altere o DNS nas configurações de DHCP do seu roteador (recomendado)
  UI de admin do roteador → Configurações de DHCP → Servidor DNS
  DNS Primário: 192.168.3.2  (IP do Pi-hole)
  DNS Secundário: deixe em branco para bloqueio estrito, ou use um segundo Pi-hole.
                 Um fallback público como 1.1.1.1 melhora a disponibilidade durante
                 o rollout, mas pode contornar o bloqueio porque os clientes podem consultá-lo.

  Todos os dispositivos recebem o Pi-hole como DNS automaticamente na próxima renovação de DHCP.
  Forçar renovação: reconecte o Wi-Fi ou execute 'sudo dhclient -r && sudo dhclient' no Linux

# Método 2: DNS por dispositivo (útil para testar antes do rollout em toda a rede)
  Windows: Painel de Controle → Adaptador de Rede → Propriedades IPv4 → defina o DNS manualmente
  macOS: Ajustes do Sistema → Rede → Detalhes → DNS → defina manualmente
  Linux: /etc/resolv.conf ou NetworkManager

# Método 3: Pi-hole como servidor DHCP (substitui o DHCP do roteador)
  Admin do Pi-hole → Settings → DHCP → Enable
  Desabilite o DHCP no seu roteador primeiro — dois servidores DHCP na mesma rede causam conflitos
  Vantagem: a resolução de hostname funciona automaticamente (dispositivos registram seus nomes)
```

## Gerenciamento de Blocklists

```
# Admin do Pi-hole → Adlists → Add new adlist

# Blocklists recomendadas:
  https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts
  # padrão — mais de 200 mil domínios

  https://blocklistproject.github.io/Lists/malware.txt
  # domínios de malware

  https://blocklistproject.github.io/Lists/tracking.txt
  # rastreamento/telemetria

# Após adicionar uma lista:
  Tools → Update Gravity  (baixa e compila todas as blocklists)

# Se um site for bloqueado quando não deveria (falso positivo):
  Admin do Pi-hole → Whitelist → Add domain
  Exemplo: api.my-legitimate-service.com

# Verifique o que está sendo bloqueado em tempo real:
  Dashboard → Query Log  (fluxo de consultas DNS ao vivo com status de bloqueio/permissão)
```

## Upstream DNS-over-HTTPS

O DNS-over-HTTPS criptografa suas consultas DNS para que seu provedor não consiga ver quais sites você resolve.

```bash
# Instale o cloudflared (proxy DoH da Cloudflare).
# Prefira o repositório de pacotes da Cloudflare para verificação automática de assinatura de pacotes.
# Se baixar um binário diretamente, fixe uma versão de release e verifique seu checksum.
CLOUDFLARED_VERSION="<pinned-version>"
curl -LO "https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-arm64"
# Verifique o checksum/assinatura nas notas de release da Cloudflare antes de instalar.
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared

# Crie a configuração do cloudflared
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml << EOF
proxy-dns: true
proxy-dns-port: 5053
proxy-dns-upstream:
  - https://1.1.1.1/dns-query
  - https://1.0.0.1/dns-query
EOF

# Crie o serviço systemd
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# Agora aponte o Pi-hole para o proxy DoH local:
# Admin do Pi-hole → Settings → DNS → Custom upstream DNS
# Defina como: 127.0.0.1#5053
# Desmarque todos os outros resolvedores upstream
```

## Registros DNS Locais

Torne seus serviços acessíveis por nome (ex.: `nas.home.lan`, `grafana.home.lan`).

> **Nota sobre nomes de domínio:** `.home.lan` é amplamente usado em homelabs e funciona na prática.
> O sufixo reservado pela IETF para uso local é `.home.arpa` (RFC 8375) — use-o para
> seguir o padrão. Evite `.local` para registros DNS do Pi-hole, pois ele conflita com
> mDNS/Bonjour.

```
# Admin do Pi-hole → Local DNS → DNS Records

  Domínio             IP
  nas.home.lan        192.168.30.10
  pi.home.lan         192.168.30.2
  grafana.home.lan    192.168.30.3
  proxmox.home.lan    192.168.30.4

# A partir de qualquer dispositivo na sua rede:
  ping nas.home.lan        → 192.168.30.10
  http://grafana.home.lan  → seu dashboard do Grafana

# Para subdomínios, adicione um CNAME:
  Admin do Pi-hole → Local DNS → CNAME Records
  Domínio: portainer.home.lan → Alvo: pi.home.lan
```

## Solução de Problemas

```bash
# Pi-hole bloqueando algo que não deveria
pihole -q example.com          # Verifica se o domínio está bloqueado e em qual lista
pihole -w example.com          # Coloca na whitelist imediatamente

# DNS não resolve de jeito nenhum
pihole status                  # Verifica se o pihole-FTL está rodando
dig @192.168.3.2 google.com   # Testa o DNS diretamente contra o Pi-hole

# Reinicia o DNS do Pi-hole
pihole restartdns

# Verifica os logs de consulta de um dispositivo específico
pihole -t                      # Tail ao vivo de todas as consultas
# Ou filtre por cliente no Query Log do admin web

# Atualização do gravity do Pi-hole (recarrega as blocklists)
pihole -g
```

## Anti-Padrões

```
# RUIM: Depender de um único Pi-hole sem um caminho de recuperação
# Se o Pi-hole travar ou o Pi perder energia, o DNS pode parar de funcionar
# BOM: Mantenha um fallback de roteador documentado para rollback durante a configuração
# MELHOR: Rode duas instâncias de Pi-hole para redundância; evite DNS de fallback público para bloqueio estrito

# RUIM: Instalar o Pi-hole sem um IP estático
# Se o Pi receber um novo IP via DHCP, todos os dispositivos perdem o DNS
# BOM: Defina o IP estático primeiro, depois instale o Pi-hole

# RUIM: Habilitar o DHCP do Pi-hole sem desabilitar o DHCP do roteador primeiro
# Dois servidores DHCP na mesma rede distribuem IPs conflitantes
# BOM: Desabilite o DHCP do roteador, depois habilite o DHCP do Pi-hole

# RUIM: Nunca atualizar o gravity (blocklists)
# Novos domínios de anúncios e malware se acumulam — listas desatualizadas os ignoram
# BOM: Agende uma atualização semanal do gravity: pihole -g (ou habilite em Settings → API)
```

## Boas Práticas

- Dê ao Pi um IP estático ou uma reserva de DHCP antes de instalar o Pi-hole
- Use o Pi-hole como DNS primário; para redundância, adicione um segundo Pi-hole em vez de um
  resolvedor público se você precisar de bloqueio estrito
- Habilite o DoH (DNS-over-HTTPS) com o cloudflared para consultas upstream criptografadas
- Defina `home.lan` como seu domínio local e crie registros DNS para todos os seus serviços
- Revise o Query Log ocasionalmente — consultas bloqueadas mostram o que os dispositivos estão fazendo

## Skills Relacionadas

- homelab-network-setup
- homelab-vlan-segmentation
- homelab-wireguard-vpn
