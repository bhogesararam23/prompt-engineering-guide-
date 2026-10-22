# Prompt Engineering Guide

A local-first learning guide and prompt workbench. Learn practical prompting techniques, compose structured prompts, validate them with deterministic rules, save prompts in the browser, and optionally run a small language model directly in-browser.

**No hosted LLM API is configured. No model API key is required.** The guide, Prompt Lab, validation tools, and browser library work without loading a model.

## Features

- Eight typed lesson modules from foundations through context engineering, evaluation, and prompt security.
- Prompt Lab for role, task, context, examples, input, constraints, and output format.
- Deterministic prompt assembly and basic validation; previews do not call an LLM.
- Reusable templates for summarization, structured extraction, code review, and comparison.
- Browser-local prompt library with JSON import/export.
- Optional WebLLM inference using WebGPU-capable browsers.
- Optional FastAPI backend with SQLite persistence and deterministic validation.
- TypeScript checks, unit tests, API tests, and CI workflow.

## Frontend setup

Requirements: Node.js 20.19 or newer and npm.

~~~sh
npm install
npm run dev
~~~

Open the local URL printed by Vite, normally http://localhost:5173.

~~~sh
npm run typecheck
npm test
npm run build
npm run preview
~~~

## Optional local model

Open Local playground and choose Load local model. The first load can download runtime assets and model weights, so it may consume substantial bandwidth, storage, and memory. A supported browser with WebGPU and sufficient device resources is required.

Inference is run by the browser runtime. The application does not send prompts to a hosted LLM endpoint. The first-time acquisition of runtime files or weights may still use the network; fully offline operation must be tested after all required assets are cached. Model quality and performance vary by device and model.

## Optional API

The API stores prompts in a local SQLite database and provides health and deterministic validation endpoints. It does not proxy or call an LLM. Read docs/BACKEND.md for setup. By default, Uvicorn should bind to localhost. The API does not implement user authentication, so do not expose it to an untrusted network or treat stored prompts as private in a public deployment.

## Documentation

- docs/ARCHITECTURE.md — application boundaries and data flow.
- docs/BACKEND.md — backend setup and endpoint reference.
- docs/ROADMAP.md — milestones, exit gates, and known unfinished work.
- SECURITY.md — data handling and security expectations.
- CONTRIBUTING.md — development and contribution workflow.

## Principles

1. Useful without a model: learning, editing, validation, and browser persistence do not depend on inference.
2. Local-first by default: saved browser prompts remain in the current browser profile unless exported.
3. Honest boundaries: deterministic checks are not presented as model judgments.
4. No secrets in client code: never commit keys or put secrets in frontend environment variables.
5. Quality gates before claims: a feature is not marked complete until the relevant check actually passes.

## Current scope

The frontend and API are separate capabilities; frontend-to-backend synchronization, accounts, content administration, broad evaluation suites, and fully offline model packaging remain future milestones.