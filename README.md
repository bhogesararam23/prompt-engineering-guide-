# Prompt Engineering Guide

A local-first learning guide and prompt workbench. Learn practical prompting techniques, compose structured prompts, validate them with deterministic rules, save prompts in the browser, and optionally run a small language model directly in-browser.

**No hosted LLM API is configured. No model API key is required.** The guide, Prompt Lab, validation tools, and browser library work without loading a model.

## Features

- Eight source-linked learning modules with examples and deterministic knowledge checks whose attempts are saved locally.
- Advanced Techniques Library with 12 sourced technique cards covering prompt structure, few-shot prompting, chaining, bounded refinement, evaluation flywheels, routing, parallel aggregation, graph workflows, and Graph of Thoughts research.
- Graph & Loop Builder with a draggable canvas, SVG connections, coordinate editing, auto-arrange, undo/redo, an accessible Outline mode, typed node configuration, graph diagnostics, and validated local JSON import/export.
- Workflow execution with deterministic input, transformation, validation, routing, merge, output, and human-review nodes. Independent DAG branches are scheduled in parallel waves and merges retain a stable edge order. Model generation and review handlers are serialized by default for single-worker/browser-dialog safety; explicitly concurrency-safe handlers can opt in to parallel calls. Human review pauses for an explicit approve/reject decision, can accept a reviewed edit, records a decision note, and resolves cleanly when cancelled.
- Prompt and bounded loop nodes require the explicitly loaded local model; no hosted LLM API is configured.
- A workflow Evaluation Bench with editable datasets, exact/contains/non-empty match rules, per-case outputs, workflow/dataset snapshots, progress and cancellation, local run history, and dataset/run JSON export/import. Human-review workflows cannot be evaluated unattended.
- Bounded self-correction nodes with a hard limit of 1–10 attempts, deterministic acceptance checks, visible iteration traces, cancellation, and local run history.
- Prompt Lab for role, task, context, examples, input, constraints, and output format.
- Deterministic prompt assembly and basic validation; previews do not call an LLM.
- An evaluation bench with editable test cases, exact-match scoring, locally generated outputs, cancellation, export/import, and saved prompt/dataset snapshots.
- Reusable templates for summarization, structured extraction, code review, and comparison.
- Browser-local prompt library with JSON import/export, ID-safe import merging, and side-by-side saved-version line diffs.
- Lesson completion and bookmarks persisted locally, with a learning-progress overview.
- Production service worker caches the app shell and same-origin assets for repeat offline visits; API data and remote model weights are deliberately not cached.
- Optional WebLLM inference using WebGPU-capable browsers, run in a dedicated worker with streamed output and interruption.
- Optional FastAPI backend with SQLite persistence and deterministic validation.
- A CI policy guard that fails if known hosted-LLM endpoints, provider SDKs, or exposed Google API keys return to active app files.
- Playwright smoke tests for the main model-free user journeys and a production app-shell cache for repeat offline visits.
- TypeScript checks, unit tests, API tests, and CI workflow.

## Frontend setup

Requirements: Node.js 20.19 or newer and npm.

~~~sh
npm install
npm run dev
~~~

Open the local URL printed by Vite, normally http://localhost:5173.

~~~sh
npm run check:local-first
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run preview
~~~

## Optional local model

Open Local playground and choose Load local model. The first load can download runtime assets and model weights, so it may consume substantial bandwidth, storage, and memory. A supported browser with WebGPU and sufficient device resources is required.

Inference is run by the browser runtime. The application does not send prompts to a hosted LLM endpoint. The first-time acquisition of runtime files or weights may still use the network; fully offline operation must be tested after all required assets are cached. Model quality and performance vary by device and model.

## Optional API

The API stores prompts in a local SQLite database and provides health and deterministic validation endpoints. It does not proxy or call an LLM. Read docs/BACKEND.md for setup. By default, Uvicorn should bind to localhost. The API supports optional bearer-token protection using `PROMPT_GUIDE_API_TOKEN`; configure the matching token in the API panel for the current session. This is single-user protection, not multi-tenant authentication. Keep the API on localhost unless you add full production security and deployment controls.

## Documentation

- docs/ARCHITECTURE.md — application boundaries and data flow.
- docs/BACKEND.md — backend setup and endpoint reference.
- docs/ROADMAP.md — milestones, exit gates, and known unfinished work.
- docs/ADVANCED_PROMPTING_SPEC.md — source-linked specification for advanced techniques, loop behavior, workflow graph semantics, safety, and release criteria.
- SECURITY.md — data handling and security expectations.
- CONTRIBUTING.md — development and contribution workflow.

## Principles

1. Useful without a model: learning, editing, validation, and browser persistence do not depend on inference.
2. Local-first by default: saved browser prompts remain in the current browser profile unless exported.
3. Honest boundaries: deterministic checks are not presented as model judgments.
4. No secrets in client code: never commit keys or put secrets in frontend environment variables.
5. Quality gates before claims: a feature is not marked complete until the relevant check actually passes.

## Licensing and release readiness

No project license has been selected in this rebuild branch. Until a LICENSE file is added by the maintainer, do not assume that public visibility grants permission to redistribute or reuse the code. See [the release checklist](docs/RELEASE_CHECKLIST.md) for the remaining security, test, and deployment gates.

## Current scope

The frontend and API are separate capabilities. Prompt transfer is explicit and manually initiated; automatic/background sync, accounts, content administration, richer evaluation metrics, and fully offline model packaging remain future milestones.