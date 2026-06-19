---
name: recsys-pipeline-architect
description: Projete pipelines composáveis de recomendação, ranking e feed usando o framework de seis estágios Source→Hydrator→Filter→Scorer→Selector→SideEffect popularizado pelo algoritmo For You de código aberto da xAI. Use esta skill sempre que o usuário estiver construindo qualquer sistema que escolha "os K melhores itens para um (usuário, contexto)" — feeds sociais, CMSs de conteúdo, rerankers RAG, priorizadores de tarefas, triagem de notificações, reranking de busca, ranking de anúncios.
metadata:
  origin: community
---

# recsys-pipeline-architect

Uma skill de especificação e scaffold para construir pipelines composáveis de recomendação, ranking e feed. Ela codifica o **padrão de seis estágios** — Source → Hydrator → Filter → Scorer → Selector → SideEffect — popularizado pelo [algoritmo For You](https://github.com/xai-org/x-algorithm) de código aberto da xAI (Apache 2.0). Esta skill é uma reimplementação independente do padrão (MIT) — nenhum código foi copiado do original.

Upstream: <https://github.com/mturac/recsys-pipeline-architect>

## Quando Usar

- O usuário quer construir qualquer sistema que escolha "os K melhores itens para um usuário/contexto"
- O usuário pergunta "como devo ranquear X" ou descreve um problema de feed/personalização
- O usuário tem uma função de pontuação e precisa do encanamento do pipeline ao redor dela
- O usuário quer migrar de um único score de relevância para previsão de múltiplas ações com pesos ajustáveis
- O usuário está envolvendo um scorer LLM/ML e precisa de filtros, hydrators, efeitos colaterais e um scaffold executável em sua stack (TypeScript / Go / Python)
- Gatilhos: "sistema de recomendação", "algoritmo de feed", "pipeline de ranking", "feed for you", "pipeline de candidatos", "recomendador de conteúdo", "arquitetura de pipeline para recsys", "reranker de recuperação RAG"

## Quando NÃO Usar

- Trabalho de arquitetura de modelo (design de transformer, recuperação two-tower, treinamento de embedding) — esta skill é o encanamento *ao redor* do modelo, não o modelo em si
- Pipelines de treinamento ML puros — a função de pontuação é responsabilidade do usuário
- Operar um pipeline implantado (monitoramento, autoscaling) — fora do escopo

## O framework de seis estágios

| # | Estágio | Função | Paralelo? |
|---|---|---|---|
| 1 | **Source** | Busca candidatos de uma ou mais origens | Sim — múltiplas sources executam em paralelo |
| 2 | **Hydrator** | Enriquece cada candidato com metadados necessários para filtragem e pontuação | Sim — hydrators independentes executam em paralelo |
| 3 | **Filter** | Descarta candidatos que nunca devem ser exibidos (bloqueados, expirados, duplicados, inelegíveis) | Sequencial — cada filtro vê menos itens |
| 4 | **Scorer** | Atribui a cada candidato sobrevivente uma ou mais pontuações | Sequencial — scorers posteriores veem pontuações anteriores |
| 5 | **Selector** | Ordena por pontuação final, retorna os K melhores | Operação única |
| 6 | **SideEffect** | Armazena IDs servidos em cache, registra impressões, emite eventos, atualiza contadores | Assíncrono — nunca deve bloquear a resposta |

### Por que essa ordem exata

- Sources antes da hidratação: saiba quais candidatos existem antes de pagar para enriquecê-los
- Hidratação antes da filtragem: muitos filtros precisam de metadados que a source não forneceu
- Filtragem antes da pontuação: a pontuação é o estágio custoso; descarte os inelegíveis primeiro
- Cadeia de Scorer (não um único scorer): sistemas reais compõem pontuação ML + reranking de diversidade + regras de negócio
- Selector após pontuação: mantém a pontuação determinística e cacheável
- SideEffects por último e assíncronos: efeitos colaterais nunca devem bloquear a resposta do usuário

## Fluxo de Trabalho quando invocado

Guie o usuário através destes oito passos:

1. **Esclareça o caso de uso** (uma rodada, três perguntas): itens sendo ranqueados? contexto de entrada? linguagem/runtime?
2. **Identifique as sources de candidatos**: geralmente in-network (seguidos/próprios/assinados) + out-of-network (recuperação ML / tendência / similar-ao-curtido)
3. **Liste as hidratações necessárias**: para cada filtro e scorer, quais dados ele precisa que a source não forneceu?
4. **Liste os filtros**: duplicado, próprio, idade, bloqueio/mudo, previamente servido, elegibilidade. A ordem importa — barato antes de caro.
5. **Projete a cadeia de scorer**: primário (ML) → combinador (multi-ação com pesos) → diversidade → regras de negócio
6. **Selector**: ordene decrescentemente pela pontuação final, pegue os K melhores (ou mix estratificado para in-network/out-of-network)
7. **SideEffects**: armazene IDs servidos em cache, emita eventos de impressão, atualize contadores, registre analytics — tudo fire-and-forget
8. **Gere o scaffold** na stack do usuário

## Trade-offs principais a apresentar (não silencie os padrões)

### 1. Score único vs previsão multi-ação

- **Score único**: treine um modelo para prever relevância. Para mudar o comportamento → retreine.
- **Multi-ação**: preveja `P(ação)` para muitas ações (ler, curtir, compartilhar, pular, reportar), combine com pesos no momento de servir. Para mudar o comportamento → mude os pesos. Sem retreinamento.

O sistema X For You usa multi-ação com pesos positivos e negativos. Recomende multi-ação quando o usuário espera ajustar frequentemente.

### 2. Isolamento de candidatos na pontuação

- **Isolado**: cada candidato pontuado independentemente. Determinístico, cacheável.
- **Conjunto**: candidatos atendem uns aos outros durante a pontuação (ex.: transformer sobre lote). Mais expressivo, mas não determinístico entre lotes.

Padrão: isolamento. Conjunto apenas quando há um motivo específico (ex.: diversidade explícita com consciência de lote).

### 3. Online vs offline

- **Tempo de requisição (online)**: o pipeline executa em cada requisição. Orçamento de latência: 100–300ms. Padrão.
- **Pré-computado (batch offline)**: o pipeline executa periodicamente, resultados em cache. Menor latência, menor frescor.
- **Híbrido**: recuperação de candidatos offline, ranking online.

## Regras rígidas

1. **Não invente números de benchmark.** "Quanto mais rápido?" → "depende da carga de trabalho, execute você mesmo."
2. **Disciplina de atribuição.** Quando o padrão for referenciado, atribua como "popularizado pelo algoritmo For You de código aberto da xAI" / `github.com/xai-org/x-algorithm` (Apache 2.0).
3. **Sem uso de marca registrada.** Não nomeie o artefato do usuário como "parecido com X" nem use a marca "For You". O padrão é livre; a marca não é. Nomenclatura sugerida: "pipeline de candidatos", "pipeline de feed", "pipeline de ranking", "pipeline recsys".
4. **Apresente os trade-offs.** Multi-ação vs único, isolamento vs conjunto, online vs offline — nunca silencie os padrões.
5. **O scaffold gerado deve executar.** Sem pseudocódigo passando como código.
6. **A ordem dos filtros importa.** Barato antes de caro. Universal antes de específico por usuário.
7. **Efeitos colaterais nunca bloqueiam.** Envolva em padrões fire-and-forget (goroutines / promises sem await / tasks asyncio).

## Anti-Padrões

- Pontuação antes da filtragem (desperdiça computação em candidatos que serão descartados de qualquer forma)
- Efeitos colaterais síncronos (escritas em cache / emissões de impressão bloqueando a resposta)
- Um único score de "relevância" quando o produto precisa ajustar para múltiplos objetivos (engajamento vs segurança vs diversidade vs anúncios)
- Pontuação conjunta como padrão (não determinística, mais difícil de cachear, não compõe com estágios de reranking)
- Gerar pseudocódigo "para ilustração" — o scaffold deve realmente executar

## Conteúdo Upstream

O repositório upstream em <https://github.com/mturac/recsys-pipeline-architect> inclui:

- `SKILL.md` completo com o fluxo de trabalho completo de 8 passos
- 5 documentos de referência carregáveis por demanda: interfaces em 4 linguagens (TS/Go/Python/Rust), padrão de pontuação multi-ação, isolamento de candidatos, cookbook de filtros (12 padrões), cookbook de scorer (soma ponderada, MMR, penalidade de diversidade, desvio de posição)
- 3 scaffolds de exemplo executáveis, todos verdes em suas suítes de teste:
  - Plugin Strapi v5 (TypeScript / Jest — 3/3 passam)
  - Pipeline compatível com Zentra (Go com generics — 3/3 passam)
  - Priorizador de tarefas PMAI (Python / FastAPI / pytest — 3/3 passam)
- Release v0.1.0 tagueada
- Licença MIT; padrão atribuído ao algoritmo X For You da xAI (Apache 2.0)

Instale via skills.sh: `npx skills add mturac/recsys-pipeline-architect`
