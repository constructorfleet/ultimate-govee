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


def test_channel_publish_calls_iot_send():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    channel.connect()

    payload = {'topic': 'govee/device/command', 'msg': {'cmd': 'toggle'}}
    # publish a message via the channel
    sent = channel.publish_message('cmd-1', 'govee/device/command', payload, debug=True)

    # ensure the IoT service recorded the sent message
    assert len(iot.published) >= 1
    last = iot.published[-1]
    # payload recorded as dict/object and topic matches
    assert last.topic == 'govee/device/command'
    assert isinstance(last.payload, dict) or isinstance(last.payload, str)
    # publish_message should return the IoT message
    assert sent.topic == last.topic


def test_channel_publish_stringifies_payload():
    import json
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    channel.connect()

    payload = {'topic': 'govee/device/command', 'msg': {'cmd': 'toggle'}}
    sent = channel.publish_message('cmd-2', 'govee/device/command', payload, debug=False)

    last = iot.published[-1]
    assert isinstance(last.payload, str)
    # ensure it's valid JSON and decodes back to original structure
    decoded = json.loads(last.payload)
    assert decoded == payload
    assert sent.topic == last.topic


def test_channel_publish_propagates_retained_and_qos():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    channel.connect()

    payload = {'topic': 'govee/device/command', 'msg': {'cmd': 'set'}}
    sent = channel.publish_message('cmd-3', 'govee/device/command', payload, debug=False, retained=True, qos=1)

    last = iot.published[-1]
    assert last.topic == 'govee/device/command'
    # retained and qos should be propagated to the recorded IotMessage
    assert last.retained is True
    assert last.qos == 1
    assert sent.topic == last.topic


def test_channel_close_subscriptions():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    channel.connect()
    # subscribe to an extra topic directly
    iot.subscribe('govee/device/extra')
    # close subscriptions should clear all subscriptions the channel created
    channel.close_subscriptions()
    # ensure the service no longer has the channel subscription prefix
    assert not any(s.startswith('govee/device') for s in iot.subscriptions)


def test_channel_close_subscriptions_ownership():
    iot = IotService()
    devices = DevicesService()
    channel = IoTChannel(iot, devices)

    # channel subscribes on connect
    channel.connect()
    # another consumer subscribes to a different topic in same namespace
    iot.subscribe('govee/device/other')

    # close_subscriptions should only remove those created by channel
    channel.close_subscriptions()

    # the other subscription should remain
    assert 'govee/device/other' in iot.subscriptions
