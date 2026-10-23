import { describe, expect, it, vi } from "vitest";
import { createLinearWorkflow, createStarterWorkflow } from "./graph";
import { runWorkflow, type HumanReviewRequest } from "./runner";
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
    expect(result.nodeRuns.find((node) => node.nodeId === "prompt-2")?.status).toBe("cancelled");
  });

  it("pauses for a human decision and records an approved edit", async () => {
    const graph = createLinearWorkflow(["input", "human-review", "output"], "human approval");
    const review = vi.fn(async (request: HumanReviewRequest) => {
      expect(request.input).toBe("draft output");
      expect(request.allowEdit).toBe(true);
      return { approved: true, output: "reviewed output", feedback: "Checked the required fields." };
    });
    const result = await runWorkflow(graph, { inputs: { input: "draft output" }, review });
    expect(result.status).toBe("success");
    expect(result.output).toBe("reviewed output");
    const reviewRun = result.nodeRuns.find((node) => node.nodeId.includes("human-review"));
    expect(reviewRun?.selectedPort).toBe("approve");
    expect(reviewRun?.review).toEqual({ decision: "approve", note: "Checked the required fields." });
    expect(review).toHaveBeenCalledTimes(1);
  });

  it("routes rejected human review through the reject edge", async () => {
    const graph = createLinearWorkflow(["input", "human-review", "output"], "rejected draft");
    const result = await runWorkflow(graph, {
      inputs: { input: "unapproved content" },
      review: async () => ({ approved: false, feedback: "Missing source evidence." })
    });
    expect(result.status).toBe("success");
    expect(result.output).toBe("unapproved content");
    expect(result.nodeRuns.find((node) => node.nodeId.includes("human-review"))?.selectedPort).toBe("reject");
  });

  it("fails clearly if an interactive workflow has no human-review handler", async () => {
    const graph = createLinearWorkflow(["input", "human-review", "output"], "missing reviewer");
    const result = await runWorkflow(graph, { inputs: { input: "content" } });
    expect(result.status).toBe("failed");
    expect(result.errors.join(" ")).toContain("no review handler");
  });

  it("runs independent prompt branches concurrently when the generator opts into concurrency and merges in edge order", async () => {
    const graph = createLinearWorkflow(["input", "prompt", "prompt", "merge", "output"], "parallel branches");
    const firstPrompt = graph.nodes.find((node) => node.id === "prompt-2");
    const secondPrompt = graph.nodes.find((node) => node.id === "prompt-3");
    if (firstPrompt?.type !== "prompt" || secondPrompt?.type !== "prompt") throw new Error("Expected two prompt nodes.");
    firstPrompt.config.template = "branch A {{input}}";
    secondPrompt.config.template = "branch B {{input}}";
    graph.edges = [
      { id: "edge-a", from: "input-1", to: "prompt-2" },
      { id: "edge-b", from: "input-1", to: "prompt-3" },
      { id: "edge-c", from: "prompt-2", to: "merge-4" },
      { id: "edge-d", from: "prompt-3", to: "merge-4" },
      { id: "edge-e", from: "merge-4", to: "output-5" }
    ];

    let active = 0;
    let peakConcurrency = 0;
    const generate = vi.fn(async (prompt: string) => {
      active += 1;
      peakConcurrency = Math.max(peakConcurrency, active);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active -= 1;
      return prompt.startsWith("branch A") ? "A result" : "B result";
    });

    const result = await runWorkflow(graph, {
      inputs: { input: "question" },
      generate,
      serializeGenerate: false
    });

    expect(result.status).toBe("success");
    expect(peakConcurrency).toBe(2);
    expect(result.output).toBe("A result\\n\\nB result");
    expect(result.nodeRuns.find((node) => node.nodeId === "merge-4")?.output).toBe("A result\\n\\nB result");
  });

  it("serializes concurrent generator requests by default for single-worker local models", async () => {
    const graph = createLinearWorkflow(["input", "prompt", "prompt", "merge", "output"], "safe model branches");
    const firstPrompt = graph.nodes.find((node) => node.id === "prompt-2");
    const secondPrompt = graph.nodes.find((node) => node.id === "prompt-3");
    if (firstPrompt?.type === "prompt") firstPrompt.config.template = "branch A {{input}}";
    if (secondPrompt?.type === "prompt") secondPrompt.config.template = "branch B {{input}}";
    graph.edges = [
      { id: "edge-a", from: "input-1", to: "prompt-2" },
      { id: "edge-b", from: "input-1", to: "prompt-3" },
      { id: "edge-c", from: "prompt-2", to: "merge-4" },
      { id: "edge-d", from: "prompt-3", to: "merge-4" },
      { id: "edge-e", from: "merge-4", to: "output-5" }
    ];

    let active = 0;
    let peakConcurrency = 0;
    const generate = vi.fn(async (prompt: string) => {
      active += 1;
      peakConcurrency = Math.max(peakConcurrency, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return prompt.startsWith("branch A") ? "A result" : "B result";
    });

    const result = await runWorkflow(graph, { inputs: { input: "question" }, generate });

    expect(result.status).toBe("success");
    expect(peakConcurrency).toBe(1);
    expect(result.output).toBe("A result\\n\\nB result");
  });

  it("records a callback after each node settles", async () => {
    const graph: WorkflowDefinition = createLinearWorkflow(["input", "transform", "output"], "trace");
    const onNodeRun = vi.fn();
    await runWorkflow(graph, { inputs: { input: "text" }, onNodeRun });
    expect(onNodeRun).toHaveBeenCalledTimes(3);
  });
});
