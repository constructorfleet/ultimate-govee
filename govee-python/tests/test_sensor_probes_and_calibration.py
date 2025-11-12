"""Tests for sensor multi-probe and calibration parsing."""

from govee.domain.devices.implementations.sensor import SensorDevice


def test_sensor_multi_probe_and_calibration():
    payload = {"tempc": 22.1, ".cal": 2, "tempc1": 22.1, "tempc2": 21.8, "battery": 92, "hum": 55}
    d = SensorDevice("s-10")
    d.apply_payload(payload)
    st = d.get_state()
    assert st.temperature == 22.1
    assert st.temperature_calibration == 2
    assert isinstance(st.temp_probes, dict)
    assert st.temp_probes.get(1) == 22.1 and st.temp_probes.get(2) == 21.8
    assert st.battery == 92
    assert st.humidity == 55

