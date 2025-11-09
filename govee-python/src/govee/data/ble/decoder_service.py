"""Placeholder DecoderService ported minimally for parity with TS DecoderService.

This implementation supports decode_device(peripheral) by using the existing
GoveeBleDecoder for simple models and falling back to None for complex IoTManager
based decoding. It also stubs get_device_spec and get_common_properties.
"""
from __future__ import annotations

from typing import Optional, Dict, Any
from govee.data.ble.decoder import GoveeBleDecoder

class DecoderService:
    def __init__(self, config: Optional[Dict[str, Any]] = None, decoder: Optional[Any] = None):
        self.config = config or {}
        self.decoder = decoder or GoveeBleDecoder()

    async def decode_device(self, peripheral: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Decode a peripheral into decoded device info.

        For now, use the simple GoveeBleDecoder behavior: match local name and
        parse manufacturer_data. More advanced IoTManager-based decoding is
        out of scope for this minimal service.
        """
        # emulate the TS service model matching Hxxxx patterns if local name present
        name = peripheral.get('advertisement', {}).get('localName') or peripheral.get('name')
        if not name:
            return None
        # use the simple decoder
        # translate advertisement keys to expected simple decoder keys
        adv = dict(peripheral.get('advertisement', {}))
        if 'manufacturer_data' in adv:
            adv['manufacturer_data'] = adv['manufacturer_data']
        res = self.decoder.decode({'name': name, **adv})
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

    async def get_device_spec(self, model: str):
        return None
