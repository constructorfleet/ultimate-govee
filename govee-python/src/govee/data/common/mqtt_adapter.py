"""MQTT adapter: fake backend for offline tests and a thin adapter API."""
from __future__ import annotations

import json
from typing import Any, Callable, List, Optional

from govee.data.iot.iot_client import IoTClient, AsyncIotMessage


class FakeMQTTBackend:
    """A simple replay backend that reads JSONL fixtures and replays messages."""

    def __init__(self, fixture_path: str):
        from pathlib import Path

        self._messages = []
        # accept fixture_path as provided; if it doesn't exist resolve it
        # relative to the repository root (two levels up from govee-python/src).
        p = Path(fixture_path)
        if not p.exists():
            # compute repo-root relative path
            repo_root = Path(__file__).resolve().parents[5]
            alt = repo_root / fixture_path
            if alt.exists():
                p = alt
        self.fixture_path = str(p)
        self._load()

    def _load(self):
        with open(self.fixture_path, 'r') as fh:
            for ln in fh:
                ln=ln.strip()
                if not ln:
                    continue
                obj=json.loads(ln)
                self._messages.append(obj)

    def replay(self, client: IoTClient):
        # Replay JSONL into the provided client. This keeps the backend
        # abstraction minimal: the backend needs only to provide a replay(client)
        # method. The client is expected to implement simulate_incoming(AysncIotMessage).
        for m in self._messages:
            msg = AsyncIotMessage(
                topic=m.get('topic'),
                payload=m.get('payload'),
                qos=m.get('qos', 0),
                retained=m.get('retained', False),
            )
            # Deliver as if broker pushed the message
            client.simulate_incoming(msg)


class MQTTAdapter:
    """Adapter that exposes the IoTClient-like API using a pluggable backend."""

    def __init__(self, backend: Optional[FakeMQTTBackend]=None):
        self.backend=backend
        self.client: Optional[IoTClient]=None

    async def create(self, iot_data: dict, handler: Optional[Any]=None):
        self.client=IoTClient()
        await self.client.create(iot_data, handler)
        return self.client

    async def connect(self):
        if self.client:
            await self.client.connect()

    async def disconnect(self):
        if self.client:
            await self.client.disconnect()

    async def publish(self, topic: str, payload: Any, qos: int=0, retained: bool=False):
        if not self.client:
            raise RuntimeError('client not created')
        return await self.client.publish(topic, payload, qos=qos, retained=retained)

    async def subscribe(self, topic: str):
        if not self.client:
            raise RuntimeError('client not created')
        return await self.client.subscribe(topic)

    def replay_fixture(self):
        if not self.backend or not self.client:
            return
        self.backend.replay(self.client)
