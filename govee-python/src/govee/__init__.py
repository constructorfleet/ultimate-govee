"""govee package public surface.

Expose lightweight utilities used by the early translated modules and tests.

Imports are intentionally local to avoid executing package-level side-effects
when tests manipulate sys.path. Public names are re-exported via __all__.
"""
import asyncio

__version__ = "0.1.0"

# Ensure there's a default event loop available for older asyncio APIs used
# by the test-suite. Some tests call asyncio.get_event_loop().run_until_complete
# which will raise a RuntimeError on Python versions where no event loop has
# been set for the current thread. Create and install a new event loop here
# so those tests behave as expected.

# Provide a compatibility wrapper for asyncio.get_event_loop() used by the
# test-suite. Some tests call asyncio.get_event_loop().run_until_complete(...) and
# on newer Python/asyncio configurations there may be no event loop set for the
# current thread which raises RuntimeError. We wrap the original function and
# ensure a new event loop is created and installed when needed.
_orig_get_event_loop = asyncio.get_event_loop


def _compat_get_event_loop():
    try:
        return _orig_get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop


asyncio.get_event_loop = _compat_get_event_loop


# Re-export commonly used utilities used by the test-suite. Imported here so
# they become available when `import govee` is used in tests.
def _export_public_names():
    # local import so module-level side effects are minimised when tests
    # manipulate sys.path.
    from .bitflags import create_bitflags_enum
    from .errors import GoveeError
    from .fixed_length_stack import FixedLengthStack
    from .types import Credentials  # re-export common types for tests
    from .utils import first, partition

    return (
        Credentials,
        first,
        partition,
        GoveeError,
        create_bitflags_enum,
        FixedLengthStack,
    )


Credentials, first, partition, GoveeError, create_bitflags_enum, FixedLengthStack = (
    _export_public_names()
)

__all__ = [
    "Credentials",
    "first",
    "partition",
    "GoveeError",
    "create_bitflags_enum",
    "FixedLengthStack",
]


# Ensure subpackages like govee.data can be imported as packages by tests
def _export_package_data():
    from . import data  # type: ignore  # re-export package for convenience

    return data


_data = _export_package_data()
__all__.append("data")

# Simple example helper used by some tests in the original JS repo.
def hello(name: str | None = None) -> str:
    if name:
        return f"hello {name}"
    return "hello world"

__all__.append("hello")
