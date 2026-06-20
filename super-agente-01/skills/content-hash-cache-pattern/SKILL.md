---
name: content-hash-cache-pattern
description: Armazene em cache resultados custosos de processamento de arquivos usando hashes SHA-256 de conteúdo — independente de caminho, com invalidação automática e separação em camada de serviço.
metadata:
  origin: ECC
---

# Padrão de Cache por Hash de Conteúdo de Arquivo

Armazene em cache resultados custosos de processamento de arquivos (parsing de PDF, extração de texto, análise de imagem) usando hashes SHA-256 do conteúdo como chaves de cache. Ao contrário do cache baseado em caminho, essa abordagem sobrevive a movimentações/renomeações de arquivos e invalida automaticamente quando o conteúdo muda.

## Quando Ativar

- Construindo pipelines de processamento de arquivos (PDF, imagens, extração de texto)
- O custo de processamento é alto e os mesmos arquivos são processados repetidamente
- Necessidade de uma opção `--cache/--no-cache` na CLI
- Quer adicionar cache a funções puras existentes sem modificá-las

## Padrão Central

### 1. Chave de Cache Baseada em Hash de Conteúdo

Use o conteúdo do arquivo (não o caminho) como chave de cache:

```python
import hashlib
from pathlib import Path

_HASH_CHUNK_SIZE = 65536  # Chunks de 64KB para arquivos grandes

def compute_file_hash(path: Path) -> str:
    """SHA-256 do conteúdo do arquivo (em chunks para arquivos grandes)."""
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            chunk = f.read(_HASH_CHUNK_SIZE)
            if not chunk:
                break
            sha256.update(chunk)
    return sha256.hexdigest()
```

**Por que hash de conteúdo?** Renomear/mover arquivo = cache hit. Mudança de conteúdo = invalidação automática. Nenhum arquivo de índice necessário.

### 2. Dataclass Imutável para Entrada de Cache

```python
from dataclasses import dataclass

@dataclass(frozen=True, slots=True)
class CacheEntry:
    file_hash: str
    source_path: str
    document: ExtractedDocument  # O resultado em cache
```

### 3. Armazenamento de Cache em Arquivo

Cada entrada de cache é armazenada como `{hash}.json` — busca O(1) por hash, sem arquivo de índice necessário.

```python
import json
from typing import Any

def write_cache(cache_dir: Path, entry: CacheEntry) -> None:
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache_file = cache_dir / f"{entry.file_hash}.json"
    data = serialize_entry(entry)
    cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

def read_cache(cache_dir: Path, file_hash: str) -> CacheEntry | None:
    cache_file = cache_dir / f"{file_hash}.json"
    if not cache_file.is_file():
        return None
    try:
        raw = cache_file.read_text(encoding="utf-8")
        data = json.loads(raw)
        return deserialize_entry(data)
    except (json.JSONDecodeError, ValueError, KeyError):
        return None  # Trata corrupção como cache miss
```

### 4. Wrapper em Camada de Serviço (SRP)

Mantenha a função de processamento pura. Adicione cache como uma camada de serviço separada.

```python
def extract_with_cache(
    file_path: Path,
    *,
    cache_enabled: bool = True,
    cache_dir: Path = Path(".cache"),
) -> ExtractedDocument:
    """Camada de serviço: verificação de cache -> extração -> gravação no cache."""
    if not cache_enabled:
        return extract_text(file_path)  # Função pura, sem conhecimento de cache

    file_hash = compute_file_hash(file_path)

    # Verificar cache
    cached = read_cache(cache_dir, file_hash)
    if cached is not None:
        logger.info("Cache hit: %s (hash=%s)", file_path.name, file_hash[:12])
        return cached.document

    # Cache miss -> extrair -> armazenar
    logger.info("Cache miss: %s (hash=%s)", file_path.name, file_hash[:12])
    doc = extract_text(file_path)
    entry = CacheEntry(file_hash=file_hash, source_path=str(file_path), document=doc)
    write_cache(cache_dir, entry)
    return doc
```

## Decisões-Chave de Design

| Decisão | Justificativa |
|----------|-----------|
| Hash SHA-256 do conteúdo | Independente de caminho, invalida automaticamente com mudança de conteúdo |
| Nomenclatura de arquivo `{hash}.json` | Busca O(1), sem arquivo de índice necessário |
| Wrapper em camada de serviço | SRP: extração permanece pura, cache é uma preocupação separada |
| Serialização JSON manual | Controle total sobre serialização de dataclass imutável |
| Corrupção retorna `None` | Degradação graciosa, reprocessa na próxima execução |
| `cache_dir.mkdir(parents=True)` | Criação lazy de diretório na primeira gravação |

## Boas Práticas

- **Faça hash do conteúdo, não dos caminhos** — caminhos mudam, identidade do conteúdo não
- **Processe arquivos grandes em chunks** ao fazer hash — evite carregar arquivos inteiros na memória
- **Mantenha funções de processamento puras** — elas não devem saber nada sobre cache
- **Registre cache hit/miss** com hashes truncados para depuração
- **Trate corrupção graciosamente** — entradas de cache inválidas como misses, nunca trave

## Anti-Patterns a Evitar

```python
# RUIM: Cache baseado em caminho (quebra ao mover/renomear arquivo)
cache = {"/path/to/file.pdf": result}

# RUIM: Adicionar lógica de cache dentro da função de processamento (violação de SRP)
def extract_text(path, *, cache_enabled=False, cache_dir=None):
    if cache_enabled:  # Agora esta função tem duas responsabilidades
        ...

# RUIM: Usar dataclasses.asdict() com dataclasses imutáveis aninhadas
# (pode causar problemas com tipos aninhados complexos)
data = dataclasses.asdict(entry)  # Use serialização manual em vez disso
```

## Quando Usar

- Pipelines de processamento de arquivos (parsing de PDF, OCR, extração de texto, análise de imagem)
- Ferramentas CLI que se beneficiam de opções `--cache/--no-cache`
- Processamento em lote onde os mesmos arquivos aparecem em várias execuções
- Adicionar cache a funções puras existentes sem modificá-las

## Quando NÃO Usar

- Dados que devem estar sempre atualizados (feeds em tempo real)
- Entradas de cache que seriam extremamente grandes (considere streaming em vez disso)
- Resultados que dependem de parâmetros além do conteúdo do arquivo (ex.: diferentes configurações de extração)
