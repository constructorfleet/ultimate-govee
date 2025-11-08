Purpose

This ExecPlan describes a small, self-contained iteration on the repository's
execution-plan documentation. The goal is to create a clear, reusable ExecPlan
file at the repository root (EXECPLAN.md) that conforms to the requirements in
.agents/PLANS.md and can be used as the authoritative, replicable plan for a
future code-level change. After this change a reader should be able to open
EXECPLAN.md and follow it to implement the described feature without any other
context.

Background

This repository contains guidance files under .agents (for example TDD.md and
PLANS.md) that define processes and constraints for coding agents. The
PLANS.md file mandates that every executable specification (ExecPlan) be fully
self-contained and follow strict formatting and content rules. There is not an
ExecPlan file at the repo root currently; creating one will provide a
convenient template and a concrete example for future work.

Scope

Create EXECPLAN.md at the repository root. The file will be the single-source
ExecPlan for a planned iteration that updates repository ExecPlans. The file
will be a standalone ExecPlan (no external references) and will follow the
formatting rules in .agents/PLANS.md (the file content is the single ExecPlan,
so triple-backticks are omitted).

Goals

- Provide a perfectly self-contained ExecPlan that any contributor (including a
  novice) can follow to implement the specified change.
- Demonstrate best practices required by PLANS.md: clear user-facing purpose,
  exact commands to run, a step-by-step implementation plan, tests to add, and
  a progress checklist that will be updated as work proceeds.
- Commit the new file to the repository so it is available to the team.

Definitions

ExecPlan: an executable specification for implementing a feature or change.
It is self-contained and includes commands, file edits, and validation steps.

GREEN: the state where tests and style/format checks pass (uv run -s all_checks)

RED: the state where tests or style/format checks fail

Design and Rationale

This ExecPlan is intentionally minimal: it documents the meta-work of creating
an ExecPlan. It includes exact commands to run, files to edit, and a test plan
for validating the change. It provides an example of how to write future
ExecPlans that must be self-contained, so readers can reuse the structure and
requirements when authoring more substantial plans.

Implementation steps (milestones)

1) Create the EXECPLAN.md file containing this ExecPlan. This is the current
   milestone and will be committed.

2) Validate repository tooling availability. Run the lightweight scripts via uv
   (uv run -s format_check and uv run -s lint are useful; uv run -s all_checks
   runs the canonical checks but may fail if the working tree has formatting
   issues unrelated to this doc). Record the observed outputs here.

3) If subsequent code changes are requested by reviewers of this ExecPlan,
   follow the repository TDD loop: write a failing test (RED), implement the
   minimum change (GREEN), refactor while keeping GREEN, and commit after each
   milestone. Update EXECPLAN.md to record decisions and progress.

Commands to run (exact)

- Run the repository's helper checks (may be slow but is the canonical check):

  uv run -s all_checks

- Run the lightweight format check (if you only need to validate formatting):

  uv run -s format_check

- Run the repo's tests directly (uses the packaged venv in govee-python):

  uv run -s test

Files to edit

- EXECPLAN.md (this file)
- If follow-up implementation work is required, the ExecPlan will list the
  concrete source files to modify and the tests to add. Keep every change
  minimal and self-describing.

Validation and tests

Because this change only adds documentation, the validation is: the file
exists at the repository root and conforms to the PLANS.md rules. For
mechanical validation, run the commands above. If reviewers require the entire
all_checks set to be green before merging, ensure code formatting issues in the
working tree are addressed separately (those are outside the scope of this
ExecPlan).

Progress (mandatory checklist)

- [x] Create EXECPLAN.md at repository root
- [ ] Validate uv scripts and tooling on the contributor machine
- [ ] If required by reviewers, update code and tests to achieve all_checks
- [ ] Update this ExecPlan with decisions and final validation output

Decision log

- 2025-11-08: Created initial ExecPlan to provide a self-contained template
  and example for future executable specifications. Rationale: make it easy for
  new contributors and agents to author plans that satisfy .agents/PLANS.md.

How to continue from here

If you want to iterate on this ExecPlan to describe an actual code change,
replace the "Implementation steps" section with a detailed plan for the real
feature, including files to edit, diffs to apply, tests to add (with concrete
example inputs/outputs), and the exact commands required to reproduce the
RED→GREEN→REFACTOR loop.

