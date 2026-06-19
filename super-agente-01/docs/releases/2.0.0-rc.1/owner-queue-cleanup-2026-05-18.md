# Limpeza da Fila do Proprietário - 2026-05-18

Esta nota registra a limpeza ao vivo da fila do GitHub fora dos cinco repositórios de release do ECC
rastreados por `scripts/platform-audit.js`.

## Comandos

```bash
gh search prs --owner affaan-m --state open --json repository,number,title,url,author,updatedAt --limit 100
gh search issues --owner affaan-m --state open --json repository,number,title,url,updatedAt --limit 100
```

## Resultado

- PRs abertos em todo o proprietário após limpeza: 0.
- Issues abertas em todo o proprietário após limpeza: 0.
- PRs desatualizados de bot de dependência fechados: 24.
- Issues desatualizadas de roadmap de pagamentos legados/0EM fechadas: 72.
- PRs finais desatualizados/gerados/de revisão manual fechados: 9.
- Issues finais legadas/de alcance/placeholder fechadas: 5.
- Repositórios arquivados temporariamente desarquivados para fechamento de PRs de dependência desatualizados e
  restaurados ao estado arquivado:
  `affaan-m/stoictradingAI`, `affaan-m/dprc-autotrader-v2`,
  `affaan-m/polycule-secure` e `affaan-m/pragmAItism_defAInce`.
- A varredura final de repositórios arquivados desarquivou temporariamente e restaurou
  `affaan-m/dprc-autotrader-v2` e `affaan-m/stoictradingAI`.

## Disposição Final dos PRs

- `affaan-m/dprc-autotrader-v2#5`: fechado bundle ECC gerado desatualizado com
  verificações com falha e base de atualização de dependência.
- `affaan-m/x-algorithm-score#2`: fechado PR de recurso externo desatualizado/conflitante com diretórios de ferramentas de IA locais acidentais anotados no corpo do PR.
- `affaan-m/dexploy#28`: fechado PR de skill ECC gerado desatualizado com
  alterações solicitadas.
- `affaan-m/zenith#5`: fechado PR de skill ECC gerado desatualizado.
- `affaan-m/zenith#4`: fechado PR de teste/ruído cujo diff apenas adicionou um
  comentário de script não acionável.
- `affaan-m/affaan-m#1`: fechado PR de cartão README de terceiros desatualizado/conflitante.
- `affaan-m/affaanmustafa.com#1`: fechado PR de nome do Cloudflare Worker desatualizado com
  alterações solicitadas.
- `affaan-m/0em-payments-dashboard#11`: fechado PR de nome do Cloudflare Worker desatualizado/conflitante.
- `affaan-m/0em-payments-dashboard#3`: fechado PR de nome do Cloudflare Worker desatualizado/conflitante.

## Disposição Final das Issues

- `affaan-m/dprc-autotrader-v2#3`: fechada proposta de integração pública como não
  planejada para o repositório arquivado.
- `affaan-m/stoictradingAI#20`: fechada pergunta de alcance público como não planejada
  para o repositório arquivado.
- `affaan-m/dexploy#27`: fechada issue interna de teste de criador de skill desatualizada.
- `affaan-m/dexploy#25`: preservadas descobertas úteis de deployment/localStorage e
  Cloudflare no Linear `ITO-62`, então a issue do GitHub desatualizada foi fechada.
- `affaan-m/telegram-mcp-ts#1`: fechada issue placeholder vazia desatualizada.

## Disposição

Os PRs de dependência fechados eram bumps de versão gerados desatualizados e devem ser
regenerados a partir das bases atuais se ainda forem necessários. Os PRs de bundle ECC gerados fechados
devem ser regenerados a partir do fluxo atual das ECC Tools se esses repositórios
ficarem ativos novamente. As issues legadas de pagamentos/0EM fechadas eram itens de planejamento antigos
substituídos pelas lanes de pagamentos nativos, análise hospedada,
readback de faturamento e roadmap do Linear/projeto das ECC Tools.
