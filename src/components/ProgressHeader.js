"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const steps = [
  { path: "/form/step1", label: "Step 1", title: "User Form" },
  { path: "/form/step2", label: "Step 2", title: "Competencies (DNA25) Selection" },
  { path: "/form/step3", label: "Step 3", title: "Driving Forces" },
  { path: "/form/step4", label: "Step 4", title: "Behavioral Traits + PDF" },
];

export default function ProgressHeader() {
  const pathname = usePathname();
  const activeStep = steps.findIndex((step) => pathname.startsWith(step.path));

  return (
    <header className="mb-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-900 sm:text-xl">
          PDP Builder
        </h1>
        <span className="text-sm text-zinc-500">
          {activeStep >= 0 ? `Step ${activeStep + 1} of ${steps.length}` : null}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isComplete = index < activeStep;
          return (
            <Link
              key={step.path}
              href={step.path}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                isActive
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : isComplete
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <p className="font-medium">{step.label}</p>
              <p className="truncate text-xs">{step.title}</p>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
