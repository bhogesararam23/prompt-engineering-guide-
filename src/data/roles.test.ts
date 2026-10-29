import { describe, expect, it } from "vitest";
import { lessons } from "./lessons";
import { findRolePath, rolePaths, validateRolePaths } from "./roles";

describe("role-based learning paths", () => {
  it("publishes complete, unique role paths that link to real lessons and tasks", () => {
    expect(rolePaths.length).toBeGreaterThanOrEqual(8);
    expect(new Set(rolePaths.map((role) => role.id)).size).toBe(rolePaths.length);
    expect(validateRolePaths()).toEqual([]);
    const lessonIds = new Set(lessons.map((lesson) => lesson.id));
    for (const role of rolePaths) {
      expect(role.audience.trim().length).toBeGreaterThan(20);
      expect(role.outcome.trim().length).toBeGreaterThan(30);
      expect(role.capstone.trim().length).toBeGreaterThan(40);
      for (const lessonId of role.lessonIds) expect(lessonIds.has(lessonId)).toBe(true);
    }
  });

  it("covers the professions learners actually ask about", () => {
    const ids = rolePaths.map((role) => role.id);
    for (const expected of ["student", "educator", "researcher", "developer", "writer", "marketer", "founder"]) {
      expect(ids).toContain(expected);
    }
  });

  it("resolves a selected role and returns undefined for unknown IDs", () => {
    expect(findRolePath("developer")?.title).toBe("Software developer");
    expect(findRolePath("not-a-real-role")).toBeUndefined();
  });

  it("routes different professions through different lessons", () => {
    const signatures = rolePaths.map((role) => role.lessonIds.join(","));
    expect(new Set(signatures).size).toBe(rolePaths.length);
  });
});
