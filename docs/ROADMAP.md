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
- [x] Foundation and advanced lesson modules with practical examples and source links.
- [x] Deterministic, no-model knowledge checks with local attempt history and scoring.
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
- [x] Add optional bearer-token protection for prompt APIs and keep the browser token session-only.
- [ ] Add database migrations, PostgreSQL deployment, per-user authentication/authorization, tenant isolation, rate limits, and monitoring before public hosting.

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

## M7 — Advanced prompting techniques and workflow builder (specified, not implemented)

The scope and acceptance criteria are documented in [Advanced Prompting and Workflow Builder Specification](ADVANCED_PROMPTING_SPEC.md). This milestone records planned work only; do not mark an implementation task complete because the specification exists.

- [x] Research and document current official OpenAI, Anthropic, and Google prompting guidance with primary-source links.
- [x] Clarify that “looped prompting” and “graph workflow prompting” are project terminology, not shared official vendor names.
- [x] Define the Advanced Techniques Library, bounded self-correction loop, visual graph workflow editor, typed workflow schema, local-first execution boundaries, evaluation integration, safety constraints, accessibility requirements, and acceptance criteria.
- [ ] Review and freeze the product scope before implementation.
- [ ] Build the source-linked Advanced Techniques Library and provider-aware learning modules.
- [ ] Implement typed workflow schema, validated import/export, graph analysis, and static diagnostics.
- [ ] Build the graph canvas plus accessible outline editor and starter workflows.
- [ ] Implement deterministic node execution, explicit local-model prompt nodes, finite loop controllers, cancellation, and trace inspection.
- [ ] Integrate workflow versions and run traces with the existing Evaluation Bench.
- [ ] Add automated coverage for malformed graphs, cycles, loop budgets, branch/merge semantics, cancellation, storage errors, accessibility, and core journeys.
- [ ] Verify model-backed behavior on actual supported WebGPU devices before claiming it works on target hardware.

**M7 acceptance gate:** the requirements in the linked specification are implemented and tested. No hosted LLM provider, provider SDK, API key, arbitrary network-call node, or new mandatory backend is added.

