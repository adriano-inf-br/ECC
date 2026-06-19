---
name: uspto-database
description: Fluxo de trabalho para dados de patentes e marcas do USPTO, incluindo consulta de registros oficiais, buscas no PatentSearch, verificações no TSDR, dados de cessão e logs reproduzíveis de pesquisa de propriedade intelectual.
metadata:
  origin: community
---

# Banco de Dados USPTO

Use esta skill quando uma tarefa precisar de registros oficiais de patentes ou marcas
dos Estados Unidos nos sistemas do USPTO.

## Quando Usar

- Pesquisar patentes concedidas ou publicações de pré-concessão.
- Verificar o status de pedidos de patente, dados do file wrapper, cessões ou
  histórico de prosecutação público.
- Consultar status de marca, documentos ou histórico de cessão.
- Construir logs reproduzíveis de pesquisa de prior art, portfólio ou panorama de PI.
- Comparar registros do USPTO com ferramentas secundárias como Google Patents,
  Lens.org, Semantic Scholar ou páginas de patentes de empresas.

Não use esta skill para dar pareceres jurídicos. Trate-a como um fluxo de trabalho de
coleta de dados e verificação de registros.

## Seleção de Fonte

Prefira as superfícies oficiais do USPTO ou com suporte do USPTO em primeiro lugar:

- Open Data Portal (ODP): residência atual de datasets e APIs migrados do USPTO.
- Patent File Wrapper: dados bibliográficos públicos de pedidos de patente e registros do file wrapper.
- PatentSearch API: API de busca PatentsView para patentes concedidas e datasets de publicações de pré-concessão.
- TSDR Data API: recuperação de status e documentos de marcas.
- Patent and Trademark Assignment Search: registros de transferência de titularidade.
- Dados do PTAB no ODP: procedimentos do Patent Trial and Appeal Board.

Use fontes secundárias apenas como índices de conveniência. Quando a resposta for relevante,
confirme com o registro oficial.

## Autenticação e Segredos

Muitos fluxos de API do USPTO exigem uma chave de API. Armazene as chaves em variáveis de
ambiente ou em um gerenciador de segredos, nunca em arquivos versionados ou transcrições coladas.

Nomes de ambiente comuns:

```bash
export USPTO_API_KEY="..."
export PATENTSVIEW_API_KEY="..."
```

Para PatentSearch, envie a chave com o cabeçalho `X-Api-Key`. Para TSDR, siga as instruções
atuais do USPTO API Manager e as orientações de limite de taxa.

## Fluxo de Trabalho do PatentSearch

Use PatentSearch para busca ampla de patentes e publicações de pré-concessão quando a
questão envolver tendências, inventores, cessionários, classificações, datas ou fatias de portfólio.

Fluxo de trabalho:

1. Identifique o endpoint na referência atual do PatentSearch ou na Swagger UI.
2. Construa uma consulta JSON com filtros explícitos.
3. Solicite apenas os campos necessários para a análise.
4. Ordene e pagine de forma determinística.
5. Registre o endpoint, o corpo da consulta, a data, a nota de atualidade dos dados e a contagem de resultados.

Esqueleto de requisição Python:

```python
import os
import requests

API_KEY = os.environ["PATENTSVIEW_API_KEY"]
BASE = "https://search.patentsview.org/api/v1"

payload = {
    "q": {
        "_and": [
            {"patent_date": {"_gte": "2024-01-01"}},
            {"assignees.assignee_organization": {"_text_any": ["Google", "Alphabet"]}},
        ]
    },
    "f": ["patent_id", "patent_title", "patent_date"],
    "s": [{"patent_date": "desc"}],
    "o": {"per_page": 100, "page": 1},
}

response = requests.post(
    f"{BASE}/patent/",
    headers={"X-Api-Key": API_KEY, "Content-Type": "application/json"},
    json=payload,
    timeout=30,
)
response.raise_for_status()
print(response.json())
```

Antes de reutilizar uma consulta, verifique os nomes de endpoints atuais, caminhos de campo,
parâmetros de requisição e disponibilidade de chave de API na documentação ativa do PatentSearch.

## Fluxo de Trabalho de Marcas/TSDR

Use TSDR quando a tarefa precisar de status de caso de marca, documentos, imagens, histórico
de proprietário ou eventos de prosecutação.

Fluxo de trabalho:

1. Normalize o número de série ou número de registro.
2. Verifique as instruções atuais da API TSDR e o cabeçalho de chave de API obrigatório.
3. Busque o status primeiro e, em seguida, os documentos somente se necessário.
4. Respeite o limite de taxa mais baixo para downloads de PDF, ZIP e múltiplos casos.
5. Capture a data de recuperação e o identificador de série/registro na saída.

Para grandes volumes de marcas, prefira fluxos de dados em lote documentados em vez de
scraping de páginas públicas.

## File Wrapper e Histórico de Prosecutação

Para status de pedido, histórico de transações e documentos de prosecutação:

- Comece com a busca no ODP Patent File Wrapper.
- Use identificadores exatos quando disponíveis: número de pedido, número de publicação,
  número de patente ou nome da parte.
- Registre se o registro é uma patente concedida, publicação de pré-concessão ou pedido pendente.
- Confirme datas e status dos documentos na página de detalhe do registro antes de citá-los.

## Fluxo de Trabalho de Cessão

Para titularidade de patentes ou marcas:

1. Pesquise dados oficiais de cessão por número de patente/pedido/registro,
   cedente, cessionário ou reel/frame quando disponível.
2. Registre o texto de conveyance, data de execução, data de registro e partes.
3. Distinga registros de cessão de conclusões sobre titularidade legal atual.
4. Se a titularidade for relevante, sinalize o resultado para revisão por advogado ou especialista.

## Saída Reproduzível

Cada passagem de pesquisa USPTO deve incluir uma tabela de log:

```markdown
| Fonte | Data da busca | Identificador/consulta | Filtros | Resultados | Notas |
| --- | --- | --- | --- | ---: | --- |
| PatentSearch | 2026-05-11 | `assignee=Alphabet AND date>=2024` | endpoint de patente | 118 | Docs da API verificados antes da execução |
| TSDR | 2026-05-11 | `serial=90000000` | somente status | 1 | Fluxo de chave de API, sem download em lote de documentos |
```

Para trabalhos finais, separe:

- fatos de registros oficiais
- análise inferida
- correspondências de conveniência de fontes secundárias
- lacunas não resolvidas ou registros que requerem revisão jurídica

## Lista de Verificação da Revisão

- Você usou uma fonte oficial do USPTO ou com suporte do USPTO em primeiro lugar?
- Você verificou os nomes de endpoints e campos atuais antes de executar o código?
- As chaves de API estão fora de arquivos, histórico de shell e logs de saída?
- O log de consulta inclui a data pesquisada e o formato exato da requisição?
- Os limites de taxa são respeitados?
- Conclusões jurídicas são evitadas ou explicitamente escaladas?
- As fontes secundárias estão identificadas como secundárias?

## Referências

- [Catálogo de APIs do USPTO](https://developer.uspto.gov/api-catalog)
- [Open Data Portal do USPTO](https://data.uspto.gov/)
- [Referência da API PatentSearch](https://search.patentsview.org/docs/docs/Search%20API/SearchAPIReference/)
- [Atualizações da API PatentSearch](https://search.patentsview.org/docs/)
- [FAQ de download em lote da API TSDR](https://developer.uspto.gov/faq/tsdr-api-bulk-download)
