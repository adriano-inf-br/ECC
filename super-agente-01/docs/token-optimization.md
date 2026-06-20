# Guia de Otimização de Token

Configurações e hábitos práticos para reduzir o consumo de tokens, estender a qualidade da sessão e realizar mais trabalho dentro dos limites diários.

> Veja também: `rules/common/performance.md` para estratégia de seleção de modelo, `skills/strategic-compact/` para sugestões automatizadas de compactação.

---

## Configurações Recomendadas

Estas são as configurações padrão recomendadas para a maioria dos usuários. Usuários avançados podem ajustar os valores com base em sua carga de trabalho — por exemplo, definindo `MAX_THINKING_TOKENS` mais baixo para tarefas simples ou mais alto para trabalho arquitetural complexo.

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "model": "sonnet",
  "env": {
    "MAX_THINKING_TOKENS": "10000",
    "CLAUDE_CODE_SUBAGENT_MODEL": "haiku"
  }
}
```

### O que cada configuração faz

| Configuração | Padrão | Recomendado | Efeito |
|---------|---------|-------------|--------|
| `model` | opus | **sonnet** | Sonnet lida bem com ~80% das tarefas de programação. Alterne para Opus com `/model opus` para raciocínio complexo. Redução de custo de ~60%. |
| `MAX_THINKING_TOKENS` | 31.999 | **10.000** | O pensamento estendido reserva até 31.999 tokens de output por requisição para raciocínio interno. Reduzir isso corta o custo oculto em ~70%. Defina como `0` para desabilitar em tarefas triviais. |
| `CLAUDE_CODE_SUBAGENT_MODEL` | _(herda o principal)_ | **haiku** | Subagents (ferramenta Task) rodam neste modelo. Haiku é ~80% mais barato e suficiente para exploração, leitura de arquivos e execução de testes. |
| `ECC_CONTEXT_MONITOR_COST_WARNINGS` | ligado | **desligado para usuários de assinatura** | Suprime avisos de estimativa de custo por taxa de API voltados ao agent, mantendo avisos de esgotamento de contexto, escopo e loop. |

### Nota da comunidade sobre sobrescritas de autocompactação

Algumas builds recentes do Claude Code têm relatos da comunidade de que `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` pode apenas diminuir o limite de compactação, o que significa que valores abaixo do padrão podem compactar mais cedo em vez de mais tarde. Se isso acontecer na sua configuração, remova a sobrescrita e confie no `/compact` manual mais a orientação `strategic-compact` do ECC. Veja [Solução de Problemas](./TROUBLESHOOTING.md).

### Ativando/desativando o pensamento estendido

- **Alt+T** (Windows/Linux) ou **Option+T** (macOS) — ativar/desativar
- **Ctrl+O** — ver output de pensamento (modo verbose)

---

## Seleção de Modelo

Use o modelo certo para a tarefa:

| Modelo | Melhor para | Custo |
|-------|----------|------|
| **Haiku** | Exploração com subagent, leitura de arquivos, lookups simples | Mais baixo |
| **Sonnet** | Programação do dia a dia, revisões, escrita de testes, implementação | Médio |
| **Opus** | Arquitetura complexa, raciocínio em múltiplas etapas, depuração de problemas sutis | Mais alto |

Troque de modelo no meio da sessão:

```
/model sonnet     # padrão para a maioria dos trabalhos
/model opus       # raciocínio complexo
/model haiku      # lookups rápidos
```

---

## Gerenciamento de Contexto

### Comandos

| Comando | Quando usar |
|---------|-------------|
| `/clear` | Entre tarefas não relacionadas. Contexto obsoleto desperdiça tokens em cada mensagem subsequente. |
| `/compact` | Em pontos de quebra lógicos de tarefa (após planejamento, após depuração, antes de mudar o foco). |
| `/cost` | Verificar gastos de token para a sessão atual. |

### Avisos de estimativa de custo por taxa de API

O monitor de contexto do ECC pode emitir estimativas de custo por taxa de API a partir da telemetria de hook local. Se você estiver em uma assinatura Claude e essas estimativas não refletirem sua conta real, desabilite apenas os avisos de custo voltados ao agent:

```bash
export ECC_CONTEXT_MONITOR_COST_WARNINGS=off
```

Windows PowerShell:

```powershell
[Environment]::SetEnvironmentVariable('ECC_CONTEXT_MONITOR_COST_WARNINGS', 'off', 'User')
```

Isso não desabilita avisos de esgotamento de contexto, avisos de escopo, avisos de loop, `/cost` ou arquivos de telemetria de custo.

### Compactação estratégica

A skill `strategic-compact` (em `skills/strategic-compact/`) sugere `/compact` em intervalos lógicos em vez de depender da autocompactação, que pode ser acionada no meio de uma tarefa. Consulte o README da skill para instruções de configuração de hook.

**Quando compactar:**
- Após exploração, antes da implementação
- Após concluir um marco
- Após depuração, antes de continuar com trabalho novo
- Antes de uma grande mudança de contexto

**Quando NÃO compactar:**
- No meio da implementação de alterações relacionadas
- Enquanto depura um problema ativo
- Durante refatoração de múltiplos arquivos

### Subagents protegem seu contexto

Use subagents (ferramenta Task) para exploração em vez de ler muitos arquivos na sua sessão principal. O subagent lê 20 arquivos mas retorna apenas um resumo — seu contexto principal permanece limpo.

---

## Gerenciamento de Servidor MCP

Cada servidor MCP habilitado adiciona definições de ferramenta à sua janela de contexto. O README avisa: **mantenha menos de 10 habilitados por projeto**.

Dicas:
- Execute `/mcp` para ver servidores ativos e seu custo de contexto
- Use `/mcp` para desabilitar servidores MCP do Claude Code quando quiser uma mudança de runtime ao vivo. O Claude Code persiste esses desabilitamentos de runtime em `~/.claude.json`.
- Prefira ferramentas CLI quando disponíveis (`gh` em vez de MCP do GitHub, `aws` em vez de MCP da AWS)
- Não confie em `.claude/settings.json` ou `.claude/settings.local.json` para desabilitar servidores MCP do Claude Code já carregados; use `/mcp` para isso.
- `ECC_DISABLED_MCPS` afeta apenas o output de configuração MCP gerado pelo ECC durante fluxos de instalação/sincronização, como `install.sh`, `npx ecc-install` e mesclagem de MCP do Codex. Não é um toggle ao vivo do Claude Code.
- O servidor MCP `memory` é configurado por padrão, mas não é usado por nenhuma skill, agent ou hook — considere desabilitá-lo

---

## Aviso de Custo de Equipes de Agent

[Equipes de Agent](https://code.claude.com/docs/en/agent-teams) (experimental) gera múltiplas janelas de contexto independentes. Cada membro da equipe consome tokens separadamente.

- Use apenas para tarefas onde o paralelismo agrega valor claro (trabalho multi-módulo, revisões paralelas)
- Para tarefas sequenciais simples, subagents (ferramenta Task) são mais eficientes em tokens
- Habilitar com: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` nas configurações

---

## Futuro: Integração configure-ecc

O assistente de instalação `configure-ecc` poderia oferecer configurar essas variáveis de ambiente durante a instalação, com explicações dos trade-offs de custo. Isso ajudaria novos usuários a otimizar desde o primeiro dia em vez de descobrir essas configurações após atingir os limites.

---

## Referência Rápida

```bash
# Fluxo de trabalho diário
/model sonnet              # Comece aqui
/model opus                # Apenas para raciocínio complexo
/clear                     # Entre tarefas não relacionadas
/compact                   # Em pontos de quebra lógicos
/cost                      # Verificar gastos

# Variáveis de ambiente (adicionar ao bloco "env" de ~/.claude/settings.json)
MAX_THINKING_TOKENS=10000
CLAUDE_CODE_SUBAGENT_MODEL=haiku
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```
