import { MarketApp } from "@/components/market/MarketApp";
import { fetchMarketStats, fetchProperties } from "@/lib/api";
import type { HousingProperty, MarketStats } from "@/lib/types";

export default async function MarketPage() {
  let initialStats: MarketStats | null = null;
  let initialProperties: HousingProperty[] = [];
  let bootError: string | null = null;

  try {
    [initialStats, initialProperties] = await Promise.all([
      fetchMarketStats(),
      fetchProperties({ sortBy: "price", sortDir: "asc" }),
    ]);
  } catch (error) {
    bootError = error instanceof Error ? error.message : "Unable to load market data.";
  }

  return (
    <div className="fade-in space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
          App 2 · Java backend
        </p>
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">Property Market Analysis</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
          Explore market segments, run what-if scenarios against the ML model, and export CSV or PDF
          reports.
        </p>
      </header>
      {bootError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Market API unavailable at startup: {bootError}. Retry filters once the Java service is up.
        </div>
      ) : null}
      <MarketApp initialStats={initialStats} initialProperties={initialProperties} />
    </div>
  );
}
