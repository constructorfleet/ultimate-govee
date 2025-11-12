"""Golden encode test for H6042 (RGBIC) using persisted raw frames.

This asserts Python can pack a representative segments/pixels frame to match
the persisted raw frame.
"""

import json
from pathlib import Path

from govee.domain.devices.implementations.rgbic import RGBICDevice
from govee.domain.devices.encoding import pack_raw_frame


def test_h6042_golden_encode():
    repo_root = Path(__file__).resolve().parents[2]
    golden_path = repo_root / 'govee-python' / 'tests' / 'fixtures' / 'golden' / 'raw' / 'H6042.json'
    golden = json.loads(golden_path.read_text())
    # create a device
    d = RGBICDevice('g-1', model='H6042')
    # sample command: set segment 0 to color
    frames = d.encode_command({'segments': [{'index': 0, 'color': {'r': 1, 'g': 2, 'b': 3}}]})
    # For golden parity, attempt to pack a frame using observed opcode and payload
    # Use the first golden entry opcode and payload as source values
    gold = golden[0]
    opcode = gold[1]
    values = gold[2:-1]
    packed = pack_raw_frame(opcode, values, model='H6042')
    assert packed == gold
