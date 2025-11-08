from govee.domain.channels.iot.service import IotService
from govee.domain.channels.iot.types import IotMessage


def test_connect_and_disconnect_and_callback():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        # record that the callback was invoked with the given topic
        called['topic'] = msg.topic

    # initially disconnected
    assert svc.connected is False

    svc.connect(callback=cb)
    assert svc.connected is True

    # subscribe should be recorded
    svc.subscribe("govee/device/1")
    assert "govee/device/1" in svc.subscriptions

    # simulate an incoming message triggers callback
    incoming = IotMessage(topic="govee/device/1", payload={"on": False})
    svc.simulate_incoming(incoming)
    assert called.get('topic') == "govee/device/1"

    # disconnect should clear connected flag and callback
    svc.disconnect()
    assert svc.connected is False

    # simulate after disconnect should be a no-op
    called.clear()
    svc.simulate_incoming(incoming)
    assert called == {}


def test_send_accepts_strings_and_objects_and_publish_alias():
    svc = IotService()

    # send with dict payload
    svc.send("govee/device/2", {"brightness": 10})
    # send with pre-serialized JSON string
    svc.send("govee/device/2", '{"brightness":20}')

    assert len(svc.published) == 2
    assert svc.published[0].topic == "govee/device/2"
    assert isinstance(svc.published[0].payload, dict)
    assert svc.published[1].payload == '{"brightness":20}'

    # publish alias should also append
    msg = IotMessage(topic="govee/device/3", payload={"on": True})
    svc.publish(msg)
    assert svc.published[-1].topic == "govee/device/3"


def test_subscribe_idempotent():
    svc = IotService()
    svc.subscribe("topic/a")
    svc.subscribe("topic/a")
    assert svc.subscriptions.count("topic/a") == 1
