import type { WorkflowDefinition } from "./types";
import { validateWorkflow, workflowHasErrors } from "./validate";

const KEY = "peg:workflows:v1";
const MAX_SAVED_WORKFLOWS = 50;

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
