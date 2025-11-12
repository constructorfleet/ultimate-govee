"""SegmentColorMode state placeholder for RGBIC parity.

This is a minimal implementation to support parsing of 'segments' payloads
and expose a simple interface for tests. It is not a full port of the TS
state but provides the expected surface for initial parity tests.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional


class SegmentColorModeState:
    def __init__(self, device: Any):
        self.device = device
        self.segments: List[Dict[str, Any]] = []

    def parse(self, payload: Dict[str, Any]) -> None:
        segs = payload.get('segments') or []
        out = []
        for s in segs:
            out.append({'index': int(s.get('index',0)), 'length': int(s.get('length',0)), 'color': s.get('color')})
        self.segments = out

    def get(self) -> List[Dict[str, Any]]:
        return self.segments


__all__ = ['SegmentColorModeState']

