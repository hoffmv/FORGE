import os
from openai import OpenAI
from backend.config import settings
from .base import LLM

class OpenAIProvider(LLM):
    def __init__(self):
        api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=api_key)
    
    def complete(self, *, system: str, user: str, max_tokens: int) -> str:
        response = self.client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=max_tokens,
            temperature=0.2,
        )
        return response.choices[0].message.content.strip()
