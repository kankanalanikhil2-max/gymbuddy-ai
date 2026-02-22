"use client";

import type { ReactNode } from "react";
import { useRef, useCallback } from "react";

export interface OptionGroupOption<T> {
  value: T;
  label: ReactNode;
}

interface OptionGroupProps<T> {
  options: OptionGroupOption<T>[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  role?: "radiogroup";
  /** Horizontal (Arrow Left/Right) or vertical (Arrow Up/Down). Default horizontal. */
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** For multi-select (e.g. limitations), pass isSelected per option. */
  getIsSelected?: (value: T) => boolean;
}

/**
 * Option group with roving tabindex and arrow-key navigation.
 * Only the selected option (or first) is in tab order; Arrow keys move within the group.
 */
export function OptionGroup<T extends string | number>({
  options,
  value,
  onChange,
  "aria-label": ariaLabel,
  role = "radiogroup",
  orientation = "horizontal",
  className = "",
  getIsSelected,
}: OptionGroupProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelected = getIsSelected ?? ((v: T) => v === value);

  const getFocusedIndex = useCallback(() => {
    const el = document.activeElement;
    if (!containerRef.current || !el) return -1;
    const buttons = containerRef.current.querySelectorAll("button");
    return Array.from(buttons).indexOf(el as HTMLButtonElement);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isHoriz = orientation === "horizontal";
      const arrowNext = isHoriz ? "ArrowRight" : "ArrowDown";
      const arrowPrev = isHoriz ? "ArrowLeft" : "ArrowUp";
      if (e.key !== arrowNext && e.key !== arrowPrev && e.key !== "Home" && e.key !== "End") return;
      e.preventDefault();
      let nextIndex = getFocusedIndex();
      if (nextIndex < 0) nextIndex = options.findIndex((o) => isSelected(o.value));
      if (nextIndex < 0) nextIndex = 0;
      if (e.key === arrowNext || e.key === "End") {
        nextIndex = e.key === "End" ? options.length - 1 : Math.min(options.length - 1, nextIndex + 1);
      } else {
        nextIndex = e.key === "Home" ? 0 : Math.max(0, nextIndex - 1);
      }
      onChange(options[nextIndex].value);
      const buttons = containerRef.current?.querySelectorAll("button");
      (buttons?.[nextIndex] as HTMLButtonElement)?.focus();
    },
    [orientation, options, onChange, isSelected, getFocusedIndex]
  );

  return (
    <div
      ref={containerRef}
      role={role}
      aria-label={ariaLabel}
      className={className}
      onKeyDown={handleKeyDown}
    >
      {options.map((opt) => {
        const selected = isSelected(opt.value);
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-4 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] ${selected ? "border-accent bg-accent-muted text-accent" : "border-surface-border text-neutral-400 hover:border-neutral-500"}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
