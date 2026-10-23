import { beforeEach, describe, expect, it, vi } from "vitest";
import { exercises, gradeExercise } from "../data/exercises";
import { readExerciseState, scoreExerciseState, writeExerciseState } from "./exercise-state";

function makeStorage() {
  const values = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    setRaw(value: string) { values.set("peg:exercise-state:v1", value); }
  };
}

describe("learning exercises", () => {
  it("has one exercise attached to each lesson with valid answer indices", () => {
    expect(exercises).toHaveLength(8);
    for (const exercise of exercises) {
      expect(exercise.choices.length).toBeGreaterThan(1);
      expect(exercise.correctIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.correctIndex).toBeLessThan(exercise.choices.length);
    }
  });

  it("grades answers deterministically and explains them", () => {
    const exercise = exercises[0];
    expect(gradeExercise(exercise, exercise.correctIndex)).toMatchObject({ correct: true });
    expect(gradeExercise(exercise, 0)).toMatchObject({ correct: false });
    expect(() => gradeExercise(exercise, -1)).toThrow(/Select one/);
  });

  it("persists attempts locally and computes a transparent score", () => {
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: makeStorage() });
    const exercise = exercises[0];
    const state = {
      [exercise.id]: { selectedIndex: exercise.correctIndex, checked: true, correct: true },
      [exercises[1].id]: { selectedIndex: 0, checked: true, correct: false }
    };
    expect(writeExerciseState(state)).toBe(true);
    expect(readExerciseState(exercises)).toEqual(state);
    expect(scoreExerciseState(state)).toEqual({ attempted: 2, correct: 1 });
  });

  it("ignores malformed and out-of-range stored attempts", () => {
    const mock = makeStorage();
    mock.setRaw(JSON.stringify({ "check-anatomy": { selectedIndex: 999, checked: true, correct: true } }));
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: mock });
    expect(readExerciseState(exercises)).toEqual({});
  });
});
