"""
EduBranch AI — Unit Tests for Document Chunker.

Tests text chunking without requiring any external services.
"""

import pytest

from app.ingestion.chunker import DocumentChunker, DocumentChunk


class TestDocumentChunker:
    """Tests for DocumentChunker.chunk()."""

    def test_basic_chunking(self):
        """A long text should be split into multiple chunks."""
        text = " ".join(["word"] * 2000)  # 2000 words ~ well over chunk_size
        chunker = DocumentChunker(chunk_size=200, chunk_overlap=20)
        chunks = chunker.chunk(text=text, document_id="test-doc-id")

        assert len(chunks) > 1, "Long text should produce multiple chunks"
        for c in chunks:
            assert isinstance(c, DocumentChunk)
            assert c.document_id == "test-doc-id"
            assert len(c.text) > 0

    def test_chunk_indices_are_sequential(self):
        """Chunk indices should be 0, 1, 2, ..."""
        text = "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five."
        chunker = DocumentChunker(chunk_size=30, chunk_overlap=5)
        chunks = chunker.chunk(text=text, document_id="doc-001")
        indices = [c.chunk_index for c in chunks]
        assert indices == list(range(len(chunks)))

    def test_short_text_single_chunk(self):
        """Text shorter than chunk_size should produce exactly one chunk."""
        text = "Short text."
        chunker = DocumentChunker(chunk_size=512, chunk_overlap=64)
        chunks = chunker.chunk(text=text, document_id="doc-short")
        assert len(chunks) == 1
        assert chunks[0].text == text

    def test_empty_text_returns_empty_list(self):
        """Empty or whitespace-only text should return an empty list without error."""
        chunker = DocumentChunker(chunk_size=512, chunk_overlap=64)
        chunks = chunker.chunk(text="", document_id="doc-empty")
        assert chunks == []

        chunks_ws = chunker.chunk(text="   \n  ", document_id="doc-ws")
        assert chunks_ws == []

    def test_metadata_propagated(self):
        """Source metadata should be stored on each chunk."""
        text = "A " * 300
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)
        meta = {"source": "lecture_slide_1", "page": 1}
        chunks = chunker.chunk(text=text, document_id="doc-meta", metadata=meta)

        for c in chunks:
            assert c.source_metadata["source"] == "lecture_slide_1"
            assert c.source_metadata["page"] == 1

    def test_overlap_is_respected(self):
        """Adjacent chunks should share some text (due to overlap)."""
        # Use a very small chunk and large overlap to make sharing obvious
        text = "ABCDEFGHIJ" * 50  # 500 chars
        chunker = DocumentChunker(chunk_size=50, chunk_overlap=25)
        chunks = chunker.chunk(text=text, document_id="doc-overlap")

        if len(chunks) >= 2:
            # The end of chunk[0] and start of chunk[1] should share characters
            end_of_first = chunks[0].text[-25:]
            start_of_second = chunks[1].text[:25]
            # At least some overlap
            common = set(end_of_first) & set(start_of_second)
            assert len(common) > 0, "Adjacent chunks should share content due to overlap"
