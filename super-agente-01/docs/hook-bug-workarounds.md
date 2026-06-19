# Soluções Alternativas para Bugs de Hook

Soluções alternativas testadas pela comunidade para bugs atuais do Claude Code que podem afetar configurações do ECC com uso intensivo de Hook.

Esta página é intencionalmente estreita: ela reúne as correções operacionais de maior sinal da superfície de solução de problemas mais extensa sem repetir orientações de configuração especulativas ou sem suporte. Esses são comportamentos upstream do Claude Code, não bugs do ECC.

## Quando Usar Esta Página

Use esta página quando estiver depurando especificamente:

- rótulos falsos de `Hook Error` em execuções de Hook que foram bem-sucedidas
- compactação mais cedo do que o esperado
- conectores MCP que parecem autenticados mas falham após a compactação
- edições de Hook que não recarregam automaticamente
- respostas repetidas de `529 Overloaded` sob pressão intensa de Hook/ferramenta

Para a superfície de solução de problemas mais completa do ECC, use [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Soluções Alternativas de Alto Sinal

### Rótulos falsos de `Hook Error`

O que ajuda:

- Consumir stdin no início dos Hooks de shell (`input=$(cat)`).
- Manter o stdout quieto para Hooks simples de permitir/bloquear, a menos que seu Hook exija explicitamente stdout estruturado.
- Enviar diagnósticos legíveis por humanos para stderr.
- Usar os códigos de saída corretos: `0` para permitir, `2` para bloquear, outros valores não-zero são tratados como erros.

```bash
input=$(cat)
echo "[BLOCKED] Reason here" >&2
exit 2
```

### Compactação mais cedo do que o esperado

O que ajuda:

- Remover `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` se reduzi-lo causar compactação mais cedo no seu build.
- Preferir `/compact` manual em limites naturais de tarefa.
- Usar a orientação de `strategic-compact` do ECC em vez de forçar um limite menor.

### Autenticação MCP parece ativa mas falha após compactação

O que ajuda:

- Desligar e religar o conector afetado após a compactação.
- Se o seu build do Claude Code suportar, adicionar um Hook leve de lembrete `PostCompact` que avise para verificar novamente a autenticação do conector.
- Tratar isso como um lembrete de recuperação, não uma correção permanente.

### Edições de Hook não recarregam automaticamente

O que ajuda:

- Reiniciar a sessão do Claude Code após alterar Hooks.
- Usuários avançados às vezes usam helpers de reload local via shell, mas o ECC não fornece um porque essas abordagens dependem do shell e da plataforma.

### `529 Overloaded` repetido

O que ajuda:

- Reduzir a pressão de definição de ferramenta com `ENABLE_TOOL_SEARCH=auto:5` se sua configuração suportar.
- Diminuir `MAX_THINKING_TOKENS` para trabalho de rotina.
- Rotear trabalho de subagent para um modelo mais barato como `CLAUDE_CODE_SUBAGENT_MODEL=haiku` se sua configuração expuser esse controle.
- Desabilitar servidores MCP não utilizados por projeto.
- Compactar manualmente em pontos de parada naturais em vez de aguardar a compactação automática.

## Documentação Relacionada do ECC

- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [token-optimization.md](./token-optimization.md)
- [hooks/README.md](../hooks/README.md)
- [issue #644](https://github.com/affaan-m/everything-claude-code/issues/644)
