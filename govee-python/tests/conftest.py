"""Pytest configuration helpers for the test-suite.

Ensure a default asyncio event loop is installed for the main thread before
tests and test modules are imported. Several legacy tests call
asyncio.get_event_loop().run_until_complete(...), which will raise on Python
builds where no loop has been set for the thread. Installing one here (at
collection time) makes the test-suite deterministic.
"""

import asyncio
import sys
from pathlib import Path

# Ensure the package `src` dir is on sys.path so tests can import the local
# `govee` package when running under pytest from the repository root.
root = Path(__file__).resolve().parents[1]
src = root / "src"
if str(src) not in sys.path:
    sys.path.insert(0, str(src))

try:
    # Prefer get_running_loop() to avoid the deprecation warning emitted by
    # asyncio.get_event_loop() when no loop is set for the current thread.
    asyncio.get_running_loop()
except RuntimeError:
    # If there is no running loop, create and install a new one for the
    # main thread so legacy tests that call
    # asyncio.get_event_loop().run_until_complete(...) continue to work.
    asyncio.set_event_loop(asyncio.new_event_loop())
