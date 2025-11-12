Below is a detailed, executable Markdown checklist you can use to drive the remaining parity work end‑to‑end. Each item is a small TDD-style task (RED → GREEN → REFACTOR) with the exact tests, files to edit, commands to run, and the acceptance criteria. Follow each item in order, commit after each GREEN, and mark the checkbox only when the acceptance criteria are satisfied.

- Use the project venv: . govee-python/.venv/bin/activate
- Run tests locally for the Python package: cd govee-python && python -m pytest -q
- Use uv to run scripts: uv --directory govee-python run -s test
- Commit format: conventional commits (test|feat|fix|refactor|chore)

---

# Parity tasks checklist (Markdown)

## 1. Inflight ack-by-message-id (IoT client)
- [x] RED: add failing test that expects ack-by-id behavior
  - Test file: govee-python/tests/test_iot_client_inflight_by_id.py
  - Test vector / behavior:
    - Publish a qos=1 message that assigns message_id (new field).
    - Simulate an incoming ack message that references the message_id.
    - Expect inflight_count to drop and message.acked True.
  - Add test that fails initially.
  - Commit: test(iot-client): add failing test for inflight ack-by-id
- [x] GREEN: implement minimal code
  - Files to modify:
    - govee-python/src/govee/data/iot/iot_client.py
      - Add message_id generation to AsyncIotMessage.
      - Update publish/send_with_retry to set message.message_id.
      - Update _process_auto_ack() to accept {'ack_for_id': id} and acknowledge by id.
  - Commands:
    - . govee-python/.venv/bin/activate
    - python -m pytest govee-python/tests/test_iot_client_inflight_by_id.py -q
  - Acceptance criteria:
    - New test passes.
    - No regression in existing inflight tests.
  - Commit: feat(iot-client): add message_id ack-by-id and ack handling
- [x] REFACTOR: finalize, tidy, tests
  - Clean up names, docstrings, type hints.
  - Run full test suite: cd govee-python && python -m pytest -q
  - Commit: refactor(iot-client): tidy ack-by-id implementation

## 2. Robust reconnect & backoff driver (IoT client)
- [x] RED: add failing test for reconnect/backoff
  - Test file: govee-python/tests/test_iot_client_reconnect_backoff.py
  - Behavior:
    - Simulate intermittent connection failures (mock connection.connect to throw twice then succeed).
    - Expect IoTClient to attempt retries with exponential backoff and eventually become connected.
  - Commit: test(iot-client): add reconnect/backoff failing test
- [x] GREEN: implement minimal reconnect/backoff
  - Files:
    - govee-python/src/govee/data/iot/iot_client.py
      - Add a reconnect loop with configurable backoff/jitter, max attempts, and an async driver task that runs while not connected.
      - Ensure tasks are canceled on disconnect and don't leak.
  - Commands:
    - Activate venv and run the new test: python -m pytest govee-python/tests/test_iot_client_reconnect_backoff.py -q
  - Acceptance criteria:
    - The test passes deterministically.
    - No pending asyncio tasks after test exit (use pytest checks / explicit cleanup).
  - Commit: feat(iot-client): add reconnect/backoff driver
- [x] REFACTOR: refine policy and config
  - Add config knobs (initial_backoff, max_backoff, jitter).
  - Add unit test for jitter boundaries.
  - Run full test suite.
  - Commit: refactor(iot-client): parametrize backoff policy

## 3. PahoBackend production hardening (MQTT adapter)
- [ ] RED: add failing test that shows reconnect behavior is expected
  - Test file: govee-python/tests/test_paho_backend_reconnect.py
  - Behavior:
    - Use a mock or fake paho client that simulates connect failure then success; assert PahoBackend.connect retries and eventually returns or sets connected state.
  - Commit: test(mqtt): add paho backend reconnect failing test
- [x] GREEN: implement minimal code to pass
  - Files:
    - govee-python/src/govee/data/common/paho_adapter.py
      - Implement connection retry with exponential backoff + jitter and TLS CA/cert integration.
      - Implement safe stop/cleanup (stop background thread gracefully).
      - Add ability to configure TLS CA trust bundles from OpenAPI credential payload.
  - Commands:
    - python -m pytest govee-python/tests/test_paho_backend_reconnect.py -q
  - Acceptance criteria:
    - Test passes (mocked connect path).
    - No leaked threads after test completion.
  - Commit: feat(mqtt): implement paho reconnect with backoff and TLS options
- [ ] REFACTOR: add logging and lifecycle control
  - Add more tests to ensure unsubscribe on disconnect, reconnect subscription resumption.
  - Run full test suite.
  - Commit: refactor(mqtt): improve lifecycle & logging

## 4. Integration test against a local MQTT broker (optional but recommended)
- [ ] RED: add failing e2e test that publishes/subscribes to a real broker
  - Test file: govee-python/tests/test_iot_paho_e2e.py
  - Requires a local broker (mosquitto) in CI or a test fixture.
  - Behavior:
    - Start local broker (or use test fixture), create PahoBackend.connect(), attach IoTClient, publish, and assert handler receives messages.
  - Commit: test(mqtt): add e2e Paho backend failing test
- [ ] GREEN: run with a local broker or docker-mosquitto
  - Implementation: run mosquitto on CI or as a local fixture and ensure test passes.
  - Acceptance: e2e test passes in CI.
  - Commit: feat(mqtt): add mosquitto-based e2e test and CI job

## 5. Expand OpenAPI client parity (models & endpoints)
- [ ] RED: add failing tests for each missing endpoint/use-case
  - Tests:
    - govee-python/tests/test_openapi_device_endpoints.py (device list, control, etc.)
  - Commit: test(openapi): add failing tests for endpoints
- [ ] GREEN: implement minimal surface or wire to generated client
  - Files:
    - govee-python/src/govee/data/openapi/client.py (expand methods)
    - govee-python/src/govee/data/openapi/models.py (add typed models)
  - Run tests and iterate.
  - Acceptance: tests pass.
  - Commit: feat(openapi): implement device endpoints & models
- [ ] REFACTOR: integrate with code that needs these endpoints (e.g., OpenAPI service), update docs.
  - Commit: refactor(openapi): tidy models & examples

## 6. General lint/format and CI (all_checks)
- [ ] RED: run uv run -s format_check and capture failures
  - Command: uv --directory govee-python run -s format_check
- [ ] GREEN: fix formatting and lint issues
  - Commands:
    - cd govee-python
    - black .
    - isort .
    - .venv/bin/ruff check src tests
  - Acceptance: format_check passes locally.
  - Commit: chore(format): apply black/isort/ruff fixes
- [ ] Run uv all_checks
  - Command: uv --directory govee-python run -s all_checks
  - Acceptance: all_checks returns success

---

# Per-task notes & test names
- message-id ack test: govee-python/tests/test_iot_client_inflight_by_id.py
- reconnect/backoff tests: govee-python/tests/test_iot_client_reconnect_backoff.py
- paho backend reconnect/mock tests: govee-python/tests/test_paho_backend_reconnect.py
- e2e local broker test (optional): govee-python/tests/test_iot_paho_e2e.py
- openapi endpoint tests: govee-python/tests/test_openapi_device_endpoints.py
- adapter compatibility tests already exist: test_iot_adapter_compat.py and test_mqtt_adapter_* (Fake backend)

---

# Commands & workflow tips
- Activate venv:
  - . govee-python/.venv/bin/activate
- Run single test module:
  - python -m pytest -q govee-python/tests/test_iot_client_inflight_by_id.py
- Run full tests for package:
  - cd govee-python && python -m pytest -q
- Run uv wrapper:
  - uv --directory govee-python run -s test
  - uv --directory govee-python run -s format_check
  - uv --directory govee-python run -s all_checks
- Lint/format:
  - cd govee-python
  - .venv/bin/ruff check src tests
  - black .
  - isort .

---

# Priorities (recommended)
1. Implement inflight ack-by-id (small, high value).
2. Implement reconnect/backoff driver for IoTClient (medium).
3. Harden PahoBackend (larger).
4. Expand OpenAPI client surface if needed.
5. Add e2e local-broker CI test (optional, bigger).

If you want, I will:
- pick priority #1 now (implement ack-by-id) and produce the RED test, then implement the code and commit after GREEN; or
- produce a single PR that implements a subset (ack-by-id + reconnect driver) with tests.

Which do you want me to implement first?
Below is a detailed, executable Markdown checklist you can use to drive the remaining parity work end‑to‑end. Each item is a small TDD-style task (RED → GREEN → REFACTOR) with the exact tests, files to edit, commands to run, and the acceptance criteria. Follow each item in order, commit after each GREEN, and mark the checkbox only when the acceptance criteria are satisfied.

- Use the project venv: . govee-python/.venv/bin/activate
- Run tests locally for the Python package: cd govee-python && python -m pytest -q
- Use uv to run scripts: uv --directory govee-python run -s test
- Commit format: conventional commits (test|feat|fix|refactor|chore)

---

# Parity tasks checklist (Markdown)

## 1. Inflight ack-by-message-id (IoT client)
- [x] RED: add failing test that expects ack-by-id behavior
  - Test file: govee-python/tests/test_iot_client_inflight_by_id.py
  - Test vector / behavior:
    - Publish a qos=1 message that assigns message_id (new field).
    - Simulate an incoming ack message that references the message_id.
    - Expect inflight_count to drop and message.acked True.
  - Add test that fails initially.
  - Commit: test(iot-client): add failing test for inflight ack-by-id
- [x] GREEN: implement minimal code
  - Files to modify:
    - govee-python/src/govee/data/iot/iot_client.py
      - Add message_id generation to AsyncIotMessage.
      - Update publish/send_with_retry to set message.message_id.
      - Update _process_auto_ack() to accept {'ack_for_id': id} and acknowledge by id.
  - Commands:
    - . govee-python/.venv/bin/activate
    - python -m pytest govee-python/tests/test_iot_client_inflight_by_id.py -q
  - Acceptance criteria:
    - New test passes.
    - No regression in existing inflight tests.
  - Commit: feat(iot-client): add message_id ack-by-id and ack handling
- [x] REFACTOR: finalize, tidy, tests
  - Clean up names, docstrings, type hints.
  - Run full test suite: cd govee-python && python -m pytest -q
  - Commit: refactor(iot-client): tidy ack-by-id implementation

## 2. Robust reconnect & backoff driver (IoT client)
- [x] RED: add failing test for reconnect/backoff
  - Test file: govee-python/tests/test_iot_client_reconnect_backoff.py
  - Behavior:
    - Simulate intermittent connection failures (mock connection.connect to throw twice then succeed).
    - Expect IoTClient to attempt retries with exponential backoff and eventually become connected.
  - Commit: test(iot-client): add reconnect/backoff failing test
- [x] GREEN: implement minimal reconnect/backoff
  - Files:
    - govee-python/src/govee/data/iot/iot_client.py
      - Add a reconnect loop with configurable backoff/jitter, max attempts, and an async driver task that runs while not connected.
      - Ensure tasks are canceled on disconnect and don't leak.
  - Commands:
    - Activate venv and run the new test: python -m pytest govee-python/tests/test_iot_client_reconnect_backoff.py -q
  - Acceptance criteria:
    - The test passes deterministically.
    - No pending asyncio tasks after test exit (use pytest checks / explicit cleanup).
  - Commit: feat(iot-client): add reconnect/backoff driver
- [x] REFACTOR: refine policy and config
  - Add config knobs (initial_backoff, max_backoff, jitter).
  - Add unit test for jitter boundaries.
  - Run full test suite.
  - Commit: refactor(iot-client): parametrize backoff policy

## 3. PahoBackend production hardening (MQTT adapter)
- [ ] RED: add failing test that shows reconnect behavior is expected
  - Test file: govee-python/tests/test_paho_backend_reconnect.py
  - Behavior:
    - Use a mock or fake paho client that simulates connect failure then success; assert PahoBackend.connect retries and eventually returns or sets connected state.
  - Commit: test(mqtt): add paho backend reconnect failing test
- [x] GREEN: implement minimal code to pass
  - Files:
    - govee-python/src/govee/data/common/paho_adapter.py
      - Implement connection retry with exponential backoff + jitter and TLS CA/cert integration.
      - Implement safe stop/cleanup (stop background thread gracefully).
      - Add ability to configure TLS CA trust bundles from OpenAPI credential payload.
  - Commands:
    - python -m pytest govee-python/tests/test_paho_backend_reconnect.py -q
  - Acceptance criteria:
    - Test passes (mocked connect path).
    - No leaked threads after test completion.
  - Commit: feat(mqtt): implement paho reconnect with backoff and TLS options
- [ ] REFACTOR: add logging and lifecycle control
  - Add more tests to ensure unsubscribe on disconnect, reconnect subscription resumption.
  - Run full test suite.
  - Commit: refactor(mqtt): improve lifecycle & logging

## 4. Integration test against a local MQTT broker (optional but recommended)
- [ ] RED: add failing e2e test that publishes/subscribes to a real broker
  - Test file: govee-python/tests/test_iot_paho_e2e.py
  - Requires a local broker (mosquitto) in CI or a test fixture.
  - Behavior:
    - Start local broker (or use test fixture), create PahoBackend.connect(), attach IoTClient, publish, and assert handler receives messages.
  - Commit: test(mqtt): add e2e Paho backend failing test
- [ ] GREEN: run with a local broker or docker-mosquitto
  - Implementation: run mosquitto on CI or as a local fixture and ensure test passes.
  - Acceptance: e2e test passes in CI.
  - Commit: feat(mqtt): add mosquitto-based e2e test and CI job

## 5. Expand OpenAPI client parity (models & endpoints)
- [ ] RED: add failing tests for each missing endpoint/use-case
  - Tests:
    - govee-python/tests/test_openapi_device_endpoints.py (device list, control, etc.)
  - Commit: test(openapi): add failing tests for endpoints
- [ ] GREEN: implement minimal surface or wire to generated client
  - Files:
    - govee-python/src/govee/data/openapi/client.py (expand methods)
    - govee-python/src/govee/data/openapi/models.py (add typed models)
  - Run tests and iterate.
  - Acceptance: tests pass.
  - Commit: feat(openapi): implement device endpoints & models
- [ ] REFACTOR: integrate with code that needs these endpoints (e.g., OpenAPI service), update docs.
  - Commit: refactor(openapi): tidy models & examples

## 6. General lint/format and CI (all_checks)
- [ ] RED: run uv run -s format_check and capture failures
  - Command: uv --directory govee-python run -s format_check
- [ ] GREEN: fix formatting and lint issues
  - Commands:
    - cd govee-python
    - black .
    - isort .
    - .venv/bin/ruff check src tests
  - Acceptance: format_check passes locally.
  - Commit: chore(format): apply black/isort/ruff fixes
- [ ] Run uv all_checks
  - Command: uv --directory govee-python run -s all_checks
  - Acceptance: all_checks returns success

---

# Per-task notes & test names
- message-id ack test: govee-python/tests/test_iot_client_inflight_by_id.py
- reconnect/backoff tests: govee-python/tests/test_iot_client_reconnect_backoff.py
- paho backend reconnect/mock tests: govee-python/tests/test_paho_backend_reconnect.py
- e2e local broker test (optional): govee-python/tests/test_iot_paho_e2e.py
- openapi endpoint tests: govee-python/tests/test_openapi_device_endpoints.py
- adapter compatibility tests already exist: test_iot_adapter_compat.py and test_mqtt_adapter_* (Fake backend)
