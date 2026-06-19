---
name: crosspost
description: Distribuição de conteúdo multiplataforma entre X, LinkedIn, Threads e Bluesky. Adapta o conteúdo por plataforma usando padrões do content-engine. Nunca publica conteúdo idêntico entre plataformas. Use quando o usuário quiser distribuir conteúdo entre plataformas sociais.
metadata:
  origin: ECC
---

# Crosspost

Distribua conteúdo entre plataformas sem transformá-lo no mesmo post falso em quatro fantasias.

## Quando Ativar

- o usuário quer publicar a mesma ideia subjacente em múltiplas plataformas
- um lançamento, atualização, release ou ensaio precisa de versões específicas por plataforma
- o usuário diz "crosspost", "poste isto em todo lugar" ou "adapte isto para X e LinkedIn"

## Regras Centrais

1. Não publique cópia idêntica entre plataformas.
2. Preserve a voz do autor entre plataformas.
3. Adapte para restrições, não para estereótipos.
4. Um post ainda deve ser sobre uma só coisa.
5. Não invente um CTA, pergunta ou moral se a fonte não os mereceu.

## Fluxo de Trabalho

### Passo 1: Comece com a Versão Primária

Escolha primeiro a versão de origem mais forte:
- o post original do X
- o artigo original
- a nota de lançamento
- a thread
- o memorando ou changelog

Use `content-engine` primeiro se a fonte ainda precisar de modelagem de voz.

### Passo 2: Capture a Impressão Digital da Voz

Rode `brand-voice` primeiro se a voz da fonte ainda não tiver sido capturada na sessão atual.

Reutilize o `VOICE PROFILE` resultante diretamente.
Não construa um segundo checklist de voz ad hoc aqui, a menos que o usuário queira explicitamente uma nova substituição para esta campanha.

### Passo 3: Adapte por Restrição de Plataforma

### X

- mantenha comprimido
- comece com a afirmação ou artefato mais incisivo
- use uma thread apenas quando um único post colapsaria o argumento
- evite hashtags e enchimento genérico

### LinkedIn

- adicione apenas o contexto necessário para pessoas fora do nicho
- não o transforme em um post falso de reflexão de fundador
- não adicione uma pergunta de encerramento só porque é o LinkedIn
- não force um "tom profissional" polido se o autor é naturalmente mais incisivo

### Threads

- mantenha legível e direto
- não escreva cópia falsa de criador hipercasual
- não cole a versão do LinkedIn e a encurte

### Bluesky

- mantenha conciso
- preserve a cadência do autor
- não dependa de hashtags ou linguagem para manipular o feed

## Ordem de Publicação

Padrão:
1. publique primeiro a versão nativa mais forte
2. adapte para as plataformas secundárias
3. escalone o timing apenas se o usuário quiser ajuda com a sequência

Não adicione referências entre plataformas a menos que sejam úteis. Na maioria das vezes, o post deve se sustentar sozinho.

## Padrões Proibidos

Apague e reescreva qualquer um destes:
- "Animado para compartilhar"
- "Aqui está o que aprendi"
- "O que você acha?"
- "link na bio", a menos que isso seja literalmente verdade
- parágrafos genéricos de "lição profissional" que não estavam na fonte

## Formato de Saída

Retorne:
- a versão da plataforma primária
- variantes adaptadas para cada plataforma solicitada
- uma nota curta sobre o que mudou e por quê
- qualquer restrição de publicação que o usuário ainda precise resolver

## Portão de Qualidade

Antes de entregar:
- cada versão se lê como o mesmo autor sob restrições diferentes
- nenhuma versão de plataforma parece enchida ou higienizada
- nenhuma cópia é duplicada literalmente entre plataformas
- qualquer contexto extra adicionado para uso no LinkedIn ou newsletter é realmente necessário

## Skills Relacionadas

- `brand-voice` para captura reutilizável de voz derivada da fonte
- `content-engine` para captura de voz e modelagem da fonte
- `x-api` para fluxos de trabalho de publicação no X
