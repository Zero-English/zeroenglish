"use client";

import NextTopLoader from "nextjs-toploader";

export function TopLoader() {
  return (
    <NextTopLoader
      color="#f97316"
      height={3}
      showSpinner={false}
      shadow="0 0 10px rgba(249,115,22,0.4),0 0 5px rgba(249,115,22,0.4)"
    />
  );
}