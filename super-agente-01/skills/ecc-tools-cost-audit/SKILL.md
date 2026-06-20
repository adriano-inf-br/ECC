---
name: ecc-tools-cost-audit
description: Fluxo de trabalho de auditoria de gasto e cobrança do ECC Tools baseado em evidências. Use ao investigar criação descontrolada de PRs, bypass de cota, vazamento de modelo premium, jobs duplicados ou picos de custo do GitHub App no repositório do ECC Tools.
metadata:
  origin: ECC
---

# ECC Tools Cost Audit

Use esta skill quando o usuário suspeitar que o GitHub App do ECC Tools está queimando custo, criando PRs em excesso, contornando limites de uso ou roteando usuários gratuitos para caminhos de análise premium.

Este é um fluxo de trabalho de operador focado para o repositório irmão [ECC-Tools](../../ECC-Tools). Não é uma skill genérica de cobrança e não é um passe de code review em todo o repositório.

## Skill Stack

Traga estas skills nativas do ECC para o fluxo de trabalho quando relevante:

- `autonomous-loops` para auditorias multi-passo limitadas que cruzam webhooks, filas, cobrança e retentativas
- `agentic-engineering` para rastrear o caminho da requisição em unidades discretas e prováveis
- `customer-billing-ops` quando o comportamento do repositório e a matemática de impacto no cliente devem ser separados de forma limpa
- `search-first` antes de inventar helpers ou reimplementar utilitários locais do repositório
- `security-review` quando auth, gates de uso, entitlements ou segredos forem tocados
- `verification-loop` para provar a segurança de reexecução e o estado exato pós-correção
- `tdd-workflow` quando a correção precisar de cobertura de regressão nos caminhos de worker, router ou cobrança

## Quando Usar

- usuário menciona taxa de gasto do ECC Tools, recursão de PR, PRs criados em excesso, bypass de limite de uso ou vazamento de modelo premium
- a tarefa está no repositório irmão `ECC-Tools` e depende de handlers de webhook, workers de fila, reserva de uso, lógica de criação de PR ou aplicação de paid-gate
- um relato de cliente diz que o app criou PRs demais, cobrou incorretamente ou analisou código sem produzir um resultado utilizável

## Guardrails de Escopo

- trabalhe no repositório irmão `ECC-Tools`, não em `everything-claude-code`
- comece em modo somente leitura, a menos que o usuário tenha pedido claramente uma correção
- não altere fluxos de cobrança, checkout ou UI não relacionados enquanto rastreia o gasto de análise
- trate branches gerados pelo app e PRs gerados pelo app como caminhos de recursão suspeitos até prova em contrário
- separe três coisas explicitamente:
  - causa raiz do gasto no lado do repositório
  - impacto de cobrança voltado ao cliente
  - lacunas de produto ou entitlement que precisam de acompanhamento no backlog

## Fluxo de Trabalho

### 1. Congele o escopo do repositório

- mude para o repositório irmão `ECC-Tools`
- verifique o branch e o diff local primeiro
- identifique a superfície exata sob auditoria:
  - router de webhook
  - produtor de fila
  - consumidor de fila
  - caminho de criação de PR
  - caminho de reserva de uso / cobrança
  - caminho de roteamento de modelo

### 2. Rastreie a entrada antes de teorizar

- inspecione `src/index.*` ou o entrypoint principal primeiro
- mapeie cada caminho de enfileiramento antes de sugerir uma correção
- confirme quais eventos do GitHub compartilham um tipo de fila
- confirme se eventos de push, pull_request, synchronize, comment ou re-execução manual podem convergir para o mesmo caminho caro

### 3. Rastreie o worker e os efeitos colaterais

- inspecione o consumidor de fila ou o worker agendado que trata da análise
- confirme se uma análise enfileirada sempre termina em:
  - criação de PR
  - criação de branch
  - atualizações de arquivo
  - chamadas a modelo premium
  - incrementos de uso
- se a análise puder gastar tokens e então falhar antes de a saída ser persistida, classifique como gasto-com-saída-quebrada

### 4. Audite os caminhos de gasto de alto sinal

#### Multiplicação de PR

- inspecione os helpers de PR e a nomenclatura de branch
- verifique dedupe, tratamento de evento synchronize e reuso de PR existente
- se branches gerados pelo app puderem reentrar na análise, trate isso como risco de recursão prioridade-0

#### Bypass de cota

- inspecione onde a cota é verificada versus onde o uso é reservado ou incrementado
- se a cota for verificada antes do enfileiramento, mas o uso for cobrado apenas dentro do worker, trate passagens concorrentes pela porta da frente como uma corrida real

#### Vazamento de modelo premium

- inspecione a seleção de modelo, a ramificação por tier e o roteamento de provedor
- verifique se usuários gratuitos ou limitados ainda podem atingir analisadores premium quando há chaves premium presentes

#### Gasto por retentativa

- inspecione loops de retentativa, jobs de fila duplicados e reexecuções de falha determinística
- se o mesmo erro não-transitório puder gastar análise repetidamente, corrija isso antes de melhorias de qualidade

### 5. Corrija na ordem de gasto

Se o usuário pediu mudanças de código, priorize as correções nesta ordem:

1. parar a multiplicação automática de PR
2. parar o bypass de cota
3. parar o vazamento premium
4. parar o fanout de jobs duplicados e retentativas inúteis
5. fechar lacunas de segurança de reexecução/atualização

Mantenha o passe limitado a uma a três correções diretas, a menos que a mesma causa raiz claramente abranja múltiplos arquivos.

### 6. Verifique com os menores passos de prova

- reexecute apenas os testes direcionados ou fatias de integração que cobrem o caminho alterado
- verifique se o caminho de gasto agora está:
  - bloqueado
  - deduplicado
  - rebaixado para análise mais barata
  - ou rejeitado cedo
- declare o status final exatamente:
  - alterado localmente
  - verificado localmente
  - enviado (push)
  - implantado (deployed)
  - ainda bloqueado

## Padrões de Falha de Alto Sinal

### 1. Um tipo de fila para todos os gatilhos

Se pushes, syncs de PR e auditorias manuais enfileiram o mesmo job e o worker sempre cria um PR, análise equivale a spam de PR.

### 2. Reserva de uso pós-enfileiramento

Se o uso for verificado na porta da frente mas só incrementado no worker, requisições concorrentes podem todas passar pelo gate e exceder a cota.

### 3. Tier gratuito no caminho premium

Se jobs gratuitos enfileirados ainda puderem rotear para Anthropic ou outro provedor premium quando há chaves, isso é vazamento de gasto real mesmo que o usuário nunca veja o resultado premium.

### 4. Branches gerados pelo app reentram no webhook

Se `pull_request.synchronize`, pushes de branch ou execuções disparadas por comentário forem acionados em branches de propriedade do app, o app pode analisar recursivamente sua própria saída.

### 5. Trabalho caro antes da segurança de persistência

Se o sistema puder gastar tokens e então falhar na criação de PR, atualização de arquivo ou colisão de branch, ele está queimando custo sem entregar valor.

## Armadilhas

- não comece com perambulação ampla pelo repositório; estabeleça webhook -> fila -> worker primeiro
- não misture inferência de cobrança de cliente com a verdade de produto embasada em código
- não corrija problemas de qualidade de menor valor antes de o caminho de maior gasto estar contido
- não afirme que o gasto foi corrigido até que o passo de prova estreito tenha sido reexecutado
- não faça push nem deploy a menos que o usuário tenha pedido
- não toque em mudanças locais não relacionadas do repositório se já estiverem em andamento

## Verificação

- causas raiz citam caminhos de arquivo e áreas de código exatos
- correções são ordenadas por impacto de gasto, não por elegância do código
- comandos de prova são nomeados
- o status final distingue mudança local, verificação, push e implantação
