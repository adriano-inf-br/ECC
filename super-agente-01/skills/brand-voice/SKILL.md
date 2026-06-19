---
name: brand-voice
description: Construa um perfil de estilo de escrita derivado de fontes a partir de posts reais, ensaios, notas de lançamento, docs ou texto de site, e então reutilize esse perfil em fluxos de trabalho de conteúdo, prospecção e redes sociais. Use quando o usuário quiser consistência de voz sem clichês genéricos de escrita de IA.
metadata:
  origin: ECC
---

# Brand Voice

Construa um perfil de voz durável a partir de material de fonte real e então use esse perfil em todo lugar, em vez de re-derivar o estilo do zero ou recorrer a texto de IA genérico.

## Quando Ativar

- o usuário quer conteúdo ou prospecção em uma voz específica
- escrevendo para X, LinkedIn, e-mail, posts de lançamento, threads ou atualizações de produto
- adaptando o tom de um autor conhecido entre canais
- a trilha de conteúdo existente precisa de um sistema de estilo reutilizável em vez de imitação pontual

## Prioridade de Fontes

Use o conjunto de fontes reais mais forte disponível, nesta ordem:

1. posts e threads originais recentes no X
2. artigos, ensaios, memorandos, notas de lançamento ou newsletters
3. e-mails ou DMs de prospecção reais que funcionaram
4. docs de produto, changelogs, enquadramento de README e texto de site

Não use exemplares genéricos de plataforma como material de fonte.

## Fluxo de trabalho de Coleta

1. Reúna de 5 a 20 amostras representativas quando disponíveis.
2. Prefira material recente a material antigo, a menos que o usuário diga que a escrita mais antiga é mais canônica.
3. Separe a "voz pública de lançamento" da "voz privada de trabalho" se o conjunto de fontes claramente se dividir.
4. Se houver acesso ao vivo ao X, use `x-api` para puxar posts originais recentes antes de redigir.
5. Se o texto do site importar, inclua a landing page atual da ECC e o enquadramento do repo/plugin.

## O Que Extrair

- ritmo e comprimento das frases
- compressão vs. explicação
- normas de capitalização
- uso de parênteses
- frequência e propósito de perguntas
- com que nitidez as afirmações são feitas
- com que frequência números, mecanismos ou comprovações aparecem
- como funcionam as transições
- o que o autor nunca faz

## Contrato de Saída

Produza um bloco reutilizável `VOICE PROFILE` que as skills subsequentes possam consumir diretamente. Use o esquema em [references/voice-profile-schema.md](references/voice-profile-schema.md).

Mantenha o perfil estruturado e curto o suficiente para reutilizar no contexto da sessão. O ponto não é crítica literária. O ponto é a reutilização operacional.

## Padrões da Affaan / ECC

Se o usuário quiser a voz da Affaan / ECC e as fontes ao vivo estiverem escassas, comece por aqui, a menos que material de fonte mais novo o substitua:

- direto, comprimido, concreto
- especificidades, mecanismos, comprovações e números vencem adjetivos
- parênteses servem para qualificação, restrição ou superesclarecimento
- a capitalização é convencional, a menos que haja um motivo real para quebrá-la
- perguntas são raras e não devem ser usadas como isca
- o tom pode ser afiado, direto, cético ou seco
- as transições devem parecer merecidas, não suavizadas

## Banimentos Rígidos

Apague e reescreva qualquer um destes:

- ganchos de curiosidade falsa
- "não X, apenas Y"
- "no fluff"
- minúsculas forçadas
- cadência de thought leader do LinkedIn
- perguntas-isca
- "Animado para compartilhar"
- enchimento genérico de jornada de fundador
- parênteses bregas

## Regras de Persistência

- Reutilize o último `VOICE PROFILE` confirmado em tarefas relacionadas na mesma sessão.
- Se o usuário pedir um artefato durável, salve o perfil no local de workspace solicitado ou na superfície de memória.
- Não crie arquivos rastreados pelo repo que armazenem impressões digitais de voz pessoal, a menos que o usuário peça isso explicitamente.

## Uso Subsequente

Use esta skill antes ou dentro de:

- `content-engine`
- `crosspost`
- `lead-intelligence`
- escrita de artigo ou lançamento
- prospecção fria ou morna no X, LinkedIn e e-mail

Se outra skill já tiver uma seção parcial de captura de voz, esta skill é a fonte canônica de verdade.
