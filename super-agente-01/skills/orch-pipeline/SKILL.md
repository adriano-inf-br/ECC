---
name: orch-pipeline
description: Motor de orquestração compartilhado para a família de skills orch-*. Define o pipeline com gates de Pesquisa-Plano-TDD-Revisão-Commit, o classificador de tamanho, o mapa de agents e os dois gates humanos para os quais as skills de operação orch-* delegam. Normalmente não é invocado diretamente.
metadata:
  origin: ECC
---

# Pipeline do Orquestrador (motor compartilhado)

As skills `orch-*` são wrappers finos. Elas não reimplementam nenhum trabalho — elas
classificam a requisição, escolhem quais fases deste pipeline serão executadas e delegam
cada fase a um agent ou comando ECC existente. Este arquivo é esse pipeline.

> Invoque uma skill de operação (`orch-add-feature`, `orch-fix-defect`, …) em vez
> deste motor diretamente. Este arquivo é a referência para a qual elas apontam.

## Quando Usar

- Carregado indiretamente sempre que uma skill `orch-*` de operação for executada.
- Lido diretamente apenas ao adicionar uma nova operação à família ou ajustar as
  fases, gates ou mapa de agents compartilhados.

## A família de operações

| Skill | Operação | Gatilho | Primeiro movimento |
|-------|-----------|---------|------------|
| `orch-add-feature` | feature | capacidade ainda não existe | pesquisa + plano de uma nova fatia |
| `orch-change-feature` | tweak | funciona, mas o comportamento desejado difere | alterar o comportamento existente *e seus testes* |
| `orch-fix-defect` | fix | quebrado; o comportamento está errado | reproduzir como um teste com falha, depois corrigir |
| `orch-refine-code` | refactor | comportamento permanece, estrutura melhora | reestruturar mantendo os testes verdes |
| `orch-build-mvp` | mvp | bootstrap a partir de um doc de design/spec | ingerir doc → fatias verticais |

> Esses wrappers **compõem** comandos ECC existentes em vez de substituí-los:
> `/feature-dev`, `/plan`, `/code-review`, `/build-fix`, `/refactor-clean` e
> `/gan-build`, além da skill `tdd-workflow`. A família orch-* adiciona o classificador
> de tamanho compartilhado e os dois gates sobre eles, para que um guarda-chuva
> cubra todas as cinco operações de forma consistente.

## Passo 0 — Classificar tamanho (dimensionamento correto)

A cerimônia escala com o raio de impacto. Avalie a requisição em três sinais, tome o
**nível mais alto** que qualquer sinal atingir e declare o resultado em uma linha para que o usuário
possa substituir:

| Nível | Arquivos tocados | Nova dependência / contrato | Ambiguidade de design | Fases executadas |
|------|---------------|---------------------------|------------------|-----------------|
| trivial | 1, poucas linhas | nenhuma | nenhuma — a mudança é óbvia | 4 → 5 → 6 |
| small | 1 arquivo / 1 função | nenhuma | clara após ler o código | (1 leve) → 4 → 5 → 6 |
| standard | 2–5 arquivos | talvez um novo módulo interno | uma escolha real a fazer | 1 → 2 → 4 → 5 → 6 |
| large | muitos / transversal | nova dep externa, API pública ou doc de spec | múltiplas questões em aberto | 1 → 2 → (3) → 4 → 5 → 6 |

O Passo 0 (Intake) sempre é executado e é omitido da coluna de máscara acima. O
desempate: qualquer coisa que toque um gatilho de segurança (abaixo) ou uma API pública /
contrato é **pelo menos** standard, independentemente da contagem de arquivos.

## As fases

Cada fase delega — ela não faz o trabalho inline.

- **0. Intake** — restate a requisição. Para `orch-build-mvp`, leia o doc de spec/design
  e extraia escopo, decisões bloqueadas e uma lista de funcionalidades.
- **1. Pesquisa e Reuso** — conforme `rules/common/development-workflow.md`: `gh search repos` /
  `gh search code`, depois Context7 / docs do fornecedor, depois registros de pacotes, depois
  Exa. Prefira adotar uma implementação comprovada em vez de código novo do zero.
- **2. Plano** — delegar ao agent `planner` (ou `architect` /
  `code-architect` para decisões estruturais). Saída: `task_list` ordenada como
  fatias verticais finas. → **GATE 1.**
- **3. Scaffold** — apenas `orch-build-mvp`: construir a primeira fatia end-to-end.
- **4. Implementar (TDD)** — conduzir cada tarefa pelo agent `tdd-guide` (ou pela skill `tdd-workflow`):
  vermelho → verde → refatorar. Honre a regra de primeiro movimento da operação.
- **5. Revisão** — agent `code-reviewer` / `/code-review`. Adicione `security-reviewer`
  sempre que o diff tocar um gatilho de segurança (abaixo).
- **6. Commit** — commits convencionais (`feat:` / `fix:` / `refactor:` / …), um
  por chunk lógico. → **GATE 2.**

## Os dois gates

Esta família é **com gates, não autônoma**:

1. **GATE 1 — após o Plano.** Apresente o `task_list`; não escreva código de implementação
   até que o usuário aprove.
2. **GATE 2 — antes do Commit.** Apresente o resumo do diff e as mensagens propostas;
   não faça commit até que o usuário confirme.

Tudo entre os gates flui sem parar.

## Mapa de agents / comandos

| Fase | Primário | Fallback / escalada |
|-------|---------|----------------------|
| Intake / entender | `code-explorer` | rastrear caminhos existentes antes de um tweak, fix ou refactor |
| Plano | `planner` | `architect`, `code-architect` para decisões estruturais |
| Implementar | `tdd-guide` (ou skill `tdd-workflow`) | `build-error-resolver` / `/build-fix` em quebras de Build |
| Revisão | `code-reviewer` / `/code-review` | revisor de linguagem (`python-reviewer`, `typescript-reviewer`, …) |
| Segurança | `security-reviewer` | — |
| Loop interno de MVP | `/gan-build "<brief>" --skip-planner` | conduz `gan-generator` → `gan-evaluator`; ajuste `--max-iterations` / `--pass-threshold` |

Combine o revisor de linguagem com o repositório (veja o `CLAUDE.md` do próprio repositório).

## Gatilho de revisão de segurança

Inclua `security-reviewer` quando o diff tocar qualquer um dos seguintes: autenticação ou
autorização, manipulação de entrada do usuário, consultas de banco de dados, caminhos no sistema de arquivos,
chamadas de API externas, criptografia ou segredos / credenciais. (Conforme `rules/common/security.md`.)

## Artefatos de handoff

O pipeline não carrega estado oculto — os docs de planejamento *são* o handoff:

- `task_list` (do Plano) conduz o loop de Implementação.
- Trabalhos maiores também podem emitir PRD / arquitetura / system_design sob o
  `docs/` do repositório conforme `rules/common/development-workflow.md`.
- Descobertas de revisão (CRÍTICAS / ALTAS) devem ser resolvidas antes do Gate 2.

## Verificação

- o nível de tamanho foi declarado e correspondeu ao trabalho
- o Gate 1 (plano) e o Gate 2 (commit) foram ambos honrados
- `security-reviewer` executou se e somente se um gatilho de segurança foi tocado
- commits são convencionais e com escopo para uma mudança lógica
- comportamento novo / alterado tem testes; cobertura ≥ 80% conforme `rules/common/testing.md`
