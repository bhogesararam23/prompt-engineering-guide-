export const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";
type Engine = { chat: { completions: { create: (request: { messages: Array<{ role: "system" | "user"; content: string }>; temperature?: number; max_tokens?: number }) => Promise<{ choices?: Array<{ message?: { content?: string | null } }> }> } }; unload?: () => Promise<void> };
let enginePromise: Promise<Engine> | null = null;
export function supportsWebGPU(): boolean { return typeof navigator !== "undefined" && "gpu" in navigator; }
export async function loadLocalModel(onProgress: (message: string) => void): Promise<void> {
 if (!supportsWebGPU()) throw new Error("This browser does not expose WebGPU. Prompt building and saved prompts still work; local generation requires a compatible browser and device.");
 if (enginePromise) { await enginePromise; return; }
 enginePromise = (async () => {
  const runtime = await import("@mlc-ai/web-llm");
  const engine = await runtime.CreateMLCEngine(DEFAULT_MODEL_ID, { initProgressCallback: (report: { text?: string }) => onProgress(report.text || "Preparing local model…") });
  return engine as unknown as Engine;
 })();
 try { await enginePromise; onProgress("Local model is ready in this browser session."); } catch (error) { enginePromise = null; throw error; }
}
export async function generateLocally(system: string, prompt: string): Promise<string> {
 if (!enginePromise) throw new Error("Load the local model before generating a response.");
 const engine = await enginePromise;
 const messages: Array<{ role: "system" | "user"; content: string }> = [];
 if (system.trim()) messages.push({ role: "system", content: system.trim() });
 messages.push({ role: "user", content: prompt });
 const result = await engine.chat.completions.create({ messages, temperature: 0.4, max_tokens: 512 });
 const text = result.choices?.[0]?.message?.content;
 if (typeof text !== "string" || !text.trim()) throw new Error("The local model returned no text. Try a shorter prompt.");
 return text;
}
export async function unloadLocalModel(): Promise<void> {
 if (!enginePromise) return;
 const pending = enginePromise;
 enginePromise = null;
 try { const engine = await pending; await engine.unload?.(); } catch { /* Browser inference remains optional if disposal is unavailable. */ }
}