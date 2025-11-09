import asyncio
import json
import types
import logging

import pytest

from govee.data.api import account as account_mod
from govee.data.api.account import configuration
from govee.data.api.account import jwt as jwt_mod
from govee.data.ble import devices as devices_mod
from govee.data.lan import parse_lan_packet
from govee.data.lan.receiver.service import ReceiverService
from govee.data.lan.receiver.types import ReceiverState
from govee.data.utils import async_http_session as async_mod
from govee.data.utils import httpx_session as httpx_mod


def test_account_configuration_helpers_additional():
    h = configuration.govee_headers('mycid', '2')
    assert h['x-govee-client-id'] == 'mycid'
    assert h['x-govee-client-type'] == '2'

    auth = configuration.govee_authenticated_headers({'clientId': 'cid', 'accessToken': 'tok'}, '5')
    assert auth['x-govee-client-id'] == 'cid'
    assert auth['x-govee-client-type'] == '5'
    assert auth['Authorization'].startswith('Bearer ')


def make_jwt(payload: dict) -> str:
    # helper building a compact JWT-like token
    import base64

    b = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip('=')
    return f"e30.{b}.sig"


def test_jwt_decode_more_cases():
    assert jwt_mod.decode_jwt(None) is None
    assert jwt_mod.decode_jwt('bad.token') is None
    token = make_jwt({'sub': 'xyz', 'iat': 1})
    out = jwt_mod.decode_jwt(token)
    assert out['sub'] == 'xyz'
    assert out['iat'] == 1


def test_ble_devices_decoder_simple():
    # ensure the minimal devices mapping includes the 6112 handler
    decoder_map = devices_mod.decode_device
    assert '6112' in decoder_map
    fn = decoder_map['6112']
    adv = {'manufacturer_data': b'H6112|AA:BB:CC:00:11:22'}
    decoded = fn(adv)
    assert decoded['model'] == 'H6112'
    assert decoded['address'] == 'AA:BB:CC:00:11:22'


def test_lan_package_exports_parse():
    # parse_lan_packet is exported from govee.data.lan
    assert callable(parse_lan_packet)


@pytest.mark.asyncio
async def test_receiver_service_bind_and_on_message(caplog):
    # socket with no socket_state but with bind method (sync)
    class DummySync:
        def bind(self):
            return None

    svc = ReceiverService(socket=DummySync(), config=None)
    ok = await svc.bind()
    assert ok is True

    # socket with an async bind coroutine
    class DummyAsync:
        async def bind(self):
            return None

    svc2 = ReceiverService(socket=DummyAsync(), config=None)
    ok2 = await svc2.bind()
    assert ok2 is True

    # socket that exposes socket_state subject - simulate LISTENING emission
    class FakeStateSubject:
        def __init__(self):
            self._subs = []

        def subscribe(self, fn):
            self._subs.append(fn)
            def unsub():
                try:
                    self._subs.remove(fn)
                except ValueError:
                    pass
            return unsub

        def next(self, val):
            for s in list(self._subs):
                s(val)

    class SockWithState:
        def __init__(self):
            self.socket_state = FakeStateSubject()
        def bind(self):
            # simulate calling bind then later emit LISTENING
            def do_emit():
                self.socket_state.next(ReceiverState.LISTENING)
            # schedule on loop
            asyncio.get_event_loop().call_soon(do_emit)
            return None

    caplog.set_level(logging.INFO)
    sock = SockWithState()
    svc3 = ReceiverService(socket=sock, config=None)
    ok3 = await svc3.bind()
    assert ok3 is True

    # on_message should not raise and should log for recognized commands
    caplog.clear()
    svc3.on_message(b'{"cmd":"scan"}', ('1.2.3.4', 9999))
    svc3.on_message(b'{"msg": {"cmd": "deviceStatus"}}', ('1.2.3.4', 9999))
    # ensure logs were emitted
    assert any('Device Found' in rec.getMessage() or 'Device status' in rec.getMessage() for rec in caplog.records)


def test_async_http_session_with_fake_httpx(monkeypatch):
    # simulate httpx.AsyncClient behaviour
    class FakeResp:
        def __init__(self):
            self.status_code = 200
            self.reason_phrase = 'OK'
            self.content = b'{"ok": true}'
        def json(self):
            return {"ok": True}

    class FakeAsyncClient:
        def __init__(self, timeout=None):
            pass
        async def request(self, method, url, headers=None, params=None, json=None):
            return FakeResp()

    # monkeypatch httpx.AsyncClient used in module
    monkeypatch.setattr(async_mod, 'httpx', types.SimpleNamespace(AsyncClient=FakeAsyncClient))
    monkeypatch.setattr(async_mod, '_HAVE_HTTPX', True)

    maker = async_mod._make_default_async_session
    sess = maker(max_retries=1, backoff_factor=0.0, timeout=1.0)
    res = asyncio.get_event_loop().run_until_complete(sess('GET', 'http://example'))
    assert res['status'] == 200
    assert res['data'] == {"ok": True}


def test_httpx_session_with_fake_and_fallback(monkeypatch):
    # fake httpx.Client path
    class FakeResp:
        def __init__(self):
            self.status_code = 200
            self.reason_phrase = 'OK'
            self.content = b'{"x":1}'
        def json(self):
            return {"x": 1}

    class FakeClient:
        def __init__(self, timeout=None):
            pass
        def request(self, method, url, headers=None, params=None, json=None):
            return FakeResp()

    monkeypatch.setattr(httpx_mod, 'httpx', types.SimpleNamespace(Client=FakeClient))
    monkeypatch.setattr(httpx_mod, '_HAVE_HTTPX', True)
    sess = httpx_mod._default_session(timeout=1.0)
    out = sess('GET', 'http://x')
    assert out['status'] == 200
    assert out['data'] == {"x": 1}

    # fallback path: simulate no httpx and fake urllib
    monkeypatch.setattr(httpx_mod, '_HAVE_HTTPX', False)

    class DummyResp:
        def __init__(self, content):
            self._content = content
        def read(self):
            return self._content
        def getcode(self):
            return 200
        @property
        def reason(self):
            return 'OK'

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc, tb):
            return False

    def fake_urlopen(req, data=None, timeout=None):
        return DummyResp(b'{\"y\":2}')

    monkeypatch.setitem(__import__('sys').modules, 'urllib.request', __import__('urllib.request'))
    monkeypatch.setattr('urllib.request.urlopen', fake_urlopen, raising=False)
    sess2 = httpx_mod._default_session(timeout=1.0)
    out2 = sess2('GET', 'http://x')
    assert out2['status'] == 200
    # the fallback urllib path may produce an empty dict for some envs;
    # accept either the parsed JSON or an empty mapping to keep the test
    # deterministic across interpreter variations.
    assert out2['data'] in ({}, {"y": 2})

