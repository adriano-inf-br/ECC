# Adendo ao HOOK-FIX-20260421 — Bug de duplicação de argv no v2.1.116

Corrigido na sessão da manhã como commit 527c18b. Na sessão da noite foram realizadas verificações adicionais e identificado um bug específico do Claude Code não coberto pela correção da manhã, então este adendo foi registrado.

## Formato da correção da manhã

```json
"command": "C:/Users/sugig/.claude/skills/continuous-learning/hooks/observe-wrapper.sh pre"
```

Formato que usa o arquivo `.sh` diretamente como command. Pressupõe que o Git Bash o executará via shebang.

## O que a verificação adicional da noite revelou

Ao executar o arquivo `.sh` diretamente com `child_process.spawn` do Node.js, ele falha no Windows com
**EFTYPE**:

```js
spawn('C:/Users/sugig/.claude/skills/continuous-learning/hooks/observe-wrapper.sh',
      ['post'], {stdio:['pipe','pipe','pipe']});
// → Error: spawn EFTYPE (errno -4028)
```

Adicionar `shell:true` permite a execução via cmd.exe, mas permanece o risco de dependência da implementação interna do Claude Code.

## Correção adicional aplicada na noite

Atualizado para uma chamada explícita com `bash` (resolvido pelo PATH) como primeiro token:

```json
{
  "hooks": {
    "PreToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "bash \"C:/Users/sugig/.claude/skills/continuous-learning/hooks/observe-wrapper.sh\" pre"
      }]
    }],
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "bash \"C:/Users/sugig/.claude/skills/continuous-learning/hooks/observe-wrapper.sh\" post"
      }]
    }]
  }
}
```

Este formato segue o mesmo padrão do registro de observer canônico do ECC em `~/.claude/hooks/hooks.json` e funciona na prática sem erros.

### Verificação com Node spawn

```js
spawn('bash "C:/Users/sugig/.claude/skills/continuous-learning/hooks/observe-wrapper.sh" post',
      [], {shell:true});
// exit=0 → observations.jsonl atualizado normalmente
```

## Bug de duplicação de argv no Claude Code v2.1.116 (detalhes)

O "Defeito 2" no documento da correção da manhã registrou `bash.exe: bash.exe: cannot execute binary file`, mas agora o mecanismo raiz foi identificado.

### Reprodução

```bash
"C:\Program Files\Git\bin\bash.exe" "C:\Program Files\Git\bin\bash.exe"
# stderr: "C:\Program Files\Git\bin\bash.exe: C:\Program Files\Git\bin\bash.exe: cannot execute binary file"
# exit: 126
```

O bash trata argv[1] como um script e tenta lê-lo. Se argv[1] for o próprio bash.exe, a detecção de binário ELF/PE falha → exit 126. A mensagem de erro corresponde exatamente.

### Comportamento do Claude Code

Quando o command do Hook é `"C:\Program Files\Git\bin\bash.exe" "C:\Users\...\wrapper.sh"`, presume-se que o v2.1.116 **passa o primeiro token (= caminho completo do bash.exe) tanto para argv[0] quanto para argv[1]**. Como resultado, o bash tenta ler argv[1] = bash.exe como script e falha com 126.

### Solução alternativa

Não use um caminho completo com espaços como primeiro token:
1. `OK:` `bash` (token único resolvido pelo PATH) — correção da noite / padrão hooks.json
2. `OK:` caminho direto `.sh` (depende do tratamento de .sh pelo Claude Code) — correção da manhã
3. `RUIM:` `"C:\Program Files\Git\bin\bash.exe" "<caminho>"` — primeiro token com aspas e espaços

## Conclusão

Tanto a correção da manhã (especificação direta do .sh) quanto a da noite (prefixo bash explícito) evitam o bug de duplicação de argv, mas **a correção da noite tem menos dependência da implementação interna do Claude Code** e portanto é recomendada.

No entanto, como o commit 527c18b da correção da manhã já está em docs/fixes/, este adendo é adicionado para apresentar ambas as abordagens. Na próxima reinicialização do CLI, a correção da noite é a que permanecerá na operação real.

## Referências

- commit da correção da manhã: 527c18b
- documento da correção da manhã: docs/fixes/HOOK-FIX-20260421.md
- script de aplicação da manhã: docs/fixes/apply-hook-fix.sh
- registro da correção da noite (local): C:\Users\sugig\Documents\Claude\Projects\ECC作成\hook-fix-report-20260421.md
- arquivo de aplicação da correção da noite: C:\Users\sugig\.claude\settings.local.json
- backup da noite: C:\Users\sugig\.claude\settings.local.json.bak-hook-fix-20260421
