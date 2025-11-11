import math
from govee.data.ble import decoder_lib


def test_bcf_value_from_hex_string():
    # value built so that high byte and low byte produce expected BCF
    # e.g., v = (int_hi << 8) | int_lo
    # choose v = 0x07D0 -> (0x07 <<8)*100 + 0xD0 = 7*100 + 208 = 908 -> /100 = 9.08
    hexstr = '000007d0'
    out = decoder_lib.bcf_value_from_hex_string(hexstr, 4, 4, reverse=False)
    assert math.isclose(out, 9.08, rel_tol=1e-6)


def test_value_from_hex_string_negative_and_reverse():
    # test two-byte negative with can_be_negative True
    # for length=2, if value>128 treat as signed
    # e.g., hex 'ff' -> 255 -> 255-256 = -1
    hexstr = '00ff'
    out = decoder_lib.value_from_hex_string(hexstr, 2, 2, reverse=False, can_be_negative=True)
    assert out == -1

    # test reverse: given hex_data 'aabbcc', offset 0, length 4, reverse True
    # hex_value = 'aabb', reverse per-byte -> 'bbaa'
    hexstr = 'aabbcc'
    out = decoder_lib.value_from_hex_string(hexstr, 0, 4, reverse=True)
    assert out == int('bbaa', 16)

