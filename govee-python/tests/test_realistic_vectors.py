"""Use realistic persisted vectors to exercise device parsing and encoding.

This test iterates a small set of persisted devices and ensures the factory
constructs a device instance, apply_payload can be called with a realistic
sample payload for the detected family, and encode_command returns frames
with expected op names. This is behavioral parity (ops and params), not
strict golden-frame equality.
"""

from pathlib import Path
import json

from govee.domain.devices.factory import make_device_from_advert


def _sample_payload_for_impl(impl: str):
    if impl == "rgbic":
        return {"power": 1, "brightness": 80, "segments": [{"index": 0, "length": 10, "color": {"r": 10, "g": 20, "b": 30}}]}
    if impl == "rgb":
        return {"power": 1, "brightness": 70, "color": {"r": 12, "g": 34, "b": 56}}
    if impl == "white":
        return {"power": 1, "brightness": 60}
    if impl == "sensor":
        return {"tempc": 22.5, ".cal": 1, "tempc1": 22.5, "battery": 90, "hum": 50}
    return {"power": 1}


def test_realistic_vectors_sample():
    p = Path("persisted/govee.devices.json")
    obj = json.loads(p.read_text())
    devices = obj.get("devices", [])
    # sample up to 6 devices across families
    seen = set()
    count = 0
    for d in devices:
        model = d.get("deviceExt", {}).get("deviceSettings", {}).get("model") or d.get("sku")
        advert = {"id": d.get("device"), "name": d.get("deviceName"), "deviceExt": d.get("deviceExt", {})}
        dev = make_device_from_advert(model, advert)
        if not dev:
            continue
        # determine impl type by class name
        impl = dev.__class__.__name__.lower()
        # coerce to expected impl key
        if "rgbic" in impl:
            key = "rgbic"
        elif "rgb" in impl:
            key = "rgb"
        elif "white" in impl:
            key = "white"
        elif "sensor" in impl:
            key = "sensor"
        else:
            key = "unknown"

        if key in seen:
            continue
        seen.add(key)
        payload = _sample_payload_for_impl(key)
        # only call apply_payload if device supports it
        if hasattr(dev, "apply_payload"):
            dev.apply_payload(payload)
            st = dev.get_state()
            # basic asserts on state
            assert st is not None
        # encode a simple command
        if hasattr(dev, "encode_command"):
            frames = dev.encode_command({"power": False})
            assert isinstance(frames, list)
            # expect at least one power or bright/op frame
            assert any(isinstance(f, dict) and f.get("op") in ("power", "bright", "rgb", "seg", "ct") for f in frames)

        count += 1
        if count >= 6:
            break

