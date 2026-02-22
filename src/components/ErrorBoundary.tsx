"use client";

import React from "react";
import Link from "next/link";

interface State {
  hasError: boolean;
  error: Error | null;
}

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Catches React render errors in the tree and shows a fallback UI instead of crashing.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
          <div className="max-w-md rounded-xl border border-surface-border bg-surface-elevated p-8 text-center">
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-2 text-sm text-neutral-400">
              We encountered an unexpected error. You can try again or go back home.
            </p>
            {this.state.error && (
              <p className="mt-2 text-xs text-neutral-500" title={this.state.error.message}>
                {this.state.error.message.slice(0, 80)}
                {this.state.error.message.length > 80 ? "…" : ""}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="rounded-lg border border-accent bg-accent/20 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/30"
              >
                Try again
              </button>
              <Link
                href="/"
                className="rounded-lg border border-surface-border bg-surface px-4 py-2 text-center text-sm font-medium text-white hover:border-neutral-500"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
