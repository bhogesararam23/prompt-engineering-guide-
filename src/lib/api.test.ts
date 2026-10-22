import { describe, expect, it } from "vitest";
import { mergeApiPrompts, normalizeApiBase } from "./api";
import type { SavedPrompt } from "./prompts";

const local: SavedPrompt = { id: "local", title: "Same", content: "A prompt", createdAt: "2026-01-01T00:00:00Z" };

describe("optional API helpers", () => {
  it("normalizes trailing slashes", () => {
    expect(normalizeApiBase("http://127.0.0.1:8000/")).toBe("http://127.0.0.1:8000");
  });
  it("rejects invalid protocols and URLs with embedded credentials", () => {
    expect(() => normalizeApiBase("javascript:alert(1)")).toThrow(/HTTP or HTTPS/);
    expect(() => normalizeApiBase("https://user:pass@example.com")).toThrow(/credentials/);
  });
  it("merges by title and content while preserving local records", () => {
    const remote = [
      { id: "remote-1", title: "Same", content: "A prompt", created_at: "2026-01-01T00:00:00Z" },
      { id: "remote-2", title: "Another", content: "Different", created_at: "2026-01-02T00:00:00Z" }
    ];
    const merged = mergeApiPrompts([local], remote);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe("remote-2");
    expect(merged[1]).toEqual(local);
  });
});