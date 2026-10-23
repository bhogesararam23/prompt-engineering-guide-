import { beforeEach, describe, expect, it, vi } from "vitest";
import { readLearningState, writeLearningState } from "./learning-state";

function localStorageMock() {
  let value: string | null = null;
  return {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => { value = next; }),
    setRaw(next: string) { value = next; }
  };
}

describe("learning state persistence", () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: localStorageMock() });
  });

  it("returns an empty state when nothing has been saved", () => {
    expect(readLearningState()).toEqual({ completedLessonIds: [], bookmarkedLessonIds: [] });
  });

  it("round trips completed and bookmarked lessons without duplicates", () => {
    const state = { completedLessonIds: ["a", "a", "b"], bookmarkedLessonIds: ["b", "c", "c"] };
    expect(writeLearningState(state)).toBe(true);
    expect(readLearningState()).toEqual({ completedLessonIds: ["a", "b"], bookmarkedLessonIds: ["b", "c"] });
  });

  it("recovers from malformed stored JSON", () => {
    const mock = globalThis.localStorage as unknown as ReturnType<typeof localStorageMock>;
    mock.setRaw("{not json");
    expect(readLearningState()).toEqual({ completedLessonIds: [], bookmarkedLessonIds: [] });
  });

  it("treats invalid shape as empty lists", () => {
    const mock = globalThis.localStorage as unknown as ReturnType<typeof localStorageMock>;
    mock.setRaw(JSON.stringify({ completedLessonIds: "no", bookmarkedLessonIds: [2, "saved"] }));
    expect(readLearningState()).toEqual({ completedLessonIds: [], bookmarkedLessonIds: ["saved"] });
  });
});
