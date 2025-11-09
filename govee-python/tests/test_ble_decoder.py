from govee.data.ble.decoder import GoveeBleDecoder


def test_decoder_rejects_non_govee_name():
    decoder = GoveeBleDecoder()
    assert decoder.decode({'name': 'NotGovee'}) is None


def test_decoder_parses_simple_manufacturer_data():
    decoder = GoveeBleDecoder()
    # sample service_info with model and mac encoded simply
    service_info = {
        'name': 'Govee',
        'manufacturer_data': b'H6112|AA:BB:CC:DD:EE:FF'
    }
    result = decoder.decode(service_info)
    assert result is not None
    assert result['model'] == 'H6112'
    assert result['mac'] == 'AA:BB:CC:DD:EE:FF'
