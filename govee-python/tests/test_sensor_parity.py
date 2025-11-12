"""Behavioral parity tests for Sensor devices."""

from govee.domain.devices.implementations.sensor import SensorDevice


def test_sensor_parsing_and_fields():
    payload = {"tempc": 21.5, ".cal": 2, "tempc1": 21.5, "tempc2": 21.2, "batt": 88, "hum": 46}
    d = SensorDevice("s-300")
    d.apply_payload(payload)
    st = d.get_state()
    assert st.temperature == 21.5
    assert st.temperature_calibration == 2
    assert st.temp_probes[1] == 21.5
    assert st.temp_probes[2] == 21.2
    assert st.battery == 88
    assert st.humidity == 46
