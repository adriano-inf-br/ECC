---
name: research-ops
description: Fluxo de trabalho de pesquisa de estado atual com base em evidências para ECC. Use quando o usuário quiser fatos recentes, comparações, enriquecimento ou uma recomendação construída a partir de evidências públicas atuais e qualquer contexto local fornecido.
metadata:
  origin: ECC
---

# Research Ops

Use quando o usuário pedir para pesquisar algo atual, comparar opções, enriquecer pessoas ou empresas, ou transformar pesquisas repetidas em um fluxo de trabalho monitorado.

Este é o wrapper operacional em torno da stack de pesquisa do repositório. Não é um substituto para `deep-research`, `exa-search` ou `market-research`; ele diz quando e como usá-los juntos.

## Stack de Skills

Incorpore estas skills nativas do ECC ao fluxo de trabalho quando relevante:

- `exa-search` para descoberta rápida na web atual
- `deep-research` para síntese de múltiplas fontes com citações
- `market-research` quando o resultado final deve ser uma recomendação ou decisão ranqueada
- `lead-intelligence` quando a tarefa é targeting de pessoas/empresas em vez de pesquisa genérica
- `knowledge-ops` quando o resultado deve ser armazenado em contexto durável depois

## Quando Usar

- o usuário diz "pesquise", "procure", "compare", "com quem devo falar" ou "o que há de mais recente"
- a resposta depende de informações públicas atuais
- o usuário já forneceu evidências e quer que elas sejam consideradas em uma nova recomendação
- a tarefa pode ser recorrente o suficiente para se tornar um monitor em vez de uma pesquisa avulsa

## Proteções

- não responda perguntas atuais com memória desatualizada quando a busca atualizada é barata
- separe:
  - fato com fonte
  - evidência fornecida pelo usuário
  - inferência
  - recomendação
- não inicie uma passagem de pesquisa pesada se a resposta já estiver no código ou documentação local

## Fluxo de Trabalho

### 1. Comece a partir do que o usuário já forneceu

Normalize qualquer material fornecido em:

- fatos já evidenciados
- precisa de verificação
- perguntas em aberto

Não reinicie a análise do zero se o usuário já construiu parte do modelo.

### 2. Classifique a solicitação

Escolha a trilha certa antes de pesquisar:

- resposta factual rápida
- memorando de comparação ou decisão
- passagem de lead/enriquecimento
- candidato a monitoramento recorrente

### 3. Siga primeiro o caminho de evidências mais leve e útil

- use `exa-search` para descoberta rápida
- escale para `deep-research` quando a síntese ou múltiplas fontes importam
- use `market-research` quando o resultado deve terminar em uma recomendação
- transfira para `lead-intelligence` quando a solicitação real é ranqueamento de alvo ou descoberta de caminho quente

### 4. Reporte com fronteiras de evidência explícitas

Para afirmações importantes, diga se são:

- fatos com fonte
- contexto fornecido pelo usuário
- inferência
- recomendação

Respostas sensíveis à frescura devem incluir datas concretas.

### 5. Decida se a tarefa deve permanecer manual

Se o usuário provavelmente fará a mesma pergunta de pesquisa repetidamente, diga isso explicitamente e recomende uma camada de monitoramento ou fluxo de trabalho em vez de repetir a mesma busca manual indefinidamente.

## Formato de Saída

```text
TIPO DE PERGUNTA
- factual / comparação / enriquecimento / monitoramento

EVIDÊNCIAS
- fatos com fonte
- contexto fornecido pelo usuário

INFERÊNCIA
- o que decorre das evidências

RECOMENDAÇÃO
- resposta ou próximo passo
- se isso deve se tornar um monitor
```

## Armadilhas

- não misture inferência com fatos com fonte sem rotulá-la
- não ignore evidências fornecidas pelo usuário
- não use uma trilha de pesquisa pesada para uma pergunta que o contexto do repositório local pode responder
- não forneça respostas sensíveis à frescura sem datas

## Verificação

- afirmações importantes são rotuladas por tipo de evidência
- saídas sensíveis à frescura incluem datas
- a recomendação final corresponde ao modo de pesquisa realmente usado
