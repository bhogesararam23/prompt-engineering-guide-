import type { WorkflowDefinition, WorkflowEdge, WorkflowNode, WorkflowNodeType } from "./types";
import { validateWorkflow, workflowHasErrors } from "./validate";

export function topologicalOrder(workflow: WorkflowDefinition): string[] {
  const issues = validateWorkflow(workflow);
  if (workflowHasErrors(issues)) throw new Error(issues.filter((item) => item.severity === "error").map((item) => item.message).join(" "));
  const indegree = new Map(workflow.nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(workflow.nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of workflow.edges) {
    indegree.set(edge.to, (indegree.get(edge.to) || 0) + 1);
    outgoing.get(edge.from)?.push(edge.to);
  }
  const ready = workflow.nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  const order: string[] = [];
  while (ready.length) {
    const id = ready.shift()!;
    order.push(id);
    for (const next of outgoing.get(id) || []) {
      const degree = (indegree.get(next) || 0) - 1;
      indegree.set(next, degree);
      if (degree === 0) ready.push(next);
    }
  }
  if (order.length !== workflow.nodes.length) throw new Error("Workflow contains a cycle.");
  return order;
}

export function reachableNodeIds(workflow: WorkflowDefinition, startId = workflow.entryNodeId): Set<string> {
  const outgoing = new Map<string, string[]>();
  for (const edge of workflow.edges) {
    const list = outgoing.get(edge.from) || [];
    list.push(edge.to);
    outgoing.set(edge.from, list);
  }
  const seen = new Set<string>();
  const stack = [startId];
  while (stack.length) {
    const current = stack.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    for (const next of outgoing.get(current) || []) stack.push(next);
  }
  return seen;
}

export function createNode(type: "input", index: number): Extract<WorkflowNode, { type: "input" }>;
export function createNode(type: "prompt", index: number): Extract<WorkflowNode, { type: "prompt" }>;
export function createNode(type: "transform", index: number): Extract<WorkflowNode, { type: "transform" }>;
export function createNode(type: "validator", index: number): Extract<WorkflowNode, { type: "validator" }>;
export function createNode(type: "router", index: number): Extract<WorkflowNode, { type: "router" }>;
export function createNode(type: "merge", index: number): Extract<WorkflowNode, { type: "merge" }>;
export function createNode(type: "loop", index: number): Extract<WorkflowNode, { type: "loop" }>;
export function createNode(type: "output", index: number): Extract<WorkflowNode, { type: "output" }>;
export function createNode(type: WorkflowNodeType, index: number): WorkflowNode;
export function createNode(type: WorkflowNodeType, index: number): WorkflowNode {
  const base = { id: `${type}-${index}`, label: type[0].toUpperCase() + type.slice(1), position: { x: 80 + (index % 4) * 210, y: 80 + Math.floor(index / 4) * 150 } };
  switch (type) {
    case "input": return { ...base, type, label: "Input", config: { key: "input", defaultValue: "" } };
    case "prompt": return { ...base, type, label: "Prompt", config: { systemPrompt: "", template: "Complete this task using the input below:\n\n{{input}}", temperature: 0.4, maxTokens: 512 } };
    case "transform": return { ...base, type, label: "Transform", config: { operation: "trim", value: "", search: "" } };
    case "validator": return { ...base, type, label: "Validate", config: { rule: "non-empty" } };
    case "router": return { ...base, type, label: "Route", config: { condition: "is-empty", value: "" } };
    case "merge": return { ...base, type, label: "Merge", config: { strategy: "join", separator: "\n\n" } };
    case "loop": return { ...base, type, label: "Bounded loop", config: { maxIterations: 3, draftInstruction: "Create a first draft.", reviewInstruction: "Review the candidate against the acceptance criteria and describe only specific failures.", refineInstruction: "Improve the candidate using the feedback. Return the revised artifact only.", evaluator: "non-empty" } };
    case "output": return { ...base, type, label: "Output", config: { displayName: "Final output" } };
  }
}

export function createStarterWorkflow(name = "Branch and merge starter"): WorkflowDefinition {
  const nodes: WorkflowNode[] = [
    { ...createNode("input", 1), id: "input-1", label: "Input" },
    { ...createNode("router", 2), id: "router-1", label: "Contains keyword?", config: { condition: "contains", value: "summary" } },
    { ...createNode("transform", 3), id: "transform-1", label: "Normalize input", config: { operation: "trim" } },
    { ...createNode("merge", 4), id: "merge-1", label: "Merge selected branch", config: { strategy: "first-non-empty" } },
    { ...createNode("output", 5), id: "output-1", label: "Result" }
  ];
  const starterPositions: Record<string, { x: number; y: number }> = {
    "input-1": { x: 28, y: 100 },
    "router-1": { x: 280, y: 100 },
    "transform-1": { x: 540, y: 22 },
    "merge-1": { x: 540, y: 180 },
    "output-1": { x: 800, y: 100 }
  };
  for (const node of nodes) node.position = starterPositions[node.id] || node.position;

  const edges: WorkflowEdge[] = [
    { id: "edge-1", from: "input-1", to: "router-1" },
    { id: "edge-2", from: "router-1", to: "transform-1", fromPort: "match" },
    { id: "edge-3", from: "router-1", to: "merge-1", fromPort: "no-match" },
    { id: "edge-4", from: "transform-1", to: "merge-1" },
    { id: "edge-5", from: "merge-1", to: "output-1" }
  ];
  const now = new Date().toISOString();
  return { schemaVersion: 1, id: "starter-branch-merge-" + now.replace(/\\D/g, "").slice(0, 14), name, description: "A local-first example that routes text, applies a deterministic transform on one path, and merges into an output.", entryNodeId: "input-1", nodes, edges, createdAt: now, updatedAt: now };
}

export function createLinearWorkflow(types: WorkflowNodeType[], name: string): WorkflowDefinition {
  const nodes = types.map((type, index) => ({ ...createNode(type, index + 1), id: `${type}-${index + 1}` }));
  if (!nodes.some((node) => node.type === "input")) nodes.unshift({ ...createNode("input", 0), id: "input-1" });
  if (!nodes.some((node) => node.type === "output")) nodes.push({ ...createNode("output", nodes.length + 1), id: `output-${nodes.length + 1}` });
  const edges: WorkflowEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    const source = nodes[index];
    const target = nodes[index + 1];
    const ports = source.type === "router" ? ["match", "no-match"] :
      source.type === "validator" ? ["pass", "fail"] :
      source.type === "loop" ? ["pass", "limit"] : [undefined];
    for (const [portIndex, fromPort] of ports.entries()) {
      edges.push({
        id: `edge-${index + 1}-${portIndex + 1}`,
        from: source.id,
        to: target.id,
        ...(fromPort ? { fromPort } : {})
      });
    }
  }
  const now = new Date().toISOString();
  return { schemaVersion: 1, id: "workflow-" + now.replace(/\D/g, "").slice(0, 14), name, description: "", entryNodeId: nodes.find((node) => node.type === "input")!.id, nodes, edges, createdAt: now, updatedAt: now };
}
