"use client";

import { useRouter } from "next/navigation";
import StepLayout from "@/components/StepLayout";
import { useFormState } from "@/components/form-context";

export default function Step1Page() {
  const router = useRouter();
  const { formState, setUser } = useFormState();
  const { user } = formState;
  const todayIso = new Date().toISOString().slice(0, 10);
  const reportDate = user.reportDate || todayIso;

  const canContinue =
    user.name.trim() && user.company.trim() && user.position.trim() && reportDate;

  return (
    <StepLayout
      title="Step 1: Respondent Information"
      subtitle={`Enter basic respondent details. Sections: ${formState.sectionTitles.dna25}, ${formState.sectionTitles.behavioralTraits}, ${formState.sectionTitles.drivingForces}.`}
    >
      <form className="grid gap-4 sm:max-w-xl">
        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700">Respondent Name</span>
          <input
            type="text"
            value={user.name}
            onChange={(event) => setUser({ name: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            placeholder="Enter full name"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700">Company</span>
          <input
            type="text"
            value={user.company}
            onChange={(event) => setUser({ company: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            placeholder="Enter company name"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700">Position</span>
          <input
            type="text"
            value={user.position}
            onChange={(event) => setUser({ position: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
            placeholder="Enter position"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium text-zinc-700">Report Date</span>
          <input
            type="date"
            value={reportDate}
            onChange={(event) => setUser({ reportDate: event.target.value })}
            className="rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-indigo-200 focus:ring"
          />
        </label>
      </form>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => router.push("/form/step2")}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            canContinue
              ? "bg-indigo-600 hover:bg-indigo-500"
              : "cursor-not-allowed bg-zinc-300"
          }`}
        >
          Next
        </button>
      </div>
    </StepLayout>
  );
}
