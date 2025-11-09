"""Minimal device-specific decoders used by DecoderService tests.

This module mirrors the TypeScript `devices` collection which contains
per-model decoder functions. For tests we provide a small mapping for
model '6112' (H6112) to demonstrate DecoderService calling a known
model decoder.
"""
from __future__ import annotations

from typing import Dict, Any, Optional


def _h6112_decoder(advertisement: Dict[str, Any]) -> Dict[str, Any]:
    """Decode a very small subset of H6112 advertisement payloads.

    Expect advertisement to possibly include 'manufacturer_data' which
    may be bytes or a string containing a mac address after a '|'.
    """
    md = advertisement.get("manufacturer_data")
    mac = None
    if isinstance(md, bytes):
        try:
            text = md.decode("utf-8")
        except Exception:
            text = ""
    else:
        text = str(md) if md is not None else ""

    if "|" in text:
        parts = text.split("|")
        if len(parts) > 1:
            mac = parts[1]

    return {
        "model": "H6112",
        "modelName": "H6112 Example",
        "address": mac,
        "state": {},
    }


decode_device: Dict[str, Any] = {
    # key is the captured group from the model regex (e.g. '6112' for H6112)
    "6112": _h6112_decoder,
}
