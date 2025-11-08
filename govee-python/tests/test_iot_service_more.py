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


def test_connect_stores_iot_data():
    svc = IotService()

    # sample realistic iot_data that a higher-level component might pass
    iot_data = {
        "accountId": "acct-123",
        "clientId": "client-abc",
        "topic": "govee/device/42",
        "endpoint": "a1b2c3d4wxyz-ats.iot.us-west-2.amazonaws.com",
    }

    # initially no iot_data stored
    assert getattr(svc, "iot_data", None) is None

    svc.connect(iot_data=iot_data)
    # after connect the service should retain the provided iot_data
    assert svc.iot_data == iot_data

    svc.disconnect()
    # disconnect should clear stored iot_data
    assert getattr(svc, "iot_data", None) is None


def test_simulate_only_calls_callback_if_subscribed():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        called['topic'] = msg.topic

    svc.connect(callback=cb)

    # not subscribed yet: simulate should be a no-op
    svc.simulate_incoming(IotMessage(topic="govee/device/100", payload={}))
    assert called == {}

    # subscribe then simulate should invoke
    svc.subscribe("govee/device/100")
    svc.simulate_incoming(IotMessage(topic="govee/device/100", payload={}))
    assert called.get('topic') == "govee/device/100"


def test_topic_wildcard_hash_suffix_matches_prefix():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        called['topic'] = msg.topic

    svc.connect(callback=cb)
    # subscribe using a simple '#' suffix wildcard meaning prefix match
    svc.subscribe("govee/device/#")

    svc.simulate_incoming(IotMessage(topic="govee/device/42", payload={}))
    assert called.get('topic') == "govee/device/42"


def test_multiple_callbacks_and_unregister():
    svc = IotService()

    called_a = {}
    called_b = {}

    def cb_a(msg: IotMessage) -> None:
        called_a['topic'] = msg.topic

    def cb_b(msg: IotMessage) -> None:
        called_b['topic'] = msg.topic

    # connect with no callback, register two callbacks
    svc.connect()
    svc.register_callback(cb_a)
    svc.register_callback(cb_b)

    svc.subscribe("govee/device/7")
    svc.simulate_incoming(IotMessage(topic="govee/device/7", payload={}))

    # both callbacks should have been invoked
    assert called_a.get('topic') == "govee/device/7"
    assert called_b.get('topic') == "govee/device/7"

    # unregister one callback then simulate again
    svc.unregister_callback(cb_b)
    called_a.clear()
    called_b.clear()
    svc.simulate_incoming(IotMessage(topic="govee/device/7", payload={}))

    assert called_a.get('topic') == "govee/device/7"
    assert called_b == {}
