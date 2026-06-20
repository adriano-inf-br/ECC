---
name: continuous-learning
description: "[DESCONTINUADO - use continuous-learning-v2] Extrator de skills legado da v1 baseado em hook stop. A v2 é um superconjunto estrito com aprendizado baseado em instintos, escopo de projeto e confiável via hooks. Não invoque a v1; encaminhe pedidos de aprendizado contínuo, aprendizado de sessão e extração de padrões para continuous-learning-v2."
metadata:
  origin: ECC
---

# Continuous Learning Skill - DESCONTINUADO

> **DESCONTINUADO em 2026-04-28.** Use `continuous-learning-v2` em vez disso. A v2 é um superconjunto estrito: a observação via hook stop se torna observação PreToolUse/PostToolUse, skills completas se tornam instintos atômicos com pontuação de confiança, e o armazenamento somente global se torna escopo de projeto com promoção global.
>
> Este arquivo é mantido para referência de arquivo e compatibilidade retroativa com instalações existentes.

---

## Documentação Original da v1 (arquivo)

Avalia automaticamente sessões do Claude Code ao encerrar para extrair padrões reutilizáveis que podem ser salvos como skills aprendidas.

## Quando Ativar

- Configurar a extração automática de padrões a partir de sessões do Claude Code
- Configurar o hook Stop para avaliação de sessão
- Revisar ou curar skills aprendidas em `~/.claude/skills/learned/`
- Ajustar limiares de extração ou categorias de padrões
- Comparar as abordagens v1 (esta) vs v2 (baseada em instintos)

## Status

Esta skill v1 ainda é suportada, mas `continuous-learning-v2` é o caminho preferido para novas instalações. Mantenha a v1 quando você quiser explicitamente o fluxo de extração mais simples via hook Stop ou precisar de compatibilidade com fluxos de trabalho de skills aprendidas mais antigos.

## Como Funciona

Esta skill roda como um **hook Stop** ao final de cada sessão:

1. **Avaliação de Sessão**: Verifica se a sessão tem mensagens suficientes (padrão: 10+)
2. **Detecção de Padrões**: Identifica padrões extraíveis da sessão
3. **Extração de Skill**: Salva padrões úteis em `~/.claude/skills/learned/`

## Configuração

Edite `config.json` para personalizar:

```json
{
  "min_session_length": 10,
  "extraction_threshold": "medium",
  "auto_approve": false,
  "learned_skills_path": "~/.claude/skills/learned/",
  "patterns_to_detect": [
    "error_resolution",
    "user_corrections",
    "workarounds",
    "debugging_techniques",
    "project_specific"
  ],
  "ignore_patterns": [
    "simple_typos",
    "one_time_fixes",
    "external_api_issues"
  ]
}
```

## Tipos de Padrão

| Padrão | Descrição |
|---------|-------------|
| `error_resolution` | Como erros específicos foram resolvidos |
| `user_corrections` | Padrões a partir de correções do usuário |
| `workarounds` | Soluções para peculiaridades de framework/biblioteca |
| `debugging_techniques` | Abordagens eficazes de depuração |
| `project_specific` | Convenções específicas do projeto |

## Configuração do Hook

Adicione ao seu `~/.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/skills/continuous-learning/evaluate-session.sh"
      }]
    }]
  }
}
```

## Por Que o Hook Stop?

- **Leve**: Roda uma vez ao final da sessão
- **Não bloqueante**: Não adiciona latência a cada mensagem
- **Contexto completo**: Tem acesso à transcrição completa da sessão

## Relacionados

- [The Longform Guide](https://x.com/affaanmustafa/status/2014040193557471352) - Seção sobre aprendizado contínuo
- Comando `/learn` - Extração manual de padrões no meio da sessão

---

## Notas de Comparação (Pesquisa: Jan 2025)

### vs Homunculus

O Homunculus v2 adota uma abordagem mais sofisticada:

| Recurso | Nossa Abordagem | Homunculus v2 |
|---------|--------------|---------------|
| Observação | Hook Stop (fim de sessão) | Hooks PreToolUse/PostToolUse (100% confiável) |
| Análise | Contexto principal | Agent em segundo plano (Haiku) |
| Granularidade | Skills completas | "Instintos" atômicos |
| Confiança | Nenhuma | Ponderada de 0.3 a 0.9 |
| Evolução | Direto para skill | Instintos → cluster → skill/comando/agent |
| Compartilhamento | Nenhum | Exportar/importar instintos |

**Insight-chave do homunculus:**
> "A v1 dependia de skills para observar. Skills são probabilísticas—elas disparam ~50-80% das vezes. A v2 usa hooks para observação (100% confiável) e instintos como a unidade atômica de comportamento aprendido."

### Possíveis Melhorias da v2

1. **Aprendizado baseado em instintos** - Comportamentos menores e atômicos com pontuação de confiança
2. **Observer em segundo plano** - Agent Haiku analisando em paralelo
3. **Decaimento de confiança** - Instintos perdem confiança se contraditos
4. **Marcação por domínio** - code-style, testing, git, debugging, etc.
5. **Caminho de evolução** - Agrupar instintos relacionados em skills/comandos

Veja: `docs/continuous-learning-v2-spec.md` para a especificação completa.
