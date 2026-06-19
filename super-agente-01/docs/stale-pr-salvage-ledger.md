# Registro de Salvamento de PRs Desatualizados

Este registro documenta trabalho útil recuperado de PRs desatualizados, com conflitos ou fechados.
A regra é simples: a limpeza da fila fecha PRs desatualizados, mas não descarta
trabalho útil. Os mantenedores devem inspecionar o diff fechado, portar partes compatíveis
em branches novos e creditar o PR de origem.

## Estados de Classificação

| Estado | Significado |
| --- | --- |
| Salvado | Trabalho útil foi portado para o `main` atual através de um PR do mantenedor. |
| Já presente | O `main` atual já continha o trabalho útil antes do salvamento. |
| Substituído | O `main` atual resolveu o mesmo problema de forma diferente. |
| Ignorado | O PR era acidental, muito amplo, inseguro ou de sinal muito baixo para portar. |
| Revisão por tradutor/manual | O conteúdo pode ser útil, mas precisa de revisão humana de idioma/domínio antes da importação. |

## Salvados no Main Atual

| PR de Origem | Contribuição original | Resultado do salvamento |
| --- | --- | --- |
| #1232 | Fluxo de trabalho de pesquisa antes de criar `skill-scout` | Salvado na passagem de mantenedor de cost/skill-scout de 12 de maio com wording atual do repositório, vetting de fonte externa e sem edições desatualizadas de contagem de catálogo. |
| #1304 | Skill de rastreamento de custo e comando `/cost-report` | Salvado na passagem de mantenedor de cost/skill-scout de 12 de maio com convenções atuais de comando/skill e sem precificação de modelo hard-coded desatualizada. |
| #1309 | Material de projeto de negociação/comunidade | Salvado em #1761 como uma listagem de README de projeto comunitário neutro. |
| #1310 | Revisor Django, resolver de build e orientação de tarefas async Celery | Salvado na passagem de mantenedor Django/Celery de 12 de maio com contagens de catálogo atuais e limpeza menor de exemplos. |
| #1322 | Tradução de README para vietnamita | Salvado em #1764 como `docs/vi-VN/README.md` mais atualizações de seletor. |
| #1325 | Orientação de framework Quarkus, agents Java e material de localização | Salvado em #1771 e #1803; edições amplas desatualizadas de documentação/contagem não foram copiadas. |
| #1326 | Skill e rules para desenvolvedor Angular | Salvado em #1763 com skill atual, rules, fiação de instalação e atualizações de catálogo. |
| #1328 | Correção de stdout UTF-8 no Windows para aprendizado contínuo | Salvado em #1761. |
| #1329 | Hardening de detecção de instalação de plugin | Salvado em #1761 através do suporte atual de detecção de auditoria de harness. |
| #1334 | Skill E2E de desktop Windows | Salvado em #1762 com fiação de instalação, pacote e catálogo. |
| #1352 | Alvo de instalação Qwen | Salvado em #1738 através do alvo de instalação Qwen atual. |
| #1413 | Skills/agents de rede e homelab | Salvado através de #1729, #1731, #1745 e #1778. |
| #1414 | Rules F#, agent revisor e skill de teste | Salvado em #1770 com manifestos de instalação atuais, testes de detecção e fiação de catálogo. |
| #1429 | Alvo de instalação JoyCode | Salvado em #1737 através do alvo de instalação JoyCode atual. |
| #1467 | Skills científicas e trabalho de descoberta OpenCode | Partes úteis de USPTO e gget salvadas em #1740; alegações geradas desatualizadas não foram copiadas. |
| #1478 | Rules HarmonyOS/ArkTS, agent resolver e exemplo CLAUDE | Salvado em #1769 com fiação de instalação atual; edições de sessão/TUI de `ecc2` desatualizadas não foram carregadas. |
| #1493 | Escopo de contexto SessionStart | Salvado em #1774 com semântica de hook atual e testes. |
| #1498 | Fluxo de planejamento PRD | Salvado em #1777. |
| #1504 | Hooks de statusline/monitor de contexto | Salvado em #1776 com estrutura de manifesto de hook atual e testes. |
| #1528/#1529/#1547 | Suporte a provedor Astraflow e UModelVerse | Salvado em #1775 com fiação de provedor atual e análise defensiva de chamada de ferramenta. |
| #1558 | Skill `agentic-os` | Salvado em #1772. |
| #1559 | Skill `error-handling` | Salvado em #1772. |
| #1566 | Skill de auditoria de arquitetura de agent | Salvado em #1772. |
| #1578 | Hardening de file-probe do OpenCode | Salvado em #1773. |
| #1603 | Skill `plan-orchestrate` | Salvado em #1766 com fiação atual de manifesto/catálogo. |
| #1658 | Supressão de falso-positivo do code-reviewer | Salvado na passagem de mantenedor de code-reviewer de 12 de maio com wording atual do agent de revisão, um gate de prova para achados HIGH/CRITICAL, exclusões comuns de falso-positivo e um teste de regressão. |
| #1659 | Direção de design frontend e skills de polimento de interface | Salvado na passagem de mantenedor de frontend-design de 12 de maio com layout canônico de `skills/` e orientação atual de frontend do ECC, preservando o guardrail do repositório de que a skill oficial `frontend-design` deve ser instalada a partir de `anthropics/skills`. |
| #1674 | Skill de auditoria de produção | Salvado em #1732 após revisão e reescrita de cadeia de suprimentos/privacidade. |
| #1687 | Sincronização de localização zh-CN | Subconjuntos seguros amplos salvados em #1746-#1752; partes restantes requerem revisão por tradutor/manual. |
| #1694 | Curadoria de portfólio | Atualizações de curadoria focadas e úteis salvadas em #1723 e #1724. |
| #1695 | Tradução de README para russo | Portado em #1722. |
| #1697 | Configuração de seletor LLM salva | Salvado como parte do trabalho de configuração de provedor/esquema de ferramenta em #1720. |
| #1699 | Proteção de caminho de post-edit-format no Windows | Portado em #1719. |
| #1700 | Serialização de ferramenta de provedor | Portado em #1720. |
| #1705/#1780 | Sistema de motion de UI de produção | Salvado em #1772, #1781 e #1782 com exemplos corrigidos antes do merge. |
| #1713 | Suporte a linguagem Swift | Portado em #1721. |
| #1715 | Hardening do validador de caminho pessoal de CI | Portado através do hardening do validador de CI em #1717. |
| #1727 | Skill de padrões MySQL | Salvado em #1733. |
| #1757 | Fluxo de trabalho de engenharia de machine learning | Salvado em #1758 e ajustado em #1759. |

## Passagem de Lacunas de 2026-05-12

O registro inicial de fechamento de desatualizados cobriu o cohort de limpeza P0 e os maiores
branches de salvamento. Uma passagem de lacunas de acompanhamento sobre PRs fechados em 2026-05-11 encontrou
itens adicionais úteis que já estavam presentes no `main` ou ainda valiam portar.

| PR de Origem | Disposição |
| --- | --- |
| #1310 | Portado através do branch Django/Celery do mantenedor após confirmar que `agents/django-reviewer.md`, `agents/django-build-resolver.md` e `skills/django-celery/SKILL.md` ainda estavam ausentes. |
| #1325 | Material de framework Quarkus útil já foi preservado em #1771 e #1803; o `main` atual contém as rules/skills do Quarkus mais as superfícies de revisor/build-resolver Java. |
| #1360 | Já presente como `skills/security-bounty-hunter/`. |
| #1414 | Suporte F# útil já foi preservado em #1770; o `main` atual contém as rules F#, o agent revisor, a skill de teste, a fiação de instalação e os testes de detecção. |
| #1415 | Já presente como `skills/vite-patterns/`. |
| #1478 | Suporte HarmonyOS/ArkTS útil já foi preservado em #1769; o `main` atual contém as rules ArkTS, o agent resolver, o exemplo CLAUDE e a fiação de instalação. |
| #1438 | Já presente como `skills/ui-to-vue/`. |
| #1504 | Já mapeado para #1776 na tabela de salvamento durável. |
| #1508 | Já presente como `skills/fastapi-patterns/` e `agents/fastapi-reviewer.md`. |
| #1563/#1564/#1565 | Revisão por tradutor/manual: sincronizações de README zh-TW, tr e pt-BR podem conter atualizações de localização úteis, mas texto de README/versão/contagem desatualizado deve ser revisado pelos proprietários do idioma antes da importação. |
| #1567 | Já presente como o bypass do gate de arquivo do subagente GateGuard atual em `scripts/hooks/gateguard-fact-force.js`, com gates Bash preservados e testes de regressão em `tests/hooks/gateguard-fact-force.test.js`. |
| #1570 | Já presente como importações públicas de `llm.prompt`, construção de `PromptBuilder` baseada em palavras-chave e helpers de registro de template; os testes atuais registram o marcador `unit` através de `tests/conftest.py`. |
| #1584 | Já presente como o caminho rápido de notificação nativa de desktop do iTerm2 em `scripts/hooks/desktop-notify.js`, com fallback do multiplexador para `osascript`. |
| #1589 | Já presente como detecção de `actions/checkout` entre aspas em `scripts/ci/validate-workflow-security.js` mais testes de regressão de aspas duplas/simples. |
| #1594 | Já presente como tratamento de alcançabilidade do MCP HTTP que trata respostas de probe HTTP 400, 401 e 403 como alcançáveis/autenticadas, com testes de hook. |
| #1597 | Já presente como validação de contagem de catálogo para README, AGENTS, documentação zh-CN, `.claude-plugin/plugin.json` e `.claude-plugin/marketplace.json`. |
| #1602 | Já presente como a depreciação v1 do `continuous-learning` que encaminha novos usos para `continuous-learning-v2` enquanto preserva a superfície de arquivo v1. |
| #1603 | Trabalho útil de `/plan-orchestrate` já foi preservado em #1766 com metadados atuais de pacote/catálogo. |
| #1604 | Ignorado: o instalador local de arrastar-e-soltar do Windows copia arquivos diretamente e executa `git pull`; o fluxo atual de instalador/perfil gerenciado é mais seguro e o substitui. |
| #1609 | Revisão por tradutor/manual: a tradução do README para persa pode ser útil, mas precisa de revisão de idioma e atualização de catálogo/versão atual antes da importação. |
| #1613 | Já presente em `rules/web/hooks.md` como o exemplo `tsc --incremental` mais PostToolUse com timeout limitado. |
| #1631 | Já presente em `scripts/hooks/suggest-compact.js` e `tests/hooks/hooks.test.js`; o código atual lê `session_id` do stdin JSON antes de cair para `CLAUDE_SESSION_ID`. |
| #1648 | Já presente em `src/llm/providers/claude.py`; o provedor Claude atual coleta todos os blocos de conteúdo de texto e tool-use e cobre o comportamento em `tests/test_claude_provider.py`. |
| #1658 | Portado através do branch do mantenedor de code-reviewer após confirmar que o gate de prova de falso-positivo e a lista de pulos de falso-positivo comuns ainda estavam ausentes. |
| #1693 | Já presente como `skills/redis-patterns/`. |

## Já Presentes ou Substituídos

| PR de Origem | Disposição |
| --- | --- |
| #1306 | Soluções para bugs de hook já existem no `main` como `docs/hook-bug-workarounds.md`. |
| #1318 | O utilitário de adaptação de agent Gemini já estava presente no `main` atual. |
| #1323 | A atualização de configuração de hook já estava presente no `main` atual. |
| #1337 | A atualização de contagem de catálogo foi substituída pela sincronização de contagem de catálogo atual. |
| #1631 | O isolamento de `session_id` stdin do `suggest-compact` já estava presente no `main` atual com testes de hook. |
| #1608 | O tratamento inseguro de abertura de documento/terminal do dashboard já estava presente no `main` atual através de helpers de runtime seguros e abertura de documento vinculada ao projeto. |
| #1678 | O comportamento de fallback `.cmd`/`.bat` do MCP no Windows já estava presente no `main` atual com testes de health-check atuais. |
| #1682/#1701 | Correções estratégicas de caminho de hook compacto foram mergeadas diretamente ou substituídas pelas correções atuais de documentação. |
| JARVIS #4/#5/#6 | PRs obsoletos com falha apenas de dependências; o estado futuro de dependências deve ser regenerado pelo Dependabot. |

## Limpeza de Fila de Proprietário de 2026-05-18

Os repositórios de lançamento do ECC já estavam limpos, mas uma varredura de `gh search` de
propriedade ampla encontrou filas desatualizadas em projetos públicos/privados mais antigos. A limpeza fechou 24
PRs de bot de dependência desatualizados e 72 issues desatualizadas de roadmap legado de pagamentos/0EM,
depois fechou os 9 PRs finais desatualizados/gerados/conflitantes/de teste e 5
issues legadas/de alcance/placeholder. O namespace de proprietário `affaan-m` agora está com 0
PRs abertos e 0 issues abertas por `gh search` ao vivo. As evidências detalhadas de antes/depois e
a disposição final da fila estão registradas em
`docs/releases/2.0.0-rc.1/owner-queue-cleanup-2026-05-18.md`.

| Escopo | Disposição |
| --- | --- |
| PRs do Dependabot em `stoictradingAI`, `Behavioral_RL`, `dprc-autotrader-v2`, `x-algorithm-score`, `polycule-secure` e `pragmAItism_defAInce` | Ignorados como bumps de dependência gerados desatualizados; regenere a partir da base atual se ainda for necessário. |
| Issues legadas em `payments0-api`, `payments0-sdk`, `agent-payments-gateway`, `0EM_Frontend`, `0em-payments-dashboard` e `yield-optimizer` | Substituídas pelos pagamentos nativos do ECC Tools, análise hospedada, leitura de retorno de faturamento e trilhas de roadmap Linear/projeto. |
| Repositórios arquivados tocados para fechamento de PR | `stoictradingAI`, `dprc-autotrader-v2`, `polycule-secure` e `pragmAItism_defAInce` foram restaurados ao estado arquivado após o fechamento do PR desatualizado. |
| Varredura final de PR/issue | Fechou os bundles ECC gerados restantes, PRs de renomeação Cloudflare desatualizados, PR de cartão de README desatualizado, PR de teste/ruído, issues de alcance público e issue de placeholder vazia. Preservou descobertas de `dexploy#25` no Linear `ITO-62` antes do fechamento. |

## Ignorados

| PR de Origem | Motivo |
| --- | --- |
| #1308 | A sincronização zh-CN desatualizada reverteria ou excluiria muita árvore de estado atual; a correção de link seletor concreta já estava presente. |
| #1320 | A remoção do gerenciador de pacotes conflita com a política atual de CI de npm/pnpm/yarn/bun. |
| #1341 | Mudança gerada de sinal muito baixo muito grande sem unidade de salvamento focada e segura. |
| #1416/#1465 | PRs de sincronização de fork acidentais sem contribuição focada. |
| #1475 | A ideia de ponte do Gemini CLI de uma linha estava muito desatualizada e sem especificação suficiente para portar com segurança. |
| #1604 | O instalador Windows de arrastar-e-soltar ignora o instalador gerenciado atual, realiza cópias amplas diretas e executa `git pull` a partir de um script de instalação local. |

## Backlog Restante de Revisão Manual

O backlog plausivamente útil restante é trabalho de tradução/localização que é
inseguro de portar automaticamente sem revisão do proprietário do idioma. Este final está vinculado
ao Linear ITO-55 e não é uma tarefa de salvamento que bloqueia o lançamento; o trabalho de lançamento deve
apenas verificar que o backlog permanece registrado e excluído de importações cegas:

- #1687 cauda de localização zh-CN
- #1609 tradução de README para persa
- #1563 sincronização de README zh-TW
- #1564 sincronização de README para turco
- #1565 sincronização de README pt-BR

Regra de tratamento:

1. Manter esses PRs em revisão por tradutor/manual.
2. Dividir qualquer trabalho futuro por superfície: agents, commands, documentos de nível superior,
   superfícies de lançamento e contagem, depois skills.
3. Não importar documentos de nível superior desatualizados que carregam fatos antigos de versão ou
   contagem de catálogo.
4. Não reabrir PRs antigos a menos que o autor original retorne com um rebase atual;
   o salvamento pelo lado do mantenedor deve acontecer em branches novos com
   atribuição.

## Regra de Limpeza Futura

Para cada lote de limpeza de PR desatualizado/conflitante:

1. Fechar ou comentar no PR com base na política de fila.
2. Adicionar o PR de origem a este registro ou a um registro sucessor com data.
3. Classificar como salvado, já presente, substituído, ignorado ou
   revisão por tradutor/manual.
4. Se útil, portar uma fatia pequena e compatível em um branch novo do mantenedor.
5. Creditar o PR de origem e o autor no corpo do PR do mantenedor.
