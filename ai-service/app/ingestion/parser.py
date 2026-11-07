"""
EduBranch AI — Document Parser.

Parses PDF and DOCX teaching material files into plain text.
Uses PyPDF for PDF parsing and python-docx for DOCX parsing.

Flow 1 implementation: Material Ingestion & RAG.
"""

import io
import re
import unicodedata
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
        """
        Parse multi-page PDF bytes into plain text with whitespace and UTF-8 normalization.

        Raises:
            DocumentParsingException: if file is empty, corrupted, password-protected/encrypted,
                                      or has no extractable text.
        """
        try:
            from pypdf import PdfReader
            from pypdf.errors import EmptyFileError, FileNotDecryptedError, PdfReadError, PyPdfError
        except ImportError as e:
            raise DocumentParsingException("pypdf is not installed") from e

        if not content or len(content.strip()) == 0:
            raise DocumentParsingException("PDF file is empty")

        try:
            reader = PdfReader(io.BytesIO(content))

            # AC-3: Detect password-protected or encrypted PDF
            if reader.is_encrypted:
                raise DocumentParsingException("Password-protected or encrypted PDF is not supported")

            # AC-1: Extract text from multi-page PDF
            page_texts: list[str] = []
            total_pages = len(reader.pages)
            if total_pages == 0:
                raise DocumentParsingException("PDF file contains zero pages")

            for page_idx, page in enumerate(reader.pages):
                try:
                    page_text = page.extract_text() or ""
                    page_texts.append(page_text)
                except FileNotDecryptedError:
                    raise DocumentParsingException("Password-protected or encrypted PDF is not supported")
                except Exception as extract_err:
                    logger.warning(
                        "pdf_page_extraction_warning",
                        page_index=page_idx,
                        total_pages=total_pages,
                        error=str(extract_err),
                    )
                    page_texts.append("")

            combined_text = "\n\n".join(page_texts)

            # AC-2: Clean whitespace, control characters, and normalize UTF-8
            cleaned = self._clean_text(combined_text)
            if not cleaned.strip():
                raise DocumentParsingException("No extractable text found in PDF (scanned or image-only PDFs require OCR)")

            logger.info("pdf_parsed", page_count=total_pages, char_count=len(cleaned))
            return cleaned

        except DocumentParsingException:
            raise
        except FileNotDecryptedError as e:
            raise DocumentParsingException(f"Password-protected or encrypted PDF is not supported: {e}") from e
        except EmptyFileError as e:
            raise DocumentParsingException(f"PDF file is empty or corrupted: {e}") from e
        except (PdfReadError, PyPdfError) as e:
            raise DocumentParsingException(f"Corrupted or invalid PDF file: {e}") from e
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
    # Text cleaning & UTF-8 normalization (AC-2)
    # =========================================================================
    @staticmethod
    def _clean_text(text: str) -> str:
        """
        Normalize text:
        - Normalize unicode to canonical NFC format (handling Vietnamese diacritics / tones)
        - Remove null bytes, non-printable control chars, zero-width spaces, BOM
        - Normalize line breaks (CRLF/CR -> LF)
        - Collapse consecutive spaces and blank lines
        - Strip leading and trailing whitespace
        """
        if not text:
            return ""

        # 1. Unicode NFC normalization (standardize composite/decomposed accents in Vietnamese)
        text = unicodedata.normalize("NFC", text)

        # 2. Remove null bytes, BOM, zero-width chars, and non-printable control characters
        # Preserve \n (0x0A), \r (0x0D), \t (0x09)
        text = text.replace("\ufeff", "").replace("\ufffe", "").replace("\u200b", "")
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

        # 3. Normalize line breaks to standard \n
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # 4. Collapse multiple horizontal spaces and tabs into a single space
        text = re.sub(r"[ \t]{2,}", " ", text)

        # 5. Collapse excessive blank lines (more than 2 consecutive newlines to 2)
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text.strip()
