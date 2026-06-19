---
name: pubmed-database
description: Fluxos de trabalho de busca direta no PubMed e nos E-utilities do NCBI para literatura biomédica, consultas MeSH, busca por PMID, recuperação de citações e monitoramento de literatura com suporte de API.
metadata:
  origin: community
---

# Banco de Dados PubMed

Use esta skill quando uma tarefa precisar de literatura biomédica do PubMed em vez de
busca geral na web.

## Quando Usar

- Pesquisar MEDLINE ou literatura de ciências da vida.
- Construir consultas no PubMed com termos MeSH, tags de campo, datas ou tipos de artigo.
- Buscar PMIDs, resumos, metadados de publicação ou citações relacionadas.
- Executar passagens de busca para revisões sistemáticas que precisem de strings de busca reproduzíveis.
- Usar os E-utilities do NCBI diretamente em Python, shell ou outro cliente HTTP.

## Construção de Consultas

Comece com a questão de pesquisa, divida-a em conceitos e combine os conceitos
com operadores booleanos.

```text
concept_1 AND concept_2 AND filter
synonym_a OR synonym_b
NOT exclusion_term
```

Tags de campo úteis do PubMed:

- `[ti]`: título
- `[ab]`: resumo
- `[tiab]`: título ou resumo
- `[au]`: autor
- `[ta]`: abreviação do título do periódico
- `[mh]`: termo MeSH
- `[majr]`: tópico MeSH principal
- `[pt]`: tipo de publicação
- `[dp]`: data de publicação
- `[la]`: idioma

Exemplos:

```text
diabetes mellitus[mh] AND treatment[tiab] AND systematic review[pt] AND 2023:2026[dp]
(metformin[nm] OR insulin[nm]) AND diabetes mellitus, type 2[mh] AND randomized controlled trial[pt]
smith ja[au] AND cancer[tiab] AND 2026[dp] AND english[la]
```

## MeSH e Subcabeçalhos

Prefira MeSH quando o conceito tiver um termo estável em vocabulário controlado. Combine
MeSH com termos de título/resumo quando o tema for novo ou a terminologia variar.

A sintaxe correta de subcabeçalho coloca o subcabeçalho antes da tag de campo:

```text
diabetes mellitus, type 2/drug therapy[mh]
cardiovascular diseases/prevention & control[mh]
```

Use `[majr]` somente quando o tema deve ser central no artigo. Isso pode melhorar a
precisão, mas pode deixar passar trabalhos relevantes.

## Filtros

Tipos de publicação:

- `clinical trial[pt]`
- `meta-analysis[pt]`
- `randomized controlled trial[pt]`
- `review[pt]`
- `systematic review[pt]`
- `guideline[pt]`

Filtros de data:

```text
2026[dp]
2020:2026[dp]
2026/03/15[dp]
```

Filtros de disponibilidade:

```text
free full text[sb]
hasabstract[text]
```

## Fluxo de Trabalho com E-utilities

Os E-utilities do NCBI suportam fluxos de trabalho de API reproduzíveis:

1. `esearch.fcgi`: busca e retorna PMIDs.
2. `esummary.fcgi`: retorna metadados leves de artigos.
3. `efetch.fcgi`: busca resumos ou registros completos em XML, MEDLINE ou texto.
4. `elink.fcgi`: encontra artigos relacionados e recursos vinculados.

Use um e-mail e chave de API para scripts em produção. Armazene chaves de API em variáveis
de ambiente, nunca em arquivos versionados ou no histórico de comandos.

```python
import os
import time
import requests

BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"


def esearch(query: str, retmax: int = 20) -> list[str]:
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": retmax,
        "tool": "ecc-pubmed-search",
        "email": os.environ.get("NCBI_EMAIL", ""),
    }
    api_key = os.environ.get("NCBI_API_KEY")
    if api_key:
        params["api_key"] = api_key

    response = requests.get(f"{BASE}/esearch.fcgi", params=params, timeout=30)
    response.raise_for_status()
    time.sleep(0.35)
    return response.json()["esearchresult"]["idlist"]


pmids = esearch("hypertension[mh] AND randomized controlled trial[pt] AND 2024:2026[dp]")
print(pmids)
```

Para lotes, prefira os parâmetros do servidor de histórico do NCBI (`usehistory=y`,
`WebEnv`, `query_key`) em vez de passar listas muito longas de PMIDs pelas URLs.

## Disciplina de Saída

Para cada passagem de busca, registre:

- string de busca exata
- banco de dados pesquisado
- data da busca
- filtros utilizados
- contagem de resultados
- formato de exportação
- quaisquer exclusões manuais

Exemplo:

```markdown
| Banco de Dados | Data da busca | Consulta | Filtros | Resultados |
| --- | --- | --- | --- | ---: |
| PubMed | 2026-05-11 | `sickle cell disease[mh] AND CRISPR[tiab]` | 2020:2026[dp], English | 42 |
```

## Lista de Verificação da Revisão

- As tags de campo são tags válidas do PubMed?
- Os termos MeSH estão combinados com sinônimos de texto livre para temas mais recentes?
- O intervalo de datas é explícito e apropriado?
- O log de busca contém detalhes suficientes para reproduzir a consulta?
- As chaves de API são carregadas do ambiente?
- O código HTTP chama `raise_for_status()` ou trata respostas não-200 antes de fazer o parsing?
- Os limites de taxa são respeitados?

## Referências

- [Ajuda do PubMed](https://pubmed.ncbi.nlm.nih.gov/help/)
- [Documentação dos E-utilities do NCBI](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- [Orientações sobre chave de API do NCBI](https://support.nlm.nih.gov/kbArticle/?pn=KA-05317)
- Suporte NCBI: <eutilities@ncbi.nlm.nih.gov>
