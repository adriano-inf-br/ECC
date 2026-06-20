# Solução alternativa para o bug de argv duplicado em install_hook_wrapper.ps1 (2026-04-22)

## Resumo

`docs/fixes/install_hook_wrapper.ps1` é o helper PowerShell que copia
`observe-wrapper.sh` para `~/.claude/skills/continuous-learning/hooks/` e
reescreve `~/.claude/settings.local.json` para que o Hook de observer aponte para ele.

A versão anterior produzia um command de Hook com o seguinte formato:

```
"C:\Program Files\Git\bin\bash.exe" "C:\Users\...\observe-wrapper.sh"
```

No Claude Code v2.1.116, o primeiro token de argv é duplicado. Quando esse token
é um caminho de executável Windows com aspas, o `bash.exe` é reinvocado com ele mesmo como
seu `$0`, o que falha com `cannot execute binary file` (exit 126). O PR #1524
documenta a causa raiz; este script é um complemento que mantém o instalador
sincronizado com o layout corrigido do `settings.local.json`.

## O que a correção faz

- O primeiro token agora é o `bash` resolvido pelo PATH (sem caminho `.exe` com aspas), de modo que
  o bug de argv duplicado não passa mais um binário como script.
- O caminho do wrapper é normalizado para barras invertidas antes de ser embutido no
  command do Hook, evitando surpresas de tratamento de barra invertida do MSYS.
- `PreToolUse` e `PostToolUse` recebem commands distintos com argumentos posicionais
  explícitos `pre` / `post`, correspondendo ao formato esperado pelo wrapper.
- O arquivo de configurações é escrito com terminações de linha LF para que os parsers JSON
  posteriores nunca vejam saída mista CRLF/LF do `ConvertTo-Json`.

## Formato resultante do command

```
bash "C:/Users/<você>/.claude/skills/continuous-learning/hooks/observe-wrapper.sh" pre
bash "C:/Users/<você>/.claude/skills/continuous-learning/hooks/observe-wrapper.sh" post
```

## Uso

```powershell
# Coloque observe-wrapper.sh ao lado deste script, depois:
pwsh -File docs/fixes/install_hook_wrapper.ps1
```

O script faz backup do `settings.local.json` para
`settings.local.json.bak-<timestamp>` antes de gravar.

## Compatibilidade com PowerShell 5.1

`ConvertFrom-Json -AsHashtable` é exclusivo do PowerShell 7+. O script tenta
`-AsHashtable` primeiro e recorre a uma conversão manual de `PSCustomObject` →
`Hashtable` no Windows PowerShell 5.1. Ambos os buckets de Hook
(`PreToolUse`, `PostToolUse`) e seus arrays internos `hooks` são
materializados como `System.Collections.ArrayList` antes da serialização, para que
o `ConvertTo-Json` do PS 5.1 não consiga colapsar arrays de elemento único em
objetos simples. Verificado executando `powershell -NoProfile -File
docs/fixes/install_hook_wrapper.ps1` em uma máquina Windows 11 com apenas
o Windows PowerShell 5.1 instalado (sem `pwsh`).

## Referências

- PR #1524 — correção do formato de settings.local.json (mesma causa raiz de argv duplicado)
- PR #1511 — ignorar `AppInstallerPythonRedirector.exe` na resolução python do observer
- PR #1539 — `detect-project.sh` independente de locale
- PR #1542 — correção complementar do `patch_settings_cl_v2_simple.ps1`
