---
name: regex-vs-llm-structured-text
description: Framework de decisão para escolher entre regex e LLM ao fazer parsing de texto estruturado — comece com regex, adicione LLM apenas para casos extremos de baixa confiança.
metadata:
  origin: ECC
---

# Regex vs LLM para Parsing de Texto Estruturado

Um framework de decisão prático para fazer parsing de texto estruturado (questionários, formulários, faturas, documentos). A percepção chave: regex trata 95-98% dos casos de forma barata e determinística. Reserve chamadas custosas ao LLM para os casos extremos restantes.

## Quando Ativar

- Fazendo parsing de texto estruturado com padrões repetitivos (perguntas, formulários, tabelas)
- Decidindo entre regex e LLM para extração de texto
- Construindo pipelines híbridos que combinam ambas as abordagens
- Otimizando trade-offs de custo/precisão no processamento de texto

## Framework de Decisão

```
O formato do texto é consistente e repetitivo?
├── Sim (>90% segue um padrão) → Comece com Regex
│   ├── Regex trata 95%+ → Pronto, sem LLM necessário
│   └── Regex trata <95% → Adicione LLM apenas para casos extremos
└── Não (forma livre, altamente variável) → Use LLM diretamente
```

## Padrão de Arquitetura

```
Texto Fonte
    │
    ▼
[Parser Regex] ─── Extrai estrutura (95-98% de precisão)
    │
    ▼
[Limpador de Texto] ─── Remove ruído (marcadores, números de página, artefatos)
    │
    ▼
[Scorer de Confiança] ─── Sinaliza extrações de baixa confiança
    │
    ├── Alta confiança (≥0.95) → Saída direta
    │
    └── Baixa confiança (<0.95) → [Validador LLM] → Saída
```

## Implementação

### 1. Parser Regex (Trata a Maioria)

```python
import re
from dataclasses import dataclass

@dataclass(frozen=True)
class ParsedItem:
    id: str
    text: str
    choices: tuple[str, ...]
    answer: str
    confidence: float = 1.0

def parse_structured_text(content: str) -> list[ParsedItem]:
    """Faz parsing de texto estruturado usando padrões regex."""
    pattern = re.compile(
        r"(?P<id>\d+)\.\s*(?P<text>.+?)\n"
        r"(?P<choices>(?:[A-D]\..+?\n)+)"
        r"Answer:\s*(?P<answer>[A-D])",
        re.MULTILINE | re.DOTALL,
    )
    items = []
    for match in pattern.finditer(content):
        choices = tuple(
            c.strip() for c in re.findall(r"[A-D]\.\s*(.+)", match.group("choices"))
        )
        items.append(ParsedItem(
            id=match.group("id"),
            text=match.group("text").strip(),
            choices=choices,
            answer=match.group("answer"),
        ))
    return items
```

### 2. Scoring de Confiança

Sinalize itens que podem precisar de revisão pelo LLM:

```python
@dataclass(frozen=True)
class ConfidenceFlag:
    item_id: str
    score: float
    reasons: tuple[str, ...]

def score_confidence(item: ParsedItem) -> ConfidenceFlag:
    """Pontua a confiança da extração e sinaliza problemas."""
    reasons = []
    score = 1.0

    if len(item.choices) < 3:
        reasons.append("poucas_escolhas")
        score -= 0.3

    if not item.answer:
        reasons.append("resposta_ausente")
        score -= 0.5

    if len(item.text) < 10:
        reasons.append("texto_curto")
        score -= 0.2

    return ConfidenceFlag(
        item_id=item.id,
        score=max(0.0, score),
        reasons=tuple(reasons),
    )

def identify_low_confidence(
    items: list[ParsedItem],
    threshold: float = 0.95,
) -> list[ConfidenceFlag]:
    """Retorna itens abaixo do limiar de confiança."""
    flags = [score_confidence(item) for item in items]
    return [f for f in flags if f.score < threshold]
```

### 3. Validador LLM (Apenas para Casos Extremos)

```python
def validate_with_llm(
    item: ParsedItem,
    original_text: str,
    client,
) -> ParsedItem:
    """Usa LLM para corrigir extrações de baixa confiança."""
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # Modelo mais barato para validação
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": (
                f"Extraia a pergunta, escolhas e resposta deste texto.\n\n"
                f"Texto: {original_text}\n\n"
                f"Extração atual: {item}\n\n"
                f"Retorne JSON corrigido se necessário, ou 'CORRETO' se preciso."
            ),
        }],
    )
    # Faça o parsing da resposta do LLM e retorne o item corrigido...
    return corrected_item
```

### 4. Pipeline Híbrido

```python
def process_document(
    content: str,
    *,
    llm_client=None,
    confidence_threshold: float = 0.95,
) -> list[ParsedItem]:
    """Pipeline completo: regex -> verificação de confiança -> LLM para casos extremos."""
    # Passo 1: Extração com regex (trata 95-98%)
    items = parse_structured_text(content)

    # Passo 2: Scoring de confiança
    low_confidence = identify_low_confidence(items, confidence_threshold)

    if not low_confidence or llm_client is None:
        return items

    # Passo 3: Validação LLM (apenas para itens sinalizados)
    low_conf_ids = {f.item_id for f in low_confidence}
    result = []
    for item in items:
        if item.id in low_conf_ids:
            result.append(validate_with_llm(item, content, llm_client))
        else:
            result.append(item)

    return result
```

## Métricas do Mundo Real

De um pipeline de parsing de quiz em produção (410 itens):

| Métrica | Valor |
|--------|-------|
| Taxa de sucesso do regex | 98,0% |
| Itens de baixa confiança | 8 (2,0%) |
| Chamadas LLM necessárias | ~5 |
| Economia de custo vs tudo-LLM | ~95% |
| Cobertura de testes | 93% |

## Boas Práticas

- **Comece com regex** — mesmo um regex imperfeito fornece uma baseline para melhorar
- **Use scoring de confiança** para identificar programaticamente o que precisa de ajuda do LLM
- **Use o LLM mais barato** para validação (modelos da classe Haiku são suficientes)
- **Nunca mute** itens parseados — retorne novas instâncias das etapas de limpeza/validação
- **TDD funciona bem** para parsers — escreva testes para padrões conhecidos primeiro, depois casos extremos
- **Registre métricas** (taxa de sucesso do regex, contagem de chamadas LLM) para monitorar a saúde do pipeline

## Anti-Padrões a Evitar

- Enviar todo o texto ao LLM quando o regex trata 95%+ dos casos (caro e lento)
- Usar regex para texto livre e altamente variável (o LLM é melhor aqui)
- Pular o scoring de confiança e torcer para que o regex "simplesmente funcione"
- Mutar objetos parseados durante as etapas de limpeza/validação
- Não testar casos extremos (entrada malformada, campos ausentes, problemas de codificação)

## Quando Usar

- Parsing de perguntas de quiz/prova
- Extração de dados de formulários
- Processamento de faturas/recibos
- Parsing de estrutura de documentos (cabeçalhos, seções, tabelas)
- Qualquer texto estruturado com padrões repetitivos onde o custo importa
