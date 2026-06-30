from collections.abc import AsyncIterator

from google import genai
from google.genai import types

from app.ai.base import LLMProvider, Message
from app.core.config import get_settings

settings = get_settings()


class GeminiLLMProvider(LLMProvider):
    def __init__(self) -> None:
        self._client = genai.Client(api_key=settings.gemini_api_key)

    async def stream(
        self, messages: list[Message], model: str, max_tokens: int = 1024
    ) -> AsyncIterator[str]:
        system_parts = [m.content for m in messages if m.role == "system"]
        contents = [
            types.Content(
                role="model" if m.role == "assistant" else "user",
                parts=[types.Part(text=m.content)],
            )
            for m in messages
            if m.role != "system"
        ]
        config = types.GenerateContentConfig(
            system_instruction="\n\n".join(system_parts) if system_parts else None,
            max_output_tokens=max_tokens,
        )
        # google-genai's async streaming surface has shifted across versions;
        # re-verify against the pinned version in requirements.txt once installed.
        response_stream = await self._client.aio.models.generate_content_stream(
            model=model, contents=contents, config=config
        )
        async for chunk in response_stream:
            if chunk.text:
                yield chunk.text
