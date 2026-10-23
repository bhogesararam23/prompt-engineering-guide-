import type { WorkflowDefinition, WorkflowEdge, WorkflowNode, WorkflowNodeRun, WorkflowRun } from "./types";
import { reachableNodeIds, topologicalOrder } from "./graph";
import { validateWorkflow, workflowHasErrors } from "./validate";

export type WorkflowInputs = Record<string, string>;
export type LocalGenerate = (prompt: string, systemPrompt?: string, signal?: AbortSignal) => Promise<string>;
export type HumanReviewDecision = { approved: boolean; output?: string; feedback?: string; cancelled?: boolean };
export type HumanReviewRequest = { nodeId: string; label: string; instruction: string; input: string; allowEdit: boolean };
export type WorkflowRunOptions = {
  inputs?: WorkflowInputs;
  generate?: LocalGenerate;
  review?: (request: HumanReviewRequest, signal?: AbortSignal) => Promise<HumanReviewDecision>;
  signal?: AbortSignal;
  onNodeRun?: (run: WorkflowNodeRun) => void;
};

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    const error = new Error("Workflow execution was cancelled.");
    error.name = "AbortError";
    throw error;
  }
}
function valuesText(values: string[]): string { return values.join("\n\n"); }
function fillTemplate(template: string, input: string, values: string[]): string {
  return template
    .replace(/\{\{input\}\}/g, input)
    .replace(/\{\{value\}\}/g, input)
    .replace(/\{\{input_(\d+)\}\}/g, (_whole, index: string) => values[Number(index) - 1] || "");
}
function evaluate(value: string, rule: "non-empty" | "contains" | "equals" | "max-length", expected?: string, maxLength?: number): boolean {
  if (rule === "non-empty") return value.trim().length > 0;
  if (rule === "contains") return value.toLocaleLowerCase().includes((expected || "").toLocaleLowerCase());
  if (rule === "equals") return value.trim().toLocaleLowerCase() === (expected || "").trim().toLocaleLowerCase();
  return value.length <= (maxLength || 0);
}
function transform(node: Extract<WorkflowNode, { type: "transform" }>, input: string): string {
  const config = node.config;
  switch (config.operation) {
    case "trim": return input.trim();
    case "uppercase": return input.toLocaleUpperCase();
    case "lowercase": return input.toLocaleLowerCase();
    case "prefix": return (config.value || "") + input;
    case "suffix": return input + (config.value || "");
    case "replace": return input.split(config.search || "").join(config.value || "");
  }
}
function activeIncoming(edges: WorkflowEdge[], nodeId: string, runs: Map<string, WorkflowNodeRun>): Array<{ edge: WorkflowEdge; parent: WorkflowNodeRun }> {
  return edges.flatMap((edge) => {
    if (edge.to !== nodeId) return [];
    const parent = runs.get(edge.from);
    if (!parent || parent.status !== "success") return [];
    if (edge.fromPort && edge.fromPort !== (parent.selectedPort || "output")) return [];
    return [{ edge, parent }];
  });
}
function createRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "run-" + Date.now().toString(36);
}

export async function runWorkflow(
  workflow: WorkflowDefinition,
  options: WorkflowRunOptions = {}
): Promise<WorkflowRun> {
  const issues = validateWorkflow(workflow);
  const fatalIssues = issues.filter((item) => item.severity === "error");
  if (workflowHasErrors(issues)) throw new Error("Cannot execute invalid workflow: " + fatalIssues.map((item) => item.message).join(" "));
  const reachable = reachableNodeIds(workflow);
  const order = topologicalOrder(workflow).filter((nodeId) => reachable.has(nodeId));
  const nodeById = new Map(workflow.nodes.map((node) => [node.id, node]));
  const runs = new Map<string, WorkflowNodeRun>();
  const errors: string[] = [];
  const outputs: string[] = [];
  const startedAt = new Date().toISOString();
  let wasCancelled = false;

  for (const nodeId of order) {
    if (options.signal?.aborted) { wasCancelled = true; break; }
    const node = nodeById.get(nodeId);
    if (!node) continue;
    const start = Date.now();
    const incomingEdges = workflow.edges.filter((edge) => edge.to === nodeId);
    const incoming = activeIncoming(workflow.edges, nodeId, runs);
    const inputValues = incoming.map((item) => item.parent.output);
    const input = valuesText(inputValues);

    if (incomingEdges.length > 0 && incoming.length === 0) {
      const skipped: WorkflowNodeRun = { nodeId, status: "skipped", input: "", output: "", durationMs: Date.now() - start };
      runs.set(nodeId, skipped);
      options.onNodeRun?.(skipped);
      continue;
    }

    try {
      let output = "";
      let selectedPort: string | undefined;
      let iterations: WorkflowNodeRun["iterations"];
      let review: WorkflowNodeRun["review"];
      switch (node.type) {
        case "input": {
          output = options.inputs?.[node.config.key] ?? node.config.defaultValue ?? "";
          break;
        }
        case "prompt": {
          if (!options.generate) throw new Error("This workflow requires local inference, but no local-model generator is available.");
          const prompt = fillTemplate(node.config.template, input, inputValues);
          output = await options.generate(prompt, node.config.systemPrompt, options.signal);
          break;
        }
        case "transform": {
          output = transform(node, input);
          break;
        }
        case "validator": {
          const passed = evaluate(input, node.config.rule, node.config.value, node.config.maxLength);
          selectedPort = passed ? "pass" : "fail";
          output = input;
          break;
        }
        case "router": {
          const passed = node.config.condition === "is-empty" ? input.trim().length === 0 :
            node.config.condition === "equals" ? input.trim().toLocaleLowerCase() === (node.config.value || "").trim().toLocaleLowerCase() :
            input.toLocaleLowerCase().includes((node.config.value || "").toLocaleLowerCase());
          selectedPort = passed ? "match" : "no-match";
          output = input;
          break;
        }
        case "merge": {
          const values = inputValues;
          if (node.config.strategy === "first-non-empty") output = values.find((value) => value.trim().length > 0) || "";
          else if (node.config.strategy === "json") output = JSON.stringify(incoming.map(({ edge, parent }) => ({ source: edge.from, label: nodeById.get(edge.from)?.label || edge.from, value: parent.output })), null, 2);
          else output = values.join(node.config.separator ?? "\n\n");
          break;
        }
        case "loop": {
          if (!options.generate) throw new Error("A bounded prompt loop needs the explicitly loaded local model.");
          iterations = [];
          let candidate = "";
          let feedback = "";
          let passed = false;
          for (let attempt = 1; attempt <= node.config.maxIterations; attempt += 1) {
            throwIfAborted(options.signal);
            const instruction = attempt === 1 ? node.config.draftInstruction : node.config.refineInstruction;
            const prompt = [
              instruction,
              "Input artifact:",
              input,
              attempt > 1 ? "Previous candidate:\n" + candidate : "",
              attempt > 1 ? "Previous review feedback:\n" + feedback : "",
              "Acceptance criteria:",
              node.config.reviewInstruction,
              "Return the artifact only."
            ].filter(Boolean).join("\n\n");
            candidate = await options.generate(prompt, "Follow the task and acceptance criteria. Do not invent a passing result.", options.signal);
            passed = evaluate(candidate, node.config.evaluator, node.config.expectedValue, node.config.maxLength);
            const deterministicFeedback = passed ? "Deterministic acceptance check passed." :
              "Deterministic acceptance check failed: " + node.config.evaluator +
              (node.config.expectedValue !== undefined ? " (expected " + JSON.stringify(node.config.expectedValue) + ")" : "") +
              (node.config.maxLength !== undefined ? " (maximum length " + node.config.maxLength + ")" : "");
            feedback = deterministicFeedback;
            if (!passed && attempt < node.config.maxIterations) {
              const reviewPrompt = [
                node.config.reviewInstruction,
                "Candidate:",
                candidate,
                "Deterministic check:",
                deterministicFeedback,
                "Give specific actionable revision feedback. Do not claim the deterministic check passed."
              ].join("\n\n");
              const reviewerFeedback = await options.generate(reviewPrompt, "Review the candidate critically against the stated criteria.", options.signal);
              feedback = deterministicFeedback + "\nReviewer feedback: " + reviewerFeedback;
            }
            iterations.push({ attempt, candidate, passed, feedback });
            if (passed) break;
          }
          output = candidate;
          selectedPort = passed ? "pass" : "limit";
          break;
        }
        case "human-review": {
          if (!options.review) throw new Error("This workflow requires an explicit human-review decision, but no review handler is available.");
          const decision = await options.review({
            nodeId: node.id,
            label: node.label,
            instruction: node.config.instruction,
            input,
            allowEdit: node.config.allowEdit
          }, options.signal);
          if (decision.cancelled) {
            const error = new Error("Workflow execution was cancelled during human review.");
            error.name = "AbortError";
            throw error;
          }
          selectedPort = decision.approved ? "approve" : "reject";
          output = decision.approved && node.config.allowEdit && typeof decision.output === "string" ? decision.output : input;
          review = { decision: selectedPort, note: decision.feedback || "" };
          break;
        }
        case "output": {
          output = input;
          outputs.push(output);
          break;
        }
      }
      const completed: WorkflowNodeRun = { nodeId, status: "success", input, output, durationMs: Date.now() - start, ...(selectedPort ? { selectedPort } : {}), ...(iterations ? { iterations } : {}), ...(review ? { review } : {}) };
      runs.set(nodeId, completed);
      options.onNodeRun?.(completed);
      if (node.type === "loop" && selectedPort === "limit") {
        errors.push(node.label + ": reached the maximum of " + node.config.maxIterations + " iterations without passing the deterministic acceptance check.");
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") { wasCancelled = true; break; }
      const message = error instanceof Error ? error.message : "Unknown node failure.";
      const failed: WorkflowNodeRun = { nodeId, status: "failed", input, output: "", durationMs: Date.now() - start, error: message };
      runs.set(nodeId, failed);
      errors.push(node.label + ": " + message);
      options.onNodeRun?.(failed);
    }
  }

  const nodeRuns = order.flatMap((id) => runs.has(id) ? [runs.get(id)!] : []);
  const outputNodeRuns = workflow.nodes.filter((node) => node.type === "output").map((node) => runs.get(node.id)).filter((item): item is WorkflowNodeRun => !!item && item.status === "success");
  const finalOutput = outputNodeRuns.length ? outputNodeRuns[outputNodeRuns.length - 1].output : outputs[outputs.length - 1] || "";
  return {
    id: createRunId(),
    workflowId: workflow.id,
    workflowName: workflow.name,
    startedAt,
    finishedAt: new Date().toISOString(),
    status: wasCancelled ? "cancelled" : errors.length ? "failed" : outputNodeRuns.length ? "success" : "failed",
    output: finalOutput,
    nodeRuns,
    errors
  };
}

export function isWorkflowRunCancelled(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
