export type WorkflowNodeType = "input" | "prompt" | "transform" | "validator" | "router" | "merge" | "loop" | "human-review" | "output";
export type Position = { x: number; y: number };
export type NodeBase<T extends WorkflowNodeType, C> = { id: string; type: T; label: string; position: Position; config: C };

export type InputNode = NodeBase<"input", { key: string; defaultValue?: string }>;
export type PromptNode = NodeBase<"prompt", { systemPrompt: string; template: string; temperature?: number; maxTokens?: number }>;
export type TransformNode = NodeBase<"transform", { operation: "trim" | "uppercase" | "lowercase" | "prefix" | "suffix" | "replace"; value?: string; search?: string }>;
export type ValidatorNode = NodeBase<"validator", { rule: "non-empty" | "contains" | "equals" | "max-length"; value?: string; maxLength?: number }>;
export type RouterNode = NodeBase<"router", { condition: "contains" | "equals" | "is-empty"; value?: string }>;
export type MergeNode = NodeBase<"merge", { strategy: "join" | "first-non-empty" | "json"; separator?: string }>;
export type LoopNode = NodeBase<"loop", {
  maxIterations: number;
  draftInstruction: string;
  reviewInstruction: string;
  refineInstruction: string;
  evaluator: "non-empty" | "contains" | "equals" | "max-length";
  expectedValue?: string;
  maxLength?: number;
}>;
export type HumanReviewNode = NodeBase<"human-review", { instruction: string; allowEdit: boolean }>;
export type OutputNode = NodeBase<"output", { displayName?: string }>;
export type WorkflowNode = InputNode | PromptNode | TransformNode | ValidatorNode | RouterNode | MergeNode | LoopNode | HumanReviewNode | OutputNode;

export type WorkflowEdge = {
  id: string;
  from: string;
  to: string;
  /** Required only for branching nodes: router match/no-match, validator pass/fail, loop pass/limit. */
  fromPort?: string;
};
export type WorkflowDefinition = {
  schemaVersion: 1;
  id: string;
  name: string;
  description: string;
  entryNodeId: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
};
export type WorkflowIssue = { code: string; message: string; nodeId?: string; edgeId?: string; severity: "error" | "warning" };
export type WorkflowNodeRun = {
  nodeId: string;
  status: "success" | "failed" | "skipped";
  input: string;
  output: string;
  durationMs: number;
  selectedPort?: string;
  error?: string;
  iterations?: Array<{ attempt: number; candidate: string; passed: boolean; feedback: string }>;
  review?: { decision: "approve" | "reject"; note: string };
};
export type WorkflowRun = {
  id: string;
  workflowId: string;
  workflowName: string;
  startedAt: string;
  finishedAt: string;
  status: "success" | "failed" | "cancelled";
  output: string;
  nodeRuns: WorkflowNodeRun[];
  errors: string[];
};
