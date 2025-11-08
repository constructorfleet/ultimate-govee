from govee.data.govee_device import GoveeDevice, GoveeCommandData


def test_govee_device_dataclass():
    dev = GoveeDevice(id="d1", name="Device 1", model="M1")
    assert dev.id == "d1"
    assert dev.model == "M1"


def test_command_data():
    cd = GoveeCommandData(command=[[1, 2, 3]])
    assert cd.command[0][0] == 1

