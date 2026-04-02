import Link from "next/link";
import { cookies } from "next/headers";
import UserMenu from "@/components/UserMenu";

export default async function Home() {
  const cookieStore = await cookies();
  const username = cookieStore.get("pdp_user")?.value || "Kumar";

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-white to-indigo-100/50 px-4 py-10">
      <main className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
              PDP Platform
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-900">
              Assessment Dashboard
            </h1>
          </div>
          <UserMenu username={username} />
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/90 p-8 shadow-xl shadow-zinc-200/50 backdrop-blur-md sm:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-tight text-zinc-900">
              PDP Assessment Builder
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
              Build a complete respondent report using Competencies (DNA25), Driving Forces, and
              Behavioral Traits with secured database storage and premium workbook
              editing.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/form/step1"
                className="inline-flex rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                Start Assessment
              </Link>
              <Link
                href="/form/elements"
                className="inline-flex rounded-xl border border-zinc-300 bg-white px-6 py-3 text-sm font-medium text-zinc-800 transition hover:bg-zinc-100"
              >
                Open Elements Library
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
