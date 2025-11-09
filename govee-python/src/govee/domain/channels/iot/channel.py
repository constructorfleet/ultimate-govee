from __future__ import annotations

from typing import List, Optional

from govee.domain.channels.iot.service import IotService
from govee.domain.channels.iot.types import IotMessage
from govee.domain.devices.service import DevicesService


class IoTChannel:
    """Small adapter wiring IotService to DevicesService for tests."""

    def __init__(self, iot: IotService, devices: DevicesService) -> None:
        self.iot = iot
        self.devices = devices
        self._connected = False
        # track subscriptions created by this channel so close_subscriptions
        # can remove only them and not others in the service.
        self._owned_subscriptions: List[str] = []

    @property
    def owned_subscriptions(self) -> List[str]:
        return list(self._owned_subscriptions)

    def connect(self, iot_data: Optional[object] = None) -> None:
        # register a callback that will be invoked on incoming messages
        def on_msg(msg: IotMessage) -> None:
            # payload expected to be a dict with an 'id' and state fields
            payload = msg.payload
            if isinstance(payload, dict) and "id" in payload:
                device_id = payload["id"]
                # pass full payload to devices service for parsing
                self.devices.update_state(device_id, payload)

        self.iot.connect(iot_data, on_msg)
        # subscribe to device topics by default so incoming messages are routed
        # to the registered callback. Tests use 'govee/device/<id>' topics, so
        # a simple prefix wildcard is sufficient.
        self.iot.subscribe("govee/device/#")
        self._owned_subscriptions.append("govee/device/#")
        self._connected = True

    def disconnect(self) -> None:
        self.iot.disconnect()
        self._connected = False
        # clear owned subscriptions tracking (do not attempt to unsubscribe
        # here; callers should use close_subscriptions to remove subscriptions
        # from the service while leaving the channel state consistent).
        self._owned_subscriptions = []

    # expose a read-only view of owned subscriptions; defined once above

    def close_subscriptions(self) -> None:
        """Unsubscribe any subscriptions that were created by this channel.

        This removes only the subscriptions recorded in _owned_subscriptions
        from the underlying IotService and clears the owned list.
        """
        for sub in list(self._owned_subscriptions):
            try:
                self.iot.unsubscribe(sub)
            except Exception:
                # keep best-effort semantics for the test stub
                pass
        self._owned_subscriptions = []

    def publish_message(
        self,
        cmd_id: str,
        topic: str,
        payload: object,
        debug: bool = False,
        retained: bool = False,
        qos: Optional[int] = None,
    ) -> IotMessage:
        """Publish a message via the IoT service.

        - If debug is False the payload will be JSON-stringified so the
          service records a string payload (mirrors the TS behavior used in
          tests). If debug is True the payload is passed through as-is.
        - If qos is provided and > 0 use the service's send_with_retry to
        exercise inflight/retry semantics in tests; otherwise call send.
        Returns the IotMessage recorded by the service.
        """
        # avoid importing json at module import time for tiny tests
        if not debug:
            try:
                import json

                send_payload = json.dumps(payload)
            except Exception:
                # fallback to the raw payload if serialization fails
                send_payload = payload
        else:
            send_payload = payload

        if qos is not None and qos > 0 and hasattr(self.iot, "send_with_retry"):
            msg = self.iot.send_with_retry(
                topic, send_payload, qos=qos, retained=retained
            )
        else:
            msg = self.iot.send(topic, send_payload, retained=retained, qos=qos)
        return msg

    def metrics_text(self) -> str:
        """Delegate a simple metrics/text snapshot to the underlying service."""
        if hasattr(self.iot, "metrics_text"):
            return self.iot.metrics_text()
        # fallback to a minimal representation
        return ""
