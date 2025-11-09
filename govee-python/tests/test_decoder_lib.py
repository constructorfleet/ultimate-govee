import math

from govee.data.ble import decoder_lib


def test_value_from_hex_string_h5074():
    offset = 6
    length = 4
    reverse = True
    can_be_negative = True
    cases = [
        ("88ec00c408231d6402", 2244),
        ("88ec00a0facc176402", -1376),
        ("88ec001b0a9b196402", 2587),
    ]
    for inp, expected in cases:
        out = decoder_lib.value_from_hex_string(
            inp, offset, length, reverse, can_be_negative
        )
        assert out == expected


def test_value_from_hex_string_h5106():
    offset = 8
    length = 8
    reverse = False
    can_be_negative = False
    cases = [
        (
            "010001010d915f9a4c000215494e54454c4c495f524f434b535f48575075f2ff0c",
            227631002,
        ),
        ("010001010ddf25cc", 232728012),
        ("0100010181aa77cf", 2175432655),
    ]
    for inp, expected in cases:
        out = decoder_lib.value_from_hex_string(
            inp, offset, length, reverse, can_be_negative
        )
        assert out == expected


def test_bcf_value_from_hex_string_and_post_processing():
    # basic bcf conversion and some post-processing chains from the TS tests
    inp = "0188ec000101ee07581641"
    # for H5179 offsets used in TS spec
    temp = decoder_lib.value_from_hex_string(inp, 12, 4, True, True)
    assert temp == 2030
    hum = decoder_lib.value_from_hex_string(inp, 16, 4, True, False)
    assert hum == 5720
    batt = decoder_lib.value_from_hex_string(inp, 20, 4, False, False)
    assert batt == 65


def test_decoder_decode_tempc_post_proc():
    # mirror a TS decode() test for H5072 where post-processing yields ~26.85
    device = {
        "id": "0B:00:19:3D:31:51:34:F7",
        "name": "H5072",
        "manufacturerData": "88ec000418ee6400",
    }
    decoder_args = ["value_from_hex_string", "manufacturerdata", 6, 6, False, False]
    post_proc = ["/", 1000, ">", 0, "/", 10]
    val = decoder_lib.Decoder.decode(device, decoder_args, post_proc)
    # expect approximately 26.85
    assert math.isclose(val, 26.85, rel_tol=1e-3)


def test_decode_properties_maps_values():
    # test decode_properties for a simple property mapping
    device = {"manufacturerData": "88ec000418ee6400"}
    properties = {
        "tempc": {
            "decoder": [
                "value_from_hex_string",
                "manufacturerdata",
                6,
                6,
                False,
                False,
            ],
            "post_proc": ["/", 1000, ">", 0, "/", 10],
        },
        "batt": {
            "decoder": [
                "value_from_hex_string",
                "manufacturerdata",
                14,
                2,
                False,
                False,
            ]
        },
    }
    decoded = decoder_lib.Decoder.decode_properties(device, properties)
    assert "temperature" in decoded and "current" in decoded["temperature"]
    assert "battery" in decoded
    assert math.isclose(decoded["temperature"]["current"], 26.85, rel_tol=1e-3)
