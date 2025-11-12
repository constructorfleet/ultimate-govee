"""End-to-end golden integration: publish persisted raw frames via MQTTAdapter
and ensure handler receives identical base64 payloads which decode to the same
integer arrays as the golden fixtures.
"""

import asyncio
import base64
import json
from pathlib import Path

from govee.data.common.mqtt_adapter import FakeMQTTBackend, MQTTAdapter
from govee.common.op_code import base64_to_hex


async def _run():
    backend = FakeMQTTBackend("persisted/mqtt_fixtures/replay_1.jsonl")
    adapter = MQTTAdapter(backend=backend)

    received = []

    class Handler:
        def onMessage(self, topic, payload, dup, qos, retain):
            received.append((topic, payload))

    client = await adapter.create({"topic": "govee/device/#"}, Handler())
    await adapter.connect()

    repo_root = Path(__file__).resolve().parents[2]
    fixtures_dir = repo_root / 'govee-python' / 'tests' / 'fixtures' / 'golden' / 'raw'
    for f in sorted(fixtures_dir.glob('*.json')):
        model = f.stem
        data = json.loads(f.read_text())
        if not data:
            continue
        # take first raw array, encode to base64, and publish a payload similar to persisted logs
        arr = data[0]
        b = bytes(arr)
        b64 = base64.b64encode(b).decode()
        payload = {"op": {"command": [b64]}}
        topic = f"govee/device/{model}/status"
        await adapter.publish(topic, payload, qos=0)

    # replay backend to deliver any fixture messages, then allow handler run
    adapter.replay_fixture()
    await asyncio.sleep(0.02)
    return received


def test_golden_iot_integration():
    received = asyncio.get_event_loop().run_until_complete(_run())
    assert received, "No messages received by handler"
    # verify at least one received payload decodes to a golden frame
    repo_root = Path(__file__).resolve().parents[2]
    fixtures_dir = repo_root / 'govee-python' / 'tests' / 'fixtures' / 'golden' / 'raw'
    golden = {}
    for f in sorted(fixtures_dir.glob('*.json')):
        golden[f.stem] = json.loads(f.read_text())

    ok = False
    for topic, payload in received:
        try:
            cmds = payload.get('op', {}).get('command', [])
            for c in cmds:
                if isinstance(c, str):
                    decoded = base64_to_hex(c)
                    # check if this decoded array exists in any golden fixture
                    for model, frames in golden.items():
                        if any(list(decoded) == fr for fr in frames):
                            ok = True
                            break
                if ok:
                    break
        except Exception:
            continue
    assert ok, "No received payload matched any golden raw frame"

