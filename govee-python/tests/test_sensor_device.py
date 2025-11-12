"""Tests for a minimal sensor device implementation (battery, temperature, humidity).

These tests are RED until a SensorDevice is implemented.
"""

from __future__ import annotations

from typing import Any, Dict


def _sample_payload() -> Dict[str, Any]:
    return {"battery": 85, "tempc": 21.5, "hum": 55}


def test_sensor_parses_states():
    from govee.domain.devices.implementations.sensor import SensorDevice

    payload = _sample_payload()
    dev = SensorDevice("s-1", model="S-100", name="Sensor 1")
    dev.apply_payload(payload)

    st = dev.get_state()
    assert st.battery == 85
    assert st.temperature == 21.5
    assert st.humidity == 55


def test_sensor_encode_empty_command():
    from govee.domain.devices.implementations.sensor import SensorDevice

    dev = SensorDevice("s-2")
    frames = dev.encode_command({})
    # Sensors may not encode commands; expect empty list
    assert frames == []
