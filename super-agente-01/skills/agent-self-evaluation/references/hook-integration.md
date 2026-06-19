# Integração de Hook para Autoavaliação ao Encerrar a Sessão

Adicione este hook a `hooks/hooks.json` para lembrar o agent de se autoavaliar ao final de cada sessão (o hook ecoa um lembrete; ele não roda o avaliador automaticamente):

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] Session complete. Consider running agent-self-evaluation to rate your output.'"
          }
        ],
        "description": "Remind agent to self-evaluate at session end"
      }
    ]
  }
}
```

Eventos `Stop` não exigem um campo `matcher` (ele é opcional para `Stop`, `Notification`, `UserPromptSubmit` e `SubagentStop` conforme `scripts/ci/validate-hooks.js`). Se omitido, o objeto de hook só precisa de `hooks` e metadados como `description`.

## Integração com o Avaliador Python

O script `scripts/evaluate.py` pode ser usado como uma ferramenta autônoma:

```bash
# Encaminhe a saída do agent diretamente
echo "Your agent response here" | python3 skills/agent-self-evaluation/scripts/evaluate.py

# A partir de arquivos
python3 skills/agent-self-evaluation/scripts/evaluate.py --task task.txt --output response.txt
```

Para integrá-lo a hooks, capture a última saída do agent em um arquivo primeiro, então rode o avaliador. Para lembretes leves após verificação baseada em shell, use uma string de matcher simples suportada:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo '[Self-Eval] If this command completed verification for a non-trivial task, consider running agent-self-evaluation.'"
          }
        ],
        "description": "Remind agent to self-evaluate after shell verification"
      }
    ]
  }
}
```

Isso evita documentar a sintaxe não suportada de matcher por expressão de comando. Se o seu harness suporta expressões de matcher em nível de comando, prefira um regex com limite de palavra como `\b(pytest|npm test|go test)\b` em vez de uma substring ampla `test`.

Estes hooks são opt-in. Adicione-os ao seu `hooks/hooks.json` local se você quiser prompts de avaliação automatizados.

## Uso Manual (Recomendado)

A abordagem mais confiável é a invocação manual — o agent roda a autoavaliação como parte do seu fluxo de trabalho quando a skill `agent-self-evaluation` está ativa, sem exigir configuração de hook. A seção "When to Activate" da skill já cobre as condições de gatilho (mudanças multi-arquivo, sessões de depuração, documentos de design).
