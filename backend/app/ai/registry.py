from app.ai.base import EmbeddingProvider, LLMProvider
from app.ai.providers.anthropic_provider import AnthropicLLMProvider
from app.ai.providers.gemini_embeddings import GeminiEmbeddingProvider
from app.ai.providers.gemini_provider import GeminiLLMProvider
from app.ai.providers.openai_embeddings import OpenAIEmbeddingProvider
from app.ai.providers.openai_provider import OpenAILLMProvider

_LLM_PROVIDERS: dict[str, type[LLMProvider]] = {
    "openai": OpenAILLMProvider,
    "anthropic": AnthropicLLMProvider,
    "gemini": GeminiLLMProvider,
}

_EMBEDDING_PROVIDERS: dict[str, type[EmbeddingProvider]] = {
    "openai": OpenAIEmbeddingProvider,
    "gemini": GeminiEmbeddingProvider,
}


def get_llm_provider(name: str) -> LLMProvider:
    try:
        return _LLM_PROVIDERS[name]()
    except KeyError:
        raise ValueError(
            f"Unknown LLM provider '{name}'. Available: {sorted(_LLM_PROVIDERS)}"
        ) from None


def get_embedding_provider(name: str) -> EmbeddingProvider:
    try:
        return _EMBEDDING_PROVIDERS[name]()
    except KeyError:
        raise ValueError(
            f"Unknown embedding provider '{name}'. Available: {sorted(_EMBEDDING_PROVIDERS)}"
        ) from None
