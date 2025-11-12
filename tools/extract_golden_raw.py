#!/usr/bin/env python3
"""Extract raw op command frames from persisted raw logs into golden fixtures.

Usage: run from repository root. It will scan persisted/*.{iot-raw.log,iot-status.json}
and group base64 op.command entries by model (from persisted/govee.devices.json)
and write fixtures to govee-python/tests/fixtures/golden/raw/<model>.json
"""
import base64
import json
from pathlib import Path
from typing import Dict, List


def decode_b64_to_ints(s: str) -> List[int]:
    if s is None:
        return []
    # pad
    pad = (-len(s)) % 4
    if pad:
        s = s + ("=" * pad)
    b = base64.b64decode(s)
    return list(b)


def load_device_models() -> Dict[str, str]:
    p = Path('persisted') / 'govee.devices.json'
    if not p.exists():
        return {}
    obj = json.loads(p.read_text())
    mapping = {}
    for d in obj.get('devices', []):
        dev = d.get('device')
        model = d.get('deviceExt', {}).get('deviceSettings', {}).get('model') or d.get('sku')
        if dev and model:
            mapping[dev] = model
    return mapping


def extract():
    repo = Path('.').resolve()
    persisted = repo / 'persisted'
    out_dir = repo / 'govee-python' / 'tests' / 'fixtures' / 'golden' / 'raw'
    out_dir.mkdir(parents=True, exist_ok=True)

    dev_map = load_device_models()
    frames_by_model: Dict[str, List[List[int]]] = {}

    for f in persisted.glob('*'):
        if not (f.suffix == '.log' or f.suffix == '.json'):
            continue
        try:
            text = f.read_text()
        except Exception:
            continue
        # files may contain concatenated JSON objects; split by '}{' safely
        parts = []
        if '\n}{\n' in text:
            parts = text.split('\n}{\n')
            parts = [p if i == 0 else '{' + p if not p.startswith('{') else p for i,p in enumerate(parts)]
            # fix: re-add separators
            fixed = []
            for i,p in enumerate(parts):
                if i == 0:
                    fixed.append(p)
                else:
                    fixed.append('{' + p)
            parts = fixed
        else:
            parts = [text]
        for part in parts:
            for ln in part.split('\n'):
                ln = ln.strip()
                if not ln:
                    continue
                try:
                    obj = json.loads(ln)
                except Exception:
                    # try to skip
                    continue
                dev = obj.get('device') or obj.get('id')
                model = dev_map.get(dev)
                if not model:
                    # try sku
                    model = obj.get('sku')
                if not model:
                    continue
                op = obj.get('op') or {}
                cmds = op.get('command') or []
                if isinstance(cmds, list):
                    for c in cmds:
                        if isinstance(c, str):
                            ints = decode_b64_to_ints(c)
                            if ints:
                                frames_by_model.setdefault(model, []).append(ints)
                        elif isinstance(c, list):
                            # already ints
                            frames_by_model.setdefault(model, []).append([int(x) for x in c])

    # write out fixtures for a few representative models only (non-empty)
    for model, frames in frames_by_model.items():
        if not frames:
            continue
        out = out_dir / f"{model}.json"
        # deduplicate
        uniq = []
        seen = set()
        for fr in frames:
            key = ','.join(map(str, fr))
            if key in seen:
                continue
            seen.add(key)
            uniq.append(fr)
        out.write_text(json.dumps(uniq, indent=2))
        print('wrote', out)


if __name__ == '__main__':
    extract()

