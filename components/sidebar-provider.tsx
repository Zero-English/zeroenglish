"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  isDesktopOpen: boolean;
  toggle: () => void;
  close: () => void;
  toggleDesktop: () => void;
}

const SIDEBAR_STORAGE_KEY = "zeroenglish:desktop-sidebar-open";

const storageListeners = new Set<() => void>();

function subscribeToStorageListeners(callback: () => void) {
  storageListeners.add(callback);
  return () => {
    storageListeners.delete(callback);
  };
}

function notifyStorageListeners() {
  storageListeners.forEach((listener) => listener());
}

function getStoredDesktopOpen(): boolean | null {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return raw === null ? null : raw === "true";
  } catch {
    return null;
  }
}

const getServerSnapshot = () => null;

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const storedDesktopOpen = useSyncExternalStore(
    subscribeToStorageListeners,
    getStoredDesktopOpen,
    getServerSnapshot
  );
  const isDesktopOpen = storedDesktopOpen === null ? true : storedDesktopOpen;

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggleDesktop = useCallback(() => {
    const raw = getStoredDesktopOpen();
    const next = raw === null ? false : !raw;
    try {
      window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
    } catch {
      // ignore storage write failures
    }
    notifyStorageListeners();
  }, []);

  return (
    <SidebarContext.Provider
      value={{ isOpen, isDesktopOpen, toggle, close, toggleDesktop }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}