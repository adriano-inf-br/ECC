# Protótipo de RAG Avaliador

O ECC 2.0 precisa de um loop de harness de auto-aperfeiçoamento que possa aprender com o
trabalho real sem modificar cegamente a configuração de Claude, Codex, OpenCode, dmux, Zed
ou terminal do usuário. Este protótipo define o menor conjunto de artefatos somente leitura
para esse loop.

O conjunto de fixtures vive em
[`examples/evaluator-rag-prototype/`](../../examples/evaluator-rag-prototype/).
Ele começou com o salvamento e a limpeza de PRs desatualizados de maio de 2026 porque essa
rota tem entradas reais, trabalho aceito real e trabalho rejeitado real. O corpus agora
também inclui um cenário de prontidão para cobrança/Marketplace, para que o texto de lançamento
não trate evidências de release em execução seca ou intenção de roadmap como estado de cobrança
ativo. Um cenário de diagnóstico de falhas de CI adiciona o fluxo de trabalho de log-first
necessário antes que um agente proponha correções para verificações com falha. Um cenário de
qualidade de configuração de harness mantém recomendações de MCP, plugin, hook, comando, agente
e adaptador vinculadas à matriz de adaptadores antes de mutar a orientação de configuração. Um
cenário de exceção de política do AgentShield bloqueia exceções de segurança em
evidências SARIF/relatório, campos de proprietário, estado de vencimento e decisões de
remediação versus exceção. Um cenário de evidência de qualidade de skill exige evidências de
falha observada ou feedback, exemplos funcionais, lacunas no conjunto de referências e comandos
de validação antes que uma emenda de skill possa ser promovida. Um cenário de evidência de
analisador profundo exige casos de corpus de analisador, comparações de saída esperada e prova
de taxonomia de risco antes que o comportamento de análise de repositório ou commit possa ser
alterado.

## Pressão de Referência

- Meta-Harness: tratar o próprio harness como um experimento com especificações de cenário,
  resultados de verificador e playbooks promovidos.
- Autocontext: armazenar rastreamentos, relatórios, artefatos e melhorias reutilizáveis antes
  de alterar ativos de agentes instalados.
- Claude HUD: expor contexto, ferramentas, tarefas, atividade de agentes, verificações e risco
  para que um avaliador possa julgar uma execução após o fato.
- Hermes Agent: manter skills, memórias, acompanhamentos semelhantes a agendadores e comportamento
  de gateway de terminal explícitos em vez de ocultar comandos locais.
- dmux, Orca, Superset e Ghast: preservar o estado de worktree/sessão para que o trabalho
  paralelo de agentes possa ser comparado, retomado ou encerrado de forma limpa.
- ECC Tools: rotear descobertas do avaliador em comentários de PR, execuções de verificação e
  itens de backlog do Linear sem sobrecarregar o GitHub.

## Contrato de Artefatos

Cada execução do avaliador/RAG é somente leitura até que um verificador promova um playbook.

| Artefato | Propósito | Fixture |
| --- | --- | --- |
| Especificação de cenário | Declara o objetivo, as evidências permitidas, as ações proibidas e os critérios de aprovação/falha. | `scenario.json` |
| Rastreamento | Captura eventos de observação, recuperação, proposta, verificação e promoção. | `trace.json` |
| Relatório | Resume pontuações, cobertura de evidências, riscos e a próxima ação recomendada. | `report.json` |
| Playbook candidato | Descreve o fluxo de trabalho de propriedade do mantenedor que pode ser reutilizado posteriormente. | `candidate-playbook.md` |
| Resultado do verificador | Aceita ou rejeita candidatos com razões concretas e notas de rollback. | `verifier-result.json` |

O protótipo separa deliberadamente a recuperação da ação. Uma execução pode recuperar diffs de
PRs fechados, status do Linear, histórico de CI e documentos locais, mas não pode fechar,
mesclar, publicar, adicionar tags ou reescrever configurações como parte do passo do avaliador.

## Modelo de Fases

1. Observar a fila atual, worktrees sujos, estado das branches, PRs/issues abertos,
   discussões, estado de CI e gates de release.
2. Recuperar evidências de referência relevantes: linhas do registro de salvamento de
   desatualizados, PRs anteriores do mantenedor, documentos atuais, descobertas do analisador,
   falhas de CI e regras do adaptador de harness.
3. Propor um ou mais playbooks com atribuição de fonte e gates de validação esperados.
4. Verificar cada playbook em relação a regras explícitas de aceitação e rejeição.
5. Promover apenas o candidato que melhora o cenário sem ampliar o raio de explosão.
6. Registrar orientações de rollback e pendências de revisão manual não resolvidas.

## Primeiro Cenário

O primeiro cenário é `stale-pr-salvage-maintainer-branch`.

Ele modela a regra que Affaan estabeleceu durante a limpeza de maio de 2026: encerramento
por desatualização é higiene de fila, não perda de trabalho útil. O trabalho útil de PRs
fechados deve ser portado para PRs de propriedade do mantenedor com atribuição/backlinks,
enquanto a geração de ruído, a localização em massa e o trabalho ambíguo de tradutores ficam
fora de cherry-picks cegos.

O verificador aceita uma branch de salvamento do mantenedor que:

- credita os PRs de origem;
- evita contexto privado bruto e caminhos pessoais;
- não importa localização em massa desatualizada sem revisão do tradutor;
- registra uma atualização durável do registro;
- executa os mesmos gates de validação que uma mudança normal de código, documentação ou
  catálogo;
- deixa as ações de publicação de release com aprovação obrigatória.

O verificador rejeita uma proposta de cherry-pick cego que:

- importa ruído de tradução/documentação desatualizado de forma completa;
- ignora a arquitetura atual do catálogo/instalação;
- falta atribuição;
- falta testes ou atualizações do registro;
- muta o estado de publicação do release ou do plugin.

## Fixtures do Corpus

Os arquivos de fixture raiz preservam o protótipo original
`stale-pr-salvage-maintainer-branch`. Cenários adicionais podem residir em subdiretórios
quando reutilizam o mesmo contrato de cinco artefatos.

Corpus atual:

- `stale-pr-salvage-maintainer-branch`: recupera trabalho útil de PRs fechados por meio de
  branches de propriedade do mantenedor com atribuição e validação.
- `billing-marketplace-readiness`: verifica afirmações de lançamento de cobrança, App e
  Marketplace antes que o texto público diga que estão ao vivo.
- `ci-failure-diagnosis`: exige logs de jobs com falha, escopo de arquivos alterados e um
  comando de regressão nomeado antes que um playbook de correção de CI possa ser promovido.
- `harness-config-quality`: exige estado do adaptador, caminho de instalação/onramp,
  comandos de verificação, notas de risco e comportamento de preservação de configuração
  antes que uma recomendação de configuração de harness possa ser promovida.
- `agentshield-policy-exception`: exige evidências SARIF ou de relatório do AgentShield,
  fonte do pacote de políticas, campos de proprietário/ticket/escopo/vencimento e aplicação
  de exceção expirada antes que uma exceção de política possa ser promovida.
- `skill-quality-evidence`: exige escopo de skill focado, evidência de falha observada ou
  feedback do usuário, cobertura de exemplos/conjunto de referências, comandos de validação e
  segurança de publicação antes que uma emenda de skill possa ser promovida.
- `deep-analyzer-evidence`: exige casos de corpus de analisador mantidos, comparações de
  saída esperada, históricos de repositório/commit representativos e comandos de regressão
  antes que o comportamento de análise profunda possa ser promovido.

## Mapeamento para ECC Tools

O ECC Tools já sinaliza evidências ausentes de RAG/avaliador para mudanças de recuperação,
embedding, classificação e avaliador. Este protótipo fornece a essas verificações um formato
alvo:

- `scenario.json` mapeia para entradas de corpus do analisador.
- `trace.json` mapeia para rastreamentos dourados e telemetria de execução.
- `report.json` mapeia para resumos de comentários de PR e resumos de backlog do Linear.
- `candidate-playbook.md` mapeia para o corpo sugerido do PR de acompanhamento.
- `verifier-result.json` mapeia para evidências de verificação de aprovação/falha.

O trabalho futuro do ECC Tools deve consumir esses artefatos como formato de fixture antes de
adicionar recuperação hospedada ou julgamento com suporte de modelo. O protótipo local é
suficiente para provar o contrato antes que qualquer API paga ou armazenamento de vetores seja
introduzido.

## Regras de Promoção

Um candidato só pode ser promovido quando:

- o resultado do verificador é `accepted`;
- pelo menos um candidato rejeitado prova que o verificador pode dizer não;
- cada PR de origem ou artefato de referência tem atribuição;
- a ação proposta é de propriedade do mantenedor e reversível;
- os comandos de validação estão nomeados;
- itens pendentes de tradutor, release, cobrança ou publicação permanecem bloqueados
  até aprovação separada.

## Próxima Expansão

O corpus local de avaliador/RAG agora cobre os buckets de evidências atuais. O trabalho
futuro deve consumir essas fixtures do ECC Tools antes de adicionar recuperação hospedada,
armazenamento de vetores, julgamento com suporte de modelo ou promoção automatizada de
execução de verificação.
