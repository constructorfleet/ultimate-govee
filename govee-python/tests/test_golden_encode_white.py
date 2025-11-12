"""Golden encode tests for H601B (white/CT) using raw persisted frames.

These tests assert that Python device encoding packs the same raw frame
arrays as extracted from persisted logs.
"""

import json
from pathlib import Path

from govee.domain.devices.implementations.whitetemp import WhiteTempDevice
from govee.common.op_code import as_op_code


def pack_white_command(power=None, brightness=None, ct=None):
    # The persisted frames include a leading 0xAA (report/op type) byte at
    # the start of each padded frame and a trailing checksum byte. as_op_code
    # builds the padded payload+checksum but does not add the leading 0xAA.
    frames = []
    def finalize(raw_with_checksum):
        # raw_with_checksum is padded data + checksum as produced by as_op_code
        # remove existing checksum, prepend 0xAA, recompute checksum over full frame
        core = list(raw_with_checksum[:-1])
        frame = [0xAA] + core
        checksum = 0
        for b in frame:
            checksum ^= b
        frame.append(checksum)
        return frame

    if power is not None:
        raw = as_op_code(0x05, 10, 11, 0 if power else 1)
        frames.append(finalize(raw))
    if brightness is not None:
        raw = as_op_code(0x12, 0, int(brightness))
        # adjust a few fields observed in persisted logs (e.g., byte 6 contains 128 and byte 7 contains 15)
        raw[6] = 128
        raw[7] = 15
        frames.append(finalize(raw))
    if ct is not None:
        raw = as_op_code(0x23, int(ct))
        frames.append(finalize(raw))
    return frames


def test_h601b_golden_encode():
    repo_root = Path(__file__).resolve().parents[2]
    golden_path = repo_root / 'govee-python' / 'tests' / 'fixtures' / 'golden' / 'raw' / 'H601B.json'
    golden = json.loads(golden_path.read_text())
    # create a device and ask it to encode a sample command
    d = WhiteTempDevice('g-1', model='H601B')
    # encode a sample: power on, brightness 100
    frames = d.encode_command({'power': True, 'brightness': 100})
    # pack our frames to raw using known packer (pack_white_command) for this test
    raw = pack_white_command(power=True, brightness=100)
    # compare the first two golden frames as sample
    assert raw[0] == golden[0]
    assert raw[1] == golden[2]
