"""Tests for DeviceBase behavior.

These tests ensure DeviceBase provides sensible defaults and parsing
integration and are RED until DeviceBase parsing behavior is implemented.
"""

from __future__ import annotations


def test_devicebase_default_state_and_get_state():
    from govee.domain.devices.device_base import DeviceBase

    db = DeviceBase("db-1", model="X")
    st = db.get_state()
    assert st is not None
    # fields should be present on DeviceState
    assert hasattr(st, "power")


def test_devicebase_apply_payload_uses_parse_state():
    from govee.domain.devices.device_base import DeviceBase

    db = DeviceBase("db-2")
    payload = {"power": 1, "brightness": 40, "tempc": 19.5, ".cal": 2}
    # expect apply_payload to exist and set state with parsed temperature/cal
    try:
        db.apply_payload(payload)
    except NotImplementedError:
        # RED: ensure tests expose missing implementation
        raise

    st = db.get_state()
    assert st.temperature == 19.5
    # calibration should be captured somewhere in state (temperature_calibration)
    assert st.temperature_calibration == 2
