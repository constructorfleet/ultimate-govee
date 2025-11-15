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

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encode segment-related parts of a command into frames.

        Expects command to possibly contain a 'segments' list of dicts with
        'index' and 'color' keys. Returns a list of segment frames using the
        shared encoding helper.
        """
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        from ..encoding import encode_segment
        for s in command.get('segments', []):
            try:
                idx = int(s.get('index', 0))
                c = s.get('color') or {}
                frames.append(encode_segment(idx, { 'r': int(c.get('r',0)), 'g': int(c.get('g',0)), 'b': int(c.get('b',0)) }))
            except Exception:
                continue
        return frames


__all__ = ['SegmentColorModeState']

