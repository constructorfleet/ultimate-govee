"""Minimal DeviceOpState base class to support device state parsing and
state->command translation in unit tests.

This is a simplified port of the TypeScript DeviceOpState used by specific
state implementations (brightness, color temp, etc.). It provides a
stateValue container, a command_bus list to simulate emission, and
helpers for subclasses.
"""
from __future__ import annotations

from typing import Any, Callable, Dict, List, Optional


class StateValue:
    def __init__(self, value: Optional[Any] = None):
        self._value = value

    def get_value(self) -> Optional[Any]:
        return self._value

    def next(self, value: Any) -> None:
        self._value = value


class DeviceOpState:
    def __init__(self, name: str, initial: Optional[Any] = None):
        self.name = name
        self.state_value = StateValue(initial)
        self._subscribers: List[Callable[[Any], None]] = []
        # command_bus collects commands emitted by set_state
        self.command_bus: List[Dict[str, Any]] = []

    def subscribe(self, fn: Callable[[Any], None]) -> None:
        self._subscribers.append(fn)

    def _emit_state(self, value: Any) -> None:
        for fn in list(self._subscribers):
            try:
                fn(value)
            except Exception:
                # tests don't rely on subscriber exceptions
                pass

    # parsing entry-point used by tests
    def parse_state(self, payload: Any) -> None:
        """Subclasses should override this to parse payloads and call
        self.state_value.next(...) and self._emit_state(...).
        """
        raise NotImplementedError()

    # state setting entry-point used by tests; returns list of commands
    def set_state(self, next_state: Any) -> List[Dict[str, Any]]:
        """Subclasses may implement state->command translation by returning
        a list of commands. The default implementation uses the
        state_to_command hook if present.
        """
        if hasattr(self, "state_to_command"):
            try:
                result = self.state_to_command(next_state)
            except Exception:
                result = None
            if result is None:
                return []
            # result may include status and command keys
            command = result.get("command") if isinstance(result, dict) else result
            if command is not None:
                # record and emit command
                self.command_bus.append(command)
                # in tests we also notify any subscribers on command_bus
                self._emit_state(command)
                return [command]
        return []


__all__ = ["DeviceOpState", "StateValue"]
