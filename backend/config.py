from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MODE: str = "LOCAL"
    LLM_PROVIDER: str = "AUTO"

    LMSTUDIO_BASE_URL: str = "http://localhost:1234/v1"
    LMSTUDIO_MODEL: str = "gpt-oss-20b"

    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    WORKSPACE_ROOT: str = "workspaces"
    DB_PATH: str = "builder.db"
    MAX_ITERS: int = 3

    MAX_INPUT_CHARS: int = 120_000
    MAX_REPLY_TOKENS: int = 2048

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
