from govee.data.ble.client import BleClient


def test_command_queue_forwards_commands():
    client = BleClient()

    cmd = {"commandId": "c1", "id": "dev1", "address": "AA:BB", "commands": [[1, 2]]}
    # publish to the command queue; subscriber should call send_command
    client.command_queue.next(cmd)

    assert len(client.sent) == 1
    assert client.sent[0]["commandId"] == "c1"


def test_cancel_prevents_sending():
    client = BleClient()
    client.cancel_command("c2")

    cmd = {"commandId": "c2", "id": "dev2", "address": "CC:DD", "commands": [[3]]}
    client.command_queue.next(cmd)

    # canceled command should not be recorded
    assert all(c.get("commandId") != "c2" for c in client.sent)
