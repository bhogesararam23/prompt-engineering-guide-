import { beforeEach, describe, expect, it, vi } from "vitest";
import { createStarterWorkflow } from "./graph";
import { readWorkflowRuns, readWorkflows, writeWorkflowRuns, writeWorkflows } from "./persistence";

function makeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    setRaw(key: string, value: string) { values.set(key, value); }
  };
}

describe("workflow local persistence", () => {
  let storage: ReturnType<typeof makeStorage>;
  beforeEach(() => {
    storage = makeStorage();
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });
  });

  it("round-trips a validated workflow", () => {
    const graph = createStarterWorkflow();
    expect(writeWorkflows([graph])).toBe(true);
    expect(readWorkflows()).toEqual([graph]);
  });

  it("drops malformed stored workflow records instead of returning them", () => {
    storage.setRaw("peg:workflows:v1", JSON.stringify([{ schemaVersion: 99, nodes: "not-an-array" }]));
    expect(readWorkflows()).toEqual([]);
  });

  it("round-trips a bounded workflow run history", () => {
    const run = {
      id: "run-1", workflowId: "graph-1", workflowName: "Example",
      startedAt: "2026-10-23T00:00:00.000Z", finishedAt: "2026-10-23T00:00:01.000Z",
      status: "success" as const, output: "done", errors: [],
      nodeRuns: [{ nodeId: "output-1", status: "success" as const, input: "done", output: "done", durationMs: 1 }]
    };
    expect(writeWorkflowRuns([run])).toBe(true);
    expect(readWorkflowRuns()).toEqual([run]);
  });

  it("does not trust a corrupted run log", () => {
    storage.setRaw("peg:workflow-runs:v1", "{broken json");
    expect(readWorkflowRuns()).toEqual([]);
  });

  it("refuses to store an excessive trace snapshot", () => {
    const run = {
      id: "run-big", workflowId: "graph-1", workflowName: "Example",
      startedAt: "2026-10-23T00:00:00.000Z", finishedAt: "2026-10-23T00:00:01.000Z",
      status: "success" as const, output: "x".repeat(600_000), errors: [], nodeRuns: []
    };
    expect(writeWorkflowRuns([run])).toBe(false);
  });
});
