# Contributing

## Development environment

- Recommended runtime: Node.js 22.12.0 or newer, matching `.nvmrc`.
- Compatibility runtime: Node.js 20.19.x is also allowed by `package.json`; Node.js 21.x and Node.js 22.0–22.11 are outside the declared engine range.
- Install frontend dependencies with `npm install`.
- Optional API tests require Python 3.11 or newer; CI currently runs Python 3.12.

## Validate a frontend change

Run the checks relevant to the change before opening a pull request:

~~~sh
npm run check:local-first
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
~~~

The Playwright tests run against the production preview build. They may download the Chromium browser the first time. In CI, the workflow uses the matching Playwright container image.

## Validate a backend change

~~~sh
python -m pip install -r backend/requirements.txt
python -m pytest backend/tests
~~~

## Pull request expectations

- Keep changes focused and explain the problem they solve.
- Add tests for prompt logic, persistence validation, workflow execution, and API behavior when relevant.
- Make educational content actionable and caveat heuristics.
- Do not claim model quality or performance improvements without a reproducible evaluation.
- Never add a hosted LLM endpoint or credential to the browser bundle.
- Preserve the path that works without a model or backend.
- Update documentation when runtime behavior, setup, security boundaries, or commands change.
- Avoid unrelated formatting churn and do not add generated build output, local databases, model weights, or test artifacts.

## Content standards

Prefer precise definitions, checkable examples, explicit limitations, and primary sources. Distinguish established findings from heuristics and state when examples are illustrative rather than benchmarked.
