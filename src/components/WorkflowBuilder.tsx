import { useMemo, useRef, useState } from "react";
import { createLinearWorkflow, createNode, createStarterWorkflow } from "../lib/workflow/graph";
import { readWorkflowRuns, readWorkflows, writeWorkflowRuns, writeWorkflows } from "../lib/workflow/persistence";
import { parseWorkflow, serializeWorkflow } from "../lib/workflow/serialization";
import { runWorkflow, type LocalGenerate } from "../lib/workflow/runner";
import { validateWorkflow, workflowHasErrors } from "../lib/workflow/validate";
import type { WorkflowDefinition, WorkflowNode, WorkflowNodeType, WorkflowRun } from "../lib/workflow/types";
import { interruptLocalGeneration } from "../lib/local-model";

type Props = {
  modelReady: boolean;
  generateLocal: LocalGenerate;
};

const nodeTypes: WorkflowNodeType[] = ["input", "prompt", "transform", "validator", "router", "merge", "loop", "output"];

function idFor(prefix: string): string {
  return prefix + "-" + (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
}
function portsFor(node?: WorkflowNode): string[] {
  if (!node) return ["output"];
  if (node.type === "router") return ["match", "no-match"];
  if (node.type === "validator") return ["pass", "fail"];
  if (node.type === "loop") return ["pass", "limit"];
  return ["output"];
}
function timeLabel(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function WorkflowBuilder({ modelReady, generateLocal }: Props) {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>(() => readWorkflows()[0] || createStarterWorkflow());
  const [saved, setSaved] = useState<WorkflowDefinition[]>(() => readWorkflows());
  const [selectedNodeId, setSelectedNodeId] = useState(() => workflow.nodes[0]?.id || "");
  const [newNodeType, setNewNodeType] = useState<WorkflowNodeType>("transform");
  const [sourceId, setSourceId] = useState(() => workflow.nodes[0]?.id || "");
  const [targetId, setTargetId] = useState(() => workflow.nodes[1]?.id || "");
  const [sourcePort, setSourcePort] = useState("output");
  const [inputValue, setInputValue] = useState("Please summarize this document.");
  const [lastRun, setLastRun] = useState<WorkflowRun | null>(null);
  const [liveRuns, setLiveRuns] = useState<WorkflowRun["nodeRuns"]>([]);
  const [history, setHistory] = useState<WorkflowRun[]>(() => readWorkflowRuns());
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const [editorMode, setEditorMode] = useState<"canvas" | "outline">("canvas");
  const [undoStack, setUndoStack] = useState<WorkflowDefinition[]>([]);
  const [redoStack, setRedoStack] = useState<WorkflowDefinition[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const selectedNode = workflow.nodes.find((node) => node.id === selectedNodeId);
  const validation = useMemo(() => validateWorkflow(workflow), [workflow]);
  const errors = validation.filter((item) => item.severity === "error");
  const warnings = validation.filter((item) => item.severity === "warning");

  const updateWorkflow = (next: WorkflowDefinition) => {
    setUndoStack((stack) => [...stack, workflow].slice(-40));
    setRedoStack([]);
    setWorkflow({ ...next, updatedAt: new Date().toISOString() });
  };
  const undoWorkflow = () => {
    const previous = undoStack[undoStack.length - 1];
    if (!previous) return;
    setRedoStack((stack) => [workflow, ...stack].slice(0, 40));
    setUndoStack((stack) => stack.slice(0, -1));
    setWorkflow({ ...previous, updatedAt: new Date().toISOString() });
    const selected = previous.nodes.find((node) => node.id === selectedNodeId);
    if (!selected) setSelectedNodeId(previous.nodes[0]?.id || "");
    setSourceId((id) => previous.nodes.some((node) => node.id === id) ? id : previous.nodes[0]?.id || "");
    setTargetId((id) => previous.nodes.some((node) => node.id === id) ? id : previous.nodes[1]?.id || previous.nodes[0]?.id || "");
    setSourcePort("output");
    setNotice("Undid the previous workflow edit.");
  };
  const redoWorkflow = () => {
    const next = redoStack[0];
    if (!next) return;
    setUndoStack((stack) => [...stack, workflow].slice(-40));
    setRedoStack((stack) => stack.slice(1));
    setWorkflow({ ...next, updatedAt: new Date().toISOString() });
    const selected = next.nodes.find((node) => node.id === selectedNodeId);
    if (!selected) setSelectedNodeId(next.nodes[0]?.id || "");
    setSourceId((id) => next.nodes.some((node) => node.id === id) ? id : next.nodes[0]?.id || "");
    setTargetId((id) => next.nodes.some((node) => node.id === id) ? id : next.nodes[1]?.id || next.nodes[0]?.id || "");
    setSourcePort("output");
    setNotice("Reapplied the workflow edit.");
  };
  const updateNodeLabel = (nodeId: string, label: string) => updateWorkflow({
    ...workflow,
    nodes: workflow.nodes.map((node) => node.id === nodeId ? { ...node, label } as WorkflowNode : node)
  });
  const updateConfig = (nodeId: string, key: string, value: string | number) => updateWorkflow({
    ...workflow,
    nodes: workflow.nodes.map((node) => node.id === nodeId ? {
      ...node,
      config: { ...node.config, [key]: value }
    } as WorkflowNode : node)
  });
  const updatePosition = (nodeId: string, axis: "x" | "y", value: number) => {
    if (!Number.isFinite(value)) return;
    updateWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) => node.id === nodeId ? {
        ...node,
        position: { ...node.position, [axis]: Math.max(16, Math.min(axis === "x" ? 1700 : 1280, Math.round(value))) }
      } as WorkflowNode : node)
    });
  };

  const addNode = () => {
    const node = createNode(newNodeType, workflow.nodes.length + 1);
    node.id = idFor(newNodeType);
    node.position = { x: 70 + (workflow.nodes.length % 3) * 220, y: 70 + Math.floor(workflow.nodes.length / 3) * 140 };
    const next = { ...workflow, nodes: [...workflow.nodes, node], updatedAt: new Date().toISOString() };
    updateWorkflow(next);
    setSelectedNodeId(node.id);
    setTargetId(node.id);
    setNotice("Node added. Configure its settings and connect it to the graph.");
  };

  const removeNode = (nodeId: string) => {
    const node = workflow.nodes.find((item) => item.id === nodeId);
    if (!node) return;
    if (node.type === "input" && workflow.nodes.filter((item) => item.type === "input").length <= 1) {
      setNotice("A workflow must keep at least one input node.");
      return;
    }
    if (!window.confirm("Remove “" + node.label + "” and all its connections?")) return;
    const nodes = workflow.nodes.filter((item) => item.id !== nodeId);
    const nextEntry = workflow.entryNodeId === nodeId ? nodes.find((item) => item.type === "input")?.id || "" : workflow.entryNodeId;
    updateWorkflow({ ...workflow, nodes, edges: workflow.edges.filter((edge) => edge.from !== nodeId && edge.to !== nodeId), entryNodeId: nextEntry });
    if (selectedNodeId === nodeId) setSelectedNodeId(nodes[0]?.id || "");
    setNotice("Node and its connected edges removed.");
  };

  const addConnection = () => {
    if (!sourceId || !targetId || sourceId === targetId) {
      setNotice("Choose two different nodes.");
      return;
    }
    const existing = workflow.edges.some((edge) => edge.from === sourceId && edge.to === targetId && (edge.fromPort || "output") === sourcePort);
    if (existing) {
      setNotice("That connection already exists.");
      return;
    }
    const edge = { id: idFor("edge"), from: sourceId, to: targetId, ...(sourcePort === "output" ? {} : { fromPort: sourcePort }) };
    updateWorkflow({ ...workflow, edges: [...workflow.edges, edge] });
    setNotice("Connection added. Review any graph validation messages before running.");
  };

  const removeConnection = (edgeId: string) => updateWorkflow({ ...workflow, edges: workflow.edges.filter((edge) => edge.id !== edgeId) });

  const saveCurrent = () => {
    const issues = validateWorkflow(workflow);
    if (workflowHasErrors(issues)) {
      setNotice("Fix blocking validation errors before saving: " + issues.filter((item) => item.severity === "error").slice(0, 2).map((item) => item.message).join(" "));
      return;
    }
    const nextWorkflow = { ...workflow, updatedAt: new Date().toISOString() };
    const next = [nextWorkflow, ...saved.filter((item) => item.id !== nextWorkflow.id)].slice(0, 50);
    const success = writeWorkflows(next);
    setSaved(next);
    setWorkflow(nextWorkflow);
    setNotice(success ? "Workflow saved to this browser." : "Workflow was saved if storage allowed it, but the browser may have reached its storage limit.");
  };

  const openSaved = (id: string) => {
    const item = saved.find((value) => value.id === id);
    if (!item) return;
    setUndoStack([]);
    setRedoStack([]);
    setWorkflow(item);
    setSelectedNodeId(item.nodes[0]?.id || "");
    setSourceId(item.nodes[0]?.id || "");
    setTargetId(item.nodes[1]?.id || item.nodes[0]?.id || "");
    setSourcePort(portsFor(item.nodes[0])[0]);
    setLastRun(null);
    setLiveRuns([]);
    setNotice("Saved workflow loaded.");
  };

  const newLinear = () => {
    const next = createLinearWorkflow(["input", "transform", "output"], "Untitled workflow");
    setUndoStack([]);
    setRedoStack([]);
    setWorkflow(next);
    setSelectedNodeId(next.nodes[0].id);
    setSourceId(next.nodes[0].id);
    setTargetId(next.nodes[1].id);
    setSourcePort("output");
    setLastRun(null);
    setLiveRuns([]);
    setNotice("Created a blank starter workflow.");
  };

  const exportCurrent = () => {
    try {
      const blob = new Blob([serializeWorkflow(workflow)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = (workflow.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "workflow") + ".json";
      link.click();
      URL.revokeObjectURL(url);
      setNotice("Workflow JSON exported.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not export the workflow.");
    }
  };

  const importCurrent = async (file?: File) => {
    if (!file) return;
    try {
      const imported = parseWorkflow(await file.text());
      setUndoStack([]);
      setRedoStack([]);
      setWorkflow(imported);
      setSelectedNodeId(imported.nodes[0]?.id || "");
      setSourceId(imported.nodes[0]?.id || "");
      setTargetId(imported.nodes[1]?.id || imported.nodes[0]?.id || "");
      setSourcePort(portsFor(imported.nodes[0])[0]);
      setLastRun(null);
      setLiveRuns([]);
      setNotice("Workflow imported and validated. Save it to keep it in this browser.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not import this workflow.");
    }
  };

  const execute = async () => {
    if (running) return;
    if (errors.length) {
      setNotice("Fix blocking validation errors before running: " + errors.slice(0, 2).map((item) => item.message).join(" "));
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setLiveRuns([]);
    setNotice("");
    try {
      const inputs = Object.fromEntries(workflow.nodes.filter((node) => node.type === "input").map((node) => [node.config.key, inputValue]));
      const run = await runWorkflow(workflow, {
        inputs,
        signal: controller.signal,
        generate: modelReady ? async (prompt, systemPrompt, signal) => {
          const effectiveSignal = signal || controller.signal;
          const abort = () => interruptLocalGeneration();
          effectiveSignal.addEventListener("abort", abort, { once: true });
          try {
            if (effectiveSignal.aborted) {
              const error = new Error("Workflow execution was cancelled.");
              error.name = "AbortError";
              throw error;
            }
            return await generateLocal(prompt, systemPrompt, effectiveSignal);
          } finally {
            effectiveSignal.removeEventListener("abort", abort);
          }
        } : undefined,
        onNodeRun: (result) => setLiveRuns((previous) => [...previous.filter((item) => item.nodeId !== result.nodeId), result])
      });
      setLastRun(run);
      const nextHistory = [run, ...history.filter((item) => item.id !== run.id)].slice(0, 10);
      setHistory(nextHistory);
      const stored = writeWorkflowRuns(nextHistory);
      setNotice(run.status === "success" ? (stored ? "Workflow completed." : "Workflow completed, but run history could not be stored because browser storage is full.") :
        run.status === "cancelled" ? "Workflow cancelled. Completed node outputs remain visible in the run trace." :
        "Workflow failed. Inspect the node trace and error list.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Workflow execution failed.");
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const renderField = (key: string, label: string, value: string | number | undefined, options: { rows?: number; type?: string; min?: number; max?: number } = {}) => (
    <div className="field" key={key}>
      <label htmlFor={"workflow-config-" + key}>{label}</label>
      {options.rows ? <textarea id={"workflow-config-" + key} rows={options.rows} value={value ?? ""} onChange={(event) => updateConfig(selectedNode!.id, key, event.target.value)} /> :
        <input id={"workflow-config-" + key} type={options.type || "text"} min={options.min} max={options.max} value={value ?? ""} onChange={(event) => updateConfig(selectedNode!.id, key, options.type === "number" ? Number(event.target.value) : event.target.value)} />}
    </div>
  );

  const renderConfig = (node: WorkflowNode) => {
    switch (node.type) {
      case "input": return <>{renderField("key", "Input key", node.config.key)}{renderField("defaultValue", "Default value", node.config.defaultValue, { rows: 2 })}</>;
      case "prompt": return <>{renderField("systemPrompt", "System / role instruction", node.config.systemPrompt, { rows: 2 })}{renderField("template", "Prompt template (use {{input}})", node.config.template, { rows: 5 })}{renderField("temperature", "Temperature", node.config.temperature, { type: "number", min: 0, max: 2 })}{renderField("maxTokens", "Maximum tokens", node.config.maxTokens, { type: "number", min: 1, max: 8192 })}</>;
      case "transform": return <><div className="field"><label htmlFor="workflow-transform">Operation</label><select id="workflow-transform" value={node.config.operation} onChange={(event) => updateConfig(node.id, "operation", event.target.value)}>{["trim", "uppercase", "lowercase", "prefix", "suffix", "replace"].map((value) => <option key={value}>{value}</option>)}</select></div>{renderField("value", "Value / replacement", node.config.value)}{node.config.operation === "replace" ? renderField("search", "Text to replace", node.config.search) : null}</>;
      case "validator": return <><div className="field"><label htmlFor="workflow-validation-rule">Rule</label><select id="workflow-validation-rule" value={node.config.rule} onChange={(event) => updateConfig(node.id, "rule", event.target.value)}>{["non-empty", "contains", "equals", "max-length"].map((value) => <option key={value}>{value}</option>)}</select></div>{node.config.rule === "max-length" ? renderField("maxLength", "Maximum length", node.config.maxLength, { type: "number", min: 1, max: 100000 }) : renderField("value", "Expected / required text", node.config.value)}</>;
      case "router": return <><div className="field"><label htmlFor="workflow-router-condition">Condition</label><select id="workflow-router-condition" value={node.config.condition} onChange={(event) => updateConfig(node.id, "condition", event.target.value)}>{["contains", "equals", "is-empty"].map((value) => <option key={value}>{value}</option>)}</select></div>{node.config.condition !== "is-empty" ? renderField("value", "Comparison value", node.config.value) : null}</>;
      case "merge": return <><div className="field"><label htmlFor="workflow-merge-strategy">Strategy</label><select id="workflow-merge-strategy" value={node.config.strategy} onChange={(event) => updateConfig(node.id, "strategy", event.target.value)}>{["join", "first-non-empty", "json"].map((value) => <option key={value}>{value}</option>)}</select></div>{node.config.strategy === "join" ? renderField("separator", "Separator", node.config.separator, { rows: 2 }) : null}</>;
      case "loop": return <>{renderField("maxIterations", "Maximum iterations (1–10)", node.config.maxIterations, { type: "number", min: 1, max: 10 })}{renderField("draftInstruction", "Draft instruction", node.config.draftInstruction, { rows: 3 })}{renderField("reviewInstruction", "Review criteria / instructions", node.config.reviewInstruction, { rows: 3 })}{renderField("refineInstruction", "Refinement instruction", node.config.refineInstruction, { rows: 3 })}<div className="field"><label htmlFor="workflow-loop-evaluator">Deterministic stop check</label><select id="workflow-loop-evaluator" value={node.config.evaluator} onChange={(event) => updateConfig(node.id, "evaluator", event.target.value)}>{["non-empty", "contains", "equals", "max-length"].map((value) => <option key={value}>{value}</option>)}</select></div>{node.config.evaluator === "max-length" ? renderField("maxLength", "Maximum length", node.config.maxLength, { type: "number", min: 1, max: 100000 }) : node.config.evaluator !== "non-empty" ? renderField("expectedValue", "Required / expected value", node.config.expectedValue) : null}<p className="field-help">The runner always enforces the iteration limit. Model review text is advisory; only this deterministic check controls the pass/limit port.</p></>;
      case "output": return renderField("displayName", "Output label", node.config.displayName);
    }
  };

  const selectedSource = workflow.nodes.find((node) => node.id === sourceId);
  const availablePorts = portsFor(selectedSource);
  const latestByNode = new Map((lastRun?.nodeRuns || liveRuns).map((item) => [item.nodeId, item]));
  const canvasWidth = Math.max(820, Math.min(1800, ...workflow.nodes.map((node) => node.position.x + 245)));
  const canvasHeight = Math.max(300, Math.min(1400, ...workflow.nodes.map((node) => node.position.y + 125)));
  const moveNode = (nodeId: string, x: number, y: number) => {
    updateWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node) => node.id === nodeId ? {
        ...node,
        position: { x: Math.max(16, Math.min(1700, Math.round(x))), y: Math.max(16, Math.min(1280, Math.round(y))) }
      } as WorkflowNode : node)
    });
  };
  const autoArrange = () => {
    updateWorkflow({
      ...workflow,
      nodes: workflow.nodes.map((node, index) => ({
        ...node,
        position: { x: 28 + (index % 3) * 265, y: 28 + Math.floor(index / 3) * 150 }
      } as WorkflowNode))
    });
    setNotice("Nodes arranged on a readable grid. You can drag them to refine the layout.");
  };
  const runStatusLabel = (status: WorkflowRun["status"]) => status === "success" ? "Completed" : status === "cancelled" ? "Cancelled" : "Failed";

  return <section className="workflow-builder">
    <header className="page-heading">
      <div><p className="eyebrow">WORKFLOW ENGINEERING</p><h1>Graph & Loop Builder</h1><p>Compose deterministic steps, conditional branches, local-model prompts, and bounded revision loops. Workflow edges are validated as a DAG; a Loop Controller owns its finite internal iterations.</p></div>
      <span className="local-indicator"><i /> Local execution</span>
    </header>

    <div className="workflow-toolbar">
      <div className="workflow-toolbar-group"><label htmlFor="saved-workflows">SAVED WORKFLOWS</label><select id="saved-workflows" value="" onChange={(event) => openSaved(event.target.value)}><option value="">Open saved workflow…</option>{saved.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="workflow-toolbar-actions"><button className="button secondary" type="button" onClick={newLinear}>New</button><button className="button secondary" type="button" onClick={() => { const next = createStarterWorkflow("Branch and merge demo"); setUndoStack([]); setRedoStack([]); setWorkflow(next); setSelectedNodeId(next.nodes[0].id); setSourceId(next.nodes[0].id); setTargetId(next.nodes[1].id); setSourcePort("output"); setLastRun(null); }}>Load sample graph</button><button className="button primary" type="button" onClick={saveCurrent}>Save locally</button><button className="button secondary" type="button" onClick={exportCurrent}>Export JSON</button><label className="button secondary workflow-file-button">Import JSON<input type="file" accept=".json,application/json" onChange={(event) => { void importCurrent(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div>
    </div>

    <div className="workflow-name-row"><div className="field"><label htmlFor="workflow-name">Workflow name</label><input id="workflow-name" value={workflow.name} onChange={(event) => updateWorkflow({ ...workflow, name: event.target.value })} /></div><div className="field"><label htmlFor="workflow-description">Description</label><input id="workflow-description" value={workflow.description} onChange={(event) => updateWorkflow({ ...workflow, description: event.target.value })} /></div></div>

    <div className="workflow-status-strip"><span>{workflow.nodes.length} nodes</span><span>{workflow.edges.length} connections</span><span className={errors.length ? "status-error" : "status-good"}>{errors.length ? errors.length + " blocking errors" : "Graph structure valid"}</span><span>{warnings.length} warnings</span></div>
    <div className="workflow-validation" aria-live="polite">
      {errors.slice(0, 8).map((item) => <p className="check-error" key={item.code + item.message}>! {item.message}</p>)}
      {warnings.slice(0, 5).map((item) => <p className="check-warning" key={item.code + item.message}>↳ {item.message}</p>)}
      {!validation.length ? <p className="check-ok">✓ No structural issues detected.</p> : null}
    </div>

    <div className="workflow-layout">
      <section className="workflow-main-panel">
        <div className="panel-heading"><div><p className="eyebrow">WORKFLOW OUTLINE</p><h2>Nodes and connections</h2></div><span>{workflow.nodes.length}/{100}</span></div>
        <div className="workflow-add-node"><div className="field"><label htmlFor="workflow-node-type">Add node type</label><select id="workflow-node-type" value={newNodeType} onChange={(event) => setNewNodeType(event.target.value as WorkflowNodeType)}>{nodeTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div><button className="button secondary" type="button" disabled={workflow.nodes.length >= 100} onClick={addNode}>+ Add node</button></div>
        <div className="workflow-editor-toolbar">
          <div className="workflow-view-toggle" role="group" aria-label="Workflow editor view">
            <button type="button" className={editorMode === "canvas" ? "selected" : ""} aria-pressed={editorMode === "canvas"} onClick={() => setEditorMode("canvas")}>Canvas</button>
            <button type="button" className={editorMode === "outline" ? "selected" : ""} aria-pressed={editorMode === "outline"} onClick={() => setEditorMode("outline")}>Outline</button>
          </div>
          <div className="workflow-history-controls">
            <button className="button secondary" type="button" disabled={!undoStack.length} onClick={undoWorkflow}>Undo</button>
            <button className="button secondary" type="button" disabled={!redoStack.length} onClick={redoWorkflow}>Redo</button>
          </div>
          <button className="button secondary" type="button" onClick={autoArrange}>Auto-arrange nodes</button>
        </div>
        {editorMode === "canvas" ? <div className="workflow-canvas-scroll" aria-label="Visual workflow canvas">
          <div
            className="workflow-canvas"
            ref={canvasRef}
            style={{ width: canvasWidth, height: canvasHeight }}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const nodeId = event.dataTransfer.getData("text/plain");
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!nodeId || !rect || !workflow.nodes.some((node) => node.id === nodeId)) return;
              moveNode(nodeId, event.clientX - rect.left - 92, event.clientY - rect.top - 30);
            }}
          >
            <svg className="workflow-canvas-edges" width={canvasWidth} height={canvasHeight} role="img" aria-label="Workflow connections">
              <defs>
                <marker id="workflow-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L6,3 z" fill="currentColor" />
                </marker>
              </defs>
              {workflow.edges.map((edge) => {
                const from = workflow.nodes.find((node) => node.id === edge.from);
                const to = workflow.nodes.find((node) => node.id === edge.to);
                if (!from || !to) return null;
                const x1 = from.position.x + 190;
                const y1 = from.position.y + 48;
                const x2 = to.position.x;
                const y2 = to.position.y + 48;
                const bend = Math.max(38, Math.min(120, Math.abs(x2 - x1) * 0.45));
                const curveOffset = (y2 >= y1 ? 1 : -1) * Math.max(12, Math.min(42, Math.abs(y2 - y1) * 0.25));
                const path = `M ${x1} ${y1} C ${x1 + bend} ${y1 + curveOffset}, ${x2 - bend} ${y2 - curveOffset}, ${x2} ${y2}`;
                return <path key={edge.id} className="workflow-canvas-edge" d={path} markerEnd="url(#workflow-arrow)" />;
              })}
            </svg>
            {workflow.nodes.map((node, index) => {
              const state = latestByNode.get(node.id);
              return <div
                key={node.id}
                className={"workflow-canvas-node" + (node.id === selectedNodeId ? " selected" : "")}
                style={{ left: node.position.x, top: node.position.y }}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", node.id);
                }}
              >
                <button className="workflow-node-card" type="button" onClick={() => setSelectedNodeId(node.id)} aria-pressed={node.id === selectedNodeId}>
                  <span className="workflow-node-top"><span>NODE {String(index + 1).padStart(2, "0")}</span><span className={"workflow-node-run " + (state?.status || "not-run")}>{state?.status || "not run"}</span></span>
                  <strong>{node.label}</strong>
                  <span className="workflow-node-type">{node.type}{node.type === "loop" ? " · max " + node.config.maxIterations + " attempts" : ""}</span>
                  <span className="workflow-node-id">{node.id}</span>
                  <span className="workflow-drag-hint">Drag to reposition</span>
                </button>
              </div>;
            })}
          </div>
          <p className="field-help">Drag node cards to reposition them. Switch to Outline for keyboard-friendly node selection and connection editing. Positions are saved with the workflow.</p>
        </div> : <div className="workflow-node-list">
          {workflow.nodes.map((node, index) => {
            const state = latestByNode.get(node.id);
            return <div key={node.id} className={"workflow-node-shell" + (node.id === selectedNodeId ? " selected" : "")}>
              <button className="workflow-node-card" type="button" onClick={() => setSelectedNodeId(node.id)} aria-pressed={node.id === selectedNodeId}>
                <span className="workflow-node-top"><span>NODE {String(index + 1).padStart(2, "0")}</span><span className={"workflow-node-run " + (state?.status || "not-run")}>{state?.status || "not run"}</span></span>
                <strong>{node.label}</strong>
                <span className="workflow-node-type">{node.type}{node.type === "loop" ? " · max " + node.config.maxIterations + " attempts" : ""}</span>
                <span className="workflow-node-id">{node.id}</span>
              </button>
              {index < workflow.nodes.length - 1 ? <div className="workflow-flow-cue" aria-hidden="true">↓ connections ↓</div> : null}
            </div>;
          })}
        </div>}

        <div className="workflow-connections">
          <div className="section-title-row"><h3>Connections</h3><span>{workflow.edges.length} edges</span></div>
          <div className="workflow-connect-form">
            <div className="field"><label htmlFor="edge-source">From node</label><select id="edge-source" value={sourceId} onChange={(event) => { setSourceId(event.target.value); const node = workflow.nodes.find((item) => item.id === event.target.value); setSourcePort(portsFor(node)[0]); }}>{workflow.nodes.map((node) => <option key={node.id} value={node.id}>{node.label} · {node.id}</option>)}</select></div>
            <div className="field"><label htmlFor="edge-port">Output port</label><select id="edge-port" value={availablePorts.includes(sourcePort) ? sourcePort : availablePorts[0]} onChange={(event) => setSourcePort(event.target.value)}>{availablePorts.map((port) => <option key={port}>{port}</option>)}</select></div>
            <div className="field"><label htmlFor="edge-target">To node</label><select id="edge-target" value={targetId} onChange={(event) => setTargetId(event.target.value)}>{workflow.nodes.map((node) => <option key={node.id} value={node.id}>{node.label} · {node.id}</option>)}</select></div>
            <button className="button secondary" type="button" onClick={addConnection}>Connect</button>
          </div>
          {workflow.edges.length ? <ul className="workflow-edge-list">{workflow.edges.map((edge) => <li key={edge.id}><span><b>{workflow.nodes.find((node) => node.id === edge.from)?.label || edge.from}</b><small>{edge.fromPort || "output"} →</small><b>{workflow.nodes.find((node) => node.id === edge.to)?.label || edge.to}</b></span><button type="button" className="delete-button" onClick={() => removeConnection(edge.id)} aria-label={"Remove connection " + edge.id}>Remove</button></li>)}</ul> : <p className="muted">No edges yet. Add connections from the form above.</p>}
        </div>
      </section>

      <aside className="workflow-inspector">
        <div className="panel-heading"><div><p className="eyebrow">NODE INSPECTOR</p><h2>{selectedNode ? selectedNode.label : "Select a node"}</h2></div></div>
        {selectedNode ? <>
          <div className="field"><label htmlFor="workflow-node-label">Node label</label><input id="workflow-node-label" value={selectedNode.label} onChange={(event) => updateNodeLabel(selectedNode.id, event.target.value)} /></div>
          <p className="workflow-node-id inspector-id">{selectedNode.type} · {selectedNode.id}</p>
          <div className="workflow-position-fields">
            <div className="field"><label htmlFor="workflow-position-x">Canvas X</label><input id="workflow-position-x" type="number" min={16} max={1700} value={selectedNode.position.x} onChange={(event) => updatePosition(selectedNode.id, "x", Number(event.target.value))} /></div>
            <div className="field"><label htmlFor="workflow-position-y">Canvas Y</label><input id="workflow-position-y" type="number" min={16} max={1280} value={selectedNode.position.y} onChange={(event) => updatePosition(selectedNode.id, "y", Number(event.target.value))} /></div>
          </div>
          {renderConfig(selectedNode)}
          <button className="button secondary danger-outline" type="button" onClick={() => removeNode(selectedNode.id)}>Remove node</button>
        </> : <p className="muted">Select a node card to edit its configuration.</p>}
        <div className="workflow-limit-note"><strong>Loop safety</strong><p>Loops are executed inside the Loop Controller node and cannot exceed 10 attempts. Visible graph edges must remain acyclic.</p></div>
      </aside>
    </div>

    <section className="workflow-run-panel">
      <div className="panel-heading"><div><p className="eyebrow">EXECUTION</p><h2>Run and inspect</h2></div><span className={modelReady ? "status-good" : "status-muted"}>{modelReady ? "Local model ready" : "Model not loaded"}</span></div>
      <p className="muted">Deterministic nodes work without a model. Prompt and loop nodes need the local WebGPU model to be loaded in Local playground.</p>
      <div className="workflow-run-input"><label htmlFor="workflow-input-value">Input value</label><textarea id="workflow-input-value" rows={3} value={inputValue} onChange={(event) => setInputValue(event.target.value)} placeholder="Text passed to each Input node…" /></div>
      <div className="editor-actions"><button className="button primary" type="button" disabled={running || errors.length > 0} onClick={() => void execute()}>{running ? "Running workflow…" : "Run workflow"}</button>{running ? <button className="button secondary" type="button" onClick={() => { abortRef.current?.abort(); interruptLocalGeneration(); }}>Cancel run</button> : null}<span className="workflow-model-disclaimer">No hosted LLM API is configured.</span></div>
      {notice ? <div className="workflow-notice" role="status">{notice}</div> : null}
      {(lastRun || liveRuns.length > 0) && <div className="workflow-trace"><h3>{lastRun ? "Last run · " + runStatusLabel(lastRun.status) : "Live execution trace"}</h3>{(lastRun?.nodeRuns || liveRuns).map((nodeRun) => <article className={"workflow-trace-item " + nodeRun.status} key={nodeRun.nodeId}><div><strong>{workflow.nodes.find((node) => node.id === nodeRun.nodeId)?.label || nodeRun.nodeId}</strong><span>{nodeRun.status} · {nodeRun.durationMs} ms{nodeRun.selectedPort ? " · port: " + nodeRun.selectedPort : ""}</span></div>{nodeRun.error ? <p>{nodeRun.error}</p> : null}{nodeRun.iterations?.length ? <ol>{nodeRun.iterations.map((iteration) => <li key={iteration.attempt}>Attempt {iteration.attempt}: {iteration.passed ? "passed" : "not passed"} · {iteration.candidate.slice(0, 180)}{iteration.candidate.length > 180 ? "…" : ""}<small>{iteration.feedback}</small></li>)}</ol> : null}<pre>{nodeRun.output || (nodeRun.status === "skipped" ? "Skipped because no incoming branch was selected." : "No output")}</pre></article>)}
        {lastRun?.errors.map((item) => <p className="check-error" key={item}>! {item}</p>)}
        {lastRun?.output ? <div className="workflow-final-output"><h4>Final output</h4><pre>{lastRun.output}</pre><button className="button secondary" type="button" onClick={() => void navigator.clipboard.writeText(lastRun.output).then(() => setNotice("Final output copied."), () => setNotice("Clipboard permission was blocked."))}>Copy final output</button></div> : null}</div>}
    </section>

    <section className="workflow-history-panel"><div className="section-title-row"><div><p className="eyebrow">LOCAL HISTORY</p><h2>Recent workflow runs</h2></div><button type="button" className="text-button" onClick={() => { setHistory([]); writeWorkflowRuns([]); setNotice("Local workflow run history cleared."); }}>Clear history</button></div>{history.length ? history.map((item) => <button key={item.id} type="button" className="workflow-history-item" onClick={() => { setLastRun(item); setLiveRuns(item.nodeRuns); setNotice("Showing a locally saved run snapshot."); }}><span><strong>{item.workflowName}</strong><small>{timeLabel(item.startedAt)}</small></span><span className={"workflow-node-run " + item.status}>{runStatusLabel(item.status)}</span></button>) : <p className="muted">No workflow runs saved yet.</p>}</section>
  </section>;
}
