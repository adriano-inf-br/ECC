# Solução de Problemas

Soluções alternativas reportadas pela comunidade para bugs atuais do Claude Code que podem afetar usuários do ECC.

Esses são comportamentos upstream do Claude Code, não bugs do ECC. As entradas abaixo resumem as soluções alternativas testadas em produção coletadas na [issue #644](https://github.com/affaan-m/everything-claude-code/issues/644) no Claude Code `v2.1.79` (macOS, uso intenso de hook, conectores MCP habilitados). Trate-as como soluções paliativas pragmáticas até que as correções upstream cheguem.

## Soluções Alternativas da Comunidade para Bugs Abertos do Claude Code

### Rótulos falsos de "Hook Error" em hooks bem-sucedidos

**Sintomas:** O Hook é executado com sucesso, mas o Claude Code ainda mostra `Hook Error` na transcrição.

**O que ajuda:**

- Consuma o stdin no início do hook (`input=$(cat)` em hooks shell) para que o processo pai não veja um pipe não consumido.
- Para hooks simples de allow/block, envie diagnósticos legíveis por humanos para stderr e mantenha stdout quieto, a menos que sua implementação de hook requeira explicitamente stdout estruturado.
- Redirecione stderr barulhento de processos filhos quando não for acionável.
- Use os códigos de saída corretos: `0` permite, `2` bloqueia, outras saídas não-zero são tratadas como erros.

**Exemplo:**

```bash
# Good: block with stderr message and exit 2
input=$(cat)
echo "[BLOCKED] Reason here" >&2
exit 2
```

### Compactação mais cedo do que o esperado com `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`

**Sintomas:** Reduzir `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` faz a compactação acontecer mais cedo, não mais tarde.

**O que ajuda:**

- Em algumas builds atuais do Claude Code, valores menores podem reduzir o limite de compactação em vez de estendê-lo.
- Se você quiser mais espaço de trabalho, remova `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` e prefira `/compact` manual em limites lógicos de tarefa.
- Use a orientação `strategic-compact` do ECC em vez de forçar um limite mais baixo de auto-compact.

### Conectores MCP parecem conectados mas falham após compactação

**Sintomas:** As ferramentas MCP do Gmail ou Google Drive falham após a compactação mesmo que o conector ainda pareça autenticado na UI.

**O que ajuda:**

- Desative e reative o conector afetado após a compactação.
- Se sua build do Claude Code suportar, adicione um hook de lembrete `PostCompact` que avisa para re-verificar a autenticação do conector após a compactação.
- Trate isso como uma etapa de recuperação de estado de autenticação, não como uma correção permanente.

### Edições de Hook não recarregam automaticamente

**Sintomas:** Alterações nos hooks de `settings.json` não entram em vigor até que a sessão seja reiniciada.

**O que ajuda:**

- Reinicie a sessão do Claude Code após alterar hooks.
- Usuários avançados às vezes escrevem um comando `/reload` local em torno de `kill -HUP $PPID`, mas o ECC não inclui isso porque é dependente de shell e não é universalmente confiável.

### Respostas repetidas `529 Overloaded`

**Sintomas:** O Claude Code começa a falhar sob alta pressão de hook/ferramenta/contexto.

**O que ajuda:**

- Reduza a pressão de definição de ferramentas com `ENABLE_TOOL_SEARCH=auto:5` se sua configuração suportar.
- Reduza `MAX_THINKING_TOKENS` para trabalho de rotina.
- Roteie trabalho de subagent para um modelo mais barato como `CLAUDE_CODE_SUBAGENT_MODEL=haiku` se sua configuração expor esse controle.
- Desabilite servidores MCP não utilizados por projeto.
- Faça compactação manual em pontos de interrupção naturais em vez de esperar pela auto-compactação.

## Documentação ECC Relacionada

- [hook-bug-workarounds.md](./hook-bug-workarounds.md) para o checklist mais curto de recuperação de hook/compactação/MCP.
- [hooks/README.md](../hooks/README.md) para o ciclo de vida de hook documentado do ECC e comportamento de código de saída.
- [token-optimization.md](./token-optimization.md) para configurações de custo e gerenciamento de contexto.
- [issue #644](https://github.com/affaan-m/everything-claude-code/issues/644) para o relatório original e ambiente testado.
