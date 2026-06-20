---
name: homelab-network-readiness
description: Lista de verificação de prontidão para segmentação VLAN em homelab, filtragem DNS local e acesso remoto estilo WireGuard antes de alterar a configuração de roteador, firewall, DHCP ou VPN.
metadata:
  origin: community
---

# Prontidão de Rede em Homelab

Use esta skill antes de alterar uma rede doméstica ou de pequeno laboratório que mistura VLANs,
Pi-hole ou outro resolvedor DNS local, regras de firewall e acesso VPN remoto.

Esta é uma skill de planejamento e revisão. Não a transforme em configuração
de roteador, firewall ou VPN copiada e colada, a menos que a plataforma de destino, a topologia
atual, o caminho de rollback, o acesso ao console e a janela de manutenção sejam todos conhecidos.

## Quando Usar

- Preparando-se para dividir uma rede plana em VLANs confiáveis, IoT, guest, servidor ou
  de gerenciamento.
- Movendo clientes DHCP para Pi-hole, AdGuard Home, Unbound ou outro resolvedor DNS local.
- Adicionando WireGuard, Tailscale, ZeroTier, OpenVPN ou acesso VPN nativo do roteador.
- Revisando se uma mudança em homelab pode bloquear o operador do gateway,
  switch, ponto de acesso, servidor DNS ou servidor VPN.
- Transformando uma ideia informal de rede doméstica em um plano de migração em etapas com
  evidências de validação.

## Regras de Segurança

- Mantenha a primeira resposta somente leitura: inventário, riscos, plano em etapas, validação
  e rollback.
- Não exponha painéis de administração do gateway, resolvedores DNS, SSH, consoles NAS ou UIs
  de gerenciamento VPN diretamente à internet pública.
- Não forneça comandos de firewall, NAT, VLAN, DHCP ou VPN sem uma plataforma confirmada
  e um procedimento de rollback.
- Exija acesso ao console out-of-band ou na mesma sala antes de alterar VLANs de gerenciamento,
  portas trunk, políticas padrão de firewall ou configurações de DHCP/DNS.
- Mantenha um caminho funcionando de volta à internet antes de apontar toda a rede para
  um novo resolvedor DNS ou rota VPN.
- Trate redes IoT, guest, câmeras e servidores de laboratório como zonas de confiança diferentes
  até que o operador escolha explicitamente o contrário.

## Inventário Necessário

Colete isso antes de fornecer passos de implementação:

| Área | Perguntas |
| --- | --- |
| Borda de internet | O que é o modem ou ONT? O roteador do ISP está em modo bridge ou ainda está roteando? |
| Gateway | O que roteia, faz firewall, gerencia DHCP e termina VPNs? |
| Switching | Quais portas do switch são uplinks, portas de acesso, trunks ou não gerenciadas? |
| Wi-Fi | Quais SSIDs mapeiam para quais redes, e os APs são com fio ou mesh? |
| Endereçamento | Quais sub-redes existem hoje, e quais intervalos conflitam com sites VPN? |
| DNS/DHCP | Qual serviço distribui leases e endereços de resolvedor atualmente? |
| Gerenciamento | Como o operador alcançará o gateway, switch e AP após as mudanças? |
| Recuperação | O que pode ser revertido localmente se DNS, DHCP, VLANs ou rotas VPN quebrarem? |

## Plano de VLAN e Zonas de Confiança

Comece com intenção em vez de sintaxe de fornecedor.

| Zona | Conteúdo típico | Política padrão |
| --- | --- | --- |
| Confiável | Laptops, telefones, workstations de admin | Pode alcançar serviços compartilhados e gerenciamento somente quando necessário |
| Servidores | NAS, Home Assistant, hosts de laboratório, resolvedor DNS | Aceita fluxos de entrada estreitos de clientes confiáveis |
| IoT | TVs, plugues inteligentes, câmeras, alto-falantes | Acesso à internet mais exceções explícitas somente |
| Guest | Dispositivos de visitantes | Somente internet, sem alcance à LAN |
| Gerenciamento | Gateway, switches, APs, controladores | Alcançável somente por dispositivos admin confiáveis |
| VPN | Clientes remotos | Mesmo acesso ou mais restrito que clientes confiáveis |

Antes de recomendar IDs ou sub-redes VLAN, confirme:

1. O gateway suporta roteamento inter-VLAN e regras de firewall.
2. O switch suporta o comportamento de porta tagged e untagged necessário.
3. Os APs podem mapear SSIDs para VLANs.
4. O operador sabe por qual porta está conectado durante a mudança.
5. A rede de gerenciamento permanece alcançável após mudanças de trunk e SSID.

## Prontidão de Filtragem DNS

Pi-hole ou outro resolvedor local deve ser introduzido como uma dependência, não como um
ponto único de falha.

1. Dê ao resolvedor um endereço reservado antes de usá-lo em opções DHCP.
2. Confirme que ele pode resolver DNS público e nomes `home.arpa` locais.
3. Mantenha o gateway ou um segundo resolvedor disponível como fallback temporário.
4. Teste um cliente ou uma VLAN antes de alterar todos os escopos DHCP.
5. Documente quais redes podem ignorar a filtragem e por quê.
6. Verifique se as regras de bloqueio não quebram portais cativos, VPNs de trabalho, atualizações
   de firmware ou dispositivos médicos/de segurança.

Evidências de validação úteis:

```text
Cliente obtém lease DHCP esperado
Cliente recebe resolvedor DNS esperado
Consulta DNS pública funciona
Consulta DNS local home.arpa funciona
Domínio de teste bloqueado está bloqueado apenas onde pretendido
Interfaces de administração do gateway e DNS não são alcançáveis de redes guest ou IoT
```

## Prontidão de Acesso Remoto

Para acesso estilo WireGuard, decida o que a VPN pode alcançar antes de
gerar chaves ou abrir portas.

| Modo | Use quando | Notas de risco |
| --- | --- | --- |
| Split tunnel para uma sub-rede | Admin remoto para NAS ou hosts de laboratório | Mantenha a lista de rotas estreita |
| Split tunnel para serviços confiáveis | Acesse apps selecionados por IP ou DNS | Requer regras de firewall precisas |
| Full tunnel | Redes não confiáveis ou viagens | Mais responsabilidade de largura de banda e DNS |
| VPN overlay | Acesso remoto mais simples com controles de identidade | Ainda precisa de revisão de ACL |

Não recomende port forwarding até que o operador confirme:

- O endpoint VPN está atualizado e mantido ativamente.
- A porta encaminhada vai apenas ao serviço VPN, não a uma UI de admin.
- DNS dinâmico, comportamento de IP público e status de CGNAT do ISP são compreendidos.
- Chaves de peer podem ser revogadas sem reconstruir toda a rede.
- Logs ou status de conexão podem verificar quem conectou e quando.

## Sequência de Mudanças

Prefira mudanças pequenas e reversíveis:

1. Faça snapshot da topologia atual, plano de IP, configurações DHCP, configurações DNS e
   regras de firewall.
2. Reserve endereços de infraestrutura para gateway, DNS, controlador, APs, NAS e
   endpoint VPN.
3. Crie a nova zona ou VLAN sem mover dispositivos críticos.
4. Mova um cliente de teste e valide DHCP, DNS, roteamento, internet e comportamento
   de bloqueio.
5. Adicione exceções de firewall estreitas para fluxos necessários.
6. Mova um grupo de dispositivos de baixo risco.
7. Adicione acesso VPN com a rota mais estreita e política de firewall que satisfaça
   o caso de uso.
8. Documente o estado final, exceções conhecidas e comandos de rollback ou passos de UI.

## Lista de Verificação de Revisão

- Cada rede tem uma razão de existir e uma fronteira de confiança clara.
- Nenhuma interface de gerenciamento é alcançável de guest, IoT ou da internet pública.
- A falha de DNS não impede a capacidade do operador de recuperar localmente.
- Mudanças de escopo DHCP foram testadas em um cliente antes do rollout amplo.
- Clientes VPN recebem apenas as rotas e configurações DNS que precisam.
- Regras de firewall são default-deny entre zonas, com exceções nomeadas.
- O operador ainda pode alcançar superfícies de admin do gateway, switch, AP, DNS e VPN.
- O rollback está documentado no mesmo vocabulário que a UI ou CLI da plataforma escolhida.

## Anti-Padrões

- Segmentar redes antes de saber quais portas de switch e SSIDs carregam quais VLANs.
- Mover a workstation de admin para fora da única rede de gerenciamento alcançável.
- Apontar todos os escopos DHCP para um Pi-hole antes de testar DNS de fallback.
- Publicar gerenciamento de NAS, DNS, roteador ou hypervisor diretamente na internet.
- Tratar acesso VPN como equivalente ao acesso de LAN confiável completo.
- Adicionar regras de firewall allow-all temporariamente e esquecer de removê-las.
- Copiar comandos de outro fornecedor ou versão de firmware sem verificar a
  sintaxe exata da plataforma.

## Veja Também

- Skill: `homelab-network-setup`
- Skill: `network-config-validation`
- Skill: `network-interface-health`
