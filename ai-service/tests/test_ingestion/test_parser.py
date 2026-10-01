"""
EduBranch AI — Unit Tests for Document Parser.

Tests PDF and DOCX parsing without requiring real files (uses synthetic data).
No external services required.
"""

import io
import pytest

from app.ingestion.parser import DocumentParser
from app.core.exceptions import DocumentParsingException


# ---------------------------------------------------------------------------
# Helpers to build synthetic in-memory documents
# ---------------------------------------------------------------------------
def make_pdf_bytes(text: str) -> bytes:
    """Create a minimal valid PDF with the given text using reportlab if available,
    otherwise uses PyPDF to create a simple one-page PDF."""
    try:
        from reportlab.pdfgen import canvas
        buf = io.BytesIO()
        c = canvas.Canvas(buf)
        c.drawString(100, 750, text)
        c.save()
        return buf.getvalue()
    except ImportError:
        # Fallback: create minimal PDF manually
        # This is a bare-minimum valid PDF with text content
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
    """Tests for DocumentParser.parse_bytes()."""

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
        # Add empty paragraph only
        doc.add_paragraph("")
        buf = io.BytesIO()
        doc.save(buf)

        parser = DocumentParser()
        with pytest.raises(DocumentParsingException, match="No extractable text"):
            parser.parse_bytes(buf.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

    def test_text_cleaning(self):
        """Parser should strip excessive whitespace and control chars."""
        parser = DocumentParser()
        text = "  Hello   \x00\x01 World  \n\n\n\n  "
        cleaned = parser._clean_text(text)
        assert "\x00" not in cleaned
        assert "\x01" not in cleaned
        # Should not have more than 2 consecutive newlines
        assert "\n\n\n" not in cleaned
