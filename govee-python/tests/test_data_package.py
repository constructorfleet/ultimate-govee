import asyncio
import json
import base64
import pytest

from govee.data.ble.client import BleClient
from govee.data.ble.decoder_service import DecoderService
from govee.data.ble.device_condition import device_matches
from govee.data.ble.property_condition import property_matches
from govee.data.openapi.channel import OpenAPIChannel
from govee.data.openapi.openapi_service import OpenAPIService
from govee.data.api.account import configuration
from govee.data.api.account import jwt as jwt_mod
from govee.data.lan import parse_lan_packet
from govee.data.lan.receiver.socket import DummySocket, ReceiverSocket
from govee.data.lan.receiver.config import default_config
from govee.data.lan.receiver.providers import create_receiver
from govee.data.lan.sender.types import SenderState, MessageEvent
from govee.data.utils import async_http_session, httpx_session


def test_ble_client_feed_and_send():
    decoder = DecoderService()
    client = BleClient(decoder=decoder)

    received = []

    unsub = client.peripheral_decoded.subscribe(lambda v: received.append(v))

    # disabled by default
    client.feed_peripheral({'id': '1'})
    assert received == []

    # enable and feed a peripheral the decoder understands
    client.enabled.next(True)
    peripheral = {
        'id': 'dev1',
        'address': 'AA:BB:CC:DD:EE:FF',
        'uuid': 'uuid1',
        'advertisement': {'localName': 'Govee', 'manufacturer_data': b'H6112|AA:BB:CC:DD:EE:FF'}
    }
    client.feed_peripheral(peripheral)
    assert len(received) == 1
    assert received[0]['name'] == 'Govee'

    # test send_command records
    client.send_command({'cmd': 'test'})
    assert client.sent[-1] == {'cmd': 'test'}

    unsub()


def test_device_matches_basic_cases():
    dev = {'name': 'H5000', 'manufacturerData': 'abcd', 'macAddress': '001122334455'}
    # simple prefix match
    assert device_matches(dev, ['H5'])
    # name comparison via Name token
    assert device_matches(dev, ['name', 'H5'])
    # no manufacturer data
    assert device_matches({'manufacturerData': ''}, ['no-mfgdata'])
    # Or groups
    assert device_matches(dev, ['NOPE', '|', 'H5'])
    # MacAtIndex should safely return False for bad index
    assert not device_matches(dev, ['mac@index', 100, 'x'])


def test_property_matches_bits_and_inverse():
    dev = {'manufacturerData': '0f10'}
    # bit shift: check low nibble bit 0 position
    assert property_matches(dev, ['bit', 0, 0]) is True or property_matches(dev, ['bit', 0, 1]) is False

    # inverse
    assert property_matches(dev, ['inverse', 'nope']) is False

    # manufacturer data slice handling (index provided)
    assert property_matches({'manufacturerData': 'abcdef'}, ['manufacturerdata', 2, 'zz']) is False


@pytest.mark.asyncio
async def test_openapi_channel_and_service():
    svc = OpenAPIService()
    ch = OpenAPIChannel(svc)
    res = await ch.get_devices()
    assert res['ok'] is True
    out = await ch.control_device('dev123', {'power': 'on'})
    assert out['ok'] is True
    # ensure calls were recorded
    assert any(call['method'] == 'GET' for call in svc.calls)
    assert any(call['method'] == 'POST' for call in svc.calls)


def test_account_configuration_helpers():
    h = configuration.govee_headers('cid', '2')
    assert h['x-govee-client-id'] == 'cid'
    ah = configuration.govee_authenticated_headers({'clientId': 'cid', 'accessToken': 'tok'}, '3')
    assert 'Authorization' in ah and ah['Authorization'].startswith('Bearer')


def make_jwt(payload: dict) -> str:
    b = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
    return f"e30.{b}.sig"


def test_jwt_decode_valid_and_invalid():
    token = make_jwt({'sub': '123'})
    assert jwt_mod.decode_jwt(token)['sub'] == '123'
    assert jwt_mod.decode_jwt(None) is None
    assert jwt_mod.decode_jwt('bad.token') is None


def test_lan_parse_export_and_receiver_socket_bind():
    # parse_lan_packet is exercised in other tests; ensure the package __init__ export works
    assert parse_lan_packet is not None

    dummy = DummySocket()
    rsock = ReceiverSocket(socket=dummy, config={'bindAddress': '0.0.0.0', 'receiverPort': 12345})

    # feed a message and observe message_bus
    received = []
    unsub = rsock.message_bus.subscribe(lambda ev: received.append(ev))
    dummy.feed(b'{}', ('127.0.0.1', 12345))
    assert len(received) == 1

    # bind should transition state to LISTENING (awaitable)
    async def do_bind():
        await rsock.bind()
        return rsock.socket_state.get_value()

    val = asyncio.get_event_loop().run_until_complete(do_bind())
    from govee.data.lan.receiver.types import ReceiverState
    assert val == ReceiverState.LISTENING
    unsub()


def test_receiver_config_and_provider_factory():
    assert default_config.port == 9898
    svc = create_receiver()
    assert svc is not None


def test_sender_types_enum_and_dataclass():
    assert SenderState.UNBOUND.name == 'UNBOUND'
    ev = MessageEvent(message=b'abc', remote_info=('1.2.3.4', 1234))
    assert ev.remote_info[0] == '1.2.3.4'


def test_async_http_session_fallback_raises():
    # Ensure that when httpx is unavailable the factory returns a coroutine that raises ImportError
    mod = async_http_session
    # Temporarily simulate missing httpx
    old = getattr(mod, '_HAVE_HTTPX', True)
    mod._HAVE_HTTPX = False
    try:
        maker = mod._make_default_async_session
        sess = maker()
        with pytest.raises(ImportError):
            asyncio.get_event_loop().run_until_complete(sess('GET', 'http://example'))
    finally:
        mod._HAVE_HTTPX = old

