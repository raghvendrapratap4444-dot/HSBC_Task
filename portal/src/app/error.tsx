"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="panel fade-in p-8" role="alert">
      <h1 className="text-2xl font-semibold text-[var(--ink)]">Something went wrong</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  );
}
