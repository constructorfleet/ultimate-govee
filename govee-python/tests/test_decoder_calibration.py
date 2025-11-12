from govee.data.ble.decoder_lib import Decoder


def test_decode_properties_with_calibration():
    # create a fake device with manufacturerData hex: first 2 bytes -> cal, next 4 bytes -> temp raw
    # We'll encode cal=20 (0x0014) at offset 0, temp raw=3000 (0x0BB8) at offset 4
    # manufacturerData should be hex string
    md = bytes.fromhex('00140bb8')
    device = {'manufacturerData': md}

    properties = {
        '.cal': {'decoder': ['value_from_hex_string', 'manufacturerdata', 0, 4, False, False]},
        'tempc': {'decoder': ['value_from_hex_string', 'manufacturerdata', 4, 4, False, False], 'post_proc': ['/', '.cal', '/', 10]}
    }

    decoded = Decoder.decode_properties(device, properties)
    # calibration should have been recorded
    assert 'temperature' in decoded
    # temperature.current should be numeric
    assert isinstance(decoded['temperature']['current'], (int, float))
    # calibration should be present (value from .cal)
    assert decoded['temperature'].get('calibration') is not None

