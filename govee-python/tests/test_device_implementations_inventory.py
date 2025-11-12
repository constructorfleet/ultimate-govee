"""Inventory test for device implementations.

This test exercises the implementations package to show which device
implementations are present. It is intentionally written to fail when the
RGBIC implementation is missing so it guides subsequent work.
"""

from __future__ import annotations

import importlib
import pkgutil
from typing import Set


def _impl_names() -> Set[str]:
    pkg = importlib.import_module("govee.domain.devices.implementations")
    names = set()
    for _, modname, ispkg in pkgutil.iter_modules(pkg.__path__, pkg.__name__ + "."):
        if not ispkg:
            names.add(modname.rsplit(".", 1)[-1])
    return names


def test_device_implementations_inventory():
    names = _impl_names()
    # We expect the rgb implementation to exist
    assert "rgb" in names

    # For parity we expect an rgbic implementation; this test is RED until
    # that implementation is added.
    assert (
        "rgbic" in names
    ), f"Expected 'rgbic' in implementations, found: {sorted(names)}"
