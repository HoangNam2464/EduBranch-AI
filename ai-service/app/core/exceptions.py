"""
EduBranch AI — Custom Exception Types for the AI Service.
"""


class ProviderException(Exception):
    """Raised when an LLM provider call fails."""


class DocumentParsingException(Exception):
    """Raised when a document cannot be parsed."""


class EmbeddingException(Exception):
    """Raised when embedding generation fails."""


class RetrievalException(Exception):
    """Raised when vector retrieval fails."""


class DatabaseException(Exception):
    """Raised when a database query or persistence operation fails."""


class CaseGenerationException(Exception):
    """Raised when case generation fails or produces invalid output."""


class GenerationTimeoutError(CaseGenerationException):
    """Raised when provider call or overall generation times out (AC-4, AC-8)."""


class GenerationRetryExhaustedError(CaseGenerationException):
    """Raised when transient retry attempts are exhausted without success (AC-5, AC-8)."""


class GenerationValidationError(CaseGenerationException):
    """Raised when generated output repeatedly fails schema or graph validation (AC-3, AC-8)."""


class NonRetryableProviderError(CaseGenerationException):
    """Raised when a non-recoverable 4xx or fatal provider error occurs (AC-7)."""


class IdempotencyConflictError(CaseGenerationException):
    """Raised when duplicate request has conflicting parameters (AC-9)."""


class ChallengeSupportException(Exception):
    """Raised when AI Reasoning/Challenge Support fails to generate a counter-question."""


# Backward compatibility alias
DebateAssistantException = ChallengeSupportException
