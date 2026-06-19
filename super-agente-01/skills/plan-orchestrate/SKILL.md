---
name: plan-orchestrate
description: Lê um documento de plano, decompõe em etapas, projeta uma cadeia de agents por etapa a partir do catálogo ECC e emite prompts prontos para colar no /orchestrate custom. Apenas generativo — nunca invoca /orchestrate por conta própria. Use quando o usuário tem um plano de múltiplas etapas e quer executá-lo via orchestrate sem compor cadeias manualmente.
metadata:
  origin: ECC
---

# Plan Orchestrate

Faz a ponte entre um documento de plano e `/orchestrate custom` emitindo uma invocação pronta para colar por etapa. A skill é apenas generativa — ela nunca executa `/orchestrate`. O usuário cola cada linha quando estiver pronto.

## Quando Ativar

- O usuário tem um documento de plano de múltiplas etapas (PRD, RFC, plano de implementação) e quer executá-lo via `/orchestrate`.
- O usuário diz "orchestrate este plano", "me dê prompts de orchestrate para cada etapa", "componha cadeias para este plano".
- Existe um plano passo a passo, mas o usuário não quer escolher agents manualmente por etapa.

Pular quando:
- O trabalho é uma única etapa ad hoc → chame `/orchestrate custom` diretamente.
- O plano é ilegível ou vazio. A falta de numeração explícita sozinha não é condição de pulo — veja o caso extremo "Sem etapas claras" abaixo.

## Entradas

```
<plan-doc-path> [--lang=python|typescript|go|rust|cpp|java|kotlin|flutter|auto] [--scope=all|step:<n>|range:<a>-<b>] [--dry-run]
```

- `<plan-doc-path>` — obrigatório; caminho relativo ou absoluto (`@docs/...` aceito).
- `--lang` — variante de linguagem do revisor; padrão é `auto` (detectado do projeto).
- `--scope` — limita as etapas emitidas; padrão é `all`.
- `--dry-run` — imprime apenas decomposição + rationale da cadeia; não emite prompts finais.

## Formato autoritativo do `/orchestrate` (não desvie)

```
{ORCH_CMD} custom "<agent1>,<agent2>,...,<agentN>" "<descrição da tarefa>"
```

Onde `{ORCH_CMD}` é determinado na Fase 0 (veja abaixo). A string de comando na saída emitida **sempre usa uma forma concreta** — nunca ambas, nunca um placeholder.

- `custom` é uma cadeia sequencial; o HANDOFF de cada agent alimenta o próximo.
- Lista de agents separada por vírgulas. Sem espaços preferido; um espaço tolerado.
- Não existem flags `--mode` / `--gate` / `--agents=...` — nunca os invente.
- Os nomes dos agents vêm do catálogo nesta skill. Aspas duplas embutidas na descrição da tarefa são escapadas como `\"`.

## Forma de instalação do ECC e namespacing

Duas formas de instalação determinam o prefixo no **comando slash e em cada nome de agent**. As duas DEVEM permanecer em sincronia — uma forma por saída, nunca misturadas:

Seja `<claude-home>` o diretório home do Claude Code: `~/.claude` no macOS/Linux, `%USERPROFILE%\.claude` no Windows. Resolva-o da forma como a plataforma host resolve o diretório home do usuário (não codifique `~` diretamente).

| Forma | Detecção | `{ORCH_CMD}` | Formato do nome do agent |
|---|---|---|---|
| Instalação Plugin (1.9.0+) | `<claude-home>/plugins/marketplaces/everything-claude-code/` existe | `/everything-claude-code:orchestrate` | `everything-claude-code:<name>` |
| Instalação bare legada | Acima ausente; arquivos de agent em `<claude-home>/agents/` | `/orchestrate` | `<name>` |

Por que isso importa: na instalação plugin, os agents se registram como `everything-claude-code:tdd-guide`. Nomes bare forçam correspondência fuzzy, que falha intermitentemente em chamadas paralelas. Na instalação legada, as formas prefixadas não estão registradas e falham completamente.

## Catálogo de agents disponíveis (deve escolher destes)

Gerais:
- `planner` — reformulação de requisito, decomposição de risco, planejamento de etapas
- `architect` — arquitetura, design de sistema, propostas de refatoração
- `tdd-guide` — escrever testes → implementar → cobertura 80%+
- `code-reviewer` — revisão de código genérica
- `security-reviewer` — auditoria de segurança, OWASP, vazamento de segredos
- `refactor-cleaner` — código morto, duplicatas, limpeza de classe knip
- `doc-updater` — documentação, codemap, README
- `docs-lookup` — consultas de API de bibliotecas de terceiros (Context7)
- `e2e-runner` — orquestração de testes end-to-end
- `database-reviewer` — schema PostgreSQL, migração, performance
- `harness-optimizer` — configuração do harness de agent local
- `loop-operator` — loops autônomos de longa duração
- `chief-of-staff` — triagem multicanal (raramente adequado para etapas de plano)

Resolvedores de erros de build:
- `build-error-resolver` (genérico) / `cpp-build-resolver` / `go-build-resolver` / `java-build-resolver` / `kotlin-build-resolver` / `rust-build-resolver` / `pytorch-build-resolver`

Revisores de código:
- `python-reviewer` / `typescript-reviewer` / `go-reviewer` / `rust-reviewer` / `cpp-reviewer` / `java-reviewer` / `kotlin-reviewer` / `flutter-reviewer`

Um nome de agent com erro de ortografia falha no `/orchestrate`. Verifique contra esta lista antes de emitir.

## Como Funciona

### Fase 0 — Detectar modo ECC + linguagem

1. Leia `<plan-doc-path>`. Se estiver faltando ou vazio, reporte e pare.
2. Detecte a forma de instalação do ECC uma vez e congele-a em `ECC_MODE`. Algoritmo (execute em ordem, pare no primeiro match):
   1. Se `<claude-home>/plugins/marketplaces/everything-claude-code/` existir → `ECC_MODE=plugin`.
   2. Senão se `<claude-home>/agents/` existir e contiver pelo menos um arquivo de agent ECC (ex.: `tdd-guide.md`, `code-reviewer.md`) → `ECC_MODE=legacy`.
   3. Senão → padrão para `ECC_MODE=legacy` e emita um aviso de uma linha no topo da saída: `> Warning: could not detect ECC install; defaulting to legacy form. If you use the plugin install, edit the prefixes manually.`
   4. Se ambos os marcadores existirem (instalação mista), `plugin` vence — o namespace do plugin é o único que resolve nomes de agents sem correspondência fuzzy.

   A partir deste ponto, cada linha emitida usa o prefixo correspondente no **comando slash e em cada nome de agent**. **Nunca emita ambas as formas na mesma saída.**
3. Resolva `--lang`. Quando `auto`, execute detecção ciente de múltiplas linguagens:
   - Marcadores de sondagem: `pyproject.toml` / `uv.lock` / `requirements.txt` → python; `package.json` → typescript; `go.mod` → go; `Cargo.toml` → rust; `CMakeLists.txt` ou `*.cpp` de nível superior → cpp; `pom.xml` / `build.gradle` (Java) → java; `build.gradle.kts` ou Kotlin de nível superior → kotlin; `pubspec.yaml` → flutter.
   - **Desempate poliglota**: se mais de um marcador corresponder, escolha a linguagem cujos arquivos fonte superem em número os demais (conte via `git ls-files`, excluindo `vendor/`, `node_modules/`, `dist/`, `build/`, `.venv/`, arquivos gerados e fixtures de teste óbvios). Em empate ou quando nenhuma linguagem supera 60% dos arquivos fonte, defina `lang=unknown`.
   - Nenhum marcador encontrado → defina `lang=unknown`.
   - `lang=unknown` é um sentinela — **não** é um nome de agent. As regras 4 e 5 da Fase 2 o transformam em `code-reviewer` / `build-error-resolver` no momento de composição da cadeia.
4. Detecte um **sub-perfil PyTorch**: quando `lang=python` e qualquer um de `pyproject.toml` / `requirements.txt` / `uv.lock` declarar uma dependência em `torch`, defina `pytorch=true`. Isso afeta apenas a seleção de cadeia `build` (regra da Fase 2 abaixo); o revisor permanece `python-reviewer`.
5. **Normalize quaisquer nomes de agents declarados no plano**: se o texto do plano referencia agents pela forma prefixada de plugin (ex.: `everything-claude-code:tdd-guide`), remova o prefixo para obter o nome bare do catálogo antes de validar ou compor cadeias. O re-prefixo acontece apenas no momento de saída per `ECC_MODE` (Fase 4). Nunca deixe um nome pré-prefixado fluir para a composição da cadeia — ele ficaria com prefixo duplo no modo plugin.

### Fase 1 — Decompor etapas

Identifique "unidades de etapa" em ordem de prioridade:

1. Numeração explícita: `## Step N` / `### Phase N` / `## N. ...` / lista ordenada de nível superior.
2. Uma coluna "Step" em uma tabela.
3. Blocos separados por `---` com cabeçalhos iniciados por verbo.
4. Caso contrário, trate cada H2 como uma etapa.

Por etapa extraia `id` (base 1), `title` (≤ 80 chars), `intent` (1–3 frases), `tags`.

### Fase 2 — Rotular e escolher cadeia

Rotule por intenção (multi-rótulo permitido; cadeia construída do primário + secundários empilhados):

As palavras-gatilho abaixo são correspondidas sem distinção de maiúsculas/minúsculas. Planos multilíngues são suportados combinando os radicais das palavras em qualquer idioma, desde que o significado se alinhe com as palavras-gatilho inglesas listadas.

| Rótulo | Palavras-gatilho | Cadeia padrão |
|---|---|---|
| `design` | architecture, design, choose, evaluate, RFC | `planner,architect` |
| `plan` | plan, breakdown, milestone | `planner` |
| `impl` | implement, build, add, create, port | `tdd-guide,<lang>-reviewer` |
| `test` | test, coverage, e2e, integration | `tdd-guide,e2e-runner` |
| `refactor` | refactor, cleanup, dedupe, split | `architect,refactor-cleaner,<lang>-reviewer` |
| `migration` | migrate, upgrade, rewrite, port | `architect,tdd-guide,<lang>-reviewer` |
| `db` | schema, migration, index, SQL, Postgres, alembic, sqlmodel | `database-reviewer,<lang>-reviewer` |
| `security` | encrypt, auth, secret, OWASP, PII | `security-reviewer,<lang>-reviewer` |
| `build` | build, compile, lint failure, CI | `<lang>-build-resolver` (cai de volta para `build-error-resolver`) |
| `docs` | docs, readme, codemap, changelog | `doc-updater` |
| `lookup` | lookup, reference, API usage | `docs-lookup` |
| `review` | review, audit, verify | `<lang>-reviewer,code-reviewer` |
| `loop` | loop, autonomous, watchdog | `loop-operator` |

Regras de composição de cadeia:
1. **Seleção de rótulo primário**: quando uma etapa corresponde a múltiplos rótulos, o **primeiro na ordem da tabela** (topo da tabela = maior prioridade) é o primário; os demais são secundários. As regras de composição 2 e 3 abaixo tratam combinações multi-rótulo específicas explicitamente; caso contrário, acrescente cadeias secundárias na ordem da tabela de rótulos.
2. `impl` + `security` → `tdd-guide,<lang>-reviewer,security-reviewer`.
3. `impl` + `db` → `tdd-guide,database-reviewer,<lang>-reviewer`.
4. **Deduplique** a cadeia resultante (preserve a primeira ocorrência). Ex.: `review` + `lang=unknown` renderia `code-reviewer,code-reviewer` após a regra 5; a deduplicação colapsa para `code-reviewer`.
5. `<lang>-reviewer` resolve para `code-reviewer` quando `lang=unknown`.
6. `<lang>-build-resolver` resolve para `build-error-resolver` quando `lang=unknown`. **Caso especial**: se a Fase 0 definiu `pytorch=true`, use `pytorch-build-resolver` para cadeias `build` independentemente de `<lang>`. Não existe `python-build-resolver`; `--lang=python` sem `pytorch=true` resolve para `build-error-resolver`.
7. **Etapas sem rótulo**: se nenhuma palavra-gatilho corresponder, defina a cadeia como `code-reviewer` e escreva `no tag matched; default review-only chain` sob "Rationale da cadeia".
8. Comprimento da cadeia ≤ 4 após deduplicação. Se excedido, remova o rótulo mais fraco (`lookup` e `docs` primeiro).
9. Não emparelhe `planner` e `architect` em uma cadeia `impl` (desperdício de tokens). Emparelhe-os apenas em etapas `design`.
10. Etapas rotuladas `impl`, `refactor` ou `migration` terminam com um agent da **classe revisora** — qualquer um de `<lang>-reviewer`, `code-reviewer`, `security-reviewer` ou `database-reviewer`. O revisor mais específico do domínio vence a posição final (ex.: `impl+security` da regra 2 termina com `security-reviewer`; `impl+db` da regra 3 termina com `<lang>-reviewer` porque `database-reviewer` já faz a verificação mais cedo na cadeia). Etapas `test` e `build` são controladas pelos seus próprios validadores (`e2e-runner` e o resolvedor de build respectivamente) e não precisam de um revisor adicional.

### Fase 3 — Comprimir a descrição da tarefa

Cada `<descrição da tarefa>` emitida deve:
- Ser autossuficiente (o primeiro agent não precisa do documento do plano aberto).
- Começar com `[Plan: <path>#step-<id>]`.
- Incluir 1–3 critérios de aceitação verificáveis.
- Incluir um guarda de escopo (`Out of scope: ...`) **somente se o plano declarar um para esta etapa**. Herde verbatim. Se o plano não tiver declaração de fora de escopo, omita a cláusula inteiramente — não a invente.
- Ter 200–600 caracteres; uma linha; `"` embutido escapado como `\"`; sem quebras de linha literais.

### Fase 4 — Saída

Emita Markdown usando **a forma determinada por `ECC_MODE`**. A saída usa uma forma ao longo de todo o documento — cada `{ORCH_CMD}` e cada nome de agent é renderizado com o prefixo correspondente da Fase 0. **Não emita ambas as formas; não inclua instruções "esta é a forma plugin" / "remova o prefixo" na saída renderizada.**

Regras de renderização concretas:

- `{ORCH_CMD}` = `/everything-claude-code:orchestrate` sob `plugin`, `/orchestrate` sob `legacy`.
- `{AGENT(name)}` = `everything-claude-code:<name>` sob `plugin`, `<name>` sob `legacy`.
- A coluna "Chain" da tabela de visão geral usa a mesma renderização `{AGENT(name)}`.
- Os blocos bash por etapa contêm apenas o comando executável. **Sem comentários `# plugin form` ou `# legacy form`** — a forma é implícita e uniforme ao longo de toda a saída.

Estrutura de saída:

````markdown
# Resultado do Plan-Orchestrate

**Plano**: `<path>`
**Linguagem**: `<detected-or-given>`
**Modo ECC**: `<plugin | legacy>`
**Etapas**: <N>
**Escopo**: <all | step:n | range:a-b>

## Visão geral das etapas

| # | Título | Rótulos | Cadeia |
|---|---|---|---|
| 1 | ... | impl, db | `{AGENT(tdd-guide)},{AGENT(database-reviewer)},{AGENT(python-reviewer)}` |
| ... | | | |

---

## Etapa 1 — <título>

**Intenção**: <1–3 frases>
**Rótulos**: <a, b>
**Rationale da cadeia**: <por que esta cadeia; qual agent fecha o ciclo>

```bash
{ORCH_CMD} custom "{AGENT(tdd-guide)},{AGENT(database-reviewer)},{AGENT(python-reviewer)}" "[Plan: docs/foo.md#step-1] <descrição comprimida da tarefa>; Acceptance: <1–3 itens>; Out of scope: <…>"
```
````

> A notação `{ORCH_CMD}` e `{AGENT(...)}` acima descreve a substituição que esta skill realiza em tempo de execução. O Markdown emitido real contém as strings resolvidas, nunca os placeholders.

Acrescente um bloco final de "Execução em lote" agregando o comando de cada etapa em ordem para que o usuário possa colar todos de uma vez. **Pule o bloco de lote no modo somente-visão-geral** (veja o caso extremo "Plano grande"): quando apenas a tabela de visão geral é emitida, não há comandos por etapa para agregar.

### Fase 5 — Autoavaliação (execute antes de emitir)

- [ ] Cada agent em cada cadeia vem do catálogo (após remover qualquer prefixo `everything-claude-code:` que apareceu no plano; veja Fase 0 etapa 5).
- [ ] `{ORCH_CMD}` resolvido e cada `{AGENT(...)}` resolvido usam a **mesma** forma (`plugin` ou `legacy`) — nunca misturados em uma saída.
- [ ] Nenhuma anotação `# plugin form` / `# legacy form` e nenhuma instrução "remova o prefixo" permanecem na saída renderizada.
- [ ] Nenhum campo inventado `--mode` / `--gate` / `--agents=...`.
- [ ] Cada descrição de tarefa é de linha única, entre aspas duplas, com `"` embutido escapado.
- [ ] Cada descrição de tarefa começa com `[Plan: <path>#step-<id>]` e inclui Aceitação (1–3 itens). A cláusula `Out of scope:` está presente somente quando herdada do plano.
- [ ] Nenhum agent duplicado em qualquer cadeia após dedup da Fase 2.
- [ ] Comprimento da cadeia ≤ 4.
- [ ] Etapas rotuladas `impl`/`refactor`/`migration` terminam com um agent de classe revisora (`<lang>-reviewer`, `code-reviewer`, `security-reviewer` ou `database-reviewer`). `test` e `build` são isentos — veja regra 10 da Fase 2.
- [ ] Etapas sem rótulo emitem `code-reviewer` com o rationale `no tag matched; default review-only chain`.
- [ ] A tabela de visão geral lista cada etapa do plano, independentemente de `--scope`.
- [ ] A contagem de blocos de detalhe por etapa corresponde ao `--scope` resolvido (plano completo quando `--scope=all`; um bloco para `step:n`; tamanho do intervalo para `range:a-b`). No modo somente-visão-geral, nenhum bloco de detalhe por etapa e nenhum bloco de lote são emitidos.

## Casos Extremos

- **Sem etapas claras**: prefira divisão por H2/H3; se ainda ambíguo, reporte "nenhuma etapa estruturada detectada" com o esboço do documento e peça ao usuário para confirmar execução por esboço.
- **Plano grande (>1500 linhas)**: entre no **modo somente-visão-geral** — emita apenas a tabela de visão geral e peça ao usuário para restringir com `--scope` antes de reexecutar para detalhes. Neste modo, pule os blocos de detalhe por etapa e o bloco de execução em lote.
- **Etapa muito ampla** (ex.: "completar todo o trabalho de Backend"): não force uma única cadeia. Sugira dividir em N.a e N.b e proponha uma divisão.
- **Plano declara agents** (raro): primeiro **remova qualquer prefixo `everything-claude-code:`** para obter o nome bare do catálogo (Fase 0 etapa 5), então valide contra o catálogo. Substitua agents inválidos e explique sob "Rationale da cadeia". O nome bare é re-prefixado no momento de saída per `ECC_MODE`.
- **Projeto poliglota onde `--lang=auto` não consegue escolher um vencedor**: defina `lang=unknown`; o revisor resolve para `code-reviewer` e o resolvedor de build para `build-error-resolver`. Mencione o fallback sob "Rationale da cadeia".

## Exemplos

### Exemplo 1 — Modo Plugin, plano Python

Entrada:
```
plan-orchestrate @docs/plan/example-feature.md --lang=python
```

Trecho da saída esperada:
````markdown
## Etapa 2 — Criptografar campos sensíveis de UserProfile

**Intenção**: Introduzir um tipo SQLAlchemy `EncryptedString` e criptografar com AES-GCM `birth_datetime` / `location` antes da persistência; carregar a chave de uma variável de ambiente.
**Rótulos**: impl, security, db
**Rationale da cadeia**: Caminho de escrita sensível à segurança, então `security-reviewer` fecha a cadeia; `database-reviewer` valida a migração alembic; `python-reviewer` cobre tipagem e PEP 8.

```bash
/everything-claude-code:orchestrate custom "everything-claude-code:tdd-guide,everything-claude-code:database-reviewer,everything-claude-code:python-reviewer,everything-claude-code:security-reviewer" "[Plan: docs/plan/example-feature.md#step-2] Implement EncryptedString SQLAlchemy type and migrate UserProfile.birth_datetime/location columns; key from ENV APP_DB_KEY; Acceptance: encrypt/decrypt roundtrip tests pass; alembic upgrade/downgrade clean on empty DB; no plaintext in DB after migrate; Out of scope: cross-tenant profile sharing logic"
```
````

### Exemplo 2 — Modo Legacy, mesma etapa

Se `ECC_MODE=legacy` fosse detectado, a mesma etapa seria emitida como um único comando uniforme (sem formas prefixadas de plugin em lugar nenhum na saída):

```bash
/orchestrate custom "tdd-guide,database-reviewer,python-reviewer,security-reviewer" "[Plan: docs/plan/example-feature.md#step-2] ..."
```

Os dois exemplos acima ilustram **as duas saídas possíveis** para dois ambientes diferentes. Uma única invocação de skill produz apenas uma delas, do início ao fim.

## Notas

- Apenas generativo. Nunca invoque `/orchestrate` dentro desta skill.
- Corresponda ao idioma do documento do plano para as descrições de tarefas (nomes de agents sempre permanecem em inglês).
- Não insira linhas "Co-Authored-By" ou emoji na saída, a menos que o usuário solicite explicitamente.
