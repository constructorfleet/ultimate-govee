"""Integration test: ensure device.encode_command frames publish via MQTTAdapter
and are received by IoTClient handler. Uses persisted/govee.devices.json for
realistic device adverts and exercises multiple families.
"""

import asyncio
import json
from pathlib import Path

from govee.domain.devices.factory import make_device_from_advert
from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter


async def _run():
    repo_root = Path(__file__).resolve().parents[2]
    backend = FakeMQTTBackend(str(repo_root / 'persisted' / 'mqtt_fixtures' / 'replay_1.jsonl'))
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload))

    await adapter.create({'topic': 'govee/device/#'}, Handler())
    await adapter.connect()

    # load persisted devices and pick a few representatives
    p = repo_root / 'persisted' / 'govee.devices.json'
    obj = json.loads(p.read_text())
    devices = obj.get('devices', [])

    sent_count = 0
    for d in devices:
        model = d.get('deviceExt', {}).get('deviceSettings', {}).get('model') or d.get('sku')
        advert = {'id': d.get('device'), 'name': d.get('deviceName')}
        dev = make_device_from_advert(model, advert)
        if not dev or not hasattr(dev, 'encode_command'):
            continue
        # pick a representative command by family
        cmd = {'power': True}
        # add a richer command for rgb/rgbic/white families
        impl = dev.__class__.__name__.lower()
        if 'rgbic' in impl:
            cmd = {'segments': [{'index': 0, 'color': {'r': 10, 'g': 20, 'b': 30}}]}
        elif 'rgb' in impl and 'ic' not in impl:
            cmd = {'color': {'r': 12, 'g': 34, 'b': 56}, 'brightness': 70}
        elif 'white' in impl:
            cmd = {'color_temp': 3500, 'brightness': 60}

        frames = dev.encode_command(cmd)
        # publish frames under a device topic; adapter will deliver to handler
        await adapter.publish(f"govee/device/{advert.get('id')}/command", {'frames': frames}, qos=0)
        sent_count += 1
        if sent_count >= 6:
            break

    # replay the backend to deliver any fixture messages and allow handler to process
    adapter.replay_fixture()
    await asyncio.sleep(0.05)
    return received, sent_count


def test_device_encode_publishes_to_adapter():
    received, sent = asyncio.get_event_loop().run_until_complete(_run())
    # ensure we sent a handful and received at least as many handler callbacks
    assert sent > 0
    assert len(received) >= sent
    # basic sanity check on payload structure
    for topic, payload in received[:sent]:
        # payload is often a dict; ensure frames key present for our published messages
        if isinstance(payload, dict) and 'frames' in payload:
            frames = payload['frames']
            assert isinstance(frames, list)
            for f in frames:
                assert isinstance(f, dict)
