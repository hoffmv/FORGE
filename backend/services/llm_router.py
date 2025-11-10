from backend.config import settings
from backend.providers.lmstudio import LMStudioProvider
from backend.providers.openai_cloud import OpenAIProvider
from backend.storage.db import get_runtime_provider

def get_llm():
    selected = (get_runtime_provider() or settings.LLM_PROVIDER or "AUTO").upper()
    if selected == "LMSTUDIO":
        return LMStudioProvider()
    if selected == "OPENAI":
        return OpenAIProvider()
    if settings.MODE.upper() == "LOCAL":
        return LMStudioProvider()
    return OpenAIProvider()
