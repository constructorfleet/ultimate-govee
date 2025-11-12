
High-level goal
- Finish device-class parity so the Python domain supports the common device families used by the persisted fixtures and TypeScript code: addressable strips (RGBIC), RGB lights, white-temperature lights (CT), simple white lights, night-lights, sensors, and improved factory mapping and encoding parity. Each step is tested and committed.

How we will work
- Work RED → GREEN → REFACTOR for each small change.
- Use the project's venv and uv wrapper for tests and checks:
  - . govee-python/.venv/bin/activate
  - uv --directory govee-python run -s test -- tests/<testfile.py>
  - uv --directory govee-python run -s format_check
  - uv --directory govee-python run -s all_checks
- Commit after every GREEN task with conventional commit format.
- Implement the Typescript functionality as Python!

Task list (markdown)

1) Inventory / quick audit (if you want to re-run)
- test: govee-python/tests/test_device_implementations_inventory.py (already added)
- Command:
  - . govee-python/.venv/bin/activate
  - uv --directory govee-python run -s test -- tests/test_device_implementations_inventory.py
- Acceptance: shows which implementations are present; use this to prioritize families to implement.

2) Must-have device families (per persisted samples)
- Real device models present in persisted/govee.devices.json include (examples): H601B, H6042, H5072/H5179 classes, many H6xxx H5xxx — treat these families as:
  - RGB/RGB Light family
  - RGBIC / addressable strip family (already added)
  - White-temp (CT) family (already added)
  - Simple white lights (on/off + brightness)
  - Night lights (on/off, brightness, maybe night-mode)
  - Sensor devices (battery/temp/humidity — already added)
  - (Optional) Model-specific special devices (RGBIC variants with segments, IC counts)

3) Implement per-family tasks
- For each family below follow this micro-workflow:
  - RED: add unit tests that define the required behavior (failing).
  - GREEN: implement minimal class to satisfy tests.
  - REFACTOR: extract shared helpers, update docs, update factory.
  - Commit after each GREEN.

- [x] A. RGB (non-addressable) light family
- RED
  - Add tests: govee-python/tests/test_rgb_light_device.py
  - Tests:
    - test_rgb_apply_payload_and_get_state: apply payload {"power":1,"brightness":85,"color":{"r":10,"g":20,"b":30}} assert DeviceState fields
    - test_rgb_encode_command: encode {'power':True,'brightness':70,'color':{'r':255,'g':128,'b':0}} → expect frames [{'op':'power','v':1},{'op':'bright','v':70},{'op':'rgb','r':255,'g':128,'b':0}]
  - Command: uv --directory govee-python run -s test -- tests/test_rgb_light_device.py
  - Commit: test(devices): add failing tests for RGBLightDevice (RED)
- GREEN
  - Add implementation: govee-python/src/govee/domain/devices/implementations/rgb_light.py
    - class RGBLightDevice(DeviceBase)
    - apply_payload(payload) → parse_state(), keep any color in state
    - encode_command(command) → produce power/bright/rgb frames (reuse DeviceBase for power/bright)
  - Command: uv --directory govee-python run -s test -- tests/test_rgb_light_device.py
  - Commit: feat(devices): add minimal RGBLightDevice implementation (GREEN)
- REFACTOR
  - If multiple devices repeat encode logic, extract encode helpers (encode_power, encode_brightness, encode_rgb) to govee-python/src/govee/domain/devices/encoding.py
  - Update docs & examples.
  - Commit: refactor(devices): extract encoding helpers & update docs (REFACTOR)

- [x] B. RGBIC (addressable) — confirm parity & expand
- RED (if additional behaviors missing)
  - Add test(s) for segment array payloads and full-pixel-array payloads:
    - govee-python/tests/test_rgbic_more.py
    - Example payloads:
      - segments variant: {"power":1,"brightness":80,"segments":[{"index":0,"length":10,"color":{"r":12,"g":34,"b":56}}, {"index":1,"length":20,"color":{"r":200,"g":120,"b":0}}]}
      - raw pixel array variant: {"power":1,"brightness":100,"pixels":[[r,g,b],[...],...]} (if TS supports)
  - Check effects: test that encode_command({'effect':{'name':'rainbow','speed':3}}) emits {'op':'effect',...}
  - Command: uv --directory govee-python run -s test -- tests/test_rgbic_more.py
  - Commit: test(devices): add RGBIC edge-case tests (RED)
- GREEN
  - Enhance implementation govee-python/src/govee/domain/devices/implementations/rgbic.py to support any missing behavior required by tests (pixel arrays, multi-segment encoding, effect parameters).
  - Command: uv --directory govee-python run -s test -- tests/test_rgbic_more.py
  - Commit: feat(devices): extend RGBICDevice to support pixel-array & effects (GREEN)
- REFACTOR
  - Move shared segment/pixel encoding helpers to encoding module.
  - Document in docs/devices.md specifics for segments / op codes.
  - Commit: refactor(devices): unify rgbic encoding helpers & docs (REFACTOR)

- [x] C. White-temperature (CT) family (complete checklist)
- RED (if additional behaviors needed)
  - Add tests for CT limits and transitions:
    - govee-python/tests/test_whitetemp_edgecases.py
    - Examples: {"color_temp":2700}, {"color_temp":6500}, invalid values ignored
  - Command: uv --directory govee-python run -s test -- tests/test_whitetemp_edgecases.py
  - Commit: test(devices): add failing CT edgecase tests (RED)
- GREEN
  - Extend WhiteTempDevice implementation if tests show gaps: validate bounds, clamp, encode {'op':'ct','v':XXX}
  - Commit: feat(devices): ensure WhiteTempDevice clamps and encodes CT (GREEN)
- REFACTOR
  - Document behavior and add example payloads in docs/devices.md
  - Commit: docs(devices): add white-temp examples (REFACTOR)

- [x] D. Simple White / On-Off lights
- RED
  - Add tests: govee-python/tests/test_white_device.py
    - test on/off + brightness only
    - example payload: {"power":0,"brightness":0}
  - Command: uv --directory govee-python run -s test -- tests/test_white_device.py
  - Commit: test(devices): add failing tests for SimpleWhiteDevice (RED)
- GREEN
  - Add govee-python/src/govee/domain/devices/implementations/white.py
    - Minimal DeviceBase subclass: apply_payload parse_state, encode power/bright frames
  - Command: uv --directory govee-python run -s test -- tests/test_white_device.py
  - Commit: feat(devices): add minimal SimpleWhiteDevice (GREEN)
- REFACTOR
  - Factor shared code with WhiteTempDevice where possible.
  - Commit: refactor(devices): unify white & white-temp helpers (REFACTOR)

- [x] E. Night light / special modes
- RED
  - Add tests for night mode (color + night flag) if persisted fixtures indicate such fields.
  - Example payloads from persisted fixtures: check deviceExt or deviceData for 'night' keys and add as sample payloads.
  - Commit: test(devices): add failing tests for NightLightDevice (RED)
- GREEN
  - Add minimal implementation that supports night-mode payloads and encoding (may be subclass of RGBLight or WhiteLight depending on features).
  - Commit: feat(devices): add NightLightDevice (GREEN)
- REFACTOR
  - Document special modes in docs/devices.md
  - Commit: docs(devices): document night-mode behavior (REFACTOR)

- [x] F. Sensor family (battery, temperature, humidity) — already added but expand
- RED
  - Add tests for multi-probe temperature payloads and calibration:
    - govee-python/tests/test_sensor_multi_probe.py
    - Example payload: {"tempc":22.1,".cal":2,"tempc1":22.1,"tempc2":21.8,"battery":92,"hum":55}
  - Command: uv --directory govee-python run -s test -- tests/test_sensor_multi_probe.py
  - Commit: test(devices): add failing tests for SensorDevice probes/calibration (RED)
- GREEN
  - Extend SensorDevice to parse temperature calibration and temp_probes into DeviceState (temperature_calibration, temp_probes map)
  - Commit: feat(devices): SensorDevice parse calibration & probes (GREEN)
- REFACTOR
  - Add docs examples and factory mapping for typical sensor model IDs.
  - Commit: docs(devices): sensor examples (REFACTOR)

- [x] G. Device factory & model mapping (central)
- RED
  - Add failing tests: govee-python/tests/test_device_factory_models.py
    - Provide a list of model strings from persisted/govee.devices.json and assert make_device_from_advert returns expected implementation classes (by model name heuristics).
    - Use realistic advert payloads (id, model, name, version).
  - Command: uv --directory govee-python run -s test -- tests/test_device_factory_models.py
  - Commit: test(devices): add failing factory mapping tests (RED)
- GREEN
  - Implement mappings in govee-python/src/govee/domain/devices/factory.py:
    - Follow the logic in the Typescript library.
  - Commit: feat(devices): extend factory mappings for common models (GREEN)

- [ ] H. Encoding parity and IoT adapter integration
- RED
  - Add integration tests that exercise device.encode_command → adapter.publish → IoTClient delivery for representative frames and retained/qos semantics. (We already added one; expand with realistic payloads).
  - Tests: govee-python/tests/test_iot_integration_device_encoding.py (expand)
  - Use persisted/mqtt_fixtures/replay_1.jsonl as a realistic path.
  - Command: uv --directory govee-python run -s test -- tests/test_iot_integration_device_encoding.py
  - Commit: test(iot): add failing integration tests for device->adapter pipeline (RED)
- GREEN
  - Ensure all device .encode_command produce frames that the adapter will publish and IoTClient will receive in expected topic/payload forms.
  - Validate retained messages and ack frames where relevant.
  - Commit: feat(iot): ensure device frames publish and adapter receives (GREEN)
- REFACTOR
  - Add and document canonical topic formats and payload shapes for each device type in docs/devices.md
  - Commit: docs(iot): document device-to-iot publish formats (REFACTOR)

- [ ] I. Tests: realistic vectors
- For every test use realistic vectors from persisted fixtures:
  - Use persisted/govee.devices.json deviceExt.deviceSettings.model and deviceExt.deviceSettings fields, persisted/mqtt_fixtures for mqtt flows, and persisted BLE/iot raw logs if tests need real encoded payloads.
- Example realistic payloads:
  - RGB: {"power":1,"brightness":85,"color":{"r":12,"g":34,"b":56}}
  - RGBIC segments: {"power":1,"brightness":75,"segments":[{"index":0,"length":10,"color":{"r":10,"g":20,"b":30}},{"index":1,"length":20,"color":{"r":255,"g":128,"b":0}}]}
  - WhiteTemp: {"power":1,"brightness":60,"color_temp":3500}
  - Sensor with calibration: {"tempc":21.5,".cal":2,"tempc1":21.5,"tempc2":21.2,"battery":85,"hum":55}

- [ ] J. Documentation and examples
- Update govee-python/docs/devices.md with:
  - Example payloads for each family (use the vectors above)
  - encode_command examples and expected MQTT topics/payloads
  - How to add new device implementations and map them in the factory.
- Commit: docs(devices): add examples for each device family (REFACTOR)

- [ ] K. CI & final checks
- Make sure every GREEN task is followed by:
  - uv --directory govee-python run -s format_check
  - uv --directory govee-python run -s test
  - uv --directory govee-python run -s all_checks (if present)
- Commit message patterns:
  - test(scope): add failing tests ... (RED)
  - feat(scope): add minimal ... implementation (GREEN)
  - refactor(scope): extract helpers / docs (REFACTOR)
  - chore(format): apply formatting fixes etc.

Estimated ordering and effort
- Highest priority: RGB family, factory mapping, device->IoT integration (these unlock many higher-level tests).
- Medium priority: Night-light and special modes, expand RGBIC parity.
- Low priority: Data-driven factory mapping asset, full model-version fidelity.

---
# Detailed parity plan for A/B/C (actionable RED→GREEN→REFACTOR steps)

Note: mark each family complete in this document ONLY after the final GREEN step
achieves 100% feature parity with the TypeScript counterpart and all tests
(including golden-frame comparisons) pass.

A. RGB (non-addressable) light family

Goals
- Parse all color input formats used by TypeScript (dict rgb, hex string, numeric)
- Populate DeviceState fields identically for same inputs
- Encode commands into frames exactly matching TypeScript (op names, keys, numeric types)
- Integration: device.encode_command -> MQTTAdapter.publish -> IoTClient delivery works

Steps
1) RED — add failing parity tests
   - Files to add: govee-python/tests/test_rgb_light_device_parity.py
   - Tests:
     - test_parse_hex_and_numeric_colors — payloads: {"color":"#0A1438"}, {"color":0xFF8000}
     - test_encode_command_golden — compare encode_command to TypeScript golden frame for a canonical sample
     - test_brightness_clamp_and_types — out-of-range clamping
   - Command: uv --directory govee-python run -s test -- tests/test_rgb_light_device_parity.py
   - Commit: test(devices): add RGB parity tests (RED)

2) GREEN — implement/adjust RGBDevice
   - Files: govee-python/src/govee/domain/devices/implementations/rgb.py
   - Implement:
     - Ensure parse_state uses parse_color and parse_color_rgb to cover formats
     - Ensure encode_command outputs int values and op names identical to TS
     - Add golden fixture file (tests/fixtures/rgb_golden.json) from TS (see extraction step below)
   - Commands:
     - uv --directory govee-python run -s test -- tests/test_rgb_light_device_parity.py
     - uv --directory govee-python run -s format_check
   - Commit: feat(devices): make RGBDevice parity with TypeScript (GREEN)

3) REFACTOR — extract helpers & docs
   - Move helpers to encoding.py (already present); ensure documentation in docs/devices.md
   - Add a golden-frame test harness comparing Python-encoded frames to TS golden JSON
   - Commit: refactor(devices): docs and golden tests for RGB (REFACTOR)


B. RGBIC (addressable) — confirm parity & expand

Goals
- Full parity for segments, pixel-array payloads, per-segment encoding, and effect commands.
- Exact op names and payload shapes must match TypeScript for representative models.

Steps
1) RED — parity and golden tests
   - Files: govee-python/tests/test_rgbic_parity.py (use realistic persisted vectors)
   - Tests:
     - test_segments_parse_and_state
     - test_pixel_array_parse_and_encode
     - test_effects_golden_match (compare to TS golden frames)
   - Command: uv --directory govee-python run -s test -- tests/test_rgbic_parity.py
   - Commit: test(devices): add RGBIC parity tests (RED)

2) GREEN — implement RGBICDevice behavior
   - Files: govee-python/src/govee/domain/devices/implementations/rgbic.py
   - Implement:
     - Normalize segment/pixel inputs into dev.segments/dev.pixels
     - encode_command produces seg/pixels/effect frames matching TS exact shapes
   - Commands: run tests and format_check
   - Commit: feat(devices): implement RGBIC parity for segments/pixels/effects (GREEN)

3) REFACTOR — helpers & docs
   - Extract any repeated logic into encoding helpers and document op contracts
   - Add golden fixtures for multiple representative RGBIC models
   - Commit: refactor(devices): rgbic helpers & docs (REFACTOR)


C. White-temperature (CT) family

Goals
- Full parity for parsing, set_state semantics, range handling, and encode frames (ct op)

Steps
1) RED — parity tests
   - Files: govee-python/tests/test_whitetemp_parity.py
   - Tests:
     - test_ct_parse_and_state
     - test_set_state_range_and_command (mirror test_color_temp_state.py expectations)
     - test_ct_golden_frame (compare to TS golden)
   - Command: uv --directory govee-python run -s test -- tests/test_whitetemp_parity.py
   - Commit: test(devices): add CT parity tests (RED)

2) GREEN — ensure WhiteTempDevice matches TS
   - Files: govee-python/src/govee/domain/devices/implementations/whitetemp.py
   - Implement:
     - parse_state covers nested CT inputs
     - encode_command uses 'ct' op with correct numeric types and any extra fields TS expects
     - set_state(range) behavior matches TS
   - Commands: tests + format_check
   - Commit: feat(devices): align WhiteTempDevice with TypeScript (GREEN)

3) REFACTOR — docs + golden tests
   - Document CT behaviors and add golden fixtures
   - Commit: refactor(devices): CT docs & golden tests (REFACTOR)


Common tasks for all families
- Extract golden frames from TypeScript dist for representative models where possible:
  - Search dist for implementations under dist/domain/devices/impl/lights/* and extract example encoded frames or test fixtures.
  - Place golden fixture JSON under govee-python/tests/fixtures/golden/<family>/<model>.json
- Use persisted/govee.devices.json and persisted/mqtt_fixtures for realistic vectors.
- Use uv to run tests and format_check. Commit after every GREEN step with conventional commit messages.

Acceptance: mark family complete in DEVICE_STATE_TASKS.md only when
  - All tests (unit + golden + integration) pass
  - Format/lint checks pass
  - Device factory maps persisted model strings for that family to the correct implementation

---


Completed work:
- H: Encoding parity and IoT adapter integration: pack_raw_frame was extended for H6 truncation; encoding helpers live in govee-python/src/govee/domain/devices/encoding.py. MQTTAdapter/FakeMQTTBackend and IoTClient replay integration tested via govee-python/tests/test_golden_iot_integration.py and related golden fixtures.
- I: Realistic vectors: tests use persisted/govee.devices.json and persisted/mqtt_fixtures to exercise realistic device payloads in tests under govee-python/tests (test_realistic_vectors.py, test_encoding_parity.py).

Remaining:
- J: Documentation and examples must reach 100% feature parity with the TypeScript implementation before being marked complete. Current docs exist at govee-python/docs/devices.md and provide examples; further expansion and golden-parity examples may be required.
