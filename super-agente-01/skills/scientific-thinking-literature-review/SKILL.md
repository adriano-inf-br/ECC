---
name: literature-review
description: Fluxo de trabalho sistemático de revisão de literatura para temas acadêmicos, biomédicos, técnicos e científicos, incluindo planejamento de busca, triagem de fontes, síntese, verificação de citações e registro de evidências.
metadata:
  origin: community
---

# Revisão de Literatura

Use esta skill quando a tarefa for encontrar, triar, sintetizar e citar um conjunto de
literatura acadêmica ou técnica.

## Quando Usar

- Construir uma revisão de literatura sistemática, de escopo ou narrativa.
- Sintetizar o estado da arte para uma questão de pesquisa.
- Encontrar lacunas, contradições ou direções para trabalhos futuros.
- Preparar seções de contextualização com citações para artigos ou relatórios.
- Comparar evidências entre artigos revisados por pares, preprints, patentes e
  relatórios técnicos.

## Tipos de Revisão

- **Revisão narrativa**: síntese ampla; útil para orientação.
- **Revisão de escopo**: mapeia conceitos, métodos e lacunas de evidências.
- **Revisão sistemática**: protocolo predefinido, busca reproduzível, triagem e exclusão explícitas.
- **Meta-análise**: revisão sistemática mais agregação quantitativa de efeitos.

Pergunte ao usuário qual nível de rigor é necessário. Se não especificado, use como padrão
uma revisão de escopo para trabalho exploratório e revisão sistemática para publicação ou
afirmações clínicas.

## Fluxo de Trabalho

### 1. Definir a Questão

Converta o prompt em uma questão de pesquisa pesquisável.

Para trabalhos clínicos ou biomédicos, use PICO:

- Population (População)
- Intervention or exposure (Intervenção ou exposição)
- Comparator (Comparador)
- Outcome (Desfecho)

Para trabalhos técnicos, use:

- sistema ou domínio
- método ou intervenção
- linha de base de comparação
- métrica de avaliação

### 2. Planejar a Busca

Crie um protocolo de busca antes de coletar fontes:

- bancos de dados a pesquisar
- intervalo de datas
- idiomas
- tipos de publicação
- critérios de inclusão
- critérios de exclusão
- strings de busca exatas

Conjunto mínimo útil de bancos de dados:

- PubMed para literatura biomédica e de ciências da vida.
- arXiv para CS, matemática, física, biologia quantitativa e preprints.
- Semantic Scholar ou Crossref para descoberta acadêmica ampla.
- Fontes específicas de domínio quando relevantes, como registros de ensaios clínicos,
  bancos de dados de patentes, órgãos normativos ou documentos técnicos oficiais.

### 3. Buscar e Registrar Evidências

Mantenha um log de busca que torne a revisão reproduzível:

```markdown
| Banco de Dados | Data da busca | Consulta | Filtros | Resultados | Exportação |
| --- | --- | --- | --- | ---: | --- |
| PubMed | 2026-05-11 | `("CRISPR"[tiab] OR "Cas9"[tiab]) AND "sickle cell"[tiab]` | 2020:2026, English | 86 | Lista de PMIDs |
| arXiv | 2026-05-11 | `CRISPR sickle cell gene editing` | q-bio, 2020:2026 | 9 | BibTeX |
```

Salve IDs brutos, URLs, DOIs, resumos e notas separadamente do texto final.

### 4. Deduplicar

Deduplique nesta ordem:

1. DOI
2. PMID ou ID arXiv
3. título exato
4. título normalizado mais primeiro autor e ano

Registre quantas duplicatas foram removidas.

### 5. Triar Fontes

Triagem em etapas:

1. título
2. resumo
3. texto completo

Para trabalhos sistemáticos, registre os motivos de exclusão:

- população incorreta
- intervenção incorreta
- desfecho incorreto
- não é pesquisa primária
- duplicata
- texto completo indisponível
- fora do intervalo de datas

### 6. Extrair Dados

Use uma tabela de extração estruturada:

```markdown
| Estudo | Desenho | População/Dados | Método | Comparador | Desfecho | Achado principal | Limitações |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Autor Ano | ECR/coorte/revisão/etc. | amostra ou corpus | método | linha de base | desfecho medido | resultado | ressalva |
```

Para artigos técnicos, inclua dataset, benchmark, métrica, linha de base e
notas de reprodutibilidade.

### 7. Sintetizar

Agrupe as evidências por tema em vez de resumir os artigos um por um.

Perspectivas úteis de síntese:

- evidências mais fortes
- evidências conflitantes
- fraquezas metodológicas
- limites de população ou dataset
- recência e replicação
- implicações práticas
- questões sem resposta

Separe as afirmações por confiança:

- **Alta confiança**: evidências replicadas e de alta qualidade entre fontes.
- **Confiança média**: plausível, mas limitado por amostra, método ou recência.
- **Baixa confiança**: preliminar, especulativo, de fonte única ou com medição fraca.

### 8. Verificar Citações

Antes de finalizar:

- verifique DOI, PMID, ID arXiv ou URL oficial
- confira nomes de autores e ano de publicação
- não cite um artigo por uma afirmação que ele não faça
- identifique preprints como preprints
- distinga revisões de evidências primárias

## Modelo de Saída

```markdown
# Revisão de Literatura: <Tema>

Gerado: <data>
Tipo de revisão: <narrativa | escopo | sistemática | meta-análise>
Janela de busca: <datas>
Bancos de dados: <lista>

## Questão de Pesquisa

## Estratégia de Busca

## Critérios de Inclusão e Exclusão

## Resumo das Evidências

## Síntese Temática

## Lacunas e Limitações

## Referências

## Log de Busca
```

## Armadilhas

- Não trate trechos de busca como evidência.
- Não misture preprints, revisões e estudos primários sem identificá-los.
- Não omita achados negativos ou conflitantes.
- Não reivindique rigor de revisão sistemática sem um protocolo reproduzível.
- Não use um único banco de dados para uma afirmação ampla, a menos que o escopo seja
  explicitamente limitado a esse banco de dados.
