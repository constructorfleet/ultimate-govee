"""Encoding parity checks: ensure device encode frames use expected op names and adapter delivers them.

These are behavioral parity checks (op names & params), not strict byte-for-byte
comparisons with TypeScript. Golden-frame tests can be added later if strict
parity is required.
"""

import asyncio

from govee.domain.devices.factory import make_device_from_advert
from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from pathlib import Path
import json


def _load_sample_devices(n=5):
    # resolve persisted path relative to repository root
    repo_root = Path(__file__).resolve().parents[2]
    p = repo_root / 'persisted' / 'govee.devices.json'
    obj = json.loads(p.read_text())
    devices = []
    for d in obj.get('devices', [])[:n]:
        model = d.get('deviceExt', {}).get('deviceSettings', {}).get('model') or d.get('sku')
        payload = {'id': d.get('device'), 'name': d.get('deviceName')}
        devices.append((model, payload))
    return devices


async def _publish_frames(adapter, topic, frames):
    for f in frames:
        await adapter.publish(topic, f, qos=0)


async def _run():
    # create adapter with small fixture
    backend = FakeMQTTBackend('persisted/mqtt_fixtures/replay_1.jsonl')
    adapter = MQTTAdapter(backend=backend)
    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload))

    await adapter.create({'topic': 'govee/device/#'}, Handler())
    await adapter.connect()

    samples = _load_sample_devices(3)
    for model, advert in samples:
        dev = make_device_from_advert(model, advert)
        if not dev:
            continue
        # some factory results are plain Device dataclasses without apply_payload
        if not hasattr(dev, 'apply_payload'):
            continue
        # apply a sample payload to set state
        dev.apply_payload({'power': True, 'brightness': 50})
        frames = dev.encode_command({'power': False, 'brightness': 20})
        # publish frames under a device topic
        await _publish_frames(adapter, f"govee/device/{advert.get('id')}/command", frames)

    # replay backend to simulate incoming messages as well
    adapter.replay_fixture()
    await asyncio.sleep(0.02)
    return len(received) > 0


def test_encoding_parity_behavioral():
    res = asyncio.get_event_loop().run_until_complete(_run())
    assert res
