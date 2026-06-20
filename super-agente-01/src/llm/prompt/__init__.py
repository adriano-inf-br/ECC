"""Módulo de prompt para construção e normalização de prompts."""

from llm.prompt.builder import PromptBuilder, adapt_messages_for_provider, get_provider_builder
from llm.prompt.templates import (
    TEMPLATES,
    clear_templates,
    deregister_template,
    get_template,
    get_template_or_default,
    register_template,
)

__all__ = (
    "PromptBuilder",
    "TEMPLATES",
    "clear_templates",
    "deregister_template",
    "adapt_messages_for_provider",
    "get_provider_builder",
    "get_template",
    "get_template_or_default",
    "register_template",
)
