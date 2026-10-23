import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isExactMatch,
  readEvaluationCases,
  exportEvaluationDataset,
  parseEvaluationDataset,
  readEvaluationRuns,
  starterEvaluationCases,
  summarizeEvaluation,
  writeEvaluationCases,
  writeEvaluationRuns
} from "./evaluation";

function makeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    setRaw(key: string, value: string) { values.set(key, value); }
  };
}

describe("local prompt evaluation", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: makeStorage() });
  });

  it("normalizes case, whitespace, and trailing punctuation for exact matches", () => {
    expect(isExactMatch("Positive", " positive. ")).toBe(true);
    expect(isExactMatch("positive", "positive because it worked")).toBe(false);
    expect(isExactMatch("", "")).toBe(false);
  });

  it("computes accuracy only for cases with expected and actual values", () => {
    const cases = [
      { ...starterEvaluationCases[0], actual: "Positive." },
      { ...starterEvaluationCases[1], actual: "neutral" },
      { ...starterEvaluationCases[2], actual: "" },
      { ...starterEvaluationCases[0], id: "missing-expected", expected: "", actual: "positive" }
    ];
    const result = summarizeEvaluation(cases, { promptTitle: "Sentiment", modelId: "local-test", id: "run-1", createdAt: "2026-10-23T00:00:00Z" });
    expect(result).toMatchObject({ total: 4, completed: 2, matched: 1, exactMatchRate: 0.5, promptTitle: "Sentiment" });
  });

  it("exports and validates portable evaluation datasets", () => {
    const cases = [{ ...starterEvaluationCases[0], actual: "positive" }];
    expect(parseEvaluationDataset(exportEvaluationDataset(cases))).toEqual(cases);
    expect(() => parseEvaluationDataset("not-json")).toThrow(/valid JSON/);
    expect(() => parseEvaluationDataset(JSON.stringify({ cases: [{ id: "bad" }] }))).toThrow(/string id/);
    expect(() => parseEvaluationDataset(JSON.stringify({ cases: [{ id: "x", name: "A", input: "a", expected: "b", actual: "" }, { id: "x", name: "B", input: "c", expected: "d", actual: "" }] }))).toThrow(/unique ID/);
  });

  it("loads starter cases when there is no saved dataset", () => {
    expect(readEvaluationCases()).toHaveLength(starterEvaluationCases.length);
  });

  it("persists cases and recent run metadata locally", () => {
    const cases = [{ ...starterEvaluationCases[0], actual: "positive" }];
    const run = summarizeEvaluation(cases, { promptTitle: "Starter test", modelId: "Llama local", id: "run-2" });
    expect(writeEvaluationCases(cases)).toBe(true);
    expect(readEvaluationCases()).toEqual(cases);
    expect(writeEvaluationRuns([run])).toBe(true);
    expect(readEvaluationRuns()).toEqual([run]);
  });
});
