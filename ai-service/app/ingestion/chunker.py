"""
EduBranch AI — Document Chunker.

Splits parsed document text into overlapping chunks suitable for embedding.
Uses LangChain RecursiveCharacterTextSplitter.

Flow 1 implementation: Material Ingestion & RAG.
"""

from dataclasses import dataclass, field
from app.core.config import settings
from app.core.logging import logger


@dataclass
class DocumentChunk:
    """A single text chunk from a parsed document."""
    chunk_index: int
    text: str
    document_id: str
    source_metadata: dict = field(default_factory=dict)  # e.g. page number, section


class DocumentChunker:
    """Splits document text into overlapping chunks using LangChain text splitter."""

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
    ):
        self.chunk_size = chunk_size or settings.rag_chunk_size
        self.chunk_overlap = chunk_overlap or settings.rag_chunk_overlap

    def chunk(
        self,
        text: str,
        document_id: str,
        metadata: dict | None = None,
    ) -> list[DocumentChunk]:
        """
        Split text into overlapping chunks.

        Args:
            text: Full document text
            document_id: Source document UUID (for citation)
            metadata: Optional metadata (page numbers, section, etc.)

        Returns:
            List of DocumentChunk objects
        """
        if not text or not text.strip():
            logger.warning("chunker_empty_text", document_id=document_id)
            return []

        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
        except ImportError as e:
            raise ImportError("langchain-text-splitters is not installed") from e

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", ". ", " ", ""],
        )

        raw_chunks = splitter.split_text(text)

        chunks: list[DocumentChunk] = []
        for idx, chunk_text in enumerate(raw_chunks):
            stripped = chunk_text.strip()
            if not stripped:
                continue
            chunks.append(
                DocumentChunk(
                    chunk_index=idx,
                    text=stripped,
                    document_id=document_id,
                    source_metadata=metadata or {},
                )
            )

        logger.info(
            "document_chunked",
            document_id=document_id,
            chunk_count=len(chunks),
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
        )
        return chunks
