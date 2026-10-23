import { describe, expect, it } from "vitest";
import { createStarterWorkflow } from "./graph";
import { parseWorkflow, serializeWorkflow } from "./serialization";

describe("workflow serialization", () => {
  it("round-trips a valid workflow", () => {
    const graph = createStarterWorkflow();
    expect(parseWorkflow(serializeWorkflow(graph))).toEqual(graph);
  });

  it("rejects malformed JSON and invalid graph references", () => {
    expect(() => parseWorkflow("{oops")).toThrow(/valid JSON/);
    const graph = createStarterWorkflow();
    graph.edges[0].to = "missing-node";
    expect(() => parseWorkflow(JSON.stringify(graph))).toThrow(/missing target node/);
  });

  it("rejects oversized workflow input before parsing", () => {
    expect(() => parseWorkflow(" ".repeat(1_000_001))).toThrow(/character limit/);
  });
});
