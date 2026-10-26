import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { findTaskGuide, taskGuides, validateTaskGuides } from "./task-guides";

describe("task-first learning finder", () => {
  it("offers a useful curated task map with unique IDs and valid lesson links", () => {
    expect(taskGuides.length).toBeGreaterThanOrEqual(8);
    expect(new Set(taskGuides.map((task) => task.id)).size).toBe(taskGuides.length);
    expect(validateTaskGuides()).toEqual([]);
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    for (const task of taskGuides) {
      expect(lessonIds.has(task.lessonId)).toBe(true);
      expect(task.title.trim().length).toBeGreaterThan(4);
      expect(task.need.trim().length).toBeGreaterThan(20);
      expect(task.recommendation.trim().length).toBeGreaterThan(20);
      expect(task.rationale.trim().length).toBeGreaterThan(20);
    }
  });

  it("resolves a selected task and returns undefined for unknown IDs", () => {
    expect(findTaskGuide("classify-text")?.lessonId).toBe("zero-shot");
    expect(findTaskGuide("not-a-real-task")).toBeUndefined();
  });

  it("covers distinct learner jobs instead of mapping every task to one lesson", () => {
    expect(new Set(taskGuides.map((task) => task.lessonId)).size).toBeGreaterThanOrEqual(6);
    expect(taskGuides.some((task) => task.lessonId === "security")).toBe(true);
    expect(taskGuides.some((task) => task.lessonId === "evaluation")).toBe(true);
  });
});
