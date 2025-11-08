"""govee - a minimal Python package scaffold for the ultimate-govee translation

This package provides a tiny public surface so tests and tooling can import
the package during early development.
"""

__all__ = ["__version__", "hello"]

__version__ = "0.1.0"

def hello(name: str = "world") -> str:
    """Return a friendly greeting.

    Kept intentionally trivial so early unit tests can run without
    depending on other modules.
    """
    return f"hello {name}"

