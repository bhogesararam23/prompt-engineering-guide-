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
    expect(() => normalizeApiBase("http://api.example.com")).toThrow(/HTTPS for remote/);
    expect(normalizeApiBase("http://127.0.0.1:8000")).toBe("http://127.0.0.1:8000");
  });
  it("rekeys remote IDs that collide with local prompts", () => {
    const localPrompt = { id: "same-id", title: "Local", content: "Keep me", createdAt: "2026-01-01T00:00:00Z" };
    const remote = [{ id: "same-id", title: "Remote", content: "Distinct", created_at: "2026-01-02T00:00:00Z" }];
    const merged = mergeApiPrompts([localPrompt], remote);
    expect(new Set(merged.map((item) => item.id)).size).toBe(2);
    expect(merged[1]).toEqual(localPrompt);
  });

  it("deduplicates duplicate entries returned by the remote API", () => {
    const remote = [
      { id: "remote-1", title: "New", content: "Unique", created_at: "2026-01-01T00:00:00Z" },
      { id: "remote-2", title: "New", content: "Unique", created_at: "2026-01-02T00:00:00Z" }
    ];
    expect(mergeApiPrompts([], remote)).toHaveLength(1);
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