import { describe, expect, it } from "vitest";
import { buildPrompt, countWords, emptyDraft, validatePrompt } from "./prompts";

describe("prompt construction", () => {
  it("includes only non-empty sections in a stable order", () => {
    expect(buildPrompt({ ...emptyDraft, role: "A reviewer", instruction: "Review this code", input: "print(1)" }))
      .toBe("Role:\nA reviewer\n\nTask:\nReview this code\n\nInput:\nprint(1)");
  });

  it("trims field boundaries without modifying internal content", () => {
    expect(buildPrompt({ ...emptyDraft, instruction: "  Summarize this  ", context: "  Audience: engineer  " }))
      .toBe("Task:\nSummarize this\n\nContext:\nAudience: engineer");
  });

  it("requires an instruction and provides actionable warnings", () => {
    const result = validatePrompt(emptyDraft);
    expect(result.errors).toHaveLength(1);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("warns when input may contain a credential", () => {
    const result = validatePrompt({ ...emptyDraft, instruction: "Summarize the configuration file", input: "api_key=example-secret" });
    expect(result.warnings.some((item) => item.toLowerCase().includes("credential"))).toBe(true);
  });

  it("counts words for empty and non-empty inputs", () => {
    expect(countWords("  ")).toBe(0);
    expect(countWords("one two\nthree")).toBe(3);
  });
});