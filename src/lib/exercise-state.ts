import type { LessonExercise } from "../data/exercises";

export type ExerciseAttempt = {
  selectedIndex: number | null;
  checked: boolean;
  correct: boolean | null;
  checkedAt?: string;
};

export type ExerciseState = Record<string, ExerciseAttempt>;
const STORAGE_KEY = "peg:exercise-state:v1";

export function readExerciseState(exercises: LessonExercise[]): ExerciseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const source = value as Record<string, unknown>;
    const output: ExerciseState = {};
    for (const exercise of exercises) {
      const item = source[exercise.id];
      if (!item || typeof item !== "object") continue;
      const attempt = item as Record<string, unknown>;
      const selectedIndex = attempt.selectedIndex;
      if (selectedIndex !== null && (!Number.isInteger(selectedIndex) || (selectedIndex as number) < 0 || (selectedIndex as number) >= exercise.choices.length)) continue;
      output[exercise.id] = {
        selectedIndex: selectedIndex as number | null,
        checked: attempt.checked === true,
        correct: typeof attempt.correct === "boolean" ? attempt.correct : null,
        ...(typeof attempt.checkedAt === "string" ? { checkedAt: attempt.checkedAt } : {})
      };
    }
    return output;
  } catch {
    return {};
  }
}

export function writeExerciseState(state: ExerciseState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function scoreExerciseState(state: ExerciseState): { attempted: number; correct: number } {
  const checked = Object.values(state).filter((attempt) => attempt.checked && attempt.correct !== null);
  return {
    attempted: checked.length,
    correct: checked.filter((attempt) => attempt.correct).length
  };
}
