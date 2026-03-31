import ProgressHeader from "@/components/ProgressHeader";
import Link from "next/link";

export default function StepLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <ProgressHeader />
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{title}</h2>
              {subtitle ? <p className="mt-1 text-zinc-600">{subtitle}</p> : null}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Home
              </Link>
              <Link
                href="/form/elements"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Elements
              </Link>
            </div>
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
