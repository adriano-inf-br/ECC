# Atlas Cloud — Guia de Provedor LLM

[Atlas Cloud](https://www.atlascloud.ai/?utm_source=github&utm_medium=link&utm_campaign=everything-claude-code) é uma plataforma de inferência de IA full-modal que fornece uma API compatível com OpenAI para 59+ modelos LLM, geração de imagens e geração de vídeo.

## Configuração

Defina as seguintes variáveis de ambiente para usar o Atlas Cloud como seu backend LLM:

```bash
ATLAS_API_KEY=<sua-chave-api-atlascloud>
ATLAS_BASE_URL=https://api.atlascloud.ai/v1
```

Ou copie de `.env.example`:

```bash
cp .env.example .env
# Então preencha ATLAS_API_KEY
```

## Instalação

O ECC pode instalar suas superfícies gerenciadas em qualquer backend compatível com OpenAI. Para usar o Atlas Cloud com o Claude Code (ou qualquer harness gerenciado pelo ECC), defina a URL base e a chave API:

```bash
export ATLAS_API_KEY=sua-chave-aqui
export ATLAS_BASE_URL=https://api.atlascloud.ai/v1
```

## Modelos Disponíveis

<details>
<summary>Todos os modelos LLM do Atlas Cloud (59+)</summary>

- **Anthropic**: `anthropic/claude-haiku-4.5-20251001`, `anthropic/claude-opus-4.8`, `anthropic/claude-sonnet-4.6`
- **OpenAI**: `openai/gpt-5.4`, `openai/gpt-5.5`
- **Google Gemini**: `google/gemini-3.1-flash-lite`, `google/gemini-3.1-pro-preview`, `google/gemini-3.5-flash`
- **Qwen**: `qwen/qwen2.5-7b-instruct`, `Qwen/Qwen3-235B-A22B-Instruct-2507`, `qwen/qwen3-235b-a22b-thinking-2507`, `qwen/qwen3-30b-a3b`, `Qwen/Qwen3-30B-A3B-Instruct-2507`, `qwen/qwen3-30b-a3b-thinking-2507`, `qwen/qwen3-32b`, `qwen/qwen3-8b`, `Qwen/Qwen3-Coder`, `qwen/qwen3-coder-next`, `qwen/qwen3-max-2026-01-23`, `Qwen/Qwen3-Next-80B-A3B-Instruct`, `Qwen/Qwen3-Next-80B-A3B-Thinking`, `Qwen/Qwen3-VL-235B-A22B-Instruct`, `qwen/qwen3-vl-235b-a22b-thinking`, `qwen/qwen3-vl-30b-a3b-instruct`, `qwen/qwen3-vl-30b-a3b-thinking`, `qwen/qwen3-vl-8b-instruct`, `qwen/qwen3.5-122b-a10b`, `qwen/qwen3.5-27b`, `qwen/qwen3.5-35b-a3b`, `qwen/qwen3.5-397b-a17b`, `qwen/qwen3.6-35b-a3b`, `qwen/qwen3.6-plus`
- **DeepSeek**: `deepseek-ai/deepseek-ocr`, `deepseek-ai/deepseek-r1-0528`, `deepseek-ai/DeepSeek-V3-0324`, `deepseek-ai/DeepSeek-V3.1`, `deepseek-ai/DeepSeek-V3.1-Terminus`, `deepseek-ai/deepseek-v3.2`, `deepseek-ai/DeepSeek-V3.2-Exp`, `deepseek-ai/deepseek-v4-flash`, `deepseek-ai/deepseek-v4-pro`
- **Kimi**: `moonshotai/Kimi-K2-Instruct`, `moonshotai/Kimi-K2-Instruct-0905`, `moonshotai/Kimi-K2-Thinking`, `moonshotai/kimi-k2.5`, `moonshotai/kimi-k2.6`
- **GLM**: `zai-org/GLM-4.6`, `zai-org/glm-4.7`, `zai-org/glm-5`, `zai-org/glm-5-turbo`, `zai-org/glm-5.1`, `zai-org/glm-5v-turbo`
- **MiniMax**: `MiniMaxAI/MiniMax-M2`, `minimaxai/minimax-m2.1`, `minimaxai/minimax-m2.5`, `minimaxai/minimax-m2.7`
- **xAI**: `xai/grok-4.3`
- **KAT**: `kwaipilot/kat-coder-pro-v2`
- **Outros**: `owl`

</details>

## Exemplo de Uso

```python
from openai import OpenAI
import os

client = OpenAI(
    api_key=os.environ["ATLAS_API_KEY"],
    base_url=os.environ.get("ATLAS_BASE_URL", "https://api.atlascloud.ai/v1"),
)

response = client.chat.completions.create(
    model="anthropic/claude-sonnet-4.6",
    messages=[{"role": "user", "content": "Hello from ECC + Atlas Cloud!"}],
)
print(response.choices[0].message.content)
```

## Obter Créditos de API

Visite o [Plano de Codificação do Atlas Cloud](https://www.atlascloud.ai/console/coding-plan) para créditos de API.
