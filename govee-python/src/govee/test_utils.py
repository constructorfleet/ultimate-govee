"""Testing helpers translated from lib/common/test-utils.ts

Provide small synchronous helpers to assert that device state parsing and
command emission behave as expected in unit tests. These are simplified and
do not depend on rxjs; they operate against small test doubles used in tests.
"""
from __future__ import annotations

from typing import Any, Callable, List


def wipe_timeout(_):
    # noop placeholder for API parity with TypeScript helper
    return None


class DummyState:
    def __init__(self):
        self.parse_calls: List[Any] = []
        self.set_state_calls: List[Any] = []
        self.command_bus: List[Any] = []

    def parse(self, value: Any) -> None:
        self.parse_calls.append(value)

    def subscribe(self, fn: Callable[[Any], None]) -> None:
        # For our synchronous helpers, calling subscribe will simply store
        # the provided function and not be used; tests will call parse directly.
        self._subscriber = fn

    def set_state(self, next_state: Any) -> List[Any]:
        # Simulate emitting commands when setting state by returning a list
        # of commands; also record the call.
        self.set_state_calls.append(next_state)
        commands = []
        # if next_state is a dict with a special key, produce a command
        if isinstance(next_state, dict) and next_state.get("emit"):
            cmd = {"cmd": next_state.get("emit")}
            self.command_bus.append(cmd)
            commands.append(cmd)
        return commands

