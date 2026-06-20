# Orquestração de Agents

## Agents Disponíveis

Localizados em `~/.claude/agents/`:

| Agent | Propósito | Quando Usar |
|-------|---------|-------------|
| planner | Planejamento de implementação | Features complexas, refatoração |
| architect | Design de sistema | Decisões arquiteturais |
| tdd-guide | Desenvolvimento orientado a testes | Novas features, correções de bug |
| code-reviewer | Revisão de código | Após escrever código |
| security-reviewer | Análise de segurança | Antes de commits |
| build-error-resolver | Corrigir erros de build | Quando o build falha |
| e2e-runner | Testes E2E | Fluxos de usuário críticos |
| refactor-cleaner | Limpeza de código morto | Manutenção de código |
| doc-updater | Documentação | Atualização de docs |
| rust-reviewer | Revisão de código Rust | Projetos Rust |
| harmonyos-app-resolver | Desenvolvimento de apps HarmonyOS | Projetos HarmonyOS/ArkTS |

## Uso Imediato de Agents

Sem necessidade de prompt do usuário:
1. Solicitações de features complexas - Use o agent **planner**
2. Código recém-escrito/modificado - Use o agent **code-reviewer**
3. Correção de bug ou nova feature - Use o agent **tdd-guide**
4. Decisão arquitetural - Use o agent **architect**

## Execução Paralela de Tasks

SEMPRE use execução paralela de Task para operações independentes:

```markdown
# BOM: Execução paralela
Inicie 3 agents em paralelo:
1. Agent 1: Análise de segurança do módulo de auth
2. Agent 2: Revisão de desempenho do sistema de cache
3. Agent 3: Verificação de tipos dos utilitários

# RUIM: Sequencial quando desnecessário
Primeiro o agent 1, depois o agent 2, depois o agent 3
```

## Análise Multiperspectiva

Para problemas complexos, use sub-agents com papéis divididos:
- Revisor factual
- Engenheiro sênior
- Especialista em segurança
- Revisor de consistência
- Verificador de redundância
