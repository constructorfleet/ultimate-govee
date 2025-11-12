import math

from govee.data.ble import decoder_lib


def test_h5072__tempc_postproc():
    # _tempc case: input and expected from TS spec
    inp = '88ec00811f096400'
    # decoder args correspond to value_from_hex_string with offset 6, length 6
    # but previous TS used operations: ['&', 8388607, '/', 10000, '*', -1]
    # We'll test using Decoder.decode for that configuration
    device = {'manufacturerData': inp}
    # use decoder directly: value_from_hex_string with offset 6 length 6 reverse False can_be_negative False
    val = decoder_lib.Decoder.decode(device, ['value_from_hex_string', 'manufacturerdata', 6, 6, False, False], ['&', 8388607, '/', 10000, '*', -1])
    assert math.isclose(val, -7.3481, rel_tol=1e-4)


def test_h5072_hum_postproc_examples():
    device1 = {'manufacturerData': '88ec000418ee6400'}
    val1 = decoder_lib.Decoder.decode(device1, ['value_from_hex_string', 'manufacturerdata', 6, 6, False, False], ['&', 8388607, '%', 1000, '/', 10])
    assert math.isclose(val1, 52.6, rel_tol=1e-3)

    device2 = {'manufacturerData': '88ec00811f096400'}
    val2 = decoder_lib.Decoder.decode(device2, ['value_from_hex_string', 'manufacturerdata', 6, 6, False, False], ['&', 8388607, '%', 1000, '/', 10])
    assert math.isclose(val2, 48.1, rel_tol=1e-3)

    device3 = {'manufacturerData': '88ec0004344b6400'}
    val3 = decoder_lib.Decoder.decode(device3, ['value_from_hex_string', 'manufacturerdata', 6, 6, False, False], ['&', 8388607, '%', 1000, '/', 10])
    assert math.isclose(val3, 53.1, rel_tol=1e-3)


def test_h5072_batt_examples():
    # batt offset 12, length 2
    inputs = [
        ('88ec000418ee6400', 100),
        ('88ec00811f096400', 100),
        ('88ec0004344b6400', 100)
    ]
    for inp, expected in inputs:
        val = decoder_lib.Decoder.decode({'manufacturerData': inp}, ['value_from_hex_string', 'manufacturerdata', 12, 2, False, False], [])
        assert math.isclose(val, expected, rel_tol=1e-6)

