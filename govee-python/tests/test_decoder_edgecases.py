from govee.data.ble.decoder_lib import (
    Calibration,
    bcf_value_from_hex_string,
    post_processing,
    reverse_hex_data,
    value_from_hex_string,
)


def test_reverse_hex_data_odd_length():
    # 'abc' -> chunked as ['ab','c'] reversed -> ['c','ab'] -> 'cab'
    assert reverse_hex_data("abc", 3) == "cab"


def test_value_from_hex_string_reverse_4byte():
    # take 'aabb' (first 4 chars) -> ['aa','bb'] reversed -> 'bbaa' -> int
    val = value_from_hex_string("aabbccdd", 0, 4, reverse=True)
    assert val == int("bbaa", 16)


def test_signed_thresholds_length2():
    assert value_from_hex_string("80", 0, 2, False, True) == 128
    assert value_from_hex_string("81", 0, 2, False, True) == -127


def test_signed_thresholds_length4():
    assert value_from_hex_string("7fff", 0, 4, False, True) == 32767
    assert value_from_hex_string("8000", 0, 4, False, True) == -32768


def test_bcf_bytes_various():
    assert abs(bcf_value_from_hex_string("07d0", 0, 4, False) - 9.08) < 1e-9
    assert abs(bcf_value_from_hex_string("0102", 0, 4, False) - 1.02) < 1e-9


def test_post_proc_comparison_gates():
    # post_proc: ['<', 100, '/', 10] with value 1000 -> comparison fails -> None
    assert post_processing(1000, ["<", 100, "/", 10]) is None


def test_post_proc_calibration_operand():
    # calibration operand resolves to provided calibration value
    assert post_processing(12345, ["-", Calibration], calibration=500) == 11845
