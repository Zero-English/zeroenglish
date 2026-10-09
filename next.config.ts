import { spawnSync } from "node:child_process";
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const revision =
  spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" }).stdout?.trim() || null;

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: false,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/offline", revision },
  ],
});

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    globalNotFound: true,
  },
};

export default withSerwist(nextConfig);