import { describe, expect, it } from "vitest";
import { techniqueCategories, techniques } from "./techniques";

describe("advanced techniques catalog", () => {
  it("has unique, non-empty IDs and meaningful guidance", () => {
    const ids = techniques.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const item of techniques) {
      expect(item.title.trim()).not.toBe("");
      expect(item.summary.length).toBeGreaterThan(40);
      expect(item.whenToUse.length).toBeGreaterThan(0);
      expect(item.tradeoffs.length).toBeGreaterThan(0);
      expect(item.steps.length).toBeGreaterThan(1);
      expect(item.example.trim()).not.toBe("");
    }
  });

  it("includes primary-source links for provider-informed techniques", () => {
    const urls = techniques.flatMap((item) => item.sources.map((source) => source.url));
    expect(urls.some((url) => url.includes("developers.openai.com"))).toBe(true);
    expect(urls.some((url) => url.includes("platform.claude.com") || url.includes("anthropic.com"))).toBe(true);
    expect(urls.some((url) => url.includes("ai.google.dev"))).toBe(true);
    expect(urls.some((url) => url.includes("ojs.aaai.org"))).toBe(true);
    for (const item of techniques) for (const source of item.sources) expect(source.url).toMatch(/^https:///);
  });

  it("distinguishes product graph workflows from Graph of Thoughts research", () => {
    const workflow = techniques.find((item) => item.id === "graph-workflow");
    const research = techniques.find((item) => item.id === "graph-of-thoughts");
    expect(workflow).toBeDefined();
    expect(research).toBeDefined();
    expect(workflow?.id).not.toBe(research?.id);
    expect(research?.summary).toContain("research framework");
  });

  it("derives filter categories and includes all", () => {
    expect(techniqueCategories[0]).toBe("All");
    expect(techniqueCategories).toContain("Iteration");
    expect(techniqueCategories).toContain("Graph reasoning");
  });
});
