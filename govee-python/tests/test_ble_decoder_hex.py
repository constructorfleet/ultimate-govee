from govee.data.ble.decoder import GoveeBleDecoder


def test_decoder_parses_hex_manufacturer_data():
    decoder = GoveeBleDecoder()
    # manufacturer_data may be provided as a hex string (as seen in some
    # BLE stacks). Here model|mac encoded as ASCII then hex-encoded.
    raw = b"H6112|AA:BB:CC:DD:EE:FF"
    hexstr = raw.hex()
    service_info = {
        "name": "Govee",
        "manufacturer_data": hexstr,
    }
    result = decoder.decode(service_info)
    assert result is not None
    assert result["model"] == "H6112"
    assert result["mac"] == "AA:BB:CC:DD:EE:FF"
