const CACHE_NAME = "peg-shell-v2";
const SHELL_URLS = ["/", "/index.html"];

async function precacheAppShell() {
  const indexResponse = await fetch("/index.html");
  if (!indexResponse.ok) throw new Error("Could not retrieve index.html while precaching the app shell.");

  const html = await indexResponse.clone().text();
  const discovered = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .map((path) => new URL(path, self.location.origin + "/index.html"))
    .filter((url) => url.origin === self.location.origin && url.pathname !== "/sw.js" && !url.pathname.startsWith("/api/"))
    .map((url) => url.pathname);

  const cache = await caches.open(CACHE_NAME);
  await cache.put("/index.html", indexResponse);
  await cache.add("/");
  await Promise.all([...new Set(discovered)].map(async (path) => {
    try {
      const response = await fetch(path);
      if (response.ok) await cache.put(path, response);
    } catch {
      // A failed optional asset should not prevent the basic shell from installing.
    }
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("peg-shell-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Do not cache API payloads, remote model files, or third-party requests.
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          }
          return response;
        })
        .catch(async () => (await caches.match("/index.html")) || (await caches.match("/")))
    );
    return;
  }

  if (["script", "style", "worker", "font", "image"].includes(request.destination)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
