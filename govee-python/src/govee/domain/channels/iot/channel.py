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

    def publish_message(self, command_id: str, topic: str, payload: object, debug: bool = False, retained: bool = False, qos: Optional[int] = None, max_retries: Optional[int] = None):
        # mirror IoTChannelService.publishMessage behavior in minimal form
        if debug:
            pass
        import json

        if not isinstance(payload, str):
            serialized = json.dumps(payload)
        else:
            serialized = payload
        # For qos>0 allow retry behavior by delegating to send_with_retry
        if qos and qos > 0:
            # prefer IoTService.send_with_retry if available
            if hasattr(self.iot, 'send_with_retry'):
                return self.iot.send_with_retry(topic, serialized, qos=qos, max_retries=(max_retries or 3), retained=retained)
        # otherwise forward retained and qos to the IotService.send stub
        return self.iot.send(topic, serialized, retained=retained, qos=qos)

    def close_subscriptions(self) -> None:
        """Unsubscribe the channel's default subscriptions and leave the IoT service clean."""
        # for our simple adapter we remove any subscriptions that start with the
        # channel's prefix 'govee/device'
        to_remove = [s for s in list(self.iot.subscriptions) if s.startswith('govee/device')]
        for s in to_remove:
            self.iot.unsubscribe(s)
