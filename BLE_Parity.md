Below is a precise parity checklist (what the TypeScript decoder supports that the Python port must match), followed by a concrete mapping of those behaviors to unit tests (existing tests that already cover them and explicit missing tests to add). For each missing test I give:

- a suggested test name and file,
- exact test vectors (hex/bytes input),
- the expected result,
- and a short rationale.

Use these vectors directly in tests so parity is explicit and deterministic.

Summary / scope
- Goal: make the Python BLE decoder behavior feature-compatible with the original TypeScript decoder for decoding, post-processing, condition handling, spec-loading and IoT delegation. This checklist is exhaustive for the features referenced by the ported code and tests in this repository.

Parity checklist (behaviors & edge-cases)
1) Data source resolution & formats
   - Accept manufacturerData/serviceData provided as:
     - bytes (should be converted to hex string internally),
     - hex string (lower or upper case),
     - plain string that may contain a model token delimiter (e.g., "MODEL|...").
   - If decode() receives bytes -> convert to hex string using bytes.hex().
   - When deciding model in DecoderService, accept manufacturer_data as:
     - bytes (decode to utf-8 where possible),
     - ascii/UTF-8 string,
     - hex string which may decode to bytes -> attempt bytes.fromhex() then decode to utf-8 (best-effort).
   - Handle empty or missing advertisement fields gracefully.

2) Model detection heuristics
   - Extract model token:
     - From manufacturer_data when it contains "MODEL|...": split on '|' and take token before the pipe.
     - From device name using regex: find token matching (GVH|H)[0-9A-Za-z]+ (prefer GVH when present).
   - If simple GoveeBleDecoder returns no model or model-less result, try spec-driven path.

3) Spec-loading semantics
   - _load_spec_from_dirs searches directories (in order) for {model}.json and returns parsed JSON if present.
   - Top-level spec 'condition' is evaluated against device; if false -> spec doesn't apply (skip).
   - spec may include 'iot_manager': true -> delegate decoding to IoTManager.decode(spec, device_info).
   - When not using iot_manager, use local DecoderLib.decode_properties to decode properties into the shape returned to callers.

4) Device & property condition evaluation
   - Device-level condition: spec-level 'condition' should be tested using device_condition.device_matches (in service path).
   - Property-level condition: prop['condition'] checked before decoding property (property_condition.property_matches). If false -> skip property.
   - Any errors evaluating a condition should cause the property (or spec) to be skipped gracefully.

5) Hex parsing and endianness
   - value_from_hex_string(hex_data, offset, length, reverse): take substring hex_data[offset:offset+length]; if reverse True, reverse by bytes (not by nibble/character).
     - Reverse logic: split the substring into 2-character bytes, reverse the resulting array, concatenate.
   - Should accept hex_data that is a hex string; when source is bytes, decode to hex before calling hex parsing functions.

6) Signed/negative value handling
   - can_be_negative flag behavior:
     - For length <= 2: treat parsed > 128 as signed 8-bit negative value => value - 256.
     - For length == 4: treat parsed > 32767 as signed 16-bit negative value => value - 65536.
     - (Matches TS logic in the ported code; these thresholds must be tested explicitly.)

7) BCF (byte-coded fractional) decoding
   - bcf_value_from_hex_string transforms an integer v into ((v >> 8) * 100 + (v & 0xff)) / 100.0
   - Must match TS behavior exactly (integer shift and masking, then decimal scale).

8) Post-processing operations
   - Support arithmetic and bitwise ops in post_proc: &, |, %, /, *, +, - (operators mapped from constants in port).
   - Support comparison operators that gate further processing: =, >, >=, <, <=.
     - If a comparison fails, the property decode result becomes undefined (None).
   - Support chained operations (e.g., ["/", 1000, ">", 0, "/", 10]).
   - Support the Calibration operand ".cal" that resolves to a calibration value passed into post_processing.

9) Decoder selection & unsupported decoders
   - decode() should select value_from_hex_string when ValueFromHex in decoder_args[0].
   - For names containing 'bf' (bf or bf-based name), select bcf decoder.
   - Unsupported decoder names -> decode returns None.

10) Output mapping & property naming
   - decode_properties maps property names:
     - 'tempc' -> decoded['temperature']['current'] (also supports variants like '_tempc')
     - 'tempcN' where N digit -> tempProbes[N]
     - 'hum' / 'humidity' -> 'humidity': {'current': val}
     - 'batt' / 'battery' -> 'battery': value
     - '.cal' -> set calibration value used by subsequent post-processing if referenced
   - If a property decode returns None (or post_proc gating returns None), do not include that property.

11) IoT Manager delegation
   - If spec.get('iot_manager') is truthy, call iot_manager.decode(spec, device_info) and include its dict return as properties.
   - Return includes model and properties from IoTManager result when available.

12) Robustness & error handling
   - Any exception in parsing, condition evaluation, or decode should result in a None or skipping the property rather than raising out to the caller (tests should expect graceful handling).
   - Non-hex strings/invalid hex lengths should be handled gracefully where appropriate (e.g., try/except around bytes.fromhex).

Mapping to tests — existing coverage
(Refer to repo tests under govee-python/tests)

- value_from_hex_string positive & negative tests:
  - govee-python/tests/test_decoder_lib.py::test_value_from_hex_string_h5074
    - Tests reverse=True, negative handling for 4-byte values, with realistic H5074 hex strings.
  - govee-python/tests/test_decoder_lib.py::test_value_from_hex_string_h5106
    - Tests large offsets and lengths (8 bytes), reverse=False.

- bcf & post-processing existing tests:
  - govee-python/tests/test_decoder_lib.py::test_bcf_value_from_hex_string_and_post_processing
    - Asserts bcf decomposition for temp/hum/batt at expected offsets.
  - govee-python/tests/test_decoder_more.py::test_bcf_value_from_hex_string
    - Tests a constructed BCF value.

- post-processing arithmetic and chain examples:
  - govee-python/tests/test_decoder_lib.py::test_decoder_decode_tempc_post_proc
    - Uses post_proc ["/", 1000, ">", 0, "/", 10] and asserts approx 26.85.

- byte/native handling & reverse vs signedness:
  - govee-python/tests/test_decoder_more.py::test_value_from_hex_string_negative_and_reverse
    - Tests 2-byte signed negative and reverse byte order behavior.

- decode_properties mapping:
  - govee-python/tests/test_decoder_lib.py::test_decode_properties_maps_values
    - Asserts property mapping to temperature.current and battery exists.

- condition evaluation (property-level):
  - govee-python/tests/test_decoder_conditions.py::test_property_condition_blocks_decoding
    - Verifies a property-level condition that fails results in property omitted.

- IoTManager delegation:
  - govee-python/tests/test_decoder_iot_manager.py::test_iot_manager_fallback
    - Verifies iot_manager path is called and its return is used.

- DecoderService model detection & spec application:
  - govee-python/tests/test_decoder_fixtures.py and test_decoder_more_samples.py (various)
    - Provide coverage for spec-driven decoding with basic property definitions.

Missing / recommended tests (add these to fill parity gaps)
Below are focused tests to ensure complete parity for edge-cases and behaviors. Add these tests to govee-python/tests/ with the suggested names.

A. Endianness & per-byte reversal edge-cases
1) test_reverse_hex_data_odd_length
   - Purpose: ensure reverse logic handles odd-length substring deterministically (no crash).
   - Input hex_data: "abc" with length=3 — reverse should operate on bytes pairs of hex_data[:3] -> ['ab', 'c'] reversed -> ['c','ab'] joined -> "cab"
   - Expected behavior: function returns "cab" (explicitly assert it behaves this way or document expected behavior).
   - Rationale: reverse_hex_data uses chunking by 2; we should ensure this edge-case is understood and matches TS behavior.

2) test_value_from_hex_string_reverse_4byte
   - Name: test_value_from_hex_string_reverse_4byte
   - Input hexstr: "aabbccdd"
   - Call: value_from_hex_string(hexstr, offset=0, length=4, reverse=True)
   - Expected: reverse per bytes => take 'aabb' (length=4) -> bytes ['aa', 'bb'] -> reversed -> 'bbaa' -> int('bbaa', 16) = 0xbbaa = 48042
   - Rationale: explicit 4-byte reverse to match per-byte reverse semantics.

B. Signed thresholds & boundary tests
3) test_signed_thresholds_length2
   - Cases:
     - hex '0080' (length=2, value 0x00 -> 0x00?? Wait be careful: offset/length semantics in this code treat length as count of hex characters; existing tests pass length=2,4,6 sometimes; but earlier tests use length=2 meaning substring of 2 hex chars -> single byte. To be consistent, test code should use same convention as code: length is number of hex chars.)
   - Concrete tests (consistent with existing code use where length is number of hex characters):
     - For 1-byte signed boundary (length=2 hex chars):
       - '0080' example is ambiguous because offset/substring uses hex_data[offset:offset+length], so choose simple:
         - hexstr = '80' (simple 1 byte) -> call value_from_hex_string(hexstr, 0, 2, False, True)
           - parsed_value = 0x80 = 128 -> rule uses parsed_value > 128 to treat negative, so 128 remains 128, not negative.
           - expected output: 128
         - hexstr = '81' -> value=129 -> >128 so return 129 - 256 = -127
           - expected output: -127
   - Add test assertions accordingly.

4) test_signed_thresholds_length4 (16-bit)
   - hexstr:
     - value 0x7FFF => 32767 -> expect 32767 (not negative)
     - value 0x8000 => 32768 -> >32767 => expect 32768 - 65536 = -32768
   - Use hex_data = '8000' with length=4 (4 hex chars => 2 bytes), call with can_be_negative=True, expect -32768.

C. BCF and combined ops
5) test_bcf_bytes_various
   - Inputs:
     - hexstr '07D0' (2 bytes) -> v = int('07D0', 16) = 0x07D0 = 2000? Wait compute: 0x07D0 = 2000 decimal. BCF formula: ((2000 >> 8) * 100 + (2000 & 0xff)) / 100.0 = ((7)*100 + 208) / 100 = (700 + 208)/100 = 908/100 = 9.08
   - Expected: 9.08
   - Rationale: confirms BCF math for typical cases; matches test_bcf_value_from_hex_string but add additional vector(s) such as 0x0102 -> ((1)*100 + 2) / 100 = 1.02.

D. Post-processing comparisons & gating behavior
6) test_post_proc_comparison_gates
   - Use value 1000 and post_proc ["<", 100, "/", 10] -> since 1000 < 100 is False -> post_processing returns None
   - Verify post_processing returns None (decoder should skip property).

7) test_post_proc_calibration_operand
   - Setup:
     - Create properties with one property named '.cal' that decodes to 500 (using value_from_hex_string or decode wrapper).
     - Create another property with decoder that returns 12345 and post_proc using Calibration operand: ["-", ".cal"]
     - Expected: final = 12345 - 500 = 11845
   - Rationale: verify ".cal" is resolved properly in post_processing pipeline when decode_properties sets calibration first.

E. Decoder selection & unsupported names
8) test_unsupported_decoder_returns_none
   - Call Decoder.decode with decoder_args ['unsupported_decoder', 'manufacturerdata', 0, 2, False, False]
   - Expect None
   - Rationale: verify unsupported decoder names handled gracefully.

F. Spec-loading & top-level condition behavior
9) test_spec_top_level_condition_blocks_spec
   - Create spec file or monkeypatch _load_spec_from_dirs to return a spec with top-level 'condition' that will evaluate False via device_condition.device_matches
   - Provide peripheral with manufacturer_data that otherwise would match model
   - Expected: decode_device returns None or properties empty i.e. spec not applied
   - (Note: govee-python/tests/test_decoder_conditions.py already covers a property-level condition; add top-level spec-level condition test.)

G. Model extraction variants (manufacturer_data vs name)
10) test_model_extraction_from_manufacturer_data_and_name
   - 1) manufacturer_data bytes b'H123|' -> DecoderService should extract model 'H123' and apply spec.
   - 2) name string 'GVH5106_2811' -> should extract model 'GVH5106' via regex (prefer GVH)
   - Expected: get_device_spec called with correct model token (monkeypatch _load_spec_from_dirs to record the model param).
   - Rationale: ensure both manifest data parsing and name regex behave identically to TS.

H. IoTManager decoding behavior (more coverage)
11) test_iot_manager_called_with_expected_device_info
   - When spec includes iot_manager True, ensure IoTManager.decode is called with spec and a device_info where:
     - 'manufacturerData' is the raw advertisement manufacturer_data (bytes or hex string depending on input),
     - 'name' is the localName,
     - 'macAddress' is peripheral['address'].
   - Use a FakeManager to assert argument contents.

I. Robustness & non-hex strings
12) test_decode_hex_string_invalid_characters
   - Input manufacturerData = "zzzz" (non hex characters).
   - Ensure Decoder.decode handles it without throwing an unexpected exception (should either return None or skip gracefully).
   - Rationale: TS decoder must be resilient to malformed advertisement data.

J. Bytes handling in Decoder.decode
13) test_decode_accepts_bytes_manufacturer_data
   - peripheral: manufacturerData = bytes.fromhex('88ec000418ee6400')
   - Call Decoder.decode with decoder_args referencing 'manufacturerdata'
   - Expected: same output as when hex string '88ec000418ee6400' passed.

Mapping specific new test vectors (concrete examples you can paste into tests)

- Signed 1-byte boundary:
  - hexstr = '80' -> value_from_hex_string('80', 0, 2, False, True) => 128
  - hexstr = '81' -> ... => -127

- Signed 2-byte (16-bit) boundary (length=4 hex chars):
  - hexstr = '7fff' -> 32767 => value_from_hex_string('7fff', 0, 4, False, True) => 32767
  - hexstr = '8000' -> -32768 => value_from_hex_string('8000', 0, 4, False, True) => -32768

- BCF:
  - hexstr = '07d0' -> bcf_value_from_hex_string('07d0', 0, 4, False) => 9.08
  - hexstr = '0102' -> => 1.02

- Post-processing comparison gating:
  - post_proc = ['<', 100, '/', 10]
  - value = 1000 -> post_processing(value, post_proc) should return None

- Calibration usage:
  - device properties:
    - '.cal' decodes to 500 (decoder_args produce 500)
    - 'tempc' decoder produces 12345 then post_proc ['-', '.cal'] -> final 11845
  - Ensure decode_properties returns temperature.current == 11845

Suggested test file placements and naming
- govee-python/tests/test_decoder_edgecases.py
  - contains: tests A-F (reverse odd length, reverse 4byte, signed thresholds, bcf extra vectors, post_proc gating, unsupported decoder)
- govee-python/tests/test_decoder_calibration.py
  - contains calibration test
- govee-python/tests/test_decoder_spec_and_iot.py
  - contains top-level spec condition, IoTManager argument shape, model extraction tests
- govee-python/tests/test_decoder_bytes_handling.py
  - contains bytes vs hex string tests, invalid-hex behavior test

Notes about implementing tests in this repo
- Use the existing pattern: pure deterministic inputs, avoid network or system dependencies.
- Use monkeypatching for _load_spec_from_dirs and IoTManager to control behavior without creating real files.
- Reuse existing helper functions in govee-python tests (e.g., create a DecoderService instance and monkeypatch where needed).
- Conform to the repo TDD workflow: run uv run -s test and uv run -s all_checks when implementing tests. Keep coverage >= the configured threshold.

Potential parity differences to watch / clarify
- TS may treat negative thresholds differently for other lengths; our port currently uses >128 for length <=2 and >32767 for length == 4. Confirm with TS original if there were other length cases (e.g., 3-byte signedness) — add tests if TS supports them.
- reverse behavior for odd-length hex substrings: ensure the TS code behaves same way; if TS would pad or error, ensure tests reflect chosen behavior.
- Calibration operand name is ".cal" in code; confirm TS uses same token and semantics (post_proc operand resolves to last-set calibration value).
- Spec top-level condition evaluation depends on device_condition.device_matches; ensure its semantics match TS. Add tests for device fields used (manufacturerData, name, macAddress).
- Model regex preference for GVH vs H: tests recommended to assert preference when both appear.

Concrete next actions (if you want me to implement these tests)
- I can add the test files listed above and include the concrete vectors and assertions.
- Per the project TDD rules, I will:
  - add tests (RED),
  - run tests, implement whatever decoder changes needed (GREEN),
  - fix style & run all_checks then commit with conventional commit messages for each step.

If you want, I will implement the missing tests now (one PR / branch), or I can generate the exact Python test code for each suggested test so you can paste them in. Which do you prefer?
Below is a precise parity checklist (what the TypeScript decoder supports that the Python port must match), followed by a concrete mapping of those behaviors to unit tests (existing tests that already cover them and explicit missing tests to add). For each missing test I give:

- a suggested test name and file,
- exact test vectors (hex/bytes input),
- the expected result,
- and a short rationale.

Use these vectors directly in tests so parity is explicit and deterministic.

Summary / scope
- Goal: make the Python BLE decoder behavior feature-compatible with the original TypeScript decoder for decoding, post-processing, condition handling, spec-loading and IoT delegation. This checklist is exhaustive for the features referenced by the ported code and tests in this repository.

Parity checklist (behaviors & edge-cases)
1) Data source resolution & formats
   - Accept manufacturerData/serviceData provided as:
     - bytes (should be converted to hex string internally),
     - hex string (lower or upper case),
     - plain string that may contain a model token delimiter (e.g., "MODEL|...").
   - If decode() receives bytes -> convert to hex string using bytes.hex().
   - When deciding model in DecoderService, accept manufacturer_data as:
     - bytes (decode to utf-8 where possible),
     - ascii/UTF-8 string,
     - hex string which may decode to bytes -> attempt bytes.fromhex() then decode to utf-8 (best-effort).
   - Handle empty or missing advertisement fields gracefully.

2) Model detection heuristics
   - Extract model token:
     - From manufacturer_data when it contains "MODEL|...": split on '|' and take token before the pipe.
     - From device name using regex: find token matching (GVH|H)[0-9A-Za-z]+ (prefer GVH when present).
   - If simple GoveeBleDecoder returns no model or model-less result, try spec-driven path.

3) Spec-loading semantics
   - _load_spec_from_dirs searches directories (in order) for {model}.json and returns parsed JSON if present.
   - Top-level spec 'condition' is evaluated against device; if false -> spec doesn't apply (skip).
   - spec may include 'iot_manager': true -> delegate decoding to IoTManager.decode(spec, device_info).
   - When not using iot_manager, use local DecoderLib.decode_properties to decode properties into the shape returned to callers.

4) Device & property condition evaluation
   - Device-level condition: spec-level 'condition' should be tested using device_condition.device_matches (in service path).
   - Property-level condition: prop['condition'] checked before decoding property (property_condition.property_matches). If false -> skip property.
   - Any errors evaluating a condition should cause the property (or spec) to be skipped gracefully.

5) Hex parsing and endianness
   - value_from_hex_string(hex_data, offset, length, reverse): take substring hex_data[offset:offset+length]; if reverse True, reverse by bytes (not by nibble/character).
     - Reverse logic: split the substring into 2-character bytes, reverse the resulting array, concatenate.
   - Should accept hex_data that is a hex string; when source is bytes, decode to hex before calling hex parsing functions.

6) Signed/negative value handling
   - can_be_negative flag behavior:
     - For length <= 2: treat parsed > 128 as signed 8-bit negative value => value - 256.
     - For length == 4: treat parsed > 32767 as signed 16-bit negative value => value - 65536.
     - (Matches TS logic in the ported code; these thresholds must be tested explicitly.)

7) BCF (byte-coded fractional) decoding
   - bcf_value_from_hex_string transforms an integer v into ((v >> 8) * 100 + (v & 0xff)) / 100.0
   - Must match TS behavior exactly (integer shift and masking, then decimal scale).

8) Post-processing operations
   - Support arithmetic and bitwise ops in post_proc: &, |, %, /, *, +, - (operators mapped from constants in port).
   - Support comparison operators that gate further processing: =, >, >=, <, <=.
     - If a comparison fails, the property decode result becomes undefined (None).
   - Support chained operations (e.g., ["/", 1000, ">", 0, "/", 10]).
   - Support the Calibration operand ".cal" that resolves to a calibration value passed into post_processing.

9) Decoder selection & unsupported decoders
   - decode() should select value_from_hex_string when ValueFromHex in decoder_args[0].
   - For names containing 'bf' (bf or bf-based name), select bcf decoder.
   - Unsupported decoder names -> decode returns None.

10) Output mapping & property naming
   - decode_properties maps property names:
     - 'tempc' -> decoded['temperature']['current'] (also supports variants like '_tempc')
     - 'tempcN' where N digit -> tempProbes[N]
     - 'hum' / 'humidity' -> 'humidity': {'current': val}
     - 'batt' / 'battery' -> 'battery': value
     - '.cal' -> set calibration value used by subsequent post-processing if referenced
   - If a property decode returns None (or post_proc gating returns None), do not include that property.

11) IoT Manager delegation
   - If spec.get('iot_manager') is truthy, call iot_manager.decode(spec, device_info) and include its dict return as properties.
   - Return includes model and properties from IoTManager result when available.

12) Robustness & error handling
   - Any exception in parsing, condition evaluation, or decode should result in a None or skipping the property rather than raising out to the caller (tests should expect graceful handling).
   - Non-hex strings/invalid hex lengths should be handled gracefully where appropriate (e.g., try/except around bytes.fromhex).

Mapping to tests — existing coverage
(Refer to repo tests under govee-python/tests)

- value_from_hex_string positive & negative tests:
  - govee-python/tests/test_decoder_lib.py::test_value_from_hex_string_h5074
    - Tests reverse=True, negative handling for 4-byte values, with realistic H5074 hex strings.
  - govee-python/tests/test_decoder_lib.py::test_value_from_hex_string_h5106
    - Tests large offsets and lengths (8 bytes), reverse=False.

- bcf & post-processing existing tests:
  - govee-python/tests/test_decoder_lib.py::test_bcf_value_from_hex_string_and_post_processing
    - Asserts bcf decomposition for temp/hum/batt at expected offsets.
  - govee-python/tests/test_decoder_more.py::test_bcf_value_from_hex_string
    - Tests a constructed BCF value.

- post-processing arithmetic and chain examples:
  - govee-python/tests/test_decoder_lib.py::test_decoder_decode_tempc_post_proc
    - Uses post_proc ["/", 1000, ">", 0, "/", 10] and asserts approx 26.85.

- byte/native handling & reverse vs signedness:
  - govee-python/tests/test_decoder_more.py::test_value_from_hex_string_negative_and_reverse
    - Tests 2-byte signed negative and reverse byte order behavior.

- decode_properties mapping:
  - govee-python/tests/test_decoder_lib.py::test_decode_properties_maps_values
    - Asserts property mapping to temperature.current and battery exists.

- condition evaluation (property-level):
  - govee-python/tests/test_decoder_conditions.py::test_property_condition_blocks_decoding
    - Verifies a property-level condition that fails results in property omitted.

- IoTManager delegation:
  - govee-python/tests/test_decoder_iot_manager.py::test_iot_manager_fallback
    - Verifies iot_manager path is called and its return is used.

- DecoderService model detection & spec application:
  - govee-python/tests/test_decoder_fixtures.py and test_decoder_more_samples.py (various)
    - Provide coverage for spec-driven decoding with basic property definitions.

Missing / recommended tests (add these to fill parity gaps)
Below are focused tests to ensure complete parity for edge-cases and behaviors. Add these tests to govee-python/tests/ with the suggested names.

A. Endianness & per-byte reversal edge-cases
1) test_reverse_hex_data_odd_length
   - Purpose: ensure reverse logic handles odd-length substring deterministically (no crash).
   - Input hex_data: "abc" with length=3 — reverse should operate on bytes pairs of hex_data[:3] -> ['ab', 'c'] reversed -> ['c','ab'] joined -> "cab"
   - Expected behavior: function returns "cab" (explicitly assert it behaves this way or document expected behavior).
   - Rationale: reverse_hex_data uses chunking by 2; we should ensure this edge-case is understood and matches TS behavior.

2) test_value_from_hex_string_reverse_4byte
   - Name: test_value_from_hex_string_reverse_4byte
   - Input hexstr: "aabbccdd"
   - Call: value_from_hex_string(hexstr, offset=0, length=4, reverse=True)
   - Expected: reverse per bytes => take 'aabb' (length=4) -> bytes ['aa', 'bb'] -> reversed -> 'bbaa' -> int('bbaa', 16) = 0xbbaa = 48042
   - Rationale: explicit 4-byte reverse to match per-byte reverse semantics.

B. Signed thresholds & boundary tests
3) test_signed_thresholds_length2
   - Cases:
     - hex '0080' (length=2, value 0x00 -> 0x00?? Wait be careful: offset/length semantics in this code treat length as count of hex characters; existing tests pass length=2,4,6 sometimes; but earlier tests use length=2 meaning substring of 2 hex chars -> single byte. To be consistent, test code should use same convention as code: length is number of hex chars.)
   - Concrete tests (consistent with existing code use where length is number of hex characters):
     - For 1-byte signed boundary (length=2 hex chars):
       - '0080' example is ambiguous because offset/substring uses hex_data[offset:offset+length], so choose simple:
         - hexstr = '80' (simple 1 byte) -> call value_from_hex_string(hexstr, 0, 2, False, True)
           - parsed_value = 0x80 = 128 -> rule uses parsed_value > 128 to treat negative, so 128 remains 128, not negative.
           - expected output: 128
         - hexstr = '81' -> value=129 -> >128 so return 129 - 256 = -127
           - expected output: -127
   - Add test assertions accordingly.

4) test_signed_thresholds_length4 (16-bit)
   - hexstr:
     - value 0x7FFF => 32767 -> expect 32767 (not negative)
     - value 0x8000 => 32768 -> >32767 => expect 32768 - 65536 = -32768
   - Use hex_data = '8000' with length=4 (4 hex chars => 2 bytes), call with can_be_negative=True, expect -32768.

C. BCF and combined ops
5) test_bcf_bytes_various
   - Inputs:
     - hexstr '07D0' (2 bytes) -> v = int('07D0', 16) = 0x07D0 = 2000? Wait compute: 0x07D0 = 2000 decimal. BCF formula: ((2000 >> 8) * 100 + (2000 & 0xff)) / 100.0 = ((7)*100 + 208) / 100 = (700 + 208)/100 = 908/100 = 9.08
   - Expected: 9.08
   - Rationale: confirms BCF math for typical cases; matches test_bcf_value_from_hex_string but add additional vector(s) such as 0x0102 -> ((1)*100 + 2) / 100 = 1.02.

D. Post-processing comparisons & gating behavior
6) test_post_proc_comparison_gates
   - Use value 1000 and post_proc ["<", 100, "/", 10] -> since 1000 < 100 is False -> post_processing returns None
   - Verify post_processing returns None (decoder should skip property).

7) test_post_proc_calibration_operand
   - Setup:
     - Create properties with one property named '.cal' that decodes to 500 (using value_from_hex_string or decode wrapper).
     - Create another property with decoder that returns 12345 and post_proc using Calibration operand: ["-", ".cal"]
     - Expected: final = 12345 - 500 = 11845
   - Rationale: verify ".cal" is resolved properly in post_processing pipeline when decode_properties sets calibration first.

E. Decoder selection & unsupported names
8) test_unsupported_decoder_returns_none
   - Call Decoder.decode with decoder_args ['unsupported_decoder', 'manufacturerdata', 0, 2, False, False]
   - Expect None
   - Rationale: verify unsupported decoder names handled gracefully.

F. Spec-loading & top-level condition behavior
9) test_spec_top_level_condition_blocks_spec
   - Create spec file or monkeypatch _load_spec_from_dirs to return a spec with top-level 'condition' that will evaluate False via device_condition.device_matches
   - Provide peripheral with manufacturer_data that otherwise would match model
   - Expected: decode_device returns None or properties empty i.e. spec not applied
   - (Note: govee-python/tests/test_decoder_conditions.py already covers a property-level condition; add top-level spec-level condition test.)

G. Model extraction variants (manufacturer_data vs name)
10) test_model_extraction_from_manufacturer_data_and_name
   - 1) manufacturer_data bytes b'H123|' -> DecoderService should extract model 'H123' and apply spec.
   - 2) name string 'GVH5106_2811' -> should extract model 'GVH5106' via regex (prefer GVH)
   - Expected: get_device_spec called with correct model token (monkeypatch _load_spec_from_dirs to record the model param).
   - Rationale: ensure both manifest data parsing and name regex behave identically to TS.

H. IoTManager decoding behavior (more coverage)
11) test_iot_manager_called_with_expected_device_info
   - When spec includes iot_manager True, ensure IoTManager.decode is called with spec and a device_info where:
     - 'manufacturerData' is the raw advertisement manufacturer_data (bytes or hex string depending on input),
     - 'name' is the localName,
     - 'macAddress' is peripheral['address'].
   - Use a FakeManager to assert argument contents.

I. Robustness & non-hex strings
12) test_decode_hex_string_invalid_characters
   - Input manufacturerData = "zzzz" (non hex characters).
   - Ensure Decoder.decode handles it without throwing an unexpected exception (should either return None or skip gracefully).
   - Rationale: TS decoder must be resilient to malformed advertisement data.

J. Bytes handling in Decoder.decode
13) test_decode_accepts_bytes_manufacturer_data
   - peripheral: manufacturerData = bytes.fromhex('88ec000418ee6400')
   - Call Decoder.decode with decoder_args referencing 'manufacturerdata'
   - Expected: same output as when hex string '88ec000418ee6400' passed.

Mapping specific new test vectors (concrete examples you can paste into tests)

- Signed 1-byte boundary:
  - hexstr = '80' -> value_from_hex_string('80', 0, 2, False, True) => 128
  - hexstr = '81' -> ... => -127

- Signed 2-byte (16-bit) boundary (length=4 hex chars):
  - hexstr = '7fff' -> 32767 => value_from_hex_string('7fff', 0, 4, False, True) => 32767
  - hexstr = '8000' -> -32768 => value_from_hex_string('8000', 0, 4, False, True) => -32768

- BCF:
  - hexstr = '07d0' -> bcf_value_from_hex_string('07d0', 0, 4, False) => 9.08
  - hexstr = '0102' -> => 1.02

- Post-processing comparison gating:
  - post_proc = ['<', 100, '/', 10]
  - value = 1000 -> post_processing(value, post_proc) should return None

- Calibration usage:
  - device properties:
    - '.cal' decodes to 500 (decoder_args produce 500)
    - 'tempc' decoder produces 12345 then post_proc ['-', '.cal'] -> final 11845
  - Ensure decode_properties returns temperature.current == 11845

Suggested test file placements and naming
- govee-python/tests/test_decoder_edgecases.py
  - contains: tests A-F (reverse odd length, reverse 4byte, signed thresholds, bcf extra vectors, post_proc gating, unsupported decoder)
- govee-python/tests/test_decoder_calibration.py
  - contains calibration test
- govee-python/tests/test_decoder_spec_and_iot.py
  - contains top-level spec condition, IoTManager argument shape, model extraction tests
- govee-python/tests/test_decoder_bytes_handling.py
  - contains bytes vs hex string tests, invalid-hex behavior test

Notes about implementing tests in this repo
- Use the existing pattern: pure deterministic inputs, avoid network or system dependencies.
- Use monkeypatching for _load_spec_from_dirs and IoTManager to control behavior without creating real files.
- Reuse existing helper functions in govee-python tests (e.g., create a DecoderService instance and monkeypatch where needed).
- Conform to the repo TDD workflow: run uv run -s test and uv run -s all_checks when implementing tests. Keep coverage >= the configured threshold.

Potential parity differences to watch / clarify
- TS may treat negative thresholds differently for other lengths; our port currently uses >128 for length <=2 and >32767 for length == 4. Confirm with TS original if there were other length cases (e.g., 3-byte signedness) — add tests if TS supports them.
- reverse behavior for odd-length hex substrings: ensure the TS code behaves same way; if TS would pad or error, ensure tests reflect chosen behavior.
- Calibration operand name is ".cal" in code; confirm TS uses same token and semantics (post_proc operand resolves to last-set calibration value).
- Spec top-level condition evaluation depends on device_condition.device_matches; ensure its semantics match TS. Add tests for device fields used (manufacturerData, name, macAddress).
- Model regex preference for GVH vs H: tests recommended to assert preference when both appear.
