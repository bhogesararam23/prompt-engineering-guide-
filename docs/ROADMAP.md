# Roadmap and exit gates

## M0 — Baseline and security
- [x] Locate the single-file HTML baseline and identify the embedded hosted-LLM integration.
- [x] Create a separate rebuild branch.
- [x] Replace the legacy page on the rebuild branch so it is no longer part of the new app tree.
- [ ] Revoke the old exposed provider credential; deleting a file cannot invalidate a key or remove it from Git history.

## M1 — Local-first web foundation
- [x] React, TypeScript, Vite, typed learning content, and responsive navigation.
- [x] Deterministic prompt assembly and validation.
- [x] Browser-local prompt persistence and JSON import/export.
- [ ] Run typecheck, unit tests, production build, and a browser smoke test in CI.

## M2 — Learning and Prompt Lab
- [x] Foundation and advanced lesson modules with practical examples.
- [x] Prompt templates and structured prompt fields.
- [x] Save, copy, search lessons, filter categories, and export/import the prompt library.
- [x] Compare two saved prompt snapshots using a bounded line-level diff.
- [x] Validate imported prompt records and re-key ID collisions.
- [x] Add bookmarks, lesson completion progress, and progress persistence tests.
- [x] Add prompt import parser validation and duplicate-ID tests.
- [ ] Complete keyboard-navigation and screen-reader review.

## M3 — Local inference
- [x] Isolate WebLLM in a dedicated adapter with explicit load/unload actions.
- [x] Provide no-model fallback and WebGPU capability messaging.
- [x] Isolate inference in a dedicated Web Worker.
- [ ] Verify model ID against the installed runtime and test target devices.
- [x] Add streamed local output, visible partial responses, and user-triggered interruption for playground and evaluation runs.
- [ ] Validate engine unload/resource recovery and run end-to-end offline tests.

## M4 — Optional backend
- [x] FastAPI service with SQLite prompt persistence and deterministic validation.
- [x] API test suite.
- [x] Add explicit opt-in API connection checks, prompt upload, and API-to-browser merge; there is no background sync.
- [ ] Add conflict-resolution and sync reconciliation tests before expanding synchronization.
- [ ] Add database migrations, PostgreSQL deployment, authentication, authorization, and rate limits before public hosting.

## M5 — Evaluation and content quality
- [x] Add portable local datasets, deterministic exact-match scoring, and editable test cases.
- [x] Record a prompt snapshot, model/runtime identifier, per-case inputs/outputs, and results in local run history.
- [ ] Add stable dataset version IDs and richer task-specific metrics.
- [ ] Add human review workflows; any model-as-judge option stays optional.
- [x] Keep evaluation execution local and optional; no hosted LLM call is made.
- [ ] Expand the handbook with sourced content, not unsupported effectiveness percentages.

## M6 — Release hardening
- [x] Add production app-shell caching for repeat offline visits; model weights and API calls are intentionally excluded.
- [x] Add Playwright smoke tests for the production preview: overview, guide search, prompt save/version comparison, and model-free evaluation UI.
- [ ] Confirm CI passes and complete the keyboard/accessibility audit.
- [ ] Audit dependencies, licenses, model weights, and actual network traffic.
- [ ] Test a clean install, mobile layout, local inference, failure recovery, and offline behavior.
- [ ] Publish reproducible deployment and rollback instructions.

A checkbox means code exists, not that quality gates have passed. Keep unfinished requirements visible.