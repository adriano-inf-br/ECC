---
name: unified-notifications-ops
description: Opere notificações como um único fluxo de trabalho nativo do ECC entre GitHub, Linear, alertas de desktop, hooks e superfícies de comunicação conectadas. Use quando o problema real é roteamento de alertas, deduplicação, escalonamento ou colapso de caixa de entrada.
metadata:
  origin: ECC
---

# Unified Notifications Ops

Use esta skill quando o problema real não é uma notificação ausente. O problema real é um sistema de notificações fragmentado.

O objetivo é transformar eventos dispersos em uma única superfície de operador com:
- severidade clara
- propriedade clara
- roteamento claro
- ação de acompanhamento clara

## Quando Usar

- o usuário quer um canal unificado de notificações entre GitHub, Linear, hooks locais, alertas de desktop, chat ou email
- falhas de CI, solicitações de revisão, atualizações de issue e eventos de operador estão chegando em lugares desconexos
- a configuração atual cria ruído em vez de ação
- o usuário quer consolidar branches de notificação sobrepostas ou propostas de backlog em um canal nativo do ECC
- o workspace já tem hooks, MCPs ou ferramentas conectadas, mas sem política de notificação coerente

## Superfície Preferida

Comece pelo que já existe:
- issues, PRs, revisões, comentários e CI do GitHub
- movimentação de issue/projeto do Linear
- eventos de hook local e sinais de ciclo de vida de sessão
- primitivos de notificação de desktop
- superfícies de email/chat conectadas quando realmente existem

Prefira orquestração nativa do ECC em vez de sugerir ao usuário que adote um produto de notificação separado.

## Regras Não-Negociáveis

- nunca exponha tokens, segredos, segredos de webhook ou identificadores internos
- separe:
  - fonte do evento
  - severidade
  - canal de roteamento
  - ação do operador
- padronize para digest-first quando o custo de interrupção é incerto
- não espalhe cada evento para cada canal
- se a correção real é melhor triagem de issues, política de hook ou fluxo de projeto, diga isso explicitamente

## Pipeline de Eventos

Trate o canal como:

1. **Capturar** o evento
2. **Classificar** urgência e proprietário
3. **Rotear** para o canal correto
4. **Colapsar** duplicatas e agitação de baixo sinal
5. **Anexar** a próxima ação do operador

O objetivo são notificações em menor quantidade, porém de melhor qualidade.

## Modelo de Severidade Padrão

| Classe | Exemplos | Tratamento padrão |
| --- | --- | --- |
| Crítico | CI de branch padrão quebrado, issue de segurança, release bloqueado, deploy com falha | interromper agora |
| Alto | revisão solicitada, PR com falha, handoff bloqueante do proprietário | alerta no mesmo dia |
| Médio | mudanças de estado de issue, comentários notáveis, movimentação de backlog | digest ou fila |
| Baixo | sucessos repetidos, agitação rotineira, marcadores de ciclo de vida redundantes | suprimir ou dobrar |

Se o workspace não tiver modelo de severidade, construa um antes de propor automação.

## Fluxo de Trabalho

### 1. Inventariar a superfície atual

Liste:
- fontes de evento
- canais atuais
- hooks/scripts existentes que emitem alertas
- caminhos duplicados para o mesmo evento
- casos de falha silenciosa onde coisas importantes não estão sendo surfaçadas

Destaque o que o ECC já possui.

### 2. Decidir o que merece interrupção

Para cada família de evento, responda:
- quem precisa saber?
- com que rapidez precisam saber?
- isso deve interromper, agrupar ou apenas registrar?

Use estes padrões:
- interromper para eventos de release, CI, segurança e bloqueantes do proprietário
- digest para atualizações de médio sinal
- apenas registro para telemetria e marcadores de ciclo de vida de baixo sinal

### 3. Colapsar duplicatas antes de adicionar canais

Procure por:
- o mesmo evento de PR aparecendo no GitHub, Linear e logs locais
- notificações de hook repetidas para a mesma falha
- comentários ou agitação de status que deveriam ser resumidos em vez de encaminhados brutos
- canais que se duplicam entre si sem adicionar um caminho de ação melhor

Prefira:
- um resumo canônico
- um proprietário
- um canal primário
- um caminho de fallback

### 4. Projetar o fluxo de trabalho nativo do ECC

Para cada necessidade real de notificação, defina:
- **fonte**
- **portão**
- **formato**: alerta imediato, digest, fila ou somente dashboard
- **canal**
- **ação**

Se o ECC já tem o primitivo, prefira:
- uma skill para triagem de operador
- um hook para emissão/aplicação automática
- um agent para classificação delegada
- um MCP/conector apenas quando uma ponte real está faltando

### 5. Retornar um design orientado à ação

Termine com:
- o que manter
- o que suprimir
- o que mesclar
- o que o ECC deve encapsular em seguida

## Formato de Saída

```text
SUPERFÍCIE ATUAL
- fontes
- canais
- duplicatas
- lacunas

MODELO DE EVENTO
- crítico
- alto
- médio
- baixo

PLANO DE ROTEAMENTO
- fonte -> canal
- por quê
- proprietário operador

CONSOLIDAÇÃO
- suprimir
- mesclar
- resumos canônicos

PRÓXIMO MOVIMENTO ECC
- skill / hook / agent / MCP
- fluxo de trabalho exato a construir em seguida
```

## Regras de Recomendação

- prefira um canal forte a muitos canais fracos
- prefira digests para atualizações de médio e baixo sinal
- prefira hooks quando o sinal deve emitir automaticamente
- prefira skills de operador quando o trabalho é triagem, roteamento e tomada de decisão com revisão em primeiro lugar
- prefira `project-flow-ops` quando a causa raiz é coordenação de backlog / PR em vez de alertas
- prefira `workspace-surface-audit` quando o usuário primeiro precisa de um inventário de fontes
- se notificações de desktop são suficientes, não invente uma ponte externa desnecessária

## Bons Casos de Uso

- "Temos GitHub, Linear e alertas de hook local, mas nenhum fluxo único de operador"
- "Nossas falhas de CI são ruidosas e as pessoas as ignoram"
- "Quero uma política de notificação entre as superfícies Claude, OpenCode e Codex"
- "Descubra o que deve interromper versus chegar em um digest"
- "Consolide ideias sobrepostas de PR de notificação em um canal ECC canônico"

## Skills Relacionadas

- `workspace-surface-audit`
- `project-flow-ops`
- `github-ops`
- `knowledge-ops`
- `customer-billing-ops` quando a dificuldade de notificação é cobrança/operações de clientes em vez de engenharia
