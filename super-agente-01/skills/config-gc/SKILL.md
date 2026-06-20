---
name: config-gc
description: Coleta de lixo (garbage collection) para a sua configuração do Claude Code. Escaneia periodicamente ~/.claude (skills, memória, hooks, permissões, servidores MCP, caches) em busca de itens redundantes, obsoletos, órfãos ou de baixo valor, depois conduz o usuário por uma limpeza com confirmação a cada exclusão. Use quando o usuário disser "limpe minha config", "config GC", "skills demais", "audite meu setup", "meu .claude está inchado", ou pedir uma revisão periódica de configuração.
metadata:
  origin: ECC
---

# Config GC — Garbage Collection para Setups do Claude Code

Emprestado da garbage collection de runtime: escaneie periodicamente por objetos que não são mais referenciados, são redundantes, expiraram ou têm baixo valor, e recupere o espaço. A diferença crítica: **aqui, a coleta exige um humano no loop. Nunca exclua autonomamente.**

## When to Activate

- O usuário pede para limpar, auditar ou enxugar a configuração do Claude Code
- O usuário reclama de skills demais, hooks barulhentos ou início de sessão lento
- Uma revisão de configuração mensal/periódica está pendente
- Após instalar um pacote grande de skills (ex.: este repositório), para reconciliar sobreposições com o setup existente

NÃO ative para: limpar o código-fonte do projeto (isso é refatoração), limpar o histórico de chat ou desinstalar o próprio Claude Code.

## Filosofia de Design

1. **Configs append-only vazam.** Skills, arquivos de memória, hooks e entradas de permissão só são adicionados. Sem revisão periódica, eles apodrecem silenciosamente.
2. **Auditorias regulares vencem expurgos pontuais.** Escaneie a cada ~30 dias, proponha um pequeno lote de candidatos a cada vez.
3. **Estratégias por canal.** Cada tipo de acumulação (skills, hooks, permissões, ...) tem seus próprios sinais de obsolescência — não aplique uma única regra em todos os lugares.
4. **Soft-delete primeiro.** Renomear para `.disabled` > mover para `~/.claude/_gc_trash/` > exclusão real. Sempre mantenha um caminho de undo.
5. **Humano no loop obrigatório.** Cada candidato recebe sua própria confirmação `[y/n/skip]`. Sem atalho de "sim para todos".
6. **Mantenha um log.** Cada execução de GC anexa a `~/.claude/gc_log.md`: o que foi tocado, por quê e como desfazer.

## Canais de Varredura

| # | Canal | Caminho | Sinais de obsolescência / redundância |
|---|---------|------|--------------------------------|
| 1 | Skills | `~/.claude/skills/*/` | Nomes fortemente sobrepostos; nunca acionadas em transcrições recentes; incompatibilidade de domínio com o trabalho real do usuário; SKILL.md quebrado ou vazio |
| 2 | Memória | `~/.claude/**/memory/*.md` + seu índice | Múltiplas entradas de índice para um tópico; conteúdos contradizendo entradas mais novas; datas que já passaram; arquivos órfãos ausentes do índice; fragmentos com menos de 100 palavras que deveriam ser mesclados |
| 3 | Hooks | `~/.claude/hooks/` + settings | Scripts presentes no disco mas referenciados por nenhuma configuração de hook; versões antigas substituídas por reescritas |
| 4 | Permissões | `permissions.allow` em `settings.json` / `settings.local.json` | Entradas duplicadas; entradas específicas já cobertas por um wildcard (ex.: `Bash(git push)` quando `Bash(*)` é permitido); concessões pontuais de experimentos passados |
| 5 | Servidores MCP | `~/.claude.json` ou `.mcp.json` do projeto | Servidores que falham ao conectar; duplicatas funcionais; sem uso há muito tempo |
| 6 | Lembretes / jobs agendados | onde quer que o usuário os mantenha | One-shots disparados há mais de 30 dias; jobs cujos scripts-alvo não existem mais |
| 7 | Histórico do projeto | `~/.claude/projects/*/` | Snapshots de handoff obsoletos; registros de sessão substituídos por estado mais novo |
| 8 | Caches de runtime | `cache/`, `file-history/`, `logs/`, `shell-snapshots/` | Ordene por tamanho e mtime; proponha itens grandes e com mais de 30 dias |

## Fluxo de trabalho

1. **Escaneie** todos os canais (ou o subconjunto que o usuário nomear). Colete candidatos com: caminho, canal, sinal que o sinalizou, tamanho, última modificação.
2. **Classifique** por confiança (quebrado/órfão = alta; meramente antigo = baixa) e apresente como uma tabela numerada. Limite cada execução a ~20 candidatos — o GC é periódico, não exaustivo.
3. **Confirme um a um.** Para cada candidato, mostre a evidência, depois pergunte `[y/n/skip]`. O usuário pode parar a qualquer momento.
4. **Faça soft-delete dos itens confirmados**: prefira a renomeação para `.disabled` para skills/hooks e a movimentação para `_gc_trash/<date>/` para arquivos. As entradas de permissão ficam em JSON (sem comentários possíveis): faça backup do arquivo de settings, registre cada entrada removida literalmente em `gc_log.md`, depois remova-a do array `allow` com `jq`. Só faça hard-delete quando o usuário pedir explicitamente.
5. **Registre** a execução em `~/.claude/gc_log.md`: timestamp, itens acionados, instruções de undo.
6. **Reporte**: tamanho recuperado, canais ainda saudáveis, data sugerida para a próxima revisão.

## Exemplos de Comandos de Varredura

Scripts de hook órfãos (canal 3) — scripts no disco que nenhuma configuração de hook referencia:

```bash
for f in ~/.claude/hooks/*; do
  name=$(basename "$f")
  grep -rq "$name" ~/.claude/settings.json ~/.claude/settings.local.json 2>/dev/null \
    || echo "ORPHAN: $f"
done
```

Redundant permission entries (channel 4) — duplicates, and specific grants shadowed by a wildcard:

```bash
jq -r '.permissions.allow[]' ~/.claude/settings.local.json | sort | uniq -d
if jq -e '.permissions.allow | index("Bash(*)")' ~/.claude/settings.local.json >/dev/null; then
  jq -r '.permissions.allow[]' ~/.claude/settings.local.json \
    | grep '^Bash(' | grep -vF 'Bash(*)'
fi
```

Largest stale caches (channel 8) — `du -k` instead of GNU-only `find -printf`, so it works on macOS/BSD too:

```bash
find ~/.claude/file-history ~/.claude/shell-snapshots -type f -mtime +30 \
  -exec du -k {} + 2>/dev/null | sort -rn | head -20
```

Soft-delete with undo path (capture the date once so the log can't disagree with the directory):

```bash
gc_date=$(date +%Y-%m-%d)
mkdir -p ~/.claude/_gc_trash/$gc_date
mv ~/.claude/skills/dead-skill ~/.claude/_gc_trash/$gc_date/
echo "$(date -Iseconds) moved skills/dead-skill -> _gc_trash/$gc_date/ (undo: mv back)" >> ~/.claude/gc_log.md
```

Removing a confirmed-redundant permission entry (JSON has no comments — back up, log, then edit):

```bash
cp ~/.claude/settings.local.json ~/.claude/settings.local.json.bak
echo "$(date -Iseconds) removed permission entry: Bash(git push) (undo: restore from .bak or re-add)" >> ~/.claude/gc_log.md
jq '.permissions.allow -= ["Bash(git push)"]' ~/.claude/settings.local.json.bak \
  > ~/.claude/settings.local.json
```

## Anti-Patterns

- **Bulk approval.** Asking "delete all 15? [y/n]" defeats the design. One item, one decision.
- **Hard-deleting on first pass.** If there's no `_gc_trash/` copy or `.disabled` rename, you did it wrong.
- **Treating "old" as "dead".** A skill untouched for 60 days may be seasonal (tax season, quarterly reviews). Age is a signal, not a verdict — that's why a human confirms.
- **Cleaning memory by truncation.** Merging two contradicting memory files requires reading both and keeping the newer truth, not deleting the longer one.
- **Touching anything outside `~/.claude`** (or the project's `.claude/`). Config GC never wanders into source trees.

## Best Practices

- Run after big additions, not just on a calendar: installing a 50-skill pack is exactly when overlap with existing skills appears.
- When two skills overlap, prefer disabling the one with the weaker trigger description — it's the one that was probably never firing anyway.
- Permission cleanup is the highest-value channel per minute spent: redundant allow-entries make security review harder.
- Keep `gc_log.md` forever. It's tiny, and "when did I disable that hook and why" comes up more often than you'd think.

## Related Skills

- `skill-stocktake` — audits skill *quality*; config-gc audits skill *existence*. Run stocktake on what survives GC.
- `workspace-surface-audit` — the additive counterpart: recommends what to install. config-gc is the subtractive half of the same lifecycle.
- `configure-ecc` — after installing skills with it, run config-gc to reconcile overlaps with your pre-existing setup.
- `continuous-learning` — produces the memory files this skill later audits.
- `security-review` — pairs well with the permissions channel.
