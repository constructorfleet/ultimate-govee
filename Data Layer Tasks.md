# ✅ IoT / OpenAPI / MQTT Clients Implementation Checklist

## 🏁 High-Level Goal
- [ ] Implement production-capable OpenAPI HTTP client (models + wrapper)
- [ ] Implement robust IoT client (parsing, reconnect, queueing, inflight/QoS)
- [ ] Implement real MQTT adapter (wrapper)
- [ ] Ensure tests are deterministic, fast, and offline (fixtures only)

---

## ⚙️ Setup / Dev Environment
- [ ] Activate venv: `. govee-python/.venv/bin/activate`
- [ ] Run tests: `python govee-python/run_tests.py` or `pytest -q govee-python/tests/<testfile>.py`
- [ ] Use `uv`: `cd govee-python && uv run -s test`
- [ ] Install dependencies with `uv tool pip install <dep>`

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
 - [ ] Docstring + usage example

**Commit flow**
- [ ] RED: `test(openapi): add tests for iot credentials parsing and error handling`
- [ ] GREEN: `feat(openapi): add minimal async OpenAPI client and iot credentials model`
- [ ] REFACTOR: `refactor(openapi): cleanup and add docstring`

---

## 🔌 Task 3.2 — IoT Client Parsing & Handler Semantics

**Goal:** Full IoT client semantics (queueing, retry, retained, QoS, etc.)

### Files
- [x] `src/govee/data/iot/iot_client.py`
- [x] `tests/test_iot_client_queueing.py`
- [x] `tests/test_iot_client_inflight.py`
- [x] `tests/fixtures/iot/`

### Tests (RED)
- [ ] `test_publish_and_deliver_with_connected_handler`
- [ ] `test_retained_delivered_on_subscribe`
- [x] `test_queueing_while_disconnected`
- [x] `test_queue_bound_and_drop_callbacks`
- [x] `test_qos_inflight_ack_and_retry`
- [x] `test_send_with_retry_schedules_backoff`
- [x] `test_interruption_queueing`
- [x] `test_register_callback_and_unregister`

### Implementation (GREEN)
- [ ] Extend/fix IoTClient logic
- [ ] Ensure deterministic async behavior
- [ ] Add metrics & inspection methods
- [ ] Use fake handlers for stable tests

### Acceptance
- [ ] All IoT tests pass
- [ ] Deterministic behavior
- [ ] `metrics_text()` and count methods work

**Commit flow**
- [ ] RED: `test(iot-client): add queueing and retained message tests`
- [ ] GREEN: `feat(iot-client): implement retry/backoff scheduling`
- [ ] REFACTOR: `fix(iot-client): ensure retained delivery consistency`

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
- [x] Backend abstraction (FakeBackend for tests)
- [x] Optional paho-mqtt backend
- [x] Use JSONL fixtures for simulated messages

### Acceptance
- [x] Tests pass offline
- [x] Swappable backend for real MQTT broker

**Commit flow**
- [ ] RED: `test(mqtt): add persisted-fixture replay tests`
- [ ] GREEN: `feat(mqtt): add mqtt adapter with fixture backend`
- [ ] REFACTOR: `refactor(mqtt): tidy API surface`

---

## 🧩 Cross-Cutting Tasks
- [x] Add fixtures in `/tests/fixtures/{openapi,iot,mqtt}`
- [x] Add integration test `test_iot_manager_integration.py` (TODO: implement)
- [x] Validate OpenAPI → IoTAdapter flow
- [ ] Update `pyproject.toml` if deps change
- [ ] Ensure `uv run -s test` passes all checks
- [ ] Add `README.md` in `/src/govee/data/iot/` with API usage examples

---

## 🧪 TDD Loop (Apply to All Subtasks)
- [ ] **RED:** write failing test  
- [ ] **GREEN:** implement minimal code to pass  
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
