"""govee - a minimal Python package scaffold for the ultimate-govee translation

This package provides a tiny public surface so tests and tooling can import
the package during early development.
"""

"""govee package public surface.

Expose lightweight utilities used by the early translated modules and tests.
"""

from .types import Credentials  # re-export common types for tests
from .utils import first, partition
from .errors import GoveeError
from .bitflags import create_bitflags_enum
from .fixed_length_stack import FixedLengthStack

__all__ = [
    "Credentials",
    "first",
    "partition",
    "GoveeError",
    "create_bitflags_enum",
    "FixedLengthStack",
]

__version__ = "0.1.0"


def hello(name: str = "world") -> str:
    return f"hello {name}"

# Ensure subpackages like govee.data can be imported as packages by tests
from . import data  # type: ignore
