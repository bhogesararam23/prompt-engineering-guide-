# Advanced Prompting and Workflow Builder — Product Specification

**Status:** Partially implemented; not yet release-ready  
**Last reviewed:** 2026-10-23  
**Scope:** Product behavior, content, architecture, milestones, and acceptance criteria. The first implementation is merged to main; use docs/ROADMAP.md and docs/RELEASE_CHECKLIST.md for implemented areas and remaining release gates.

## 1. Purpose

Expand Prompt Engineering Guide from a single-prompt workbench into a local-first environment for learning, designing, comparing, and running advanced prompt patterns.

The project should teach patterns inspired by current official guidance from OpenAI, Anthropic, and Google, while keeping the implementation provider-independent. It should also introduce a visual workflow editor for composing prompt steps, parallel branches, routing, merges, and carefully bounded feedback loops.

The application must remain useful without a loaded model or backend. Prompt writing, graph construction, structural checks, import/export, and supported deterministic nodes must not depend on external LLM services.

## 2. Terminology and attribution

Use these names as product terminology, not as claims that the vendors jointly named or released the exact feature:

- **Looped prompting:** a bounded iteration pattern that drafts, evaluates, and optionally refines an output until a stop condition is met or the iteration budget is exhausted. It is based on documented iterative refinement and self-correction practices.
- **Graph workflow prompting:** a visual workflow of prompt and non-prompt nodes connected by explicit data/control edges. It includes sequential chains, branching, parallel work, routing, validation gates, and aggregation.
- **Graph of Thoughts (GoT):** a distinct published research framework that represents reasoning units as a graph and supports combining or refining them. It is related conceptually, but it is not synonymous with a visual workflow editor. Treat GoT as an advanced learning module and optional future research direction, not as a feature already implemented by the proposed graph canvas.

Do not describe looped prompting or graph workflow prompting as exclusive inventions of OpenAI, Anthropic, or Google. Attribute individual practices to their documented sources and label the product synthesis clearly.

## 3. Research-backed technique map

### OpenAI-inspired practices

- Treat prompts as versioned application assets; make changes reviewable and testable.
- Use clear, scoped instructions and distinguish stable role guidance from task-specific input.
- Add representative fixtures and evaluation suites; measure behavior after changes rather than relying on a compelling example.
- Use an evaluation flywheel: analyze failure cases, measure the baseline, make a targeted change, then re-run the same evaluation cases.
- Model-specific recommendations should be surfaced as guidance cards and tagged with the source/model context. Do not turn a model-specific suggestion into a universal rule.
- The product must not require OpenAI APIs, SDKs, dashboard prompt objects, or credentials. These sources inform the handbook only.

Primary sources:
- OpenAI API prompting guide: https://developers.openai.com/api/docs/guides/prompting
- OpenAI prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
- OpenAI evaluation flywheel example: https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel

### Anthropic-inspired practices

- Use explicit sections and well-defined boundaries between instructions, context, examples, and user input; explain XML-tagged prompt structure as one useful option, not a universal requirement.
- Use prompt chaining when intermediate outputs should be inspected, validated, logged, or used to branch the workflow.
- Teach a self-correction pattern: draft → review against explicit criteria → refine → check again.
- Add deterministic gates where possible and keep success criteria explicit. Distinguish deterministic validation from subjective or model-based review.
- Teach routing and parallelization as workflow patterns; prefer simpler composable designs when they adequately solve the task.
- Do not require Anthropic APIs, SDKs, credentials, or hosted inference.

Primary sources:
- Claude prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- Anthropic, Building effective agents: https://www.anthropic.com/engineering/building-effective-agents

### Google-inspired practices

- Decompose complex tasks into smaller prompt components.
- Teach sequential prompt chaining where one step’s output feeds the next.
- Teach parallel aggregation where independent sub-tasks run separately and their outputs are combined.
- Encourage iteration against observed failures, trying different wording or an analogous task where appropriate.
- Clearly distinguish guidance for a particular model family from general principles; model-specific recommendations can change.
- Do not reintroduce Gemini libraries, Gemini endpoints, API-key fields, or a hosted-provider dependency into the application.

Primary source:
- Google AI for Developers, Prompt design strategies: https://ai.google.dev/gemini-api/docs/prompting-strategies

### Graph-structured reasoning research

- The AAAI paper Graph of Thoughts models generated information as graph vertices with dependencies represented as edges and discusses aggregation and feedback loops.
- The handbook may teach the concept and compare it to chains and trees, but must not imply that our initial editor implements the full research framework or reproduces published benchmark results.

Primary source:
- Besta et al., Graph of Thoughts: Solving Elaborate Problems with Large Language Models, AAAI 2024: https://ojs.aaai.org/index.php/AAAI/article/view/29720

## 4. Product areas to add

### 4.1 Advanced Techniques Library

Create a searchable catalog alongside the existing Learning Guide. Every technique card should include:

- Name and category.
- Plain-language explanation.
- When to use it and when not to use it.
- Required inputs and expected output.
- A small worked example.
- A diagram or step sequence where it clarifies the workflow.
- Failure modes, trade-offs, and safety considerations.
- Source links, authoring date, and relevant provider/model caveats.
- A button to open a starter template in Prompt Lab or a starter workflow in the Graph Builder.

Initial curriculum additions:

1. Prompt decomposition and chaining.
2. Iterative refinement and self-correction loops.
3. Evaluation flywheels and regression checks.
4. Graph workflows: routing, parallel work, conditional branches, and aggregation.
5. Structured prompts and explicit output contracts, including tagged sections.
6. Graph of Thoughts: what the research proposes and how it differs from ordinary workflow graphs.
7. Provider-aware prompting: what transfers between models and what must be tested on the chosen model.

Keep examples provider-neutral by default. Vendor labels should link to sources, not enable hidden provider calls.

### 4.2 Looped Prompt Builder

Provide an explicit visual and textual way to design a bounded feedback cycle. The starter pattern is:

~~~text
Input
  ↓
Draft prompt / local model call
  ↓
Evaluation gate
  ├── pass → Final output
  └── fail → Feedback / refinement step → Draft prompt
                  ↑                         |
                  └──── bounded iteration ──┘
~~~

Configuration:

- Draft prompt, reviewer/evaluator instructions, and refiner instructions are separate editable stages.
- Maximum iterations: default 3, user-configurable from 1 to 10.
- Stop conditions: deterministic checks pass, user stops, no further improvement is observed according to a selected and explicitly labeled evaluator, or the hard iteration limit is reached.
- Every run must expose attempt number, inputs, intermediate outputs, evaluation result, refinement feedback, and final stop reason.
- Provide “run one iteration,” “continue,” and “stop” controls. Do not hide the intermediate work.
- Allow a human approval gate before accepting the final result.
- On an exhausted budget or failed evaluator, show the best available output and the failed checks. Never report success merely because the loop ended.
- The UI must state that extra iterations increase latency and resource use and do not guarantee better answers.

Evaluation options should be clearly distinguished:
1. Deterministic rule/schema checks.
2. User-authored rubric with manual review.
3. Optional review by the currently loaded local model, labeled as model-based and potentially inconsistent.

A local-model critique is not an independent source of truth. Encourage a fixed evaluation set and human review for important use cases.

### 4.3 Graph Workflow Builder

Create a canvas for composing workflows visually. It should be possible to inspect and edit the same workflow as a readable outline and as versioned JSON. The canvas is a workflow editor; it is not, by itself, an implementation of Graph of Thoughts.

Initial node types:

| Node | Purpose | Local-first behavior |
|---|---|---|
| Input | Declare user-supplied or test-case input | Runs without a model |
| Prompt | Apply a structured prompt to input data | Requires the explicitly loaded local model for generation |
| Transform | Deterministic mapping, normalization, formatting, or slicing | Runs without a model |
| Validator / Gate | Check required fields, schema, length, fixed labels, or user-authored rules | Runs without a model when checks are deterministic |
| Router / Condition | Select an outgoing edge from a declared condition | Runs without a model only for supported deterministic predicates |
| Parallel branch | Run independent branches from the same input | Deterministic orchestration; each model-backed branch needs local inference |
| Merge / Aggregate | Combine branch outputs using a declared strategy | Runs without a model for supported strategies |
| Loop Controller | Own a feedback edge, iteration counter, and stop policy | Enforces iteration bounds even when a model is used |
| Human Review | Pause until the user approves, edits, rejects, or continues | Requires explicit user action |
| Output | Select and display the final value(s) | Runs without a model |

Initial non-goals: arbitrary JavaScript/Python execution in nodes, arbitrary HTTP requests from a workflow, hosted LLM calls, secrets stored in graph data, autonomous tool execution, hidden agents, or unbounded cycles.

### 4.4 Graph semantics and validation

Treat the graph as a typed workflow, not as decorative boxes connected by lines.

- Each node has a stable ID, node type, label, configuration, and canvas position.
- Each edge identifies a source node/port and target node/port. Conditional edges contain declarative predicates rather than executable code.
- Validate missing node IDs, duplicate IDs, missing required fields, invalid references, incompatible ports, unreachable nodes, unresolved branches, invalid output references, and unbounded cycles.
- For v1, the visible edge graph is always acyclic. Repeat/refine behavior is encapsulated inside a Loop Controller, which owns the iteration counter and enforces its finite maximum. Do not create visible cycle edges in the first release.
- Reject imported graphs that exceed documented size limits or violate schema rules.
- Show errors on the relevant nodes and edges and provide a plain-language explanation plus a proposed repair. Do not silently mutate an invalid graph.
- Support topological execution for acyclic portions, deterministic branch outcomes, merge rules, cancellation, and partial-run inspection.
- Define a predictable maximum node count, maximum edge count, maximum payload size, and execution timeout before the builder is released. These are product limits to be selected during implementation, not claims about current limits.

Example branching workflow:

~~~text
                     ┌→ Summarize ────┐
Input → Router ──────┤                 ├→ Merge → Validate → Output
                     └→ Extract fields ┘
~~~

### 4.5 Evaluation and run history

Reuse the existing Evaluation Bench instead of creating a separate disconnected evaluator.

Every workflow run should record:

- Workflow ID, version, and a snapshot of the exact graph configuration.
- Start/end time, run status, model/runtime ID if any, and whether inference was used.
- Node-by-node execution status and elapsed time.
- Inputs and outputs, subject to user-visible storage controls.
- Loop iteration count, stop condition, gate results, selected branches, and errors.
- Evaluation case IDs, scoring method, results, and whether a score came from a deterministic rule, a human, or a model-based reviewer.

Requirements:

- Compare two prompt/workflow versions against the same fixed dataset.
- Show per-case outcomes, aggregate metrics, and failed cases.
- Keep exact match for suitable classification tasks, but add task-specific metrics only when their definitions are clear and tested.
- Treat tiny starter datasets as smoke tests, not general proof of quality.
- Export/import datasets, workflow definitions, and run results using versioned JSON formats.
- Keep model version/configuration and evaluator version visible so comparisons are interpretable.
- Do not store prompt text, inputs, or run traces remotely unless a future explicit opt-in feature clearly describes what leaves the device.

## 5. Core user journeys

### Journey A — Learn a technique
1. Search or filter the Techniques Library.
2. Read the explanation, limitations, example, and source.
3. Open the associated Prompt Lab template or workflow.
4. Edit it and inspect structural validation.
5. Save a local version and optionally export it.

### Journey B — Build a loop
1. Start from a self-correction template.
2. Edit draft, review criteria, and refinement instructions independently.
3. Choose the iteration budget and stop policy.
4. Test deterministic checks without inference.
5. Explicitly load the optional local model to enable model-backed nodes.
6. Run one iteration at a time or the bounded loop; inspect every attempt.
7. Save the workflow and compare its outputs against a fixed evaluation set.

### Journey C — Build a graph
1. Create a workflow from a blank canvas or a starter pattern.
2. Add nodes and connect typed ports.
3. Configure routing conditions and merge behavior.
4. Run static validation and fix all blocking errors.
5. Execute a model-free preview for supported deterministic nodes.
6. If the graph includes prompt nodes, require the user to load the local model before executing those nodes.
7. Inspect node traces, export the workflow, and save a version.

### Journey D — Learn across vendors
1. Open the provider comparison section.
2. Compare each documented practice with source links and model-specific caveats.
3. Convert the principle into a provider-neutral prompt/workflow.
4. Test the pattern using the local model and a fixed dataset.
5. Keep results as observations, not a blanket claim that one provider’s technique always wins.

## 6. Architecture and data contracts

Keep the current React + TypeScript + Vite architecture. Add focused modules instead of growing the main App component into the entire workflow runtime.

Proposed modules (names are suggestions; adjust to the repo conventions during implementation):

- **src/data/techniques.ts** — sourced technique content.
- **src/lib/workflow/types.ts** — typed versioned workflow schema.
- **src/lib/workflow/validate.ts** — graph and node validation.
- **src/lib/workflow/graph.ts** — graph indexing, reachability, and ordering.
- **src/lib/workflow/runner.ts** — bounded execution and cancellation.
- **src/lib/workflow/persistence.ts** — local workflow storage and migration.
- **src/lib/workflow/serialization.ts** — validated JSON import/export.
- **src/lib/workflow/evaluation.ts** — adapters into the existing evaluation concepts.
- **src/components/workflow/** — canvas, node cards, edge creation, inspector, run trace, and accessible outline view.
- **src/lib/workflow/*.test.ts** — unit and adversarial import tests.

Initial schema sketch:

~~~json
{
  "schemaVersion": 1,
  "id": "workflow-id",
  "name": "Self-correction loop",
  "description": "Draft, validate, and refine within a fixed iteration budget.",
  "entryNodeId": "input-1",
  "nodes": [
    { "id": "input-1", "type": "input", "label": "Input", "position": { "x": 80, "y": 120 }, "config": {} }
  ],
  "edges": []
}
~~~

The sketch is illustrative. Implementation must define complete discriminated TypeScript types for every node and port. Do not accept arbitrary functions or executable expressions in JSON. Use schema versioning and explicit migrations for future changes.

### Integration boundaries

- Reuse localStorage-based patterns initially, with storage error handling and explicit export/backup. Consider IndexedDB only if real workflow size or trace volume justifies it.
- Reuse the existing local model adapter for explicit local inference; isolate the runner from WebLLM so validation and model-free workflows remain testable.
- Extend the existing evaluation data model deliberately. Avoid duplicate evaluation engines that disagree on scoring.
- Keep the optional FastAPI API out of the default execution path. No new server is required to use the technique library or workflow editor.
- Do not add graph/diagram dependencies until a short technical spike compares an accessible SVG/custom canvas against maintained libraries. Choose based on keyboard accessibility, bundle cost, interaction quality, license, and maintenance—not novelty.
- Keep model source/weight download disclosures intact. “Local inference” means prompts are processed in the browser after loading the model; it does not promise that first-time model acquisition is offline.

## 7. Safety, security, and privacy requirements

- Treat all user prompts, graph imports, datasets, retrieved documents, and model output as untrusted data.
- Never execute imported strings as code; no dynamic code execution, arbitrary plugin code, shell tools, or arbitrary external fetch nodes.
- Add size/count limits to workflow imports and run outputs. Handle malformed JSON and storage quota errors without losing existing data.
- Keep loop limits finite and enforced by the runner, not just validated in the UI.
- Cancellation must stop scheduling new nodes and stop/interupt supported local inference while preserving inspectable completed outputs.
- Do not grant model output authority to alter graph edges, bypass gates, create network requests, or invoke privileged actions.
- Explain that prompt delimiters and reviewer prompts do not replace application-level authorization or security controls.
- Add tests for malicious strings, malformed and oversized imports, duplicate IDs, unreachable nodes, missing references, unbounded cycles, loop-limit enforcement, cancellation, and partial-failure recovery.
- Preserve a clearly usable no-model path; never fabricate model output to make a demo appear functional.

## 8. UX and accessibility requirements

- Keep the visual language consistent with the current dark, responsive workspace.
- The canvas is not the only interaction method: provide an accessible outline/list view for adding nodes, editing settings, and changing connections.
- All controls must work with keyboard navigation, visible focus, sensible focus order, and appropriate accessible names.
- Avoid communicating node states by color alone. Use text and icon/shape cues for success, failure, skipped, running, and blocked nodes.
- Show empty, loading, unsupported-WebGPU, model-not-loaded, invalid-graph, run-failed, cancelled, and completed states.
- Warn before deleting nodes that have connected edges or data used by downstream nodes.
- Offer undo for graph edits and require confirmation for destructive workflow deletion.
- Keep controls usable at narrow mobile widths; if a large graph canvas is impractical on mobile, provide readable trace and outline views instead.
- Respect reduced-motion preferences and avoid animated edges as the only way to express execution progress.

## 9. Delivery roadmap

### A0 — Documentation and design freeze
- [x] Research official OpenAI, Anthropic, and Google prompting guidance.
- [x] Separate provider-documented patterns from the product’s own terminology.
- [x] Specify looped prompting, graph workflow semantics, privacy, evaluation, and acceptance criteria.
- [x] Review the terminology, architecture boundaries, and non-goals before implementation.
- [x] Confirm the implementation does not require hosted provider inference or a new mandatory backend.
- [ ] Re-review this specification against the implementation before release.

**Exit gate:** decisions, terminology, first-release scope, and non-goals are accepted.

### A1 — Techniques Library and content
- Add the seven curriculum modules listed above with source links and worked examples.
- Add metadata for categories, reading time, complexity, prerequisites, and technique tags.
- Link each technique to Prompt Lab templates or graph starters.
- Verify every provider-specific statement against a primary source and record a review date.

**Exit gate:** content is sourced, reviewed, searchable, and useful without a model.

### A2 — Workflow schema and static validator
- Define the typed schema and versioned JSON import/export.
- Implement graph indexing, port/reference validation, reachability, topological ordering, and bounded-cycle rules.
- Add tests before building the canvas UI.

**Exit gate:** malformed or unsafe graphs fail closed with clear diagnostics; valid sample graphs have deterministic validation results.

### A3 — Graph editor foundation
- Add the canvas and accessible outline editor.
- Add node palette, connection editing, node inspector, selection, deletion confirmation, and undo.
- Add starter examples for chain, fan-out/aggregate, routing, and loop patterns.
- Save and export workflows locally.

**Exit gate:** users can create, edit, validate, save, reload, and export a graph with no model and no backend.

### A4 — Local workflow runner and loop controller
- Run deterministic nodes first; require loaded local inference only for prompt nodes.
- Enforce finite iteration budgets, stop policies, explicit gate results, cancellation, and partial traces.
- Add the step-by-step loop controls and human-review pause.
- Add failure recovery tests and ensure no background execution persists after the user leaves.

**Exit gate:** bounded execution and cancellation tests pass; no-model workflows still work.

### A5 — Evaluation integration
- Reuse the existing evaluation bench and support saved workflow versions.
- Add per-case traces and loop/branch metrics.
- Add model-free tests first; local-model integration tests must be marked separately where hardware/WebGPU is required.

**Exit gate:** a user can compare workflow versions against the same dataset and explain exactly how metrics were computed.

### A6 — Hardening and release
- Accessibility review and mobile behavior review.
- Dependency/license review for any canvas package.
- Stress test graph and payload limits.
- Test on supported WebGPU desktop hardware, then document actual behavior and resource constraints.
- Test app-shell offline behavior separately from first-time model downloads.
- Update release checklist and CI with static checks, unit tests, build, API tests, and Playwright journeys.

**Exit gate:** all required CI jobs pass on the exact release commit and remaining hardware-specific limitations are documented.

## 10. Acceptance criteria for the first implementation

The first release of this addition is acceptable only when:

1. The Techniques Library has sourced entries for iterative refinement, prompt chaining, parallel aggregation, routing, evaluation loops, structured prompts, and Graph of Thoughts.
2. The product explicitly describes “looped prompting” and “graph workflow prompting” as product terminology rather than shared official vendor names.
3. A user can design a loop with a clear finite maximum and see every attempt plus the final stop reason.
4. A user can create, connect, validate, save, reload, and export a workflow graph.
5. Unbounded cycles, missing references, duplicate IDs, invalid ports, malformed imports, and over-limit inputs are rejected with useful errors.
6. Human review pauses the run until an explicit approve/reject decision; optional reviewer edits and the decision note are captured, and cancellation resolves the paused run.
7. Workflow evaluation compares fixed local cases with explicit match rules, stores workflow/dataset snapshots, exposes per-case outputs, and refuses unattended execution of human-review graphs.
8. Deterministic nodes execute without loading a model. Model-backed nodes do not run until the user explicitly loads the local model.
9. There are no hosted LLM API calls, API key fields, provider SDKs, background cloud sync, or new mandatory backend dependencies.
10. Workflow changes are covered by unit tests; major user journeys are covered by Playwright tests.
11. Evaluation labels make it clear whether results came from deterministic checks, a human, or a model-based reviewer.
12. The user can inspect and export run traces without needing a cloud account.

## 11. Reference list

Primary sources reviewed on 2026-10-23:

1. OpenAI, Prompting: https://developers.openai.com/api/docs/guides/prompting
2. OpenAI, Prompt engineering: https://developers.openai.com/api/docs/guides/prompt-engineering
3. OpenAI Cookbook, Building resilient prompts using an evaluation flywheel: https://developers.openai.com/cookbook/examples/evaluation/building_resilient_prompts_using_an_evaluation_flywheel
4. Anthropic, Claude prompting best practices: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
5. Anthropic, Building effective agents: https://www.anthropic.com/engineering/building-effective-agents
6. Google AI for Developers, Prompt design strategies: https://ai.google.dev/gemini-api/docs/prompting-strategies
7. Besta et al., Graph of Thoughts: Solving Elaborate Problems with Large Language Models, AAAI 2024: https://ojs.aaai.org/index.php/AAAI/article/view/29720

Provider documentation is living material. Re-check source pages before implementing model-specific advice or making current feature-availability claims.
