"""
EduBranch AI — Unit Tests for Document Parser.

Tests PDF and DOCX parsing without requiring real external files (uses synthetic in-memory data).
Covers:
- Multi-page PDF text extraction (AC-1)
- Whitespace cleanup, control character removal, and UTF-8 NFC normalization (AC-2)
- Detection of corrupted, encrypted, empty, or unparseable PDFs with exceptions (AC-3)
"""

import io
import unicodedata
import pytest
from pypdf import PdfReader, PdfWriter

from app.ingestion.parser import DocumentParser
from app.core.exceptions import DocumentParsingException


# ---------------------------------------------------------------------------
# Helpers to build synthetic in-memory documents
# ---------------------------------------------------------------------------
def make_pdf_bytes(text: str) -> bytes:
    """Create a minimal valid single-page PDF with the given text."""
    content = (
        "%PDF-1.4\n"
        "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        "/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        f"4 0 obj\n<< /Length {len(text) + 20} >>\nstream\n"
        f"BT /F1 12 Tf 100 700 Td ({text}) Tj ET\nendstream\nendobj\n"
        "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        "xref\n0 6\n0000000000 65535 f \n"
        "0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n"
        "0000000266 00000 n \n0000000360 00000 n \n"
        "trailer\n<< /Size 6 /Root 1 0 R >>\n"
        "startxref\n430\n%%EOF"
    )
    return content.encode("latin-1")


def make_multipage_pdf_bytes(pages: list[str]) -> bytes:
    """Create a multi-page PDF with distinct text content per page."""
    writer = PdfWriter()
    for page_text in pages:
        single_page_pdf = make_pdf_bytes(page_text)
        reader = PdfReader(io.BytesIO(single_page_pdf))
        writer.add_page(reader.pages[0])
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def make_encrypted_pdf_bytes(text: str, password: str = "secret123") -> bytes:
    """Create an encrypted/password-protected PDF."""
    single_page_pdf = make_pdf_bytes(text)
    reader = PdfReader(io.BytesIO(single_page_pdf))
    writer = PdfWriter()
    writer.add_page(reader.pages[0])
    writer.encrypt(password)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def make_blank_page_pdf_bytes() -> bytes:
    """Create a valid PDF with a blank page containing zero text content."""
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def make_docx_bytes(text: str) -> bytes:
    """Create a minimal DOCX file with the given text using python-docx."""
    from docx import Document
    doc = Document()
    doc.add_paragraph(text)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ---------------------------------------------------------------------------
# Parser tests
# ---------------------------------------------------------------------------
class TestDocumentParser:
    """Tests for DocumentParser parsing and normalization."""

    # -----------------------------------------------------------------------
    # PDF parsing tests (BE-007)
    # -----------------------------------------------------------------------
    def test_pdf_parse_multi_page(self):
        """AC-1: Multi-page PDF text extraction should extract all pages sequentially."""
        pages = [
            "Chapter 1: Strategic Management Foundations",
            "Chapter 2: Decision Trees and Branching Scenarios",
            "Chapter 3: Experiential Review and Cohort Outcomes",
        ]
        content = make_multipage_pdf_bytes(pages)
        parser = DocumentParser()

        result = parser.parse_bytes(content, "application/pdf")

        for page in pages:
            assert page in result
        # Check that pages are separated by double newline
        assert "Chapter 1: Strategic Management Foundations\n\nChapter 2:" in result

    def test_pdf_parse_single_page(self):
        """AC-1: Single-page PDF text extraction should return cleaned text."""
        content = make_pdf_bytes("University Case Study Syllabus")
        parser = DocumentParser()

        result = parser.parse_bytes(content, "application/pdf")
        assert "University Case Study Syllabus" in result

    def test_pdf_encrypted_raises_exception(self):
        """AC-3: Password-protected or encrypted PDF must raise DocumentParsingException."""
        content = make_encrypted_pdf_bytes("Confidential exam content", password="lecturer_pass")
        parser = DocumentParser()

        with pytest.raises(DocumentParsingException, match="Password-protected or encrypted PDF"):
            parser.parse_bytes(content, "application/pdf")

    def test_pdf_corrupted_raises_exception(self):
        """AC-3: Corrupted PDF file must raise DocumentParsingException."""
        corrupted_content = b"%PDF-1.4\ncorrupted random bytes that do not form a valid stream\n%%EOF"
        parser = DocumentParser()

        with pytest.raises(DocumentParsingException, match="Corrupted or invalid PDF file"):
            parser.parse_bytes(corrupted_content, "application/pdf")

    def test_pdf_empty_raises_exception(self):
        """AC-3: Empty bytes must raise DocumentParsingException."""
        parser = DocumentParser()

        with pytest.raises(DocumentParsingException, match="PDF file is empty"):
            parser.parse_bytes(b"", "application/pdf")

        with pytest.raises(DocumentParsingException, match="PDF file is empty"):
            parser.parse_bytes(b"   ", "application/pdf")

    def test_pdf_no_extractable_text_raises_exception(self):
        """AC-3: PDF with blank pages or scanned images without text must raise DocumentParsingException."""
        content = make_blank_page_pdf_bytes()
        parser = DocumentParser()

        with pytest.raises(DocumentParsingException, match="No extractable text found in PDF"):
            parser.parse_bytes(content, "application/pdf")

    # -----------------------------------------------------------------------
    # Text cleaning and UTF-8 normalization (AC-2)
    # -----------------------------------------------------------------------
    def test_text_cleaning_control_characters(self):
        """AC-2: Parser must remove null bytes, BOM, zero-width chars, and ASCII control characters."""
        parser = DocumentParser()
        raw_text = "  Hello \x00\x01\x08\x0b\x0c\x1f\x7f\ufeff\u200bWorld!  "
        cleaned = parser._clean_text(raw_text)

        assert cleaned == "Hello World!"
        assert "\x00" not in cleaned
        assert "\ufeff" not in cleaned
        assert "\u200b" not in cleaned

    def test_text_cleaning_whitespace_collapse(self):
        """AC-2: Parser must collapse excessive horizontal whitespace and limit blank lines."""
        parser = DocumentParser()
        raw_text = "Title   Section   1\n\n\n\n\nParagraph text here.    \t   More text.\r\nNext line."
        cleaned = parser._clean_text(raw_text)

        # Tabs and multiple spaces collapsed to single space
        assert "Title Section 1" in cleaned
        assert "Paragraph text here. More text." in cleaned
        # \r\n converted to \n
        assert "\r" not in cleaned
        # More than 2 consecutive newlines collapsed to 2
        assert "\n\n\n" not in cleaned

    def test_text_cleaning_vietnamese_utf8_normalization(self):
        """AC-2: Parser must normalize decomposed (NFD) Vietnamese characters into canonical NFC format."""
        # Decomposed NFD Vietnamese string: "Trường Đại học Kinh tế & Luật"
        decomposed_text = unicodedata.normalize("NFD", "Trường Đại học Kinh tế & Luật")
        assert not unicodedata.is_normalized("NFC", decomposed_text)

        cleaned = DocumentParser._clean_text(decomposed_text)

        assert unicodedata.is_normalized("NFC", cleaned)
        assert cleaned == "Trường Đại học Kinh tế & Luật"

    # -----------------------------------------------------------------------
    # DOCX parsing tests
    # -----------------------------------------------------------------------
    def test_docx_parse_simple_text(self):
        """DOCX with a single paragraph should return that text."""
        content = make_docx_bytes("Hello, university students!")
        parser = DocumentParser()
        result = parser.parse_bytes(content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        assert "Hello, university students!" in result

    def test_docx_parse_multiple_paragraphs(self):
        """DOCX with multiple paragraphs should return all text."""
        from docx import Document
        doc = Document()
        doc.add_paragraph("First paragraph about business ethics.")
        doc.add_paragraph("Second paragraph about decision making.")
        buf = io.BytesIO()
        doc.save(buf)
        content = buf.getvalue()

        parser = DocumentParser()
        result = parser.parse_bytes(content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        assert "First paragraph" in result
        assert "Second paragraph" in result

    def test_unsupported_mime_type_raises(self):
        """Unsupported MIME type should raise DocumentParsingException."""
        parser = DocumentParser()
        with pytest.raises(DocumentParsingException, match="Unsupported MIME type"):
            parser.parse_bytes(b"some data", "text/plain")

    def test_empty_docx_raises(self):
        """DOCX with no text content should raise DocumentParsingException."""
        from docx import Document
        doc = Document()
        doc.add_paragraph("")
        buf = io.BytesIO()
        doc.save(buf)

        parser = DocumentParser()
        with pytest.raises(DocumentParsingException, match="No extractable text"):
            parser.parse_bytes(buf.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
