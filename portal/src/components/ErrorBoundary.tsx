"use client";

import { Component, type ReactNode } from "react";

type Props = { children: ReactNode; fallbackTitle?: string };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Something went wrong." };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800" role="alert">
          <h2 className="text-lg font-semibold">
            {this.props.fallbackTitle ?? "Unexpected error"}
          </h2>
          <p className="mt-2 text-sm">{this.state.message}</p>
          <button
            type="button"
            className="mt-4 rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white"
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
