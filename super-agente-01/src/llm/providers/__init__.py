"""Adaptadores de provedor para múltiplos backends de LLM."""

from llm.providers.astraflow import AstraflowCNProvider, AstraflowProvider
from llm.providers.atlas import AtlasProvider
from llm.providers.claude import ClaudeProvider
from llm.providers.openai import OpenAIProvider
from llm.providers.ollama import OllamaProvider
from llm.providers.resolver import get_provider, register_provider

__all__ = (
    "AstraflowCNProvider",
    "AstraflowProvider",
    "AtlasProvider",
    "ClaudeProvider",
    "OpenAIProvider",
    "OllamaProvider",
    "get_provider",
    "register_provider",
)
