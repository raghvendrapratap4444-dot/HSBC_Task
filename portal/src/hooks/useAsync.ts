"use client";

import { useCallback, useState } from "react";

export function useAsync<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
) {
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(
    async (...args: TArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unexpected error";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fn],
  );

  return { data, error, loading, run, setData, setError };
}
