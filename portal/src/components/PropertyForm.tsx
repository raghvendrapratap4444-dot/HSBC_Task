"use client";

import { FIELD_META, type PropertyFormValues } from "@/lib/validation";
import type { usePropertyForm } from "@/hooks/usePropertyForm";

type FormApi = ReturnType<typeof usePropertyForm>;

type Props = {
  form: FormApi;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
};

export function PropertyForm({ form, onSubmit, submitLabel, loading }: Props) {
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELD_META.map((field) => {
          const error = form.fieldError(field.name);
          const id = `field-${field.name}`;
          return (
            <label key={field.name} className="block" htmlFor={id}>
              <span className="mb-1 block text-sm font-medium text-[var(--ink)]">{field.label}</span>
              <input
                id={id}
                name={field.name}
                type={field.type ?? "number"}
                step={field.step}
                value={String(form.values[field.name] ?? "")}
                onChange={(e) =>
                  form.setField(
                    field.name,
                    (field.type === "text"
                      ? e.target.value
                      : e.target.value) as PropertyFormValues[typeof field.name],
                  )
                }
                onBlur={() => form.touch(field.name)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-[var(--brand)]/30 ${
                  error ? "border-red-400" : "border-[var(--line)]"
                }`}
              />
              {error ? (
                <span id={`${id}-error`} className="mt-1 block text-xs text-red-600" role="alert">
                  {error}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Working…" : submitLabel}
      </button>
    </form>
  );
}
