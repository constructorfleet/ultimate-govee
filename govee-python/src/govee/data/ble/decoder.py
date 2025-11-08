"""Minimal BLE advertisement decoder for tests.

This is a simplified decoder to provide parity for unit tests: it recognizes
advertisements with a 'name' starting with 'Govee' and parses a simple
manufacturer_data format of b"MODEL|MAC".
"""
from __future__ import annotations

from typing import Optional, Dict, Any


class GoveeBleDecoder:
    def decode(self, service_info: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        name = service_info.get('name')
        if not name or not str(name).lower().startswith('govee'):
            return None

        md = service_info.get('manufacturer_data')
        if not md:
            return {'name': name}

        try:
            if isinstance(md, bytes):
                text = md.decode('utf-8')
            else:
                text = str(md)
            parts = text.split('|')
            model = parts[0]
            mac = parts[1] if len(parts) > 1 else None
            return {'name': name, 'model': model, 'mac': mac}
        except Exception:
            return {'name': name}
