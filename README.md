# Prompt Engineering Guide

**Learn to get better results from AI—across tasks, professions, and models.**

Prompt Engineering Guide is a learning-first website for people who want to use AI more effectively. It teaches prompting in plain language, from the fundamentals to advanced practice, and explains what changes between AI products instead of pretending one formula works everywhere.

The goal is to become a trusted place to **learn prompting, practise it, and choose the right approach for the AI tool and task at hand**. It is a learning platform—not a chatbot, prompt marketplace, or directory of shallow prompt templates.

## What learners should be able to do

- Turn a vague request into a clear, useful prompt.
- Add context, examples, constraints, and output formats when they help.
- Diagnose weak or incorrect results and improve the prompt systematically.
- Verify important claims and recognize when prompting cannot solve the underlying problem.
- Apply prompting to everyday work, study, writing, research, analysis, coding, and other professional tasks.
- Understand which principles transfer across models and which advice is product-specific.
- Use AI more safely, including protecting private or confidential information.

## Learning across AI products

The long-term curriculum will cover major AI assistants, model families, and relevant tools across regions and ecosystems—not only US providers. Planned coverage includes:

- **OpenAI:** ChatGPT and relevant API/model guidance.
- **Anthropic:** Claude.
- **Google:** Gemini.
- **Microsoft:** Copilot.
- **Search and research:** Perplexity and other relevant research tools.
- **Chinese AI ecosystems:** for example DeepSeek, Qwen/Alibaba, Kimi/Moonshot, GLM/Zhipu, MiniMax, ERNIE/Baidu, and Tencent Hunyuan.
- **Other model families and platforms:** for example Mistral, Meta Llama, xAI Grok, Amazon Nova, open-weight/local models, and relevant coding, image, audio, and video tools.

This is a **coverage direction, not a claim that every guide is already published**. Product-specific advice must be supported by current first-party documentation where possible, carry a last-verified date, and clearly state version, plan, or regional caveats. Guides will be prioritised by learner value and maintainability rather than by the number of logos or pages.

## Current learning experience

- Eight source-linked learning modules with outcomes, prerequisites, related lessons, and next steps.
- A curated task finder that routes common jobs to relevant lessons.
- Beginner, Everyday Work, and Advanced/Technical learning routes.
- Shareable lesson URLs, section navigation, and browser-local completion progress.
- Deterministic knowledge checks, bookmarks, and a local learning-progress overview.
- A technique library with sourced technique cards and practical examples.
- A browser-local Prompt Lab, reusable templates, a prompt library, and prompt-version comparisons.
- Optional advanced workflow-building, evaluation, and local-model experiments.

**Important:** The current experience is an evolving foundation. The full task library, role-based curriculum, and maintained cross-provider guides are planned work—not features we claim are complete. See the [learning-platform roadmap](docs/LEARNING_PLATFORM_ROADMAP.md).

## Product principles

1. **Beginner-friendly by default.** Teach the idea before introducing jargon or code.
2. **Task before technique.** Start with what the learner is trying to do, then explain a suitable approach.
3. **Transferable foundations first.** Teach general principles before provider-specific exceptions.
4. **Evidence over hype.** Link sources, date changing claims, and separate documented facts from editorial advice.
5. **Learn by doing.** Use weak/better examples, practice, and clear rubrics—not just long articles.
6. **Honest evaluation.** Deterministic checks are not presented as model judgments; examples do not prove universal performance gains.
7. **Quality before page count.** No mass-generated, near-duplicate pages made only to attract search traffic.
8. **Local-first where practical.** Reading and core practice should not require an account, API key, or hosted model call.
9. **Trust and safety.** Explain limitations, source quality, privacy, and the need for human review.

## Development setup

Requirements: Node.js 22.12.0 or newer, or Node.js 20.19.x, plus npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, normally http://localhost:5173.

Run the main quality gates before proposing a change:

```sh
npm run check:local-first
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

## Optional local model

The local playground can use WebLLM in a browser worker. Loading a model may download substantial runtime assets and model weights and requires compatible WebGPU support and sufficient device resources. Model quality and performance vary. The learning site must remain useful when local inference is unavailable.

## Optional API

The FastAPI/SQLite service supports explicitly managed prompt storage and deterministic validation; it does not proxy a hosted LLM. See [backend documentation](docs/BACKEND.md). The current API is not a production multi-user service: keep it on localhost unless proper authentication, deployment security, and a threat-model review are completed.

## Documentation

- [Learning Platform Roadmap](docs/LEARNING_PLATFORM_ROADMAP.md) — product strategy, audience, curriculum, provider guides, content standards, discovery, metrics, and phased exit gates.
- [Roadmap](docs/ROADMAP.md) — current priorities and next implementation steps.
- [Architecture](docs/ARCHITECTURE.md) — application boundaries and data flow.
- [Backend](docs/BACKEND.md) — optional API setup and behavior.
- [Engineering Roadmap](docs/ENGINEERING_ROADMAP.md) — supporting technical milestones.
- [Advanced Prompting Specification](docs/ADVANCED_PROMPTING_SPEC.md) — advanced techniques and workflow semantics.
- [Release Checklist](docs/RELEASE_CHECKLIST.md) — release-readiness gates.
- [Security](SECURITY.md) — data handling and security expectations.
- [Contributing](CONTRIBUTING.md) — development and contribution workflow.

## Licensing and release readiness

No project license has been selected in this rebuild. Until a `LICENSE` file is added by the maintainer, do not assume public visibility grants permission to redistribute or reuse the code. The release checklist tracks outstanding launch, security, and quality gates.

## Current scope boundaries

The frontend and optional API are separate capabilities. Browser-saved prompts and API-saved prompts are not automatically synchronised. Accounts, multi-user administration, automatic cloud sync, a content management system, and a fully maintained guide for every AI product are not currently complete. Add these only when a validated requirement and an appropriate privacy/security plan justify them.
