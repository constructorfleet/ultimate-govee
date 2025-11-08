# TDD Development Loop

Phase 1 — RED • Write a failing test for the next tiny slice of behavior in
tests/. • Also ensure an initial style failure exists (e.g., unused import,
missing type, spacing), so ruff or black --check or isort --check-only fails. •
Prove it’s red: `uv run -s test` → tests fail `uv run -s lint` and
`uv run -s format_check` → lint/format fail

Phase 2 — GREEN • Implement the minimum code to make the new test pass. • Fix
all style issues and formatting. • Prove it’s green: `uv run -s all_checks`
passes (ruff + black –check + isort –check-only + pytest with coverage
threshold)

Phase 3 — REFACTOR • Improve design and readability (names, extraction, purity,
types). • Keep `uv run -s all_checks` passing after each change.

Rules • Lint/format failures are treated as test failures in RED. • No
committing unless `uv run -s all_checks` passes. • Keep unit tests isolated and
deterministic; prefer pure functions; test public API; one behavior per test.

Conventional Commits (enforced in this workflow) • Commit only after GREEN
(tests + lint/format pass). • Use: feat(scope): … for new behavior fix(scope): …
for bug fixes test(scope): … for tests only refactor(scope): … for internal
changes w/o behavior change chore(scope): … for tooling/infra (e.g., configs) •
Example messages: feat(parser): support quoted keys in config files fix(api):
handle None input in normalize() test(parser): add cases for escaped quotes
refactor(core): extract tokenizer interface chore(ci): add uv all_checks job

Command palette (use these as you work) • uv run -s test • uv run -s lint • uv
run -s format_check • uv run -s all_checks • uv tool ruff / uv tool black / uv
tool isort (if you prefer uvx, that’s fine too)

Coverage gate • Keep --cov-fail-under=90 (adjust if necessary). GREEN requires
meeting the gate.
