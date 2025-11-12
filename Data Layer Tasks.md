# ✅ IoT / OpenAPI / MQTT Clients Implementation Checklist

## 🏁 High-Level Goal
- [x] Implement production-capable OpenAPI HTTP client (models + wrapper)
- [x] Implement robust IoT client (parsing, reconnect, queueing, inflight/QoS)
- [x] Implement real MQTT adapter (wrapper)
- [x] Ensure tests are deterministic, fast, and offline (fixtures only)

---

## ⚙️ Setup / Dev Environment
- [x] Activate venv: `. govee-python/.venv/bin/activate`
  - verified: VIRTUAL_ENV=/Users/tglenn/src/ultimate-govee/govee-python/.venv, python -> /Users/tglenn/src/ultimate-govee/govee-python/.venv/bin/python, Python 3.13.1
- [x] Run tests: `python govee-python/run_tests.py` or `pytest -q govee-python/tests/<testfile>.py`
  - verified: ran pytest in venv (python -m pytest -q govee-python/tests) -> 272 passed
- [x] Use `uv`: `cd govee-python && uv run -s test`
  - verified: uv --directory govee-python run -s test executed pytest successfully in venv
- [x] Install dependencies with `uv tool pip install <dep>`
  - verified: uv --directory govee-python tool install paho-mqtt installed paho-mqtt into venv

---

## 📦 Task 3.1 — OpenAPI Models + HTTP Wrapper

**Goal:** Async OpenAPI client for IoT credentials.

### Files
 - [x] `src/govee/data/openapi/client.py`
 - [x] `src/govee/data/openapi/models.py`
 - [x] `tests/test_openapi_client.py`
 - [x] `tests/fixtures/openapi/`

### Tests (RED)
 - [x] `test_get_iot_credentials_parses_response`
 - [x] `test_get_iot_credentials_handles_404`
 - [x] `test_retry_on_500_then_success`
 - [x] `test_timeout_raises`

### Implementation (GREEN)
 - [x] Async HTTP wrapper with retries, timeouts, and domain errors
 - [x] Define `IoTCredentialModel` (TypedDict/dataclass)
 - [x] Configurable base_url and session injection
 - [x] Raise custom errors for 4xx/5xx/timeouts

### Acceptance
 - [x] All tests pass (targeted OpenAPI tests pass)
 - [x] No network IO in tests
 - [x] Docstring + usage example

**Commit flow**
- [x] RED: `test(openapi): add tests for iot credentials parsing and error handling`
- [x] GREEN: `feat(openapi): add minimal async OpenAPI client and iot credentials model`
- [x] REFACTOR: `refactor(openapi): cleanup and add docstring`
  - verified: AsyncOpenApiClient docstring added and client cleaned

---

## 🔌 Task 3.2 — IoT Client Parsing & Handler Semantics

**Goal:** Full IoT client semantics (queueing, retry, retained, QoS, etc.)

### Files
- [x] `src/govee/data/iot/iot_client.py`
- [x] `tests/test_iot_client_queueing.py`
- [x] `tests/test_iot_client_inflight.py`
- [x] `tests/fixtures/iot/`

### Tests (RED)
- [x] `test_publish_and_deliver_with_connected_handler`
- [x] `test_retained_delivered_on_subscribe`
- [x] `test_queueing_while_disconnected`
- [x] `test_queue_bound_and_drop_callbacks`
- [x] `test_qos_inflight_ack_and_retry`
- [x] `test_send_with_retry_schedules_backoff`
- [x] `test_interruption_queueing`
- [x] `test_register_callback_and_unregister`

### Implementation (GREEN)
- [x] Extend/fix IoTClient logic
- [x] Ensure deterministic async behavior
- [x] Add metrics & inspection methods
- [x] Use fake handlers for stable tests

### Acceptance
- [x] All IoT tests pass
- [x] Deterministic behavior
- [x] `metrics_text()` and count methods work

**Commit flow**
- [x] RED: `test(iot-client): add queueing and retained message tests`
  - verified: tests added under govee-python/tests/test_iot_client_queueing.py and test_iot_client_retained.py and pass
- [x] GREEN: `feat(iot-client): implement retry/backoff scheduling`
  - verified: background retry tasks schedule and invoke drop callbacks as tests assert
- [x] REFACTOR: `fix(iot-client): ensure retained delivery consistency`
  - verified: retained messages delivered on subscribe/connect (tests present)

---

## 📡 Task 3.3 — MQTT Wrapper + Offline Tests

**Goal:** MQTT adapter mirroring IoTClient API; testable with persisted fixtures.

### Files
- [x] `src/govee/common/mqtt_adapter.py`
- [x] `tests/test_mqtt_adapter.py`
- [x] `persisted/mqtt_fixtures/`

### Tests (RED)
- [x] `test_mqtt_adapter_delivers_persisted_fixture_messages`
- [x] `test_mqtt_adapter_retained_and_clear`
- [x] `test_mqtt_adapter_qos_and_ack`
- [x] `test_mqtt_adapter_reconnect_and_resume_subscriptions`

### Implementation (GREEN)
- [x] Implement adapter compatible with IoTClient
  - verified: adapter compatibility test in govee-python/tests/test_iot_adapter_compat.py passes
- [x] Backend abstraction (FakeBackend for tests)
  - verified: FakeMQTTBackend implements replay(client) and tests assert backends can be injected
- [x] Optional paho-mqtt backend
  - verified: PahoBackend and PahoAdapter classes implemented in govee-python/src/govee/data/common/paho_adapter.py
- [x] Use JSONL fixtures for simulated messages
  - verified: persisted/mqtt_fixtures/replay_1.jsonl present and used by tests

### Acceptance
<<<<<<< HEAD
- [x] Tests pass offline
- [x] Swappable backend for real MQTT broker
=======
- [x] Tests pass offline
  - verified: all mqtt/iot/openapi tests use fixtures and pass offline in venv
- [x] Swappable backend for real MQTT broker
  - verified: MQTTAdapter supports backends with replay(client) or attach(client); PahoBackend provided
>>>>>>> parent of 2230fb3 (chore(tasks): mark mqtt adapter backend and fixtures implemented; tests pass offline)

**Commit flow**
- [x] RED: `test(mqtt): add persisted-fixture replay tests`
- [x] GREEN: `feat(mqtt): add mqtt adapter with fixture backend`
- [x] REFACTOR: `refactor(mqtt): tidy API surface`

---

## 🧩 Cross-Cutting Tasks
<<<<<<< HEAD
- [x] Add fixtures in `/tests/fixtures/{openapi,iot,mqtt}`
- [x] Add integration test `test_iot_manager_integration.py` (implemented offline as test_iot_openapi_integration.py)
- [x] Validate OpenAPI → IoTAdapter flow
=======
- [x] Add fixtures in `/tests/fixtures/{openapi,iot,mqtt}`
  - verified: govee-python/tests/fixtures and persisted/mqtt_fixtures contain fixtures used by tests
- [x] Add integration test `test_iot_manager_integration.py` (implemented offline as test_iot_openapi_integration.py)
- [x] Validate OpenAPI → IoTAdapter flow
>>>>>>> parent of 2230fb3 (chore(tasks): mark mqtt adapter backend and fixtures implemented; tests pass offline)
- [x] Update `pyproject.toml` if deps change
- [x] Ensure `uv run -s test` passes all checks
  - verified: uv --directory govee-python run -s test executed and pytest succeeded in venv
- [x] Add `README.md` in `/src/govee/data/iot/` with API usage examples

---

## 🧪 TDD Loop (Apply to All Subtasks)
- [x] **RED:** write failing test
  - verified: multiple RED tests were added that initially failed during development (e.g., retry/backoff)  
- [x] **GREEN:** implement minimal code to pass
  - verified: implementations added for IoT retry/backoff, retained delivery, mqtt adapter; tests pass  
- [ ] **REFACTOR:** clean & commit  
- [ ] Run:
  - [ ] `uv run -s test`
  - [ ] `uv run -s format_check`

---

## 📅 Recommended Order
1. [ ] Task 3.1 — OpenAPI client  
2. [ ] Task 3.2 — IoT client (base behaviors)  
3. [ ] Task 3.2 — IoT client (QoS/inflight/retry)  
4. [ ] Task 3.3 — MQTT adapter + offline tests  
5. [ ] Integration tests  
6. [ ] Final docs + CI cleanup  

---