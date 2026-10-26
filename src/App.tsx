import { useEffect, useMemo, useRef, useState } from "react";
import { categories, lessons } from "./data/lessons";
import { buildPrompt, countWords, emptyDraft, exportPrompts, mergeImportedPrompts, parsePromptExport, readSavedPrompts, templates, validatePrompt, writeSavedPrompts, type PromptDraft, type SavedPrompt } from "./lib/prompts";
import { DEFAULT_MODEL_ID, generateLocally, interruptLocalGeneration, loadLocalModel, supportsWebGPU, unloadLocalModel } from "./lib/local-model";
import { readLearningState, writeLearningState } from "./lib/learning-state";
import { exportEvaluationDataset, isExactMatch, parseEvaluationDataset, readEvaluationCases, readEvaluationRuns, starterEvaluationCases, summarizeEvaluation, writeEvaluationCases, writeEvaluationRuns, type EvaluationCase, type EvaluationRun } from "./lib/evaluation";
import { checkApi, listApiPrompts, mergeApiPrompts, normalizeApiBase, uploadMissingPrompts } from "./lib/api";
import { diffLines, type DiffLine } from "./lib/diff";
import { exercises, getExerciseForLesson, gradeExercise } from "./data/exercises";
import { readExerciseState, scoreExerciseState, writeExerciseState, type ExerciseAttempt } from "./lib/exercise-state";
import TechniqueLibrary from "./components/TechniqueLibrary";
import WorkflowBuilder from "./components/WorkflowBuilder";
import LessonLearningScaffold from "./components/LessonLearningScaffold";
import { lessonIdFromSearch, lessonSectionId } from "./lib/lesson-navigation";
import type { Technique } from "./data/techniques";

type View = "overview" | "guide" | "lab" | "evaluation" | "playground" | "library" | "techniques" | "workflows";
const nav: Array<{ id: View; label: string; icon: string }> = [{ id: "overview", label: "Overview", icon: "⌂" }, { id: "guide", label: "Learning guide", icon: "▤" }, { id: "lab", label: "Prompt Lab", icon: "⌘" }, { id: "evaluation", label: "Evaluation bench", icon: "◎" }, { id: "playground", label: "Local playground", icon: "◈" }, { id: "library", label: "My library", icon: "▣" }, { id: "techniques", label: "Techniques", icon: "✳" }, { id: "workflows", label: "Graph & loops", icon: "⌘" }];

export default function App() {
 const [view, setViewState] = useState<View>(() => typeof window !== "undefined" && lessonIdFromSearch(window.location.search) ? "guide" : "overview");
 const [lessonId, setLessonId] = useState<string>(() => (typeof window !== "undefined" ? lessonIdFromSearch(window.location.search) : null) || lessons[0].id);
 const setView = (nextView: View) => {
  setViewState(nextView);
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (nextView === "guide") url.searchParams.set("lesson", lessonId);
  else url.searchParams.delete("lesson");
  url.hash = "";
  window.history.pushState({}, "", url.pathname + url.search);
 };
 const [category, setCategory] = useState("All");
 const [search, setSearch] = useState("");
 const [draft, setDraft] = useState<PromptDraft>(emptyDraft);
 const [saved, setSaved] = useState<SavedPrompt[]>(() => readSavedPrompts());
 const [playPrompt, setPlayPrompt] = useState("");
 const [modelState, setModelState] = useState<"idle" | "loading" | "ready" | "error">("idle");
 const [modelMessage, setModelMessage] = useState("Model not loaded. Prompt construction remains available.");
 const [response, setResponse] = useState("");
 const [busy, setBusy] = useState(false);
 const [notice, setNotice] = useState("");
 const [advanced, setAdvanced] = useState(false);
 const [learningState, setLearningState] = useState(() => readLearningState());
 const [exerciseState, setExerciseState] = useState(() => readExerciseState(exercises));
 const [evaluationCases, setEvaluationCases] = useState<EvaluationCase[]>(() => readEvaluationCases());
 const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>(() => readEvaluationRuns());
 const [evaluationBusy, setEvaluationBusy] = useState(false);
 const [evaluationProgress, setEvaluationProgress] = useState("Edit the fixed cases, paste outputs manually, or run them through a loaded local model.");
 const generationCancelRef = useRef(false);
 const evaluationCancelRef = useRef(false);
 const [apiBase, setApiBase] = useState(() => { try { return localStorage.getItem("peg:api-base:v1") || "http://127.0.0.1:8000"; } catch { return "http://127.0.0.1:8000"; } });
 const [apiToken, setApiToken] = useState("");
 const [apiStatus, setApiStatus] = useState("No API connection checked. Browser-local mode remains independent.");
 const [apiBusy, setApiBusy] = useState(false);
 const [compareLeftId, setCompareLeftId] = useState("");
 useEffect(() => {
  const syncLessonRoute = () => {
   const routedLessonId = lessonIdFromSearch(window.location.search);
   if (routedLessonId) {
    setLessonId(routedLessonId);
    setViewState("guide");
   } else {
    setViewState("overview");
   }
  };
  window.addEventListener("popstate", syncLessonRoute);
  return () => window.removeEventListener("popstate", syncLessonRoute);
 }, []);
 const [compareRightId, setCompareRightId] = useState("");
 const prompt = useMemo(() => buildPrompt(draft), [draft]);
 const checks = useMemo(() => validatePrompt(draft), [draft]);
 const evaluationSummary = useMemo(() => summarizeEvaluation(evaluationCases, { promptTitle: draft.title || "Current Prompt Lab draft", modelId: DEFAULT_MODEL_ID }), [evaluationCases, draft.title]);
 const filtered = lessons.filter((item) => (category === "All" || (category === "Bookmarked" ? learningState.bookmarkedLessonIds.includes(item.id) : category === item.category)) && (item.title + " " + item.summary + " " + item.category).toLowerCase().includes(search.trim().toLowerCase()));
 const lesson = lessons.find((item) => item.id === lessonId) || lessons[0];
 const openLesson = (id: string) => {
  if (!lessons.some((item) => item.id === id)) return;
  setLessonId(id);
  setViewState("guide");
  const url = new URL(window.location.href);
  url.searchParams.set("lesson", id);
  url.hash = "";
  window.history.pushState({}, "", url.pathname + url.search);
  setNotice("");
  window.scrollTo({ top: 0, behavior: "auto" });
 };
 const lessonExercise = getExerciseForLesson(lesson.id);
 const activeAttempt = lessonExercise ? exerciseState[lessonExercise.id] : undefined;
 const exerciseScore = scoreExerciseState(exerciseState);
 const comparisonLeft = saved.find((item) => item.id === compareLeftId) || saved[0];
 const comparisonRight = saved.find((item) => item.id === compareRightId) || saved[1] || saved[0];
 let comparisonLines: DiffLine[] = [];
 let comparisonError = "";
 if (comparisonLeft && comparisonRight) {
  try { comparisonLines = diffLines(comparisonLeft.content, comparisonRight.content); }
  catch (error) { comparisonError = error instanceof Error ? error.message : "Could not compare these prompt versions."; }
 }
 const setField = (field: keyof PromptDraft, value: string) => setDraft((old) => ({ ...old, [field]: value }));
 const updateExerciseAttempt = (id: string, attempt: ExerciseAttempt) => {
  const next = { ...exerciseState, [id]: attempt };
  setExerciseState(next);
  if (!writeExerciseState(next)) setNotice("Browser storage could not save exercise progress.");
 };
 const selectExerciseAnswer = (id: string, selectedIndex: number) => {
  updateExerciseAttempt(id, { selectedIndex, checked: false, correct: null });
 };
 const checkExerciseAnswer = () => {
  if (!lessonExercise || activeAttempt?.selectedIndex === null || activeAttempt?.selectedIndex === undefined) {
   setNotice("Choose an answer before checking it.");
   return;
  }
  try {
   const result = gradeExercise(lessonExercise, activeAttempt.selectedIndex);
   updateExerciseAttempt(lessonExercise.id, { selectedIndex: activeAttempt.selectedIndex, checked: true, correct: result.correct, checkedAt: new Date().toISOString() });
  } catch (error) {
   setNotice(error instanceof Error ? error.message : "Could not check this answer.");
  }
 };
 const toggleLessonComplete = (id: string) => {
  const next = { ...learningState, completedLessonIds: learningState.completedLessonIds.includes(id) ? learningState.completedLessonIds.filter((item) => item !== id) : [...learningState.completedLessonIds, id] };
  setLearningState(next);
  setNotice(writeLearningState(next) ? "" : "Browser storage could not save lesson progress.");
 };
 const toggleLessonBookmark = (id: string) => {
  const next = { ...learningState, bookmarkedLessonIds: learningState.bookmarkedLessonIds.includes(id) ? learningState.bookmarkedLessonIds.filter((item) => item !== id) : [...learningState.bookmarkedLessonIds, id] };
  setLearningState(next);
  setNotice(writeLearningState(next) ? "" : "Browser storage could not save bookmarks.");
 };
 const setLibrary = (next: SavedPrompt[]) => { setSaved(next); setNotice(writeSavedPrompts(next) ? "" : "Browser storage is unavailable or full. Export your prompts before leaving."); };
 const copy = async (text: string) => { try { await navigator.clipboard.writeText(text); setNotice("Copied to clipboard."); } catch { setNotice("Clipboard access was blocked. Select the text and copy it manually."); } };
 const applyTemplate = (id: string) => { const item = templates.find((x) => x.id === id); if (item) { setDraft({ ...item.draft }); setView("lab"); setNotice("Template loaded. Adapt the fields for your task."); } };
 const save = () => {
  if (checks.errors.length) { setNotice(checks.errors.join(" ")); return; }
  const item: SavedPrompt = { id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()), title: draft.title.trim() || "Untitled prompt", content: prompt, createdAt: new Date().toISOString() };
  setLibrary([item, ...saved]); setNotice("Prompt saved in this browser.");
 };
 const loadModel = async () => {
  setModelState("loading"); setModelMessage("Initializing the local runtime and downloading model assets if required. This can take time and bandwidth.");
  try { await loadLocalModel(setModelMessage); setModelState("ready"); setModelMessage("Model ready. Inference runs in this browser; no hosted LLM API is configured."); }
  catch (error) { setModelState("error"); setModelMessage(error instanceof Error ? error.message : "Could not initialize local inference."); }
 };
 const generate = async () => {
  const current = playPrompt.trim() || prompt;
  if (!current) { setNotice("Build or paste a prompt first."); return; }
  if (modelState !== "ready") { setNotice("Load the optional local model first. The prompt builder does not require AI."); return; }
  generationCancelRef.current = false;
  setBusy(true); setResponse(""); setNotice("");
  try {
   const finalText = await generateLocally("", current, (partial) => setResponse(partial));
   if (generationCancelRef.current) setNotice("Generation stopped. Partial output is retained.");
   else setResponse(finalText);
  } catch (error) {
   if (generationCancelRef.current) setNotice("Generation stopped. Any partial output is retained.");
   else { setNotice(error instanceof Error ? error.message : "Local generation failed."); setModelState("error"); }
  } finally {
   generationCancelRef.current = false;
   setBusy(false);
  }
 };
 const exportLibrary = () => {
  const blob = new Blob([exportPrompts(saved)], { type: "application/json" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "prompt-engineering-guide-export.json"; link.click(); URL.revokeObjectURL(url);
 };
 const importLibrary = async (file?: File) => {
  if (!file) return;
  try { const incoming = parsePromptExport(await file.text()); const merged = mergeImportedPrompts(saved, incoming); setLibrary(merged); setNotice("Imported " + incoming.length + " prompt(s). Review imported text before using it."); }
  catch (error) { setNotice(error instanceof Error ? error.message : "Could not import this file."); }
 };
 const updateEvaluationCases = (next: EvaluationCase[]) => {
  setEvaluationCases(next);
  if (!writeEvaluationCases(next)) setEvaluationProgress("Browser storage could not save this dataset. Export a backup before leaving.");
 };
 const updateEvaluationCase = (id: string, field: "name" | "input" | "expected" | "actual", value: string) => {
  updateEvaluationCases(evaluationCases.map((item) => item.id === id ? { ...item, [field]: value } : item));
 };
 const addEvaluationCase = () => {
  if (evaluationCases.length >= 100) { setNotice("The evaluation dataset is limited to 100 cases."); return; }
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  updateEvaluationCases([...evaluationCases, { id, name: "Custom case", input: "", expected: "", actual: "" }]);
 };
 const exportEvaluationCases = () => {
  const blob = new Blob([exportEvaluationDataset(evaluationCases)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prompt-engineering-evaluation-dataset.json";
  link.click();
  URL.revokeObjectURL(url);
  setEvaluationProgress("Evaluation dataset export created.");
 };
 const importEvaluationCases = async (file?: File) => {
  if (!file) return;
  try {
   const incoming = parseEvaluationDataset(await file.text());
   updateEvaluationCases(incoming);
   setEvaluationProgress("Imported " + incoming.length + " evaluation case(s). Verify expected outputs before using the dataset.");
  } catch (error) {
   setNotice(error instanceof Error ? error.message : "Could not import this evaluation dataset.");
  }
 };
 const resetEvaluationCases = () => {
  updateEvaluationCases(starterEvaluationCases.map((item) => ({ ...item })));
  setEvaluationProgress("Restored the three illustrative sentiment examples.");
 };
 const runEvaluationLocally = async () => {
  if (modelState !== "ready") { setNotice("Load the optional local model in Local playground first."); return; }
  if (!draft.instruction.trim()) { setNotice("Set up a task in Prompt Lab first. Use the sentiment template for the starter dataset."); setView("lab"); return; }
  const runnable = evaluationCases.filter((item) => item.input.trim() && item.expected.trim());
  if (!runnable.length) { setNotice("Every runnable case needs both input and expected output."); return; }
  evaluationCancelRef.current = false;
  setEvaluationBusy(true);
  setNotice("");
  setEvaluationProgress("Preparing " + runnable.length + " case(s) for local inference…");
  let current = evaluationCases.map((item) => ({ ...item, actual: "" }));
  let activeCaseId = "";
  let activeCaseText = "";
  updateEvaluationCases(current);
  try {
   for (let index = 0; index < runnable.length; index += 1) {
    if (evaluationCancelRef.current) break;
    const testCase = runnable[index];
    setEvaluationProgress("Running case " + (index + 1) + " of " + runnable.length + ": " + testCase.name);
    const testPrompt = buildPrompt({ ...draft, input: testCase.input });
    activeCaseId = testCase.id;
    activeCaseText = "";
    const actual = await generateLocally("", testPrompt, (partial) => {
     activeCaseId = testCase.id;
     activeCaseText = partial;
     setEvaluationCases(current.map((item) => item.id === testCase.id ? { ...item, actual: partial } : item));
    });
    current = current.map((item) => item.id === testCase.id ? { ...item, actual: actual.trim() } : item);
    activeCaseId = "";
    activeCaseText = "";
    updateEvaluationCases(current);
   }
   if (evaluationCancelRef.current) {
    if (activeCaseId && activeCaseText.trim()) { current = current.map((item) => item.id === activeCaseId ? { ...item, actual: activeCaseText } : item); }
    updateEvaluationCases(current);
    setEvaluationProgress("Stopped by you. Completed outputs were retained; this partial run was not added to history.");
    return;
   }
   const run = summarizeEvaluation(current, {
    promptTitle: draft.title || "Current Prompt Lab draft",
    promptSnapshot: buildPrompt({ ...draft, input: "{{case.input}}" }),
    modelId: DEFAULT_MODEL_ID
   });
   const nextRuns = [run, ...evaluationRuns].slice(0, 20);
   setEvaluationRuns(nextRuns);
   const runsSaved = writeEvaluationRuns(nextRuns);
   setEvaluationProgress("Run complete: " + run.matched + " of " + run.completed + " completed outputs exactly matched. This small dataset is a smoke test, not a general quality benchmark." + (runsSaved ? "" : " The run history could not be saved."));
  } catch (error) {
   if (activeCaseId && activeCaseText.trim()) { current = current.map((item) => item.id === activeCaseId ? { ...item, actual: activeCaseText } : item); }
   updateEvaluationCases(current);
   if (evaluationCancelRef.current) setEvaluationProgress("Stopped by you. Completed outputs were retained; this partial run was not added to history.");
   else {
    setEvaluationProgress("Evaluation stopped after an error. Completed case outputs were retained.");
    setNotice(error instanceof Error ? error.message : "Local evaluation failed.");
   }
  } finally {
   evaluationCancelRef.current = false;
   setEvaluationBusy(false);
  }
 };
 const persistApiBase = (value: string) => { setApiBase(value); try { localStorage.setItem("peg:api-base:v1", value); } catch { /* The URL can still be used for this session. */ } };
 const testApi = async () => {
  setApiBusy(true); setApiStatus("Checking configured API…");
  try { const health = await checkApi(apiBase); setApiStatus("Connected: " + health.service + " · LLM " + (health.llm || "not reported") + "." + (health.auth_required ? (apiToken.trim() ? " Bearer token is configured for this session." : " This API requires a bearer token; enter it below.") : " API token authentication is not enabled on this server.")); }
  catch (error) { setApiStatus("Connection failed: " + (error instanceof Error ? error.message : "Unknown error")); }
  finally { setApiBusy(false); }
 };
 const uploadApi = async () => {
  if (!saved.length) { setApiStatus("Your browser library is empty; save a prompt before uploading."); return; }
  setApiBusy(true); setApiStatus("Checking server library and uploading missing prompts…");
  try { const base = normalizeApiBase(apiBase); const count = await uploadMissingPrompts(base, saved, apiToken); setApiStatus("Upload complete: " + count + " new prompt(s) added. The configured API received the corresponding prompt text."); }
  catch (error) { setApiStatus("Upload failed: " + (error instanceof Error ? error.message : "Unknown error")); }
  finally { setApiBusy(false); }
 };
 const downloadApi = async () => {
  setApiBusy(true); setApiStatus("Reading prompts from the configured API…");
  try { const remote = await listApiPrompts(apiBase, apiToken); const merged = mergeApiPrompts(saved, remote); const added = merged.length - saved.length; setSaved(merged); const persisted = writeSavedPrompts(merged); setApiStatus("Merge complete: " + added + " new prompt(s) copied into this browser." + (persisted ? "" : " Browser storage could not save all records.")); }
  catch (error) { setApiStatus("Merge failed: " + (error instanceof Error ? error.message : "Unknown error")); }
  finally { setApiBusy(false); }
 };
 const heading = (title: string, desc: string) => <div className="page-heading"><div><p className="eyebrow">PROMPT ENGINEERING WORKSPACE</p><h1>{title}</h1><p>{desc}</p></div><div className="local-indicator"><i /> Local-first by design</div></div>;
 const fields = (key: keyof PromptDraft, label: string, placeholder: string, rows = 2, required = false) => <div className="field" key={key}><label htmlFor={"field-" + key}>{label}<span className={required ? "required" : ""}>{required ? "Required" : "Optional"}</span></label>{key === "title" || key === "role" && rows === 1 ? <input id={"field-" + key} value={draft[key]} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} /> : <textarea id={"field-" + key} rows={rows} value={draft[key]} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} />}</div>;

 return <div className="app-shell">
  <aside className="sidebar"><div className="brand"><div className="brand-mark">P<span>.</span></div><div><strong>Promptcraft</strong><small>Engineering Guide</small></div></div><div className="workspace-label">WORKSPACE</div><nav aria-label="Main navigation">{nav.map((item) => <button key={item.id} className={"nav-item" + (view === item.id ? " active" : "")} onClick={() => { setView(item.id); setNotice(""); }}><span className="nav-icon">{item.icon}</span>{item.label}{item.id === "library" && saved.length ? <span className="nav-count">{saved.length}</span> : null}</button>)}</nav><div className="sidebar-spacer" /><div className="privacy-card"><div className="privacy-icon">⌁</div><strong>Your prompts stay here</strong><p>Saved prompts use this browser's local storage. Nothing is synced to an account.</p></div><div className="sidebar-footer"><i /> No hosted LLM configured</div></aside>
  <main className="main-content"><header className="topbar"><span>Workspace <b>/</b> {nav.find((x) => x.id === view)?.label}</span><span className="topbar-tag">BETA · LOCAL-FIRST</span></header><div className="page-content">
   {view === "overview" && <>
    <section className="hero-panel"><div className="hero-copy"><p className="eyebrow">LEARN · BUILD · EVALUATE</p><h1>Make your prompts<br />work <em>on purpose.</em></h1><p>A practical guide and local-first workbench for designing, testing, and improving prompts — without a hosted LLM dependency.</p><div className="hero-actions"><button className="button primary" onClick={() => setView("guide")}>Explore the guide →</button><button className="button secondary" onClick={() => setView("lab")}>Open Prompt Lab</button></div></div><div className="hero-visual" aria-hidden="true"><div className="orbit" /><div className="orbit second" /><div className="prompt-glyph"><i /><i /><i /><b /></div><span className="floating-chip chip-top">instruction 01</span><span className="floating-chip chip-bottom">output schema 04</span></div></section>
    <div className="metrics-grid"><div className="metric-card"><span>LESSONS COMPLETED</span><strong>{String(learningState.completedLessonIds.length).padStart(2, "0")}/{String(lessons.length).padStart(2, "0")}</strong><small>Saved on this device</small></div><div className="metric-card"><span>EXERCISE SCORE</span><strong>{exerciseScore.correct}/{exerciseScore.attempted}</strong><small>Checked answers · local</small></div><div className="metric-card"><span>YOUR LIBRARY</span><strong>{String(saved.length).padStart(2, "0")}</strong><small>Stored on this device</small></div><div className="metric-card"><span>HOSTED LLM APIS</span><strong>00</strong><small>None configured</small></div></div>
    <section className="progress-strip"><div><p className="eyebrow">YOUR LEARNING PATH</p><strong>{learningState.completedLessonIds.length} of {lessons.length} lessons complete</strong><p>Mark lessons complete as you work through the guide. Progress stays in this browser.</p></div><div className="progress-track"><span style={{ width: ((learningState.completedLessonIds.length / lessons.length) * 100) + "%" }} /></div></section>
    <section className="section-block"><div className="section-title-row"><div><p className="eyebrow">START HERE</p><h2>Build a better prompt</h2></div><button className="text-button" onClick={() => setView("guide")}>All lessons →</button></div><div className="lesson-grid">{lessons.slice(0, 3).map((item, index) => <button className="lesson-card" key={item.id} onClick={() => openLesson(item.id)}><span className="lesson-index">0{index + 1}</span><small>{item.category}{learningState.completedLessonIds.includes(item.id) ? " · ✓ COMPLETE" : ""}</small><strong>{item.title}</strong><p>{item.summary}</p><span className="card-footer">{item.minutes} min read ↗</span></button>)}</div></section>
    <section className="section-block"><div className="section-title-row"><div><p className="eyebrow">QUICK START</p><h2>Start from a template</h2></div><button className="text-button" onClick={() => setView("lab")}>Open Prompt Lab →</button></div><div className="template-grid">{templates.map((item) => <button className="template-card" key={item.id} onClick={() => applyTemplate(item.id)}><span className="template-mark">✳</span><strong>{item.name}</strong><p>{item.description}</p><span>Use template ↗</span></button>)}</div></section>
   </>}
   {view === "guide" && <>{heading("Learning guide", "Short modules with practical examples, trade-offs, and evaluation advice.")}<div className="guide-layout"><aside className="guide-index"><label htmlFor="search-lessons">FIND A LESSON</label><input id="search-lessons" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search topics…" /><div className="category-list">{[...categories, "Bookmarked"].map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>{filtered.map((item) => <button key={item.id} className={"lesson-list-item" + (lessonId === item.id ? " active" : "")} onClick={() => openLesson(item.id)}><strong>{learningState.completedLessonIds.includes(item.id) ? "✓ " : ""}{item.title}{learningState.bookmarkedLessonIds.includes(item.id) ? " ★" : ""}</strong><small>{item.minutes} min · {item.level}</small></button>)}{!filtered.length ? <p className="muted">No lessons match.</p> : null}</aside><article className="lesson-article"><div className="article-meta">{lesson.category} · {lesson.minutes} MIN · {lesson.level.toUpperCase()}</div><h2>{lesson.title}</h2><p className="article-lead">{lesson.summary}</p><div className="lesson-controls"><button className={"button " + (learningState.completedLessonIds.includes(lesson.id) ? "secondary" : "primary")} onClick={() => toggleLessonComplete(lesson.id)}>{learningState.completedLessonIds.includes(lesson.id) ? "✓ Completed · Mark incomplete" : "Mark lesson complete"}</button><button className="button secondary" onClick={() => toggleLessonBookmark(lesson.id)}>{learningState.bookmarkedLessonIds.includes(lesson.id) ? "★ Bookmarked · Remove bookmark" : "☆ Bookmark lesson"}</button></div><LessonLearningScaffold lesson={lesson} lessons={lessons} completedLessonIds={learningState.completedLessonIds} onNavigate={openLesson} onOpenOverview={() => setView("overview")} position="start" />{lesson.sections.map((section, i) => <section id={lessonSectionId(lesson.id, section.heading)} className="article-section" key={section.heading}><h3><span>{String(i + 1).padStart(2, "0")}</span>{section.heading}</h3><p>{section.body}</p>{section.example ? <div className="example-block"><small>EXAMPLE</small><pre>{section.example}</pre><button className="text-button" onClick={() => { setDraft((old) => ({ ...old, title: lesson.title, instruction: section.example || old.instruction })); setView("lab"); }}>Adapt in Prompt Lab ↗</button></div> : null}{section.takeaway ? <div className="takeaway"><small>KEY TAKEAWAY</small><p>{section.takeaway}</p></div> : null}</section>)}{lesson.sources?.length ? <section className="lesson-sources"><h3>Further reading</h3><ul>{lesson.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}<span aria-hidden="true"> ↗</span></a></li>)}</ul><p>References are provided for deeper reading. Some recommendations are model-specific; verify current documentation for the runtime you use.</p></section> : null}{lessonExercise ? <section className="exercise-panel"><div className="exercise-heading"><div><p className="eyebrow">KNOWLEDGE CHECK</p><h3>Test your understanding</h3></div><span>{activeAttempt?.checked ? (activeAttempt.correct ? "PASSED" : "REVIEW") : "1 QUESTION"}</span></div><fieldset disabled={activeAttempt?.checked === true}><legend>{lessonExercise.question}</legend><div className="exercise-choices">{lessonExercise.choices.map((choice, index) => <label key={choice} className={"exercise-choice" + (activeAttempt?.selectedIndex === index ? " chosen" : "")}><input type="radio" name={"exercise-" + lessonExercise.id} checked={activeAttempt?.selectedIndex === index} onChange={() => selectExerciseAnswer(lessonExercise.id, index)} /><span>{choice}</span></label>)}</div></fieldset>{activeAttempt?.checked ? <div className={"exercise-feedback " + (activeAttempt.correct ? "correct" : "incorrect")}><strong>{activeAttempt.correct ? "Correct" : "Not quite"}</strong><p>{lessonExercise.explanation}</p></div> : null}<div className="exercise-actions"><button className="button primary" disabled={activeAttempt?.selectedIndex === null || activeAttempt?.selectedIndex === undefined || activeAttempt?.checked === true} onClick={checkExerciseAnswer}>Check answer</button>{activeAttempt?.checked ? <button className="button secondary" onClick={() => updateExerciseAttempt(lessonExercise.id, { selectedIndex: null, checked: false, correct: null })}>Try again</button> : null}</div><p className="exercise-footnote">Answers are checked by a deterministic rule and saved locally. No model is used.</p></section> : null}<LessonLearningScaffold lesson={lesson} lessons={lessons} completedLessonIds={learningState.completedLessonIds} onNavigate={openLesson} onOpenOverview={() => setView("overview")} position="end" /><button className="button secondary" onClick={() => setView("lab")}>Practice in Prompt Lab →</button></article></div></>}
   {view === "lab" && <>{heading("Prompt Lab", "Construct prompts from reusable parts. Validation is deterministic and never calls an LLM.")}<div className="lab-toolbar"><div><small>START WITH A TEMPLATE</small><div className="inline-templates">{templates.map((item) => <button key={item.id} onClick={() => setDraft({ ...item.draft })}>{item.name}</button>)}</div></div><button className="button secondary" onClick={() => setDraft({ ...emptyDraft })}>Clear draft</button></div><div className="lab-layout"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">PROMPT CONFIGURATION</p><h2>Define the task</h2></div><span>01 / 02</span></div>{fields("title", "Prompt name", "e.g. Research paper summary", 1)}{fields("role", "Role or perspective", "What perspective should the model take?", 2)}{fields("instruction", "Task / instruction", "State the action clearly. What should be done?", 3, true)}{fields("context", "Context", "Audience, background facts, goal, or source description…", 3)}{fields("input", "Input data", "Paste text or data the task should operate on…", 4)}<button className="disclosure-button" onClick={() => setAdvanced((x) => !x)}>{advanced ? "− Hide" : "+ Show"} advanced components <span>Examples, constraints, output format</span></button>{advanced && <>{fields("examples", "Examples", "Example input → expected output…", 3)}{fields("constraints", "Constraints", "Limits, caveats, rules, or assumptions to avoid…", 3)}{fields("outputFormat", "Output format", "Schema, table columns, length, or sections…", 3)}</>}<div className="editor-actions"><button className="button primary" onClick={save}>Save prompt</button><button className="button secondary" onClick={() => copy(prompt)}>Copy full prompt</button></div></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">LIVE PREVIEW</p><h2>Your assembled prompt</h2></div><span>02 / 02</span></div><div className="preview-stats">{countWords(prompt)} words · {prompt.length} characters</div><pre className="prompt-preview">{prompt || "Your assembled prompt appears here as you fill in the fields…"}</pre><div className="validation"><h3>Prompt checks</h3>{!checks.errors.length && !checks.warnings.length ? <p className="ok">✓ No basic structural issues found.</p> : null}{checks.errors.map((x) => <p className="error" key={x}>! {x}</p>)}{checks.warnings.map((x) => <p className="warning" key={x}>↳ {x}</p>)}</div><div className="privacy-note"><b>◉</b><p><strong>No model call is made.</strong> Preview and validation are local deterministic operations.</p></div></section></div></>}
   {view === "evaluation" && <>{heading("Evaluation bench", "Run repeatable test cases against your current prompt and inspect exact-match results without a hosted LLM.")}<div className="eval-intro"><div><p className="eyebrow">REPRODUCIBLE, LOCAL-FIRST CHECKS</p><strong>Same cases. Explicit expected outputs. Measurable results.</strong><p>The starter sentiment examples are illustrative smoke tests, not a statistically meaningful benchmark. Exact-match scoring is strict and only scores cases with both an expected and actual output.</p></div><div className="eval-shortcuts"><button className="button secondary" onClick={() => applyTemplate("sentiment")}>Use sentiment prompt template</button><button className="button secondary" onClick={() => setView("playground")}>Open local model →</button></div></div><div className="metrics-grid evaluation-metrics"><div className="metric-card"><span>TEST CASES</span><strong>{evaluationSummary.total}</strong><small>Saved in this browser</small></div><div className="metric-card"><span>COMPLETED</span><strong>{evaluationSummary.completed}</strong><small>Expected + actual present</small></div><div className="metric-card"><span>EXACT MATCHES</span><strong>{evaluationSummary.matched}</strong><small>Normalized exact matches</small></div><div className="metric-card"><span>EXACT-MATCH RATE</span><strong>{evaluationSummary.completed ? Math.round(evaluationSummary.exactMatchRate * 100) + "%" : "—"}</strong><small>Only for completed cases</small></div></div><div className="eval-toolbar"><div><button className="button secondary" onClick={addEvaluationCase} disabled={evaluationBusy || evaluationCases.length >= 100}>+ Add case</button><button className="button secondary" disabled={evaluationBusy} onClick={resetEvaluationCases}>Reset starter dataset</button><button className="button secondary" onClick={exportEvaluationCases}>Export dataset</button><label className="button secondary file-button">Import dataset<input type="file" accept=".json,application/json" disabled={evaluationBusy} onChange={(event) => { void importEvaluationCases(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div><button className="button primary" disabled={modelState !== "ready" || (!evaluationBusy && !evaluationCases.some((item) => item.input.trim() && item.expected.trim()))} onClick={() => { if (evaluationBusy) { evaluationCancelRef.current = true; interruptLocalGeneration(); setEvaluationProgress("Requesting cancellation of the active generation…"); } else { void runEvaluationLocally(); } }}>{evaluationBusy ? "Stop evaluation" : "Run evaluation locally"}</button></div><p className="eval-progress" role="status">{evaluationProgress}</p><div className="eval-case-list">{evaluationCases.map((item, index) => <article className="eval-case" key={item.id}><header><span className="eval-case-number">CASE {String(index + 1).padStart(2, "0")}</span><input aria-label={"Case " + (index + 1) + " name"} value={item.name} onChange={(event) => updateEvaluationCase(item.id, "name", event.target.value)} /><button className="delete-button" disabled={evaluationBusy} onClick={() => updateEvaluationCases(evaluationCases.filter((entry) => entry.id !== item.id))} aria-label={"Remove case " + item.name}>Remove</button></header><div className="eval-case-fields"><label>Input<textarea rows={4} value={item.input} disabled={evaluationBusy} onChange={(event) => updateEvaluationCase(item.id, "input", event.target.value)} placeholder="Input sent to the current prompt…" /></label><label>Expected output<input value={item.expected} disabled={evaluationBusy} onChange={(event) => updateEvaluationCase(item.id, "expected", event.target.value)} placeholder="Expected exact output" /></label><label>Actual output<textarea rows={4} value={item.actual} disabled={evaluationBusy} onChange={(event) => updateEvaluationCase(item.id, "actual", event.target.value)} placeholder="Paste a model output or run locally…" /></label></div><div className={"eval-match " + (item.actual.trim() && item.expected.trim() ? isExactMatch(item.expected, item.actual) ? "match" : "mismatch" : "pending")}>{item.actual.trim() && item.expected.trim() ? isExactMatch(item.expected, item.actual) ? "✓ Exact match" : "× Mismatch" : "Awaiting expected and actual output"}</div></article>)}</div><section className="eval-history"><div className="section-title-row"><div><p className="eyebrow">LOCAL RUN HISTORY</p><h2>Previous evaluations</h2></div><span>{evaluationRuns.length} saved</span></div>{evaluationRuns.length ? evaluationRuns.slice(0, 10).map((run) => <div className="eval-history-row" key={run.id}><div><strong>{run.promptTitle}</strong><small>{new Date(run.createdAt).toLocaleString()} · {run.modelId}</small></div><span>{run.matched}/{run.completed} exact matches · {run.completed ? Math.round(run.exactMatchRate * 100) + "%" : "no scored cases"}</span><details className="eval-run-details"><summary>Inspect snapshot and outputs</summary><pre>{run.promptSnapshot || "No prompt snapshot stored for this run."}</pre>{run.cases.map((item) => <div className="eval-saved-case" key={item.id}><strong>{item.name} — {item.matched === null ? "not scored" : item.matched ? "match" : "mismatch"}</strong><small>Input: {item.input}</small><small>Expected: {item.expected}</small><small>Actual: {item.actual || "(empty)"}</small></div>)}</details></div>) : <p className="muted">No local runs recorded yet. Run a case set with the local model to create history.</p>}</section></>}
   {view === "playground" && <>{heading("Local playground", "Optional browser-based generation. No hosted LLM API key or endpoint is configured.")}<div className="playground-notice"><strong>On-device inference, when supported</strong><p>Loading a model can download weights and runtime assets. Prompts are processed by the model running in your browser, not a hosted LLM API. First load may use substantial bandwidth and memory.</p></div><section className="model-card"><div><small className="eyebrow">MODEL RUNTIME</small><h2>WebLLM · optional local engine</h2><code>{DEFAULT_MODEL_ID}</code></div><span className={"model-state " + modelState}>{modelState.toUpperCase()}</span><p>{modelMessage}</p><div className="model-actions"><button className="button primary" disabled={modelState === "loading" || modelState === "ready"} onClick={loadModel}>{modelState === "loading" ? "Loading…" : modelState === "ready" ? "Model loaded" : "Load local model"}</button><button className="button secondary" disabled={modelState !== "ready" || busy} onClick={async () => { await unloadLocalModel(); setModelState("idle"); setModelMessage("Model unloaded from this session."); }}>Unload model</button><small>{supportsWebGPU() ? "WebGPU API detected" : "WebGPU not detected"}</small></div></section><div className="lab-layout playground-layout"><section className="panel"><div className="panel-heading"><h2>Prompt to run</h2><button className="text-button" onClick={() => setPlayPrompt(prompt)}>Use Prompt Lab draft ↗</button></div><textarea className="playground-input" rows={12} value={playPrompt} onChange={(e) => setPlayPrompt(e.target.value)} placeholder="Write or paste a prompt, or use the Prompt Lab draft…" /><div className="editor-actions"><button className="button primary" disabled={!busy && modelState !== "ready"} onClick={() => { if (busy) { generationCancelRef.current = true; interruptLocalGeneration(); } else { void generate(); } }}>{busy ? "Stop generation" : "Generate locally"}</button><button className="button secondary" disabled={busy} onClick={() => setPlayPrompt("")}>Clear</button></div></section><section className="panel"><h2>Model response</h2><div className="response-area">{response || (busy ? "Generating on this device…" : "Generated output appears here. Prompt Lab remains usable without a model.")}</div>{response && <button className="button secondary" onClick={() => copy(response)}>Copy response</button>}</section></div><p className="fine-print">Local inference speed and memory use depend on browser, GPU, RAM, model, and runtime support. Unsupported devices can use every non-inference feature.</p></>}
   {view === "library" && <>{heading("My library", "Saved prompts stay in this browser profile. Export a backup to move them to another device.")}<div className="library-toolbar"><strong>{saved.length} saved prompt{saved.length === 1 ? "" : "s"}</strong><div><button className="button secondary" disabled={!saved.length} onClick={exportLibrary}>Export JSON</button><label className="button secondary file-button">Import JSON<input type="file" accept=".json,application/json" onChange={(e) => { void importLibrary(e.target.files?.[0]); e.currentTarget.value = ""; }} /></label></div></div><section className="api-sync-panel"><div><p className="eyebrow">OPTIONAL SERVER STORAGE</p><h2>Connect your own API</h2><p>Nothing syncs automatically. Use these controls only with an API you trust; the upload action sends prompt titles and contents to that server.</p></div><label className="api-url-label" htmlFor="api-base-url">API base URL<input id="api-base-url" value={apiBase} onChange={(event) => persistApiBase(event.target.value)} placeholder="http://127.0.0.1:8000" /></label><label className="api-url-label" htmlFor="api-session-token">Optional API bearer token<input id="api-session-token" type="password" autoComplete="off" value={apiToken} onChange={(event) => setApiToken(event.target.value)} placeholder="Only if the API owner configured one" /><small>Session-only: this token is not saved in browser storage.</small></label><div className="api-actions"><button className="button secondary" disabled={apiBusy} onClick={testApi}>{apiBusy ? "Working…" : "Test connection"}</button><button className="button secondary" disabled={apiBusy || !saved.length} onClick={uploadApi}>Upload browser prompts</button><button className="button secondary" disabled={apiBusy} onClick={downloadApi}>Merge API prompts into browser</button></div><p className="api-status" role="status">{apiStatus}</p><p className="api-warning">The included API has no authentication. Keep it on localhost unless you add authentication and authorization. Do not send sensitive prompts to an untrusted endpoint.</p></section>{saved.length > 1 ? <section className="compare-panel"><div className="compare-heading"><div><p className="eyebrow">PROMPT VERSION COMPARISON</p><h2>What changed?</h2><p>Compare any two saved prompt snapshots. Removed lines are shown in red; added lines in green.</p></div><span>{comparisonLines.filter((line) => line.kind === "added").length} additions · {comparisonLines.filter((line) => line.kind === "removed").length} removals</span></div><div className="compare-selectors"><label>Version A<select value={comparisonLeft?.id || ""} onChange={(event) => setCompareLeftId(event.target.value)}>{saved.map((item) => <option key={item.id} value={item.id}>{item.title} · {new Date(item.createdAt).toLocaleString()}</option>)}</select></label><label>Version B<select value={comparisonRight?.id || ""} onChange={(event) => setCompareRightId(event.target.value)}>{saved.map((item) => <option key={item.id} value={item.id}>{item.title} · {new Date(item.createdAt).toLocaleString()}</option>)}</select></label></div>{comparisonError ? <p className="compare-error">{comparisonError}</p> : <div className="diff-view" aria-label="Prompt line comparison">{comparisonLines.map((line, index) => <div className={"diff-line diff-" + line.kind} key={index}><span>{line.oldLine ?? ""}</span><span>{line.newLine ?? ""}</span><b>{line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " "}</b><code>{line.text || " "}</code></div>)}</div>}</section> : null}{!saved.length ? <div className="empty-state"><h2>Your library is empty</h2><p>Build a prompt in Prompt Lab and save it. Export the library as JSON for a portable backup.</p><button className="button primary" onClick={() => setView("lab")}>Create your first prompt →</button></div> : <div className="saved-grid">{saved.map((item) => <article className="saved-card" key={item.id}><small>LOCAL PROMPT · {new Date(item.createdAt).toLocaleDateString()}</small><h3>{item.title}</h3><pre>{item.content.slice(0, 220)}{item.content.length > 220 ? "…" : ""}</pre><button className="text-button" onClick={() => { setPlayPrompt(item.content); setView("playground"); }}>Open in playground →</button><button className="delete-button" onClick={() => setLibrary(saved.filter((x) => x.id !== item.id))}>Delete</button></article>)}</div>}<div className="privacy-note"><b>◉</b><p><strong>Local storage is not an encrypted vault.</strong> Do not save passwords, API keys, or sensitive records.</p></div></>}
   {view === "techniques" && <TechniqueLibrary
    onUseInPrompt={(technique: Technique) => {
     setDraft((old) => ({
      ...old,
      title: technique.title,
      role: "",
      instruction: technique.steps[0] || technique.summary,
      context: technique.summary + "\n\nWhen to use: " + technique.whenToUse.join("; "),
      examples: technique.example,
      constraints: "Trade-offs and failure modes: " + technique.tradeoffs.join(" "),
      outputFormat: technique.steps.map((step, index) => (index + 1) + ". " + step).join("\n")
     }));
     setView("lab");
     setNotice("Technique loaded into Prompt Lab. Adapt it to your task and test it with representative cases.");
    }}
    onOpenWorkflows={(technique: Technique) => {
     setView("workflows");
     setNotice(technique.id === "iterative-refinement" ? "In Graph & loops, add a Loop node for bounded self-correction." : "Use the workflow outline to compose the pattern and inspect each step.");
    }}
   />}
   {view === "workflows" && <WorkflowBuilder
    modelReady={modelState === "ready"}
    generateLocal={(prompt, system, _signal) => generateLocally(system || "", prompt)}
   />}
   {notice && <div className="toast" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice("")}>×</button></div>}
   <footer className="page-footer"><span>Promptcraft · Open learning, local-first tools</span><span>Built to work without a hosted LLM</span></footer>
  </div></main>
 </div>;
}