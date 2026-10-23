export const DEFAULT_MODEL_ID = "Llama-3.2-1B-Instruct-q4f32_1-MLC";

type CompletionMessage = { role: "system" | "user"; content: string };
type CompletionChunk = { choices?: Array<{ delta?: { content?: string | null } }> };
type CompletionResponse = { choices?: Array<{ message?: { content?: string | null } }> };
type CompletionResult = CompletionResponse | AsyncIterable<CompletionChunk>;

type Engine = {
  chat: {
    completions: {
      create: (request: {
        messages: CompletionMessage[];
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }) => Promise<CompletionResult>;
    };
  };
  unload?: () => Promise<void>;
  interruptGenerate?: () => void;
  worker?: Worker;
};

let enginePromise: Promise<Engine> | null = null;
let workerInstance: Worker | null = null;

export function supportsWebGPU(): boolean {
  return typeof navigator !== "undefined" && "gpu" in navigator;
}

export async function loadLocalModel(onProgress: (message: string) => void): Promise<void> {
  if (!supportsWebGPU()) {
    throw new Error("This browser does not expose WebGPU. Prompt building and saved prompts still work; local generation requires a compatible browser and device.");
  }
  if (enginePromise) {
    await enginePromise;
    return;
  }

  const worker = new Worker(new URL("../workers/model.worker.ts", import.meta.url), { type: "module" });
  workerInstance = worker;
  enginePromise = (async () => {
    try {
      const runtime = await import("@mlc-ai/web-llm");
      const engine = await runtime.CreateWebWorkerMLCEngine(worker, DEFAULT_MODEL_ID, {
        initProgressCallback: (report: { text?: string }) => onProgress(report.text || "Preparing local model…")
      });
      return engine as unknown as Engine;
    } catch (error) {
      worker.terminate();
      if (workerInstance === worker) workerInstance = null;
      throw error;
    }
  })();

  try {
    await enginePromise;
    onProgress("Local model is ready in a background worker.");
  } catch (error) {
    enginePromise = null;
    throw error;
  }
}

export async function generateLocally(
  system: string,
  prompt: string,
  onText?: (completeText: string) => void
): Promise<string> {
  if (!enginePromise) throw new Error("Load the local model before generating a response.");
  const engine = await enginePromise;
  const messages: CompletionMessage[] = [];
  if (system.trim()) messages.push({ role: "system", content: system.trim() });
  messages.push({ role: "user", content: prompt });

  const result = await engine.chat.completions.create({
    messages,
    temperature: 0.4,
    max_tokens: 512,
    stream: true
  });

  let completeText = "";
  if (result && typeof (result as AsyncIterable<CompletionChunk>)[Symbol.asyncIterator] === "function") {
    for await (const chunk of result as AsyncIterable<CompletionChunk>) {
      const piece = chunk.choices?.[0]?.delta?.content;
      if (typeof piece === "string" && piece.length > 0) {
        completeText += piece;
        onText?.(completeText);
      }
    }
  } else {
    const response = result as CompletionResponse;
    const content = response.choices?.[0]?.message?.content;
    if (typeof content === "string") completeText = content;
    onText?.(completeText);
  }

  if (!completeText.trim()) {
    throw new Error("The local model returned no text. Try a shorter prompt or reload the model.");
  }
  return completeText;
}

export function interruptLocalGeneration(): void {
  void enginePromise?.then((engine) => engine.interruptGenerate?.()).catch(() => undefined);
}

export async function unloadLocalModel(): Promise<void> {
  const pending = enginePromise;
  const worker = workerInstance;
  enginePromise = null;
  workerInstance = null;
  if (!pending) {
    worker?.terminate();
    return;
  }
  try {
    const engine = await pending;
    await engine.unload?.();
  } catch {
    // Runtime failures must not block the non-inference parts of the application.
  } finally {
    worker?.terminate();
  }
}
