import type { SavedPrompt } from "./prompts";

export type ApiPrompt = { id: string; title: string; content: string; created_at: string };
export type ApiHealth = { status: string; service?: string; llm?: string };

export function normalizeApiBase(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("Enter a valid absolute API URL, including http:// or https://."); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("The API URL must use HTTP or HTTPS.");
  if (url.username || url.password) throw new Error("Do not place credentials in the API URL.");
  if (url.search || url.hash) throw new Error("Remove the query string or fragment from the API base URL.");
  return url.toString().replace(/\/+$/, "");
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("API request failed (" + response.status + "). " + detail.slice(0, 240));
  }
  return response.json() as Promise<T>;
}

export async function checkApi(base: string): Promise<ApiHealth> {
  return requestJson<ApiHealth>(normalizeApiBase(base) + "/api/health");
}

export async function listApiPrompts(base: string): Promise<ApiPrompt[]> {
  return requestJson<ApiPrompt[]>(normalizeApiBase(base) + "/api/v1/prompts?limit=500");
}

export async function uploadMissingPrompts(base: string, local: SavedPrompt[]): Promise<number> {
  const root = normalizeApiBase(base);
  const remote = await listApiPrompts(root);
  const seen = new Set(remote.map((item) => item.title + "\n" + item.content));
  let added = 0;
  for (const item of local) {
    const key = item.title + "\n" + item.content;
    if (seen.has(key)) continue;
    await requestJson<ApiPrompt>(root + "/api/v1/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, content: item.content })
    });
    seen.add(key);
    added += 1;
  }
  return added;
}

export function mergeApiPrompts(local: SavedPrompt[], remote: ApiPrompt[]): SavedPrompt[] {
  const seen = new Set(local.map((item) => item.title + "\n" + item.content));
  const additions = remote
    .filter((item) => !seen.has(item.title + "\n" + item.content))
    .map((item) => ({ id: item.id, title: item.title, content: item.content, createdAt: item.created_at }));
  return [...additions, ...local];
}
