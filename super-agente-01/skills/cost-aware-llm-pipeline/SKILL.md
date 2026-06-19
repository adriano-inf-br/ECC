---
name: cost-aware-llm-pipeline
description: Padrões de otimização de custo para uso de APIs de LLM — roteamento de modelo por complexidade da tarefa, rastreamento de orçamento, lógica de retry e prompt caching.
metadata:
  origin: ECC
---

# Cost-Aware LLM Pipeline

Padrões para controlar os custos de APIs de LLM mantendo a qualidade. Combina roteamento de modelo, rastreamento de orçamento, lógica de retry e prompt caching em um pipeline componível.

## Quando Ativar

- Construir aplicações que chamam APIs de LLM (Claude, GPT, etc.)
- Processar lotes de itens com complexidade variável
- Necessidade de permanecer dentro de um orçamento de gasto com API
- Otimizar custo sem sacrificar qualidade em tarefas complexas

## Conceitos Centrais

### 1. Roteamento de Modelo por Complexidade da Tarefa

Selecione automaticamente modelos mais baratos para tarefas simples, reservando modelos caros para as complexas.

```python
MODEL_SONNET = "claude-sonnet-4-6"
MODEL_HAIKU = "claude-haiku-4-5-20251001"

_SONNET_TEXT_THRESHOLD = 10_000  # caracteres
_SONNET_ITEM_THRESHOLD = 30     # itens

def select_model(
    text_length: int,
    item_count: int,
    force_model: str | None = None,
) -> str:
    """Seleciona o modelo com base na complexidade da tarefa."""
    if force_model is not None:
        return force_model
    if text_length >= _SONNET_TEXT_THRESHOLD or item_count >= _SONNET_ITEM_THRESHOLD:
        return MODEL_SONNET  # Tarefa complexa
    return MODEL_HAIKU  # Tarefa simples (3-4x mais barata)
```

### 2. Rastreamento de Custo Imutável

Rastreie o gasto cumulativo com dataclasses congeladas. Cada chamada de API retorna um novo tracker — nunca muta o estado.

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CostRecord:
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float

@dataclass(frozen=True, slots=True)
class CostTracker:
    budget_limit: float = 1.00
    records: tuple[CostRecord, ...] = ()

    def add(self, record: CostRecord) -> "CostTracker":
        """Retorna um novo tracker com o registro adicionado (nunca muta self)."""
        return CostTracker(
            budget_limit=self.budget_limit,
            records=(*self.records, record),
        )

    @property
    def total_cost(self) -> float:
        return sum(r.cost_usd for r in self.records)

    @property
    def over_budget(self) -> bool:
        return self.total_cost > self.budget_limit
```

### 3. Lógica de Retry Restrita

Faça retry apenas em erros transitórios. Falhe rápido em erros de autenticação ou de requisição inválida.

```python
from anthropic import (
    APIConnectionError,
    InternalServerError,
    RateLimitError,
)

_RETRYABLE_ERRORS = (APIConnectionError, RateLimitError, InternalServerError)
_MAX_RETRIES = 3

def call_with_retry(func, *, max_retries: int = _MAX_RETRIES):
    """Faz retry apenas em erros transitórios, falha rápido nos demais."""
    for attempt in range(max_retries):
        try:
            return func()
        except _RETRYABLE_ERRORS:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Backoff exponencial
    # AuthenticationError, BadRequestError etc. → lança imediatamente
```

### 4. Prompt Caching

Faça cache de prompts de sistema longos para evitar reenviá-los a cada requisição.

```python
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": system_prompt,
                "cache_control": {"type": "ephemeral"},  # Faz cache disto
            },
            {
                "type": "text",
                "text": user_input,  # Parte variável
            },
        ],
    }
]
```

## Composição

Combine todas as quatro técnicas em uma única função de pipeline:

```python
def process(text: str, config: Config, tracker: CostTracker) -> tuple[Result, CostTracker]:
    # 1. Roteia o modelo
    model = select_model(len(text), estimated_items, config.force_model)

    # 2. Verifica o orçamento
    if tracker.over_budget:
        raise BudgetExceededError(tracker.total_cost, tracker.budget_limit)

    # 3. Chama com retry + caching
    response = call_with_retry(lambda: client.messages.create(
        model=model,
        messages=build_cached_messages(system_prompt, text),
    ))

    # 4. Rastreia o custo (imutável)
    record = CostRecord(model=model, input_tokens=..., output_tokens=..., cost_usd=...)
    tracker = tracker.add(record)

    return parse_result(response), tracker
```

## Referência de Preços (2025-2026)

| Modelo | Entrada ($/1M tokens) | Saída ($/1M tokens) | Custo Relativo |
|-------|---------------------|----------------------|---------------|
| Haiku 4.5 | $0.80 | $4.00 | 1x |
| Sonnet 4.6 | $3.00 | $15.00 | ~4x |
| Opus 4.5 | $15.00 | $75.00 | ~19x |

## Boas Práticas

- **Comece com o modelo mais barato** e só roteie para modelos caros quando os limiares de complexidade forem atingidos
- **Defina limites de orçamento explícitos** antes de processar lotes — falhe cedo em vez de gastar demais
- **Registre as decisões de seleção de modelo** para que você possa ajustar os limiares com base em dados reais
- **Use prompt caching** para prompts de sistema acima de 1024 tokens — economiza tanto custo quanto latência
- **Nunca faça retry em erros de autenticação ou validação** — apenas em falhas transitórias (rede, rate limit, erro de servidor)

## Anti-Padrões a Evitar

- Usar o modelo mais caro para todas as requisições independentemente da complexidade
- Fazer retry em todos os erros (desperdiça orçamento em falhas permanentes)
- Mutar o estado de rastreamento de custo (dificulta depuração e auditoria)
- Codificar nomes de modelo embutidos por todo o código (use constantes ou config)
- Ignorar prompt caching para prompts de sistema repetitivos

## Quando Usar

- Qualquer aplicação que chame Claude, OpenAI ou APIs de LLM semelhantes
- Pipelines de processamento em lote onde o custo se acumula rapidamente
- Arquiteturas multi-modelo que precisam de roteamento inteligente
- Sistemas de produção que precisam de proteções de orçamento
