# Project Goal

Objective: Port the existing TypeScript library to Python 3.14 within this repo,
preserving functionality and public API semantics. Use strict TDD with RED =
failing tests + failing lint/format; GREEN only when tests and style checks
pass. Use uv for environment and scripts. Commit with Conventional Commits.

Inputs you must inspect 1. The entire TypeScript library (source + tests +
types). 2. Any package metadata (package.json, tsconfig, README, examples). 3.
Existing Python project scaffold (pyproject.toml, scripts, tests/, src/).

Constraints & Tooling • Python: 3.14 (assume CPython). • Test: pytest (+
pytest-cov with --cov-fail-under=90). • Style: ruff, black, isort (treat style
failures as RED). • Runner: uv (uv run -s all_checks). • Commits: Conventional
Commits only, commit after GREEN.

Test Parity Strategy • Derive tests from TS: • Translate TS unit tests to pytest
1:1 where possible. • If TS used Jest/Vitest assertions, map them to pytest
assertions/fixtures. • Recreate async tests with pytest.mark.asyncio. • Cover
edge cases implied by TS types (e.g., undefined | null → None, narrow unions,
empty arrays/objects). • Add regression tests for any observed TS runtime quirks
(implicit coercions, ordering). • Maintain or exceed original coverage; enforce
--cov-fail-under=90.

Language Feature Mapping (TS → Python 3.14) • Modules & Exports: TS export →
Python modules in src/<pkg>/.... Preserve public API via **init**.py re-exports.
• Types & Interfaces: • TS interface/object shapes → typing.TypedDict (for
dict-like) or @dataclass (for records). • TS type unions → typing.Union or
typing.Literal where appropriate. • Structural typing → Python Protocol if
behavior-based. • Optional props → Optional[...]. Null/undefined → None. •
Generics: TS generics → typing.TypeVar, Generic[...] where needed. • Enums: TS
enum → enum.Enum or IntEnum (match semantics). • Functions & Overloads: TS
overload signatures → single Python function with runtime dispatch; annotate
with @overload stubs if needed. • Async/Promises: TS Promise<T> → async def
returning T. Use asyncio primitives. Convert promise chains to await with
equivalent control flow. • Iterables & Streams: TS iterators/generators → Python
generators (yield) or async generators. • Errors: TS throw → Python exceptions
(create specific subclasses to preserve meaning). Map error types consistently.
• Narrowing & Guards: TS type guards → Python runtime checks (isinstance, key
presence). • Dates & JSON: Use datetime (timezone-aware) and json/orjson (if
allowed). Preserve wire formats. • Node/Browser APIs: Replace with Python
equivalents or create shims (see “Shim Layer”). • Side Effects & I/O: Keep pure
when possible; isolate I/O behind thin adapters for testability.
