"""
Camada de Abstração de LLM

Interface agnóstica de provedor para múltiplos backends de LLM.
"""

from llm.core.interface import LLMProvider
from llm.core.types import LLMInput, LLMOutput, Message, ToolCall, ToolDefinition, ToolResult
from llm.providers import get_provider
from llm.tools import ToolExecutor, ToolRegistry
from llm.cli.selector import interactive_select

__version__ = "0.1.0"

__all__ = (
    "LLMInput",
    "LLMOutput",
    "LLMProvider",
    "Message",
    "ToolCall",
    "ToolDefinition",
    "ToolResult",
    "ToolExecutor",
    "ToolRegistry",
    "get_provider",
    "interactive_select",
)


def gui() -> None:
    from llm.cli.selector import main
    main()

