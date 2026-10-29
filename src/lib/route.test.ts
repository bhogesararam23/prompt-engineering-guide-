import { describe, expect, it } from "vitest";
import { parseRoute, routeHref, type View } from "./route";

describe("route parsing and link building", () => {
  it("keeps existing lesson URLs working", () => {
    expect(parseRoute("?lesson=anatomy")).toMatchObject({ view: "guide", lessonId: "anatomy" });
    expect(routeHref({ view: "guide", lessonId: "anatomy" })).toBe("?lesson=anatomy");
  });

  it("reads the learning-first sections from the query string", () => {
    expect(parseRoute("?view=tasks")).toMatchObject({ view: "tasks", roleId: null });
    expect(parseRoute("?view=roles&role=developer")).toMatchObject({ view: "roles", roleId: "developer" });
    expect(parseRoute("?view=products&guide=claude")).toMatchObject({ view: "products", guideId: "claude" });
    expect(parseRoute("?view=search&q=context")).toMatchObject({ view: "search", query: "context" });
    expect(parseRoute("?view=tasks&task=classify-text")).toMatchObject({ view: "tasks", taskId: "classify-text" });
  });

  it("falls back to the overview for unknown or empty queries", () => {
    expect(parseRoute("")).toMatchObject({ view: "overview" });
    expect(parseRoute("?view=not-a-view")).toMatchObject({ view: "overview" });
    expect(parseRoute("?lesson=not-a-lesson")).toMatchObject({ view: "overview" });
    expect(parseRoute("?view=roles")).toMatchObject({ roleId: null });
  });

  it("builds readable hrefs for every section", () => {
    expect(routeHref({ view: "overview" })).toBe("?");
    expect(routeHref({ view: "tasks" })).toBe("?view=tasks");
    expect(routeHref({ view: "tasks", taskId: "classify-text" })).toBe("?view=tasks&task=classify-text");
    expect(routeHref({ view: "roles", roleId: "writer" })).toBe("?view=roles&role=writer");
    expect(routeHref({ view: "products", guideId: "gemini" })).toBe("?view=products&guide=gemini");
    expect(routeHref({ view: "search", query: "few shot" })).toBe("?view=search&q=few+shot");
  });

  it("ignores detail IDs that do not belong to the current view", () => {
    expect(routeHref({ view: "tasks", roleId: "writer" })).toBe("?view=tasks");
    expect(parseRoute("?view=lab&q=ignored").query).toBe("");
  });

  it("accepts every declared view", () => {
    const views: View[] = ["overview", "guide", "tasks", "roles", "products", "search", "techniques", "lab", "evaluation", "playground", "library", "workflows"];
    for (const view of views) {
      expect(parseRoute(routeHref({ view })).view).toBe(view);
    }
  });
});
