# Política de Posicionamento e Proveniência de Skills

Este documento define onde skills geradas, importadas e curadas pertencem, como são identificadas e o que é entregue.

## Tipos de Skill e Posicionamento

| Tipo | Caminho Raiz | Entregue | Proveniência |
|------|-----------|---------|------------|
| Curada | `skills/` (repositório) | Sim | Não obrigatória |
| Aprendida | `~/.claude/skills/learned/` | Não | Obrigatória |
| Importada | `~/.claude/skills/imported/` | Não | Obrigatória |
| Evoluída | `~/.claude/homunculus/evolved/skills/` (global) ou `projects/<hash>/evolved/skills/` (por projeto) | Não | Herdada da fonte instinct |

As skills curadas ficam no repositório em `skills/`. Os manifestos de instalação referenciam apenas caminhos curados. As skills geradas e importadas ficam no diretório home do usuário e nunca são entregues.

## Skills Curadas

Localização: `skills/<skill-name>/` com `SKILL.md` na raiz.

- Incluídas nos caminhos de `manifests/install-modules.json`.
- Validadas por `scripts/ci/validate-skills.js`.
- Sem arquivo de proveniência. Use `origin` no frontmatter do SKILL.md (ECC, community) para atribuição.

## Skills Aprendidas

Localização: `~/.claude/skills/learned/<skill-name>/`.

Criadas pelo continuous-learning (hook evaluate-session, comando /learn). O caminho padrão é configurável via `skills/continuous-learning/config.json` → `learned_skills_path`.

- Não no repositório. Não entregues.
- Devem ter um arquivo `.provenance.json` irmão ao `SKILL.md`.
- Carregadas em runtime quando o diretório existe.

## Skills Importadas

Localização: `~/.claude/skills/imported/<skill-name>/`.

Skills instaladas pelo usuário a partir de fontes externas (URL, cópia de arquivo, etc.). Nenhum importador automatizado existe ainda; o posicionamento é por convenção.

- Não no repositório. Não entregues.
- Devem ter um arquivo `.provenance.json` irmão ao `SKILL.md`.

## Skills Evoluídas (Continuous Learning v2)

Localização: `~/.claude/homunculus/evolved/skills/` (global) ou `~/.claude/homunculus/projects/<hash>/evolved/skills/` (por projeto).

Geradas pelo instinct-cli evolve a partir de instincts clusterizados. Sistema separado de learned/imported.

- Não no repositório. Não entregues.
- Proveniência herdada dos instincts de origem; nenhum `.provenance.json` separado necessário.

## Metadados de Proveniência

Obrigatório para skills aprendidas e importadas. Arquivo: `.provenance.json` no diretório da skill.

Campos obrigatórios:

| Campo | Tipo | Descrição |
|-------|------|-------------|
| source | string | Origem (URL, caminho ou identificador) |
| created_at | string | Timestamp ISO 8601 |
| confidence | number | 0–1 |
| author | string | Quem ou o que produziu a skill |

Schema: `schemas/provenance.schema.json`. Validação: `scripts/lib/skill-evolution/provenance.js` → `validateProvenance`.

## Comportamento do Validador

### validate-skills.js

Escopo: Apenas skills curadas (`skills/` no repositório).

- Se `skills/` não existir: sair com 0 (nada a validar).
- Para cada subdiretório: deve conter `SKILL.md`, não vazio.
- Não toca nas raízes learned/imported/evolved.

### validate-install-manifests.js

Escopo: Apenas caminhos curados. Todos os `paths` em módulos devem existir no repositório.

- Raízes geradas/importadas estão fora do escopo. Nenhum manifesto as referencia.
- Caminho ausente → erro. Sem tratamento de caminho opcional.

### Scripts que Usam Raízes Geradas

`scripts/skills-health.js`, `scripts/lib/skill-evolution/health.js`, hooks de sessão: eles verificam `~/.claude/skills/learned` e `~/.claude/skills/imported`. Diretórios ausentes são tratados como vazios; sem erros.

## Publicável vs Apenas Local

| Publicável | Apenas Local |
|-------------|------------|
| `skills/*` (curadas) | `~/.claude/skills/learned/*` |
| | `~/.claude/skills/imported/*` |
| | `~/.claude/homunculus/**/evolved/**` |

Apenas skills curadas aparecem nos manifestos de instalação e são copiadas durante a instalação.

## Roadmap de Implementação

1. Documento de política e schema de proveniência (esta alteração).
2. Adicionar validação de proveniência aos caminhos de gravação de skill aprendida (evaluate-session, saída /learn) para que novas skills aprendidas sempre obtenham `.provenance.json`.
3. Atualizar o instinct-cli evolve para gravar proveniência opcional ao gerar skills evoluídas.
4. Adicionar `scripts/validate-provenance.js` ao CI para quaisquer caminhos no repositório que não devem conter conteúdo learned/imported (se necessário).
5. Documentar raízes learned/imported no CONTRIBUTING.md ou documentação do usuário para que contribuidores saibam não fazer commit delas.
