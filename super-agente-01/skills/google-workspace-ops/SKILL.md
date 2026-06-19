---
name: google-workspace-ops
description: Opere em Google Drive, Docs, Sheets e Slides como uma única superfície de fluxo de trabalho para planos, rastreadores, decks e documentos compartilhados. Use quando o usuário precisar encontrar, resumir, editar, migrar ou organizar ativos do Google Workspace sem recorrer a chamadas brutas de ferramentas.
metadata:
  origin: ECC
---

# Google Workspace Ops

Esta skill é para operar documentos compartilhados, planilhas e decks como sistemas funcionais, não apenas editando um arquivo de forma isolada.

## Quando Usar

- Usuário precisa encontrar um documento, planilha ou deck e atualizá-lo in loco
- Consolidar planos, rastreadores, notas ou listas de clientes armazenados no Google Drive
- Limpar ou reestruturar uma planilha compartilhada
- Importar, reparar ou reformatar um deck do Google Slides
- Produzir resumos de Docs, Sheets ou Slides para tomada de decisão

## Superfície de Ferramentas Preferida

Use o Google Drive como ponto de entrada, depois mude para o especialista adequado:

- Google Docs para documentos com muito texto
- Google Sheets para trabalho tabular, fórmulas e gráficos
- Google Slides para decks, importações, migração de templates e limpeza

Não adivinhe a estrutura apenas pelos nomes dos arquivos. Inspecione primeiro.

## Fluxo de Trabalho

### 1. Encontrar o ativo

Comece com a superfície de busca do Drive para localizar:

- o arquivo exato
- ativos irmãos
- prováveis duplicatas
- versões modificadas recentemente

Se vários documentos parecerem similares, confirme por título, proprietário, horário de modificação ou pasta.

### 2. Inspecionar antes de editar

Antes de fazer mudanças:

- resuma a estrutura atual
- identifique abas, títulos ou contagem de slides
- detecte se a tarefa é uma limpeza local ou uma cirurgia estrutural

Escolha a menor ferramenta que possa realizar o trabalho com segurança.

### 3. Editar com precisão

- Para Docs: use edições com consciência de índice, não reescritas vagas
- Para Sheets: opere em abas e intervalos explícitos
- Para Slides: distingua edições de conteúdo de limpeza visual ou migração de template

Se o trabalho solicitado for sensível ao visual ou ao layout, itere com inspeção e verificação em vez de uma grande atualização cega.

### 4. Manter o sistema de trabalho limpo

Quando o arquivo faz parte de um fluxo de trabalho maior, também apresente:

- rastreadores duplicados
- decks desatualizados
- documentos obsoletos vs. documentos canônicos
- se o ativo deve ser arquivado, mesclado ou renomeado

## Formato de Saída

Use:

```text
ATIVO
- nome do arquivo
- tipo
- por que este é o arquivo correto

ESTADO ATUAL
- resumo da estrutura
- principais problemas ou bloqueadores

AÇÃO
- edições feitas ou recomendadas

PRÓXIMOS PASSOS
- arquivar / mesclar / limpeza de duplicatas / próximo arquivo a atualizar
```

## Casos de Uso Adequados

- "Encontre o documento de planejamento ativo e condense-o"
- "Limpe esta planilha de clientes e mostre-me as linhas de risco de churn"
- "Importe este deck para o Slides e torne-o apresentável"
- "Encontre o rastreador atual, não a duplicata obsoleta"
