---
name: terminal-ops
description: Fluxo de trabalho de execução de repositório baseado em evidências para o ECC. Use quando o usuário quer executar um comando, verificar um repositório, depurar uma falha de CI ou aplicar uma correção pontual com prova exata do que foi executado e verificado.
metadata:
  origin: ECC
---

# Terminal Ops

Use quando o usuário quer execução real de repositório: execute comandos, inspecione estado do git, depure CI ou builds, faça uma correção pontual e reporte exatamente o que mudou e o que foi verificado.

Esta skill é intencionalmente mais estreita do que orientações gerais de codificação. É um fluxo de trabalho de operador para execução terminal baseada em evidências.

## Stack de Skills

Traga estas skills nativas do ECC para o fluxo de trabalho quando relevante:

- `verification-loop` para passos exatos de comprovação após mudanças
- `tdd-workflow` quando a correção certa precisa de cobertura de regressão
- `security-review` quando segredos, autenticação ou entradas externas estão envolvidos
- `github-ops` quando a tarefa depende de execuções de CI, estado de PR ou status de release
- `knowledge-ops` quando o resultado verificado precisa ser capturado em contexto de projeto durável

## Quando Usar

- usuário diz "fix", "debug", "run this", "check the repo" ou "push it"
- a tarefa depende de saída de comando, estado do git, resultados de testes ou uma correção local verificada
- a resposta deve distinguir: alterado localmente, verificado localmente, commitado e enviado

## Restrições

- inspecione antes de editar
- mantenha somente leitura se o usuário pediu apenas auditoria/revisão
- prefira scripts e helpers locais do repositório a wrappers ad hoc improvisados
- não afirme que está corrigido até que o comando de comprovação tenha sido reexecutado
- não afirme que foi enviado a menos que o Branch realmente tenha se movido upstream

## Fluxo de Trabalho

### 1. Resolver a superfície de trabalho

Defina:

- caminho exato do repositório
- Branch
- estado de diff local
- modo solicitado:
  - inspecionar
  - corrigir
  - verificar
  - enviar

### 2. Leia a superfície com falha primeiro

Antes de alterar qualquer coisa:

- inspecione o erro
- inspecione o arquivo ou teste
- inspecione o estado do git
- use quaisquer logs ou contexto já fornecidos antes de reler às cegas

### 3. Mantenha a correção pontual

Resolva uma falha dominante por vez:

- use o menor comando de comprovação útil primeiro
- só escale para uma passagem maior de build/teste após a falha local ser resolvida
- se um comando continua falhando com a mesma assinatura, pare de fazer novas tentativas amplas e reduza o escopo

### 4. Reporte o estado exato de execução

Use palavras de status exatas:

- inspecionado
- alterado localmente
- verificado localmente
- commitado
- enviado
- bloqueado

## Formato de Saída

```text
SUPERFÍCIE
- repositório
- branch
- modo solicitado

EVIDÊNCIA
- comando / diff / teste com falha

AÇÃO
- o que mudou

STATUS
- inspecionado / alterado localmente / verificado localmente / commitado / enviado / bloqueado
```

## Armadilhas

- não trabalhe a partir de memória obsoleta quando o estado ativo do repositório pode ser lido
- não amplie uma correção pontual para agitar o repositório inteiro
- não use comandos git destrutivos
- não ignore trabalho local não relacionado

## Verificação

- a resposta nomeia o comando de comprovação ou teste
- trabalho relacionado ao git nomeia o caminho do repositório e o Branch
- qualquer afirmação de envio inclui o Branch de destino e o resultado exato
