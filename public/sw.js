const CACHE_NAME = "vocabulary-cache-v2";
const STATIC_ASSETS = ["/", "/offline"];

async function precacheStaticAssets() {
  const assets = new Set(STATIC_ASSETS);
  const pagesToScan = ["/offline", "/"];

  await Promise.all(
    pagesToScan.map(async (page) => {
      try {
        const res = await fetch(page, { cache: "no-store" });
        if (!res.ok) return;
        const html = await res.text();
        const urls = html.match(
          /(?:\/_next\/static\/[^\s"'`>]+\.(?:css|js))+/g
        ) || [];
        urls.forEach((url) => assets.add(url.split("?")[0].replace(/^\/\//, "/")));
      } catch {
        // ignore failures; assets may be cached at runtime instead
      }
    })
  );

  return caches.open(CACHE_NAME).then((cache) =>
    Promise.all(
      [...assets].map((url) =>
        cache.add(url).catch(() => {})
      )
    )
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(precacheStaticAssets());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return caches.match("/offline");
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 408 });
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/assets/")
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }
});

self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/assets/icon.jpeg",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
