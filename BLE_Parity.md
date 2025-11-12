BLE Parity tasks — Completed

All parity checklist items and suggested tests have been implemented in the govee-python test suite. The long task list that used to be in this file has been removed to avoid duplication with the repository tests. Key tests and files added/updated include:

- govee-python/tests/test_decoder_edgecases.py
- govee-python/tests/test_decoder_calibration.py
- govee-python/tests/test_decoder_spec_and_iot.py
- existing decoder tests under govee-python/tests cover model detection, hex parsing, signed values, BCF, post-processing and IoT delegation.

If further parity gaps are discovered, please open an issue or reintroduce specific task items with concrete vectors.
