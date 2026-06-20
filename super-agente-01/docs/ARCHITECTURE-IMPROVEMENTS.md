# Recomendações de Melhoria de Arquitetura

Este documento registra melhorias em nível de arquiteto para o projeto Everything Claude Code (ECC). Ele é escrito da perspectiva de um arquiteto de código Claude Code que busca melhorar a manutenibilidade, consistência e qualidade a longo prazo.

---

## 1. Documentação e Fonte Única de Verdade

### 1.1 Sincronização de Contagem de Agents / Comandos / Skills

**Problema:** AGENTS.md afirma "13 agents especializados, 50+ skills, 33 comandos" enquanto o repositório tem **16 agents**, **65+ skills** e **40 comandos**. README e outros documentos também variam. Isso causa confusão para colaboradores e usuários.

**Recomendação:**

- **Fonte única de verdade:** Derive contagens (e opcionalmente tabelas) do sistema de arquivos ou de um pequeno manifesto. Opções:
  - **Opção A:** Adicione um script (ex.: `scripts/ci/catalog.js`) que varre `agents/*.md`, `commands/*.md` e `skills/*/SKILL.md` e gera JSON/Markdown. CI e documentação podem consumir isso.
  - **Opção B:** Mantenha um `docs/catalog.json` (ou YAML) que lista agents, comandos e skills com metadados; scripts e documentação leem a partir dele. Requer disciplina para atualizar ao adicionar/remover.
- **Curto prazo:** Sincronize manualmente AGENTS.md, README.md e CLAUDE.md com as contagens reais e liste quaisquer novos agents (ex.: chief-of-staff, loop-operator, harness-optimizer) na tabela de agents.

**Impacto:** Alto — afeta a primeira impressão e a confiança dos colaboradores.

---

### 1.2 Mapa de Comando → Agent / Skill

**Problema:** Não há um mapa legível por máquina ou humano de "qual comando usa qual(is) agent(s) ou skill(s)." Isso vive em tabelas do README e nos arquivos `.md` individuais de comandos, o que pode se desviar.

**Recomendação:**

- Adicione um **registro de comandos** (ex.: em `docs/` ou como frontmatter nos arquivos de comandos) que liste para cada comando: nome, descrição, agent(s) primário(s), skills referenciadas. Pode ser gerado a partir do conteúdo dos arquivos de comando ou mantido manualmente.
- Exponha um "mapa" na documentação (ex.: `docs/COMMAND-AGENT-MAP.md`) ou no catálogo gerado para descoberta e para ferramentas (ex.: "quais comandos usam tdd-guide?").

**Impacto:** Médio — melhora a descoberta e a segurança de refatoração.

---

## 2. Testes e Qualidade

### 2.1 Descoberta de Testes vs. Lista Codificada

**Problema:** `tests/run-all.js` usa uma **lista codificada** de arquivos de teste. Novos arquivos de teste não são executados a menos que alguém atualize `run-all.js`, então a cobertura pode ser incompleta por omissão.

**Recomendação:**

- **Descoberta baseada em Glob:** Descubra arquivos de teste por padrão (ex.: `**/*.test.js` em `tests/`) e execute-os, com uma lista de permissões/exclusões opcional para casos especiais. Isso torna novos testes automaticamente parte da suíte.
- Mantenha um único ponto de entrada (`tests/run-all.js`) que execute os testes descobertos e agregue os resultados.

**Impacto:** Alto — previne regressões onde novos testes existem mas nunca são executados.

---

### 2.2 Métricas de Cobertura de Testes

**Problema:** Não há ferramenta de cobertura (ex.: nyc/c8/istanbul). O projeto não pode afirmar "80%+ de cobertura" para seus próprios scripts; a cobertura é implícita.

**Recomendação:**

- Introduza uma ferramenta de cobertura para scripts Node (ex.: `c8` ou `nyc`) e execute-a no CI. Comece com uma linha de base (ex.: 60%) e aumente ao longo do tempo; ou pelo menos relate a cobertura no CI sem falhar para que a equipe possa ver as tendências.
- Foque em `scripts/` (lib + hooks + ci) como target primário; exclua scripts avulsos se necessário.

**Impacto:** Médio — alinha o projeto com sua própria orientação de AGENTS.md (80%+ de cobertura) e expõe caminhos não testados.

---

## 3. Schema e Validação

### 3.1 Usar o Schema JSON de Hooks no CI

**Problema:** `schemas/hooks.schema.json` existe e define o formato de configuração de hooks, mas `scripts/ci/validate-hooks.js` **não o usa**. A validação está duplicada (VALID_EVENTS, estrutura) e pode divergir do schema.

**Recomendação:**

- Use um validador JSON Schema (ex.: `ajv`) em `validate-hooks.js` para validar `hooks/hooks.json` contra `schemas/hooks.schema.json`. Mantenha o validador como fonte única de verdade para a estrutura; retenha apenas verificações específicas de hooks (ex.: sintaxe JS inline) no script.
- Garante que o schema e o validador permaneçam sincronizados e permite validação em IDE/editor via `$schema` em hooks.json.

**Impacto:** Médio — reduz o desvio e melhora a experiência do colaborador ao editar hooks.

---

## 4. Cross-Harness e i18n

### 4.1 Sincronização de Subconjunto de Skill/Agent (.agents/skills, .cursor/skills)

**Problema:** `.agents/skills/` (Codex) e `.cursor/skills/` são subconjuntos de `skills/`. Adicionar ou remover uma skill no repositório principal requer atualização manual desses subconjuntos, o que pode ser esquecido.

**Recomendação:**

- Documente em CONTRIBUTING.md que adicionar uma skill pode exigir atualização de `.agents/skills` e `.cursor/skills` (e como fazê-lo).
- Opcionalmente: uma verificação de CI ou script que compare `skills/` com os subconjuntos e falhe ou avise se uma skill está em um conjunto mas não no outro quando deveria estar (ex.: por convenção ou por um pequeno manifesto).

**Impacto:** Baixo–Médio — reduz o desvio cross-harness.

---

### 4.2 Desvio de Tradução (docs/ zh-CN, zh-TW, ja-JP)

**Problema:** As traduções em `docs/` duplicam agents, comandos e skills. À medida que o fonte em inglês evolui, as traduções podem ficar desatualizadas sem um processo ou ferramentas claras.

**Recomendação:**

- Documente um **processo de tradução:** quando atualizar (ex.: a cada versão), quem é responsável por cada localidade e como detectar conteúdo obsoleto (ex.: diff de listas de arquivos ou seções-chave).
- Considere: arquivo de status de tradução (ex.: `docs/i18n-status.md`) ou CI que verifica a existência/timestamps dos arquivos de tradução e avisa se o inglês foi atualizado mais recentemente que uma tradução.
- Longo prazo: considere formato de extração/placeholder (ex.: chaves i18n) para que as traduções referenciem a mesma estrutura que o fonte em inglês.

**Impacto:** Médio — melhora a experiência para usuários que não falam inglês e reduz confusão por traduções desatualizadas.

---

## 5. Hooks e Scripts

### 5.1 Consistência de Runtime de Hook

**Problema:** Os hooks devem manter uma superfície de dispatch no modo Node consistente. A observação de aprendizado contínuo agora é despachada por `run-with-flags.js` e `observe-runner.js`, que delega para a implementação existente `observe.sh` sem expor um ponto de entrada de hook no modo shell.

**Recomendação:**

- Prefira Node para novos hooks quando possível (multiplataforma, runtime único). Se shell for necessário, documente o motivo e mantenha a superfície pequena.
- Certifique-se de que `ECC_HOOK_PROFILE` e `ECC_DISABLED_HOOKS` sejam respeitados em todos os caminhos de código (incluindo shell) para que o comportamento seja consistente.

**Impacto:** Baixo — mantém o design atual; melhora se mais hooks migrarem para Node.

---

## 6. Tabela Resumo

| Área              | Melhoria                          | Prioridade | Esforço  |
|-------------------|--------------------------------------|----------|---------|
| Sincronização de doc | Sincronizar contagens e tabela de AGENTS.md/README | Alta | Baixo |
| Fonte única | Script de catálogo ou manifesto | Alta | Médio |
| Descoberta de testes | Runner de testes baseado em Glob | Alta | Baixo |
| Cobertura | Adicionar c8/nyc e cobertura no CI | Médio | Médio |
| Schema de hook no CI | Validar hooks.json via schema | Médio | Baixo |
| Mapa de comandos | Registro de comando → agent/skill | Médio | Médio |
| Sincronização de subconjunto | Documentar/CI para .agents/.cursor | Baixo–Médio | Baixo–Médio |
| Traduções | Processo + detecção de obsolescência | Médio | Médio |
| Runtime de hook | Preferir Node; documentar uso de shell | Baixo | Baixo |

---

## 7. Vitórias Rápidas (Imediatas)

1. **Atualizar AGENTS.md:** Definir contagem de agents como 16; adicionar chief-of-staff, loop-operator, harness-optimizer à tabela de agents; alinhar contagens de skills/comandos com o repositório.
2. **Descoberta de testes:** Alterar `run-all.js` para descobrir `**/*.test.js` em `tests/` (com lista de permissões opcional) para que novos testes sejam sempre executados.
3. **Conectar schema de hooks:** Em `validate-hooks.js`, validar `hooks/hooks.json` contra `schemas/hooks.schema.json` usando ajv (ou similar) e manter apenas verificações específicas de hooks no script.

Esses três podem ser feitos em uma ou duas sessões e melhoram materialmente a consistência e a confiabilidade.
