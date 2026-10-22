export type EvaluationCase = {
  id: string;
  name: string;
  input: string;
  expected: string;
  actual: string;
};

export type EvaluationRun = {
  id: string;
  createdAt: string;
  promptTitle: string;
  modelId: string;
  total: number;
  completed: number;
  matched: number;
  exactMatchRate: number;
};

export const starterEvaluationCases: EvaluationCase[] = [
  { id: "sentiment-positive", name: "Positive review", input: "The battery lasts all day and setup was easy.", expected: "positive", actual: "" },
  { id: "sentiment-negative", name: "Negative review", input: "It stopped charging after two days.", expected: "negative", actual: "" },
  { id: "sentiment-neutral", name: "Neutral review", input: "The package includes a USB-C cable.", expected: "neutral", actual: "" }
];

const CASES_KEY = "peg:evaluation-cases:v1";
const RUNS_KEY = "peg:evaluation-runs:v1";

export function normalizeForExactMatch(value: string): string {
  return value.trim().toLocaleLowerCase().replace(/\s+/g, " ").replace(/[.,;:!?]+$/g, "").trim();
}

export function isExactMatch(expected: string, actual: string): boolean {
  const normalizedExpected = normalizeForExactMatch(expected);
  const normalizedActual = normalizeForExactMatch(actual);
  return normalizedExpected.length > 0 && normalizedExpected === normalizedActual;
}

export function summarizeEvaluation(cases: EvaluationCase[], context: {
  promptTitle: string;
  modelId: string;
  createdAt?: string;
  id?: string;
}): EvaluationRun {
  const eligible = cases.filter((item) => item.expected.trim().length > 0 && item.actual.trim().length > 0);
  const matched = eligible.filter((item) => isExactMatch(item.expected, item.actual)).length;
  return {
    id: context.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())),
    createdAt: context.createdAt || new Date().toISOString(),
    promptTitle: context.promptTitle.trim() || "Untitled prompt",
    modelId: context.modelId,
    total: cases.length,
    completed: eligible.length,
    matched,
    exactMatchRate: eligible.length ? matched / eligible.length : 0
  };
}

function isEvaluationCase(value: unknown): value is EvaluationCase {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return ["id", "name", "input", "expected", "actual"].every((key) => typeof item[key] === "string");
}

export function readEvaluationCases(): EvaluationCase[] {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (!raw) return starterEvaluationCases.map((item) => ({ ...item }));
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || !value.every(isEvaluationCase)) return starterEvaluationCases.map((item) => ({ ...item }));
    return value.slice(0, 100);
  } catch {
    return starterEvaluationCases.map((item) => ({ ...item }));
  }
}

export function writeEvaluationCases(cases: EvaluationCase[]): boolean {
  try {
    localStorage.setItem(CASES_KEY, JSON.stringify(cases.slice(0, 100)));
    return true;
  } catch {
    return false;
  }
}

export function readEvaluationRuns(): EvaluationRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is EvaluationRun => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return typeof row.id === "string" && typeof row.createdAt === "string" &&
        typeof row.promptTitle === "string" && typeof row.modelId === "string" &&
        typeof row.total === "number" && typeof row.completed === "number" &&
        typeof row.matched === "number" && typeof row.exactMatchRate === "number";
    }).slice(0, 20);
  } catch {
    return [];
  }
}

export function writeEvaluationRuns(runs: EvaluationRun[]): boolean {
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 20)));
    return true;
  } catch {
    return false;
  }
}
