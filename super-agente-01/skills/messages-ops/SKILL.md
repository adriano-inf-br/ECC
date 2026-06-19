---
name: messages-ops
description: Fluxo de trabalho de mensagens ao vivo baseado em evidências para o ECC. Use quando o usuário quiser ler textos ou DMs, recuperar um código de uso único recente, inspecionar uma conversa antes de responder ou comprovar qual fonte de mensagem foi de fato verificada.
metadata:
  origin: ECC
---

# Operações de Mensagens

Use quando a tarefa for recuperação de mensagens ao vivo: iMessage, DMs, códigos de uso único recentes ou inspeção de conversas antes de um acompanhamento.

Isso não é trabalho de e-mail. Se a superfície dominante for uma caixa de entrada, use `email-ops`.

## Pilha de Skills

Incorpore estas skills nativas do ECC ao fluxo de trabalho quando relevante:

- `email-ops` quando a tarefa de mensagem for realmente trabalho de caixa de entrada
- `connections-optimizer` quando o thread de DM pertencer a trabalho de rede de saída
- `lead-intelligence` quando a conversa ao vivo precisar informar segmentação ou abordagem por caminho aquecido
- `knowledge-ops` quando o conteúdo do thread precisar ser capturado em contexto durável

## Quando Usar

- O usuário diz "leia minhas mensagens", "verifique os textos", "olhe nos DMs" ou "encontre o código"
- A tarefa depende de um thread ao vivo ou de um código recente entregue em uma superfície de mensagens local
- O usuário quer comprovação de qual fonte ou thread foi inspecionado

## Restrições

- resolva a fonte primeiro:
  - mensagens locais
  - X / DM social
  - outra superfície de mensagem protegida por navegador
- não afirme que um thread foi verificado sem nomear a fonte
- não improvise acesso direto ao banco de dados se existir um helper verificado ou caminho padrão
- se autenticação ou MFA bloquear a superfície, relate o bloqueio exato

## Fluxo de Trabalho

### 1. Resolva o thread exato

Antes de fazer qualquer coisa, defina:

- superfície de mensagem
- remetente / destinatário / serviço
- janela de tempo
- se a tarefa é recuperação, inspeção ou preparação para uma resposta

### 2. Leia antes de rascunhar

Se a tarefa puder se transformar em um acompanhamento de saída:

- leia a última mensagem recebida
- identifique o ponto em aberto
- depois passe para a skill de saída correta se necessário

### 3. Trate códigos como uma tarefa de recuperação focada

Para códigos de uso único:

- pesquise primeiro na janela de mensagem local recente
- restrinja por serviço ou remetente quando possível
- pare assim que o código for encontrado ou a pesquisa focada for esgotada

### 4. Reporte evidências exatas

Retorne:

- fonte utilizada
- thread ou remetente quando possível
- janela de tempo
- status exato:
  - lido
  - código-encontrado
  - bloqueado
  - aguardando rascunho de resposta

## Formato de Saída

```text
FONTE
- superfície de mensagem
- remetente / thread / serviço

RESULTADO
- resumo da mensagem ou código
- janela de tempo

STATUS
- lido / código-encontrado / bloqueado / aguardando rascunho de resposta
```

## Armadilhas

- não confunda trabalho de caixa de entrada com trabalho de DM/texto
- não afirme recuperação sem nomear a fonte
- não perca tempo em pesquisas amplas quando a pergunta é uma busca por código recente
- não continue tentando um caminho de autenticação bloqueado sem expor o bloqueio

## Verificação

- a resposta nomeia a fonte da mensagem
- a resposta inclui um remetente, serviço, thread ou bloqueio claro
- o estado final é explícito e delimitado
