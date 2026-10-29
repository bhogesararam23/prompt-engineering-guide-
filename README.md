# Prompt Engineering Guide

A learning-first guide to prompt engineering: understand prompting techniques, learn how to improve and evaluate prompts, and apply the right patterns to real tasks. The long-term direction is a professional, source-linked learning publication with task-focused lessons and maintained guides for major AI products.

**No hosted LLM API is configured. No model API key is required.** The guide, Prompt Lab, validation tools, and browser library work without loading a model.

## Current learning experience

- Eight source-linked learning modules with stated outcomes, prerequisites, per-lesson contents, related lessons, and an explicit next step.
- A curated task finder on the homepage that routes common jobs—classification, extraction, revision, safe document use, and more—to relevant lessons with a short rationale.
- A task library of fourteen fully worked scenarios across writing, studying, research, coding, data analysis, business, marketing, and everyday work. Each scenario shows a weak-versus-improved prompt pair, a step-by-step explanation, common mistakes, and a practice exercise.
- Nine profession-based routes (students, educators, researchers, developers, writers, marketers, founders, and adjacent roles) that sequence the existing lessons into an ordered path with local progress.
- Sixteen AI product guides covering ChatGPT/OpenAI, Claude, Gemini, Microsoft Copilot, GitHub Copilot, Perplexity, DeepSeek, Qwen, Kimi, GLM, MiniMax, ERNIE, Tencent Hunyuan, Mistral, Llama, and Grok. Each guide states what differs from the general principles, links to official first-party documentation, and carries last-verified and review-due dates that are enforced by tests.
- Local site search across lessons, scenarios, learning routes, and product guides. Everything is searched in the browser; no service or API key is involved.
- Three progress-aware learning routes (Beginner, Everyday Work, Advanced/Technical) that resume at the first incomplete lesson using browser-local completion state.
- Shareable lesson URLs with browser back/forward support; section links land directly on the relevant lesson heading.
- Deterministic knowledge checks whose attempts and completion progress are saved locally.
- An Advanced Techniques Library with 12 sourced technique cards and practical examples.
- Lesson completion, bookmarks, and local learning-progress overview.
- A browser-local prompt library, structured Prompt Lab, reusable templates, and prompt-version comparisons for optional practice.
- The learning pages work without loading a model, entering an API key, or connecting to a hosted LLM service.

## Supporting practice and engineering features

- An optional Graph & Loop Builder with graph validation, import/export, undo/redo, bounded loops, and human-review steps.
- A local workflow Evaluation Bench with editable datasets, per-case traces, deterministic match rules, cancellation, and local run history.
- Optional WebLLM inference in a browser worker; model assets may require substantial first-time downloads and compatible WebGPU hardware.
- An optional FastAPI/SQLite backend for explicitly managed prompt storage. It does not proxy a hosted LLM.
- CI checks for the local-first policy, TypeScript, unit tests, production build, Playwright journeys, and backend tests.

**Product direction:** the main goal is to become a professional learning site for prompt engineering. The task library, role-based paths, and first-party product guides now exist as first editions; the richer technique curriculum, deeper per-lesson practice, and the ongoing provider review cadence are still in progress—not claimed as complete. See the [learning-platform roadmap](docs/LEARNING_PLATFORM_ROADMAP.md).

## Frontend setup

Requirements: Node.js 22.12.0 or newer, or Node.js 20.19.x, plus npm.

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
- docs/ROADMAP.md — current product-roadmap entry point.
- docs/LEARNING_PLATFORM_ROADMAP.md — detailed learning-first strategy, competitor benchmark, curriculum, company-specific guides, content standards, UX, SEO, monetization, metrics, and phased exit gates.
- docs/ENGINEERING_ROADMAP.md — supporting technical milestones for the existing implementation; this does not supersede the learning-first product strategy.
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