"""
EduBranch AI — Document Parser.

Parses PDF and DOCX teaching material files into plain text.
Uses PyPDF for PDF parsing and python-docx for DOCX parsing.

Flow 1 implementation: Material Ingestion & RAG.
"""

import io
import re
from pathlib import Path

from app.core.exceptions import DocumentParsingException
from app.core.logging import logger


class DocumentParser:
    """Parses PDF and DOCX files into text."""

    SUPPORTED_MIME_TYPES = {
        "application/pdf": "_parse_pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "_parse_docx",
    }

    def parse(self, file_path: Path, mime_type: str) -> str:
        """
        Parse a document file into plain text.

        Args:
            file_path: Path to the downloaded file from MinIO
            mime_type: MIME type of the document

        Returns:
            Extracted plain text

        Raises:
            DocumentParsingException: if parsing fails or MIME type is unsupported
        """
        handler_name = self.SUPPORTED_MIME_TYPES.get(mime_type)
        if not handler_name:
            raise DocumentParsingException(f"Unsupported MIME type: {mime_type}")

        handler = getattr(self, handler_name)
        logger.info("parsing_document", mime_type=mime_type, path=str(file_path))
        return handler(file_path)

    def parse_bytes(self, content: bytes, mime_type: str) -> str:
        """
        Parse document bytes directly (without writing to disk first).

        Args:
            content: Raw bytes from MinIO
            mime_type: MIME type of the document

        Returns:
            Extracted plain text
        """
        if mime_type == "application/pdf":
            return self._parse_pdf_bytes(content)
        elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return self._parse_docx_bytes(content)
        else:
            raise DocumentParsingException(f"Unsupported MIME type: {mime_type}")

    # =========================================================================
    # PDF
    # =========================================================================
    def _parse_pdf(self, file_path: Path) -> str:
        try:
            with open(file_path, "rb") as f:
                return self._parse_pdf_bytes(f.read())
        except DocumentParsingException:
            raise
        except Exception as e:
            raise DocumentParsingException(f"PDF parsing failed: {e}") from e

    def _parse_pdf_bytes(self, content: bytes) -> str:
        try:
            from pypdf import PdfReader
        except ImportError as e:
            raise DocumentParsingException("pypdf is not installed") from e

        try:
            reader = PdfReader(io.BytesIO(content))
            if reader.is_encrypted:
                raise DocumentParsingException("Encrypted PDF not supported")

            pages = []
            for page in reader.pages:
                text = page.extract_text() or ""
                pages.append(text)

            full_text = "\n".join(pages)
            cleaned = self._clean_text(full_text)
            if not cleaned.strip():
                raise DocumentParsingException("No extractable text found in PDF")

            logger.info("pdf_parsed", page_count=len(reader.pages), char_count=len(cleaned))
            return cleaned
        except DocumentParsingException:
            raise
        except Exception as e:
            raise DocumentParsingException(f"PDF parsing failed: {e}") from e

    # =========================================================================
    # DOCX
    # =========================================================================
    def _parse_docx(self, file_path: Path) -> str:
        try:
            with open(file_path, "rb") as f:
                return self._parse_docx_bytes(f.read())
        except DocumentParsingException:
            raise
        except Exception as e:
            raise DocumentParsingException(f"DOCX parsing failed: {e}") from e

    def _parse_docx_bytes(self, content: bytes) -> str:
        try:
            from docx import Document
        except ImportError as e:
            raise DocumentParsingException("python-docx is not installed") from e

        try:
            doc = Document(io.BytesIO(content))
            paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
            full_text = "\n".join(paragraphs)
            cleaned = self._clean_text(full_text)
            if not cleaned.strip():
                raise DocumentParsingException("No extractable text found in DOCX")

            logger.info("docx_parsed", paragraph_count=len(paragraphs), char_count=len(cleaned))
            return cleaned
        except DocumentParsingException:
            raise
        except Exception as e:
            raise DocumentParsingException(f"DOCX parsing failed: {e}") from e

    # =========================================================================
    # Text cleaning
    # =========================================================================
    @staticmethod
    def _clean_text(text: str) -> str:
        """Remove control characters and normalize whitespace."""
        # Remove null bytes and other control chars (except newlines and tabs)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
        # Collapse multiple blank lines
        text = re.sub(r"\n{3,}", "\n\n", text)
        # Collapse multiple spaces (but not newlines)
        text = re.sub(r"[ \t]{2,}", " ", text)
        return text.strip()
