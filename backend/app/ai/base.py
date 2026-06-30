from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass


@dataclass
class Message:
    role: str  # "system" | "user" | "assistant"
    content: str


class LLMProvider(ABC):
    """Completion/streaming interface. `model` is always supplied by the caller
    (resolved from org settings or Settings.default_llm_model) — implementations
    must never hardcode a model name."""

    @abstractmethod
    async def stream(
        self, messages: list[Message], model: str, max_tokens: int = 1024
    ) -> AsyncIterator[str]:
        """Yield text deltas as they arrive."""
        raise NotImplementedError
        yield  # pragma: no cover - makes this an async generator for type checkers


class EmbeddingProvider(ABC):
    """Embedding interface. `model` is always supplied by the caller."""

    @abstractmethod
    async def embed(self, texts: list[str], model: str) -> list[list[float]]:
        raise NotImplementedError
