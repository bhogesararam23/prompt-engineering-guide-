import { lessons } from "./lessons";

export type LearningPath = {
  id: string;
  title: string;
  audience: string;
  outcome: string;
  level: "Foundation" | "Practitioner" | "Advanced";
  lessonIds: string[];
};

export const learningPaths: LearningPath[] = [
  {
    id: "beginner",
    title: "Beginner foundations",
    audience: "New to prompt engineering",
    outcome: "Write clear instructions, try examples, and specify an output you can check.",
    level: "Foundation",
    lessonIds: ["anatomy", "zero-shot", "few-shot", "structured-output"]
  },
  {
    id: "everyday-work",
    title: "Better at everyday work",
    audience: "Students and knowledge workers",
    outcome: "Use context carefully, structure useful outputs, and improve work by testing it.",
    level: "Practitioner",
    lessonIds: ["anatomy", "context", "structured-output", "evaluation"]
  },
  {
    id: "advanced-technical",
    title: "Advanced and technical",
    audience: "Developers, researchers, and evaluators",
    outcome: "Design verifiable multi-step tasks and account for security and evaluation limits.",
    level: "Advanced",
    lessonIds: ["context", "decomposition", "structured-output", "evaluation", "security"]
  }
];

export function getLearningPath(id: string): LearningPath | undefined {
  return learningPaths.find((path) => path.id === id);
}

export function getPathProgress(path: LearningPath, completedLessonIds: string[]) {
  const completed = path.lessonIds.filter((id) => completedLessonIds.includes(id)).length;
  return {
    completed,
    total: path.lessonIds.length,
    percent: path.lessonIds.length ? Math.round((completed / path.lessonIds.length) * 100) : 0,
    nextLessonId: path.lessonIds.find((id) => !completedLessonIds.includes(id)) ?? path.lessonIds[0]
  };
}

export function validateLearningPaths(): string[] {
  const knownLessons = new Set(lessons.map((lesson) => lesson.id));
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const path of learningPaths) {
    if (!path.id.trim() || ids.has(path.id)) errors.push("Learning path IDs must be non-empty and unique: " + path.id);
    ids.add(path.id);
    if (path.lessonIds.length === 0) errors.push("Learning path " + path.id + " must include at least one lesson.");
    if (new Set(path.lessonIds).size !== path.lessonIds.length) errors.push("Learning path " + path.id + " contains duplicate lessons.");
    for (const lessonId of path.lessonIds) {
      if (!knownLessons.has(lessonId)) errors.push("Learning path " + path.id + " references unknown lesson " + lessonId);
    }
  }
  return errors;
}
