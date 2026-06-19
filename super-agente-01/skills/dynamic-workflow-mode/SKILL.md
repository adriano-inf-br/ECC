---
name: dynamic-workflow-mode
description: "Projete harnesses locais à tarefa, eval gates e extração reutilizável de skills para o modo de fluxo de trabalho dinâmico do Claude e outros harnesses de agent adaptativos."
metadata:
  origin: ECC
---

# Dynamic Workflow Mode

Use esta skill quando um agent de programação puder gerar ou adaptar um harness local à tarefa em vez de apenas seguir um fluxo de comandos estático. O objetivo é transformar o modo de fluxo de trabalho dinâmico em um sistema disciplinado: harnesses temporários para trabalho pontual, extração de skills compartilhadas para trabalho repetido e checkpoints observáveis no painel de controle para equipes.

## Quando Ativar

- O usuário menciona fluxos de trabalho dinâmicos, harnesses customizados, harness-por-tarefa, fluxos de trabalho adaptativos ou o modo de fluxo de trabalho dinâmico do Claude Code.
- Uma tarefa precisa de um loop customizado, avaliador, crawler, gerador de fixtures, watcher ou dashboard local.
- Vários agents precisam do mesmo processo repetível, mas o processo ainda não foi capturado como uma skill compartilhada.
- Um fluxo de trabalho precisa de artefatos de handoff duráveis, evidências de eval ou aprovação do operador antes do merge.

## Contrato Central

O modo de fluxo de trabalho dinâmico deve produzir um harness local à tarefa apenas quando o harness for mais barato e mais seguro do que executar manualmente os mesmos passos. O harness deve ter:

- **Objetivo**: o resultado que ele detém e o resultado que ele explicitamente não detém.
- **Entradas**: arquivos, URLs, prompts, fontes de dados, política de credenciais e restrições fornecidas pelo usuário.
- **Saídas**: commits, relatórios, screenshots, arquivos de status ou snapshots do painel de controle.
- **Eval**: ao menos uma verificação de passa/falha vinculada à tarefa, não apenas "ele rodou".
- **Handoff**: um artefato curto que diz ao próximo operador o que aconteceu, o que está bloqueado e como retomar.

## Árvore de Decisão de Harness Dinâmico

1. **Tarefa de uma só vez**: mantenha inline. Não invente um harness.
2. **Tarefa repetida com entradas variáveis**: crie um harness local à tarefa e mantenha-o sob uma área de trabalho temporária ou local ao projeto.
3. **Tarefa repetida entre colegas de equipe ou repositórios**: extraia o padrão para uma skill compartilhada.
4. **Tarefa com estado externo, enfileiramento ou aprovações**: adicione visibilidade no painel de controle antes de adicionar mais automação.
5. **Tarefa com risco de segurança**: adicione um eval gate e um gate de merge humano antes da execução autônoma.

## Modelo de Harness Local à Tarefa

Use esta estrutura antes de escrever código:

```markdown
# Dynamic Workflow Harness

Objective:
- Ship:
- Do not ship:

Inputs:
- Repo or workspace:
- External systems:
- Credentials policy:

Loop:
1. Discover current state.
2. Generate or update the smallest useful artifact.
3. Run eval checks.
4. Record status and handoff.
5. Stop on failed gate, unclear ownership, or unsafe external action.

Eval:
- Command:
- Expected pass signal:
- Failure owner:

Handoff:
- Status:
- Evidence:
- Next action:
```

## Extração de Skill Compartilhada

Promova um harness local à tarefa para uma skill compartilhada apenas quando ao menos dois destes forem verdadeiros:

- O mesmo fluxo de trabalho aparece em várias sessões, repositórios, equipes ou lançamentos.
- O fluxo de trabalho precisa de sequenciamento específico de linguagem, ferramenta ou segurança.
- Falhas se repetem porque operadores pulam um gate ou perdem contexto.
- O fluxo de trabalho tem um contrato estável de entrada/saída.
- O fluxo de trabalho se beneficia de um painel de controle, quadro de status ou handoff de equipe.

Ao extrair, escreva primeiro a skill em `skills/<name>/SKILL.md`. Adicione shims de comando apenas se uma superfície legada de entrada via slash ainda for necessária.

## Checkpoints do Painel de Controle

O modo de fluxo de trabalho dinâmico torna-se utilizável por equipes quando expõe estado. Registre estes checkpoints sempre que a tarefa abranger mais de uma sessão:

- **Plano**: objetivo, responsável, critérios de aceitação e sistemas externos arriscados.
- **Fila**: itens de trabalho, papel do agent atribuído, branch/worktree e arestas de dependência.
- **Execução**: harness ativo, passo atual do loop, resultado de eval recente e sinal de token/custo, se disponível.
- **Gate**: resultados de testes, screenshots de navegador, security review e prontidão para merge.
- **Handoff**: o que está feito, o que falhou, o que precisa de uma decisão humana.

Se o repositório tiver o estado do ECC2 habilitado, prefira adicionar ou ler checkpoints através do painel de controle do ECC ou de scripts apoiados por state-store, em vez de espalhar notas não rastreadas.

## Eval Gates

Todo harness dinâmico precisa de um eval específico à tarefa. Escolha o gate confiável mais barato:

| Tipo de Trabalho | Eval Gate |
| --- | --- |
| Feature de código | Teste focado, lint, cobertura e um caminho de integração |
| UI/painel de controle | Smoke de navegador com screenshot e verificações de overflow/erro |
| Fluxo de trabalho de agent | Transcript de fixture ou item de trabalho semeado com roteamento esperado |
| Pesquisa/conteúdo | Brief neutro quanto à fonte, checklist de afirmações e outline pronto para publicação |
| Integração | Comando em dry-run, validação de config e varredura sem segredos |

Não afirme que um fluxo de trabalho dinâmico é reutilizável até que o eval possa ser reexecutado por outro colega de equipe.

## Anti-Padrões

- Gerar scripts que escondem a lógica de decisão real do operador.
- Tratar o modo de fluxo de trabalho dinâmico como permissão para pular testes.
- Criar docs pontuais quando uma skill compartilhada ou artefato de status é o produto real.
- Executar vários agents sem responsabilidade, gate de merge ou política de conflito.
- Deixar dados brutos de pesquisa privada vazarem para docs públicos.

## Padrão de Saída

Finalize com:

- O caminho do harness ou da skill.
- Os comandos e resultados do eval.
- O caminho do artefato de painel de controle ou de handoff.
- O próximo candidato de extração reutilizável.
