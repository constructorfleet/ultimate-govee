# ExecPlan: Translate project to Python

Purpose

Translate the TypeScript code in `lib/` to a Python package under
`govee-python/src/govee` so the project can be used natively in Python. The
result should be a working Python package with unit tests and developer tooling
mirroring the original repo's behavior for core utilities.

High-level approach

- Work file-by-file, translating TypeScript modules to idiomatic Python.
- Implement minimal runtime behavior and tests that capture core behavior.
- Use the virtual environment at `govee-python/.venv` for running tests.
- Commit after every task using conventional commit messages.

Priority rules

1. Translate core utilities and common types first (other modules depend on these).
2. Translate data models and LAN parsing/receiving next (they're self-contained).
3. Translate domain logic (devices, channels, auth) in order of dependency.
4. Persist and wiring (module configuration, service) last.

Tasks

Each task describes a small translation unit (one file or a tight group). Tasks
are ordered by priority and should be completed sequentially.

Setup

- [x] Setup Python package scaffold and tooling: create `govee-python/src/govee`, initialize the project with `uv init`; add, pytest, ruff, black config, and a basic package __init__.

Core utilities (highest priority)

- [x] Translate lib/common/types.ts -> govee/types.py
- [x] Translate lib/common/index.ts -> govee/__init__.py (exports)
- [x] Translate lib/common/utils.ts -> govee/utils.py
- [x] Translate lib/common/bitflags.ts -> govee/bitflags.py
- [x] Translate lib/common/fixed-length-stack.ts -> govee/fixed_length_stack.py
- [x] Translate lib/common/errors/govee.error.ts and govee-api.error.ts -> govee/errors.py
- [x] Translate lib/common/test-utils.ts -> govee/test_utils.py
- [x] Add pytest tests for each utility using realistic test data.

Data layer

- [x] Translate lib/data/govee-device.ts -> govee/data/govee_device.py (dataclasses)
- [x] Translate lib/data/index.ts -> govee/data/__init__.py
- [x] Translate LAN receiver files:
  - [x] lib/data/lan/receiver/receiver.types.ts -> govee/data/lan/receiver/types.py
  - [x] lib/data/lan/receiver/receiver.config.ts -> govee/data/lan/receiver/config.py
  - [x] lib/data/lan/receiver/receiver.providers.ts -> govee/data/lan/receiver/providers.py
  - [x] lib/data/lan/receiver/receiver.socket.ts -> govee/data/lan/receiver/socket.py (asyncio wrapper)
  - [x] lib/data/lan/receiver/receiver.service.ts -> govee/data/lan/receiver/service.py
  - [x] Add unit tests for LAN parsing and receiver logic using saved fixtures.

Domain — devices and models

- [x] Translate lib/domain/devices/device.ts -> govee/domain/devices/device.py
- [x] Translate lib/domain/devices/devices.model.ts and devices.types.ts -> govee/domain/devices/models.py and types.py
- [x] Translate lib/domain/devices/devices.service.ts -> govee/domain/devices/service.py
- [x] Translate device factory and version info -> govee/domain/devices/factory.py and version_info.py
- [x] Add unit tests for device construction and state mapping.

Domain — auth

- [x] Translate lib/domain/auth/auth.types.ts -> govee/domain/auth/types.py
- [x] Translate lib/domain/auth/auth.state.ts -> govee/domain/auth/state.py
- [x] Translate lib/domain/auth/auth.service.ts -> govee/domain/auth/service.py
- [x] Translate commands/handlers/sagas used by auth -> govee/domain/auth/*
- [x] Add unit tests for credential handling and command dispatching.

Domain — channels

- [x] Translate channel primitives (channel.types.ts, channel.service.ts) -> govee/domain/channels/
- BLE channel:
  - [x] Translate types and service -> govee/domain/channels/ble/{types.py,service.py}
  - [x] Translate BLE controller/handlers used by the service -> govee/domain/channels/ble/
  - [x] Add unit tests for BLE command encoding/decoding.
- IoT channel:
  - [x] Translate iot channel types, service, commands, events, handlers -> govee/domain/channels/iot/
  - [x] Add unit tests for IoT message handling.
- REST/OpenAPI channel:
  - [x] Translate rest and openapi channel modules and handlers -> govee/domain/channels/{rest,openapi}
  - [x] Add unit tests for request/response handling (use fixtures where available).

Persist layer

- [x] Translate lib/persist/persist.types.ts -> govee/persist/types.py
- [x] Translate lib/persist/persist.providers.ts, persist.decorators.ts, persist.service.ts -> govee/persist/
- [x] Add tests ensuring persistence read/write semantics with temp files.

Common observables & helpers

- [x] Translate Subject/Observable patterns used in lib/common (rxjs usage) to Python equivalents (asyncio or synchronous observer patterns) in govee/common/observables.py and operators.
- [x] Add unit tests for observable behaviors used by the service layer.

Top-level wiring & service

- [x] Translate lib/ultimate-govee.types.ts -> govee/ultimate_govee/types.py (module options)
- [x] Translate lib/ultimate-govee.config.ts -> govee/ultimate_govee/config.py
- [x] Translate lib/ultimate-govee.module.ts and main.ts -> govee/ultimate_govee/module.py and __main__.py
- [x] Translate lib/ultimate-govee.service.ts -> govee/ultimate_govee/service.py
- [x] Add integration-style tests for the top-level service (connect flow, channel discovery) using mocks.

Tests & fixtures

- [x] Translate TypeScript spec tests under lib and test/ to pytest equivalents under govee-python/tests/
- [x] Copy realistic persisted logs and fixtures from persisted/ into govee-python/tests/fixtures/
- [x] Ensure all tests run in govee-python/.venv and pass locally.

Acceptance criteria

- Each translated module has at least one unit test asserting core behavior.
- All translated tests pass: pytest -q (within the virtualenv).
- Repository contains a runnable Python package under govee-python/src/govee.

Process notes

- After completing each task, commit changes with a conventional commit message.
- Keep tasks small and independently testable.

