import { describe, expect, it, vi } from "vitest";
import { createLinearWorkflow, createStarterWorkflow } from "./graph";
import { runWorkflow } from "./runner";
import type { WorkflowDefinition } from "./types";

describe("workflow runtime", () => {
  it("runs a model-free input-transform-output workflow", async () => {
    const graph = createLinearWorkflow(["input", "transform", "output"], "uppercase");
    const transform = graph.nodes.find((node) => node.type === "transform");
    if (transform?.type === "transform") transform.config.operation = "uppercase";
    const result = await runWorkflow(graph, { inputs: { input: "hello graph" } });
    expect(result.status).toBe("success");
    expect(result.output).toBe("HELLO GRAPH");
    expect(result.nodeRuns.every((node) => node.status === "success")).toBe(true);
  });

  it("only executes the selected router branch", async () => {
    const graph = createStarterWorkflow();
    const result = await runWorkflow(graph, { inputs: { input: "summary please" } });
    expect(result.status).toBe("success");
    expect(result.output).toBe("summary please");
    expect(result.nodeRuns.find((node) => node.nodeId === "transform-1")?.status).toBe("success");
  });

  it("requires an explicit local generator for prompt nodes", async () => {
    const graph = createLinearWorkflow(["input", "prompt", "output"], "needs local model");
    const result = await runWorkflow(graph, { inputs: { input: "hello" } });
    expect(result.status).toBe("failed");
    expect(result.errors.join(" ")).toContain("local inference");
  });

  it("bounds loop attempts and records each deterministic check", async () => {
    const graph = createLinearWorkflow(["input", "loop", "output"], "bounded loop");
    const loop = graph.nodes.find((node) => node.type === "loop");
    if (loop?.type === "loop") {
      loop.config.maxIterations = 3;
      loop.config.evaluator = "contains";
      loop.config.expectedValue = "DONE";
    }
    const generate = vi.fn(async (prompt: string) => prompt.startsWith("Create") ? "draft" : "revised");
    const result = await runWorkflow(graph, { inputs: { input: "source" }, generate });
    expect(result.status).toBe("failed");
    expect(result.errors.join(" ")).toContain("without passing the deterministic acceptance check");
    expect(result.nodeRuns.find((node) => node.nodeId === loop?.id)?.iterations).toHaveLength(3);
    expect(result.nodeRuns.find((node) => node.nodeId === loop?.id)?.selectedPort).toBe("limit");
    expect(result.nodeRuns.find((node) => node.nodeId === loop?.id)?.iterations?.[0].feedback).toContain("Reviewer feedback:");
    expect(generate).toHaveBeenCalledTimes(5);
  });

  it("stops promptly on cancellation", async () => {
    const graph = createLinearWorkflow(["input", "prompt", "output"], "cancelled");
    const controller = new AbortController();
    const generate = vi.fn(async () => { controller.abort(); return "done"; });
    const result = await runWorkflow(graph, { inputs: { input: "x" }, generate, signal: controller.signal });
    expect(result.status).toBe("cancelled");
  });

  it("records a callback after each node settles", async () => {
    const graph: WorkflowDefinition = createLinearWorkflow(["input", "transform", "output"], "trace");
    const onNodeRun = vi.fn();
    await runWorkflow(graph, { inputs: { input: "text" }, onNodeRun });
    expect(onNodeRun).toHaveBeenCalledTimes(3);
  });
});
