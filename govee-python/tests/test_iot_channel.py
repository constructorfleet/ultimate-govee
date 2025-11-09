from govee.domain.channels.iot.service import IotService
from govee.domain.channels.iot.types import IotMessage


def test_iot_publish_records_message():
    svc = IotService()
    msg = IotMessage(topic="govee/device/1", payload={"on": True})
    svc.publish(msg)
    assert len(svc.published) == 1
    assert svc.published[0].topic == "govee/device/1"

