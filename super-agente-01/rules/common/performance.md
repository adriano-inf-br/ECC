# Otimização de Performance

## Estratégia de Seleção de Modelo

**Haiku** (90% da capacidade do Sonnet, 3x de economia de custo):
- Agents leves com invocação frequente
- Programação em par e geração de código
- Agents trabalhadores em sistemas multi-agente

**Sonnet** (Melhor modelo de código):
- Trabalho principal de desenvolvimento
- Orquestração de fluxos de trabalho multi-agente
- Tarefas complexas de código

**Opus** (Raciocínio mais profundo):
- Decisões arquiteturais complexas
- Requisitos máximos de raciocínio
- Tarefas de pesquisa e análise

## Gerenciamento da Janela de Contexto

Evite os últimos 20% da janela de contexto para:
- Refatoração em larga escala
- Implementação de funcionalidades que abrange múltiplos arquivos
- Depuração de interações complexas

Tarefas com menor sensibilidade ao contexto:
- Edições em arquivo único
- Criação de utilitários independentes
- Atualizações de documentação
- Correções simples de bugs

## Extended Thinking + Plan Mode

O extended thinking está habilitado por padrão, reservando até 31.999 tokens para raciocínio interno.

Controle o extended thinking via:
- **Toggle**: Option+T (macOS) / Alt+T (Windows/Linux)
- **Config**: Defina `alwaysThinkingEnabled` em `~/.claude/settings.json`
- **Limite de orçamento**: `export MAX_THINKING_TOKENS=10000` (bash) ou `$env:MAX_THINKING_TOKENS = "10000"` (PowerShell)
- **Modo verboso**: Ctrl+O para ver a saída do raciocínio

Para tarefas complexas que exigem raciocínio profundo:
1. Garanta que o extended thinking esteja habilitado (ligado por padrão)
2. Habilite o **Plan Mode** para uma abordagem estruturada
3. Use múltiplas rodadas de crítica para análise minuciosa
4. Use sub-agentes com papéis divididos para perspectivas diversas

## Solução de Problemas de Build

Se o build falhar:
1. Use o agent **build-error-resolver**
2. Analise as mensagens de erro
3. Corrija incrementalmente
4. Verifique após cada correção
