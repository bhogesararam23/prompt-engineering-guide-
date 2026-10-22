export type LearningState = {
  completedLessonIds: string[];
  bookmarkedLessonIds: string[];
};

const STORAGE_KEY = "peg:learning-state:v1";
const emptyState: LearningState = { completedLessonIds: [], bookmarkedLessonIds: [] };

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((item): item is string => typeof item === "string"))]
    : [];
}

export function readLearningState(): LearningState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...emptyState };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...emptyState };
    const state = parsed as Record<string, unknown>;
    return {
      completedLessonIds: stringList(state.completedLessonIds),
      bookmarkedLessonIds: stringList(state.bookmarkedLessonIds)
    };
  } catch {
    return { ...emptyState };
  }
}

export function writeLearningState(state: LearningState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completedLessonIds: stringList(state.completedLessonIds),
      bookmarkedLessonIds: stringList(state.bookmarkedLessonIds)
    }));
    return true;
  } catch {
    return false;
  }
}
