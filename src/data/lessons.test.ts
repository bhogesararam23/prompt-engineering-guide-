import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";

describe("foundational lesson catalogue", () => {
  it("has unique stable IDs and readable, actionable content", () => {
    const ids = lessons.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const lesson of lessons) {
      expect(lesson.id).toMatch(/^[a-z0-9-]+$/);
      expect(lesson.title.trim()).not.toBe("");
      expect(lesson.summary.length).toBeGreaterThan(25);
      expect(lesson.minutes).toBeGreaterThan(0);
      expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
      expect(lesson.sections.length).toBeGreaterThanOrEqual(2);
      for (const section of lesson.sections) {
        expect(section.heading.trim()).not.toBe("");
        expect(section.body.length).toBeGreaterThan(35);
      }
    }
  });

  it("references only existing prerequisites, related lessons, and next steps", () => {
    const ids = new Set(lessons.map((lesson) => lesson.id));
    for (const lesson of lessons) {
      expect(lesson.prerequisiteIds).not.toContain(lesson.id);
      expect(lesson.relatedLessonIds).not.toContain(lesson.id);
      expect(new Set(lesson.relatedLessonIds).size).toBe(lesson.relatedLessonIds.length);
      for (const id of [...lesson.prerequisiteIds, ...lesson.relatedLessonIds]) expect(ids.has(id)).toBe(true);
      if (lesson.nextLessonId) {
        expect(ids.has(lesson.nextLessonId)).toBe(true);
        expect(lesson.nextLessonId).not.toBe(lesson.id);
      }
    }
  });

  it("defines a continuous eight-module foundation sequence with one next lesson per module except the last", () => {
    expect(lessons).toHaveLength(8);
    expect(lessons[0].id).toBe("anatomy");
    for (const [index, lesson] of lessons.entries()) {
      if (index < lessons.length - 1) expect(lesson.nextLessonId).toBe(lessons[index + 1].id);
      else expect(lesson.nextLessonId).toBeUndefined();
    }
  });

  it("keeps company and product source links secure and labelled", () => {
    for (const lesson of lessons) {
      expect(lesson.sources?.length).toBeGreaterThan(0);
      for (const source of lesson.sources || []) {
        expect(source.label.trim()).not.toBe("");
        expect(source.url.startsWith("https://")).toBe(true);
      }
    }
  });
});
