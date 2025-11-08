from __future__ import annotations

from typing import Optional
from govee.domain.channels.iot.service import IotService
from govee.domain.devices.service import DevicesService
from govee.domain.channels.iot.types import IotMessage


class IoTChannel:
    """Small adapter wiring IotService to DevicesService for tests."""

    def __init__(self, iot: IotService, devices: DevicesService) -> None:
        self.iot = iot
        self.devices = devices
        self._connected = False

    def connect(self, iot_data: Optional[object] = None) -> None:
        # register a callback that will be invoked on incoming messages
        def on_msg(msg: IotMessage) -> None:
            # payload expected to be a dict with an 'id' and state fields
            payload = msg.payload
            if isinstance(payload, dict) and 'id' in payload:
                device_id = payload['id']
                # pass full payload to devices service for parsing
                self.devices.update_state(device_id, payload)

        self.iot.connect(iot_data, on_msg)
        # subscribe to device topics by default so incoming messages are routed
        # to the registered callback. Tests use 'govee/device/<id>' topics, so
        # a simple prefix wildcard is sufficient.
        self.iot.subscribe('govee/device/#')
        self._connected = True

    def disconnect(self) -> None:
        self.iot.disconnect()
        self._connected = False

    def publish_message(self, command_id: str, topic: str, payload: object, debug: bool = False):
        # mirror IoTChannelService.publishMessage behavior in minimal form
        if debug:
            pass
        # the IotService.send in our stub returns the created IotMessage
        import json

        if not isinstance(payload, str):
            serialized = json.dumps(payload)
        else:
            serialized = payload
        return self.iot.send(topic, serialized)
