"""Placeholder DecoderService ported minimally for parity with TS DecoderService.

This implementation supports decode_device(peripheral) by using the existing
GoveeBleDecoder for simple models and falling back to None for complex IoTManager
based decoding. It also stubs get_device_spec and get_common_properties.
"""
from __future__ import annotations

from typing import Optional, Dict, Any
from govee.data.ble.decoder import GoveeBleDecoder
from govee.data.ble import device_condition, property_condition
from govee.data.ble.decoder_lib import Decoder as DecoderLib
from govee.data.ble.iot_manager import IoTManager

class DecoderService:
    def __init__(self, config: Optional[Dict[str, Any]] = None, decoder: Optional[Any] = None):
        self.config = config or {}
        self.decoder = decoder or GoveeBleDecoder()
        # IoTManager fallback instance used for complex decoders; tests may
        # monkeypatch or replace this with a custom manager.
        self.iot_manager = IoTManager()

    async def decode_device(self, peripheral: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Decode a peripheral into decoded device info.

        For now, use the simple GoveeBleDecoder behavior: match local name and
        parse manufacturer_data. More advanced IoTManager-based decoding is
        out of scope for this minimal service.
        """
        # emulate the TS service model matching Hxxxx patterns. Some
        # advertisements may omit a localName; allow decoding when
        # manufacturer/service data is present so spec-driven detection
        # can proceed even without a device name.
        name = peripheral.get('advertisement', {}).get('localName') or peripheral.get('name')
        adv = dict(peripheral.get('advertisement', {}))
        if not (name or adv.get('manufacturer_data') or adv.get('service_data')):
            return None
        # use the simple decoder
        # translate advertisement keys to expected simple decoder keys
        if 'manufacturer_data' in adv:
            adv['manufacturer_data'] = adv['manufacturer_data']
        res = self.decoder.decode({'name': name, **adv})
        if res is None:
            # try to load a model spec using the mac/model in adv if available
            model = None
            if isinstance(adv.get('manufacturer_data'), (bytes, str)):
                try:
                    txt = adv.get('manufacturer_data')
                    # if bytes decode directly
                    if isinstance(txt, bytes):
                        txt = txt.decode('utf-8', errors='ignore')
                    # if it's a hex string, try to decode from hex to bytes then to utf-8
                    elif isinstance(txt, str) and all(c in '0123456789abcdefABCDEF' for c in txt) and len(txt) % 2 == 0:
                        try:
                            txt_dec = bytes.fromhex(txt)
                            txt = txt_dec.decode('utf-8', errors='ignore')
                        except Exception:
                            pass
                    if '|' in str(txt):
                        model = str(txt).split('|')[0]
                except Exception:
                    model = None
            if model:
                spec = await self.get_device_spec(model)
                if spec:
                    props = spec.get('properties', {})

                    # The TypeScript decoder may include top-level 'condition' logic
                    # that gates whether the spec applies to this advertisement. If
                    # present, evaluate it via device_condition.
                    top_cond = spec.get('condition')
                    if top_cond and not device_condition.device_matches({'manufacturerData': adv.get('manufacturer_data'), 'name': name, 'macAddress': peripheral.get('address')}, top_cond):
                        # spec doesn't apply
                        pass
                    else:
                        # If the spec indicates 'iot_manager': true, delegate to
                        # the IoTManager path which may perform more complex
                        # decoding that requires external assets. Otherwise use
                        # the local decoder_lib path.
                        if spec.get('iot_manager'):
                            ires = await self.iot_manager.decode(spec, {'manufacturerData': adv.get('manufacturer_data'), 'name': name, 'macAddress': peripheral.get('address')})
                            if ires:
                                res = {'model': model, 'properties': ires}
                        else:
                            decoded_props = DecoderLib.decode_properties({'manufacturerData': adv.get('manufacturer_data'), 'name': name, 'macAddress': peripheral.get('address')}, props)
                            # Always return a result dict for the model even if no
                            # properties decoded — the spec matched but individual
                            # properties may have been filtered by conditions.
                            res = {'model': model, 'properties': decoded_props or {}}
            if res is None:
                return None
        # merge into a basic decoded device structure
        decoded = {
            'id': peripheral.get('id') or peripheral.get('address'),
            'name': name,
            'macAddress': peripheral.get('address'),
            'uuid': peripheral.get('uuid'),
            'manufacturerData': adv.get('manufacturer_data'),
            'serviceData': [],
            **res,
        }
        return decoded

    async def get_common_properties(self):
        return None

    def _load_spec_from_dirs(self, model: str, dirs=None):
        """Try to find a JSON spec for the given model in a set of directories.

        The function searches directories in order and returns the parsed JSON
        object when found, or None if no spec is available. This keeps the
        service configurable for tests by allowing a custom spec_dir.
        """
        import json, os
        if dirs is None:
            dirs = ['ble', "assets"]
        for d in dirs:
            path = os.path.join(d, f"{model}.json")
            if os.path.exists(path):
                try:
                    with open(path, "r") as fh:
                        return json.load(fh)
                except Exception:
                    continue
        return None

    async def get_device_spec(self, model: str):
        """Return a device spec dict for model or None.

        This implementation uses _load_spec_from_dirs to look for model-specific
        JSON files in the repo ble/ and assets/ directories. Tests can override
        by mocking _load_spec_from_dirs or by placing fixtures in a temporary dir.
        """
        return self._load_spec_from_dirs(model)
