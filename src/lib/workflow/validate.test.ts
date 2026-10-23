import { describe, expect, it } from "vitest";
import { createLinearWorkflow, createStarterWorkflow } from "./graph";
import { validateWorkflow, workflowHasErrors } from "./validate";

describe("workflow validation", () => {
  it("accepts the starter graph and reports no errors", () => {
    const issues = validateWorkflow(createStarterWorkflow());
    expect(workflowHasErrors(issues)).toBe(false);
  });

  it("rejects duplicate nodes and missing edge references", () => {
    const graph = createLinearWorkflow(["input", "output"], "broken");
    graph.nodes.push({ ...graph.nodes[0], label: "duplicate" });
    graph.edges.push({ id: "bad-edge", from: "missing", to: "output-2" });
    const issues = validateWorkflow(graph);
    expect(issues.some((item) => item.code === "duplicate-node-id")).toBe(true);
    expect(issues.some((item) => item.code === "missing-edge-source")).toBe(true);
  });

  it("rejects a cyclic visible graph and explains the bounded-loop alternative", () => {
    const graph = createLinearWorkflow(["input", "transform", "output"], "cycle");
    graph.edges.push({ id: "back-edge", from: "output-3", to: "transform-2" });
    const cycle = validateWorkflow(graph).find((item) => item.code === "cycle-detected");
    expect(cycle?.message).toContain("Loop Controller");
  });

  it("rejects invalid loop budgets and invalid route ports", () => {
    const graph = createLinearWorkflow(["input", "loop", "output"], "loop");
    const loop = graph.nodes.find((node) => node.type === "loop");
    if (loop?.type === "loop") loop.config.maxIterations = 500;
    graph.edges[1].fromPort = "unexpected";
    const issues = validateWorkflow(graph);
    expect(issues.some((item) => item.code === "invalid-node-config")).toBe(true);
    expect(issues.some((item) => item.code === "invalid-edge-port")).toBe(true);
  });

  it("caps workflow size", () => {
    const graph = createLinearWorkflow(["input", "output"], "many");
    graph.nodes = Array.from({ length: 101 }, (_, index) => ({ id: "n-" + index, type: "transform" as const, label: "T", position: { x: 1, y: 1 }, config: { operation: "trim" as const } }));
    graph.edges = [];
    const issues = validateWorkflow(graph);
    expect(issues.some((item) => item.code === "node-limit")).toBe(true);
  });
});
