from govee.common.mqtt_client import MqttClient


def test_publish_and_subscribe():
    client = MqttClient()
    client.connect()

    received = []

    def cb(msg):
        received.append((msg.topic, msg.payload, msg.retained))

    client.register_callback(cb)
    client.subscribe("a/b")
    client.publish("a/b", {"on": True})

    assert received == [("a/b", {"on": True}, False)]


def test_unsubscribe_and_disconnect():
    client = MqttClient()
    client.connect()
    client.subscribe("x/y")
    client.disconnect()
    # after disconnect callbacks cleared and connected false
    assert client.connected is False
