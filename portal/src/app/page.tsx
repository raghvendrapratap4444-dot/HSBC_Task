import Link from "next/link";

export default function HomePage() {
  return (
    <div className="fade-in space-y-10">
      <section className="panel overflow-hidden">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="p-8 sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
              Homestead Portal
            </p>
            <h1 className="mt-3 max-w-xl text-4xl font-semibold leading-tight text-[var(--ink)] sm:text-5xl">
              Two apps. One place to price and understand housing markets.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[var(--muted)]">
              Estimate individual property values with a Python-backed workflow, then explore
              market segments and what-if scenarios through a Java analysis service — both powered
              by the same ML prediction API.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/estimator"
                className="rounded-lg bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
              >
                Open Value Estimator
              </Link>
              <Link
                href="/market"
                className="rounded-lg border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[var(--wash)]"
              >
                Open Market Analysis
              </Link>
            </div>
          </div>
          <div className="relative min-h-64 bg-[linear-gradient(145deg,#0f6b4c,#1f8a63_45%,#c45c26)] p-8 text-white">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="relative space-y-6">
              <div>
                <p className="text-sm uppercase tracking-wide text-white/80">Stack</p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>FastAPI + scikit-learn ML service</li>
                  <li>Python FastAPI estimator BFF</li>
                  <li>Java 21 / Spring Boot 3.4 market API</li>
                  <li>Next.js App Router portal</li>
                </ul>
              </div>
              <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-white/70">Live demo tip</p>
                <p className="mt-1 text-sm">
                  ML Swagger docs: <span className="font-semibold">http://localhost:8000/docs</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="panel p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="text-2xl font-semibold">Property Value Estimator</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Form validation, prediction charts, estimate history, and side-by-side comparison.
          </p>
          <Link href="/estimator" className="mt-4 inline-block text-sm font-semibold text-[var(--brand)]">
            Launch app →
          </Link>
        </article>
        <article className="panel p-6 transition hover:-translate-y-0.5 hover:shadow-md">
          <h2 className="text-2xl font-semibold">Property Market Analysis</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Segment filters, dashboard visuals, what-if modeling, CSV/PDF export, and sortable tables.
          </p>
          <Link href="/market" className="mt-4 inline-block text-sm font-semibold text-[var(--brand)]">
            Launch app →
          </Link>
        </article>
      </section>
    </div>
  );
}
