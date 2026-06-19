# Inventário de Artefatos Legados

Este inventário evita que a limpeza de artefatos legados e trabalhos obsoletos se torne implícita. Cada
artefato deve ser classificado como entregue, rastreado por milestone, branch de salvamento ou
arquivo/sem ação antes que o trabalho de lançamento trate a fila como limpa.

## Estados de Classificação

| Estado | Significado |
| --- | --- |
| Entregue | O trabalho útil já foi portado para o `main` atual e verificado. |
| Rastreado por milestone | O trabalho útil permanece, mas pertence a um milestone nomeado do roadmap. |
| Branch de salvamento | O trabalho útil deve ser portado através de um novo branch de mantenedor com atribuição. |
| Revisão por tradutor/manual | O conteúdo pode ser útil, mas não pode ser importado automaticamente com segurança. |
| Arquivo/sem ação | O artefato é intencionalmente retido ou ignorado; nenhum porte ativo está planejado. |

## Varredura Atual do Repositório

Em 2026-05-12, o repositório rastreado não possui diretórios `_legacy-documents-*`.

Verificação atualizada:

```sh
find . -type d -name '_legacy-documents-*' -print
```

Resultado esperado: sem saída.

O único diretório legado rastreado encontrado atualmente pela varredura de nome de arquivo é
`legacy-command-shims/`.

O workspace ECC umbrella também contém repositórios git legados irmãos fora
deste checkout rastreado. Eles são inventariados intencionalmente de forma separada porque
podem conter contexto bruto de operador, configurações locais, rascunhos privados ou
arquivos não rastreados que não devem ser copiados para o repositório público como um todo.

Verificação atualizada no nível do workspace a partir do diretório umbrella do ECC:

```sh
find .. -maxdepth 1 -type d -name '_legacy-documents-*' -print | sort
```

Resultado esperado:

```text
../_legacy-documents-ecc-context-2026-04-30
../_legacy-documents-ecc-everything-claude-code-2026-04-30
```

## Inventário

| Artefato | Estado | Evidência | Ação |
| --- | --- | --- | --- |
| Diretórios `_legacy-documents-*` | Arquivo/sem ação | Nenhum diretório correspondente existe no checkout rastreado em 2026-05-12. | Execute novamente a varredura antes do lançamento. Se algum aparecer, adicione cada diretório a esta tabela antes de publicar. |
| `legacy-command-shims/` | Arquivo/sem ação | O `legacy-command-shims/README.md` afirma que esses shims de nome abreviado aposentados são opcionais e não são mais carregados pela superfície de command padrão do plugin. | Manter como um arquivo de compatibilidade explícito. Não mova estes de volta para a superfície padrão do plugin sem uma decisão de migração. |
| Ledger de salvamento de PRs fechadas-obsoletas | Entregue | `docs/stale-pr-salvage-ledger.md` registra trabalho obsoleto útil recuperado através de PRs de mantenedores. | Continuar usando o padrão de ledger para futuros fechamentos de obsoletos. |
| Cauda de localização zh-CN do #1687 | Revisão por tradutor/manual | Grandes subconjuntos seguros pousaram em #1746-#1752; as peças restantes estão vinculadas ao Linear ITO-55 para revisão do responsável pelo idioma. | Não faça cherry-pick cegamente. Divida por documentação, commands, agents e skills se uma rota de revisão por tradutor abrir; nenhuma importação automática permanece bloqueando o lançamento. |
| Tradução do README em Persa do #1609 | Revisão por tradutor/manual | Registrado no ledger de salvamento de obsoletos e vinculado ao Linear ITO-55 para revisão do responsável pelo idioma. | Não importe texto obsoleto de README/versão/contagem sem um revisor de Persa e uma atualização atual do catálogo. |
| Sincronização do README zh-TW do #1563 | Revisão por tradutor/manual | Registrado no ledger de salvamento de obsoletos e vinculado ao Linear ITO-55 para revisão do responsável pelo idioma. | Não importe texto obsoleto de README/versão/contagem sem um revisor de zh-TW e uma atualização atual do catálogo. |
| Sincronização do README em Turco do #1564 | Revisão por tradutor/manual | Registrado no ledger de salvamento de obsoletos e vinculado ao Linear ITO-55 para revisão do responsável pelo idioma. | Não importe texto obsoleto de README/versão/contagem sem um revisor de Turco e uma atualização atual do catálogo. |
| Sincronização do README pt-BR do #1565 | Revisão por tradutor/manual | Registrado no ledger de salvamento de obsoletos e vinculado ao Linear ITO-55 para revisão do responsável pelo idioma. | Não importe texto obsoleto de README/versão/contagem sem um revisor de pt-BR e uma atualização atual do catálogo. |

## Repositórios Legados no Nível do Workspace

Esses repositórios irmãos residem fora do checkout rastreado de `everything-claude-code`.
Eles são material de origem para futuras passagens de salvamento, não ativos de lançamento instaláveis.

| Artefato | Estado | Evidência | Ação |
| --- | --- | --- | --- |
| `../_legacy-documents-ecc-everything-claude-code-2026-04-30` | Arquivo/sem ação | Checkout legado separado em `fix/configure-ecc-skill-copy-paths-1483` em `b78ddbd0`; conceitos úteis de configure-ecc e caminho de instalação foram substituídos pela documentação e testes de instalação atuais. O checkout também possui exemplos de project-guidelines localizados não rastreados e um `skills/social-graph-ranker/SKILL 2.md` duplicado do Finder. | Não importe como um todo. Se regressões de raiz de cópia do configure-ecc reaparecerem, use este branch apenas como arqueologia atribuída à fonte e porte através de um novo branch de mantenedor. Deixe duplicatas do Finder fora do controle de versão. |
| `../_legacy-documents-ecc-context-2026-04-30` | Rastreado por milestone | O repositório `ECC-context` arquivado está quatro commits à frente de sua origem e contém material de contexto, gameplan, conhecimento, marketing, AgentShield e planejamento de ECC Tools. Também contém superfícies locais/privadas como `.env` e configurações locais. | Manter como fonte de extração sanitizada para trabalho de roadmap, lançamento, AgentShield e ECC Tools. Nunca copie contexto bruto, segredos, caminhos pessoais, configurações privadas ou rascunhos não publicados para este repositório. Porte apenas conteúdo focado e seguro para publicação, com atribuição. |

## Regras de Importação de Legado do Workspace

Ao minerar repositórios legados no nível do workspace:

1. Não leia, imprima, prepare para commit ou copie arquivos `.env`, tokens, segredos OAuth,
   configurações locais, caminhos pessoais ou contexto privado de operador.
2. Não importe rascunhos brutos de marketing, gameplans ou dumps de chat/contexto.
3. Extraia apenas ideias focadas e seguras para publicação para documentação ou código atuais.
4. Atribua o repositório legado de origem, branch, commit ou PR obsoleta no novo PR.
5. Valide o resultado com os mesmos testes e verificações de lançamento que o trabalho nativo.

## Conteúdo dos Shims de Command Legados

O arquivo de compatibilidade contém atualmente 12 shims de command aposentados:

| Shim | Direção atual preferida |
| --- | --- |
| `agent-sort.md` | Use command mantido ou roteamento de skill onde disponível. |
| `claw.md` | Use as superfícies mantidas `scripts/claw.js` / `npm run claw`. |
| `context-budget.md` | Use skills mantidas de orçamento de token/contexto. |
| `devfleet.md` | Use documentação e skills mantidas de orquestração de agent/harness. |
| `docs.md` | Use fluxos de trabalho atuais de documentação e lista de verificação de lançamento. |
| `e2e.md` | Use skills mantidas de teste E2E e scripts de teste. |
| `eval.md` | Use skills de eval-harness e verification-loop. |
| `orchestrate.md` | Use scripts mantidos de status de orquestração e worktree. |
| `prompt-optimize.md` | Use a skill prompt-optimizer. |
| `rules-distill.md` | Use fluxos de trabalho atuais de extração de rules e skills. |
| `tdd.md` | Use tdd-workflow e skills de teste específicas de linguagem. |
| `verify.md` | Use skills de verification-loop e verificação específica de pacote. |

## Regra de Lançamento

Antes de qualquer passagem de publicação GA ou rc:

1. Execute novamente a varredura de `_legacy-documents-*`.
2. Execute novamente a verificação do ledger de salvamento de obsoletos fechados.
3. Confirme que cada artefato legado recém-descoberto está representado neste arquivo.
4. Porte trabalho útil através de novos PRs de mantenedores com atribuição de origem.
5. Deixe artefatos de arquivo/sem ação fora da instalação padrão e do carregamento de plugins.
