import type { SavedPrompt } from "./prompts";

export type ApiPrompt = { id: string; title: string; content: string; created_at: string };
export type ApiHealth = { status: string; service?: string; llm?: string; auth_required?: boolean };

export function normalizeApiBase(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); } catch { throw new Error("Enter a valid absolute API URL, including http:// or https://."); }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("The API URL must use HTTP or HTTPS.");
  const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (url.protocol === "http:" && !loopbackHosts.has(url.hostname)) throw new Error("Use HTTPS for remote API endpoints. Plain HTTP is allowed only for localhost development.");
  if (url.username || url.password) throw new Error("Do not place credentials in the API URL.");
  if (url.search || url.hash) throw new Error("Remove the query string or fragment from the API base URL.");
  return url.toString().replace(/\/+$/, "");
}

async function requestJson<T>(url: string, init?: RequestInit, token = ""): Promise<T> {
  const headers = new Headers(init?.headers);
  if (token.trim()) headers.set("Authorization", "Bearer " + token.trim());
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error("API request failed (" + response.status + "). " + detail.slice(0, 240));
  }
  return response.json() as Promise<T>;
}

export async function checkApi(base: string): Promise<ApiHealth> {
  return requestJson<ApiHealth>(normalizeApiBase(base) + "/api/health");
}

export async function listApiPrompts(base: string, token = ""): Promise<ApiPrompt[]> {
  return requestJson<ApiPrompt[]>(normalizeApiBase(base) + "/api/v1/prompts?limit=500", undefined, token);
}

export async function uploadMissingPrompts(base: string, local: SavedPrompt[], token = ""): Promise<number> {
  const root = normalizeApiBase(base);
  const remote = await listApiPrompts(root, token);
  const seen = new Set(remote.map((item) => item.title + "\n" + item.content));
  let added = 0;
  for (const item of local) {
    const key = item.title + "\n" + item.content;
    if (seen.has(key)) continue;
    await requestJson<ApiPrompt>(root + "/api/v1/prompts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: item.title, content: item.content })
    }, token);
    seen.add(key);
    added += 1;
  }
  return added;
}

export function mergeApiPrompts(local: SavedPrompt[], remote: ApiPrompt[]): SavedPrompt[] {
  const seenContent = new Set(local.map((item) => item.title + "\n" + item.content));
  const seenIds = new Set(local.map((item) => item.id));
  const additions: SavedPrompt[] = [];
  for (const item of remote) {
    const contentKey = item.title + "\n" + item.content;
    if (seenContent.has(contentKey)) continue;
    seenContent.add(contentKey);
    let id = item.id;
    let suffix = 0;
    while (seenIds.has(id)) {
      id = item.id + "-remote-" + suffix;
      suffix += 1;
    }
    seenIds.add(id);
    additions.push({ id, title: item.title, content: item.content, createdAt: item.created_at });
  }
  return [...additions, ...local];
}
