"use client";

export function isOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function isOffline(): boolean {
  return !isOnline();
}