from govee.types import Credentials, DeviceCommandAddresses, resolve_label


def test_resolve_label_with_string():
    assert resolve_label('simple') == 'simple'


def test_resolve_label_with_callable():
    assert resolve_label(lambda: 'computed') == 'computed'


def test_credentials_dataclass():
    cred = Credentials(username='u', password='p', client_id='cid')
    assert cred.username == 'u'
    assert cred.password == 'p'
    assert cred.client_id == 'cid'


def test_device_command_addresses_defaults():
    d = DeviceCommandAddresses()
    assert d.iot_topic is None
    assert d.ble_address is None

