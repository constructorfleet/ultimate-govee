# ExecPlan: Current progress for govee-python

Purpose

Record the current implementation status of the Python translation (govee-python)
and maintain a clear, up-to-date ExecPlan describing work that remains to
achieve feature parity with the TypeScript `lib/` codebase. This file is a
single-source ExecPlan for the iteration that brings the Python package closer
to parity.

Progress (living)

- Repository/Tooling
  - Package scaffold and pyproject exist; uv scripts configured (status: done).
  - Tests and lint scripts are available in uv.scripts.toml (status: done).

- Core utilities
  - types.py, utils.py, bitflags.py, fixed_length_stack.py, errors.py,
    simple Subject observable and small helpers implemented and exposed
    via package surface (status: done).
  - Delta/partial observable primitives required for full device-state
    implementations are NOT yet implemented (status: pending).

- Data layer (LAN / BLE / IoT / OpenAPI)
  - LAN receiver/sender minimal wrappers and parsing exist in the Python
    translation (status: partially done).
  - BLE decoding: a minimal per-advertisement decoder (src/govee/data/ble/decoder.py)
    and a small DecoderService stub (src/govee/data/ble/decoder_service.py)
    exist and are exercised by unit tests (status: partially done).
    - The Python decoder recognizes simple advertisements and parses
      manufacturer_data in a minimal H6112-like format.
    - The full TypeScript DecoderService behavior — IoTManager-based decoding,
      condition/property matching, and spec-driven decoding — is NOT implemented
      and must NOT be marked complete until feature parity is achieved.
  - BLE client shim exists referencing DecoderService (status: minimal).
  - OpenAPI, IoT clients, and MQTT wrappers from the TypeScript repo are NOT
    translated yet (status: pending).

- Domain: devices and auth
  - Basic device dataclass and a minimal DevicesService exist (status: minimal).
  - Auth types and a simple AuthService exist (status: minimal).
  - Full device state classes and controllers (power/brightness/color/effects,
    state machines and factories) are NOT implemented (status: pending).

- Persist layer
  - A JSON-based PersistService exists (status: minimal).

- Top-level service
  - A minimal UltimateGoveeService stub is present (status: minimal).

Tests & Fixtures

- There are unit tests for many of the translated minimal modules under
  tests/. The BLE decoder and decoder_service tests are present and pass in
  the current environment.
- Additional realistic fixtures from the TypeScript project (LAN packets,
  persisted mqtt payloads, decoder fixtures) must be ported for full parity.

Next actionable steps (short-term)

1) Update ExecPlan(s)
   - Keep this ExecPlan current as translation proceeds. Do NOT mark any task
     as complete unless the Python implementation achieves behavior parity
     with the TypeScript original.

2) Continue BLE Decoder work (priority)
   - Port or adapt device.condition and property.condition logic to allow
     spec-driven decoding.
   - Implement the TypeScript DecoderService behaviors:
     - Loading model specs and common properties
     - Condition matching and property post-processing
     - IoTManager path for complex decoders
   - Add translated test fixtures for device-specific decoding cases.
   - Only mark BLE decoding tasks complete once the Python service reproduces
     the same decoded outputs as the TypeScript tests for a representative
     set of models.

3) Implement delta/partial observable primitives used by domain/state
   - These are needed by device state implementations. Write unit tests that
     exercise observable behaviors similar to the TypeScript observables.

4) Translate IoT / OpenAPI / MQTT clients (medium-term)
   - Implement OpenAPI client models and a small HTTP client wrapper
   - Implement IoT client parsing and handlers, and MQTT wrappers used by
     the TypeScript repo. Add tests using realistic fixtures.

5) Translate domain device states and wiring (long-term)
   - Port device state classes (power, brightness, color-temp, color, effect,
     timers), device factories, and controllers. Add unit tests derived from
     TypeScript specifications.

Progress tracking and conventions

- This ExecPlan is a living document. Update it whenever code changes alter
  scope, implementation approach, or progress. Keep the Progress section
  accurate and do NOT mark tasks complete until feature parity is reached.
- Use small, test-driven iterations. Commit after each logical task with a
  conventional commit message.

