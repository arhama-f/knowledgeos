from collections.abc import AsyncIterator
from typing import cast

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam

from app.ai.base import LLMProvider, Message
from app.core.config import get_settings

settings = get_settings()


class OpenAILLMProvider(LLMProvider):
    def __init__(self) -> None:
        self._client = AsyncOpenAI(api_key=settings.openai_api_key)

    async def stream(
        self, messages: list[Message], model: str, max_tokens: int = 1024
    ) -> AsyncIterator[str]:
        params = cast(
            "list[ChatCompletionMessageParam]",
            [{"role": m.role, "content": m.content} for m in messages],
        )
        stream = await self._client.chat.completions.create(
            model=model,
            messages=params,
            max_tokens=max_tokens,
            stream=True,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta
