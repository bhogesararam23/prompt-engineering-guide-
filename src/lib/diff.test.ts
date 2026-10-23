import { describe, expect, it } from "vitest";
import { diffLines } from "./diff";

describe("line-based prompt comparison", () => {
  it("reports unchanged, removed, and added lines in order", () => {
    expect(diffLines("Role: analyst\nTask: summarize\nFormat: bullets", "Role: analyst\nTask: classify\nFormat: bullets")).toEqual([
      { kind: "same", text: "Role: analyst", oldLine: 1, newLine: 1 },
      { kind: "removed", text: "Task: summarize", oldLine: 2 },
      { kind: "added", text: "Task: classify", newLine: 2 },
      { kind: "same", text: "Format: bullets", oldLine: 3, newLine: 3 }
    ]);
  });

  it("handles empty and identical prompts", () => {
    expect(diffLines("", "")).toEqual([{ kind: "same", text: "", oldLine: 1, newLine: 1 }]);
    expect(diffLines("one\ntwo", "one\ntwo").every((line) => line.kind === "same")).toBe(true);
  });

  it("bounds work for unusually large prompts", () => {
    expect(() => diffLines("a\nb\nc", "a\nb\nc", 2)).toThrow(/exceeds 2 lines/);
  });
});
