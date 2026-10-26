import { lessons } from "../data/lessons";

/** Returns only lesson IDs that exist in the published catalogue. */
export function lessonIdFromSearch(search: string): string | null {
  const candidate = new URLSearchParams(search).get("lesson");
  return candidate && lessons.some((lesson) => lesson.id === candidate) ? candidate : null;
}

/** Stable, shareable location for a lesson in the single-page learning guide. */
export function lessonHref(lessonId: string): string {
  return "?lesson=" + encodeURIComponent(lessonId);
}

/** Stable in-page anchor shared by the table of contents and each lesson section. */
export function lessonSectionId(lessonId: string, heading: string): string {
  const slug = heading.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return "lesson-" + lessonId + "-section-" + slug;
}
