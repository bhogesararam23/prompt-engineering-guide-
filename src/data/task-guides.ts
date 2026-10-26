import { lessons } from "./lessons";

export type TaskGuide = {
  id: string;
  title: string;
  need: string;
  lessonId: string;
  recommendation: string;
  rationale: string;
};

export const taskGuides: TaskGuide[] = [
  {
    id: "write-clearer",
    title: "Write a clearer prompt",
    need: "Turn a vague request into specific instructions and a usable output.",
    lessonId: "anatomy",
    recommendation: "Define the task, audience, constraints, and output shape.",
    rationale: "The anatomy lesson teaches the parts that make success observable."
  },
  {
    id: "classify-text",
    title: "Classify or label text",
    need: "Assign consistent labels to reviews, feedback, or short messages.",
    lessonId: "zero-shot",
    recommendation: "Start with a direct instruction and a small, fixed label set.",
    rationale: "Zero-shot prompting is a useful baseline before adding examples or complexity."
  },
  {
    id: "match-a-style",
    title: "Match a format or style",
    need: "Make responses follow a repeatable pattern rather than guessing the format.",
    lessonId: "few-shot",
    recommendation: "Provide representative input/output examples with consistent labels.",
    rationale: "Few-shot examples can demonstrate patterns that are awkward to explain in prose."
  },
  {
    id: "extract-structured",
    title: "Extract structured information",
    need: "Turn unstructured text into predictable fields for review or further processing.",
    lessonId: "structured-output",
    recommendation: "Specify field names, types, allowed values, and missing-value behavior.",
    rationale: "The structured-output lesson also explains why application-side validation is necessary."
  },
  {
    id: "improve-a-result",
    title: "Improve a weak result",
    need: "Diagnose a poor answer and revise only what is failing.",
    lessonId: "evaluation",
    recommendation: "Keep a representative test set and compare revisions against fixed criteria.",
    rationale: "Evaluation helps distinguish a real improvement from a single lucky example."
  },
  {
    id: "use-documents-safely",
    title: "Work with documents safely",
    need: "Use supplied documents without treating every instruction inside them as trusted.",
    lessonId: "security",
    recommendation: "Separate instructions from untrusted content and enforce permissions outside the prompt.",
    rationale: "Prompt wording alone is not a security boundary; the lesson covers stronger controls."
  },
  {
    id: "break-down-work",
    title: "Break down a complex task",
    need: "Split a large request into smaller steps that can be checked independently.",
    lessonId: "decomposition",
    recommendation: "Define intermediate outputs and validate them before continuing.",
    rationale: "Decomposition improves inspectability but can propagate early mistakes."
  },
  {
    id: "choose-useful-context",
    title: "Choose useful context",
    need: "Decide which notes, documents, and history actually belong in the prompt.",
    lessonId: "context",
    recommendation: "Select relevant context, preserve provenance, and identify missing evidence.",
    rationale: "Context engineering addresses information quality beyond the instruction itself."
  }
];

export function findTaskGuide(id: string): TaskGuide | undefined {
  return taskGuides.find((task) => task.id === id);
}

export function validateTaskGuides(): string[] {
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const task of taskGuides) {
    if (!task.id.trim() || ids.has(task.id)) errors.push("Task IDs must be non-empty and unique: " + task.id);
    ids.add(task.id);
    if (!lessonIds.has(task.lessonId)) errors.push("Task " + task.id + " references unknown lesson " + task.lessonId);
    if (!task.title.trim() || !task.need.trim() || !task.recommendation.trim() || !task.rationale.trim()) {
      errors.push("Task " + task.id + " must include a title, need, recommendation, and rationale.");
    }
  }
  return errors;
}
