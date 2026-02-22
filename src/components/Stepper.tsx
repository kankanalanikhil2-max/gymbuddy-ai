"use client";

import type { ReactNode } from "react";

interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  children: ReactNode;
}

export function Stepper({ steps, currentStep, children }: StepperProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <nav aria-label="Progress" className="mb-10">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isComplete = index < currentStep;
            const isCurrent = index === currentStep;
            return (
              <li
                key={step.id}
                className={`flex flex-1 items-center ${index < steps.length - 1 ? "pr-2 sm:pr-4" : ""}`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <div className="flex flex-col items-center flex-1">
                  <span
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium
                      ${isComplete ? "border-accent bg-accent text-black" : ""}
                      ${isCurrent ? "border-accent bg-accent-muted text-accent" : ""}
                      ${!isComplete && !isCurrent ? "border-surface-border text-neutral-500" : ""}
                    `}
                    aria-hidden
                  >
                    {isComplete ? "✓" : index + 1}
                  </span>
                  <span
                    className={`mt-1 text-xs font-medium ${isCurrent ? "text-white" : "text-neutral-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 ${index < currentStep ? "bg-accent" : "bg-surface-border"}`}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="min-h-[320px]">{children}</div>
    </div>
  );
}
