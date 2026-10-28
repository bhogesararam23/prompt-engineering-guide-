import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { findProductGuide, isReviewDue, productGuides, validateProductGuides } from "./product-guides";

describe("AI product guides", () => {
  it("keeps every guide sourced, dated, and linked to published lessons", () => {
    expect(productGuides.length).toBeGreaterThanOrEqual(15);
    expect(new Set(productGuides.map((guide) => guide.id)).size).toBe(productGuides.length);
    expect(validateProductGuides()).toEqual([]);
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    for (const guide of productGuides) {
      expect(guide.summary.trim().length).toBeGreaterThan(40);
      expect(guide.sources.length).toBeGreaterThan(0);
      expect(guide.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.reviewDue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(guide.checklist.length).toBeGreaterThanOrEqual(3);
      for (const lessonId of guide.relatedLessonIds) expect(lessonIds.has(lessonId)).toBe(true);
    }
  });

  it("covers the products learners use, including Chinese model providers", () => {
    const ids = productGuides.map((guide) => guide.id);
    for (const expected of ["chatgpt", "claude", "gemini", "microsoft-copilot", "perplexity", "deepseek", "qwen", "kimi", "glm", "minimax", "ernie", "hunyuan", "mistral", "llama", "grok"]) {
      expect(ids).toContain(expected);
    }
  });

  it("links only to first-party documentation and flags review windows", () => {
    for (const guide of productGuides) {
      for (const source of guide.sources) {
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.url).not.toMatch(/\s/);
      }
      expect(isReviewDue(guide, guide.lastVerified)).toBe(false);
      expect(isReviewDue(guide, guide.reviewDue)).toBe(true);
    }
  });

  it("resolves a selected guide and returns undefined for unknown IDs", () => {
    expect(findProductGuide("claude")?.vendor).toBe("Anthropic");
    expect(findProductGuide("not-a-real-guide")).toBeUndefined();
  });
});
