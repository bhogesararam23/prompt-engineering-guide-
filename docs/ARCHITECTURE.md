# Architecture

## Runtime boundaries

- Web client: React, TypeScript, and Vite.
- Guide content: typed data separated from page presentation.
- Prompt core: deterministic assembly, validation, template definitions, and word/character counts.
- Browser persistence: local storage with explicit JSON export/import.
- Local inference: optional WebLLM adapter; the rest of the app does not depend on model loading.
- Optional HTTP API: FastAPI and SQLite for a server-side prompt library. The API has no LLM client or hosted inference route.

## Workflow execution semantics

The workflow runner validates the versioned graph before execution, then schedules reachable nodes by dependency frontier. A node is eligible only after every reachable predecessor has settled, so a merge cannot run before all of its input paths have either produced a result or been marked skipped/failed. Independent nodes in a frontier are dispatched concurrently.

Run traces and merge inputs are reported in stable workflow/topological and edge order, not promise-completion order. Unselected conditional paths are recorded as skipped; only successful incoming edges whose source port was selected provide input to a node. Node failures do not erase completed sibling results, but are included in the final run status and ordered error list.

The default runner serializes calls to the supplied generation callback and human-review callback. This is intentional: the current browser model adapter owns one shared worker, and the workflow UI owns one active human-review dialog. A caller may explicitly disable either serialization only when its injected handler is safe for concurrent requests. The UI uses the safe defaults. Cancellation stops scheduling new frontiers, preserves completed traces, and closes a pending human-review gate through its abort signal.

## Data flow

Prompt Lab fields are assembled by deterministic application code. Validation returns structural errors and warnings; it does not grade semantic quality. A user must explicitly load the local model before generation is available. On-device inference is isolated in src/lib/local-model.ts.

Browser-saved prompts and API-saved prompts are separate stores in this version. Cross-device synchronization is not implemented, and the UI must remain functional when the API or model is unavailable.

## Trust boundaries

1. Treat prompt text, imported JSON, and retrieved documents as untrusted data; never execute them.
2. Browser storage is not encrypted and is not a secure vault.
3. Initial model acquisition may contact the configured model source. This is separate from inference requests and should be disclosed.
4. The frontend must not contain secrets.
5. API SQL statements use parameters. Input lengths are bounded by Pydantic schemas and database constraints.
6. The backend currently has no authentication. Keep it on localhost unless an authentication and threat-model review is completed.

## Future decisions

Only add accounts, cloud sync, database migrations, content administration, or evaluation workers when a concrete requirement exists. Avoid microservices until there is an operational reason. Any analytics or network integrations require explicit purpose and clear user disclosure.
