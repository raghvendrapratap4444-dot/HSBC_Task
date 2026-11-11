import type {
  CompareResponse,
  EstimateRecord,
  HousingProperty,
  MarketStats,
  PropertyFeatures,
  PropertyFilterParams,
  WhatIfResponse,
} from "./types";

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL ?? "http://localhost:8001";
const JAVA_API = process.env.NEXT_PUBLIC_JAVA_API_URL ?? "http://localhost:8080";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function toQuery(params: PropertyFilterParams): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function createEstimate(payload: PropertyFeatures) {
  return request<{ estimate: EstimateRecord; history: EstimateRecord[] }>(
    `${PYTHON_API}/estimate`,
    { method: "POST", body: JSON.stringify(payload) },
  );
}

export async function fetchHistory() {
  return request<EstimateRecord[]>(`${PYTHON_API}/history`);
}

export async function clearHistory() {
  return request<{ cleared: boolean }>(`${PYTHON_API}/history`, { method: "DELETE" });
}

export async function compareProperties(properties: PropertyFeatures[]) {
  return request<CompareResponse>(`${PYTHON_API}/compare`, {
    method: "POST",
    body: JSON.stringify({ properties }),
  });
}

export async function fetchMarketStats() {
  return request<MarketStats>(`${JAVA_API}/api/stats`);
}

export async function fetchProperties(params: PropertyFilterParams = {}) {
  return request<HousingProperty[]>(`${JAVA_API}/api/properties${toQuery(params)}`);
}

export async function fetchSegmentStats(params: PropertyFilterParams = {}) {
  return request<MarketStats>(`${JAVA_API}/api/segment-stats${toQuery(params)}`);
}

export async function runWhatIf(payload: Record<string, number>) {
  return request<WhatIfResponse>(`${JAVA_API}/api/what-if`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function exportUrl(format: "csv" | "pdf", params: PropertyFilterParams = {}) {
  return `${JAVA_API}/api/export/${format}${toQuery(params)}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
