---
name: mle-workflow
description: Fluxo de trabalho de engenharia de machine learning para produção, abrangendo data contracts, treinamento reproduzível, avaliação de modelos, deployment, monitoramento e rollback. Use ao construir, revisar ou endurecer sistemas de ML que vão além de notebooks pontuais.
metadata:
  origin: ECC
---

# Machine Learning Engineering Workflow

Use esta skill para transformar trabalho de modelos em um sistema de ML de produção com data contracts claros, treinamento repetível, portões de qualidade mensuráveis, artefatos implantáveis e monitoramento operacional.

## When to Activate

- Planejar ou revisar uma feature de ML de produção, atualização de modelo, sistema de ranking, recomendador, classificador, fluxo de trabalho de embeddings ou pipeline de previsão
- Converter código de notebook em um pipeline reutilizável de treinamento, avaliação, inferência em lote ou inferência online
- Projetar critérios de promoção de modelos, avaliações offline/online, rastreamento de experimentos ou caminhos de rollback
- Depurar falhas causadas por data drift, vazamento de labels, features desatualizadas, incompatibilidade de artefatos ou lógica inconsistente entre treinamento e serving
- Adicionar monitoramento de modelos, rollout canário, tráfego sombra (shadow traffic) ou verificações de qualidade pós-deploy

## Scope Calibration

Use apenas as faixas que se ajustam ao sistema à sua frente. Esta skill é útil para ranking, busca, recomendações, classificadores, previsão, embeddings, fluxos de trabalho de LLM, detecção de anomalias e análise em lote, mas não deve forçar uma única arquitetura sobre todos eles.

- Não presuma que todo modelo tem labels supervisionadas, serving online, um feature store, PyTorch, GPUs, revisão humana, testes A/B ou feedback em tempo real.
- Não adicione maquinário pesado de MLOps quando um data contract, baseline, script de avaliação e nota de rollback tornariam a mudança revisável.
- Torne as suposições explícitas quando o projeto carecer de labels, resultados atrasados, definições de fatias (slices), tráfego de produção ou responsabilidade pelo monitoramento.
- Trate os exemplos como andaimes intercambiáveis. Substitua métricas, modo de serving, repositórios de dados e mecânica de rollout pelos equivalentes nativos do projeto.

## Related Skills

- `python-patterns` e `python-testing` para implementação em Python e cobertura com pytest
- `pytorch-patterns` para modelos de deep learning, data loaders, manuseio de dispositivos e loops de treinamento
- `eval-harness` e `ai-regression-testing` para portões de promoção e verificações de regressão assistidas por agent
- `database-migrations`, `postgres-patterns` e `clickhouse-io` para armazenamento de dados e superfícies de análise
- `deployment-patterns`, `docker-patterns` e `security-review` para serving, segredos, contêineres e endurecimento de produção

## Reuse the SWE Surface

Não trate a MLE como algo separado da engenharia de software. A maioria dos fluxos de trabalho de SWE do ECC se aplica diretamente a sistemas de ML, frequentemente com modos de falha mais rigorosos:

A instalação recomendada `minimal --with capability:machine-learning` mantém a superfície central do agent disponível junto com esta skill. Para harnesses somente de skill ou com agents limitados, combine `skill:mle-workflow` com `agent:mle-reviewer` onde o alvo suportar agents.

| Superfície de SWE | Uso na MLE |
|-------------|---------|
| `product-capability` / `architecture-decision-records` | Transformar trabalho de modelos em contratos de produto explícitos e registrar escolhas irreversíveis de dados, modelo e rollout |
| `repo-scan` / `codebase-onboarding` / `code-tour` | Encontrar caminhos existentes de treinamento, feature, serving, avaliação e monitoramento antes de introduzir uma pilha de ML paralela |
| `plan` / `feature-dev` | Delimitar mudanças de modelo como capacidades de produto com fases de dados, avaliação, serving e rollback |
| `tdd-workflow` / `python-testing` | Testar transformações de features, lógica de divisão, cálculos de métricas, carregamento de artefatos e schemas de inferência antes da implementação |
| `code-reviewer` / `mle-reviewer` | Revisar a qualidade do código além de riscos específicos de ML como vazamento, reprodutibilidade, promoção e monitoramento |
| `build-fix` / `pr-test-analyzer` | Diagnosticar CI quebrado, avaliações instáveis (flaky), fixtures ausentes e falhas de modelo ou dependência específicas do ambiente |
| `quality-gate` / `test-coverage` | Exigir evidência automatizada para transformações, métricas, contratos de inferência, portões de promoção e comportamento de rollback |
| `eval-harness` / `verification-loop` | Transformar métricas offline, verificações de fatias, orçamentos de latência e simulações de rollback em portões repetíveis |
| `ai-regression-testing` | Preservar cada bug de produção como uma regressão: feature ausente, label desatualizada, artefato ruim, drift de schema ou incompatibilidade de serving |
| `api-design` / `backend-patterns` | Projetar APIs de previsão, jobs em lote, endpoints de retreinamento idempotentes e envelopes de resposta |
| `database-migrations` / `postgres-patterns` / `clickhouse-io` | Versionar labels, snapshots de features, logs de previsão, métricas de experimentos e análises de drift |
| `deployment-patterns` / `docker-patterns` | Empacotar imagens reproduzíveis de treinamento e serving com health checks, limites de recursos e rollback |
| `canary-watch` / `dashboard-builder` | Tornar a saúde do rollout visível com dashboards de versão de modelo, fatia, drift, latência, custo e labels atrasadas |
| `security-review` / `security-scan` | Verificar artefatos de modelo, notebooks, prompts, datasets e logs em busca de segredos, PII, desserialização insegura e risco na cadeia de suprimentos |
| `e2e-testing` / `browser-qa` / `accessibility` | Testar fluxos de produto críticos que consomem previsões, incluindo explicabilidade e estados de UI de fallback |
| `benchmark` / `performance-optimizer` | Medir throughput, latência p95, memória, utilização de GPU e custo por previsão ou retreinamento |
| `cost-aware-llm-pipeline` / `token-budget-advisor` | Rotear cargas de trabalho de LLM/embedding por qualidade, latência e orçamento em vez de recorrer por padrão ao maior modelo |
| `documentation-lookup` / `search-first` | Verificar o comportamento atual de bibliotecas para serving de modelos, feature stores, bancos vetoriais e ferramentas de avaliação antes de codificar |
| `git-workflow` / `github-ops` / `opensource-pipeline` | Empacotar mudanças de MLE para revisão com escopo nítido, artefatos gerados excluídos e evidência de teste reproduzível |
| `strategic-compact` / `dmux-workflows` | Dividir trabalho longo de ML em trilhas paralelas: data contract, eval harness, caminho de serving, monitoramento e documentação |

## Ten MLE Task Simulations

Use estas simulações como verificações de cobertura ao planejar ou revisar trabalho de MLE. Um fluxo de trabalho de MLE forte deve reduzir cada tarefa a contratos explícitos, superfícies de SWE reutilizáveis, evidência automatizada e um artefato revisável.

| ID | Tarefa comum de MLE | Caminho ECC simplificado | Saída obrigatória | Faixas do pipeline cobertas |
|----|-----------------|----------------------|-----------------|------------------------|
| MLE-01 | Enquadrar uma capacidade ambígua de previsão, ranking, recomendação, classificação, embedding ou previsão | `product-capability`, `plan`, `architecture-decision-records`, `mle-workflow` | Iteration Compact nomeando quem se importa, dono da decisão, métrica de sucesso, erros inaceitáveis, suposições, restrições e primeiro experimento | contrato de produto, perda do stakeholder, risco, rollout |
| MLE-02 | Definir metas de métrica, labels, fontes de dados e o orçamento de erros | `repo-scan`, `database-reviewer`, `database-migrations`, `postgres-patterns`, `clickhouse-io` | Contrato de dados e métrica com granularidade de entidade, timing de label, confiança de label, timing de feature, joins point-in-time, política de divisão e snapshot do dataset | data contract, design de métrica, vazamento, reprodutibilidade |
| MLE-03 | Construir um modelo baseline e um caminho de pontuação antes de adicionar complexidade | `tdd-workflow`, `python-testing`, `python-patterns`, `code-reviewer` | Pontuador baseline com matriz de confusão, notas de calibração, estimativa de latência/custo, fraquezas conhecidas e testes para o shape do score e determinismo | baseline, pontuação, testes, paridade de serving |
| MLE-04 | Gerar features a partir de hipóteses sobre o que separa os resultados | `python-patterns`, `pytorch-patterns`, `docker-patterns`, `deployment-patterns` | Plano de features e módulo de transformação cobrindo fonte de sinal, valores ausentes, outliers, correlações, verificações de vazamento e equivalência treino/serve | pipeline de features, vazamento, treinamento, artefatos |
| MLE-05 | Ajustar thresholds, configs e complexidade do modelo sob tradeoffs | `eval-harness`, `ai-regression-testing`, `quality-gate`, `test-coverage` | Relatório de threshold/config comparando precisão, recall, F1, AUC, calibração, fatias de grupo, latência, custo, complexidade e classes de erro aceitáveis | avaliação, threshold, promoção, regressão |
| MLE-06 | Executar análise de erros e transformar erros no próximo experimento | `eval-harness`, `ai-regression-testing`, `mle-reviewer`, `silent-failure-hunter` | Relatório de cluster de erros para falsos positivos, falsos negativos, labels ambíguas, features desatualizadas, sinais ausentes e rastros de bugs com lições capturadas | análise de erros, rastro de bug, iteração, regressão |
| MLE-07 | Empacotar um artefato de modelo para inferência em lote ou online | `api-design`, `backend-patterns`, `security-review`, `security-scan` | Pacote de artefato versionado com pré-processamento, config, restrições de dependência, validação de schema, carregamento seguro e logs sem PII | artefato, segurança, contrato de inferência |
| MLE-08 | Lançar serving online ou pontuação em lote com captura de feedback | `api-design`, `backend-patterns`, `e2e-testing`, `browser-qa`, `accessibility` | Endpoint de previsão ou job em lote com envelope de resposta, timeout, batching, fallback, versão do modelo, confiança, logging de feedback e testes de fluxo de produto | serving, inferência em lote, fallback, fluxo de trabalho do usuário |
| MLE-09 | Lançar um modelo com tráfego sombra, canário, teste A/B ou rollback | `canary-watch`, `dashboard-builder`, `verification-loop`, `performance-optimizer` | Plano de rollout nomeando divisão de tráfego, dashboards, latência p95, custo, guardrails de qualidade, artefato de rollback e gatilho de rollback | deployment, canário, rollback |
| MLE-10 | Operar, depurar e atualizar um modelo de produção após o lançamento | `silent-failure-hunter`, `dashboard-builder`, `mle-reviewer`, `doc-updater`, `github-ops` | Livro-razão de observações e plano de atualização com verificações de drift, saúde de labels atrasadas, donos de alertas, atualizações de runbook, critérios de retreinamento e evidência de PR | monitoramento, resposta a incidentes, retreinamento |

## Iteration Compact

Antes de tocar no código do modelo, comprima o trabalho em um único artefato revisável. Ele deve ser curto o suficiente para caber na descrição de um PR e preciso o suficiente para que outro engenheiro possa contestar os tradeoffs.

```text
Goal:
Who cares:
Decision owner:
User or system action changed by the model:
Success metric:
Guardrail metrics:
Mistake budget:
Unacceptable mistakes:
Acceptable mistakes:
Assumptions:
Constraints:
Labels and data snapshot:
Baseline:
Candidate signals:
Threshold or config plan:
Eval slices:
Known risks:
Next experiment:
Rollback or fallback:
```

Este compacto é o equivalente em MLE de uma boa nota de design de SWE. Ele impede que a equipe otimize uma métrica em que ninguém confia, adicione features que não abordam o modo real de erro ou entregue complexidade sem um rollback.

## Decision Brain

Use este loop sempre que a tarefa for ambígua, de alto impacto ou pesada em métricas:

1. Comece pela decisão, não pelo modelo. Nomeie a ação que muda o comportamento subsequente.
2. Nomeie quem se importa e por quê. Diferentes stakeholders pagam custos diferentes por falsos positivos, falsos negativos, latência, gasto computacional, opacidade ou oportunidades perdidas.
3. Converta a ambiguidade em hipóteses. Pergunte qual sinal separaria os resultados, qual evidência o refutaria e qual baseline simples deveria ser difícil de superar.
4. Pesquise trabalhos anteriores ou um problema conhecido próximo antes de inventar um sistema sob medida.
5. Pontue as escolhas com `(probabilidade, confiança) x (custo, severidade, importância, impacto)`.
6. Considere comportamento adversarial, incentivos, divulgação seletiva, mudança de distribuição e loops de feedback.
7. Prefira a mudança mais simples que reduz o erro mais importante. Simplicidade não é preguiça; é uma forma de minimizar grandes erros enquanto preserva a velocidade de iteração.
8. Capture a decisão, a evidência, o contra-argumento e o próximo passo reversível.

## Metric and Mistake Economics

Escolha métricas a partir dos custos de falha, não do hábito:

- Use uma matriz de confusão cedo para que a equipe possa discutir falsos positivos e falsos negativos concretos em vez de acurácia abstrata.
- Favoreça a precisão quando o custo de uma decisão positiva incorreta domina.
- Favoreça o recall quando o custo de um positivo perdido domina.
- Use F1 apenas quando o tradeoff precisão/recall for genuinamente equilibrado e explicável.
- Use AUC ou métricas de ranking quando a qualidade da ordenação importa mais que um único threshold.
- Acompanhe latência, throughput, memória e custo como métricas de primeira classe, pois elas moldam a complexidade viável do modelo.
- Compare contra um baseline e o modelo de produção atual antes de comemorar um ganho offline.
- Trate sinais de feedback do mundo real como labels atrasadas com viés, atraso e lacunas de cobertura; não os trate como verdade absoluta sem análise.

Cada escolha de métrica deve declarar qual erro ela torna mais barato, qual erro ela torna mais provável e quem absorve esse custo.

## Data and Feature Hypotheses

As features devem vir de uma teoria de separação:

- Texto, campos categóricos, históricos numéricos, relações de grafo, recência, frequência e agregados são famílias de sinais candidatas, não features automáticas.
- Para cada família de features, declare por que ela deveria separar os resultados e como ela poderia vazar informação futura.
- Para labels ruidosas, considere adjudicação, confiança de label, soft targets ou ponderação por confiança.
- Para desbalanceamento de classes, compare loss ponderada, reamostragem, movimentação de threshold e regras de decisão calibradas.
- Para valores ausentes, decida se a ausência é informativa, imputável ou um motivo para abster-se.
- Para outliers, decida se deve recortar (clip), agrupar em buckets, investigar ou preservá-los como sinal raro mas importante.
- Para features correlacionadas, verifique se elas são redundantes, instáveis ou proxies de um estado futuro indisponível.

Não adicione complexidade ao modelo até que a análise de erros mostre que o baseline está falhando por um motivo que sinal ou capacidade adicional possa plausivelmente corrigir.

## Error Analysis Loop

Após cada baseline, execução de treinamento, mudança de threshold ou mudança de config:

1. Divida os erros em falsos positivos, falsos negativos, abstenções, casos de baixa confiança e falhas de sistema.
2. Agrupe os erros por traços compartilhados: idioma, tipo de entidade, fonte, tempo, geografia, dispositivo, esparsidade, recência, frescor de feature, fonte de label ou versão de modelo.
3. Separe erros de modelo de bugs de dados, ambiguidade de label, ambiguidade de produto, lacunas de instrumentação e incompatibilidades de serving.
4. Rastreie cada cluster principal até um de quatro movimentos: melhores labels, melhores features, melhor threshold/config ou melhor fallback de produto.
5. Preserve cada erro importante como um teste de regressão, fatia de avaliação, painel de dashboard ou entrada de runbook.
6. Escreva a próxima iteração como um experimento falsificável, não como uma tarefa vaga de "melhorar o modelo".

O loop de MLE mais forte não é treinar -> métrica -> entregar. É erro -> cluster -> hipótese -> experimento -> evidência -> sistema mais simples.

## Observation Ledger

Mantenha um rastro compacto de decisões e evidências ao lado do código, PR, relatório de experimento ou runbook:

```text
Iteration:
Change:
Why this mattered:
Metric movement:
Slice movement:
False positives:
False negatives:
Unexpected errors:
Decision:
Tradeoff accepted:
Lesson captured:
Regression added:
Debt created:
Next iteration:
```

Use o livro-razão para tornar o trabalho de modelos cumulativo. O objetivo é que cada iteração torne a próxima decisão mais fácil, não meramente produza outro artefato.

## Core Workflow

### 1. Define the Prediction Contract

Capture o contrato em nível de produto antes de escrever código de modelo:

- Alvo de previsão e dono da decisão
- Entidade de entrada, schema de saída, campos de confiança/calibração e latência permitida
- Modo de serving em lote, online, streaming ou híbrido
- Comportamento de fallback quando o modelo, o feature store ou a dependência estiverem indisponíveis
- Caminho de revisão ou substituição humana para decisões de alto impacto
- Requisitos de privacidade, retenção e auditoria para entradas, previsões e labels

Não aceite "melhorar o modelo" como requisito. Vincule o modelo a um comportamento de produto observável e a um portão de aceitação mensurável.

### 2. Lock the Data Contract

Toda tarefa de ML precisa de um data contract explícito:

- Granularidade de entidade e chave primária
- Definição de label, timestamp de label e atraso de disponibilidade de label
- Timestamp de feature, SLA de frescor e regras de join point-in-time
- Política de divisão de treino, validação, teste e backtest
- Colunas obrigatórias, nulos permitidos, intervalos, categorias e unidades
- Campos de PII ou sensíveis que não devem entrar em artefatos de treinamento ou logs
- Versão do dataset ou ID de snapshot para reprodutibilidade

Proteja-se primeiro contra vazamento. Se uma feature não estiver disponível no momento da previsão, ou for juntada usando informação futura, remova-a ou mova-a para um caminho apenas de análise.

### 3. Build a Reproducible Pipeline

O código de treinamento deve ser executável por outro engenheiro sem estado oculto de notebook:

- Use arquivos de config tipados ou dataclasses para todos os hiperparâmetros e caminhos
- Fixe as dependências de pacote e modelo
- Defina seeds aleatórias e documente qualquer comportamento não determinístico de GPU
- Registre versão do dataset, SHA do código, hash da config, métricas e URI do artefato
- Salve a lógica de pré-processamento com o artefato do modelo, não separadamente em um notebook
- Mantenha as transformações de treino, avaliação e inferência compartilhadas ou geradas a partir de uma única fonte
- Torne cada etapa idempotente para que retentativas não corrompam artefatos ou métricas

Prefira valores imutáveis e funções de transformação puras. Evite mutar data frames compartilhados ou config global durante a geração de features.

```python
import hashlib
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class TrainingConfig:
    dataset_uri: str
    model_dir: Path
    seed: int
    learning_rate: float
    batch_size: int


def artifact_name(config: TrainingConfig, code_sha: str) -> str:
    config_key = f"{config.dataset_uri}:{config.seed}:{config.learning_rate}:{config.batch_size}"
    config_hash = hashlib.sha256(config_key.encode("utf-8")).hexdigest()[:12]
    return f"{code_sha[:12]}-{config_hash}"
```

### 4. Evaluate Before Promotion

Os critérios de promoção devem ser declarados antes de o treinamento terminar:

- Comparação entre o modelo baseline e o modelo de produção atual
- Métrica primária alinhada ao comportamento de produto
- Métricas de guardrail para latência, calibração, fatias de fairness, custo e concentração de erros
- Métricas de fatia para coortes, geografias, dispositivos, idiomas ou fontes de dados importantes
- Intervalos de confiança ou variância de execuções repetidas quando as métricas forem ruidosas
- Exemplos de falha revisados por um humano para modelos de alto impacto
- Thresholds explícitos de "não entregar"

```python
PROMOTION_GATES = {
    "auc": ("min", 0.82),
    "calibration_error": ("max", 0.04),
    "p95_latency_ms": ("max", 80),
}


def assert_promotion_ready(metrics: dict[str, float]) -> None:
    missing = sorted(name for name in PROMOTION_GATES if name not in metrics)
    if missing:
        raise ValueError(f"Model promotion metrics missing required gates: {missing}")

    failures = {
        name: value
        for name, (direction, threshold) in PROMOTION_GATES.items()
        for value in [metrics[name]]
        if (direction == "min" and value < threshold)
        or (direction == "max" and value > threshold)
    }
    if failures:
        raise ValueError(f"Model failed promotion gates: {failures}")
```

Use métricas offline como portões, não como garantias. Quando o modelo muda o comportamento de produto, planeje avaliação sombra, rollout canário ou teste A/B antes do rollout completo.

### 5. Package for Serving

Um artefato de ML só está pronto para produção quando o contrato de serving é testável:

- O artefato do modelo inclui versão, referência aos dados de treinamento, config e pré-processamento
- O schema de entrada rejeita features inválidas, desatualizadas ou fora de intervalo
- O schema de saída inclui a versão do modelo e campos de confiança ou explicação quando útil
- O caminho de serving tem timeout, batching, limites de recursos e comportamento de fallback
- Os requisitos de CPU/GPU são explícitos e testados
- Os logs de previsão evitam PII e incluem identificadores suficientes para depuração e joins de label
- Os testes de integração cobrem features ausentes, features desatualizadas, tipos ruins, lotes vazios e o caminho de fallback

Nunca deixe o código de feature apenas de treinamento divergir do código de feature de serving sem um teste que prove equivalência.

### 6. Operate the Model

O monitoramento de modelos precisa de sinais tanto de sistema quanto de qualidade:

- Disponibilidade, taxa de erros, taxa de timeout, profundidade de fila e latência p50/p95/p99
- Taxa de nulos de feature, drift de intervalo, drift categórico e drift de frescor
- Drift da distribuição de previsões e drift da distribuição de confiança
- Saúde da chegada de labels e métricas de qualidade atrasadas
- Guardrails de KPI de negócio e gatilhos de rollback
- Dashboards por versão para canários e rollbacks

Todo deployment deve ter um plano de rollback que nomeie o artefato anterior, a config, a dependência de dados e o mecanismo de troca de tráfego.

## Review Checklist

- [ ] O contrato de previsão é explícito e testável
- [ ] O data contract define granularidade de entidade, timing de label, timing de feature e snapshot/versão
- [ ] Os riscos de vazamento foram verificados contra a disponibilidade no momento da previsão
- [ ] O treinamento é reproduzível a partir de código, config, versão de dados e seed
- [ ] As métricas comparam contra o baseline e o modelo de produção atual
- [ ] Métricas de fatia e guardrails estão incluídos para coortes de alto risco
- [ ] Os portões de promoção são automatizados e falham fechados (fail closed)
- [ ] As transformações de treinamento e serving são compartilhadas ou testadas por equivalência
- [ ] O artefato do modelo carrega versão, config, referência ao dataset e pré-processamento
- [ ] O caminho de serving valida entradas e tem comportamento de timeout, fallback e rollback
- [ ] O monitoramento cobre saúde do sistema, drift de features, drift de previsões e labels atrasadas
- [ ] Dados sensíveis são excluídos de artefatos, logs, prompts e exemplos

## Anti-Patterns

- O estado de notebook é necessário para reproduzir o modelo
- A divisão aleatória vaza dados futuros para os conjuntos de validação ou teste
- Os joins de feature ignoram o tempo do evento e a disponibilidade da label
- A métrica offline melhora enquanto fatias importantes regridem
- Os thresholds são ajustados repetidamente no conjunto de teste
- O pré-processamento de treinamento é copiado manualmente para o código de serving
- A versão do modelo está ausente nos logs de previsão
- O monitoramento verifica apenas o uptime do serviço, não a qualidade de dados ou previsões
- O rollback exige retreinamento em vez de trocar para um artefato comprovadamente bom

## Output Expectations

Ao usar esta skill, retorne artefatos concretos: data contract, portões de promoção, etapas de pipeline, plano de testes, plano de deployment ou achados de revisão. Aponte as incógnitas que bloqueiam a prontidão para produção em vez de preenchê-las com suposições.
