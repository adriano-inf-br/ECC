# Sistema de Hooks

## Tipos de Hook

- **PreToolUse**: Antes da execução da tool (validação, modificação de parâmetros)
- **PostToolUse**: Depois da execução da tool (auto-formatação, verificações)
- **Stop**: Quando a sessão termina (verificação final)

## Permissões de Aceitação Automática

Use com cautela:
- Habilite para planos confiáveis e bem definidos
- Desabilite para trabalho exploratório
- Nunca use a flag dangerously-skip-permissions
- Em vez disso, configure `allowedTools` em `~/.claude.json`

## Boas Práticas de TodoWrite

Use a tool TodoWrite para:
- Acompanhar o progresso em tarefas de múltiplas etapas
- Verificar o entendimento das instruções
- Permitir direcionamento em tempo real
- Mostrar etapas granulares de implementação

A lista de todos revela:
- Etapas fora de ordem
- Itens faltando
- Itens extras desnecessários
- Granularidade errada
- Requisitos mal interpretados
