---
name: strategic-compact
description: Sugere compactação manual de contexto em intervalos lógicos para preservar o contexto ao longo das fases de uma tarefa, em vez de depender de compactação automática arbitrária.
metadata:
  origin: ECC
---

# Skill de Compactação Estratégica

Sugere o uso manual de `/compact` em pontos estratégicos do seu fluxo de trabalho, em vez de depender de compactação automática arbitrária.

## Quando Ativar

- Sessões longas que se aproximam dos limites de contexto (200K+ tokens)
- Trabalho em tarefas com múltiplas fases (pesquisa → planejamento → implementação → teste)
- Alternância entre tarefas não relacionadas dentro da mesma sessão
- Após concluir um marco importante e iniciar um novo trabalho
- Quando as respostas ficam mais lentas ou menos coerentes (pressão de contexto)

## Por Que Compactação Estratégica?

A compactação automática é acionada em pontos arbitrários:
- Muitas vezes no meio de uma tarefa, perdendo contexto importante
- Sem consciência de limites lógicos de tarefa
- Pode interromper operações complexas de múltiplas etapas

A compactação estratégica em limites lógicos:
- **Após exploração, antes da execução** — Compacta o contexto de pesquisa, mantém o plano de implementação
- **Após concluir um marco** — Começo limpo para a próxima fase
- **Antes de mudanças grandes de contexto** — Limpa o contexto de exploração antes de uma tarefa diferente

## Como Funciona

O script `suggest-compact.js` é executado no PreToolUse (Edit/Write) e combina dois sinais:

1. **Tamanho do contexto (primário)** — Lê o registro de `usage` mais recente do transcript da sessão (`transcript_path` no payload do hook) e soma `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` (o tamanho real do contexto do turno). Sugere `/compact` em um limiar escalado pela janela — 160k tokens em uma janela de 200k, 250k em uma de 1M (detectado a partir de um marcador de modelo `[1m]`, ou inferido quando os tokens observados já excedem 200k) — e lembra novamente após cada 60k tokens adicionais de crescimento de contexto
2. **Contagem de chamadas de ferramentas (secundário)** — Conta invocações de ferramentas na sessão; sugere em um limiar configurável (padrão: 50 chamadas) e depois a cada 25 chamadas

A contagem de ferramentas sozinha é um proxy fraco para a pressão da janela: algumas leituras grandes de arquivo ou respostas de MCP podem preencher a janela em poucas chamadas, enquanto muitas chamadas pequenas podem cruzar 50 com uma janela quase vazia. O sinal de tamanho de contexto dispara quando realmente importa.

## Configuração do Hook

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit",
        "hooks": [{ "type": "command", "command": "node ~/.claude/scripts/hooks/suggest-compact.js" }]
      },
      {
        "matcher": "Write",
        "hooks": [{ "type": "command", "command": "node ~/.claude/scripts/hooks/suggest-compact.js" }]
      }
    ]
  }
}
```

## Configuração

Variáveis de ambiente:
- `COMPACT_THRESHOLD` — Chamadas de ferramentas antes da primeira sugestão (padrão: 50)
- `COMPACT_CONTEXT_THRESHOLD` — Tokens de contexto antes da sugestão por tamanho de contexto (padrão: 160000 em janela de 200k, 250000 em janela de 1M; `0` desativa o sinal de contexto)
- `COMPACT_CONTEXT_INTERVAL` — Tokens de contexto adicionais antes de repetir a sugestão (padrão: 60000)
- `COMPACT_STATE_TTL_DAYS` — Dias antes que arquivos de estado por sessão antigos no diretório temporário sejam removidos (padrão: 14)

## Guia de Decisão de Compactação

Use esta tabela para decidir quando compactar:

| Transição de Fase | Compactar? | Por quê |
|-----------------|----------|-----|
| Pesquisa → Planejamento | Sim | O contexto de pesquisa é volumoso; o plano é o resultado destilado |
| Planejamento → Implementação | Sim | O plano está no TodoWrite ou em um arquivo; libere espaço no contexto para código |
| Implementação → Testes | Talvez | Mantenha se os testes referenciam código recente; compacte se mudar de foco |
| Depuração → Próxima funcionalidade | Sim | Rastros de depuração poluem o contexto para trabalho não relacionado |
| No meio da implementação | Não | Perder nomes de variáveis, caminhos de arquivo e estado parcial é custoso |
| Após uma abordagem fracassada | Sim | Limpe o raciocínio sem saída antes de tentar uma nova abordagem |

## O Que Sobrevive à Compactação

Entender o que persiste ajuda a compactar com confiança:

| Persiste | Perdido |
|----------|------|
| Instruções do CLAUDE.md | Raciocínio intermediário e análise |
| Lista de tarefas do TodoWrite | Conteúdo de arquivos lidos anteriormente |
| Arquivos de memória (`~/.claude/memory/`) | Contexto de conversa em múltiplas etapas |
| Estado do git (commits, branches) | Histórico e contagens de chamadas de ferramentas |
| Arquivos em disco | Preferências sutis do usuário declaradas verbalmente |

## Boas Práticas

1. **Compactar após o planejamento** — Uma vez que o plano está finalizado no TodoWrite, compacte para começar do zero
2. **Compactar após depuração** — Limpe o contexto de resolução de erros antes de continuar
3. **Não compactar no meio da implementação** — Preserve o contexto para mudanças relacionadas
4. **Leia a sugestão** — O hook diz *quando*, você decide *se*
5. **Escreva antes de compactar** — Salve contexto importante em arquivos ou memória antes de compactar
6. **Use `/compact` com um resumo** — Adicione uma mensagem personalizada: `/compact Focus on implementing auth middleware next`

## Padrões de Otimização de Token

### Carregamento Lazy por Tabela de Gatilhos
Em vez de carregar o conteúdo completo de skills no início da sessão, use uma tabela de gatilhos que mapeia palavras-chave para caminhos de skills. As skills carregam apenas quando acionadas, reduzindo o contexto base em 50%+:

| Gatilho | Skill | Carregue Quando |
|---------|-------|-----------|
| "test", "tdd", "coverage" | tdd-workflow | Usuário menciona testes |
| "security", "auth", "xss" | security-review | Trabalho relacionado à segurança |
| "deploy", "ci/cd" | deployment-patterns | Contexto de deploy |

### Consciência da Composição do Contexto
Monitore o que está consumindo sua janela de contexto:
- **Arquivos CLAUDE.md** — Sempre carregados, mantenha-os enxutos
- **Skills carregadas** — Cada skill adiciona 1-5K tokens
- **Histórico de conversa** — Cresce a cada troca
- **Resultados de ferramentas** — Leituras de arquivo, resultados de busca adicionam volume

### Detecção de Instruções Duplicadas
Fontes comuns de contexto duplicado:
- Mesmas regras em `~/.claude/rules/` e no projeto `.claude/rules/`
- Skills que repetem instruções do CLAUDE.md
- Múltiplas skills cobrindo domínios sobrepostos

### Ferramentas de Otimização de Contexto
- `token-optimizer` MCP — Redução automatizada de 95%+ de tokens via deduplicação de conteúdo
- `context-mode` — Virtualização de contexto (demonstrado: 315KB para 5.4KB)

## Relacionados

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) — Seção de otimização de tokens
- Hooks de persistência de memória — Para estado que sobrevive à compactação
- Skill `continuous-learning` — Extrai padrões antes do fim da sessão
