"""
EduBranch AI — Document Chunker.

Splits parsed document text into overlapping chunks suitable for embedding and RAG.
Uses LangChain RecursiveCharacterTextSplitter to preserve paragraph and sentence boundaries.

Flow 1 implementation: Material Ingestion & RAG (BE-009 / EBA-212).
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
    source_metadata: dict = field(default_factory=dict)  # e.g. chunk_index, document_id, page, section


class DocumentChunker:
    """
    Splits document text into overlapping chunks using LangChain text splitter.

    Acceptance Criteria (BE-009 / EBA-212):
    - AC-1: Chunk size between 500-1000 with overlap 100.
    - AC-2: Preserves sentence and paragraph boundaries via RecursiveCharacterTextSplitter.
    - AC-3: Attaches sequential chunk_index (0, 1, 2...) and document metadata to each chunk.
    """

    DEFAULT_CHUNK_SIZE = 800
    DEFAULT_CHUNK_OVERLAP = 100

    def __init__(
        self,
        chunk_size: int | None = None,
        chunk_overlap: int | None = None,
        use_tokens: bool = False,
    ):
        self.chunk_size = (
            chunk_size
            if chunk_size is not None
            else getattr(settings, "rag_chunk_size", self.DEFAULT_CHUNK_SIZE)
        )
        self.chunk_overlap = (
            chunk_overlap
            if chunk_overlap is not None
            else getattr(settings, "rag_chunk_overlap", self.DEFAULT_CHUNK_OVERLAP)
        )
        self.use_tokens = use_tokens

    def chunk(
        self,
        text: str,
        document_id: str,
        metadata: dict | None = None,
    ) -> list[DocumentChunk]:
        """
        Split text into overlapping chunks while preserving sentence/paragraph boundaries.

        Args:
            text: Full document text
            document_id: Source document UUID (for tenant and citation isolation)
            metadata: Optional metadata (e.g. filename, course_id, page numbers)

        Returns:
            List of DocumentChunk objects with sequential chunk_index and metadata.
        """
        if not text or not text.strip():
            logger.warning("chunker_empty_text", document_id=document_id)
            return []

        try:
            from langchain_text_splitters import RecursiveCharacterTextSplitter
        except ImportError as e:
            raise ImportError("langchain-text-splitters is not installed") from e

        # AC-2: Preserve paragraph (\n\n), line breaks (\n), and sentence boundaries (. , ? , ! )
        separators = ["\n\n", "\n", ". ", "? ", "! ", " ", ""]

        if self.use_tokens:
            splitter = RecursiveCharacterTextSplitter.from_tiktoken_encoder(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                separators=separators,
            )
        else:
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.chunk_size,
                chunk_overlap=self.chunk_overlap,
                length_function=len,
                separators=separators,
            )

        raw_chunks = splitter.split_text(text)

        # AC-3: Attach sequential chunk_index and document metadata
        chunks: list[DocumentChunk] = []
        for raw_chunk in raw_chunks:
            stripped = raw_chunk.strip()
            if not stripped:
                continue

            idx = len(chunks)
            chunk_metadata = dict(metadata or {})
            chunk_metadata["chunk_index"] = idx
            chunk_metadata["document_id"] = document_id
            chunk_metadata["char_count"] = len(stripped)

            chunks.append(
                DocumentChunk(
                    chunk_index=idx,
                    text=stripped,
                    document_id=document_id,
                    source_metadata=chunk_metadata,
                )
            )

        logger.info(
            "document_chunked",
            document_id=document_id,
            chunk_count=len(chunks),
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            use_tokens=self.use_tokens,
        )
        return chunks
