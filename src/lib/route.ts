import { lessonIdFromSearch } from "./lesson-navigation";

/** Every destination the single-page guide can address. */
export type View =
  | "overview"
  | "guide"
  | "tasks"
  | "roles"
  | "products"
  | "search"
  | "techniques"
  | "lab"
  | "evaluation"
  | "playground"
  | "library"
  | "workflows";

export type RouteState = {
  view: View;
  lessonId: string | null;
  roleId: string | null;
  guideId: string | null;
  taskId: string | null;
  query: string;
};

/** Views that are addressable through ?view=… on their own. */
const VIEWS: ReadonlySet<string> = new Set<View>([
  "overview",
  "guide",
  "tasks",
  "roles",
  "products",
  "search",
  "techniques",
  "lab",
  "evaluation",
  "playground",
  "library",
  "workflows"
]);

const OVERVIEW: RouteState = { view: "overview", lessonId: null, roleId: null, guideId: null, taskId: null, query: "" };

function asView(value: string | null): View | null {
  return value !== null && VIEWS.has(value) ? (value as View) : null;
}

/** Reads the current location search string into a route. Unknown values fall back safely. */
export function parseRoute(search: string): RouteState {
  const params = new URLSearchParams(search);
  const lessonId = lessonIdFromSearch(search);
  if (lessonId) return { ...OVERVIEW, view: "guide", lessonId };
  const view = asView(params.get("view")) ?? "overview";
  if (view === "overview") return OVERVIEW;
  return {
    view,
    lessonId: null,
    roleId: view === "roles" ? params.get("role") : null,
    guideId: view === "products" ? params.get("guide") : null,
    taskId: view === "tasks" ? params.get("task") : null,
    query: view === "search" ? params.get("q") ?? "" : ""
  };
}

/**
 * Stable, shareable href for a route. Lessons keep their existing ?lesson= URLs so
 * links shared before this module existed continue to work.
 */
export function routeHref(route: Partial<RouteState> & { view: View }): string {
  const params = new URLSearchParams();
  if (route.view === "guide") {
    if (route.lessonId) params.set("lesson", route.lessonId);
    else params.set("view", "guide");
  } else if (route.view !== "overview") {
    params.set("view", route.view);
  }
  if (route.view === "roles" && route.roleId) params.set("role", route.roleId);
  if (route.view === "products" && route.guideId) params.set("guide", route.guideId);
  if (route.view === "tasks" && route.taskId) params.set("task", route.taskId);
  if (route.view === "search" && route.query) params.set("q", route.query);
  const encoded = params.toString();
  return encoded ? "?" + encoded : "?";
}
