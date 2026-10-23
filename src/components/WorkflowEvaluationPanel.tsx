import { useMemo, useRef, useState } from "react";
import type { WorkflowDefinition } from "../lib/workflow/types";
import { interruptLocalGeneration } from "../lib/local-model";
import type { LocalGenerate } from "../lib/workflow/runner";
import {
  evaluateWorkflow,
  exportWorkflowEvaluationDataset,
  parseWorkflowEvaluationDataset,
  readWorkflowEvaluationCases,
  readWorkflowEvaluationRuns,
  writeWorkflowEvaluationCases,
  writeWorkflowEvaluationRuns,
  type WorkflowEvaluationCase,
  type WorkflowEvaluationCaseResult,
  type WorkflowEvaluationRun
} from "../lib/workflow/evaluation";
import { validateWorkflow, workflowHasErrors } from "../lib/workflow/validate";

type Props = {
  workflow: WorkflowDefinition;
  modelReady: boolean;
  generateLocal: LocalGenerate;
};

function newCase(index: number): WorkflowEvaluationCase {
  return {
    id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "case-" + Date.now().toString(36),
    name: "New case " + index,
    input: "",
    expected: "",
    matchRule: "exact"
  };
}
function formatPercent(value: number): string { return (value * 100).toFixed(1) + "%"; }
function downloadJson(name: string, value: string): void {
  const blob = new Blob([value], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function WorkflowEvaluationPanel({ workflow, modelReady, generateLocal }: Props) {
  const [cases, setCases] = useState<WorkflowEvaluationCase[]>(() => readWorkflowEvaluationCases());
  const [history, setHistory] = useState<WorkflowEvaluationRun[]>(() => readWorkflowEvaluationRuns());
  const [lastRun, setLastRun] = useState<WorkflowEvaluationRun | null>(null);
  const [liveResults, setLiveResults] = useState<WorkflowEvaluationCaseResult[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [notice, setNotice] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const issues = useMemo(() => validateWorkflow(workflow), [workflow]);
  const hasGraphErrors = workflowHasErrors(issues);
  const needsModel = workflow.nodes.some((node) => node.type === "prompt" || node.type === "loop");
  const hasManualReview = workflow.nodes.some((node) => node.type === "human-review");
  const blockedReason = hasGraphErrors ? "Fix graph validation errors before evaluating." :
    hasManualReview ? "This graph contains a Human Review node. Run it manually instead of evaluating it unattended." :
    needsModel && !modelReady ? "Load the optional local model before evaluating prompt or loop nodes." : "";

  const updateCase = (id: string, patch: Partial<WorkflowEvaluationCase>) => {
    setCases((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    setNotice("Dataset changed in the editor. Save the dataset before leaving if you want to keep these changes.");
  };
  const saveDataset = () => setNotice(writeWorkflowEvaluationCases(cases) ? "Workflow evaluation dataset saved locally." : "Dataset was not saved. Check for duplicate IDs, empty required fields, invalid matching rules, or browser storage limits.");
  const addCase = () => {
    setCases((current) => [...current, newCase(current.length + 1)].slice(0, 100));
    setNotice("Case added. Give it a unique name and ID, then save the dataset.");
  };
  const removeCase = (id: string) => {
    if (cases.length <= 1) {
      setNotice("Keep at least one test case in the dataset.");
      return;
    }
    setCases((current) => current.filter((item) => item.id !== id));
    setNotice("Case removed. Save the dataset to persist this change.");
  };
  const importDataset = async (file?: File) => {
    if (!file) return;
    try {
      const imported = parseWorkflowEvaluationDataset(await file.text());
      setCases(imported);
      setNotice("Imported " + imported.length + " workflow evaluation cases. Save the dataset to persist it.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Could not import this dataset.");
    }
  };

  const runEvaluation = async () => {
    if (running) return;
    if (blockedReason) { setNotice(blockedReason); return; }
    if (!writeWorkflowEvaluationCases(cases)) {
      setNotice("The dataset cannot be saved. Check that IDs are unique and contains-match cases have a non-empty expected substring.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    setProgress(0);
    setLiveResults([]);
    setNotice("");
    try {
      const localGenerator: LocalGenerate | undefined = modelReady ? async (prompt, systemPrompt, signal) => {
        const effectiveSignal = signal || controller.signal;
        const abort = () => interruptLocalGeneration();
        effectiveSignal.addEventListener("abort", abort, { once: true });
        try {
          if (effectiveSignal.aborted) {
            const error = new Error("Workflow evaluation was cancelled.");
            error.name = "AbortError";
            throw error;
          }
          return await generateLocal(prompt, systemPrompt, effectiveSignal);
        } finally {
          effectiveSignal.removeEventListener("abort", abort);
        }
      } : undefined;
      const result = await evaluateWorkflow(workflow, cases, {
        generate: localGenerator,
        signal: controller.signal,
        onCaseResult: (item, completed, total) => {
          setLiveResults((current) => [...current.filter((entry) => entry.id !== item.id), item]);
          setProgress(total ? completed / total : 0);
        }
      });
      setLastRun(result);
      const nextHistory = [result, ...history.filter((item) => item.id !== result.id)].slice(0, 10);
      setHistory(nextHistory);
      const stored = writeWorkflowEvaluationRuns(nextHistory);
      setNotice(result.status === "cancelled"
        ? "Evaluation cancelled after " + result.completed + " case(s). Completed results are preserved."
        : "Evaluation finished: " + result.matched + "/" + result.completed + " cases passed (" + formatPercent(result.accuracy) + ")." + (stored ? "" : " Run history could not be stored because browser storage is full."));
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Workflow evaluation failed.");
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  const shownResults = lastRun?.cases || liveResults;
  const activeSummary = lastRun ? lastRun.matched + "/" + lastRun.completed + " passed · " + formatPercent(lastRun.accuracy) : running ? Math.round(progress * 100) + "% in progress" : "No results yet";

  return <section className="workflow-evaluation-panel">
    <div className="section-title-row">
      <div><p className="eyebrow">REPEATABLE TESTING</p><h2>Workflow Evaluation</h2></div>
      <span className="workflow-eval-summary">{activeSummary}</span>
    </div>
    <p className="muted">Run the same input cases against this workflow version. Evaluation is local, records a workflow snapshot, and scores each case using its declared rule. A small dataset is a regression check, not proof of general quality.</p>

    <div className="workflow-eval-toolbar">
      <button type="button" className="button secondary" onClick={addCase} disabled={cases.length >= 100}>+ Add case</button>
      <button type="button" className="button secondary" onClick={saveDataset}>Save dataset</button>
      <button type="button" className="button secondary" onClick={() => {
        try { downloadJson("workflow-evaluation-dataset.json", exportWorkflowEvaluationDataset(cases)); setNotice("Workflow dataset exported."); }
        catch (error) { setNotice(error instanceof Error ? error.message : "Could not export this dataset."); }
      }}>Export dataset</button>
      <label className="button secondary workflow-file-button">Import dataset<input type="file" accept=".json,application/json" onChange={(event) => { void importDataset(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label>
      <button type="button" className="button primary" onClick={() => void runEvaluation()} disabled={running || !!blockedReason || hasGraphErrors}>Run evaluation</button>
      {running ? <button type="button" className="button secondary" onClick={() => { abortRef.current?.abort(); interruptLocalGeneration(); }}>Cancel evaluation</button> : null}
    </div>
    {blockedReason ? <p className="workflow-eval-blocker" role="note">{blockedReason}</p> : null}
    {running ? <div className="workflow-eval-progress" aria-label="Evaluation progress"><span style={{ width: Math.round(progress * 100) + "%" }} /></div> : null}

    <div className="workflow-eval-cases">
      {cases.map((item, index) => <article className="workflow-eval-case" key={item.id}>
        <div className="workflow-eval-case-heading"><span>CASE {String(index + 1).padStart(2, "0")}</span><code>{item.id}</code><button type="button" className="delete-button" onClick={() => removeCase(item.id)} disabled={cases.length <= 1}>Remove</button></div>
        <div className="field"><label htmlFor={"workflow-eval-name-" + item.id}>Case name</label><input id={"workflow-eval-name-" + item.id} value={item.name} onChange={(event) => updateCase(item.id, { name: event.target.value })} /></div>
        <div className="field"><label htmlFor={"workflow-eval-input-" + item.id}>Input</label><textarea id={"workflow-eval-input-" + item.id} rows={2} value={item.input} onChange={(event) => updateCase(item.id, { input: event.target.value })} /></div>
        <div className="workflow-eval-expected">
          <div className="field"><label htmlFor={"workflow-eval-expected-" + item.id}>Expected output / substring</label><textarea id={"workflow-eval-expected-" + item.id} rows={2} value={item.expected} onChange={(event) => updateCase(item.id, { expected: event.target.value })} /></div>
          <div className="field"><label htmlFor={"workflow-eval-rule-" + item.id}>Match rule</label><select id={"workflow-eval-rule-" + item.id} value={item.matchRule} onChange={(event) => updateCase(item.id, { matchRule: event.target.value as WorkflowEvaluationCase["matchRule"] })}><option value="exact">Exact (normalized)</option><option value="contains">Contains</option><option value="non-empty">Non-empty output</option></select></div>
        </div>
      </article>)}
    </div>

    {(lastRun || liveResults.length > 0) && <div className="workflow-eval-results">
      <div className="section-title-row"><h3>Case results</h3>{lastRun ? <button type="button" className="button secondary" onClick={() => downloadJson("workflow-evaluation-run.json", JSON.stringify(lastRun, null, 2))}>Export run JSON</button> : null}</div>
      {shownResults.map((item) => <article key={item.id} className={"workflow-eval-result " + item.execution}>
        <div><strong>{item.name}</strong><span className={"workflow-node-run " + (item.matched === true ? "success" : item.execution === "cancelled" ? "cancelled" : "failed")}>{item.execution === "cancelled" ? "cancelled" : item.matched === true ? "pass" : "fail"}</span></div>
        <p>Rule: {item.matchRule} · Expected: <code>{item.expected || "(empty)"}</code></p>
        <pre>{item.actual || "(no output)"}</pre>
        {item.trace?.length ? <details className="workflow-eval-trace"><summary>Node trace ({item.trace.length} steps)</summary>{item.trace.map((node) => <article className="workflow-eval-trace-node" key={node.nodeId}><div><strong>{node.nodeId}</strong><span className={"workflow-node-run " + node.status}>{node.status}</span></div>{node.selectedPort ? <p>Selected route: <code>{node.selectedPort}</code></p> : null}{node.error ? <p className="check-error">{node.error}</p> : null}<pre>{node.output || "(empty output)"}</pre></article>)}</details> : null}
        {item.errors.map((error) => <p className="check-error" key={error}>{error}</p>)}
      </article>)}
    </div>}

    <div className="workflow-eval-history">
      <div className="section-title-row"><h3>Saved evaluation runs</h3><button type="button" className="text-button" onClick={() => { setHistory([]); writeWorkflowEvaluationRuns([]); setNotice("Local workflow evaluation history cleared."); }}>Clear history</button></div>
      {history.length ? history.map((item) => <button type="button" className="workflow-history-item" key={item.id} onClick={() => { setLastRun(item); setLiveResults(item.cases); setProgress(item.total ? item.completed / item.total : 0); setNotice("Loaded the saved workflow evaluation snapshot."); }}><span><strong>{item.workflowName}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></span><span className="workflow-node-run success">{item.matched}/{item.completed} · {formatPercent(item.accuracy)}</span></button>) : <p className="muted">No workflow evaluation runs saved yet.</p>}
    </div>
    {notice ? <div className="workflow-notice" role="status">{notice}</div> : null}
  </section>;
}
