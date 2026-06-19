---
name: cisco-ios-patterns
description: Padrões de revisão de Cisco IOS e IOS-XE para comandos show, hierarquia de configuração, wildcard masks, posicionamento de ACL, higiene de interface e verificação segura em janela de mudança.
metadata:
  origin: community
---

# Cisco IOS Patterns

Use esta skill ao revisar trechos de Cisco IOS ou IOS-XE, montar uma
checklist de janela de mudança ou explicar como coletar evidências de um roteador ou
switch sem agravar o incidente.

## Quando Usar

- Revisar configuração IOS ou IOS-XE antes de uma mudança planejada.
- Escolher comandos `show` somente leitura para troubleshooting.
- Verificar wildcard masks de ACL e a direção da interface.
- Explicar os modos de configuração global, de interface, de processo de roteamento e de linha.
- Verificar se uma mudança chegou à running config e foi salva intencionalmente.

## Regras de Operação

Trate os exemplos de IOS como padrões, não como mudanças prontas para colar em produção. Confirme a
plataforma, os nomes das interfaces, a configuração atual, o caminho de rollback e o acesso out-of-band
antes de fazer mudanças em um dispositivo real.

Prefira este fluxo de trabalho:

1. Capture o estado atual com comandos somente leitura.
2. Revise a configuração candidata exata.
3. Confirme que o acesso de gerenciamento não pode ser bloqueado.
4. Aplique a menor mudança possível em uma janela de manutenção.
5. Releia o estado, compare com a baseline e só então salve após a validação.

## Referência de Modos

```text
Router> enable
Router# show running-config
Router# configure terminal
Router(config)# interface GigabitEthernet0/1
Router(config-if)# description UPLINK-TO-CORE
Router(config-if)# no shutdown
Router(config-if)# exit
Router(config)# end
Router# show running-config interface GigabitEthernet0/1
```

`running-config` é a memória ativa. `startup-config` é o que sobrevive ao reload.
Não salve uma mudança apenas porque um comando foi aceito; valide o comportamento
primeiro e depois use `copy running-config startup-config` se a mudança for aprovada.

## Coleta Somente Leitura

```text
show version
show inventory
show processes cpu sorted
show memory statistics
show logging
show running-config | section line vty
show running-config | section interface
show running-config | section router bgp
show ip interface brief
show interfaces
show interfaces status
show vlan brief
show mac address-table
show spanning-tree
show ip route
show ip protocols
show ip access-lists
show route-map
show ip prefix-list
```

Colete apenas a seção específica de que você precisa, em vez de despejar a configuração completa em um
ticket quando a configuração puder conter segredos, nomes de clientes ou topologia privada.

## Wildcard Masks

ACLs IOS e muitas declarações de roteamento usam wildcard masks, não máscaras de sub-rede.

```text
Máscara de sub-rede   Wildcard mask
255.255.255.255   0.0.0.0
255.255.255.252   0.0.0.3
255.255.255.0     0.0.0.255
255.255.0.0       0.0.255.255
```

Revise as wildcard masks antes do deploy. Uma máscara de sub-rede usada acidentalmente como
wildcard pode corresponder a muito mais tráfego do que o pretendido.

```text
ip access-list extended WEB-IN
  10 permit tcp 192.0.2.0 0.0.0.255 any eq 443
  999 deny ip any any log
```

Toda ACL tem um deny implícito no final. Adicione um deny explícito com log quando o
objetivo operacional incluir observar matches negados, e confirme que o volume de logging é seguro.

## Revisão de Posicionamento de ACL

Antes de aplicar uma ACL a uma interface, responda a estas perguntas:

- Qual direção de tráfego está sendo filtrada, `in` ou `out`?
- O tráfego de gerenciamento tem origem em um jump host conhecido ou em uma sub-rede de gerenciamento?
- Existe um permit explícito para o roteamento necessário, DNS, NTP, monitoramento ou
  tráfego da aplicação?
- Há contadores de hits disponíveis a partir de uma fonte de teste segura?
- Existe um comando de rollback e um caminho de console ou out-of-band ativo?

Não teste a alcançabilidade removendo proteções de firewall ou ACL. Leia primeiro os contadores,
os logs e o estado de rotas.

## Higiene de Interface

```text
interface GigabitEthernet0/1
 description UPLINK-TO-CORE
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30
 switchport trunk native vlan 999
 no shutdown
```

Use descrições claras, switchport mode explícito e native VLANs documentadas.
Em interfaces roteadas, confirme a máscara, o endereçamento do peer e o processo de roteamento
antes de assumir que o estado do link significa que o encaminhamento está correto.

## Verificação em Janela de Mudança

Use verificações de antes/depois que correspondam à mudança real.

```text
show running-config | section interface GigabitEthernet0/1
show interfaces GigabitEthernet0/1
show logging | include GigabitEthernet0/1|changed state|line protocol
show ip route <prefix>
show ip access-lists <name>
```

Para mudanças de roteamento, capture também o estado dos neighbors e as tabelas de rotas antes e
depois da mudança. Para mudanças de ACL, compare os contadores de hits a partir de uma fonte de teste
planejada, em vez de depender de um ping genérico.

## Anti-Padrões

- Aplicar uma configuração gerada sem um diff específico do dispositivo.
- Salvar a configuração antes que as verificações pós-mudança passem.
- Usar uma máscara de sub-rede onde o IOS espera uma wildcard mask.
- Aplicar uma ACL na direção errada da interface.
- Fazer troubleshooting desativando ACLs, políticas de rota ou autenticação.
- Colar configurações completas em ferramentas públicas sem sanitizar segredos e topologia.

## Veja Também

- Agent: `network-config-reviewer`
- Agent: `network-troubleshooter`
- Skill: `network-config-validation`
- Skill: `network-interface-health`
