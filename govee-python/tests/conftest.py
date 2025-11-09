"""Pytest configuration helpers for the test-suite.

Ensure a default asyncio event loop is installed for the main thread before
tests and test modules are imported. Several legacy tests call
asyncio.get_event_loop().run_until_complete(...), which will raise on Python
builds where no loop has been set for the thread. Installing one here (at
collection time) makes the test-suite deterministic.
"""
import asyncio

try:
    asyncio.get_event_loop()
except RuntimeError:
    asyncio.set_event_loop(asyncio.new_event_loop())
