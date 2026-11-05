"""
EduBranch AI — Local Demo Provider (offline, no API key).

Used automatically when the configured provider has no API key, or when AI_PROVIDER=local.
It lets the full pipeline (ingestion -> retrieval -> case generation -> challenge support)
run on a developer machine without network access.

It is NOT a language model:
  - Embeddings are deterministic hashed bag-of-words vectors (768 dims, L2-normalised),
    so retrieval ranks chunks by shared vocabulary only.
  - Text and structured output are built from templates and the supplied context.
Every output it produces is marked as demo content where a user can see it.
"""

from __future__ import annotations

import hashlib
import math
import re
from typing import Any

from app.providers.base import BaseLLMProvider

EMBEDDING_DIM = 768
_TOKEN_RE = re.compile(r"[0-9A-Za-zÀ-ỹ]+", re.UNICODE)


def _tokens(text: str) -> list[str]:
    return [t.lower() for t in _TOKEN_RE.findall(text or "") if len(t) > 1]


def hashed_embedding(text: str) -> list[float]:
    """Deterministic 768-dim embedding: signed feature hashing of unigrams and bigrams."""
    vec = [0.0] * EMBEDDING_DIM
    toks = _tokens(text)
    feats = toks + [f"{a}_{b}" for a, b in zip(toks, toks[1:])]
    for f in feats:
        h = hashlib.md5(f.encode("utf-8")).digest()
        idx = int.from_bytes(h[:4], "little") % EMBEDDING_DIM
        sign = 1.0 if h[4] & 1 else -1.0
        vec[idx] += sign
    norm = math.sqrt(sum(v * v for v in vec))
    if norm == 0:
        vec[0] = 1.0
        return vec
    return [v / norm for v in vec]


class LocalDemoProvider(BaseLLMProvider):
    """Offline provider for local development and demos."""

    name = "local-demo"

    async def generate_text(self, prompt: str, system_prompt: str | None = None, **kwargs) -> str:
        return (
            "[Chế độ demo offline] Hãy nêu rõ giả định của bạn, bằng chứng nào ủng hộ lựa chọn "
            "này, và điều gì có thể khiến lựa chọn khác hợp lý hơn trong tình huống."
        )

    async def generate_structured(
        self, prompt: str, schema: dict[str, Any], system_prompt: str | None = None, **kwargs
    ) -> dict[str, Any]:
        # Structured output is produced by callers' own template builders in demo mode.
        raise NotImplementedError("LocalDemoProvider does not generate structured output directly")

    async def generate_embedding(self, text: str) -> list[float]:
        return hashed_embedding(text)

    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        return [hashed_embedding(t) for t in texts]
