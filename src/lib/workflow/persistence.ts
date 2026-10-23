import type { WorkflowDefinition } from "./types";
import { validateWorkflow, workflowHasErrors } from "./validate";

const KEY = "peg:workflows:v1";
const MAX_SAVED_WORKFLOWS = 50;
const RUNS_KEY = "peg:workflow-runs:v1";
const MAX_SAVED_RUNS = 10;
const MAX_RUN_HISTORY_CHARS = 500_000;

export function readWorkflows(): WorkflowDefinition[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item) => !workflowHasErrors(validateWorkflow(item))).slice(0, MAX_SAVED_WORKFLOWS) as WorkflowDefinition[];
  } catch {
    return [];
  }
}

export function writeWorkflows(workflows: WorkflowDefinition[]): boolean {
  try {
    const valid = workflows.filter((item) => !workflowHasErrors(validateWorkflow(item))).slice(0, MAX_SAVED_WORKFLOWS);
    localStorage.setItem(KEY, JSON.stringify(valid));
    return valid.length === Math.min(workflows.length, MAX_SAVED_WORKFLOWS);
  } catch {
    return false;
  }
}

export function readWorkflowRuns(): import("./types").WorkflowRun[] {
  try {
    const raw = localStorage.getItem(RUNS_KEY);
    if (!raw || raw.length > MAX_RUN_HISTORY_CHARS) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is import("./types").WorkflowRun =>
      !!item && typeof item === "object" &&
      typeof item.id === "string" && typeof item.workflowId === "string" &&
      typeof item.workflowName === "string" && typeof item.startedAt === "string" &&
      typeof item.finishedAt === "string" && ["success", "failed", "cancelled"].includes(String(item.status)) &&
      typeof item.output === "string" && Array.isArray(item.nodeRuns) &&
      item.nodeRuns.every((run: unknown) => !!run && typeof run === "object" &&
        typeof (run as Record<string, unknown>).nodeId === "string" &&
        ["success", "failed", "skipped"].includes(String((run as Record<string, unknown>).status)) &&
        typeof (run as Record<string, unknown>).input === "string" &&
        typeof (run as Record<string, unknown>).output === "string") &&
      Array.isArray(item.errors) && item.errors.every((error: unknown) => typeof error === "string")
    ).slice(0, MAX_SAVED_RUNS);
  } catch {
    return [];
  }
}

export function writeWorkflowRuns(runs: import("./types").WorkflowRun[]): boolean {
  try {
    const next = runs.slice(0, MAX_SAVED_RUNS);
    const serialized = JSON.stringify(next);
    if (serialized.length > MAX_RUN_HISTORY_CHARS) return false;
    localStorage.setItem(RUNS_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}
