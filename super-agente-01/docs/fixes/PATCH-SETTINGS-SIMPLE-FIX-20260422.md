# Solução alternativa para o bug de argv duplicado em patch_settings_cl_v2_simple.ps1 (2026-04-22)

## Resumo

`docs/fixes/patch_settings_cl_v2_simple.ps1` é o helper PowerShell mínimo
que corrige `~/.claude/settings.local.json` para que o Hook de observer
aponte para `observe-wrapper.sh`. É o equivalente "simples" de
`docs/fixes/install_hook_wrapper.ps1` (PR #1540): nunca copia o
script wrapper, apenas reescreve o arquivo de configurações.

A versão anterior deste helper registrava o caminho bruto do `observe.sh`
como o command do Hook, compartilhava uma única string de command entre `PreToolUse`
e `PostToolUse`, e dependia dos padrões do `ConvertTo-Json` que podem emitir
terminações de linha CRLF. No Claude Code v2.1.116, o primeiro token de argv é
duplicado, de modo que o wrapper precisa ser invocado com um formato específico e
as duas fases do Hook precisam de entradas distintas.

## O que a correção faz

- O primeiro token é o `bash` resolvido pelo PATH (sem caminho `.exe` com aspas), de modo que
  o bug de argv duplicado não passa mais um binário como script. Corresponde ao PR #1524 e
  ao PR #1540.
- O caminho do wrapper é normalizado para barras antes de ser embutido
  no command do Hook, evitando surpresas de tratamento de barra invertida do MSYS.
- `PreToolUse` e `PostToolUse` recebem commands distintos com argumentos posicionais
  explícitos `pre` / `post`.
- O arquivo de configurações é escrito em UTF-8 (sem BOM) com CRLF normalizado para LF
  para que os parsers JSON posteriores nunca vejam terminações de linha mistas.
- Hooks existentes (incluindo entradas legadas do `observe.sh` e hooks de
  terceiros não relacionados) são preservados — o script apenas adiciona as novas
  entradas do wrapper quando elas ainda não estão registradas.
- Idempotente em re-execuções: uma segunda invocação reconhece as strings de
  command canônicas e registra `[SKIP]` em vez de duplicar entradas.

## Formato resultante do command

```
bash "C:/Users/<você>/.claude/skills/continuous-learning/hooks/observe-wrapper.sh" pre
bash "C:/Users/<você>/.claude/skills/continuous-learning/hooks/observe-wrapper.sh" post
```

## Uso

```powershell
pwsh -File docs/fixes/patch_settings_cl_v2_simple.ps1
# O Windows PowerShell 5.1 também é compatível:
powershell -NoProfile -ExecutionPolicy Bypass -File docs/fixes/patch_settings_cl_v2_simple.ps1
```

O script faz backup do arquivo de configurações existente para
`settings.local.json.bak-<timestamp>` antes de gravar.

## Compatibilidade com PowerShell 5.1

`ConvertFrom-Json -AsHashtable` é exclusivo do PowerShell 7+. O script tenta
`-AsHashtable` primeiro e recorre a uma conversão manual de `PSCustomObject` →
`Hashtable` no Windows PowerShell 5.1. Ambos os buckets de Hook
(`PreToolUse`, `PostToolUse`) e seus arrays internos `hooks` são
materializados como `System.Collections.ArrayList` antes da serialização, para que
o `ConvertTo-Json` do PS 5.1 não consiga colapsar arrays de elemento único em
objetos simples.

## Casos verificados (dry-run)

1. Instalação limpa — sem configurações existentes → cria arquivo canônico.
2. Re-execução idempotente — arquivo canônico existente → `[SKIP]` em ambas as fases,
   conteúdo do arquivo inalterado, exceto pelo backup pré-gravação.
3. `observe.sh` legado presente → preserva as entradas legadas e
   adiciona as novas entradas do `observe-wrapper.sh` ao lado delas.

Todos os três casos produzem saída apenas com LF e correspondem ao formato registrado pela
correção manual do `settings.local.json` do PR #1524.

## Referências

- PR #1524 — correção do formato de settings.local.json (mesma causa raiz de argv duplicado)
- PR #1539 — `detect-project.sh` independente de locale
- PR #1540 — correção de argv duplicado no `install_hook_wrapper.ps1` (script complementar)
