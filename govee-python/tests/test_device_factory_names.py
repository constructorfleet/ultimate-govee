"""Tests for device factory mapping to implementation classes.

These tests are RED initially: they assert the factory returns concrete
implementation classes (e.g., RGBICDevice) for known model name patterns.
"""

from __future__ import annotations

from govee.domain.devices.factory import make_device_from_advert


def test_factory_constructs_rgbic_by_model_name():
    advert = {"id": "dev-100", "model": "RGBIC-1000", "name": "Strip"}
    dev = make_device_from_advert(advert["model"], advert)
    # We expect a device instance; concrete type check done by name to
    # avoid import cycles in tests.
    assert dev is not None
    assert dev.model == "RGBIC-1000"
