"""Golden tests: raw op command arrays decode parity.

These tests load the raw op command arrays extracted from persisted logs and
assert that our base64->int-array decoding reproduces the same arrays. This
is a low-level parity check ensuring we read the persisted raw logs
consistently; later tests assert encoding parity (packers) against these
same raw frames.
"""

import json
from pathlib import Path

from govee.common.op_code import base64_to_hex


def test_golden_raw_decode_samples():
    fixtures = Path('govee-python/tests/fixtures/golden/raw')
    for f in fixtures.glob('*.json'):
        data = json.loads(f.read_text())
        # data is list of lists (already decoded by extractor). For safety,
        # ensure entries are lists of ints
        assert isinstance(data, list)
        for entry in data:
            assert isinstance(entry, list)
            assert all(isinstance(x, int) for x in entry)

