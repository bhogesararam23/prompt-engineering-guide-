import { describe, expect, it } from "vitest";
import { buildPrompt, countWords, emptyDraft, mergeImportedPrompts, parsePromptExport, validatePrompt, type SavedPrompt } from "./prompts";

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

  it("checks all prompt fields for likely credential material", () => {
    const result = validatePrompt({ ...emptyDraft, instruction: "Summarize this file carefully", context: "API_KEY: do-not-share" });
    expect(result.warnings.some((item) => item.toLowerCase().includes("credential"))).toBe(true);
  });

  it("validates prompt export JSON and enforces import limits", () => {
    const one: SavedPrompt = { id: "one", title: "A prompt", content: "Task: summarize", createdAt: "2026-10-23T00:00:00Z" };
    expect(parsePromptExport(JSON.stringify({ prompts: [one] }))).toEqual([one]);
    expect(() => parsePromptExport("not JSON")).toThrow(/valid JSON/);
    expect(() => parsePromptExport(JSON.stringify({ prompts: [{ ...one, title: "" }] }))).toThrow(/invalid prompt record/);
    expect(() => parsePromptExport(JSON.stringify({ prompts: Array.from({ length: 1001 }, (_, i) => ({ ...one, id: String(i) })) }))).toThrow(/at most 1,000/);
  });

  it("rekeys conflicts and duplicate IDs within imported prompts", () => {
    const existing: SavedPrompt[] = [{ id: "same", title: "Current", content: "current", createdAt: "2026-01-01" }];
    const incoming: SavedPrompt[] = [
      { id: "same", title: "Imported A", content: "a", createdAt: "2026-01-02" },
      { id: "same", title: "Imported B", content: "b", createdAt: "2026-01-03" }
    ];
    const merged = mergeImportedPrompts(existing, incoming);
    expect(merged).toHaveLength(3);
    expect(new Set(merged.map((item) => item.id)).size).toBe(3);
    expect(merged[2]).toEqual(existing[0]);
  });

  it("counts words for empty and non-empty inputs", () => {
    expect(countWords("  ")).toBe(0);
    expect(countWords("one two\nthree")).toBe(3);
  });
});