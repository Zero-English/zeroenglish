"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";

interface LenisContextType {
  lenis: Lenis | null;
  scrollProgress: number;
}

const LenisContext = createContext<LenisContextType>({
  lenis: null,
  scrollProgress: 0,
});

export function useLenisInstance() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Only initialize on client
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    setLenisInstance(lenis);

    lenis.on("scroll", (e: { progress: number }) => {
      setScrollProgress(e.progress);
    });

    function raf(time: number) {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // Apply lenis class to html
    document.documentElement.classList.add("lenis", "lenis-smooth");

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove("lenis", "lenis-smooth");
      lenis.destroy();
    };
  }, []);

  return (
    <LenisContext.Provider value={{ lenis: lenisInstance, scrollProgress }}>
      {children}
    </LenisContext.Provider>
  );
}
