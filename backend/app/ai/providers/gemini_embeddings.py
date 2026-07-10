from google import genai
from google.genai import types

from app.ai.base import EmbeddingProvider
from app.core.config import get_settings

settings = get_settings()
BATCH_SIZE = 100


class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def embed(self, texts: list[str], model: str) -> list[list[float]]:
        embeddings: list[list[float]] = []
        config = types.EmbedContentConfig(output_dimensionality=settings.embedding_dimensions)
        for i in range(0, len(texts), BATCH_SIZE):
            batch = texts[i : i + BATCH_SIZE]
            response = await self._client.aio.models.embed_content(
                model=model, contents=batch, config=config
            )
            embeddings.extend(e.values for e in response.embeddings)
        return embeddings
