---
name: gget
description: Fluxo de trabalho com CLI e Python do gget para consultas rápidas em bancos de dados genômicos, busca de sequências, pesquisas no estilo BLAST, verificações de enriquecimento e logs reproduzíveis de evidências em bioinformática.
metadata:
  origin: community
---

# gget

Use esta skill quando uma tarefa precisar de consultas rápidas em bioinformática em bancos de dados
de referência genômica com a CLI ou pacote Python `gget`.

## Quando Usar

- Encontrar IDs Ensembl, metadados de genes, detalhes de transcritos ou sequências.
- Executar buscas rápidas BLAST ou BLAT sem construir um pipeline local completo.
- Buscar links de genomas de referência e anotações do Ensembl.
- Consultar módulos de estrutura de proteínas, vias, câncer, expressão ou associação de doenças
  por meio de uma única interface.
- Criar um log de evidências reproduzível de primeira passagem antes de avançar para ferramentas
  mais pesadas, como Biopython, Snakemake, Nextflow, BLAST+ ou clientes específicos de banco de dados.

Use um fluxo de trabalho dedicado em vez do `gget` quando a tarefa exigir interpretação clínica
regulada, pipelines de produção de alto throughput ou controle preciso sobre versões de banco de
dados e índices locais.

## Instalação

Use um ambiente Python limpo.

```bash
python -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install --upgrade gget
gget --help
```

Se `uv` estiver disponível:

```bash
uv venv
. .venv/bin/activate
uv pip install gget
```

Antes de confiar em um ambiente mais antigo, atualize o `gget` e verifique novamente a
documentação do módulo. Os bancos de dados consultados pelo `gget` mudam ao longo do tempo.

## Padrões Básicos

Formato CLI:

```bash
gget <module> [arguments] [options]
```

Formato Python:

```python
import gget

result = gget.search(["BRCA1"], species="human")
print(result)
```

Fluxo de trabalho comum:

1. Identifique a espécie, montagem, tipo de ID de gene e banco de dados necessários.
2. Verifique a documentação atual do módulo para argumentos.
3. Execute uma consulta pequena primeiro.
4. Salve a saída com um nome de arquivo explícito e data.
5. Registre o nome do módulo, versão, argumentos e premissas de banco de dados.

## Módulos Comuns

Use a documentação upstream atual para argumentos exatos. Estes módulos são escolhas
comuns de primeira passagem:

- `gget search`: encontrar IDs Ensembl a partir de termos de busca.
- `gget info`: recuperar metadados para IDs Ensembl, UniProt ou relacionados.
- `gget seq`: buscar sequências de nucleotídeos ou aminoácidos.
- `gget ref`: recuperar links de download de genomas de referência.
- `gget blast`: executar uma consulta BLAST rápida.
- `gget blat`: localizar uma sequência em montagens de genoma suportadas.
- `gget muscle`: executar alinhamento múltiplo de sequências.
- `gget diamond`: executar alinhamento local de sequências contra sequências de referência.
- `gget alphafold` e `gget pdb`: inspecionar referências de estrutura de proteínas.
- `gget enrichr`, `gget opentargets`, `gget archs4`, `gget bgee`, `gget cbio`,
  e `gget cosmic`: explorar dados de enriquecimento, alvo, expressão, câncer e associação de doenças.

Não presuma que todo módulo suporta toda versão Python ou conjunto de dependências.
Algumas dependências científicas opcionais têm suporte de versão mais restrito do que o
pacote principal.

## Exemplos Rápidos

Encontrar genes:

```bash
gget search -s human brca1 dna repair -o brca1-search.json
```

Buscar metadados de genes:

```bash
gget info ENSG00000012048 -o brca1-info.json
```

Buscar uma sequência:

```bash
gget seq ENSG00000012048 -o brca1-seq.fa
```

Executar uma consulta BLAST pequena:

```bash
gget blast "MEEPQSDPSVEPPLSQETFSDLWKLLPEN" -l 10 -o blast-results.json
```

Exemplo Python:

```python
import gget

genes = gget.search(["BRCA1", "DNA repair"], species="human")
info = gget.info(["ENSG00000012048"])
sequence = gget.seq("ENSG00000012048")
```

## Log de Reprodutibilidade

Para saídas científicas, inclua metadados suficientes para reproduzir a consulta.

```markdown
| Data | Versão gget | Módulo | Consulta | Espécie/montagem | Saída | Notas |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-05-11 | `gget --version` | search | `BRCA1 DNA repair` | human | `brca1-search.json` | Docs verificados antes da execução |
```

Registre também:

- Versão Python e gerenciador de ambiente.
- Qualquer dependência opcional instalada via `gget setup`.
- Identificadores específicos de banco de dados retornados pela consulta.
- Se a saída é JSON, CSV, FASTA ou uma exportação de DataFrame.
- Qualquer falha resolvida com a atualização do `gget`.

## Lista de Verificação da Revisão

- Você atualizou ou verificou a versão instalada do `gget`?
- Você consultou a documentação upstream atual do módulo antes de usar os argumentos?
- A espécie ou montagem é explícita?
- Os identificadores são preservados exatamente, incluindo prefixos Ensembl/UniProt?
- O resultado está identificado como saída de banco de dados e não como interpretação clínica?
- A consulta é reproduzível a partir do comando salvo ou do trecho Python?
- As dependências opcionais estão instaladas em um ambiente isolado?

## Referências

- [Documentação do gget](https://pachterlab.github.io/gget/)
- [Atualizações do gget](https://pachterlab.github.io/gget/en/updates.html)
- [Repositório GitHub do gget](https://github.com/pachterlab/gget)
- [Artigo do gget na Bioinformatics](https://doi.org/10.1093/bioinformatics/btac836)
