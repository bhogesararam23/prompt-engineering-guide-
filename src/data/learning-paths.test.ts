import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { getLearningPath, getPathProgress, learningPaths, validateLearningPaths } from "./learning-paths";

describe("structured learning paths", () => {
  it("uses unique route IDs and valid, non-duplicated lesson sequences", () => {
    expect(new Set(learningPaths.map((path) => path.id)).size).toBe(learningPaths.length);
    expect(validateLearningPaths()).toEqual([]);
    for (const path of learningPaths) {
      expect(path.lessonIds.length).toBeGreaterThan(1);
      expect(new Set(path.lessonIds).size).toBe(path.lessonIds.length);
      expect(path.lessonIds.every((id) => lessons.some((lesson) => lesson.id === id))).toBe(true);
    }
  });

  it("covers beginner, everyday work, and advanced/technical audiences", () => {
    expect(learningPaths.map((path) => path.id)).toEqual(["beginner", "everyday-work", "advanced-technical"]);
    expect(new Set(learningPaths.map((path) => path.level))).toEqual(new Set(["Foundation", "Practitioner", "Advanced"]));
  });

  it("calculates progress and points to the first incomplete lesson", () => {
    const path = getLearningPath("beginner")!;
    expect(getPathProgress(path, [])).toMatchObject({ completed: 0, total: 4, percent: 0, nextLessonId: "anatomy" });
    expect(getPathProgress(path, ["anatomy", "zero-shot"])).toMatchObject({ completed: 2, total: 4, percent: 50, nextLessonId: "few-shot" });
    expect(getPathProgress(path, path.lessonIds)).toMatchObject({ completed: 4, total: 4, percent: 100, nextLessonId: "anatomy" });
  });

  it("returns undefined for an unknown route", () => {
    expect(getLearningPath("unknown")).toBeUndefined();
  });
});
