import { describe, expect, it } from "vitest";
import { lessonHref, lessonIdFromSearch, lessonSectionId } from "./lesson-navigation";

describe("lesson navigation helpers", () => {
  it("reads only known lesson IDs from a shareable query URL", () => {
    expect(lessonIdFromSearch("?lesson=anatomy")).toBe("anatomy");
    expect(lessonIdFromSearch("?view=guide")).toBeNull();
    expect(lessonIdFromSearch("?lesson=unknown")).toBeNull();
    expect(lessonIdFromSearch("?lesson=anatomy%26admin=true")).toBeNull();
  });

  it("creates a stable link for each lesson", () => {
    expect(lessonHref("anatomy")).toBe("?lesson=anatomy");
    expect(lessonHref("structured-output")).toBe("?lesson=structured-output");
    expect(lessonHref("lesson with spaces")).toBe("?lesson=lesson%20with%20spaces");
  });

  it("creates readable section anchors and normalizes punctuation", () => {
    expect(lessonSectionId("anatomy", "Start with the task")).toBe("lesson-anatomy-section-start-with-the-task");
    expect(lessonSectionId("security", "Instructions & data can conflict")).toBe("lesson-security-section-instructions-data-can-conflict");
  });
});
