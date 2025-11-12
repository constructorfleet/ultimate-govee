"""Python-side DeviceFactory mapping derived from the TypeScript factories.

This mapping lists known factories and their matchers (category -> group ->
either True for wildcard or list of regex pattern dicts with optional 'i' flag).

Keep this mapping in sync with the TypeScript factories under
lib/domain/devices/impl; tests compare the Python matcher against an
extraction of the TS matchers to ensure parity.
"""

from typing import Any, Dict, List


FactoryMatcher = Dict[str, Dict[str, Any]]


FACTORY_MATCHERS: List[Dict[str, Any]] = [
    {
        "factory": "HygrometerFactory",
        "matchers": {"Home Improvement": {"Temp": [{"pattern": ".*hygrometer.*", "flags": "i"}] }},
    },
    {
        "factory": "MeatThermometerFactory",
        "matchers": {"Home Improvement": {"Kitchen": [{"pattern": ".*wifi meat thermometer.*", "flags": "i"}] }},
    },
    {
        "factory": "AirQualityFactory",
        "matchers": {"Home Improvement": {"Temp": [{"pattern": ".*air quality.*", "flags": "i"}] }},
    },
    {
        "factory": "PresenceFactory",
        "matchers": {"Home Improvement": {"Sensors": [{"pattern": ".*presence.*", "flags": "i"}] }},
    },
    {
        "factory": "IceMakerFactory",
        "matchers": {"Home Appliances": {"Kitchen": [{"pattern": "ice maker", "flags": "i"}] }},
    },
    {
        "factory": "PurifierFactory",
        "matchers": {"Home Appliances": {"Air Treatment": [{"pattern": "purifier", "flags": "i"}] }},
    },
    {
        "factory": "HumidifierFactory",
        "matchers": {"Home Appliances": {"Air Treatment": [{"pattern": "humidifier", "flags": "i"}] }},
    },
    {
        "factory": "SyncBoxFactory",
        "matchers": {"LED Strip Light": {"TV BackLights": [{"pattern": ".*gaming sync box.*", "flags": "i"}] }},
    },
    {
        "factory": "DreamViewFactory",
        "matchers": {
            "LED Strip Light": {"TV BackLights": [{"pattern": ".*dreamview.*", "flags": "i"}]},
            "Indoor Lighting": {"Table Lamps": [{"pattern": ".*dreamview.*", "flags": "i"}]},
        },
    },
    {
        "factory": "RGBLightFactory",
        "matchers": {"LED Strip Light": {"RGB Strip Lights": True}, "Indoor Lighting": {"Table Lamps": [{"pattern": " RGB ", "flags": ""}]}},
    },
    {
        "factory": "RGBICLightFactory",
        "matchers": {
            "LED Strip Light": {"RGBIC Strip Lights": [{"pattern": ".*rgbic strip light.*", "flags": "i"}, {"pattern": ".*rgbic.*", "flags": "i"}]},
            "Indoor Lighting": {"Floor Lamps": [{"pattern": ".*rgbic strip light.*", "flags": "i"}, {"pattern": ".*rgbic.*", "flags": "i"}], "Wall Lamps": [{"pattern": ".*glide.*", "flags": "i"}]},
            "Outdoor Lighting": {"Strip Lights": [{"pattern": ".*phantasy.*", "flags": "i"}, {"pattern": ".*rgbic.*", "flags": "i"}], "String Lights": [{"pattern": ".*rgbic.*", "flags": "i"}]},
            "Other Lights": {"Car Lights": [{"pattern": ".*rgbic.*", "flags": "i"}]},
        },
    },
]


__all__ = ["FACTORY_MATCHERS"]

