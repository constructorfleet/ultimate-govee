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
        # Compute exact start time using today's date and desired hour/minute.
        # This mirrors the TypeScript getStartTimeUTC behavior: pick the
        # next occurrence of the provided hour/minute (tomorrow if in the past)
        # and use its UTC timestamp.
        from datetime import datetime, timedelta, timezone

        now_dt = datetime.now(timezone.utc)
        start_dt = now_dt.replace(hour=int(hs), minute=int(ms), second=0, microsecond=0)
        if start_dt <= now_dt:
            start_dt = start_dt + timedelta(days=1)
        t = int(start_dt.timestamp())
        # timestamp encoded as 4 bytes big-endian (unpadded hex array)
        # ensure hex string length even
        hex_ts = format(int(t), 'x')
        ts_bytes = unpadded_hex_to_array(hex_ts) or []
        map_rev = {'SMALL': 3, 'MEDIUM': 2, 'LARGE': 1}
        code = map_rev.get(str(ng).upper()) if isinstance(ng, str) else int(ng)
        # minutes are provided low-byte first per TS implementation slice(-2)
        min_low = minutes & 0xFF
        min_high = (minutes >> 8) & 0xFF
        opcodes = [0x01, min_low, min_high] + ts_bytes + [int(code & 0xFF)]
        # produce as_op_code with OpType.COMMAND (0x33) and include the device identifier
        # In the TS implementation, asOpCode(OpType.COMMAND, this.identifier!, opCodes)
        # where this.identifier is [35]; we will mimic that by passing 35 first.
        frames.append({'op': 'op', 'code': as_op_code(0x33, 35, opcodes)})
        return frames


__all__ = ['IceMakerScheduledStart']
