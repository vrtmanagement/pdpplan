"use client";

import SelectionStepPage from "@/components/SelectionStepPage";
import { useFormState } from "@/components/form-context";
import { generateReportPdf } from "@/lib/pdf";
import { useRouter } from "next/navigation";

export default function Step4Page() {
  const router = useRouter();
  const { formState, resetForm } = useFormState();

  const handleDownloadReport = async () => {
    await generateReportPdf(formState);
    resetForm();
    router.push("/");
  };

  return (
    <SelectionStepPage
      stateKey="behavioralTraits"
      title={`Step 4: ${formState.sectionTitles.behavioralTraits}`}
      subtitle="Select up to 4 items, then generate your report."
      availableTitle={`Available ${formState.sectionTitles.behavioralTraits}`}
      selectedTitle={`Selected ${formState.sectionTitles.behavioralTraits}`}
      items={formState.elementItems.behavioralTraits}
      maxSelections={4}
      backHref="/form/step3"
      nextHref="/form/step4"
      nextButtonLabel="Stay on Final Step"
      bottomSlot={
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h4 className="text-sm font-semibold text-indigo-900">
            Ready to generate report
          </h4>
          <p className="mt-1 text-sm text-indigo-800">
            PDF includes user details plus all selected items and descriptions.
          </p>
          <button
            type="button"
            onClick={handleDownloadReport}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Download Report
          </button>
        </div>
      }
    />
  );
}
