"""IceMaker scheduled start state minimal implementation."""
from __future__ import annotations

from typing import Any, Dict, Optional, List
from govee.domain.devices.states.device_op_state import DeviceOpState
from govee.common.op_code import as_op_code, total, unpadded_hex_to_array
from govee.domain.devices.encoding import pack_raw_frame
import time

class IceMakerScheduledStart(DeviceOpState):
    def __init__(self, device: Any):
        super().__init__('scheduled_start', {})

    def parse(self, payload: Dict[str, Any]) -> None:
        v = payload.get('scheduledStart') or payload.get('scheduled_start')
        if isinstance(v, dict):
            self.state_value.next(v)

    def get(self) -> Optional[Dict[str, Any]]:
        return self.state_value.get_value()

    def encode(self, command: Dict[str, Any]) -> List[Dict[str, Any]]:
        frames: List[Dict[str, Any]] = []
        if not command:
            return frames
        v = command.get('scheduledStart') or command.get('scheduled_start')
        if v is None:
            return frames
        # Expect v to be dict with enabled, hourStart, minuteStart, nuggetSize
        if not isinstance(v, dict):
            return frames
        enabled = bool(v.get('enabled', False))
        if not enabled:
            frames.append({'op': 'op', 'code': as_op_code(0x33, 0x00)})
            return frames
        hs = v.get('hourStart')
        ms = v.get('minuteStart')
        ng = v.get('nuggetSize')
        if hs is None or ms is None or ng is None:
            return frames
        # create timestamp seconds UTC for next start time approximated to today/hour/minute
        # Use time.time() as a simple approximation; convert hour/minute to a unix timestamp
        now = time.time()
        t = int(now)
        # pack opcodes similar to TS: leading 0x01, 2 bytes of minutes until start, 4 bytes timestamp, nugget code
        minutes = int(ms + hs * 60)
        ts_bytes = unpadded_hex_to_array(hex(int(t))[2:]) or []
        map_rev = {'SMALL': 3, 'MEDIUM': 2, 'LARGE': 1}
        code = map_rev.get(str(ng).upper()) if isinstance(ng, str) else int(ng)
        opcodes = [0x01, minutes & 0xFF, (minutes >> 8) & 0xFF] + ts_bytes + [int(code & 0xFF)]
        frames.append({'op': 'op', 'code': as_op_code(0x33, opcodes)})
        return frames


__all__ = ['IceMakerScheduledStart']
