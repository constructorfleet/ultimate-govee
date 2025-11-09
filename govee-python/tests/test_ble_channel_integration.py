from govee.data.ble.client import BleClient
from govee.domain.channels.ble.channel import BleChannel
from govee.domain.devices.service import DevicesService


def test_ble_channel_forwards_peripheral_to_devices_service():
    client = BleClient()
    devices = DevicesService()
    channel = BleChannel(client, devices)

    # enable client so feed_peripheral will decode and emit
    channel.set_enabled(True)

    # simulate a decoded peripheral emitted by decoder — feed_peripheral
    # normally accepts raw peripheral; we will call the client's subscriber
    # by invoking feed_peripheral with a payload matching decoder expectations
    peripheral = {"id": "dev-1", "mac": "AA:BB", "state": {"power": True}}
    # The BleClient will call decoder.decode_device synchronously; to avoid
    # depending on the decoder behavior we can directly invoke the subject
    client.peripheral_decoded.next(peripheral)

    st = devices.get_state("dev-1")
    assert st is not None
    assert st.power is True

