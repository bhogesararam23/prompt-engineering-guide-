import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { findTaskGuide, taskAreas, taskGuides, validateTaskGuides } from "./task-guides";

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

  it("works each scenario from a weak prompt to an explained improvement", () => {
    for (const task of taskGuides) {
      expect(task.weakPrompt.length).toBeGreaterThan(10);
      expect(task.improvedPrompt.length).toBeGreaterThan(task.weakPrompt.length);
      expect(task.changes.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("names common mistakes and gives a practice exercise for every scenario", () => {
    for (const task of taskGuides) {
      expect(task.mistakes.length).toBeGreaterThanOrEqual(2);
      expect(task.practice.trim().length).toBeGreaterThanOrEqual(60);
    }
  });

  it("covers every work area learners ask about", () => {
    expect(taskAreas()).toEqual(["Writing", "Studying", "Research", "Coding", "Data analysis", "Business", "Marketing", "Everyday work"]);
  });
});
