import type { WorkflowDefinition, WorkflowRun } from "./types";
import { runWorkflow, type LocalGenerate, type WorkflowInputs } from "./runner";
import { normalizeForExactMatch } from "../evaluation";
import { validateWorkflow, workflowHasErrors } from "./validate";

export type WorkflowMatchRule = "exact" | "contains" | "non-empty";
export type WorkflowEvaluationCase = {
  id: string;
  name: string;
  input: string;
  expected: string;
  matchRule: WorkflowMatchRule;
};
export type WorkflowEvaluationCaseResult = WorkflowEvaluationCase & {
  actual: string;
  execution: "success" | "failed" | "cancelled";
  matched: boolean | null;
  workflowRunId?: string;
  trace?: WorkflowRun["nodeRuns"];
  errors: string[];
};
export type WorkflowEvaluationRun = {
  id: string;
  createdAt: string;
  workflowId: string;
  workflowName: string;
  workflowSnapshot: WorkflowDefinition;
  datasetSnapshot: WorkflowEvaluationCase[];
  status: "completed" | "cancelled";
  total: number;
  completed: number;
  matched: number;
  accuracy: number;
  cases: WorkflowEvaluationCaseResult[];
};

export const starterWorkflowEvaluationCases: WorkflowEvaluationCase[] = [
  { id: "route-summary", name: "Summary keyword route", input: "summary please", expected: "summary please", matchRule: "exact" },
  { id: "route-plain", name: "Fallback route", input: "ordinary note", expected: "ordinary note", matchRule: "exact" },
  { id: "route-whitespace", name: "Whitespace handling", input: "  summary for release  ", expected: "summary for release", matchRule: "exact" }
];

const CASES_KEY = "peg:workflow-evaluation-cases:v1";
const RUNS_KEY = "peg:workflow-evaluation-runs:v1";
const MAX_CASES = 100;
const MAX_RUNS = 10;
const MAX_DATASET_CHARS = 1_000_000;
const MAX_FIELD_CHARS = 100_000;

function isMatchRule(value: unknown): value is WorkflowMatchRule {
  return value === "exact" || value === "contains" || value === "non-empty";
}
function isEvaluationCase(value: unknown): value is WorkflowEvaluationCase {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && item.id.trim().length > 0 &&
    typeof item.name === "string" && item.name.length <= 200 &&
    typeof item.input === "string" && item.input.length <= MAX_FIELD_CHARS &&
    typeof item.expected === "string" && item.expected.length <= MAX_FIELD_CHARS &&
    isMatchRule(item.matchRule);
}
function scoreCase(expected: string, actual: string, rule: WorkflowMatchRule): boolean {
  if (rule === "non-empty") return actual.trim().length > 0;
  if (rule === "contains") {
    const needle = normalizeForExactMatch(expected);
    return needle.length > 0 && normalizeForExactMatch(actual).includes(needle);
  }
  return normalizeForExactMatch(expected) === normalizeForExactMatch(actual);
}
function runId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "workflow-eval-" + Date.now().toString(36);
}
function validateCases(cases: WorkflowEvaluationCase[]): void {
  if (cases.length < 1) throw new Error("Add at least one workflow evaluation case.");
  if (cases.length > MAX_CASES) throw new Error("A workflow evaluation dataset may contain at most 100 cases.");
  if (!cases.every(isEvaluationCase)) throw new Error("Each case needs a unique non-empty ID, name, input, expected value, and supported match rule.");
  if (new Set(cases.map((item) => item.id)).size !== cases.length) throw new Error("Workflow evaluation case IDs must be unique.");
  if (cases.some((item) => item.matchRule === "contains" && !item.expected.trim())) throw new Error("Contains-match cases need a non-empty expected substring.");
}

export type WorkflowEvaluationOptions = {
  inputs?: (item: WorkflowEvaluationCase) => WorkflowInputs;
  generate?: LocalGenerate;
  signal?: AbortSignal;
  onCaseResult?: (result: WorkflowEvaluationCaseResult, completed: number, total: number) => void;
};

export async function evaluateWorkflow(
  workflow: WorkflowDefinition,
  cases: WorkflowEvaluationCase[],
  options: WorkflowEvaluationOptions = {}
): Promise<WorkflowEvaluationRun> {
  validateCases(cases);
  const issues = validateWorkflow(workflow);
  if (workflowHasErrors(issues)) {
    throw new Error("Cannot evaluate an invalid workflow: " + issues.filter((item) => item.severity === "error").map((item) => item.message).join(" "));
  }
  if (workflow.nodes.some((node) => node.type === "human-review")) {
    throw new Error("This workflow contains a Human Review node and cannot be evaluated unattended. Use a manual run for approval workflows.");
  }

  const startedAt = new Date().toISOString();
  const results: WorkflowEvaluationCaseResult[] = [];
  for (const item of cases) {
    if (options.signal?.aborted) {
      const cancelled: WorkflowEvaluationCaseResult = { ...item, actual: "", execution: "cancelled", matched: null, errors: ["Evaluation cancelled before this case ran."] };
      results.push(cancelled);
      options.onCaseResult?.(cancelled, results.length, cases.length);
      continue;
    }

    let result: WorkflowEvaluationCaseResult;
    try {
      const inputs = options.inputs ? options.inputs(item) : Object.fromEntries(
        workflow.nodes.filter((node) => node.type === "input").map((node) => [node.config.key, item.input])
      );
      const run: WorkflowRun = await runWorkflow(workflow, {
        inputs,
        generate: options.generate,
        signal: options.signal
      });
      if (run.status === "cancelled") {
        result = { ...item, actual: run.output, execution: "cancelled", matched: null, workflowRunId: run.id, trace: run.nodeRuns, errors: run.errors };
      } else {
        const successful = run.status === "success";
        result = {
          ...item,
          actual: run.output,
          execution: successful ? "success" : "failed",
          matched: successful ? scoreCase(item.expected, run.output, item.matchRule) : false,
          workflowRunId: run.id,
          trace: run.nodeRuns,
          errors: run.errors
        };
      }
    } catch (error) {
      const cancelled = options.signal?.aborted || (error instanceof Error && error.name === "AbortError");
      result = {
        ...item,
        actual: "",
        execution: cancelled ? "cancelled" : "failed",
        matched: cancelled ? null : false,
        errors: [error instanceof Error ? error.message : "Unknown workflow evaluation error."]
      };
    }
    results.push(result);
    options.onCaseResult?.(result, results.length, cases.length);
  }

  const completed = results.filter((item) => item.execution !== "cancelled");
  const matched = completed.filter((item) => item.matched === true).length;
  const workflowSnapshot = JSON.parse(JSON.stringify(workflow)) as WorkflowDefinition;
  return {
    id: runId(),
    createdAt: startedAt,
    workflowId: workflow.id,
    workflowName: workflow.name,
    workflowSnapshot,
    datasetSnapshot: cases.map((item) => ({ ...item })),
    status: results.some((item) => item.execution === "cancelled") ? "cancelled" : "completed",
    total: cases.length,
    completed: completed.length,
    matched,
    accuracy: completed.length ? matched / completed.length : 0,
    cases: results
  };
}

export function readWorkflowEvaluationCases(): WorkflowEvaluationCase[] {
  try {
    const raw = localStorage.getItem(CASES_KEY);
    if (!raw) return starterWorkflowEvaluationCases.map((item) => ({ ...item }));
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length > MAX_CASES || !parsed.every(isEvaluationCase) ||
        new Set(parsed.map((item) => (item as WorkflowEvaluationCase).id)).size !== parsed.length) {
      return starterWorkflowEvaluationCases.map((item) => ({ ...item }));
    }
    return parsed;
  } catch {
    return starterWorkflowEvaluationCases.map((item) => ({ ...item }));
  }
}

export function writeWorkflowEvaluationCases(cases: WorkflowEvaluationCase[]): boolean {
  try {
    validateCases(cases);
    localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    return true;
  } catch {
    return false;
  }
}

export function exportWorkflowEvaluationDataset(cases: WorkflowEvaluationCase[]): string {
  validateCases(cases);
  return JSON.stringify({
    schemaVersion: 1,
    kind: "prompt-engineering-guide-workflow-evaluation",
    exportedAt: new Date().toISOString(),
    cases: cases.slice(0, MAX_CASES)
  }, null, 2);
}

export function parseWorkflowEvaluationDataset(raw: string): WorkflowEvaluationCase[] {
  if (raw.length > MAX_DATASET_CHARS) throw new Error("Workflow evaluation dataset exceeds the one-million-character import limit.");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error("Workflow evaluation dataset must contain valid JSON."); }
  if (!parsed || typeof parsed !== "object" || !("kind" in parsed) || parsed.kind !== "prompt-engineering-guide-workflow-evaluation" ||
      !("schemaVersion" in parsed) || parsed.schemaVersion !== 1 || !("cases" in parsed) || !Array.isArray(parsed.cases)) {
    throw new Error("This file is not a version-1 workflow evaluation dataset.");
  }
  const cases = parsed.cases as unknown[];
  if (cases.length > MAX_CASES || !cases.every(isEvaluationCase)) throw new Error("Dataset cases do not match the workflow evaluation schema.");
  validateCases(cases as WorkflowEvaluationCase[]);
  return cases as WorkflowEvaluationCase[];
}

export function readWorkflowEvaluationRuns(): WorkflowEvaluationRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    if (!raw || raw.length > MAX_DATASET_CHARS) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is WorkflowEvaluationRun => {
      if (!item || typeof item !== "object") return false;
      const row = item as Record<string, unknown>;
      return typeof row.id === "string" && typeof row.createdAt === "string" &&
        typeof row.workflowId === "string" && typeof row.workflowName === "string" &&
        (row.status === "completed" || row.status === "cancelled") &&
        typeof row.total === "number" && typeof row.completed === "number" &&
        typeof row.matched === "number" && typeof row.accuracy === "number" &&
        Array.isArray(row.cases) && Array.isArray(row.datasetSnapshot) &&
        row.workflowSnapshot !== null && typeof row.workflowSnapshot === "object";
    }).slice(0, MAX_RUNS);
  } catch {
    return [];
  }
}

export function writeWorkflowEvaluationRuns(runs: WorkflowEvaluationRun[]): boolean {
  try {
    const next = runs.slice(0, MAX_RUNS);
    const raw = JSON.stringify(next);
    if (raw.length > MAX_DATASET_CHARS) return false;
    localStorage.setItem(RUNS_KEY, raw);
    return true;
  } catch {
    return false;
  }
}
