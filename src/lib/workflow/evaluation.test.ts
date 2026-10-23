import { describe, expect, it } from "vitest";
import { createLinearWorkflow, createStarterWorkflow } from "./graph";
import {
  evaluateWorkflow,
  exportWorkflowEvaluationDataset,
  parseWorkflowEvaluationDataset,
  starterWorkflowEvaluationCases
} from "./evaluation";

describe("workflow evaluation", () => {
  it("evaluates a branching starter graph against fixed examples", async () => {
    const result = await evaluateWorkflow(createStarterWorkflow(), starterWorkflowEvaluationCases);
    expect(result.status).toBe("completed");
    expect(result.total).toBe(3);
    expect(result.completed).toBe(3);
    expect(result.matched).toBe(3);
    expect(result.accuracy).toBe(1);
    expect(result.workflowSnapshot.edges).toHaveLength(5);
    expect(result.cases.every((item) => item.execution === "success" && item.matched)).toBe(true);
  });

  it("counts mismatches without disguising them as execution failures", async () => {
    const graph = createLinearWorkflow(["input", "transform", "output"], "uppercase test");
    const transform = graph.nodes.find((node) => node.type === "transform");
    if (transform?.type === "transform") transform.config.operation = "uppercase";
    const result = await evaluateWorkflow(graph, [{
      id: "case-1", name: "Incorrect expected output", input: "lower", expected: "completely different", matchRule: "exact"
    }]);
    expect(result.status).toBe("completed");
    expect(result.cases[0].execution).toBe("success");
    expect(result.cases[0].matched).toBe(false);
    expect(result.accuracy).toBe(0);
  });

  it("records execution errors as failed cases", async () => {
    const graph = createLinearWorkflow(["input", "prompt", "output"], "needs model");
    const result = await evaluateWorkflow(graph, [{
      id: "case-1", name: "Model unavailable", input: "hello", expected: "hello", matchRule: "exact"
    }]);
    expect(result.cases[0].execution).toBe("failed");
    expect(result.cases[0].matched).toBe(false);
    expect(result.cases[0].errors.join(" ")).toContain("local inference");
  });

  it("rejects unattended evaluation of human-review workflows", async () => {
    const graph = createLinearWorkflow(["input", "human-review", "output"], "manual approval");
    await expect(evaluateWorkflow(graph, starterWorkflowEvaluationCases)).rejects.toThrow(/cannot be evaluated unattended/);
  });

  it("round-trips portable versioned workflow datasets", () => {
    const exported = exportWorkflowEvaluationDataset(starterWorkflowEvaluationCases);
    expect(parseWorkflowEvaluationDataset(exported)).toEqual(starterWorkflowEvaluationCases);
  });

  it("rejects duplicate IDs, unsupported schemas, and oversized imports", () => {
    const duplicate = { kind: "prompt-engineering-guide-workflow-evaluation", schemaVersion: 1, cases: [
      starterWorkflowEvaluationCases[0], { ...starterWorkflowEvaluationCases[0], name: "Duplicate ID" }
    ] };
    expect(() => parseWorkflowEvaluationDataset(JSON.stringify(duplicate))).toThrow(/unique/);
    expect(() => parseWorkflowEvaluationDataset(JSON.stringify({ kind: "wrong", schemaVersion: 1, cases: [] }))).toThrow(/not a version-1/);
    expect(() => parseWorkflowEvaluationDataset(" ".repeat(1_000_001))).toThrow(/one-million-character/);
  });
});
