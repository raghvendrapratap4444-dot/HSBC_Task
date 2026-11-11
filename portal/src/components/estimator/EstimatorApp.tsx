"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PropertyForm } from "@/components/PropertyForm";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import { clearHistory, compareProperties, createEstimate, formatCurrency } from "@/lib/api";
import type { CompareResponse, EstimateRecord, PropertyFeatures } from "@/lib/types";
import { emptyPropertyForm } from "@/lib/validation";

type Props = {
  initialHistory: EstimateRecord[];
};

export function EstimatorApp({ initialHistory }: Props) {
  const form = usePropertyForm();
  const [history, setHistory] = useState<EstimateRecord[]>(initialHistory);
  const [latest, setLatest] = useState<EstimateRecord | null>(initialHistory[0] ?? null);
  const [comparePool, setComparePool] = useState<PropertyFeatures[]>([]);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartData = useMemo(
    () =>
      history.slice(0, 8).map((item) => ({
        name: item.label ?? item.id.slice(0, 6),
        price: item.predicted_price,
      })),
    [history],
  );

  async function handleEstimate() {
    const parsed = form.validate();
    if (!parsed.success) return;

    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...parsed.data,
        label: parsed.data.label || undefined,
      };
      const result = await createEstimate(payload);
      setLatest(result.estimate);
      setHistory(result.history);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Estimate failed");
    } finally {
      setLoading(false);
    }
  }

  function addToCompare() {
    const parsed = form.validate();
    if (!parsed.success) return;
    if (comparePool.length >= 6) {
      setError("Comparison supports up to 6 properties.");
      return;
    }
    setComparePool((prev) => [
      ...prev,
      { ...parsed.data, label: parsed.data.label || `Property ${prev.length + 1}` },
    ]);
    setError(null);
  }

  async function runCompare() {
    if (comparePool.length < 2) {
      setError("Add at least two properties to compare.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await compareProperties(comparePool);
      setCompareResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleClearHistory() {
    setLoading(true);
    try {
      await clearHistory();
      setHistory([]);
      setLatest(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to clear history");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="panel p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Property details</h2>
          <button
            type="button"
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={() => form.reset(emptyPropertyForm)}
          >
            Reset form
          </button>
        </div>
        <PropertyForm
          form={form}
          onSubmit={handleEstimate}
          submitLabel="Estimate value"
          loading={loading}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={addToCompare}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--wash)]"
          >
            Add to comparison
          </button>
          <button
            type="button"
            onClick={runCompare}
            className="rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium hover:bg-[var(--wash)]"
          >
            Compare ({comparePool.length})
          </button>
        </div>
        {error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section className="space-y-6">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Latest prediction</h2>
          {latest ? (
            <div className="mt-4 space-y-4">
              <p className="text-3xl font-semibold text-[var(--brand)]">
                {formatCurrency(latest.predicted_price)}
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[var(--muted)]">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Field</th>
                      <th className="py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(latest.features)
                      .filter(([key]) => key !== "label")
                      .map(([key, value]) => (
                        <tr key={key} className="border-t border-[var(--line)]">
                          <td className="py-2 pr-4 capitalize">{key.replaceAll("_", " ")}</td>
                          <td className="py-2">{String(value)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--muted)]">No estimate yet. Submit the form to begin.</p>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Estimate chart</h2>
          <div className="mt-4 h-64">
            {chartData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="price" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-[var(--muted)]">Charts appear after estimates are created.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel p-6 lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Estimate history</h2>
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-xs font-medium text-[var(--muted)] hover:text-red-700"
          >
            Clear history
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                <th className="py-2 pr-3 font-medium">Label</th>
                <th className="py-2 pr-3 font-medium">Sq Ft</th>
                <th className="py-2 pr-3 font-medium">Beds</th>
                <th className="py-2 pr-3 font-medium">Year</th>
                <th className="py-2 pr-3 font-medium">School</th>
                <th className="py-2 font-medium">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="border-t border-[var(--line)]">
                  <td className="py-2 pr-3">{item.label}</td>
                  <td className="py-2 pr-3">{item.features.square_footage}</td>
                  <td className="py-2 pr-3">{item.features.bedrooms}</td>
                  <td className="py-2 pr-3">{item.features.year_built}</td>
                  <td className="py-2 pr-3">{item.features.school_rating}</td>
                  <td className="py-2 font-medium">{formatCurrency(item.predicted_price)}</td>
                </tr>
              ))}
              {!history.length ? (
                <tr>
                  <td colSpan={6} className="py-6 text-[var(--muted)]">
                    No history yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel p-6 lg:col-span-2">
        <h2 className="text-xl font-semibold">Comparison view</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pool: {comparePool.map((p) => p.label).join(", ") || "empty"}
        </p>
        {compareResult ? (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-[var(--wash)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Highest</p>
              <p className="mt-1 font-semibold">{compareResult.highest.label}</p>
              <p className="text-[var(--brand)]">{formatCurrency(compareResult.highest.predicted_price)}</p>
            </div>
            <div className="rounded-xl bg-[var(--wash)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Lowest</p>
              <p className="mt-1 font-semibold">{compareResult.lowest.label}</p>
              <p className="text-[var(--accent)]">{formatCurrency(compareResult.lowest.predicted_price)}</p>
            </div>
            <div className="rounded-xl bg-[var(--wash)] p-4">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Average</p>
              <p className="mt-1 font-semibold">Across {compareResult.items.length} homes</p>
              <p>{formatCurrency(compareResult.average_price)}</p>
            </div>
            <div className="md:col-span-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Property</th>
                    <th className="py-2 pr-3 font-medium">Sq Ft</th>
                    <th className="py-2 pr-3 font-medium">Beds / Baths</th>
                    <th className="py-2 font-medium">Predicted</th>
                  </tr>
                </thead>
                <tbody>
                  {compareResult.items.map((item) => (
                    <tr key={item.label} className="border-t border-[var(--line)]">
                      <td className="py-2 pr-3">{item.label}</td>
                      <td className="py-2 pr-3">{item.features.square_footage}</td>
                      <td className="py-2 pr-3">
                        {item.features.bedrooms} / {item.features.bathrooms}
                      </td>
                      <td className="py-2 font-medium">{formatCurrency(item.predicted_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            Add properties from the form, then run comparison for a side-by-side analysis.
          </p>
        )}
        {comparePool.length ? (
          <button
            type="button"
            className="mt-4 text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)]"
            onClick={() => {
              setComparePool([]);
              setCompareResult(null);
            }}
          >
            Clear comparison pool
          </button>
        ) : null}
      </section>
    </div>
  );
}
