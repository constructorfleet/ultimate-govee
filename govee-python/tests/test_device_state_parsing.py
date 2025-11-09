from govee.domain.devices.models import DeviceState, parse_state


def test_parse_color_temp_and_temperature():
    payload = {"power": True, "brightness": 70, "color_temp": 3000, "tempc": 22}
    st = parse_state(payload)
    assert isinstance(st, DeviceState)
    assert st.power is True
    assert st.brightness == 70
    assert st.color_temp == 3000
    assert st.temperature == 22


def test_parse_battery_and_humidity_and_rgb():
    payload = {"battery": 85, "humidity": 44, "rgb": {"r": 10, "g": 20, "b": 30}}
    st = parse_state(payload)
    assert st.battery == 85
    assert st.humidity == 44
    assert st.color == {"r": 10, "g": 20, "b": 30}


def test_parse_effect_fields():
    payload = {"effect": "Rainbow", "effectId": 3}
    st = parse_state(payload)
    assert st.effect_name == "Rainbow"
    assert st.effect_id == 3
