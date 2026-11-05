"""
EduBranch AI — Structured logging configuration.
"""

import logging
import sys

import structlog


def _force_utf8_streams() -> None:
    """Vietnamese text in log fields must not crash logging on Windows consoles (cp1252)."""
    for stream in (sys.stdout, sys.stderr, sys.__stdout__, sys.__stderr__):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            try:
                reconfigure(encoding="utf-8", errors="replace")
            except (ValueError, OSError):
                pass


_force_utf8_streams()

_UTF8_STDOUT = None


def _utf8_stdout():
    """A UTF-8 text stream on the process stdout, independent of console wrappers (e.g. colorama)."""
    global _UTF8_STDOUT
    if _UTF8_STDOUT is None:
        try:
            _UTF8_STDOUT = open(  # noqa: SIM115 - lives for the whole process
                sys.__stdout__.fileno(), "w", encoding="utf-8", errors="replace", buffering=1, closefd=False
            )
        except (AttributeError, ValueError, OSError):
            _UTF8_STDOUT = sys.stdout
    return _UTF8_STDOUT


def configure_logging(debug: bool = False) -> None:
    """Configure structlog for the AI service."""
    _force_utf8_streams()
    log_level = logging.DEBUG if debug else logging.INFO

    logging.basicConfig(
        format="%(message)s",
        level=log_level,
    )

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.dev.ConsoleRenderer() if debug else structlog.processors.JSONRenderer(),
        ],
        logger_factory=structlog.PrintLoggerFactory(file=_utf8_stdout()),
        cache_logger_on_first_use=True,
    )


logger = structlog.get_logger()
