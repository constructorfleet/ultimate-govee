"""Edgecase tests for SensorDevice parsing and normalization."""

from govee.domain.devices.implementations.sensor import SensorDevice


def test_sensor_probe_keys_as_strings_and_missing_calibration():
    payload = {"tempc": 20.0, "tempc1": "20.0", "tempcX": "bad", "batt": 80}
    d = SensorDevice("s-400")
    d.apply_payload(payload)
    st = d.get_state()
    assert st.temperature == 20.0
    # temp_probes should include numeric key 1
    assert isinstance(st.temp_probes, dict)
    assert 1 in st.temp_probes and abs(st.temp_probes[1] - 20.0) < 1e-6
    # bad probe key should be ignored
    assert all(not isinstance(k, str) or not k.endswith('X') for k in st.temp_probes.keys())
    # calibration absent -> None
    assert st.temperature_calibration is None


def test_sensor_battery_and_humidity_alt_keys():
    payload = {"tempc": 19.5, "battery": 77, "hum": 44}
    d = SensorDevice("s-401")
    d.apply_payload(payload)
    st = d.get_state()
    assert st.battery == 77
    assert st.humidity == 44
