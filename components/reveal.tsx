"use client";

import { useEffect, useRef } from "react";

// Fades a section up the first time it scrolls into view (same pattern as StdCard).
export function Reveal({ id, className = "", children }: { id?: string; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { node.classList.add("in"); return; }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <section ref={ref} id={id} className={`flo-reveal ${className}`}>{children}</section>;
}
