"""Color RGB state parsing (minimal port).

Parses color state payloads with keys state.color.{red,green,blue} and
simple op-code arrays [op, identifier, subid, r, g, b]. This is a small
subset to match unit tests ported from the TypeScript suite.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def parse_color_rgb(payload: Optional[Dict[str, Any]]) -> Optional[Dict[str, int]]:
    if payload is None:
        return None
    st = payload.get("state") if isinstance(payload, dict) else None
    if isinstance(st, dict):
        color = st.get("color")
        if isinstance(color, dict):
            try:
                r = int(color.get("red"))
                g = int(color.get("green"))
                b = int(color.get("blue"))
                if 0 <= r <= 255 and 0 <= g <= 255 and 0 <= b <= 255:
                    return {"red": r, "green": g, "blue": b}
            except Exception:
                return None
    # op-code handling: look for op.command arrays
    op = payload.get("op") if isinstance(payload, dict) else None
    if isinstance(op, dict):
        cmds = op.get("command")
        if isinstance(cmds, list) and cmds:
            cmd = cmds[0]
            if isinstance(cmd, list) and len(cmd) >= 6:
                # [opType, identifier, subid, r, g, b]
                _, _, _, r, g, b = cmd[:6]
                try:
                    if 0 <= r <= 255 and 0 <= g <= 255 and 0 <= b <= 255:
                        return {"red": r, "green": g, "blue": b}
                except Exception:
                    return None
    return None


__all__ = ["parse_color_rgb"]
