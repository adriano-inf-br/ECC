# Playbook de Respostas a Discussões

Este playbook transforma as Discussões do GitHub na mesma fila de operação que PRs,
issues, trabalho no Linear e evidências de release. É um guia do operador, não uma
promessa de que todo thread informativo precisa de uma resposta pública.

## Loop de Auditoria

Execute estas verificações antes de um release, após um lote significativo de merges e
quando o ITO-59 do Linear for atualizado:

```bash
npm run discussion:audit -- --json
node scripts/platform-audit.js --json
```

A fila está atualizada somente quando:

- os erros de busca de discussões estão explicados ou corrigidos;
- `needsMaintainerTouch` é zero para categorias de discussão semelhantes a suporte;
- discussões de Q&A respondíveis têm uma resposta aceita ou uma nota de roteamento clara; e
- qualquer thread com escopo de produto está vinculado a uma issue do GitHub, issue do Linear,
  linha do roadmap ou adiamento explícito.

Threads informativos, como anúncios, referências, show-and-tell ou atualizações de autoria do
mantenedor, podem permanecer visíveis sem se tornarem dívida de resposta.

## Categorias

| Categoria | Rota | Leitura de retorno obrigatória |
| --- | --- | --- |
| Suporte ao produto ou confusão na instalação | Responder com o caminho exato do comando/documento; marcar resposta aceita para Q&A quando a correção estiver completa | URL da discussão mais URL da resposta aceita quando aplicável |
| Relatório de bug | Solicitar uma reprodução mínima, versão, harness e logs; criar ou vincular uma issue do GitHub quando reproduzível | URL da issue ou motivo do adiamento |
| Solicitação de recurso | Reconhecer o resultado desejado e vincular a issue de roadmap mais próxima; não implicar compromisso a menos que esteja no escopo | Link do roadmap Linear/GitHub |
| Preocupação de segurança | Mover detalhes de exploração e segredos para um canal privado; manter a resposta pública curta e não operacional | Nota de escalonamento privado mais resposta pública de segurança |
| Pergunta sobre release ou cobrança | Responder a partir do registro de URL de release e dos gates de prontidão de publicação; não alegar URLs não publicadas, prontidão de cobrança ou disponibilidade de plugin | Artefato de evidência ou link de bloqueador |
| Show-and-tell, referência ou anúncio | Deixar como informativo, a menos que haja uma pergunta direta ou um sinal de escopo de produto | Link de roadmap opcional se útil |
| Thread desatualizado ou concluído | Resumir o estado atual e vincular o documento/issue durável; evitar reviver threads de baixo sinal | Nota de encerramento ou justificativa explícita de sem ação |

## Templates

### Suporte Público

Obrigado pelo relatório. O caminho suportado atualmente é:

```bash
<comando>
```

O documento relevante é `<caminho do documento ou URL>`. Se isso não corresponder à sua
configuração, por favor responda com o harness, SO, gerenciador de pacotes e o texto exato
do erro.

### Coordenação do Mantenedor

Estou roteando isso para `<issue ou chave Linear>` para que não se perca na fila de
discussões. A próxima decisão é `<decisão específica>`. Até que isso seja resolvido,
a solução alternativa suportada é `<solução alternativa ou "nenhuma">`.

### Desatualizado ou Concluído

Este thread parece resolvido ou substituído por `<documento/issue/release>`. Estou
deixando-o visível para histórico, mas ele não é mais um item ativo da fila de suporte.
Novos detalhes de reprodução devem ir para `<caminho de issue/discussão>`.

### Anúncio de Release

O status atual do release é `<estado rc/beta/GA>`. As URLs ao vivo estão registradas em
`docs/releases/2.0.0-rc.1/release-url-ledger-2026-05-18.md`. Qualquer coisa marcada como
pendente ali não deve ser anunciada como entregue ainda.

### Escalonamento de Segurança

Obrigado por sinalizar isso. Por favor, não publique etapas de exploração, tokens, dados de
clientes ou valores secretos no thread público. Estou roteando isso pelo caminho de resposta
de segurança e manterrei o thread público limitado a atualizações de status seguras.

## Registro de Resultados

Para cada discussão de alto sinal, registre um destes resultados:

- respondido publicamente e resposta aceita lida de volta;
- vinculado a uma issue do GitHub ou issue do Linear;
- roteado para o caminho de resposta de segurança;
- classificado como informativo; ou
- explicitamente adiado com um motivo.

Espelhe o resumo no ITO-59 quando o lote for encerrado e inclua as contagens no
próximo painel do operador ou atualização de evidências de publicação.
