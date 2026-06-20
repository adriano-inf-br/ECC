---
name: email-ops
description: Fluxo de trabalho do ECC, baseado em evidências, para triagem de caixa de correio, redação, verificação de envio e follow-up seguro de mensagens enviadas. Use quando o usuário quiser organizar e-mail, redigir ou enviar pela superfície de correio real, ou comprovar o que chegou em Enviados.
metadata:
  origin: ECC
---

# Email Ops

Use isto quando a tarefa real for trabalho de caixa de correio: triagem, redação, resposta, envio ou comprovação de que uma mensagem chegou em Enviados.

Esta não é uma skill genérica de escrita. É um fluxo de trabalho de operador em torno da superfície de correio real.

## Skill Stack

Traga estas skills nativas do ECC para o fluxo de trabalho quando relevante:

- `brand-voice` antes de redigir qualquer coisa voltada ao usuário
- `investor-outreach` para correio voltado a investidores, parceiros ou patrocinadores
- `customer-billing-ops` quando a thread for um incidente de cobrança/suporte em vez de correspondência genérica
- `knowledge-ops` quando a mensagem ou thread deve ser capturada em contexto durável depois
- `research-ops` quando uma resposta depende de fatos externos recentes

## Quando Usar

- usuário pede para triar a caixa de entrada ou arquivar correio de baixo sinal
- usuário quer um rascunho, resposta ou novo e-mail de saída
- usuário quer saber se um e-mail já foi enviado
- o usuário quer prova de qual conta, thread ou entrada de Enviados foi usada

## Guardrails

- redija primeiro, a menos que o usuário tenha pedido claramente um envio ao vivo
- nunca afirme que uma mensagem foi enviada sem uma confirmação real da pasta Enviados ou do lado do cliente
- não troque de conta remetente casualmente; escolha a conta que combina com o projeto e o destinatário
- não exclua correio comercial incerto durante a limpeza
- se a tarefa for realmente trabalho de DM ou iMessage, repasse para `messages-ops`

## Fluxo de Trabalho

### 1. Resolva a superfície exata

Antes de agir, defina:

- qual conta de caixa de correio
- qual thread ou destinatário
- se a tarefa é triagem, rascunho, resposta ou envio
- se o usuário quer apenas rascunho ou envio ao vivo

### 2. Leia a thread antes de compor

Se for responder:

- leia a thread existente
- identifique o último contato de saída
- identifique quaisquer compromissos, prazos ou perguntas não respondidas

Se for criar uma nova saída:

- identifique o nível de proximidade (warmth)
- selecione o canal e a conta remetente corretos
- traga `brand-voice` antes de redigir

### 3. Redija, depois verifique

Para trabalho apenas de rascunho:

- produza o texto final
- declare remetente, destinatário, assunto e propósito

Para trabalho de envio ao vivo:

- verifique primeiro o corpo final exato
- envie pela superfície de correio escolhida
- confirme que a mensagem chegou em Enviados ou no armazenamento equivalente de cópia de enviados

### 4. Reporte o estado exato

Use palavras de status exatas:

- drafted
- approval-pending
- sent
- blocked
- awaiting verification

Se a superfície de envio estiver bloqueada, preserve o rascunho e reporte o bloqueador exato em vez de improvisar um segundo transporte sem dizê-lo.

## Formato de Saída

```text
MAIL SURFACE
- account
- thread / recipient
- requested action

DRAFT
- subject
- body

STATUS
- drafted / sent / blocked
- proof of Sent when applicable

NEXT STEP
- send
- follow up
- archive / move
```

## Armadilhas

- não afirme sucesso de envio sem uma verificação de cópia de enviados
- não ignore o histórico da thread e escreva uma resposta sem contexto
- não misture trabalho de caixa de correio com fluxos de DM ou mensagem de texto
- não exponha segredos, detalhes de auth ou metadados de mensagem desnecessários

## Verificação

- a resposta nomeia a conta e a thread ou o destinatário
- qualquer afirmação de envio inclui prova de Enviados ou uma confirmação explícita do lado do cliente
- o estado final é um de drafted / sent / blocked / awaiting verification
