from govee.domain.channels.ble.service import BleService
from govee.domain.channels.ble.types import BleCommand


def test_ble_send_records_command():
    svc = BleService()
    cmd = BleCommand(device="dev1", payload=b"\x01\x02")
    svc.send(cmd)
    assert len(svc.sent) == 1
    assert svc.sent[0].device == "dev1"

