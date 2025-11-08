# ExecPlan: Translate project to Python (UPDATED)

Purpose

Review the current Python translation under govee-python and update the
translation plan to reflect what has already been implemented and what
remains to reach feature parity with the TypeScript `lib/` codebase.

Summary of review

I inspected the TypeScript `lib/` tree and the translated Python package at
`govee-python/src/govee`.

What exists in govee-python (partial/complete):
- Core utilities: types, utils, bitflags, fixed-length-stack, errors, basic
  observable Subject implementation, and small test helpers.
- Data models: govee_device and simple from_payload helpers.
- Domain: minimal devices model/service and a handful of device state parsing
  helpers; minimal auth service, types, and state.
- Persist: a minimal JSON-based PersistService.
- Top-level: UltimateGoveeService minimal stub.
- Tests: a broad set of pytest unit tests exists under `govee-python/tests/`.
  Many cover the translated minimal modules.

What is missing or only minimally implemented (high-level):
- Extensive TypeScript surface in `lib/` is not yet translated: BLE decoder
  modules, BLE client, receiver/sender LAN socket code, mqtt/iot clients and
  handlers, OpenAPI client and models, DIY/govee-api modules, and many
  domain device state classes and state machines.
- Many complex modules that depend on rxjs, NestJS patterns, and IoT/REST
  integrations are intentionally reduced to minimal Python equivalents.
- Several domain device implementations, device factories, and channel
  sagas/handlers are not ported.

Updated approach and priority

We will continue incremental translation with smaller, well-scoped tasks.
Priority order: core utilities and types -> data models and LAN parsing ->
BLE decoder/client & IoT clients -> OpenAPI/REST/API modules -> domain
device states and factories -> channels (BLE, IoT, REST/OpenAPI) ->
integration wiring and top-level service.

Updated tasks

NOTE: tasks are intentionally granular so each can be implemented and tested
in isolation. Marking current state where applicable.

1) Repo and tooling (status: mostly done)
- [x] Ensure govee-python package scaffold exists and tests run in the venv
      (govee-python/.venv). Validate uv scripts and pyproject configuration.
- [x] Ensure `uv run -s all_checks` exists and enforces ruff/black/isort + pytest
      coverage gate.

2) Core utilities (status: partially done)
- [x] types.py (done)
- [x] utils.py (done)
- [x] bitflags.py (done)
- [x] fixed_length_stack.py (done)
- [x] errors.py (done)
- [x] simple Subject observable (done)
- [x] implement delta/partial subject / delta-map observable equivalents
      (lib/common/observables/*) — these are used by device state handling and
      will be required for full parity.

3) Data layer (status: partially done)
- [x] govee_device dataclass (done)
- [ ] LAN receiver/sender socket wrappers and parsing (lib/data/lan/*)
      - translate receiver.socket.ts, sender.socket.ts (asyncio UDP wrappers)
      - translate receiver.service.ts/sender.service.ts
      - unit tests using persisted LAN fixtures
- [ ] BLE client & decoder modules (lib/data/ble/*)
      - decoder.service.ts and decoder types
      - BLE client (gatt) abstraction used by BLE channel
- [ ] OpenAPI client models and service (lib/data/openapi/*)
- [ ] IoT client and iot.handler (lib/data/iot/*)
- [ ] MQTT client wrappers (lib/common/mqtt/*)
- [ ] API modules (govee-api, diy, product, effect) — basic HTTP clients and
      models

4) Domain — devices (status: minimal)
- [x] basic device dataclass and simple DevicesService (done)
- [ ] translate device states implementations (lib/domain/devices/states/*)
      - power, brightness, color-temp, color-rgb, effect, timers, etc.
      - include unit tests translated from TypeScript specs
- [ ] device factory, version info, and device impls (RGB, RGBIC, purifier,
      humidifier, ice-maker, presence, hygrometer, meat thermometer, syncbox)
- [ ] device controller and CQRS wiring used by domain

5) Domain — auth (status: minimal)
- [x] auth types, state, and a simple AuthService (done)
- [ ] translate full auth sagas/handlers and queries/events for token refresh
      and credential management used across the service

6) Domain — channels (status: minimal)
- [ ] BLE channel: translate types, service, sagas, and handlers
- [ ] IoT channel: translate iot channel service/handlers and message parsing
- [ ] REST/OpenAPI channel: translate openapi channel service and handlers
- [ ] Rest channel sagas and controllers

7) Persist layer (status: minimal)
- [x] persist types and a simple PersistService for JSON read/write (done)
- [ ] expand to support named stores or shelve-like behavior if needed by
      translated modules and tests

8) Top-level wiring & service
- [x] minimal UltimateGoveeService stub (done)
- [ ] translate ultimate-govee.module.ts, config, and service wiring to Python
      dependency injection pattern (or explicit composition) and add
      integration tests for start/stop, channel discovery, and module
      initialization

9) Tests & fixtures
- [x] many unit tests are present already under `govee-python/tests/` that
      validate the minimal translations
- [ ] add additional tests to cover translated modules as they are added;
      port realistic fixtures from `persisted/` for LAN/mqtt/decoder tests
- [ ] ensure coverage gate passes (adjust threshold if necessary during
      early work)

Execution plan (next actionable steps)

A. Add missing lint/check script binding in uv and ensure `uv run -s all_checks` works. (done)
B. Implement delta/partial observable primitives used by device states (small task).
C. Translate LAN receiver socket and receiver.service with unit tests using
   persisted/fixtures (UDP packet parsing). This enables LAN discovery tests.
D. Translate BLE decoder service and tests.
E. Progressively translate IoT and OpenAPI clients and relevant domain handlers.

Committing convention

- I updated this ExecPlan file to reflect the current repository state and the
  prioritized next tasks.

