from govee.domain.channels.iot.service import IotService
from govee.domain.devices.service import DevicesService
from govee.domain.channels.iot.channel import IoTChannel
from govee.domain.channels.iot.types import IotMessage


def test_incoming_message_updates_device_state():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    # connect the adapter which registers a callback on the iot service
    channel.connect()

    # simulate an incoming message payload for device 'dev-1'
    msg_payload = {'id': 'dev-1', 'power': True, 'brightness': 50}
    iot.simulate_incoming(IotMessage(topic='govee/device/dev-1', payload=msg_payload))

    # the devices service should have been updated
    state = devices.get_state('dev-1')
    assert state.power is True
    assert state.brightness == 50
