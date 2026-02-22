"use client";

import { useEffect, useRef, useCallback } from "react";

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true"
  );
}

export function useFocusTrap(
  isActive: boolean,
  onEscape: () => void
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveRef = useRef<Element | null>(null);

  const focusFirst = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const focusables = getFocusables(el);
    const first = focusables[0];
    if (first) first.focus();
  }, []);

  useEffect(() => {
    if (!isActive) return;
    previousActiveRef.current = document.activeElement;
    focusFirst();
    return () => {
      const prev = previousActiveRef.current;
      if (prev && prev instanceof HTMLElement && typeof prev.focus === "function") {
        prev.focus();
      }
    };
  }, [isActive, focusFirst]);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
        return;
      }
      if (e.key !== "Tab" || !containerRef.current) return;
      const focusables = getFocusables(containerRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape]);

  return containerRef;
}
