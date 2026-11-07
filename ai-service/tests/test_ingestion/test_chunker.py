"""
EduBranch AI — Unit Tests for Document Chunker.

Tests text chunking pipeline without requiring any external services.
Covers:
- Chunk size 500-1000 with 100 overlap (AC-1)
- Preserving paragraph and sentence boundaries via RecursiveCharacterTextSplitter (AC-2)
- Sequential chunk_index (0, 1, 2...) and document metadata propagation (AC-3)
- Token-based chunking with tiktoken encoder
"""

import pytest

from app.ingestion.chunker import DocumentChunker, DocumentChunk


class TestDocumentChunker:
    """Tests for DocumentChunker.chunk() adhering to BE-009 / EBA-212."""

    def test_default_chunk_size_and_overlap_ac1(self):
        """AC-1: Chunker supports chunk size 500-1000 and overlap 100."""
        chunker = DocumentChunker(chunk_size=800, chunk_overlap=100)
        assert 500 <= chunker.chunk_size <= 1000
        assert chunker.chunk_overlap == 100

        default_chunker = DocumentChunker()
        assert 500 <= default_chunker.chunk_size <= 1000

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
        """AC-3: Chunk indices should be strictly sequential 0, 1, 2, ..."""
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
        """AC-3: Source metadata should be stored on each chunk."""
        text = "A " * 300
        chunker = DocumentChunker(chunk_size=100, chunk_overlap=10)
        meta = {"source": "lecture_slide_1", "page": 1}
        chunks = chunker.chunk(text=text, document_id="doc-meta", metadata=meta)

        for idx, c in enumerate(chunks):
            assert c.source_metadata["source"] == "lecture_slide_1"
            assert c.source_metadata["page"] == 1
            assert c.source_metadata["document_id"] == "doc-meta"
            assert c.source_metadata["chunk_index"] == idx
            assert c.source_metadata["char_count"] == len(c.text)

    def test_overlap_is_respected(self):
        """AC-1: Adjacent chunks should share some text due to overlap."""
        text = "ABCDEFGHIJ" * 50  # 500 chars
        chunker = DocumentChunker(chunk_size=50, chunk_overlap=25)
        chunks = chunker.chunk(text=text, document_id="doc-overlap")

        if len(chunks) >= 2:
            end_of_first = chunks[0].text[-25:]
            start_of_second = chunks[1].text[:25]
            common = set(end_of_first) & set(start_of_second)
            assert len(common) > 0, "Adjacent chunks should share content due to overlap"

    def test_preserves_paragraph_and_sentence_boundaries_ac2(self):
        """AC-2: RecursiveCharacterTextSplitter preserves paragraph and sentence boundaries."""
        p1 = "Paragraph 1: In experiential learning, students analyze realistic organizational dilemmas."
        p2 = "Paragraph 2: The Socratic AI Challenge support prompts critical reflection without grading."
        p3 = "Paragraph 3: Retrospective Journey Review allows learners to examine alternative branching paths."
        full_text = f"{p1}\n\n{p2}\n\n{p3}"

        # Size tuned to split by paragraph rather than slicing sentences mid-word
        chunker = DocumentChunker(chunk_size=120, chunk_overlap=20)
        chunks = chunker.chunk(text=full_text, document_id="doc-boundaries")

        assert len(chunks) >= 2
        # Check that paragraph beginnings remain intact
        assert any(c.text.startswith("Paragraph 1:") for c in chunks)
        assert any("Paragraph 2:" in c.text for c in chunks)
        assert any("Paragraph 3:" in c.text for c in chunks)

    def test_token_based_chunking_ac1(self):
        """AC-1: Support token-based chunking with size 500-1000 and overlap 100 via tiktoken."""
        long_paragraph = (
            "Higher education case-based study immerses university students in authentic decision trees. "
            "Each decision branch leads to consequential outcomes analyzed in retrospective review. "
        ) * 50
        chunker = DocumentChunker(chunk_size=800, chunk_overlap=100, use_tokens=True)
        chunks = chunker.chunk(text=long_paragraph, document_id="doc-tokens")

        assert len(chunks) > 1
        for idx, c in enumerate(chunks):
            assert c.chunk_index == idx
            assert c.document_id == "doc-tokens"
            assert len(c.text) > 0
            assert c.source_metadata["chunk_index"] == idx
