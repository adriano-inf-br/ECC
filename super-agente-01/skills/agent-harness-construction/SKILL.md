---
name: agent-harness-construction
description: Projete e otimize espaços de ação, definições de tools e formatação de observações de agents de IA para taxas de conclusão mais altas.
metadata:
  origin: ECC
---

# Construção de Harness de Agent

Use esta skill quando estiver melhorando como um agent planeja, chama tools, se recupera de erros e converge para a conclusão.

## Modelo Central

A qualidade da saída do agent é limitada por:
1. Qualidade do espaço de ação
2. Qualidade da observação
3. Qualidade da recuperação
4. Qualidade do orçamento de contexto

## Design do Espaço de Ação

1. Use nomes de tool estáveis e explícitos.
2. Mantenha as entradas schema-first e estreitas.
3. Retorne formatos de saída determinísticos.
4. Evite tools genéricas (catch-all) a menos que o isolamento seja impossível.

## Regras de Granularidade

- Use micro-tools para operações de alto risco (deploy, migração, permissões).
- Use tools médias para loops comuns de edição/leitura/busca.
- Use macro-tools apenas quando o overhead de round-trip for o custo dominante.

## Design de Observação

Toda resposta de tool deve incluir:
- `status`: success|warning|error
- `summary`: resultado em uma linha
- `next_actions`: ações de acompanhamento acionáveis
- `artifacts`: caminhos de arquivo / IDs

## Contrato de Recuperação de Erros

Para todo caminho de erro, inclua:
- dica de causa raiz
- instrução de retry segura
- condição de parada explícita

## Orçamento de Contexto

1. Mantenha o system prompt mínimo e invariante.
2. Mova orientações extensas para skills carregadas sob demanda.
3. Prefira referências a arquivos em vez de embutir documentos longos.
4. Compacte nos limites de fase, não em limiares arbitrários de tokens.

## Orientação de Padrões de Arquitetura

- ReAct: melhor para tarefas exploratórias com caminho incerto.
- Function-calling: melhor para fluxos determinísticos estruturados.
- Híbrido (recomendado): planejamento ReAct + execução de tool tipada.

## Benchmarking

Acompanhe:
- taxa de conclusão
- retries por tarefa
- pass@1 e pass@3
- custo por tarefa bem-sucedida

## Anti-Padrões

- Tools demais com semânticas sobrepostas.
- Saída de tool opaca sem dicas de recuperação.
- Saída apenas de erro sem próximos passos.
- Sobrecarga de contexto com referências irrelevantes.
