"""
EduBranch AI — Google Gemini LLM Provider Implementation.

Implements BaseLLMProvider using the Google Generative AI SDK.
Used when app.core.config.settings.ai_provider == "gemini".
"""

import json
from typing import Any

import google.generativeai as genai

from app.core.config import settings
from app.core.exceptions import ProviderException
from app.providers.base import BaseLLMProvider


def _model_path(name: str) -> str:
    """The Gemini SDK needs a resource name ("models/<id>"); accept a bare id from the env too."""
    name = name.strip()
    return name if name.startswith(("models/", "tunedModels/")) else f"models/{name}"


def _sanitize_schema_for_gemini(schema: dict[str, Any]) -> dict[str, Any]:
    """
    Sanitize Pydantic model_json_schema() for Google Generative AI SDK.
    Resolves $ref from $defs and filters schema keywords to the exact subset
    supported by Google's protobuf content.Schema:
    ['type', 'format', 'description', 'nullable', 'enum', 'items', 'properties', 'required'].
    Preserves all arbitrary property names inside 'properties' mappings.
    """
    defs = schema.get("$defs", {})

    def resolve_and_filter(obj: Any) -> Any:
        if isinstance(obj, dict):
            if "$ref" in obj:
                ref_key = obj["$ref"].split("/")[-1]
                target = defs.get(ref_key, {})
                merged = {k: v for k, v in obj.items() if k != "$ref"}
                merged.update(target)
                return resolve_and_filter(merged)

            allowed = {"type", "format", "description", "nullable", "enum", "items", "properties", "required"}
            res: dict[str, Any] = {}
            for k, v in obj.items():
                if k == "properties" and isinstance(v, dict):
                    res["properties"] = {prop_name: resolve_and_filter(prop_schema) for prop_name, prop_schema in v.items()}
                elif k in allowed:
                    res[k] = resolve_and_filter(v)
            return res
        elif isinstance(obj, list):
            return [resolve_and_filter(item) for item in obj]
        return obj

    return resolve_and_filter(schema)


class GeminiProvider(BaseLLMProvider):
    """Google Gemini provider using Gemini Flash for generation."""

    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise ProviderException("GEMINI_API_KEY is not configured")
        genai.configure(api_key=settings.gemini_api_key)
        self._model_name = settings.gemini_model
        self._embedding_model = _model_path(settings.gemini_embedding_model)

    @property
    def embedding_dimension(self) -> int:
        """Embeddings are requested at 768 dimensions to match document_chunks.embedding vector(768)."""
        return 768

    def _embed_kwargs(self) -> dict[str, Any]:
        # text-embedding-004 was retired by Google (404 on embedContent). gemini-embedding-001
        # defaults to 3072 dimensions, so the output size is pinned to the column size.
        return {
            "model": self._embedding_model,
            "task_type": "retrieval_document",
            "output_dimensionality": self.embedding_dimension,
        }

    async def generate_text(self, prompt: str, system_prompt: str | None = None, **kwargs) -> str:
        try:
            model = genai.GenerativeModel(
                model_name=self._model_name,
                system_instruction=system_prompt,
            )
            response = await model.generate_content_async(prompt)
            return response.text or ""
        except Exception as e:
            raise ProviderException(f"Gemini text generation failed: {e}") from e

    async def generate_structured(self, prompt: str, schema: dict[str, Any], system_prompt: str | None = None, **kwargs) -> dict[str, Any]:
        try:
            sanitized_schema = _sanitize_schema_for_gemini(schema)
            model = genai.GenerativeModel(
                model_name=self._model_name,
                system_instruction=system_prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    response_schema=sanitized_schema,
                ),
            )
            response = await model.generate_content_async(prompt)
            return json.loads(response.text or "{}")
        except Exception as e:
            raise ProviderException(f"Gemini structured generation failed: {e}") from e

    async def generate_embedding(self, text: str) -> list[float]:
        try:
            result = await genai.embed_content_async(content=text, **self._embed_kwargs())
            return result["embedding"]
        except Exception as e:
            raise ProviderException(f"Gemini embedding failed: {e}") from e

    async def generate_embeddings_batch(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        try:
            results: list[list[float]] = []
            batch_size = 50
            for i in range(0, len(texts), batch_size):
                batch = texts[i : i + batch_size]
                try:
                    res = await genai.embed_content_async(content=batch, **self._embed_kwargs())
                    embs = res.get("embedding", [])
                    if isinstance(embs, list) and len(embs) > 0 and isinstance(embs[0], list):
                        results.extend(embs)
                    elif isinstance(embs, list) and len(batch) == 1 and isinstance(embs[0], (int, float)):
                        results.append(embs)
                    else:
                        raise ValueError("Unexpected embedding response structure from Gemini API")
                except Exception:
                    # Fallback to single-item generation if batch payload format fails
                    for text in batch:
                        single_res = await genai.embed_content_async(content=text, **self._embed_kwargs())
                        results.append(single_res["embedding"])
            return results
        except Exception as e:
            raise ProviderException(f"Gemini batch embedding failed: {e}") from e
