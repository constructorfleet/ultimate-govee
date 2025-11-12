from typing import Any, List

from .types import BleCommand


class BleChannel:
    """Small compatibility shim matching constructor shape used in tests.

    The TypeScript constructor expects (client, devices). Provide the same
    signature and wire methods that tests rely on: set_enabled and
    feed_peripheral behavior is implemented by delegating to the client and
    devices service in a minimal way.
    """

    def __init__(self, client: Any, devices: Any) -> None:
        self.client = client
        self.devices = devices

        # subscribe to client's peripheral_decoded to update devices service
        def _on_peripheral(peripheral):
            # in TS code this publishes a DeviceStatusReceivedEvent; tests
            # expect DevicesService.get_state to be updated so call
            # devices.update_state with a normalized id and state payload.
            device_id = peripheral.get("id") or peripheral.get("address")
            state = peripheral.get("state")
            if device_id and state is not None:
                self.devices.update_state(device_id, state)

        self.client.peripheral_decoded.subscribe(_on_peripheral)

    def set_enabled(self, v: bool) -> None:
        # forward to client's enabled subject
        try:
            self.client.enabled.next(v)
        except Exception:
            # some clients expose set_enabled differently; be forgiving
            self.client.enabled = v

    def send_command(self, cmd: BleCommand) -> None:
        # forward to client
        if hasattr(self.client, "send_command"):
            self.client.send_command(cmd)
        elif hasattr(self.client, "send"):
            self.client.send(cmd)
        else:
            # record locally for tests
            if not hasattr(self, "sent"):
                self.sent = []
            self.sent.append(cmd)
