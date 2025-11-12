Below is a focused, actionable markdown task list for implementing a DeviceFactory that builds device objects from the Govee product JSON (the same approach as the TypeScript implementation). It assumes you will follow TDD: write tests first, use realistic product JSON fixtures, add minimal code to satisfy tests, commit after each task, and use the repository venv and uv tool when adding dependencies or running tasks.

ExecPlan (high-level)
- Goal: Provide a DeviceFactory which reads product JSON and returns concrete Device instances (LED strip, bulb, bar, etc.) with capabilities populated from the product JSON.
- Strategy: Test-driven, incremental: add fixtures, tests for factory behavior, implement parsing utilities, implement DeviceFactory + concrete device classes, integrate into discovery flow, add docs and CI updates.
- Commits: One logical commit per task (conventional commit messages). Use govee-python/.venv and uv tool when adding deps or running tasks.

Task list (check off as you complete each item)

1) Design & Investigation
- [x] Review any existing TypeScript implementation (if available in repo or upstream) and record supported device types and mapping rules.
  - Files to inspect: lib/domain/devices/impl (TypeScript DeviceFactory implementations)
  - Expected outcome: mapping table (product json -> concrete Python class) to use as canonical reference.
  - Notes: extracted the TypeScript DeviceFactory matchers and saved them to govee-python/tests/fixtures/typescript_device_mappings.json. Extraction and comparison utilities are added at govee-python/tools/extract_ts_matchers.py and govee-python/tools/compare_ts_python_matchers.py.
  - Commit message: chore(device-factory): add design notes and mapping table

2) Add realistic product JSON fixtures
- [x] Copy the REAL raw product and device json files from persisted to the test fixtures directory
  - Path: tests/fixtures/govee_products.json and tests/fixtures/govee_devices.json
  - Notes: persisted/govee.products.json and persisted/govee.devices.json were copied to govee-python/tests/fixtures/govee.products.json and govee-python/tests/fixtures/govee.devices.json and committed.

3) Add tests for DeviceFactory (write tests before implementation)
- [x] Add unit tests that assert:
  - Factory returns the correct concrete class for a given model.
  - The device instance has capability metadata (brightness, color, etc.).
  - Unsupported/unknown model are logged and ignored.
  - The factory handles missing fields gracefully (e.g., missing capabilities => defaults).
  - Test file: tests/test_device_factory.py
  - Notes: added parity tests at govee-python/tests/test_device_factory_parity.py which compare the Python matcher (src/govee/domain/devices/matcher.py) against the extracted TypeScript matchers. A compare script (tools/compare_ts_python_matchers.py) verified 0 mismatches across all products (447 products). Parity tests pass.

4) Add minimal device base class and device stubs
- [ ] Add a Device base class with attributes that will be populated by the factory.
  - Path: govee/domain/devices/base.py
  - Minimal attributes: model, product_name, capabilities (dict), properties (list), friendly_name; simple __repr__.
- [ ] Add concrete device classes (stubs) used by tests:
  - govee/domain/devices/lights/RGBIC.py -> class RGBICDevice(Device)
  - govee/domain/devices/lights/RGB.py -> class RGBDevice(Device)
  - govee/domain/devices/appliances/IceMaker.py -> class IceMakerDevice(Device)
  - govee/domain/devices/appliances/Purifier.py -> class PurifierDevice(Device)
  - govee/domain/devices/appliances/Humidifier.py -> class HumidifierDevice(Device)
  - govee/domain/devices/sensors/AirQuality.py -> class AirQualitySensorDevice(Device)
  - govee/domain/devices/sensors/Hygrometer.py -> class HygrometerDevice(Device)
  - govee/domain/devices/sensors/Presence.py -> class PresenceDevice(Device)
- Keep these minimal — only what tests require (construction and storage of capability metadata).
- Commit message: feat(devices): add Device base and device stubs (LedStrip, Bulb, Generic)

5) Implement DeviceFactory skeleton
- [ ] Create govee/domain/devices/device_factory.py with DeviceFactory class.
  - Accept the same arguments as the Typescript Device Factory.
- [ ] Implement the same logic

6) Run tests, update code until tests pass (TDD)
- [ ] Run pytest under the project venv:
  - From repo root: uv run -C govee-python -- .venv/bin/pytest -q
  - If uv usage requires specific command: uv run -C govee-python -- pytest -q (ensure .venv activated)
- [ ] Fix issues incrementally, updating code to satisfy tests.
- Repeat small commits for each fix:
  - Commit messages examples:
    - fix(device-factory): parse capabilities boolean flags correctly
    - fix(test): adjust fixture keys to match parser expectations

9) Documentation & README updates
- [ ] Update README or contributor docs to explain how DeviceFactory works, where product JSON fixtures come from, and how to add new device types.
  - File: docs/device-factory.md or README.md section
- Commit message: docs(device-factory): add usage and extension docs

10) Linting & typing
- [ ] Add type hints to DeviceFactory and device classes.
- [ ] Run linters (flake8/ruff) using uv if configured; fix issues.
- Commit message: style(types): add typing and fix lint issues

11) CI adjustments
- [ ] If there's a CI config that runs tests, ensure it installs dependencies (including jsonschema if added) and runs tests in the correct venv.
- [ ] Ensure tests/fixtures are included in the package during CI.
- Commit message: ci(tests): ensure DeviceFactory tests run in CI

Developer notes / practical commands
- Use the repo venv located at govee-python/.venv for running tests and installing deps.
  - Example: source govee-python/.venv/bin/activate && uv run -C govee-python pytest -q
- To add a dependency (example: jsonschema):
  - uv add -C govee-python jsonschema
- Commit after each task using conventional commits. Example messages shown above.
- Tests should use realistic values: brightness levels (0-100), color hex or RGB objects, color_temp in Kelvin (2000-6500), device model strings like "H6001" and "H6104".

Example mapping table to implement in DeviceFactory
- type == "LED_STRIP" -> govee.devices.led_strip.LedStripDevice
- type == "BULB" -> govee.devices.bulb.BulbDevice
- type == "LED_BAR" -> govee.devices.led_bar.LedBarDevice (if present)
- else -> govee.devices.generic.GenericDevice

Error-handling decisions (decide in tests)
- Option A (preferred for forward compatibility): Unknown product types return GenericDevice with capability metadata present.
- Option B: Unknown product types raise DeviceFactoryError (useful for strict behavior).
- Encode decision in tests so implementation follows confirmed behavior.
