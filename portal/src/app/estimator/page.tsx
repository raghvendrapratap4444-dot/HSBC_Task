import { EstimatorApp } from "@/components/estimator/EstimatorApp";
import { fetchHistory } from "@/lib/api";
import type { EstimateRecord } from "@/lib/types";

export default async function EstimatorPage() {
  let initialHistory: EstimateRecord[] = [];
  let bootError: string | null = null;

  try {
    initialHistory = await fetchHistory();
  } catch (error) {
    bootError = error instanceof Error ? error.message : "Unable to load estimate history.";
  }

  return (
    <div className="fade-in space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--brand)]">
          App 1 · Python backend
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Property Value Estimator</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Enter property features, validate client-side, and get ML-backed price estimates with
          history and comparison tools.
        </p>
      </header>
      {bootError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          History service unavailable at startup: {bootError}. You can still create new estimates.
        </div>
      ) : null}
      <EstimatorApp initialHistory={initialHistory} />
    </div>
  );
}
