export type EvaluationCase = {
  id: string;
  name: string;
  input: string;
  expected: string;
  actual: string;
};

export type ScoredEvaluationCase = EvaluationCase & { matched: boolean | null };

export type EvaluationRun = {
  id: string;
  createdAt: string;
  promptTitle: string;
  promptSnapshot: string;
  modelId: string;
  total: number;
  completed: number;
  matched: number;
  exactMatchRate: number;
  cases: ScoredEvaluationCase[];
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
  promptSnapshot?: string;
  createdAt?: string;
  id?: string;
}): EvaluationRun {
  const scoredCases: ScoredEvaluationCase[] = cases.map((item) => {
    const canScore = item.expected.trim().length > 0 && item.actual.trim().length > 0;
    return { ...item, matched: canScore ? isExactMatch(item.expected, item.actual) : null };
  });
  const eligible = scoredCases.filter((item) => item.matched !== null);
  const matched = eligible.filter((item) => item.matched === true).length;
  return {
    id: context.id || (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now())),
    createdAt: context.createdAt || new Date().toISOString(),
    promptTitle: context.promptTitle.trim() || "Untitled prompt",
    promptSnapshot: context.promptSnapshot || "",
    modelId: context.modelId,
    total: cases.length,
    completed: eligible.length,
    matched,
    exactMatchRate: eligible.length ? matched / eligible.length : 0,
    cases: scoredCases
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
    }).map((row) => ({
      ...row,
      promptSnapshot: typeof row.promptSnapshot === "string" ? row.promptSnapshot : "",
      cases: Array.isArray(row.cases) ? row.cases.filter((item): item is ScoredEvaluationCase =>
        isEvaluationCase(item) && "matched" in item && (typeof item.matched === "boolean" || item.matched === null)
      ) : []
    })).slice(0, 20);
  } catch {
    return [];
  }
}

export function exportEvaluationDataset(cases: EvaluationCase[]): string {
  return JSON.stringify({
    schemaVersion: 1,
    kind: "prompt-engineering-guide-evaluation-dataset",
    exportedAt: new Date().toISOString(),
    cases: cases.slice(0, 100)
  }, null, 2);
}

export function parseEvaluationDataset(raw: string): EvaluationCase[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (!parsed || typeof parsed !== "object" || !("cases" in parsed) || !Array.isArray(parsed.cases)) {
    throw new Error("This file is not an evaluation dataset export.");
  }
  const items = parsed.cases as unknown[];
  if (items.length > 100) throw new Error("A dataset may contain at most 100 cases.");
  if (!items.every(isEvaluationCase)) throw new Error("Each case must contain string id, name, input, expected, and actual fields.");
  if (items.some((item) => item.name.length > 200 || item.input.length > 100_000 || item.expected.length > 20_000 || item.actual.length > 50_000)) {
    throw new Error("A case exceeds the maximum allowed field length.");
  }
  return items;
}

export function writeEvaluationRuns(runs: EvaluationRun[]): boolean {
  try {
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 20)));
    return true;
  } catch {
    return false;
  }
}
