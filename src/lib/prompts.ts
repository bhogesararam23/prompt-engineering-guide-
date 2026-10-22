export type PromptDraft = { title: string; role: string; instruction: string; context: string; examples: string; input: string; constraints: string; outputFormat: string };
export type SavedPrompt = { id: string; title: string; content: string; createdAt: string };
export const emptyDraft: PromptDraft = { title: "", role: "", instruction: "", context: "", examples: "", input: "", constraints: "", outputFormat: "" };

export const templates: Array<{ id: string; name: string; description: string; draft: PromptDraft }> = [
 { id: "summarize", name: "Summarize a document", description: "Concise output for a clear audience.", draft: { ...emptyDraft, title: "Document summary", instruction: "Summarize the supplied document.", context: "Audience: a busy technical reader who needs key points and caveats.", constraints: "Do not introduce facts unsupported by the source. Preserve uncertainty.", outputFormat: "Executive summary; key findings; open questions." } },
 { id: "extract", name: "Extract structured data", description: "Turn text into a predictable object.", draft: { ...emptyDraft, title: "Structured extraction", instruction: "Extract the requested fields from the supplied text.", constraints: "Do not infer missing values. Use null when a scalar is unavailable.", outputFormat: "Return a valid JSON object with required fields and correct types. No Markdown fences." } },
 { id: "review", name: "Review code", description: "Prioritize actionable issues and evidence.", draft: { ...emptyDraft, title: "Code review", role: "You are a careful software reviewer.", instruction: "Review the supplied code for correctness, security, performance, and maintainability.", context: "Prioritize concrete defects over style preferences.", constraints: "Do not claim to have run tests unless results are provided. Separate confirmed defects from questions.", outputFormat: "Findings ordered by severity with location, evidence, impact, and suggested fix." } },
 { id: "compare", name: "Compare alternatives", description: "Make assumptions and trade-offs explicit.", draft: { ...emptyDraft, title: "Decision comparison", instruction: "Compare the alternatives against the stated goals.", constraints: "Separate measured facts from assumptions.", outputFormat: "Criteria table, key trade-offs, assumptions, recommendation, and conditions that would change it." } },
 { id: "sentiment", name: "Classify sentiment", description: "Return one label for a fixed evaluation dataset.", draft: { ...emptyDraft, title: "Sentiment classification", role: "You are a careful text classifier.", instruction: "Classify the sentiment of the supplied review.", constraints: "Use only positive, negative, or neutral. If sentiment is mixed, choose the dominant overall sentiment. Do not explain, add punctuation, or include any other text.", outputFormat: "Return exactly one lowercase label: positive, negative, or neutral." } }
];

export function buildPrompt(draft: PromptDraft): string {
 const parts: Array<[string, string]> = [["Role", draft.role], ["Task", draft.instruction], ["Context", draft.context], ["Examples", draft.examples], ["Input", draft.input], ["Constraints", draft.constraints], ["Output format", draft.outputFormat]];
 return parts.filter(([, value]) => value.trim()).map(([label, value]) => label + ":\n" + value.trim()).join("\n\n");
}
export function validatePrompt(draft: PromptDraft): { errors: string[]; warnings: string[] } {
 const errors: string[] = [];
 const warnings: string[] = [];
 if (!draft.instruction.trim()) errors.push("Add a task or instruction before using this prompt.");
 if (draft.instruction.trim() && draft.instruction.trim().length < 12) warnings.push("The task is very short. Check whether the intended action is unambiguous.");
 if (!draft.input.trim() && !draft.context.trim()) warnings.push("There is no input data or context. Check whether the model has enough information.");
 if (!draft.outputFormat.trim()) warnings.push("No output format is specified. Add one when consistency matters.");
 if (/api[_ -]?key|password|secret\s*[:=]/i.test(draft.input)) warnings.push("The input may contain a credential. Remove secrets before sharing or processing this prompt.");
 return { errors, warnings };
}
export function countWords(text: string): number { const value = text.trim(); return value ? value.split(/\s+/).length : 0; }

const STORAGE_KEY = "peg:saved-prompts:v1";
export function readSavedPrompts(): SavedPrompt[] {
 try {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) return [];
  return data.filter((x): x is SavedPrompt => !!x && typeof x === "object" && typeof x.id === "string" && typeof x.title === "string" && typeof x.content === "string" && typeof x.createdAt === "string");
 } catch { return []; }
}
export function writeSavedPrompts(prompts: SavedPrompt[]): boolean {
 try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts)); return true; } catch { return false; }
}
export function exportPrompts(prompts: SavedPrompt[]): string {
 return JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), prompts }, null, 2);
}
export function parsePromptExport(raw: string): SavedPrompt[] {
 const data: unknown = JSON.parse(raw);
 if (!data || typeof data !== "object" || !("prompts" in data) || !Array.isArray(data.prompts)) throw new Error("This file is not a Prompt Engineering Guide export.");
 const prompts = data.prompts as unknown[];
 if (!prompts.every((x) => !!x && typeof x === "object" && "id" in x && typeof x.id === "string" && "title" in x && typeof x.title === "string" && "content" in x && typeof x.content === "string" && "createdAt" in x && typeof x.createdAt === "string")) throw new Error("The export contains an invalid prompt record.");
 return prompts as SavedPrompt[];
}