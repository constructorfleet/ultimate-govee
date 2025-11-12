"""Golden encode tests for all extracted models using raw persisted frames.

This test attempts to reconstruct the raw frame by using the golden array's
opcode and payload bytes as inputs to pack_raw_frame. Tests are expected to
be RED until packers for all models are implemented.
"""

import json
from pathlib import Path

from govee.domain.devices.encoding import pack_raw_frame


def test_golden_encode_models():
    fixtures_dir = Path('govee-python/tests/fixtures/golden/raw')
    for f in sorted(fixtures_dir.glob('*.json')):
        model = f.stem
        data = json.loads(f.read_text())
        if not data:
            continue
        gold = data[0]
        # gold is a list of ints; format: [0xAA, opcode, val1, val2, ..., checksum]
        if len(gold) < 3:
            continue
        opcode = gold[1]
        values = gold[2:-1]
        packed = pack_raw_frame(opcode, values, model=model)
        assert packed == gold, f"model {model} failed: {packed} != {gold}"
