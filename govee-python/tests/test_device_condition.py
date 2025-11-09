from govee.data.ble import device_condition


def test_device_matches_name_prefix() -> None:
    device = {"name": "Govee-ModelX", "manufacturerData": ""}
    # condition: match first 6 chars of name equal to 'Govee-'
    cond = ["name", "Govee"]
    assert device_condition.device_matches(device, cond)


def test_device_matches_mac_at_index() -> None:
    device = {"macAddress": "AABBCCDDEEFF", "manufacturerData": ""}
    # mac at index 3 equals 'BB'
    cond = ["mac@index", 3, "B"]
    assert device_condition.device_matches(device, cond)


def test_device_inverse_condition() -> None:
    device = {"name": "Other", "manufacturerData": ""}
    cond = ["inverse", [4, "Gove"]]
    assert device_condition.device_matches(device, cond)
