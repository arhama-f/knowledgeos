from openai import AsyncOpenAI

from app.ai.base import EmbeddingProvider
from app.core.config import get_settings

settings = get_settings()
BATCH_SIZE = 100


class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def embed(self, texts: list[str], model: str) -> list[list[float]]:
        embeddings: list[list[float]] = []
        for i in range(0, len(texts), BATCH_SIZE):
            batch = [t.replace("\n", " ") for t in texts[i : i + BATCH_SIZE]]
            response = await self._client.embeddings.create(model=model, input=batch)
            embeddings.extend(item.embedding for item in response.data)
        return embeddings
