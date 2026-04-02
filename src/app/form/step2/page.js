"use client";

import SelectionStepPage from "@/components/SelectionStepPage";
import { useFormState } from "@/components/form-context";

export default function Step2Page() {
  const { formState } = useFormState();
  const dna25Title =
    formState.sectionTitles.dna25 === "DNA25"
      ? "Competencies (DNA25)"
      : formState.sectionTitles.dna25;

  return (
    <SelectionStepPage
      stateKey="dna25"
      title={`Step 2: ${dna25Title} Selection`}
      subtitle="Select up to 7 items. Click an item to move it to the selected panel."
      availableTitle={`Available ${dna25Title}`}
      selectedTitle={`Selected ${dna25Title}`}
      items={formState.elementItems.dna25}
      maxSelections={7}
      backHref="/form/step1"
      nextHref="/form/step3"
    />
  );
}
