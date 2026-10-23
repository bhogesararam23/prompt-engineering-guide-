import type { WorkflowDefinition, WorkflowIssue, WorkflowNode, WorkflowNodeType } from "./types";

export const MAX_WORKFLOW_NODES = 100;
export const MAX_WORKFLOW_EDGES = 200;
export const MAX_WORKFLOW_JSON_CHARS = 1_000_000;
const nodeTypes: WorkflowNodeType[] = ["input", "prompt", "transform", "validator", "router", "merge", "loop", "output"];

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function string(value: unknown): value is string { return typeof value === "string"; }
function nonEmpty(value: unknown): value is string { return string(value) && value.trim().length > 0; }
function finite(value: unknown): value is number { return typeof value === "number" && Number.isFinite(value); }

export function isWorkflowShape(value: unknown): value is WorkflowDefinition {
  if (!record(value)) return false;
  if (value.schemaVersion !== 1 || !string(value.id) || !string(value.name) || !string(value.description) ||
      !string(value.entryNodeId) || !string(value.createdAt) || !string(value.updatedAt) ||
      !Array.isArray(value.nodes) || !Array.isArray(value.edges)) return false;
  return value.nodes.every((node) => record(node) && string(node.id) && string(node.type) &&
    string(node.label) && record(node.position) && finite(node.position.x) && finite(node.position.y) &&
    record(node.config)) &&
    value.edges.every((edge) => record(edge) && string(edge.id) && string(edge.from) && string(edge.to) &&
      (edge.fromPort === undefined || string(edge.fromPort)));
}

function configIssue(node: WorkflowNode): string | null {
  switch (node.type) {
    case "input":
      return nonEmpty(node.config.key) ? null : "Input nodes need a non-empty input key.";
    case "prompt":
      if (!nonEmpty(node.config.template)) return "Prompt nodes need a prompt template.";
      if (node.config.temperature !== undefined && (!finite(node.config.temperature) || node.config.temperature < 0 || node.config.temperature > 2)) return "Temperature must be between 0 and 2.";
      if (node.config.maxTokens !== undefined && (!finite(node.config.maxTokens) || node.config.maxTokens < 1 || node.config.maxTokens > 8192)) return "Maximum tokens must be between 1 and 8192.";
      return null;
    case "transform":
      if (!["trim", "uppercase", "lowercase", "prefix", "suffix", "replace"].includes(node.config.operation)) return "Select a supported transformation operation.";
      if (node.config.operation === "replace" && !nonEmpty(node.config.search)) return "Replace operations need a non-empty search string.";
      return null;
    case "validator":
      if (!["non-empty", "contains", "equals", "max-length"].includes(node.config.rule)) return "Select a supported validation rule.";
      if (["contains", "equals"].includes(node.config.rule) && !string(node.config.value)) return "This validation rule needs a comparison value.";
      if (node.config.rule === "max-length" && (!finite(node.config.maxLength) || node.config.maxLength < 1 || node.config.maxLength > 100_000)) return "Maximum length must be between 1 and 100000.";
      return null;
    case "router":
      if (!["contains", "equals", "is-empty"].includes(node.config.condition)) return "Select a supported routing condition.";
      if (node.config.condition !== "is-empty" && !string(node.config.value)) return "This routing condition needs a comparison value.";
      return null;
    case "merge":
      return ["join", "first-non-empty", "json"].includes(node.config.strategy) ? null : "Select a supported merge strategy.";
    case "loop":
      if (!finite(node.config.maxIterations) || !Number.isInteger(node.config.maxIterations) || node.config.maxIterations < 1 || node.config.maxIterations > 10) return "Loop limit must be an integer from 1 to 10.";
      if (!nonEmpty(node.config.draftInstruction) || !nonEmpty(node.config.reviewInstruction) || !nonEmpty(node.config.refineInstruction)) return "Loop nodes need draft, review, and refinement instructions.";
      if (!["non-empty", "contains", "equals", "max-length"].includes(node.config.evaluator)) return "Select a supported deterministic evaluator.";
      if (["contains", "equals"].includes(node.config.evaluator) && !string(node.config.expectedValue)) return "This loop evaluator needs an expected value.";
      if (node.config.evaluator === "max-length" && (!finite(node.config.maxLength) || node.config.maxLength < 1 || node.config.maxLength > 100_000)) return "Loop maximum length must be between 1 and 100000.";
      return null;
    case "output":
      return null;
  }
}
function allowedPorts(node: WorkflowNode): string[] {
  if (node.type === "router") return ["match", "no-match"];
  if (node.type === "validator") return ["pass", "fail"];
  if (node.type === "loop") return ["pass", "limit"];
  return ["output"];
}

export function validateWorkflow(value: unknown): WorkflowIssue[] {
  const issues: WorkflowIssue[] = [];
  const issue = (code: string, message: string, meta: Partial<WorkflowIssue> = {}) =>
    issues.push({ code, message, severity: "error", ...meta });
  if (!isWorkflowShape(value)) {
    issue("invalid-shape", "Workflow JSON does not match the required version-1 structure.");
    return issues;
  }
  const workflow = value;
  if (!nonEmpty(workflow.name)) issue("missing-name", "Give the workflow a name.");
  if (workflow.nodes.length < 1) issue("empty-graph", "Add at least one node.");
  if (workflow.nodes.length > MAX_WORKFLOW_NODES) issue("node-limit", `A workflow may contain at most ${MAX_WORKFLOW_NODES} nodes.`);
  if (workflow.edges.length > MAX_WORKFLOW_EDGES) issue("edge-limit", `A workflow may contain at most ${MAX_WORKFLOW_EDGES} edges.`);

  const nodes = new Map<string, WorkflowNode>();
  for (const raw of workflow.nodes) {
    if (!nonEmpty(raw.id)) { issue("missing-node-id", "Every node needs an ID."); continue; }
    if (nodes.has(raw.id)) { issue("duplicate-node-id", `Node ID “${raw.id}” is duplicated.`, { nodeId: raw.id }); continue; }
    nodes.set(raw.id, raw);
    if (!nodeTypes.includes(raw.type)) {
      issue("unknown-node-type", `Node “${raw.id}” uses an unsupported node type.`, { nodeId: raw.id });
      continue;
    }
    if (!nonEmpty(raw.label)) issue("missing-node-label", "Give each node a label.", { nodeId: raw.id });
    if (!finite(raw.position.x) || !finite(raw.position.y) || Math.abs(raw.position.x) > 1_000_000 || Math.abs(raw.position.y) > 1_000_000) {
      issue("invalid-position", "Node position must use finite coordinates within +/-1,000,000.", { nodeId: raw.id });
    }
    const message = configIssue(raw);
    if (message) issue("invalid-node-config", message, { nodeId: raw.id });
  }

  const entry = nodes.get(workflow.entryNodeId);
  if (!entry || entry.type !== "input") issue("invalid-entry", "The entryNodeId must refer to an input node.", { nodeId: workflow.entryNodeId });
  if (!workflow.nodes.some((node) => node.type === "output")) issue("missing-output", "Add at least one output node.", { nodeId: workflow.entryNodeId });

  const edgeIds = new Set<string>();
  const adjacency = new Map<string, string[]>();
  const incoming = new Map<string, number>();
  for (const node of workflow.nodes) { adjacency.set(node.id, []); incoming.set(node.id, 0); }
  const signatures = new Set<string>();
  for (const edge of workflow.edges) {
    if (!nonEmpty(edge.id)) { issue("missing-edge-id", "Every edge needs an ID.", { edgeId: edge.id }); continue; }
    if (edgeIds.has(edge.id)) issue("duplicate-edge-id", `Edge ID “${edge.id}” is duplicated.`, { edgeId: edge.id });
    edgeIds.add(edge.id);
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from) issue("missing-edge-source", `Edge “${edge.id}” references a missing source node.`, { edgeId: edge.id });
    if (!to) issue("missing-edge-target", `Edge “${edge.id}” references a missing target node.`, { edgeId: edge.id });
    if (!from || !to) continue;
    if (from.id === to.id) issue("self-edge", "A node cannot connect directly to itself. Put feedback loops inside a bounded Loop Controller node.", { edgeId: edge.id });
    const signature = `${edge.from}|${edge.fromPort || "output"}|${edge.to}`;
    if (signatures.has(signature)) issue("duplicate-edge", "This connection already exists.", { edgeId: edge.id });
    signatures.add(signature);
    if (!allowedPorts(from).includes(edge.fromPort || "output")) {
      issue("invalid-edge-port", `“${from.label}” does not provide the “${edge.fromPort}” output port.`, { edgeId: edge.id, nodeId: from.id });
    }
    if (from.type === "router" || from.type === "validator" || from.type === "loop") {
      if (!edge.fromPort) issue("missing-edge-port", `Connections from ${from.type} nodes must choose an output port.`, { edgeId: edge.id, nodeId: from.id });
    }
    if (to.type === "input") issue("input-has-parent", "Input nodes cannot receive incoming edges.", { edgeId: edge.id, nodeId: to.id });
    adjacency.get(from.id)?.push(to.id);
    incoming.set(to.id, (incoming.get(to.id) || 0) + 1);
  }

  // The visible workflow is a DAG. Loops are encapsulated by Loop Controller nodes with a hard bound.
  const indegree = new Map(incoming);
  const queue = workflow.nodes.filter((node) => (indegree.get(node.id) || 0) === 0).map((node) => node.id);
  let visited = 0;
  while (queue.length) {
    const current = queue.shift()!;
    visited += 1;
    for (const next of adjacency.get(current) || []) {
      const nextDegree = (indegree.get(next) || 0) - 1;
      indegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }
  if (visited !== workflow.nodes.length) issue("cycle-detected", "Workflow edges must be acyclic. Put retry behavior inside a Loop Controller with a finite iteration limit.");

  const reachable = new Set<string>();
  const stack = entry ? [entry.id] : [];
  while (stack.length) {
    const id = stack.pop()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const next of adjacency.get(id) || []) stack.push(next);
  }
  if (!workflow.nodes.some((node) => node.type === "output" && reachable.has(node.id))) {
    issue("unreachable-output", "At least one output node must be reachable from the entry input.", { nodeId: workflow.entryNodeId });
  }
  for (const node of workflow.nodes) {
    if (!reachable.has(node.id)) issues.push({ code: "unreachable-node", message: `Node “${node.label}” is not reachable from the entry input.`, nodeId: node.id, severity: "warning" });
  }
  for (const node of workflow.nodes) {
    if ((node.type === "router" || node.type === "validator" || node.type === "loop") && reachable.has(node.id)) {
      const ports = new Set(workflow.edges.filter((edge) => edge.from === node.id).map((edge) => edge.fromPort));
      if (!ports.has(node.type === "router" ? "match" : node.type === "validator" ? "pass" : "pass") ||
          !ports.has(node.type === "router" ? "no-match" : node.type === "validator" ? "fail" : "limit")) {
        issues.push({ code: "unhandled-branch", message: `Node “${node.label}” does not connect all of its result ports. Consider adding a fallback path.`, nodeId: node.id, severity: "warning" });
      }
    }
  }
  return issues;
}

export function workflowHasErrors(issues: WorkflowIssue[]): boolean {
  return issues.some((item) => item.severity === "error");
}
