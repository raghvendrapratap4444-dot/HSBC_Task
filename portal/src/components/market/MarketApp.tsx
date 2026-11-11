"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PropertyForm } from "@/components/PropertyForm";
import { usePropertyForm } from "@/hooks/usePropertyForm";
import {
  exportUrl,
  fetchProperties,
  fetchSegmentStats,
  formatCurrency,
  runWhatIf,
} from "@/lib/api";
import type { HousingProperty, MarketStats, PropertyFilterParams, WhatIfResponse } from "@/lib/types";

const PIE_COLORS = ["#0f6b4c", "#2f8f6b", "#c45c26", "#3d6b9a"];

type Props = {
  initialStats: MarketStats | null;
  initialProperties: HousingProperty[];
};

const defaultFilters: PropertyFilterParams = {
  sortBy: "price",
  sortDir: "asc",
};

export function MarketApp({ initialStats, initialProperties }: Props) {
  const [filters, setFilters] = useState<PropertyFilterParams>(defaultFilters);
  const [stats, setStats] = useState<MarketStats | null>(initialStats);
  const [properties, setProperties] = useState<HousingProperty[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [whatIf, setWhatIf] = useState<WhatIfResponse | null>(null);
  const form = usePropertyForm();

  const bedroomChart = useMemo(
    () =>
      Object.entries(stats?.avgPriceByBedrooms ?? {}).map(([beds, price]) => ({
        beds: `${beds} bed`,
        price,
      })),
    [stats],
  );

  const decadeChart = useMemo(
    () =>
      Object.entries(stats?.avgPriceByYearDecade ?? {}).map(([decade, price]) => ({
        decade,
        price,
      })),
    [stats],
  );

  const distribution = useMemo(
    () =>
      (stats?.priceDistribution ?? []).map((bucket) => ({
        name: bucket.range,
        value: bucket.count,
      })),
    [stats],
  );

  async function applyFilters(next: PropertyFilterParams = filters) {
    setLoading(true);
    setError(null);
    try {
      const [nextStats, nextProperties] = await Promise.all([
        fetchSegmentStats(next),
        fetchProperties(next),
      ]);
      setStats(nextStats);
      setProperties(nextProperties);
      setFilters(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to apply filters");
    } finally {
      setLoading(false);
    }
  }

  function updateFilter<K extends keyof PropertyFilterParams>(key: K, value: PropertyFilterParams[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleSort(column: string) {
    const sortDir =
      filters.sortBy === column && filters.sortDir === "asc" ? "desc" : "asc";
    void applyFilters({ ...filters, sortBy: column, sortDir });
  }

  async function handleWhatIf() {
    const parsed = form.validate();
    if (!parsed.success) return;
    setLoading(true);
    setError(null);
    try {
      const result = await runWhatIf({
        squareFootage: parsed.data.square_footage,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        yearBuilt: parsed.data.year_built,
        lotSize: parsed.data.lot_size,
        distanceToCityCenter: parsed.data.distance_to_city_center,
        schoolRating: parsed.data.school_rating,
        squareFootageDelta: 200,
        schoolRatingDelta: 0.5,
        distanceDelta: 1,
      });
      setWhatIf(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "What-if analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h2 className="text-xl font-semibold">Segment filters</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["minPrice", "Min price", filters.minPrice],
            ["maxPrice", "Max price", filters.maxPrice],
            ["minBedrooms", "Min bedrooms", filters.minBedrooms],
            ["maxBedrooms", "Max bedrooms", filters.maxBedrooms],
            ["minSquareFootage", "Min sq ft", filters.minSquareFootage],
            ["maxSquareFootage", "Max sq ft", filters.maxSquareFootage],
            ["minSchoolRating", "Min school rating", filters.minSchoolRating],
            ["minYearBuilt", "Min year built", filters.minYearBuilt],
          ].map(([key, label, value]) => (
            <label key={String(key)} className="block text-sm">
              <span className="mb-1 block font-medium text-[var(--ink)]">{label}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2"
                value={value ?? ""}
                onChange={(e) =>
                  updateFilter(
                    key as keyof PropertyFilterParams,
                    e.target.value === "" ? undefined : Number(e.target.value),
                  )
                }
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyFilters(filters)}
            disabled={loading}
            className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Updating…" : "Apply filters"}
          </button>
          <button
            type="button"
            onClick={() => applyFilters(defaultFilters)}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium"
          >
            Reset
          </button>
          <a
            href={exportUrl("csv", filters)}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium"
          >
            Export CSV
          </a>
          <a
            href={exportUrl("pdf", filters)}
            className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium"
          >
            Export PDF
          </a>
        </div>
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Properties", stats?.totalProperties ?? "—"],
          ["Average price", stats ? formatCurrency(stats.avgPrice) : "—"],
          ["Median price", stats ? formatCurrency(stats.medianPrice) : "—"],
          ["Avg school rating", stats?.avgSchoolRating ?? "—"],
        ].map(([label, value]) => (
          <div key={String(label)} className="panel p-5">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Price distribution</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" outerRadius={90} label>
                  {distribution.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Avg price by bedrooms</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bedroomChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
                <XAxis dataKey="beds" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="price" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="panel p-6 lg:col-span-1">
          <h3 className="text-lg font-semibold">Avg price by decade</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={decadeChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d5e0d8" />
                <XAxis dataKey="decade" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="price" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-xl font-semibold">Properties table</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[var(--muted)]">
              <tr>
                {[
                  ["id", "ID"],
                  ["squareFootage", "Sq Ft"],
                  ["bedrooms", "Beds"],
                  ["yearBuilt", "Year"],
                  ["schoolRating", "School"],
                  ["price", "Price"],
                ].map(([key, label]) => (
                  <th key={key} className="py-2 pr-3 font-medium">
                    <button type="button" onClick={() => toggleSort(key)} className="hover:text-[var(--ink)]">
                      {label}
                      {filters.sortBy === key ? (filters.sortDir === "asc" ? " ↑" : " ↓") : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-[var(--line)]">
                  <td className="py-2 pr-3">{p.id}</td>
                  <td className="py-2 pr-3">{p.squareFootage}</td>
                  <td className="py-2 pr-3">{p.bedrooms}</td>
                  <td className="py-2 pr-3">{p.yearBuilt}</td>
                  <td className="py-2 pr-3">{p.schoolRating}</td>
                  <td className="py-2 font-medium">{formatCurrency(p.price)}</td>
                </tr>
              ))}
              {!properties.length ? (
                <tr>
                  <td colSpan={6} className="py-6 text-[var(--muted)]">
                    No properties match the current filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">What-if analysis</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Adjust a baseline property and compare ML predictions for larger size, better schools,
            and closer city distance.
          </p>
          <div className="mt-4">
            <PropertyForm
              form={form}
              onSubmit={handleWhatIf}
              submitLabel="Run what-if"
              loading={loading}
            />
          </div>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Scenario results</h2>
          {whatIf ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[var(--muted)]">
                Baseline prediction:{" "}
                <span className="font-semibold text-[var(--ink)]">
                  {formatCurrency(whatIf.baselinePrice)}
                </span>
              </p>
              {whatIf.scenarios.map((scenario) => (
                <div
                  key={scenario.name}
                  className="flex items-center justify-between rounded-xl bg-[var(--wash)] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{scenario.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      Δ {formatCurrency(scenario.deltaFromBaseline)}
                    </p>
                  </div>
                  <p className="font-semibold text-[var(--brand)]">
                    {formatCurrency(scenario.predictedPrice)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Run a what-if scenario to see predicted price shifts.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
