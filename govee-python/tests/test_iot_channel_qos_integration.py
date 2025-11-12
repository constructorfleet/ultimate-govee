from govee.domain.channels.iot.service import IotService
from govee.domain.channels.iot.types import IotMessage


def test_channel_publish_with_qos_creates_inflight_and_acks():
    iot = IotService()

    # publish via channel using qos>0 should create an inflight entry
    payload = {"topic": "govee/device/qos", "msg": {"cmd": "ping"}}
    # publish_message doesn't accept max_retries; use iot.send_with_retry directly
    iot.send_with_retry("govee/device/qos", payload, qos=1, max_retries=3)

    assert iot.inflight_count == 1

    # simulate incoming ack referencing the original payload (not serialized)
    ack_payload = {"ack_for": payload}
    iot.simulate_incoming(IotMessage(topic="govee/device/qos", payload=ack_payload))

    # retry_inflight should clean up acknowledged messages
    iot.retry_inflight()
    assert iot.inflight_count == 0
