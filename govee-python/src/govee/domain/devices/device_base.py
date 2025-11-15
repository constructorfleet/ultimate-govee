"""Common base class for device implementations.

DeviceBase extends the simple Device dataclass with a common surface area
for concrete implementations: apply_payload, get_state and encode_command.
This allows implementations to inherit shared behavior and keeps the
implementations lightweight for tests.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional

from .device import Device
from .models import DeviceState


class DeviceBase(Device):
    """Minimal base for device implementations.

    Concrete implementations should override apply_payload and encode_command
    as needed. get_state returns a DeviceState instance stored on the
    implementation (default None).
    """

    def __init__(
        self, id: str, model: Optional[str] = None, name: Optional[str] = None
    ):
        super().__init__(id=id, model=model, name=name)
        self._state: DeviceState = DeviceState()

    def apply_payload(self, payload: Dict[str, Any]) -> None:
        """Apply an incoming payload to the device state.

        Default implementation stores nothing; concrete classes should
        populate self._state and other attributes.
        """
        # default behavior: parse into DeviceState using parse_state
        from .models import parse_state

        st = parse_state(payload or {})
        self._state = st

    def register_state_factories(self, factories: List[Any]) -> None:
        """Instantiate and register state instances from provided factories.

        factories may be callables or class objects that accept the device
        instance as their first argument. We instantiate each state and
        attach it to the device under a conventional attribute name.
        """
        self._states: List[Any] = []
        # mapping for friendly attribute names used by tests
        attr_map = {
            'SegmentColorModeState': 'segment_state',
            'ColorRGBState': 'color_state',
            'SceneModeState': 'scene_state',
            'MicModeState': 'mic_state',
            'DiyModeState': 'diy_state',
            'RGBICActiveState': 'active_state',
            'BrightnessState': 'brightness_parsed',
            'PowerState': 'power_parsed',
            'ColorTempState': 'color_temp_state',
        }
        import importlib, sys
        from inspect import isclass
        from pathlib import Path
        # ensure package 'govee' (src) is on sys.path so imports work when
        # code is executed from the repository root during tests.
        src_dir = str(Path(__file__).resolve().parents[3])
        if src_dir not in sys.path:
            sys.path.insert(0, src_dir)
        for fac in factories:
            inst = None
            # string name -> import module and instantiate
            if isinstance(fac, str):
                name = fac
                module_name = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
                module_name = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', module_name).lower()
                try:
                    mod = importlib.import_module('govee.domain.devices.states.' + module_name)
                    cls = getattr(mod, fac)
                    inst = cls(self)
                except Exception:
                    inst = None
            elif isclass(fac):
                try:
                    inst = fac(self)
                except Exception:
                    inst = None
            elif callable(fac):
                try:
                    inst = fac(self)
                except Exception:
                    inst = None
            else:
                # assume instance
                inst = fac
            if inst is None:
                continue
            self._states.append(inst)
            clsname = inst.__class__.__name__
            attr = attr_map.get(clsname)
            if attr is None:
                # fallback: simple snake of class name without 'State'
                name = clsname
                if name.endswith('State'):
                    name = name[:-5]
                # very simple camel->snake
                s = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
                s = re.sub('([a-z0-9])([A-Z])', r'\1_\2', s).lower()
                attr = f"{s}_state"
            setattr(self, attr, inst)

    def parse_states(self, payload: Dict[str, Any]) -> None:
        """Iterate registered states and call their parse(payload) if present."""
        for st in getattr(self, '_states', []):
            try:
                parse = getattr(st, 'parse', None)
                if callable(parse):
                    parse(payload or {})
            except Exception:
                # swallow parsing errors per-device to avoid breaking others
                continue

    def get_state(self) -> DeviceState:
        return self._state

    def encode_command(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Encode a high-level command to a list of frames.

        Concrete implementations should provide encoding logic; default
        returns an empty list.
        """
        # default: encode common fields: power and brightness (helpers)
        frames: List[Dict[str, Any]] = []
        if "power" in command:
            frames.append({"op": "power", "v": 1 if bool(command.get("power")) else 0})
        if "brightness" in command:
            try:
                v = int(command.get("brightness"))
            except Exception:
                v = 0
            frames.append({"op": "bright", "v": max(0, min(100, v))})
        return frames


__all__ = ["DeviceBase"]
