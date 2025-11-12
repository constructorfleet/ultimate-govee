#!/usr/bin/env python3
"""Generate a simple device model mapping JSON from persisted/govee.devices.json.

This script extracts model names from the persisted devices file and
produces persisted/device_model_mapping.json with heuristic mappings for
use by the Python device factory.
"""
import json
from pathlib import Path


def main():
    repo = Path(__file__).resolve().parents[1]
    src = repo / 'persisted' / 'govee.devices.json'
    out = repo / 'persisted' / 'device_model_mapping.json'
    if not src.exists():
        print('persisted/govee.devices.json not found')
        return
    obj = json.loads(src.read_text())
    models = set()
    for d in obj.get('devices', []) if isinstance(obj, dict) else obj:
        try:
            m = d.get('deviceExt', {}).get('deviceSettings', {}).get('model') or d.get('sku') or d.get('model')
            if m:
                models.add(str(m))
        except Exception:
            continue
    mappings = []
    for m in sorted(models):
        if 'RGBIC' in m.upper() or 'RGBIC' in m:
            impl = 'rgbic'
        elif 'H6042' in m.upper() or 'RGBIC' in m.upper():
            impl = 'rgbic'
        elif m.upper().startswith('H5') or any(x in m.upper() for x in ['H507','H517']):
            impl = 'rgb'
        elif m.upper().startswith('H6'):
            impl = 'white'
        elif m.upper().startswith('S-'):
            impl = 'sensor'
        else:
            impl = 'white'
        mappings.append({'pattern': m, 'impl': impl})
    out.write_text(json.dumps({'mappings': mappings}, indent=2))
    print('wrote', out)


if __name__ == '__main__':
    main()

