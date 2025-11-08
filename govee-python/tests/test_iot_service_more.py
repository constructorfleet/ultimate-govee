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


def test_mqtt_wildcard_plus_and_hash():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        called['topic'] = msg.topic

    svc.connect(callback=cb)

    # '+' should match a single topic level
    svc.subscribe('govee/+/42')
    svc.simulate_incoming(IotMessage(topic='govee/device/42', payload={}))
    assert called.get('topic') == 'govee/device/42'

    called.clear()
    # '+' does not match multiple levels
    svc.simulate_incoming(IotMessage(topic='govee/device/sub/42', payload={}))
    assert called == {}

    called.clear()
    # '#' matches any number of trailing levels
    svc.subscribe('home/#')
    svc.simulate_incoming(IotMessage(topic='home/room1/light/state', payload={}))
    assert called.get('topic') == 'home/room1/light/state'

    called.clear()
    # single '#' as sole subscription matches any topic
    svc.subscribe('#')
    svc.simulate_incoming(IotMessage(topic='random/topic', payload={}))
    assert called.get('topic') == 'random/topic'


def test_retained_message_delivered_on_subscribe():
    svc = IotService()

    # simulate a retained message being published before any subscribers
    svc.send('govee/device/5', {'state': 'on'}, retained=True)

    called = {}
    def cb(msg: IotMessage) -> None:
        called['topic'] = msg.topic
        called['payload'] = msg.payload
        called['retained'] = getattr(msg, 'retained', False)

    svc.connect(callback=cb)
    # subscribing should immediately deliver the retained message to the callback
    svc.subscribe('govee/device/5')
    assert called.get('topic') == 'govee/device/5'
    assert called.get('payload') == {'state': 'on'}
    assert called.get('retained') is True


def test_clearing_retained_message_with_empty_payload():
    svc = IotService()

    # publish retained message
    svc.send('govee/device/5', {'state': 'on'}, retained=True)

    called = {}
    def cb(msg: IotMessage) -> None:
        called['topic'] = msg.topic

    svc.connect(callback=cb)
    # initial subscribe should get retained message
    # if it's present remove it then clear called and clear retained
    svc.unsubscribe('govee/device/5')
    svc.subscribe('govee/device/5')
    assert called.get('topic') == 'govee/device/5'

    # now clear retained by sending an empty payload with retained=True
    svc.send('govee/device/5', None, retained=True)

    # remove subscription so subscribe logic will attempt to deliver retained messages again
    svc.unsubscribe('govee/device/5')
    called.clear()
    svc.subscribe('govee/device/5')
    # no retained message should be delivered after clearing
    assert called == {}


def test_publish_records_qos_and_timestamp():
    import time
    svc = IotService()

    # publish with explicit qos and let service stamp timestamp
    msg = svc.send('govee/device/9', {'on': True}, retained=False, qos=1)

    assert msg.topic == 'govee/device/9'
    assert msg.qos == 1
    assert isinstance(msg.timestamp, float)
    # should be recorded in published list as well
    assert svc.published[-1].topic == 'govee/device/9'
    assert svc.published[-1].qos == 1


def test_queue_messages_while_disconnected():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        called.setdefault('seen', []).append(msg.topic)

    # connect and subscribe
    svc.connect(callback=cb)
    svc.subscribe('govee/device/queued')

    # disconnect: messages sent while disconnected should be queued
    svc.disconnect()
    svc.simulate_incoming(IotMessage(topic='govee/device/queued', payload={'state': 'x'}))
    svc.simulate_incoming(IotMessage(topic='govee/device/queued', payload={'state': 'y'}))

    # nothing yet
    assert called.get('seen') is None

    # reconnect (by calling connect with no-op callback registration)
    svc.connect(callback=cb)

    # queued messages should be delivered upon reconnect
    assert called.get('seen') is not None
    assert called['seen'] == ['govee/device/queued', 'govee/device/queued']


def test_incoming_queue_bounded():
    svc = IotService()

    called = {}

    def cb(msg: IotMessage) -> None:
        called.setdefault("seen", []).append(msg.topic)

    svc.connect(callback=cb)
    svc.subscribe("govee/device/bound")
    svc.disconnect()
    # send more messages than the planned max size (we will set default max 3)
    svc.simulate_incoming(IotMessage(topic='govee/device/bound', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/bound', payload={'v':2}))
    svc.simulate_incoming(IotMessage(topic='govee/device/bound', payload={'v':3}))
    svc.simulate_incoming(IotMessage(topic='govee/device/bound', payload={'v':4}))

    svc.connect(callback=cb)
    # if queue is bounded to 3, oldest should be evicted, so we expect last 3 messages
    assert called.get("seen") == ['govee/device/bound', 'govee/device/bound', 'govee/device/bound']


def test_configurable_incoming_queue_max():
    # create service with a custom small queue max
    svc = IotService()
    svc._incoming_queue_max = 2

    called = {}
    def cb(msg: IotMessage) -> None:
        called.setdefault('seen', []).append(msg.topic)

    svc.connect(callback=cb)
    svc.subscribe('govee/device/cfg')
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic='govee/device/cfg', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/cfg', payload={'v':2}))
    svc.simulate_incoming(IotMessage(topic='govee/device/cfg', payload={'v':3}))

    svc.connect(callback=cb)
    # only last 2 messages should be delivered
    assert called.get('seen') == ['govee/device/cfg', 'govee/device/cfg']


def test_constructor_queue_max():
    # construct service with a specific max queue size
    svc = IotService()
    svc._incoming_queue_max = 2

    called = {}
    def cb(msg: IotMessage) -> None:
        called.setdefault('seen', []).append(msg.topic)

    svc.connect(callback=cb)
    svc.subscribe('govee/device/constr')
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic='govee/device/constr', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/constr', payload={'v':2}))
    svc.simulate_incoming(IotMessage(topic='govee/device/constr', payload={'v':3}))

    svc.connect(callback=cb)
    # only last 2 messages should be delivered
    assert called.get('seen') == ['govee/device/constr', 'govee/device/constr']


def test_dropped_message_metric():
    svc = IotService()
    # small queue to force eviction
    svc._incoming_queue_max = 2

    svc.connect()
    svc.subscribe('govee/device/drop')
    svc.disconnect()

    # send 3 messages, expect 1 to be dropped (oldest)
    svc.simulate_incoming(IotMessage(topic='govee/device/drop', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/drop', payload={'v':2}))
    svc.simulate_incoming(IotMessage(topic='govee/device/drop', payload={'v':3}))

    # check internal dropped counter (to be implemented)
    assert getattr(svc, '_dropped_count', None) == 1

    # now reconnect and ensure we get the last 2 messages
    called = {}
    def cb(msg: IotMessage) -> None:
        called.setdefault('seen', []).append(msg.payload)
    svc.connect(callback=cb)
    assert called.get('seen') == [{'v':2}, {'v':3}]


def test_dropped_count_property():
    svc = IotService()
    svc._incoming_queue_max = 2

    svc.connect()
    svc.subscribe("govee/device/count")
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic="govee/device/count", payload={"v":1}))
    svc.simulate_incoming(IotMessage(topic="govee/device/count", payload={"v":2}))
    svc.simulate_incoming(IotMessage(topic="govee/device/count", payload={"v":3}))

    # public property should report number of dropped messages
    assert svc.dropped_count == 1

    # and on reconnect the queued messages should be delivered
    seen = []
    def cb(m: IotMessage) -> None:
        seen.append(m.payload)
    svc.connect(callback=cb)
    assert seen == [{"v":2}, {"v":3}]


def test_reset_dropped_count():
    svc = IotService()
    svc._incoming_queue_max = 1

    svc.connect()
    svc.subscribe('govee/device/reset')
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic='govee/device/reset', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/reset', payload={'v':2}))

    assert svc.dropped_count >= 1
    svc.reset_dropped_count()
    assert svc.dropped_count == 0


def test_simulate_interruption_queues_messages_when_callbacks_present():
    svc = IotService()

    called = []
    def cb(msg: IotMessage) -> None:
        called.append(msg.payload)

    svc.connect(callback=cb)
    svc.subscribe('govee/device/int')

    # simulate interruption: service should queue incoming messages even though callbacks exist
    svc.interrupt()
    svc.simulate_incoming(IotMessage(topic='govee/device/int', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/int', payload={'v':2}))

    # callbacks should not have been invoked during interruption
    assert called == []

    # resume should deliver queued messages in order
    svc.resume()
    assert called == [{'v':1}, {'v':2}]


def test_queued_count_property():
    svc = IotService()
    svc.connect()
    svc.subscribe("govee/device/queued_count")
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic="govee/device/queued_count", payload={"v":1}))
    svc.simulate_incoming(IotMessage(topic="govee/device/queued_count", payload={"v":2}))

    assert svc.queued_count == 2

    # after reconnect the queue should be delivered and count reset
    seen = []
    def cb(m: IotMessage) -> None:
        seen.append(m.payload)
    svc.connect(callback=cb)
    assert seen == [{"v":1}, {"v":2}]
    assert svc.queued_count == 0


def test_drop_event_callback():
    svc = IotService()
    svc._incoming_queue_max = 1

    dropped = []
    def on_drop(msg: IotMessage) -> None:
        dropped.append(msg.payload)

    svc.register_drop_callback(on_drop)
    svc.connect()
    svc.subscribe('govee/device/drop_event')
    svc.disconnect()

    svc.simulate_incoming(IotMessage(topic='govee/device/drop_event', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/drop_event', payload={'v':2}))

    # expect drop callback invoked once with oldest payload
    assert dropped == [{'v':1}]


def test_drop_logs_message(caplog):
    import logging
    svc = IotService()
    svc._incoming_queue_max = 1

    svc.connect()
    svc.subscribe('govee/device/logdrop')
    svc.disconnect()

    caplog.set_level(logging.WARNING)
    svc.simulate_incoming(IotMessage(topic='govee/device/logdrop', payload={'v':1}))
    svc.simulate_incoming(IotMessage(topic='govee/device/logdrop', payload={'v':2}))

    # expect a warning log indicating a dropped message occurred
    found = any('dropped' in rec.message.lower() and 'govee/device/logdrop' in rec.message for rec in caplog.records)
    assert found


def test_qos1_ack_flow():
    svc = IotService()
    # send a qos=1 message
    msg = svc.send('govee/device/qos1', {'cmd': 'ping'}, qos=1)
    # acked should default to False
    assert getattr(msg, 'acked', False) is False

    # calling acknowledge should set acked True
    svc.acknowledge(msg)
    assert getattr(msg, 'acked', False) is True


def test_send_with_retry_and_inflight_drop():
    svc = IotService()

    # register drop callback to observe dropped inflight message
    dropped = []
    svc.register_drop_callback(lambda m: dropped.append(m.payload))

    # send with retry semantics (qos=1) and max_retries=2
    msg = svc.send_with_retry('govee/device/retry', {'cmd': 'ping'}, qos=1, max_retries=2)
    assert getattr(msg, 'send_attempts', 0) == 1
    # msg should be in inflight list
    assert msg in svc._inflight

    # first retry: attempts -> 2 (still <= max_retries)
    svc.retry_inflight()
    assert msg.send_attempts == 2
    assert dropped == []

    # second retry: attempts -> 3 which is > max_retries, should be dropped
    svc.retry_inflight()
    assert msg not in svc._inflight
    assert dropped == [{'cmd': 'ping'}]
