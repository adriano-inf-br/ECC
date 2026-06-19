# Progresso da Tradução — Super Agente 01

Este documento rastreia a tradução para **português (Brasil)** do projeto ECC,
publicada aqui como **Super Agente 01**. É a fonte de verdade para retomar o
trabalho entre sessões.

## Objetivo

Edição em português do harness de agentes ECC, mantendo **100% da
funcionalidade**: nomes de comandos, arquivos, chaves de configuração e código
permanecem no original; apenas prosa, descrições, documentação e comentários
são traduzidos.

## Decisões de escopo

- **Base:** cópia dos arquivos versionados do repositório ECC (raiz `super-agente-01/`).
- **Localizações em outros idiomas removidas** (`docs/ja-JP`, `docs/zh-CN`,
  `docs/zh-TW`, `docs/ko-KR`, `docs/es`, `docs/tr`, `docs/ru`, `docs/th`,
  `docs/ur`, `docs/vi-VN`, `docs/de-DE`, `README.zh-CN.md`): esta é a edição PT,
  então as demais traduções seriam redundantes.
- **Glossário:** `GLOSSARIO.md` (consistência de termos; siglas e nomes de
  produto/linguagem mantidos no original).

## Regras de tradução (resumo do GLOSSARIO.md)

1. Nomes de produto, linguagens e frameworks: manter no original.
2. Siglas técnicas (API, CLI, MCP, TDD, E2E...): manter; expandir na 1ª ocorrência.
3. Código (variáveis, funções, chaves, comandos): **não traduzir**; comentários sim.
4. Frontmatter YAML: traduzir apenas valores de prosa (`description`); manter
   `name`, `tools`, `model` e demais chaves/identificadores.
5. Links internos e caminhos de arquivo: manter; ajustar apenas se o arquivo-alvo
   foi renomeado/removido.

## Fases

| Fase | Conteúdo | Arquivos | Status |
|------|----------|----------|--------|
| 0 | Cópia-base funcional + fundação (glossário, progresso) | — | ✅ Concluída |
| 1 | Docs de topo (README, CLAUDE, AGENTS, CONTRIBUTING, guias...) | ~17 | ✅ Concluída |
| 2 | `agents/` (descrições e prosa) | 67 | ✅ Concluída |
| 3 | `commands/` | 92 | ✅ Concluída |
| 4 | `rules/` | 114 | ✅ Concluída |
| 5 | `skills/` (384 .md) | 384 | 🔄 Em andamento |
| 6 | `docs/` (restante em inglês) | ~900 | ⬜ Pendente |
| 7 | `scripts/`, `tests/`, `src/` (comentários/strings) | ~400 | ⬜ Pendente |
| 8 | Demais (`examples/`, `contexts/`, configs com prosa) | restante | ⬜ Pendente |

## Como retomar

1. Leia `GLOSSARIO.md` para manter consistência.
2. Pegue a próxima fase pendente na tabela acima.
3. Traduza os arquivos da fase, marque o progresso e faça commit.
4. Rode os testes do projeto antes de finalizar lotes que tocam código.

## Pendências de QA (normalização final)

- Traduzir o bloco repetido **"Prompt Defense Baseline"** (mantido em inglês pelos
  tradutores) de forma padronizada em todos os arquivos.
- Revisar blocos de template dentro de code fences (ex.: `agents/planner.md`,
  `agents/opensource-packager.md`) que contêm prosa em inglês.
- Verificar âncoras de índice (TOC) após tradução de títulos (ex.: `CONTRIBUTING.md`).

## Registro de sessões

- **Sessão 1 (2026-06-19):** Fases 0, 1 e 2 concluídas (cópia-base, docs de topo,
  `agents/`). Fase 3 (`commands/`) iniciada.
