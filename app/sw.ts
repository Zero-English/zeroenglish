import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { ExpirationPlugin, NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope {
    __SW_MANIFEST: (PrecacheEntry | string)[];
  }
}

declare const self: WorkerGlobalScope & typeof globalThis & SerwistGlobalConfig;

const VOCAB_QUIZ_REGEX = /^\/(?:vocabulary(?:\/.*)?|quiz)$/;

const runtimeCaching: RuntimeCaching[] = [
  {
    matcher: ({ request, url, sameOrigin }) =>
      sameOrigin && request.method === "GET" && VOCAB_QUIZ_REGEX.test(url.pathname),
    handler: new NetworkFirst({
      cacheName: "ze-vocab-quiz-pages",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 128,
          maxAgeSeconds: 60 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
      networkTimeoutSeconds: 4,
    }),
  },
  {
    matcher: ({ url, sameOrigin }) =>
      sameOrigin &&
      /\.(?:js|css|png|jpg|jpeg|gif|svg|webp|avif|woff2?|ttf|otf|eot|ico|mp3|wav|ogg|mp4|webm)$/i.test(
        url.pathname,
      ),
    handler: new StaleWhileRevalidate({
      cacheName: "ze-static-assets",
      plugins: [
        new ExpirationPlugin({
          maxEntries: 256,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          maxAgeFrom: "last-used",
        }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => {
          const url = new URL(request.url);
          return request.destination === "document" && VOCAB_QUIZ_REGEX.test(url.pathname);
        },
      },
    ],
  },
});

serwist.addEventListeners();