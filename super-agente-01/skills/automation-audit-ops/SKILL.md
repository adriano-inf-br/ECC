---
name: automation-audit-ops
description: Fluxo de trabalho de inventário de automação e auditoria de sobreposição, com prioridade em evidências, para o ECC. Use quando o usuário quer saber quais jobs, hooks, conectores, servidores MCP ou wrappers estão ativos, quebrados, redundantes ou ausentes antes de consertar qualquer coisa.
metadata:
  origin: ECC
---

# Automation Audit Ops

Use isto quando o usuário perguntar quais automações estão ativas, quais jobs estão quebrados, onde há sobreposição ou qual ferramental e conectores estão de fato fazendo trabalho útil neste momento.

Esta é uma Skill de operador com prioridade em auditoria. O trabalho é produzir um inventário embasado em evidências e um conjunto de recomendações manter / mesclar / cortar / corrigir-em-seguida antes de reescrever qualquer coisa.

## Stack de Skills

Traga estas skills nativas do ECC para o fluxo de trabalho quando relevantes:

- `workspace-surface-audit` para inventário de conectores, MCP, hooks e apps
- `knowledge-ops` quando a auditoria precisa reconciliar a verdade ativa do repositório com contexto durável
- `github-ops` quando a resposta depende de CI, workflows agendados, issues ou automação de PR
- `ecc-tools-cost-audit` quando o problema real é fanout de webhook, jobs enfileirados ou consumo de faturamento no repositório de app irmão
- `research-ops` quando o inventário local deve ser comparado com o suporte atual da plataforma ou documentação pública
- `verification-loop` para provar o estado pós-correção em vez de confiar em uma recuperação presumida

## Quando Usar

- o usuário pergunta "quais automações eu tenho", "o que está ativo", "o que está quebrado" ou "o que se sobrepõe"
- a tarefa abrange cron jobs, GitHub Actions, hooks locais, servidores MCP, conectores, wrappers ou integrações de app
- o usuário quer saber o que foi portado de outro sistema de Agent e o que ainda precisa ser reconstruído dentro do ECC
- o workspace acumulou várias formas de fazer a mesma coisa e o usuário quer uma única via canônica

## Guardrails

- comece somente leitura, a menos que o usuário tenha pedido correções explicitamente
- separe:
  - configurado
  - autenticado
  - verificado recentemente
  - obsoleto ou quebrado
  - totalmente ausente
- não afirme que uma ferramenta está ativa só porque uma Skill ou config a referencia
- não mescle nem exclua superfícies sobrepostas até que a tabela de evidências exista

## Fluxo de Trabalho

### 1. Inventarie a superfície real

Leia a superfície ativa atual antes de teorizar:

- hooks de repositório e scripts de hook locais
- GitHub Actions e workflows agendados
- configs de MCP e servidores habilitados
- integrações baseadas em conector ou app
- scripts wrapper e pontos de entrada de automação específicos do repositório

Agrupe-os por superfície:

- runtime local
- CI / automação do repositório
- sistemas externos conectados
- mensageria / notificações
- faturamento / operações de cliente
- pesquisa / monitoramento

### 2. Classifique cada item por estado ativo

Para cada automação revelada, marque:

- configurado
- autenticado
- verificado recentemente
- obsoleto ou quebrado
- ausente

Depois classifique o tipo de problema:

- quebra ativa
- falha de autenticação
- status obsoleto
- sobreposição ou redundância
- capacidade ausente

### 3. Trace o caminho de prova

Embase cada afirmação importante com uma fonte concreta:

- caminho de arquivo
- execução de workflow
- log de hook
- entrada de config
- saída recente de comando
- assinatura exata de falha

Se o estado atual for ambíguo, diga isso diretamente em vez de fingir que a auditoria está completa.

### 4. Termine com manter / mesclar / cortar / corrigir-em-seguida

Para cada superfície sobreposta ou suspeita, retorne uma decisão:

- manter
- mesclar
- cortar
- corrigir em seguida

O valor está em colapsar automação ruidosa em uma única via canônica do ECC, não em preservar todo caminho histórico.

## Formato de Saída

```text
SUPERFÍCIE ATUAL
- automação
- fonte
- estado ativo
- prova

ACHADOS
- quebra ativa
- sobreposição
- status obsoleto
- capacidade ausente

RECOMENDAÇÃO
- manter
- mesclar
- cortar
- corrigir em seguida

PRÓXIMA AÇÃO ECC
- skill / hook / workflow / via de app exata a fortalecer
```

## Armadilhas

- não responda de memória quando o inventário ativo pode ser lido
- não trate "presente na config" como "funcionando"
- não conserte redundância de menor valor antes de nomear o caminho quebrado de alto sinal
- não amplie a tarefa em uma reescrita do repositório se o usuário pediu inventário primeiro

## Verificação

- afirmações importantes citam um caminho de prova ativo
- cada automação revelada é rotulada com uma categoria clara de estado ativo
- a recomendação final distingue manter / mesclar / cortar / corrigir-em-seguida
