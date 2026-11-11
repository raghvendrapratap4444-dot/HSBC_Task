export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-[var(--line)] bg-[var(--wash)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--brand)] border-t-transparent" />
        {label}
      </div>
    </div>
  );
}
