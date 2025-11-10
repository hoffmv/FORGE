from backend.config import settings

def chunk_text(text: str, max_chars: int | None = None):
    maxc = max_chars or settings.MAX_INPUT_CHARS
    if len(text) <= maxc:
        return [text]
    chunks, i = [], 0
    while i < len(text):
        j = min(i + maxc, len(text))
        k = text.rfind("\n\n", i, j)
        if k == -1 or k <= i:
            k = j
        chunks.append(text[i:k])
        i = k
    return chunks
