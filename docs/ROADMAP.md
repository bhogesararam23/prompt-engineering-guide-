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
- [x] Confirm CI passes on merged commit 1b46e69 (GitHub Actions run #254); complete the keyboard/accessibility audit separately.
- [ ] Audit dependencies, licenses, model weights, and actual network traffic.
- [ ] Test a clean install, mobile layout, local inference, failure recovery, and offline behavior.
- [ ] Publish reproducible deployment and rollback instructions.

A checkbox means code exists, not that quality gates have passed. Keep unfinished requirements visible.

## M7 — Advanced prompting techniques and workflow builder

The first implementation slice is merged to main. The specification remains the product contract; release readiness is still gated on accessibility, model/runtime verification, security remediation, and licensing follow-up.

- [x] Research and document official OpenAI, Anthropic, and Google guidance with primary-source links.
- [x] Distinguish product terminology (“looped prompting”, “graph workflow prompting”) from vendor naming and the Graph of Thoughts research framework.
- [x] Add 12 source-linked technique cards with use cases, trade-offs, steps, and examples.
- [x] Add technique search/category filters and transfer a chosen technique into Prompt Lab.
- [x] Define discriminated workflow node types, node/edge limits, graph validation, topological ordering, and a versioned JSON contract.
- [x] Add workflow JSON import/export, local persistence, and bounded local run-history storage.
- [x] Implement deterministic input, transform, validator, router, merge, and output nodes.
- [x] Implement a Loop Controller with deterministic acceptance checks and a hard 1–10 iteration limit.
- [x] Preserve partial node traces when a user cancels execution.
- [x] Add an accessible workflow outline, node inspector, branch-port editor, run traces, and a model-free starter graph.
- [x] Add unit and Playwright coverage for catalog links, malformed workflow graphs, bounded loops, persistence, cancellation, and model-free user journeys.
- [x] Verify CI on the exact merged commit before starting the next runtime milestone.
- [x] Add a draggable node canvas with SVG connection paths, saved positions, an auto-arrange action, numeric position controls, and an accessible Outline fallback.
- [x] Add bounded undo/redo history for node edits, connection changes, and canvas positioning.
- [x] Add a Human Review node with approve/reject ports, optional edited output, reviewer notes, and auditable trace data.
- [x] Add workflow evaluation against portable local datasets with per-case results, deterministic match rules, snapshots, cancellation, and local run history.
- [x] Add E2E coverage for canvas/outline editing, undo/redo, workflow evaluation, and interactive human review.
- [ ] Review all source statements and re-check living provider documentation immediately before release.
- [ ] Audit keyboard/screen-reader behavior and mobile workflow editing.
- [ ] Verify local-model runtime compatibility and memory behavior on real supported WebGPU devices.
- [ ] Revoke the old exposed provider credential and confirm the repository/history remediation plan.
- [ ] Finalize the project license, dependency/model licensing review, and deployment decision.

**Implementation boundary:** the visible workflow graph is a DAG. Retry cycles are encapsulated in the Loop Controller, which enforces a finite attempt limit. No hosted LLM provider, provider SDK, API key, arbitrary code execution, arbitrary network-call node, or mandatory backend was added.

## M8 — Workflow runtime reliability and parallel DAG scheduling

- [x] Schedule reachable nodes by dependency frontier so independent branches can run concurrently without allowing a merge to race unfinished inputs.
- [x] Preserve deterministic merge input order, final trace order, and error order even when independent tasks finish at different times.
- [x] Serialize generation calls by default for the single shared WebLLM worker; provide an explicit opt-in for concurrency-safe injected generators.
- [x] Serialize human-review requests by default for the single interactive review dialog.
- [x] Make a pending human-review promise listen to its abort signal, remove its listener after settlement, close the dialog, and complete the run as cancelled.
- [x] Add unit coverage for genuinely concurrent safe generators and safe-by-default serialization.
- [x] Add a production-preview E2E test for cancelling a run while it is paused at human review.
- [ ] Extend manual validation to nested fan-out/merge graphs and aborts that occur while several independent nodes are in flight.
- [ ] Profile large graphs near configured node/edge limits and document practical browser limits.
- [ ] Verify keyboard focus return and screen-reader announcements for the cancel-and-resume lifecycle.

Runtime boundary: concurrency is bounded by dependency readiness, not an unbounded worker pool. Single-worker local inference and the single review dialog remain serialized by default. Parallelism must not change the data order seen by merge nodes or make cancellation depend on whichever promise settles first.
