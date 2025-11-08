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


def test_retained_message_via_channel_updates_device():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    # publish retained message before the channel connects
    iot.send('govee/device/dev-2', {'id': 'dev-2', 'power': False, 'brightness': 10}, retained=True)

    # connect the channel (which subscribes to device topics)
    channel.connect()

    # retained message should be delivered on subscribe and update device state
    state = devices.get_state('dev-2')
    assert state is not None
    assert state.power is False
    assert state.brightness == 10
