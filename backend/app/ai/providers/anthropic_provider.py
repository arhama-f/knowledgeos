from collections.abc import AsyncIterator
from typing import cast

from anthropic import NOT_GIVEN, AsyncAnthropic
from anthropic.types import MessageParam

from app.ai.base import LLMProvider, Message
from app.core.config import get_settings

settings = get_settings()


class AnthropicLLMProvider(LLMProvider):
    def __init__(self) -> None:
        self._client = AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def stream(
        self, messages: list[Message], model: str, max_tokens: int = 1024
    ) -> AsyncIterator[str]:
        system_parts = [m.content for m in messages if m.role == "system"]
        conversation = cast(
            "list[MessageParam]",
            [{"role": m.role, "content": m.content} for m in messages if m.role != "system"],
        )
        async with self._client.messages.stream(
            model=model,
            max_tokens=max_tokens,
            # The SDK uses the NOT_GIVEN sentinel to mean "omit this parameter" —
            # passing system=None explicitly is a typed (and untested) value the
            # API may not accept the same way as omitting it entirely.
            system="\n\n".join(system_parts) if system_parts else NOT_GIVEN,
            messages=conversation,
        ) as stream:
            async for text in stream.text_stream:
                yield text
