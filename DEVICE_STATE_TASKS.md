Below is a concrete, actionable Markdown task list you can copy into a ticket or the repo plan. It breaks the overall work into small RED → GREEN → REFACTOR steps (TDD-style) and includes filenames, test names, commands to run, acceptance criteria and suggested commit messages. I focused on device classes that are commonly missing/partial in parity efforts (RGBIC / addressable strips, additional light variants, and common base refactors). Adjust the list to match exact models you want to support.

Note: run all commands from the repository root. Use the project venv and uv as documented:
- Activate venv: . govee-python/.venv/bin/activate
- Run tests: uv --directory govee-python run -s test -- tests/<testfile.py>
- Run format/lint: uv --directory govee-python run -s format_check

---
# Device classes parity — TDD task list

## Inventory / prep
- [x] RED: add a small audit test showing what device implementations are currently present/used by tests
  - Test file: govee-python/tests/test_device_implementations_inventory.py
  - Behavior: import domain factory & implementations and assert a mapping/list of implemented classes (e.g., RGBDevice) and assert expected missing names (RGBICDevice, StripDevice)
  - Command: uv --directory govee-python run -s test -- tests/test_device_implementations_inventory.py
  - Commit message: test(devices): add inventory test for device implementations (RED)
  - Acceptance: test should fail or indicate which implementations are missing (this guides next tasks)

## A. RGBIC / Addressable LED device (high priority)
Many parity projects lack addressable-LED (IC) variant. Implement an RGBIC device class similar api to RGBDevice.

- [x] A1 — RED: failing unit tests for RGBIC behavior
  - Test file: govee-python/tests/test_rgbic_device.py
  - Tests:
    - test_rgbic_apply_payload_and_get_state
      - Create RGBICDevice, apply payload with per-segment color or full array, assert state fields (power, brightness, segments/colors).
    - test_rgbic_encode_command
      - Call encode_command with changes and assert returned frames include expected op codes (e.g., 'rgbic', 'mode', 'segment') and parameters.
    - test_rgbic_effects
      - Apply effect payload and assert the device encodes the effect frame.
  - Commands:
    - uv --directory govee-python run -s test -- tests/test_rgbic_device.py
  - Commit message: test(devices): add failing tests for RGBICDevice (RED)

- [x] A2 — GREEN: minimal class implementation to satisfy tests
  - File to add: govee-python/src/govee/domain/devices/implementations/rgbic.py
  - Implement:
    - class RGBICDevice(DeviceBase) or stand-alone class with:
      - __init__(id, model, name)
      - apply_payload(payload) — populate internal state for segments/colors/brightness/power
      - get_state() — return DeviceState (use domain/devices/models.DeviceState)
      - encode_command(command) — return list of frames matching test expectations
    - Keep implementation minimal (only fields used by tests)
  - Tests to run:
    - uv --directory govee-python run -s test -- tests/test_rgbic_device.py
  - Commit message: feat(devices): add minimal RGBICDevice implementation (GREEN)

- [x] A3 — REFACTOR: finalize and extend
  - Goals:
    - Move shared logic to a common base (DeviceBase) if not existing.
    - Add type hints and docstrings.
    - Add more tests: edgecases, invalid payloads, compatibility with IoT adapter (simulate publishing encoded frames).
    - Ensure coverage and run full test suite.
  - Commands:
    - uv --directory govee-python run -s test
    - uv --directory govee-python run -s format_check
  - Commit message: refactor(devices): tidy RGBICDevice, add base class & docs

## B. RGBIC -> RGB parity improvements & other light variants
If dist or JS code references additional device classes (RGBICLightDevice, RGBLightDevice, etc.), implement them.

- [x] B1 — RED: add failing tests that expect parity device names to be constructible via factory
  - Test file: govee-python/tests/test_device_factory_names.py
  - Behavior:
    - request factory to construct devices for model names used in dist (e.g., 'RGBLight', 'RGBICLight') and assert Device subclass returned.
  - Commit message: test(devices): add failing tests for device constructors (RED)

- [x] B2 — GREEN: implement small mapping & constructors
  - Files:
    - govee-python/src/govee/domain/devices/factory.py (extend mapping/model heuristics)
    - govee-python/src/govee/domain/devices/implementations/<rgbic.py,rgb_light.py>
  - Acceptance: factory returns implementations; tests pass.
  - Commit message: feat(devices): map models to new implementations (GREEN)

- [x] B3 — REFACTOR: merge shared encoding, add docs & examples
  - Turn shared encoding utilities into helpers (e.g., encode_rgb, encode_brightness).
  - Add README snippet docs in govee-python/docs/devices.md
  - Commit message: refactor(devices): unify encoding helpers and document device implementation patterns

## C. White-temperature & simple white devices (if missing)
- [x] C1 — RED: failing tests for white-temperature (CT) device
  - Test file: govee-python/tests/test_white_temp_device.py
  - Tests: apply_payload with ct, brightness; encode command; get_state
  - Commit message: test(devices): add failing tests for white-temp devices (RED)
- [x] C2 — GREEN: implement minimal WhiteTempDevice class
  - File: implementations/white_temp.py
  - Commit message: feat(devices): add WhiteTempDevice (GREEN)
- [x] C3 — REFACTOR: integrate into factory and docs
  - Update factory mapping, add tests for IoT adapter path.
  - Commit message: refactor(devices): add WhiteTempDevice to factory and docs

## D. Generic Sensor / Probe devices (temperature/humidity)
- [x] D1 — RED: failing tests for sensor device (battery, temperature, humidity)
  - Test file: govee-python/tests/test_sensor_device.py
  - Tests: apply sensor payload, get_state, boundary values
  - Commit message: test(devices): add failing tests for sensor device (RED)
- [x] D2 — GREEN: implement sensor device
  - File: implementations/sensor.py
  - Commit message: feat(devices): add SensorDevice (GREEN)
- [ ] D3 — REFACTOR: unify parsing with DeviceState, add calibration handling
  - Commit message: refactor(devices): unify sensor state handling & calibration

## E. Common base / utilities (applies across A–D)
- [ ] E1 — RED: failing tests for DeviceBase behavior
  - Test file: govee-python/tests/test_device_base.py
  - Tests:
    - default get_state() returns DeviceState
    - default apply_payload merges values
    - encode_command contract (list of frames)
  - Commit message: test(devices): add base class contract tests (RED)
- [ ] E2 — GREEN: implement DeviceBase
  - File: govee-python/src/govee/domain/devices/device_base.py
  - Provide:
    - apply_payload(payload) default merge
    - get_state() default synthesizer
    - encode_command(command) abstract (raise NotImplementedError)
  - Make RGBDevice and new classes inherit from DeviceBase
  - Commit message: feat(devices): add DeviceBase and refactor implementations (GREEN)
- [ ] E3 — REFACTOR: strong typing, docs, examples
  - Add type stubs, docstrings, examples in docs/devices.md
  - Commit message: refactor(devices): type-hint DeviceBase & document API

## F. Integration tests (IoT path)
- [ ] F1 — RED: failing integration tests that ensure device encodes commands & IoT pipeline sends expected payloads
  - Test file: govee-python/tests/test_device_iot_integration.py
  - Behavior:
    - Create device instance, call encode_command, feed frames to IoTAdapter/FakeMQTTBackend, assert targeted topic and payload are produced/forwarded.
  - Commit message: test(devices): add iot-integration tests (RED)
- [ ] F2 — GREEN: ensure adapter compatibility
  - Fix any adapter wiring needed (topic formats, payload shapes)
  - Acceptance: tests pass and no regressions in existing iot tests
  - Commit message: feat(devices): ensure device command frames integrate with IoTAdapter (GREEN)

## G. Documentation & examples
- [ ] G1 — REFACTOR: add device docs
  - Files:
    - govee-python/docs/devices.md — describe DeviceBase API and example implementation (RGBDevice)
    - README.md snippet + example code for applying payloads and encoding commands
  - Commit message: docs(devices): document device API & examples

## H. Lint/format and finalize
- [ ] H1 — Run format/lint and fix everything:
  - Commands:
    - . govee-python/.venv/bin/activate
    - uv --directory govee-python run -s format_check
    - uv --directory govee-python run -s test
  - Commit message: chore(format): apply formatting & lint fixes
- [ ] H2 — REFACTOR: run full test+CI
  - uv --directory govee-python run -s all_checks
  - Ensure no warnings or failing tests
  - Commit message: chore(ci): finalize device parity & run all checks

---

# Suggested order of work (priority)
1. Inventory (quick failing test) — to know exactly what’s missing.
2. Implement DeviceBase and minimal RGBIC (A & E combined) — high value for strips.
3. Add factory mappings and tests to construct new classes (B).
4. Implement White-temp & Sensor if required (C & D).
5. Add integration IoT tests (F).
6. Documentation and tidy (G).
7. Format/lint + full checks (H).

# Commit etiquette & workflow notes
- [ ] Commit after every GREEN task using conventional commit format:
  - test(...): for adding failing tests (RED)
  - feat(...): for minimal implementations (GREEN)
  - refactor(...)/docs(...)/chore(...): for cleanup and docs (REFACTOR)
- [ ] Use realistic test vectors in tests (use sample payloads found in persisted fixtures/persisted directory).
- [ ] Use uv for tests and format_check:
  - uv --directory govee-python run -s test -- tests/test_xyz.py
  - uv --directory govee-python run -s format_check

# Example concrete changes for one device (RGBIC)
- [x] Add tests: govee-python/tests/test_rgbic_device.py (failing at first)
- [x] Implement: govee-python/src/govee/domain/devices/implementations/rgbic.py
- [x] Use DeviceBase: govee-python/src/govee/domain/devices/device_base.py
- [x] Update factory: govee-python/src/govee/domain/devices/factory.py (map model patterns to RGBICDevice)
- [x] Run: uv --directory govee-python run -s test -- tests/test_rgbic_device.py
- [x] Commit messages:
  - test(devices): add failing tests for RGBICDevice (RED)
  - feat(devices): implement minimal RGBICDevice (GREEN)
  - refactor(devices): extract DeviceBase and move shared logic (REFACTOR)