---
name: scholar-evaluation
description: Avaliação estruturada de trabalhos acadêmicos para artigos, propostas, revisões de literatura, seções de métodos, qualidade de evidências, suporte de citações e feedback de escrita científica.
metadata:
  origin: community
---

# Avaliação Acadêmica

Use esta skill para avaliar trabalhos acadêmicos ou científicos com uma rubrica reproduzível.

## Quando Usar

- Revisar um artigo de pesquisa, proposta, capítulo de tese ou revisão de literatura.
- Verificar se as afirmações são suportadas por evidências citadas.
- Avaliar metodologia, desenho do estudo, análise ou limitações.
- Comparar dois ou mais artigos quanto à qualidade ou relevância.
- Produzir feedback estruturado para revisão.

## Escopo da Avaliação

Comece identificando o artefato:

- artigo de pesquisa empírica
- artigo teórico
- relatório técnico
- revisão de literatura sistemática ou narrativa
- proposta de pesquisa
- capítulo de tese ou dissertação
- resumo de conferência ou artigo curto

Em seguida, escolha o escopo:

- **abrangente**: todas as dimensões da rubrica
- **direcionado**: uma ou duas dimensões, como método ou citações
- **comparativo**: classificar múltiplos trabalhos com a mesma rubrica

## Rubrica

Pontue cada dimensão aplicável de 1 a 5:

- 5: excelente; claro, rigoroso e pronto para publicação
- 4: bom; pequenas melhorias necessárias
- 3: adequado; lacunas significativas, mas utilizável
- 2: fraco; revisão substancial necessária
- 1: insatisfatório; grandes problemas de validade ou clareza

Use `N/A` para dimensões que não se aplicam.

### 1. Problema e Questão de Pesquisa

- O problema é claro e específico?
- A contribuição é significativa?
- O escopo e as premissas são explícitos?
- A questão corresponde à contribuição reivindicada?

### 2. Literatura e Contexto

- O trabalho anterior relevante está coberto?
- O trabalho sintetiza em vez de apenas listar as fontes?
- As lacunas são identificadas com precisão?
- As fontes recentes e fundamentais estão equilibradas?

### 3. Metodologia

- O método responde à questão de pesquisa?
- As escolhas de design são justificadas?
- Variáveis, datasets, participantes ou materiais são descritos claramente?
- Outro pesquisador conseguiria reproduzir o trabalho?
- Restrições éticas e práticas são reconhecidas?

### 4. Dados e Evidências

- As fontes de dados são credíveis e adequadas?
- O tamanho da amostra ou a cobertura do corpus é adequada?
- As decisões de inclusão, exclusão e pré-processamento são documentadas?
- Dados ausentes e riscos de viés são discutidos?

### 5. Análise

- Os métodos estatísticos, qualitativos ou computacionais são apropriados?
- As linhas de base e controles são justos?
- Verificações de incerteza, sensibilidade ou robustez são incluídas quando necessário?
- Explicações alternativas são consideradas?

### 6. Resultados e Interpretação

- Os resultados são apresentados com clareza?
- As afirmações ficam dentro das evidências?
- Figuras, tabelas e métricas são compreensíveis?
- Resultados negativos ou nulos são tratados com honestidade?

### 7. Limitações e Ameaças à Validade

- As limitações são específicas em vez de genéricas?
- Riscos de validade interna, externa, de construto e de conclusão são abordados?
- O artigo distingue especulação de resultados demonstrados?

### 8. Escrita e Estrutura

- O argumento é fácil de seguir?
- As seções são organizadas em torno da questão de pesquisa?
- As definições e notações são claras?
- O tom é preciso e acadêmico?

### 9. Citações

- Os artigos citados suportam as afirmações a eles associadas?
- Fontes primárias são usadas sempre que possível?
- Revisões são identificadas como revisões?
- Preprints são identificados como preprints?
- Metadados e links das citações estão corretos?

## Processo de Revisão

1. Leia o resumo, introdução, figuras e conclusão para identificar a contribuição reivindicada.
2. Leia os métodos e resultados para verificar a qualidade das evidências.
3. Verifique as afirmações mais fortes em relação às fontes citadas.
4. Pontue cada dimensão aplicável.
5. Separe bloqueadores críticos de sugestões de revisão.
6. Encerre com edições concretas a serem feitas.

## Modelo de Saída

```markdown
# Avaliação Acadêmica: <Artefato>

## Avaliação Geral

- Pontuação geral: <1-5 ou N/A>
- Confiança: <alta | média | baixa>
- Resumo: <3-5 frases>

## Pontuações por Dimensão

| Dimensão | Pontuação | Evidência | Prioridade de revisão |
| --- | ---: | --- | --- |
| Problema e questão |  |  |  |
| Literatura e contexto |  |  |  |
| Metodologia |  |  |  |
| Dados e evidências |  |  |  |
| Análise |  |  |  |
| Resultados e interpretação |  |  |  |
| Limitações |  |  |  |
| Escrita e estrutura |  |  |  |
| Citações |  |  |  |

## Problemas Críticos

## Revisões Recomendadas

## Verificações de Evidência Necessárias
```

## Armadilhas

- Não use a pontuação como substituto para feedback concreto.
- Não penalize um artigo por omitir uma dimensão fora do seu escopo.
- Não trate contagem de citações, veículo de publicação ou reputação do autor como prova de qualidade.
- Não aceite afirmações sem suporte só porque aparecem no resumo.
