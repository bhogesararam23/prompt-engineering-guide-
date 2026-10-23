import type { WorkflowDefinition } from "./types";
import { MAX_WORKFLOW_JSON_CHARS, validateWorkflow, workflowHasErrors } from "./validate";

export function serializeWorkflow(workflow: WorkflowDefinition): string {
  const issues = validateWorkflow(workflow);
  if (workflowHasErrors(issues)) throw new Error("Cannot export an invalid workflow: " + issues.filter((item) => item.severity === "error").map((item) => item.message).join(" "));
  return JSON.stringify(workflow, null, 2);
}

export function parseWorkflow(raw: string): WorkflowDefinition {
  if (raw.length > MAX_WORKFLOW_JSON_CHARS) throw new Error(`Workflow file exceeds the ${MAX_WORKFLOW_JSON_CHARS.toLocaleString()} character limit.`);
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error("Workflow file must contain valid JSON."); }
  const issues = validateWorkflow(value);
  if (workflowHasErrors(issues)) throw new Error("Workflow is invalid: " + issues.filter((item) => item.severity === "error").map((item) => item.message).join(" "));
  return value as WorkflowDefinition;
}
